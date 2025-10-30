import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
  Keypair,
} from "@solana/web3.js";
import {
  Program,
  AnchorProvider,
  Wallet,
  BN,
  IdlAccounts,
  web3,
} from "@coral-xyz/anchor";
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  getAccount,
} from "@solana/spl-token";
import { MysteryBoxSolana } from "./mystery_box_solana";
import { FIXED_CONVERSION_RATES } from "./constants";

// Constants
const PROGRAM_ID = new PublicKey(
  "FDXxJHprFRFf293SMGkB8pdDMbM4zaxw9ykuqvATihEs",
);
const FEE_WALLET = new PublicKey(
  "HKAkT4mCBkWEX4TsKXVHZEWEo4R7B81Vh9omBqoWp2Pt",
);

// Token mints (devnet)
const JUP_MINT = new PublicKey("ByJUP3XrpVdYKNkPS27Gz8VV3UBgT8K7Tc4RsoZcWvWa");
const USDC_MINT = new PublicKey("Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr"); // User's USDC-Dev token

export interface PurchaseBoxParams {
  amount: number; // Amount in SOL or JUP tokens
  tokenType: "SOL" | "JUP";
}

export interface AutoConversionResult {
  signature: string;
  usdcReceived: number;
  feeAmount: number;
  conversionRate: number;
}

export interface BoxPurchasedEvent {
  user: PublicKey;
  amount: BN;
  feeAmount: BN;
  tokenType: "Sol" | "Jup";
}

export interface BoxPurchasedAutomaticEvent {
  user: PublicKey;
  solAmount: BN;
  feeAmount: BN;
  swapAmount: BN;
  usdcReceived: BN;
  tokenType: "Sol" | "Jup";
}

export class MysteryBoxClient {
  private connection: Connection;
  private program: Program<MysteryBoxSolana>;
  private provider: AnchorProvider;

