import { useState, useEffect, useCallback, useMemo } from "react";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, Wallet, BN } from "@coral-xyz/anchor";
import { getAssociatedTokenAddress, getAccount } from "@solana/spl-token";

// Import contract types and clients
import { MysteryBoxSolana } from "../lib/solana/mystery_box_solana";
import {
  MysteryBoxClient,
  BoxPurchasedEvent,
  BoxPurchasedAutomaticEvent,
  AutoConversionResult,
} from "../lib/solana/mystery-box-client";
import { JupiterSwapClient } from "../lib/solana/jupiter-utils";
import {
  MYSTERY_BOX_CONFIG,
  SupportedToken,
  TOKEN_MINTS,
  TOKEN_DECIMALS,
  MINIMUM_AMOUNTS,
  MAXIMUM_AMOUNTS,
  FIXED_CONVERSION_RATES,
} from "../lib/solana/constants";
import IDL from "../lib/solana/mystery_box_solana.json";

interface TokenBalance {
  amount: number;
  formatted: string;
  decimals: number;
}

interface SolanaBalances {
  SOL: TokenBalance;
  JUP: TokenBalance;
}

interface PurchaseResult {
  signature: string;
  success: boolean;
  error?: string;
  usdcReceived?: number;
  feeAmount?: number;
  conversionRate?: number;
}

interface SolanaState {
  balances: SolanaBalances;
  balancesInitialized: boolean;
  isLoading: boolean;
  isPurchasing: boolean;
  error: string | null;
  contractActive: boolean;
}

