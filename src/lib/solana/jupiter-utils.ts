import {
  Connection,
  PublicKey,
  Transaction,
  VersionedTransaction,
  sendAndConfirmTransaction,
  Keypair,
} from '@solana/web3.js';
import { Wallet } from '@coral-xyz/anchor';
import {
  TOKEN_MINTS,
  TOKEN_DECIMALS,
  JUPITER_API,
  DEFAULT_SLIPPAGE_BPS,
  SupportedToken,
} from './constants';

export interface SwapQuote {
  inputMint: string;
  inAmount: string;
  outputMint: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  platformFee?: {
    amount: string;
    feeBps: number;
  };
  priceImpactPct: string;
  routePlan: Array<{
    swapInfo: {
      ammKey: string;
      label: string;
      inputMint: string;
      outputMint: string;
      inAmount: string;
      outAmount: string;
      feeAmount: string;
      feeMint: string;
    };
    percent: number;
  }>;
  contextSlot: number;
  timeTaken: number;
}

export interface SwapInstruction {
  setupInstructions: any[];
  swapInstruction: any;
  cleanupInstructions: any[];
  addressLookupTableAddresses: string[];
}

export class JupiterSwapClient {
  private connection: Connection;
  private wallet: Wallet;

  constructor(connection: Connection, wallet: Wallet) {
    this.connection = connection;
    this.wallet = wallet;
  }