  constructor(connection: Connection, wallet: Wallet, idl: MysteryBoxSolana) {
    this.connection = connection;
    this.provider = new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
    });
    this.program = new Program(idl as any, this.provider);
  }

  /**
   * Get the mystery box PDA
   */
  getMysteryBoxPDA(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("mystery_box")],
      PROGRAM_ID,
    );
  }

  /**
   * Initialize the mystery box contract
   */
  async initialize(admin: PublicKey): Promise<string> {
    const [mysteryBoxPDA] = this.getMysteryBoxPDA();

    const tx = await (this.program.methods as any)
      .initialize(admin)
      .accounts({
        mysteryBox: mysteryBoxPDA,
        user: this.provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      } as any)
      .rpc();

    return tx;
  }

  /**
   * Purchase box with SOL
   */
  async purchaseBoxWithSOL(params: PurchaseBoxParams): Promise<string> {
    if (params.tokenType !== "SOL") {
      throw new Error("Invalid token type for SOL purchase");
    }

    const [mysteryBoxPDA] = this.getMysteryBoxPDA();
    const amountLamports = new BN(params.amount * LAMPORTS_PER_SOL);

    const tx = await (this.program.methods as any)
      .purchaseBoxWithSol(amountLamports)
      .accounts({
        mysteryBox: mysteryBoxPDA,
        user: this.provider.wallet.publicKey,
        feeWallet: FEE_WALLET,
        systemProgram: SystemProgram.programId,
      } as any)
      .rpc();

    return tx;
  }

  /**
   * Purchase box with JUP tokens
   */
  async purchaseBoxWithJUP(params: PurchaseBoxParams): Promise<string> {
    if (params.tokenType !== "JUP") {
      throw new Error("Invalid token type for JUP purchase");
    }

    const [mysteryBoxPDA] = this.getMysteryBoxPDA();
    const userTokenAccount = await getAssociatedTokenAddress(
      JUP_MINT,
      this.provider.wallet.publicKey,
    );

    // Get or create program token account
    const programTokenAccount = await getAssociatedTokenAddress(
      JUP_MINT,
      mysteryBoxPDA,
      true,
    );

    const amount = new BN(params.amount * Math.pow(10, 6)); // Assuming 6 decimals for JUP

    const tx = await (this.program.methods as any)
      .purchaseBoxWithToken(amount)
      .accounts({
        mysteryBox: mysteryBoxPDA,
        user: this.provider.wallet.publicKey,
        userTokenAccount,
        programTokenAccount,
        tokenMint: JUP_MINT,
        tokenProgram: TOKEN_PROGRAM_ID,
      } as any)
      .rpc();

    return tx;
  }

  /**
   * Set contract active/inactive (admin only)
   */
  async setActive(isActive: boolean): Promise<string> {
    const [mysteryBoxPDA] = this.getMysteryBoxPDA();

    const tx = await (this.program.methods as any)
      .setActive(isActive)
      .accounts({
        mysteryBox: mysteryBoxPDA,
        user: this.provider.wallet.publicKey,
      } as any)
      .rpc();

    return tx;
  }

  /**
   * Get mystery box state
   */
  async getMysteryBoxState(): Promise<any> {
    const [mysteryBoxPDA] = this.getMysteryBoxPDA();
    return await (this.program.account as any).mysteryBox.fetch(mysteryBoxPDA);
  }

  /**
   * Listen to box purchased events (legacy)
   */
  addEventListener(callback: (event: BoxPurchasedEvent) => void): number {
    return (this.program as any).addEventListener(
      "boxPurchased",
      (event: any) => {
        callback({
          user: event.user,
          amount: event.amount,
          feeAmount: event.feeAmount,
          tokenType: event.tokenType,
        });
      },
    );
  }

  /**
   * Listen to automatic conversion events
   */
  addAutoConversionListener(
    callback: (event: BoxPurchasedAutomaticEvent) => void,
  ): number {
    return (this.program as any).addEventListener(
      "boxPurchasedAutomatic",
      (event: any) => {
        callback({
          user: event.user,
          solAmount: event.solAmount,
          feeAmount: event.feeAmount,
          swapAmount: event.swapAmount,
          usdcReceived: event.usdcReceived,
          tokenType: event.tokenType,
        });
      },
    );
  }

  /**
   * Remove event listener
   */
  removeEventListener(listenerId: number): Promise<void> {
    return this.program.removeEventListener(listenerId);
  }

  /**
   * Purchase box with SOL and receive USDC automatically (Simple Fixed Rate)
   */
  async purchaseBoxWithSOLAutoSimple(
    params: PurchaseBoxParams,
  ): Promise<AutoConversionResult> {
    if (params.tokenType !== "SOL") {
      throw new Error("Invalid token type for SOL purchase");
    }

    const [mysteryBoxPDA] = this.getMysteryBoxPDA();
    const amountLamports = new BN(params.amount * LAMPORTS_PER_SOL);

    // Calculate expected output using fixed rate
    const feeAmount = params.amount * 0.05; // 5% fee
    const swapAmount = params.amount * 0.95; // 95% for conversion
    const expectedUSDC = swapAmount * FIXED_CONVERSION_RATES.SOL_TO_USDC;

    // Get user USDC account (create if needed)
    const userUsdcAccount = await this.getOrCreateUSDCAccount();

    // Get program USDC account
    const programUsdcAccount = await getAssociatedTokenAddress(
      USDC_MINT,
      mysteryBoxPDA,
      true,
    );

    const tx = await (this.program.methods as any)
      .purchaseBoxWithSolAutoSimple(amountLamports)
      .accounts({
        mysteryBox: mysteryBoxPDA,
        user: this.provider.wallet.publicKey,
        feeWallet: FEE_WALLET,
        programUsdcAccount,
        userUsdcAccount,
        usdcMint: USDC_MINT,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      } as any)
      .rpc();

    return {
      signature: tx,
      usdcReceived: expectedUSDC,
      feeAmount,
      conversionRate: FIXED_CONVERSION_RATES.SOL_TO_USDC,
    };
  }

  /**
   * Purchase box with JUP and receive USDC automatically (Simple Fixed Rate)
   */
  async purchaseBoxWithJUPAutoSimple(
    params: PurchaseBoxParams,
  ): Promise<AutoConversionResult> {
    if (params.tokenType !== "JUP") {
      throw new Error("Invalid token type for JUP purchase");
    }

    const [mysteryBoxPDA] = this.getMysteryBoxPDA();
    const amount = new BN(params.amount * Math.pow(10, 6)); // JUP has 6 decimals

    // Calculate expected output using fixed rate
    const feeAmount = params.amount * 0.05; // 5% fee
    const swapAmount = params.amount * 0.95; // 95% for conversion
    const expectedUSDC = swapAmount * FIXED_CONVERSION_RATES.JUP_TO_USDC;

    // Get user accounts
    const userJupAccount = await getAssociatedTokenAddress(
      JUP_MINT,
      this.provider.wallet.publicKey,
    );
    const userUsdcAccount = await this.getOrCreateUSDCAccount();

    // Get program accounts
    const programJupAccount = await getAssociatedTokenAddress(
      JUP_MINT,
      mysteryBoxPDA,
      true,
    );
    const programUsdcAccount = await getAssociatedTokenAddress(
      USDC_MINT,
      mysteryBoxPDA,
      true,
    );

    const tx = await (this.program.methods as any)
      .purchaseBoxWithJupAutoSimple(amount)
      .accounts({
        mysteryBox: mysteryBoxPDA,
        user: this.provider.wallet.publicKey,
        userJupAccount,
        programJupAccount,
        programUsdcAccount,
        userUsdcAccount,
        jupMint: JUP_MINT,
        usdcMint: USDC_MINT,
        tokenProgram: TOKEN_PROGRAM_ID,
      } as any)
      .rpc();

    return {
      signature: tx,
      usdcReceived: expectedUSDC,
      feeAmount,
      conversionRate: FIXED_CONVERSION_RATES.JUP_TO_USDC,
    };
  }

  /**
   * Get or create USDC associated token account for user
   */
  private async getOrCreateUSDCAccount(): Promise<PublicKey> {
    const userUsdcAccount = await getAssociatedTokenAddress(
      USDC_MINT,
      this.provider.wallet.publicKey,
    );

    try {
      // Check if account exists
      await getAccount(this.connection, userUsdcAccount);
      return userUsdcAccount;
    } catch (error) {
      // Account doesn't exist, create it
      const transaction = new Transaction().add(
        createAssociatedTokenAccountInstruction(
          this.provider.wallet.publicKey,
          userUsdcAccount,
          this.provider.wallet.publicKey,
          USDC_MINT,
        ),
      );

      await sendAndConfirmTransaction(this.connection, transaction, [
        this.provider.wallet.payer as Keypair,
      ]);

      return userUsdcAccount;
    }
  }

  /**
   * Calculate expected USDC output for given input
   */
  calculateExpectedOutput(
    tokenType: "SOL" | "JUP",
    amount: number,
  ): {
    feeAmount: number;
    swapAmount: number;
    expectedUSDC: number;
    conversionRate: number;
  } {
    const feeAmount = amount * 0.05; // 5% fee
    const swapAmount = amount * 0.95; // 95% for conversion

    const conversionRate =
      tokenType === "SOL"
        ? FIXED_CONVERSION_RATES.SOL_TO_USDC
        : FIXED_CONVERSION_RATES.JUP_TO_USDC;

    const expectedUSDC = swapAmount * conversionRate;

    return {
      feeAmount,
      swapAmount,
      expectedUSDC,
      conversionRate,
    };
  }

  /**
   * Check if user has sufficient SOL balance
   */
  async checkSOLBalance(amount: number): Promise<boolean> {
    const balance = await this.connection.getBalance(
      this.provider.wallet.publicKey,
    );
    const requiredLamports = amount * LAMPORTS_PER_SOL;
    return balance >= requiredLamports;
  }

  /**
   * Check if user has sufficient JUP token balance
   */
  async checkJUPBalance(amount: number): Promise<boolean> {
    try {
      const userTokenAccount = await getAssociatedTokenAddress(
        JUP_MINT,
        this.provider.wallet.publicKey,
      );

      const accountInfo = await getAccount(this.connection, userTokenAccount);

      const requiredAmount = amount * Math.pow(10, 6); // 6 decimals
      return Number(accountInfo.amount) >= requiredAmount;
    } catch (error) {
      return false; // Account doesn't exist
    }
  }

  /**
   * Create associated token account for JUP if it doesn't exist
   */
  async createJUPTokenAccountIfNeeded(): Promise<string | null> {
    try {
      const userTokenAccount = await getAssociatedTokenAddress(
        JUP_MINT,
        this.provider.wallet.publicKey,
      );

      // Check if account exists
      await getAccount(this.connection, userTokenAccount);
      return null; // Account already exists
    } catch (error) {
      // Account doesn't exist, create it
      const userTokenAccount = await getAssociatedTokenAddress(
        JUP_MINT,
        this.provider.wallet.publicKey,
      );

      const transaction = new Transaction().add(
        createAssociatedTokenAccountInstruction(
          this.provider.wallet.publicKey,
          userTokenAccount,
          this.provider.wallet.publicKey,
          JUP_MINT,
        ),
      );

      return await sendAndConfirmTransaction(this.connection, transaction, [
        this.provider.wallet.payer as Keypair,
      ]);
    }
  }

  /**
   * Get transaction details
   */
  async getTransactionDetails(signature: string): Promise<any> {
    return await this.connection.getTransaction(signature, {
      commitment: "confirmed",
    });
  }
}

