"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import Button from "../ui/button";
import { ChevronDown } from "lucide-react";
import { CustomWalletModal } from "../ui/CustomWalletModal";

interface UnifiedWalletButtonProps {
  className?: string;
}

export function UnifiedWalletButton({
  className = "",
}: UnifiedWalletButtonProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { connected, connecting, wallet, publicKey, disconnect } = useWallet();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <Button
        value="Loading..."
        variant="primary"
        disabled
        rightIcon={<ChevronDown size={16} />}
        className={className}
      />
    );
  }

  const handleConnect = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const getWalletDisplayName = () => {
    if (wallet?.adapter?.name) {
      return wallet.adapter.name;
    }
    if (publicKey) {
      return `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`;
    }
    return "Unknown";
  };

  return (
    <>
      {connected ? (
        <Button
          onClick={handleDisconnect}
          value={getWalletDisplayName()}
          variant="primary"
          rightIcon={<ChevronDown size={16} />}
          className={className}
          data-testid="disconnect-wallet-button"
        />
      ) : connecting ? (
        <Button
          value="Connecting..."
          variant="primary"
          disabled
          rightIcon={<ChevronDown size={16} />}
          className={className}
        />
      ) : (
        <Button
          onClick={handleConnect}
          value="Connect Wallet_"
          variant="primary"
          rightIcon={<ChevronDown size={16} />}
          className={className}
          data-testid="connect-wallet-button"
        />
      )}

      <CustomWalletModal isOpen={showModal} onClose={handleCloseModal} />
    </>
  );
}

export default UnifiedWalletButton;
