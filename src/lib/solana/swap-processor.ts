import {
  Connection,
  PublicKey,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
import { Program, AnchorProvider, Wallet, BN } from "@coral-xyz/anchor";
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccount,
} from "@solana/spl-token";
import { MysteryBoxSolana } from "./mystery_box_solana";
import { MYSTERY_BOX_CONFIG, TOKEN_MINTS } from "./constants";
import IDL from "./mystery_box_solana.json";

interface SwapRequestedEvent {
  user: PublicKey;
  inputAmount: BN;
  inputToken: string;
  outputToken: string;
  programPda: PublicKey;
}

interface JupiterQuoteResponse {
  inputMint: string;
  inAmount: string;
  outputMint: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  platformFee?: any;
  priceImpactPct: string;
  routePlan: any[];
  contextSlot: number;
  timeTaken: number;
}

interface JupiterSwapResponse {
  swapTransaction: string;
  lastValidBlockHeight: number;
  prioritizationFeeLamports: number;
}

export class SwapProcessor {
  private connection: Connection;
  private program: Program<MysteryBoxSolana>;
  private provider: AnchorProvider;
  private adminWallet: Wallet;
  private isProcessing: boolean = false;
  private listeners: number[] = [];

  constructor(connection: Connection, adminWallet: Wallet) {
    this.connection = connection;
    this.adminWallet = adminWallet;
    this.provider = new AnchorProvider(connection, adminWallet, {
      commitment: "confirmed",
    });

    const programId = new PublicKey(MYSTERY_BOX_CONFIG.PROGRAM_ID);
    this.program = new Program(IDL as any, this.provider);
  }

  /**
   * Start listening for swap events and processing them
   */
  public startProcessing(): void {
    console.log("🔄 Starting swap processor...");

    // Listen for SwapRequested events
    const swapListener = this.program.addEventListener(
      "swapRequested",
      this.handleSwapRequest.bind(this),
    );

    this.listeners.push(swapListener);
    this.isProcessing = true;

    console.log("✅ Swap processor started, listening for events...");
  }

  /**
   * Stop processing swaps
   */
  public stopProcessing(): void {
    console.log("⏹️ Stopping swap processor...");

    this.listeners.forEach((listenerId) => {
      this.program.removeEventListener(listenerId);
    });

    this.listeners = [];
    this.isProcessing = false;

    console.log("✅ Swap processor stopped");
  }

  /**
   * Handle a swap request event
   */
  private async handleSwapRequest(
    event: SwapRequestedEvent,
    slot: number,
  ): Promise<void> {
    console.log("🔄 Processing swap request:", {
      user: event.user.toString(),
      amount: event.inputAmount.toString(),
      inputToken: event.inputToken,
      outputToken: event.outputToken,
      slot,
    });

    try {
      // Only process SOL to USDC swaps for now
      if (event.inputToken === "SOL" && event.outputToken === "USDC") {
        await this.processSolToUsdcSwap(event);
      } else if (event.inputToken === "JUP" && event.outputToken === "USDC") {
        await this.processJupToUsdcSwap(event);
      } else {
        console.log(
          "⚠️ Unsupported swap pair:",
          event.inputToken,
          "->",
          event.outputToken,
        );
      }
    } catch (error) {
      console.error("❌ Error processing swap:", error);
    }
  }

  /**
   * Process SOL to USDC swap
   */
  private async processSolToUsdcSwap(event: SwapRequestedEvent): Promise<void> {
    console.log("💱 Processing SOL -> USDC swap...");

    const inputAmount = event.inputAmount.toNumber();
    const inputMint = TOKEN_MINTS.WSOL; // Wrapped SOL
    const outputMint = TOKEN_MINTS.USDC;

    try {
      // 1. Get Jupiter quote
      const quote = await this.getJupiterQuote(
        inputMint.toString(),
        outputMint.toString(),
        inputAmount,
      );

      if (!quote) {
        throw new Error("Failed to get Jupiter quote");
      }

      console.log("📊 Quote received:", {
        inputAmount: quote.inAmount,
        outputAmount: quote.outAmount,
        priceImpact: quote.priceImpactPct,
      });

      // 2. Execute swap
      const swapResult = await this.executeJupiterSwap(quote);

      if (!swapResult) {
        throw new Error("Failed to execute swap");
      }

      console.log("✅ Swap executed successfully:", swapResult);

      // 3. Distribute USDC to user
      await this.distributeUsdcToUser(event.user, new BN(quote.outAmount));
    } catch (error) {
      console.error("❌ SOL -> USDC swap failed:", error);
    }
  }