// Export utility functions
export const convertSOLToLamports = (sol: number): number => {
  return sol * LAMPORTS_PER_SOL;
};

export const convertLamportsToSOL = (lamports: number): number => {
  return lamports / LAMPORTS_PER_SOL;
};

export const calculateFee = (
  amount: number,
  feePercentage: number = 5,
): number => {
  return (amount * feePercentage) / 100;
};

// React hook for easy integration (optional)
export const useMysteryBox = (
  connection: Connection,
  wallet: Wallet,
  idl: MysteryBoxSolana,
) => {
  const client = new MysteryBoxClient(connection, wallet, idl);

  const purchaseBox = async (params: PurchaseBoxParams) => {
    try {
      if (params.tokenType === "SOL") {
        const hasBalance = await client.checkSOLBalance(params.amount);
        if (!hasBalance) {
          throw new Error("Insufficient SOL balance");
        }
        return await client.purchaseBoxWithSOL(params);
      } else {
        const hasBalance = await client.checkJUPBalance(params.amount);
        if (!hasBalance) {
          throw new Error("Insufficient JUP balance");
        }

        // Create token account if needed
        await client.createJUPTokenAccountIfNeeded();

        return await client.purchaseBoxWithJUP(params);
      }
    } catch (error) {
      console.error("Purchase failed:", error);
      throw error;
    }
  };

  // Auto conversion purchase (new function)
  const purchaseBoxAutoConversion = async (
    params: PurchaseBoxParams,
  ): Promise<AutoConversionResult> => {
    try {
      if (params.tokenType === "SOL") {
        const hasBalance = await client.checkSOLBalance(params.amount + 0.01); // Leave some for fees
        if (!hasBalance) {
          throw new Error(
            "Insufficient SOL balance (need extra 0.01 SOL for transaction fees)",
          );
        }
        return await client.purchaseBoxWithSOLAutoSimple(params);
      } else {
        const hasBalance = await client.checkJUPBalance(params.amount);
        if (!hasBalance) {
          throw new Error("Insufficient JUP balance");
        }

        // Create token accounts if needed
        await client.createJUPTokenAccountIfNeeded();

        return await client.purchaseBoxWithJUPAutoSimple(params);
      }
    } catch (error) {
      console.error("Auto conversion purchase failed:", error);
      throw error;
    }
  };

  return {
    client,
    purchaseBox,
    purchaseBoxAutoConversion,
    calculateExpectedOutput: (tokenType: "SOL" | "JUP", amount: number) =>
      client.calculateExpectedOutput(tokenType, amount),
    getMysteryBoxState: () => client.getMysteryBoxState(),
    addEventListener: (callback: (event: BoxPurchasedEvent) => void) =>
      client.addEventListener(callback),
    addAutoConversionListener: (
      callback: (event: BoxPurchasedAutomaticEvent) => void,
    ) => client.addAutoConversionListener(callback),
    removeEventListener: (id: number) => client.removeEventListener(id),
  };
};
