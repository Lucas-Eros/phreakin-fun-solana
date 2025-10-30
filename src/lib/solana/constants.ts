import { PublicKey } from "@solana/web3.js";

// Program constants
export const MYSTERY_BOX_PROGRAM_ID = new PublicKey(
  "FDXxJHprFRFf293SMGkB8pdDMbM4zaxw9ykuqvATihEs",
);
export const MYSTERY_BOX_PDA = new PublicKey(
  "9fBf6qWFQoxn9TyvsSB25SNe1aopBMs1qohwEVeMfHHk",
);
export const FEE_WALLET = new PublicKey(
  "HKAkT4mCBkWEX4TsKXVHZEWEo4R7B81Vh9omBqoWp2Pt",
);

// Fee configuration
export const FEE_PERCENTAGE = 5; // 5%
export const BASIS_POINTS = 10000;
export const FEE_BASIS_POINTS = 500; // 5% in basis points

// Token mints (Devnet)
export const TOKEN_MINTS = {
  SOL: PublicKey.default, // Native SOL doesn't have a mint
  WSOL: new PublicKey("So11111111111111111111111111111111111111112"),
  USDC: new PublicKey("Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr"), // User's USDC-Dev token
  JUP: new PublicKey("ByJUP3XrpVdYKNkPS27Gz8VV3UBgT8K7Tc4RsoZcWvWa"),
} as const;

// Token decimals
export const TOKEN_DECIMALS = {
  SOL: 9,
  WSOL: 9,
  USDC: 6,
  JUP: 6,
} as const;

// Jupiter API configuration
export const JUPITER_API = {
  BASE_URL: "https://quote-api.jup.ag/v6",
  SWAP_URL: "https://quote-api.jup.ag/v6/swap",
  QUOTE_URL: "https://quote-api.jup.ag/v6/quote",
} as const;

// Slippage configuration
export const DEFAULT_SLIPPAGE_BPS = 50; // 0.5%

// Network configurations
export const NETWORKS = {
  MAINNET: {
    name: "mainnet-beta",
    url: "https://api.mainnet-beta.solana.com",
  },
  DEVNET: {
    name: "devnet",
    url: "https://api.devnet.solana.com",
  },
  TESTNET: {
    name: "testnet",
    url: "https://api.testnet.solana.com",
  },
} as const;

// Current deployment configuration
export const MYSTERY_BOX_CONFIG = {
  PROGRAM_ID: "FDXxJHprFRFf293SMGkB8pdDMbM4zaxw9ykuqvATihEs",
  PDA: "9fBf6qWFQoxn9TyvsSB25SNe1aopBMs1qohwEVeMfHHk",
  FEE_WALLET: "HKAkT4mCBkWEX4TsKXVHZEWEo4R7B81Vh9omBqoWp2Pt",
  FEE_PERCENTAGE: 5,
  NETWORK: "devnet",
  RPC_URL: "https://api.devnet.solana.com",
  ADMIN: "BhAboxDRk49oMJy84vgpDfYyg7YJB7uENsPyhL1ckDUv",
} as const;

// PDA seeds
export const SEEDS = {
  MYSTERY_BOX: "mystery_box",
} as const;

// Transaction timeouts
export const TRANSACTION_TIMEOUT = 60000; // 60 seconds

// Supported tokens for purchase
export const SUPPORTED_TOKENS = ["SOL", "JUP"] as const;

export type SupportedToken = (typeof SUPPORTED_TOKENS)[number];

// Minimum amounts (in base units)
export const MINIMUM_AMOUNTS = {
  SOL: 0.01, // 0.01 SOL
  JUP: 1, // 1 JUP
} as const;

// Maximum amounts (in base units)
export const MAXIMUM_AMOUNTS = {
  SOL: 100, // 100 SOL
  JUP: 1000000, // 1M JUP
} as const;

// Fixed conversion rates for simple auto conversion
export const FIXED_CONVERSION_RATES = {
  SOL_TO_USDC: 200, // 1 SOL = 200 USDC
  JUP_TO_USDC: 1.5, // 1 JUP = 1.5 USDC
} as const;

// Auto conversion function names
export const AUTO_CONVERSION_FUNCTIONS = {
  SOL: "purchaseBoxWithSolAutoSimple",
  JUP: "purchaseBoxWithJupAutoSimple",
} as const;

// Error messages
export const ERROR_MESSAGES = {
  INSUFFICIENT_BALANCE: "Insufficient balance for transaction",
  INVALID_AMOUNT: "Invalid amount specified",
  UNSUPPORTED_TOKEN: "Token not supported for purchase",
  CONTRACT_INACTIVE: "Mystery box contract is not active",
  UNAUTHORIZED: "Unauthorized operation",
  SWAP_FAILED: "Token swap failed",
  NETWORK_ERROR: "Network connection error",
  TRANSACTION_FAILED: "Transaction failed to process",
} as const;

// Event names
export const EVENTS = {
  BOX_PURCHASED: "boxPurchased",
} as const;

// Box types (for future expansion)
export const BOX_TYPES = {
  BLUE_BOX: 0,
  RED_BOX: 1,
  GOLD_BOX: 2,
} as const;

export type BoxType = (typeof BOX_TYPES)[keyof typeof BOX_TYPES];