  /**
   * Get swap quote from Jupiter
   */
  async getSwapQuote(
    inputToken: SupportedToken,
    outputToken: 'USDC',
    amount: number,
    slippageBps: number = DEFAULT_SLIPPAGE_BPS
  ): Promise<SwapQuote> {
    const inputMint = inputToken === 'SOL' ? TOKEN_MINTS.WSOL : TOKEN_MINTS[inputToken];
    const outputMint = TOKEN_MINTS[outputToken];
    const inputDecimals = TOKEN_DECIMALS[inputToken];

    // Convert amount to base units
    const amountInBaseUnits = Math.floor(amount * Math.pow(10, inputDecimals));

    const params = new URLSearchParams({
      inputMint: inputMint.toString(),
      outputMint: outputMint.toString(),
      amount: amountInBaseUnits.toString(),
      slippageBps: slippageBps.toString(),
    });

    const response = await fetch(`${JUPITER_API.QUOTE_URL}?${params}`);

    if (!response.ok) {
      throw new Error(`Failed to get quote: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Get swap instructions from Jupiter
   */
  async getSwapInstructions(
    quote: SwapQuote,
    userPublicKey: PublicKey,
    wrapAndUnwrapSol: boolean = true,
    feeAccount?: PublicKey
  ): Promise<SwapInstruction> {
    const body = {
      quoteResponse: quote,
      userPublicKey: userPublicKey.toString(),
      wrapAndUnwrapSol,
      computeUnitPriceMicroLamports: 'auto',
      ...(feeAccount && { feeAccount: feeAccount.toString() }),
    };

    const response = await fetch(JUPITER_API.SWAP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Failed to get swap instructions: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Execute swap transaction
   */
  async executeSwap(
    inputToken: SupportedToken,
    amount: number,
    slippageBps: number = DEFAULT_SLIPPAGE_BPS,
    feeAccount?: PublicKey
  ): Promise<string> {
    try {
      // Get quote
      const quote = await this.getSwapQuote(
        inputToken,
        'USDC',
        amount,
        slippageBps
      );

      // Get swap instructions
      const swapInstructions = await this.getSwapInstructions(
        quote,
        this.wallet.publicKey,
        true,
        feeAccount
      );

      // Create transaction
      const { swapTransaction } = swapInstructions as any;

      // Deserialize the transaction
      const transactionBuf = Buffer.from(swapTransaction, 'base64');
      let transaction: VersionedTransaction | Transaction;

      try {
        transaction = VersionedTransaction.deserialize(transactionBuf);
      } catch {
        transaction = Transaction.from(transactionBuf);
      }

      // Sign and send transaction
      if (transaction instanceof VersionedTransaction) {
        transaction.sign([this.wallet.payer as Keypair]);
        const signature = await this.connection.sendTransaction(transaction);
        await this.connection.confirmTransaction(signature);
        return signature;
      } else {
        const signature = await sendAndConfirmTransaction(
          this.connection,
          transaction,
          [this.wallet.payer as Keypair]
        );
        return signature;
      }
    } catch (error) {
      console.error('Swap execution failed:', error);
      throw new Error(`Swap failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate output amount for given input
   */
  async calculateOutputAmount(
    inputToken: SupportedToken,
    inputAmount: number,
    slippageBps: number = DEFAULT_SLIPPAGE_BPS
  ): Promise<{ outputAmount: number; priceImpact: number; minOutput: number }> {
    const quote = await this.getSwapQuote(inputToken, 'USDC', inputAmount, slippageBps);

    const outputDecimals = TOKEN_DECIMALS.USDC;
    const outputAmount = parseInt(quote.outAmount) / Math.pow(10, outputDecimals);
    const minOutput = parseInt(quote.otherAmountThreshold) / Math.pow(10, outputDecimals);
    const priceImpact = parseFloat(quote.priceImpactPct);

    return {
      outputAmount,
      priceImpact,
      minOutput,
    };
  }

  /**
   * Get token price in USDC
   */
  async getTokenPrice(inputToken: SupportedToken): Promise<number> {
    const quote = await this.getSwapQuote(inputToken, 'USDC', 1);
    const outputDecimals = TOKEN_DECIMALS.USDC;
    return parseInt(quote.outAmount) / Math.pow(10, outputDecimals);
  }

  /**
   * Check if swap is profitable considering fees
   */
  async isSwapProfitable(
    inputToken: SupportedToken,
    inputAmount: number,
    minOutputAmount: number,
    slippageBps: number = DEFAULT_SLIPPAGE_BPS
  ): Promise<boolean> {
    const { minOutput } = await this.calculateOutputAmount(
      inputToken,
      inputAmount,
      slippageBps
    );

    return minOutput >= minOutputAmount;
  }

  /**
   * Get all supported tokens from Jupiter
   */
  async getSupportedTokens(): Promise<Array<{ address: string; symbol: string; name: string; decimals: number }>> {
    const response = await fetch(`${JUPITER_API.BASE_URL}/tokens`);

    if (!response.ok) {
      throw new Error(`Failed to fetch supported tokens: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Validate if token pair is supported
   */
  async isTokenPairSupported(inputToken: SupportedToken, outputToken: string = 'USDC'): Promise<boolean> {
    try {
      await this.getSwapQuote(inputToken, outputToken as 'USDC', 0.01);
      return true;
    } catch {
      return false;
    }
  }
}

// Utility functions
export const formatTokenAmount = (amount: number, decimals: number): string => {
  return (amount * Math.pow(10, decimals)).toFixed(0);
};

export const parseTokenAmount = (amount: string, decimals: number): number => {
  return parseInt(amount) / Math.pow(10, decimals);
};

export const calculateMinimumReceived = (amount: number, slippageBps: number): number => {
  return amount * (1 - slippageBps / 10000);
};

export const calculatePriceImpact = (inputAmount: number, outputAmount: number, marketPrice: number): number => {
  const expectedOutput = inputAmount * marketPrice;
  return Math.abs(expectedOutput - outputAmount) / expectedOutput * 100;
};

// React hook for Jupiter integration (optional)
export const useJupiterSwap = (connection: Connection, wallet: Wallet) => {
  const jupiterClient = new JupiterSwapClient(connection, wallet);

  const swap = async (
    inputToken: SupportedToken,
    amount: number,
    options?: {
      slippageBps?: number;
      feeAccount?: PublicKey;
    }
  ) => {
    return await jupiterClient.executeSwap(
      inputToken,
      amount,
      options?.slippageBps,
      options?.feeAccount
    );
  };

  const getQuote = async (
    inputToken: SupportedToken,
    amount: number,
    slippageBps?: number
  ) => {
    return await jupiterClient.getSwapQuote(inputToken, 'USDC', amount, slippageBps);
  };

  const getPrice = async (inputToken: SupportedToken) => {
    return await jupiterClient.getTokenPrice(inputToken);
  };

  return {
    client: jupiterClient,
    swap,
    getQuote,
    getPrice,
    calculateOutput: (inputToken: SupportedToken, amount: number, slippageBps?: number) =>
      jupiterClient.calculateOutputAmount(inputToken, amount, slippageBps),
  };
};