  /**
   * Process JUP to USDC swap
   */
  private async processJupToUsdcSwap(event: SwapRequestedEvent): Promise<void> {
    console.log("💱 Processing JUP -> USDC swap...");

    const inputAmount = event.inputAmount.toNumber();
    const inputMint = TOKEN_MINTS.JUP;
    const outputMint = TOKEN_MINTS.USDC;

    try {
      // Similar process as SOL swap
      const quote = await this.getJupiterQuote(
        inputMint.toString(),
        outputMint.toString(),
        inputAmount,
      );

      if (!quote) {
        throw new Error("Failed to get Jupiter quote");
      }

      const swapResult = await this.executeJupiterSwap(quote);

      if (!swapResult) {
        throw new Error("Failed to execute swap");
      }

      await this.distributeUsdcToUser(event.user, new BN(quote.outAmount));
    } catch (error) {
      console.error("❌ JUP -> USDC swap failed:", error);
    }
  }

  /**
   * Get quote from Jupiter API
   */
  private async getJupiterQuote(
    inputMint: string,
    outputMint: string,
    amount: number,
    slippageBps: number = 50,
  ): Promise<JupiterQuoteResponse | null> {
    try {
      const url =
        `https://quote-api.jup.ag/v6/quote?` +
        `inputMint=${inputMint}&` +
        `outputMint=${outputMint}&` +
        `amount=${amount}&` +
        `slippageBps=${slippageBps}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Quote API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("❌ Failed to get Jupiter quote:", error);
      return null;
    }
  }

  /**
   * Execute swap transaction via Jupiter
   */
  private async executeJupiterSwap(
    quote: JupiterQuoteResponse,
  ): Promise<string | null> {
    try {
      // Get swap transaction
      const swapResponse = await fetch("https://quote-api.jup.ag/v6/swap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quoteResponse: quote,
          userPublicKey: this.adminWallet.publicKey.toString(),
          wrapAndUnwrapSol: true,
          dynamicComputeUnitLimit: true,
          prioritizationFeeLamports: "auto",
        }),
      });

      if (!swapResponse.ok) {
        throw new Error(`Swap API error: ${swapResponse.status}`);
      }

      const swapData: JupiterSwapResponse = await swapResponse.json();

      // Deserialize and sign transaction
      const swapTransactionBuf = Buffer.from(
        swapData.swapTransaction,
        "base64",
      );
      const transaction = VersionedTransaction.deserialize(swapTransactionBuf);

      // Sign with admin wallet
      transaction.sign([this.adminWallet.payer]);

      // Send transaction
      const signature = await this.connection.sendTransaction(transaction);

      // Wait for confirmation
      await this.connection.confirmTransaction(signature, "confirmed");

      console.log("✅ Jupiter swap confirmed:", signature);
      return signature;
    } catch (error) {
      console.error("❌ Failed to execute Jupiter swap:", error);
      return null;
    }
  }

  /**
   * Distribute USDC to user after successful swap
   */
  private async distributeUsdcToUser(
    recipient: PublicKey,
    amount: BN,
  ): Promise<void> {
    try {
      console.log("💸 Distributing USDC to user:", {
        recipient: recipient.toString(),
        amount: amount.toString(),
      });

      const mysteryBoxPDA = new PublicKey(MYSTERY_BOX_CONFIG.PDA);
      const usdcMint = TOKEN_MINTS.USDC;

      // Get program and user USDC accounts
      const programUsdcAccount = await getAssociatedTokenAddress(
        usdcMint,
        mysteryBoxPDA,
        true,
      );

      let userUsdcAccount;
      try {
        userUsdcAccount = await getAssociatedTokenAddress(usdcMint, recipient);
      } catch {
        // Create user USDC account if it doesn't exist
        userUsdcAccount = await createAssociatedTokenAccount(
          this.connection,
          this.adminWallet.payer,
          usdcMint,
          recipient,
        );
      }

      // Call distribute_usdc on the program
      const tx = await this.program.methods
        .distributeUsdcDirect(amount, recipient)
        .accounts({
          mysteryBox: mysteryBoxPDA,
          user: this.adminWallet.publicKey,
          programUsdcAccount: programUsdcAccount,
          recipientUsdcAccount: userUsdcAccount,
          usdcMint: usdcMint,
          tokenProgram: TOKEN_PROGRAM_ID,
        } as any)
        .rpc();

      console.log("✅ USDC distributed successfully:", tx);
      console.log(
        "🔗 View on Solscan:",
        `https://solscan.io/tx/${tx}?cluster=devnet`,
      );
    } catch (error) {
      console.error("❌ Failed to distribute USDC:", error);
    }
  }

  /**
   * Deposit USDC to program (admin function)
   */
  public async depositUsdcToProgram(amount: BN): Promise<string | null> {
    try {
      console.log("💰 Depositing USDC to program:", amount.toString());

      const mysteryBoxPDA = new PublicKey(MYSTERY_BOX_CONFIG.PDA);
      const usdcMint = TOKEN_MINTS.USDC;

      const adminUsdcAccount = await getAssociatedTokenAddress(
        usdcMint,
        this.adminWallet.publicKey,
      );

      const programUsdcAccount = await getAssociatedTokenAddress(
        usdcMint,
        mysteryBoxPDA,
        true,
      );

      const tx = await this.program.methods
        .depositUsdc(amount)
        .accounts({
          mysteryBox: mysteryBoxPDA,
          user: this.adminWallet.publicKey,
          adminUsdcAccount: adminUsdcAccount,
          programUsdcAccount: programUsdcAccount,
          usdcMint: usdcMint,
          tokenProgram: TOKEN_PROGRAM_ID,
        } as any)
        .rpc();

      console.log("✅ USDC deposited to program:", tx);
      return tx;
    } catch (error) {
      console.error("❌ Failed to deposit USDC:", error);
      return null;
    }
  }

  /**
   * Get program balances
   */
  public async getProgramBalances(): Promise<any> {
    try {
      const mysteryBoxPDA = new PublicKey(MYSTERY_BOX_CONFIG.PDA);
      const usdcMint = TOKEN_MINTS.USDC;

      const programUsdcAccount = await getAssociatedTokenAddress(
        usdcMint,
        mysteryBoxPDA,
        true,
      );

      const tx = await this.program.methods
        .getProgramBalances()
        .accounts({
          mysteryBox: mysteryBoxPDA,
          programUsdcAccount: programUsdcAccount,
          usdcMint: usdcMint,
        } as any)
        .rpc();

      console.log("📊 Program balances queried:", tx);
      return tx;
    } catch (error) {
      console.error("❌ Failed to get program balances:", error);
      return null;
    }
  }

  /**
   * Check if processor is running
   */
  public isRunning(): boolean {
    return this.isProcessing;
  }
}

// Singleton instance
let swapProcessorInstance: SwapProcessor | null = null;

/**
 * Get or create swap processor instance
 */
export function getSwapProcessor(
  connection: Connection,
  adminWallet: Wallet,
): SwapProcessor {
  if (!swapProcessorInstance) {
    swapProcessorInstance = new SwapProcessor(connection, adminWallet);
  }
  return swapProcessorInstance;
}

/**
 * Initialize and start swap processing
 */
export async function initializeSwapProcessor(
  connection: Connection,
  adminWallet: Wallet,
): Promise<SwapProcessor> {
  const processor = getSwapProcessor(connection, adminWallet);

  if (!processor.isRunning()) {
    processor.startProcessing();
  }

  return processor;
}
