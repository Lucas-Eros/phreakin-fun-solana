/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/mystery_box_solana.json`.
 */
export type MysteryBoxSolana = {
  address: "FDXxJHprFRFf293SMGkB8pdDMbM4zaxw9ykuqvATihEs";
  metadata: {
    name: "mysteryBoxSolana";
    version: "0.1.0";
    spec: "0.1.0";
    description: "Created with Anchor";
  };
  instructions: [
    {
      name: "batchDistributeUsdc";
      discriminator: [103, 17, 200, 25, 118, 95, 125, 61];
      accounts: [
        {
          name: "mysteryBox";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [109, 121, 115, 116, 101, 114, 121, 95, 98, 111, 120];
              },
            ];
          };
        },
        {
          name: "user";
          writable: true;
          signer: true;
        },
        {
          name: "programUsdcAccount";
          writable: true;
        },
        {
          name: "usdcMint";
        },
        {
          name: "tokenProgram";
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
        },
      ];
      args: [
        {
          name: "totalRecipients";
          type: "u64";
        },
        {
          name: "recipients";
          type: {
            vec: "pubkey";
          };
        },
        {
          name: "amounts";
          type: {
            vec: "u64";
          };
        },
      ];
    },
    {
      name: "convertSolToUsdcOnchain";
      discriminator: [191, 204, 149, 234, 213, 165, 13, 65];
      accounts: [
        {
          name: "mysteryBox";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [109, 121, 115, 116, 101, 114, 121, 95, 98, 111, 120];
              },
            ];
          };
        },
        {
          name: "user";
          writable: true;
          signer: true;
        },
        {
          name: "programWsolAccount";
          writable: true;
        },
        {
          name: "programUsdcAccount";
          writable: true;
        },
        {
          name: "wsolMint";
        },
        {
          name: "usdcMint";
        },
        {
          name: "tokenProgram";
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
      ];
      args: [
        {
          name: "solAmount";
          type: "u64";
        },
        {
          name: "minimumUsdcOut";
          type: "u64";
        },
      ];
    },
    {
      name: "depositUsdc";
      discriminator: [184, 148, 250, 169, 224, 213, 34, 126];
      accounts: [
        {
          name: "mysteryBox";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [109, 121, 115, 116, 101, 114, 121, 95, 98, 111, 120];
              },
            ];
          };
        },
        {
          name: "user";
          writable: true;
          signer: true;
        },
        {
          name: "adminUsdcAccount";
          writable: true;
        },
        {
          name: "programUsdcAccount";
          writable: true;
        },
        {
          name: "usdcMint";
        },
        {
          name: "tokenProgram";
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
        },
      ];
      args: [
        {
          name: "amount";
          type: "u64";
        },
      ];
    },
    {
      name: "distributeUsdcDirect";
      discriminator: [66, 188, 51, 188, 104, 51, 101, 92];
      accounts: [
        {
          name: "mysteryBox";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [109, 121, 115, 116, 101, 114, 121, 95, 98, 111, 120];
              },
            ];
          };
        },
        {
          name: "user";
          writable: true;
          signer: true;
        },
        {
          name: "programUsdcAccount";
          writable: true;
        },
        {
          name: "recipientUsdcAccount";
          writable: true;
        },
        {
          name: "usdcMint";
        },
        {
          name: "tokenProgram";
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
        },
      ];
      args: [
        {
          name: "amount";
          type: "u64";
        },
        {
          name: "recipient";
          type: "pubkey";
        },
      ];
    },
    {
      name: "getProgramBalances";
      discriminator: [153, 183, 239, 179, 253, 7, 90, 45];
      accounts: [
        {
          name: "mysteryBox";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [109, 121, 115, 116, 101, 114, 121, 95, 98, 111, 120];
              },
            ];
          };
        },
        {
          name: "programUsdcAccount";
        },
        {
          name: "usdcMint";
        },
      ];
      args: [];
    },
    {
      name: "initialize";
      discriminator: [175, 175, 109, 31, 13, 152, 155, 237];
      accounts: [
        {
          name: "mysteryBox";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [109, 121, 115, 116, 101, 114, 121, 95, 98, 111, 120];
              },
            ];
          };
        },
        {
          name: "user";
          writable: true;
          signer: true;
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
      ];
      args: [
        {
          name: "admin";
          type: "pubkey";
        },
      ];
    },
    {
      name: "purchaseBoxWithJupAutoSimple";
      discriminator: [176, 116, 116, 238, 17, 125, 252, 70];
      accounts: [
        {
          name: "mysteryBox";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [109, 121, 115, 116, 101, 114, 121, 95, 98, 111, 120];
              },
            ];
          };
        },
        {
          name: "user";
          writable: true;
          signer: true;
        },
        {
          name: "userJupAccount";
          writable: true;
        },
        {
          name: "programJupAccount";
          writable: true;
        },
        {
          name: "programUsdcAccount";
          writable: true;
        },
        {
          name: "userUsdcAccount";
          writable: true;
        },
        {
          name: "jupMint";
        },
        {
          name: "usdcMint";
        },
        {
          name: "tokenProgram";
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
        },
      ];
      args: [
        {
          name: "jupAmount";
          type: "u64";
        },
      ];
    },
    {
      name: "purchaseBoxWithSol";
      discriminator: [227, 36, 149, 131, 3, 74, 222, 112];
      accounts: [
        {
          name: "mysteryBox";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [109, 121, 115, 116, 101, 114, 121, 95, 98, 111, 120];
              },
            ];
          };
        },
        {
          name: "user";
          writable: true;
          signer: true;
        },
        {
          name: "feeWallet";
          writable: true;
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
      ];
      args: [
        {
          name: "amount";
          type: "u64";
        },
      ];
    },
    {
      name: "purchaseBoxWithSolAutoSimple";
      discriminator: [253, 68, 118, 129, 234, 119, 57, 9];
      accounts: [
        {
          name: "mysteryBox";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [109, 121, 115, 116, 101, 114, 121, 95, 98, 111, 120];
              },
            ];
          };
        },
        {
          name: "user";
          writable: true;
          signer: true;
        },
        {
          name: "feeWallet";
          writable: true;
        },
        {
          name: "programUsdcAccount";
          writable: true;
        },
        {
          name: "userUsdcAccount";
          writable: true;
        },
        {
          name: "usdcMint";
        },
        {
          name: "tokenProgram";
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
      ];
      args: [
        {
          name: "solAmount";
          type: "u64";
        },
      ];
    },
    {
      name: "purchaseBoxWithToken";
      discriminator: [164, 140, 44, 200, 15, 135, 132, 32];
      accounts: [
        {
          name: "mysteryBox";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [109, 121, 115, 116, 101, 114, 121, 95, 98, 111, 120];
              },
            ];
          };
        },
        {
          name: "user";
          writable: true;
          signer: true;
        },
        {
          name: "userTokenAccount";
          writable: true;
        },
        {
          name: "programTokenAccount";
          writable: true;
        },
        {
          name: "tokenMint";
        },
        {
          name: "tokenProgram";
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
        },
      ];
      args: [
        {
          name: "amount";
          type: "u64";
        },
      ];
    },
    {
      name: "setActive";
      discriminator: [29, 16, 225, 132, 38, 216, 206, 33];
      accounts: [
        {
          name: "mysteryBox";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [109, 121, 115, 116, 101, 114, 121, 95, 98, 111, 120];
              },
            ];
          };
        },
        {
          name: "user";
          signer: true;
        },
      ];
      args: [
        {
          name: "isActive";
          type: "bool";
        },
      ];
    },
    {
      name: "withdrawSol";
      discriminator: [145, 131, 74, 136, 65, 137, 42, 38];
      accounts: [
        {
          name: "mysteryBox";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [109, 121, 115, 116, 101, 114, 121, 95, 98, 111, 120];
              },
            ];
          };
        },
        {
          name: "user";
          writable: true;
          signer: true;
        },
      ];
      args: [
        {
          name: "amount";
          type: "u64";
        },
      ];
    },
  ];
  accounts: [
    {
      name: "mysteryBox";
      discriminator: [84, 58, 85, 105, 241, 51, 143, 79];
    },
  ];
  events: [
    {
      name: "batchDistributionStarted";
      discriminator: [145, 249, 69, 48, 206, 86, 91, 66];
    },
    {
      name: "boxPurchased";
      discriminator: [217, 85, 167, 76, 252, 235, 174, 172];
    },
    {
      name: "boxPurchasedAutomatic";
      discriminator: [27, 220, 101, 138, 122, 174, 80, 104];
    },
    {
      name: "onchainSwapRequested";
      discriminator: [134, 40, 102, 142, 143, 143, 189, 249];
    },
    {
      name: "programBalances";
      discriminator: [199, 225, 109, 190, 164, 42, 135, 50];
    },
    {
      name: "solWithdrawn";
      discriminator: [145, 249, 69, 48, 206, 86, 91, 66];
    },
    {
      name: "swapRequested";
      discriminator: [134, 40, 102, 142, 143, 143, 189, 249];
    },
    {
      name: "usdcDeposited";
      discriminator: [180, 188, 183, 1, 208, 145, 174, 124];
    },
    {
      name: "usdcDistributed";
      discriminator: [253, 234, 148, 188, 79, 29, 170, 182];
    },
  ];
  errors: [
    {
      code: 6000;
      name: "ContractInactive";
      msg: "Contract is not active";
    },
    {
      code: 6001;
      name: "InvalidAmount";
      msg: "Invalid amount";
    },
    {
      code: 6002;
      name: "Unauthorized";
      msg: "Unauthorized";
    },
    {
      code: 6003;
      name: "InsufficientBalance";
      msg: "Insufficient balance";
    },
    {
      code: 6004;
      name: "SwapFailed";
      msg: "Swap failed";
    },
    {
      code: 6005;
      name: "MinimumOutputNotMet";
      msg: "Minimum output not met";
    },
  ];
  types: [
    {
      name: "BatchDistributionStarted";
      type: {
        kind: "struct";
        fields: [
          {
            name: "totalRecipients";
            type: "u64";
          },
          {
            name: "totalAmount";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "BoxPurchased";
      type: {
        kind: "struct";
        fields: [
          {
            name: "user";
            type: "pubkey";
          },
          {
            name: "amount";
            type: "u64";
          },
          {
            name: "feeAmount";
            type: "u64";
          },
          {
            name: "tokenType";
            type: {
              defined: {
                name: "TokenType";
              };
            };
          },
        ];
      };
    },
    {
      name: "BoxPurchasedAutomatic";
      type: {
        kind: "struct";
        fields: [
          {
            name: "user";
            type: "pubkey";
          },
          {
            name: "solAmount";
            type: "u64";
          },
          {
            name: "feeAmount";
            type: "u64";
          },
          {
            name: "swapAmount";
            type: "u64";
          },
          {
            name: "usdcReceived";
            type: "u64";
          },
          {
            name: "tokenType";
            type: {
              defined: {
                name: "TokenType";
              };
            };
          },
        ];
      };
    },
    {
      name: "MysteryBox";
      type: {
        kind: "struct";
        fields: [
          {
            name: "admin";
            type: "pubkey";
          },
          {
            name: "bump";
            type: "u8";
          },
          {
            name: "isActive";
            type: "bool";
          },
          {
            name: "totalSolReceived";
            type: "u64";
          },
          {
            name: "totalFeeCollected";
            type: "u64";
          },
          {
            name: "totalUsdcDistributed";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "OnchainSwapRequested";
      type: {
        kind: "struct";
        fields: [
          {
            name: "user";
            type: "pubkey";
          },
          {
            name: "inputAmount";
            type: "u64";
          },
          {
            name: "inputToken";
            type: "string";
          },
          {
            name: "outputToken";
            type: "string";
          },
          {
            name: "minimumAmountOut";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "ProgramBalances";
      type: {
        kind: "struct";
        fields: [
          {
            name: "solBalance";
            type: "u64";
          },
          {
            name: "usdcBalance";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "SolWithdrawn";
      type: {
        kind: "struct";
        fields: [
          {
            name: "admin";
            type: "pubkey";
          },
          {
            name: "amount";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "SwapRequested";
      type: {
        kind: "struct";
        fields: [
          {
            name: "user";
            type: "pubkey";
          },
          {
            name: "inputAmount";
            type: "u64";
          },
          {
            name: "inputToken";
            type: "string";
          },
          {
            name: "outputToken";
            type: "string";
          },
        ];
      };
    },
    {
      name: "TokenType";
      type: {
        kind: "enum";
        variants: [
          {
            name: "Sol";
          },
          {
            name: "Jup";
          },
        ];
      };
    },
    {
      name: "UsdcDeposited";
      type: {
        kind: "struct";
        fields: [
          {
            name: "admin";
            type: "pubkey";
          },
          {
            name: "amount";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "UsdcDistributed";
      type: {
        kind: "struct";
        fields: [
          {
            name: "recipient";
            type: "pubkey";
          },
          {
            name: "amount";
            type: "u64";
          },
        ];
      };
    },
  ];
};