export const useSolana = () => {
  const { connection } = useConnection();
  const wallet = useWallet();

  const [state, setState] = useState<SolanaState>({
    balances: {
      SOL: { amount: 0, formatted: "0.0000", decimals: 9 },
      JUP: { amount: 0, formatted: "0.0000", decimals: 6 },
    },
    balancesInitialized: false,
    isLoading: false,
    isPurchasing: false,
    error: null,
    contractActive: false,
  });

  // Initialize clients
  const { client, jupiterClient, program } = useMemo(() => {
    if (
      !wallet.publicKey ||
      !wallet.connected ||
      !wallet.signTransaction ||
      !wallet.signAllTransactions
    ) {
      return { client: null, jupiterClient: null, program: null };
    }

    try {
      const anchorWallet = {
        publicKey: wallet.publicKey,
        signTransaction: wallet.signTransaction,
        signAllTransactions: wallet.signAllTransactions,
      };

      const provider = new AnchorProvider(connection, anchorWallet as Wallet, {
        commitment: "confirmed",
      });

      const programId = new PublicKey(MYSTERY_BOX_CONFIG.PROGRAM_ID);
      const mysteryBoxProgram = new Program(IDL as MysteryBoxSolana, provider);

      const mysteryBoxClient = new MysteryBoxClient(
        connection,
        anchorWallet as Wallet,
        IDL as MysteryBoxSolana,
      );
      const jupClient = new JupiterSwapClient(
        connection,
        anchorWallet as Wallet,
      );

      return {
        client: mysteryBoxClient,
        jupiterClient: jupClient,
        program: mysteryBoxProgram,
      };
    } catch (error) {
      console.error("Failed to initialize Solana clients:", error);
      return { client: null, jupiterClient: null, program: null };
    }
  }, [
    connection,
    wallet.publicKey,
    wallet.connected,
    wallet.signTransaction,
    wallet.signAllTransactions,
  ]);

  // Fetch balances
  const fetchBalances = useCallback(async () => {
    if (!wallet.publicKey || !connection) return;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Fetch SOL balance
      const solBalance = await connection.getBalance(wallet.publicKey);
      const solFormatted = (solBalance / LAMPORTS_PER_SOL).toFixed(4);

      let jupBalance = 0;
      let jupFormatted = "0.0000";

      // Fetch JUP balance
      try {
        const jupMint = new PublicKey(TOKEN_MINTS.JUP);
        const jupTokenAccount = await getAssociatedTokenAddress(
          jupMint,
          wallet.publicKey,
        );

        const jupAccountInfo = await getAccount(connection, jupTokenAccount);
        jupBalance =
          Number(jupAccountInfo.amount) / Math.pow(10, TOKEN_DECIMALS.JUP);
        jupFormatted = jupBalance.toFixed(4);
      } catch (error) {
        // Token account doesn't exist or no balance
        console.log("No JUP token account or balance");
      }

      setState((prev) => ({
        ...prev,
        balances: {
          SOL: {
            amount: solBalance / LAMPORTS_PER_SOL,
            formatted: solFormatted,
            decimals: TOKEN_DECIMALS.SOL,
          },
          JUP: {
            amount: jupBalance,
            formatted: jupFormatted,
            decimals: TOKEN_DECIMALS.JUP,
          },
        },
        balancesInitialized: true,
        isLoading: false,
      }));
    } catch (error) {
      console.error("Failed to fetch balances:", error);
      setState((prev) => ({
        ...prev,
        error: "Failed to fetch wallet balances",
        isLoading: false,
        balancesInitialized: true,
      }));
    }
  }, [wallet.publicKey, connection]);

  // Check contract status
  const checkContractStatus = useCallback(async () => {
    if (!client) return;

    try {
      const contractState: any = await client.getMysteryBoxState();
      setState((prev) => ({
        ...prev,
        contractActive: contractState?.isActive || false,
      }));
    } catch (error) {
      console.error("Failed to check contract status:", error);
      setState((prev) => ({
        ...prev,
        contractActive: false,
      }));
    }
  }, [client]);

  // Get price estimate using fixed conversion rates
  // Price estimate functionality removed

  // Validate purchase amount
  const validatePurchaseAmount = useCallback(
    (tokenType: SupportedToken, amount: number): string | null => {
      if (amount <= 0) {
        return "Amount must be greater than 0";
      }

      const minAmount = MINIMUM_AMOUNTS[tokenType];
      const maxAmount = MAXIMUM_AMOUNTS[tokenType];

      if (amount < minAmount) {
        return `Minimum amount is ${minAmount} ${tokenType}`;
      }

      if (amount > maxAmount) {
        return `Maximum amount is ${maxAmount} ${tokenType}`;
      }

      const balance = state.balances[tokenType];
      if (amount > balance.amount) {
        return `Insufficient ${tokenType} balance`;
      }

      // For SOL, leave some for transaction fees
      if (tokenType === "SOL" && amount > balance.amount - 0.01) {
        return "Leave some SOL for transaction fees (0.01 SOL minimum)";
      }

      return null;
    },
    [state.balances],
  );

  // Purchase mystery box with auto conversion
  const purchaseMysteryBox = useCallback(
    async (
      tokenType: SupportedToken,
      amount: number,
    ): Promise<PurchaseResult> => {
      if (!client || !wallet.publicKey) {
        throw new Error("Wallet not connected");
      }

      if (!state.contractActive) {
        throw new Error("Mystery box contract is not active");
      }

      const validationError = validatePurchaseAmount(tokenType, amount);
      if (validationError) {
        throw new Error(validationError);
      }

      setState((prev) => ({ ...prev, isPurchasing: true, error: null }));

      try {
        let result: AutoConversionResult;

        if (tokenType === "SOL") {
          result = await client.purchaseBoxWithSOLAutoSimple({
            amount,
            tokenType,
          });
        } else if (tokenType === "JUP") {
          // Ensure JUP token account exists
          await client.createJUPTokenAccountIfNeeded();

          result = await client.purchaseBoxWithJUPAutoSimple({
            amount,
            tokenType,
          });
        } else {
          throw new Error(`Unsupported token type: ${tokenType}`);
        }

        setTimeout(() => {
          fetchBalances();
        }, 2000);

        setState((prev) => ({ ...prev, isPurchasing: false }));

        return {
          signature: result.signature,
          success: true,
          usdcReceived: result.usdcReceived,
          feeAmount: result.feeAmount,
          conversionRate: result.conversionRate,
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Purchase failed";
        setState((prev) => ({
          ...prev,
          isPurchasing: false,
          error: errorMessage,
        }));

        return {
          signature: "",
          success: false,
          error: errorMessage,
        };
      }
    },
    [
      client,
      wallet.publicKey,
      state.contractActive,
      validatePurchaseAmount,
      fetchBalances,
    ],
  );

  // Reset state
  const resetState = useCallback(() => {
    setState({
      balances: {
        SOL: { amount: 0, formatted: "0.0000", decimals: 9 },
        JUP: { amount: 0, formatted: "0.0000", decimals: 6 },
      },
      balancesInitialized: false,
      isLoading: false,
      isPurchasing: false,
      error: null,
      contractActive: false,
    });
  }, []);

  // Event listener for automatic conversion purchases
  useEffect(() => {
    if (!client || !wallet.publicKey) return;

    const listenerId = client.addAutoConversionListener(
      (event: BoxPurchasedAutomaticEvent) => {
        if (event.user.toString() === wallet.publicKey?.toString()) {
          const usdcReceived = Number(event.usdcReceived) / Math.pow(10, 6); // USDC has 6 decimals
          fetchBalances();
        }
      },
    );

    return () => {
      client.removeEventListener(listenerId);
    };
  }, [client, wallet.publicKey, fetchBalances]);

  // Initialize on wallet connection
  useEffect(() => {
    if (wallet.connected && wallet.publicKey) {
      fetchBalances();
      checkContractStatus();
    } else {
      resetState();
    }
  }, [
    wallet.connected,
    wallet.publicKey,
    fetchBalances,
    checkContractStatus,
    resetState,
  ]);

  // Utility functions
  const formatBalance = useCallback(
    (tokenType: SupportedToken): string => {
      return state.balances[tokenType].formatted;
    },
    [state.balances],
  );

  const getBalance = useCallback(
    (tokenType: SupportedToken): number => {
      return state.balances[tokenType].amount;
    },
    [state.balances],
  );

  const calculateFees = useCallback((amount: number) => {
    const fee = amount * 0.05; // 5%
    const remaining = amount * 0.95; // 95%
    return { fee, remaining };
  }, []);

  return {
    // State
    balances: state.balances,
    balancesInitialized: state.balancesInitialized,
    isLoading: state.isLoading,
    isPurchasing: state.isPurchasing,
    error: state.error,
    contractActive: state.contractActive,

    // Connection status
    isConnected: wallet.connected,
    publicKey: wallet.publicKey,

    // Actions
    fetchBalances,
    purchaseMysteryBox,
    validatePurchaseAmount,
    checkContractStatus,
    resetState,

    // Utilities
    formatBalance,
    getBalance,
    calculateFees,

    // Clients (for advanced usage)
    client,
    jupiterClient,
    program,
  };
};

export default useSolana;
