"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wallet, ExternalLink } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletName } from "@solana/wallet-adapter-base";
import Image from "next/image";

interface CustomWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Remove custom icons mapping since we'll use adapter icons

const WALLET_DESCRIPTIONS: Record<string, string> = {
  Phantom: "The trusted crypto wallet for DeFi & NFTs on Solana",
  Solflare: "Solflare is a non-custodial wallet for Solana",
  Torus: "Open source wallet infrastructure for mainstream adoption",
  Ledger: "Hardware wallet with advanced security features",
  Coin98: "The #1 crypto super app designed to seamlessly connect users",
  MathWallet: "Multi-platform crypto wallet for Web3 applications",
};

export const CustomWalletModal: React.FC<CustomWalletModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { wallets, select, connecting, connected } = useWallet();
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);

  useEffect(() => {
    if (connected) {
      onClose();
    }
  }, [connected, onClose]);

  const handleWalletSelect = async (walletName: WalletName) => {
    try {
      setSelectedWallet(walletName);
      select(walletName);
    } catch (error) {
      console.error("Failed to select wallet:", error);
      setSelectedWallet(null);
    }
  };

  const WalletIcon = ({ wallet }: { wallet: any }) => {
    const [iconSrc, setIconSrc] = useState<string>("");

    useEffect(() => {
      // Use the adapter icon directly - this contains the original wallet logo
      if (wallet.adapter.icon) {
        setIconSrc(wallet.adapter.icon);
      } else {
        // Fallback to default if no icon available
        setIconSrc("/wallets/default.svg");
      }
    }, [wallet]);

    const handleError = () => {
      // On error, fallback to default icon
      setIconSrc("/wallets/default.svg");
    };

    return (
      <div className="w-12 h-12 flex items-center justify-center">
        <img
          src={iconSrc}
          alt={wallet.adapter.name}
          className="w-full h-full object-contain"
          onError={handleError}
          style={{
            background: "transparent",
            backgroundColor: "transparent",
            mixBlendMode: "normal",
          }}
        />
      </div>
    );
  };

  const getWalletDescription = (walletName: string) => {
    return WALLET_DESCRIPTIONS[walletName] || "Secure wallet for Solana";
  };

  const isWalletInstalled = (wallet: any) => {
    return wallet.readyState === "Installed";
  };

  const getWalletUrl = (walletName: string) => {
    const urls: Record<string, string> = {
      Phantom: "https://phantom.app/",
      Solflare: "https://solflare.com/",
      Torus: "https://tor.us/",
      Ledger: "https://www.ledger.com/",
      Coin98: "https://coin98.com/",
      MathWallet: "https://mathwallet.org/",
    };
    return urls[walletName] || "#";
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/80" />

        {/* Modal content */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          transition={{
            type: "spring",
            damping: 30,
            stiffness: 400,
            duration: 0.3,
          }}
          className="relative bg-terminal-black border-2 border-terminal-green font-mono text-terminal-green max-w-lg w-full max-h-[80vh] overflow-hidden shadow-2xl"
          style={{
            clipPath:
              "polygon(15px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 15px)",
            boxShadow:
              "0 0 50px rgba(34, 229, 132, 0.3), inset 0 0 20px rgba(34, 229, 132, 0.1)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b border-terminal-green px-6 py-4 flex items-center justify-between bg-terminal-black relative">
            <div className="flex items-center gap-3">
              <Wallet size={24} className="text-terminal-green" />
              <h2 className="text-lg font-bold uppercase tracking-wide text-terminal-green">
                Connect Wallet
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-terminal-green-dark hover:text-terminal-green transition-colors duration-200"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar bg-terminal-black">
            <div className="space-y-4">
              {wallets.map((wallet, index) => {
                const isInstalled = isWalletInstalled(wallet);
                const isConnecting =
                  connecting && selectedWallet === wallet.adapter.name;

                return (
                  <motion.div
                    key={wallet.adapter.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.2 }}
                    className={`
                      relative border border-terminal-green bg-terminal-black
                      hover:bg-terminal-green-hover hover:border-terminal-green-light
                      transition-all duration-200 cursor-pointer group
                      ${isConnecting ? "opacity-60" : ""}
                    `}
                    style={{
                      clipPath:
                        "polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)",
                    }}
                    onClick={() =>
                      !isConnecting && handleWalletSelect(wallet.adapter.name)
                    }
                  >
                    <div className="p-4 flex items-center gap-4 relative">
                      {/* Wallet Icon */}
                      <div className="flex-shrink-0 relative">
                        <WalletIcon wallet={wallet} />
                      </div>

                      {/* Wallet Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-terminal-white truncate">
                            {wallet.adapter.name}
                          </h3>
                          {!isInstalled && (
                            <a
                              href={getWalletUrl(wallet.adapter.name)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-terminal-green-dark hover:text-terminal-green transition-colors duration-200"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                        <p className="text-xs text-terminal-green-dark mt-1 truncate">
                          {getWalletDescription(wallet.adapter.name)}
                        </p>
                      </div>

                      {/* Status */}
                      <div className="flex-shrink-0 text-right">
                        {isConnecting ? (
                          <div className="text-xs text-terminal-orange font-bold">
                            Connecting...
                          </div>
                        ) : isInstalled ? (
                          <div className="text-xs text-terminal-green font-bold">
                            INSTALLED
                          </div>
                        ) : (
                          <div className="text-xs text-terminal-red font-bold">
                            NOT INSTALLED
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Subtle hover effect */}
                    <div className="absolute inset-0 bg-terminal-green opacity-0 group-hover:opacity-5 transition-opacity duration-200 pointer-events-none" />
                  </motion.div>
                );
              })}
            </div>

            {wallets.length === 0 && (
              <div className="text-center py-8">
                <Wallet
                  size={48}
                  className="mx-auto text-terminal-green-dark mb-4"
                />
                <p className="text-terminal-green-dark text-sm">
                  No wallets detected. Please install a Solana wallet.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-terminal-green px-6 py-4 bg-terminal-black">
            <div className="text-xs text-terminal-green-dark text-center">
              <p>
                By connecting a wallet, you agree to our{" "}
                <span className="text-terminal-green cursor-pointer hover:underline">
                  Terms of Service
                </span>{" "}
                and{" "}
                <span className="text-terminal-green cursor-pointer hover:underline">
                  Privacy Policy
                </span>
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CustomWalletModal;
