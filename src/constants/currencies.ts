export interface Currency {
  name: string;
  code: string;
  address: string;
  decimals: number;
  isNative?: boolean;
}

// Solana tokens supported by the Blue Box
export const currencies: Currency[] = [
  {
    name: "None",
    code: "None",
    address: "",
    decimals: 9,
  },
  {
    name: "Solana",
    code: "SOL",
    address: "",
    decimals: 9,
    isNative: true,
  },
  {
    name: "Jupiter Token",
    code: "JUP",
    address: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
    decimals: 6,
  },
  {
    name: "USD Coin",
    code: "USDC",
    address: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU", // USDC Devnet
    decimals: 6,
  },
];

// Solana program addresses
export const solanaAddresses = {
  mysteryBoxProgramId: "FDXxJHprFRFf293SMGkB8pdDMbM4zaxw9ykuqvATihEs",
  jupiterTokenMint: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
  usdcTokenMint: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
};

// Box configuration for Blue Box (Solana)
export const getBoxId = (boxType: string): number => {
  return 0; // Only Blue Box is supported
};

// Supported tokens for Blue Box
export const getSupportedTokens = (boxType: string): string[] => {
  return ["None", "SOL", "JUP"];
};

// Always returns Solana since we only support Blue Box
export const getBlockchainType = (boxType: string): "solana" => {
  return "solana";
};
