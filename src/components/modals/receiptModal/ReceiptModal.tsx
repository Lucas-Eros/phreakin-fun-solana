import React, { useState, useEffect } from "react";
import Image from "next/image";
import Button from "@/components/ui/button";
import { ArrowRightIcon, X } from "lucide-react";
import { ProgressBar } from "@/components/ui/progressBar";
import SliderButton from "@/components/ui/SliderButton";
import FrameXReceiptModal from "./FrameXReceiptModal";
import FrameYReceiptModal from "./FrameYReceiptModal";
import FrameReceiptModal from "./FrameReceiptModal";
import { useMysteryBoxStore } from "@/stores";

interface ReceiptModalProps {
  boxImage: string;
  coinIcon: string;
  coinName: string;
  amount: string;
  usdcReceived?: number;
  transactionSignature?: string;
  onClose: () => void;
  onRestake: () => void;
  children?: React.ReactNode;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({
  boxImage,
  coinIcon,
  coinName,
  amount,
  usdcReceived,
  transactionSignature,
  onClose,
  onRestake,
  children,
}) => {
  const [isSliderSwiped, setIsSliderSwiped] = useState(false);

  const state = useMysteryBoxStore();

  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  const decodeTransactionData = () => {
    const rewards = state.rewards || [];
    const primaryReward = rewards.length > 0 ? rewards[0] : null;

    return {
      rewardToken: primaryReward?.tokenSymbol || "USDC",
      rewardAmount: primaryReward?.formattedValue || "0.000000",
      rewardIcon: getTokenIcon(primaryReward?.tokenSymbol || "USDC"),
      solValue: "0.001",
      boxType: "Blue Box",
      boxId: 0,
      rentUsed: "0",
      computeUnits: "200000",
      timestamp: new Date().toISOString(),
      status: state.step === "finished" ? "SUCCESS" : "PENDING",
      totalRewards: rewards.length,
    };
  };

  const getTokenIcon = (tokenSymbol: string) => {
    switch (tokenSymbol.toUpperCase()) {
      case "SOL":
        return "/tokens/solana.svg";
      case "USDC":
        return "/tokens/usdc.png";
      case "USDT":
        return "/tokens/usdt.svg";
      case "JUP":
        return "/tokens/jupiter.svg";
      default:
        return "/tokens/usdc.png";
    }
  };

  const getRewardData = () => {
    // Always use the store value for USDC received if available
    const storeUsdcReceived = state.usdcReceived;

    if (state.transactionHash) {
      const decodedData = decodeTransactionData();
      // Override with store value if available
      if (storeUsdcReceived !== undefined && storeUsdcReceived !== null) {
        decodedData.rewardAmount = storeUsdcReceived.toFixed(2);
        decodedData.rewardToken = "USDC";
        decodedData.rewardIcon = "/tokens/usdc.png";
      }
      return decodedData;
    }

    return {
      rewardToken: coinName || "USDC",
      rewardAmount:
        storeUsdcReceived !== null && storeUsdcReceived !== undefined
          ? storeUsdcReceived.toFixed(2)
          : usdcReceived
            ? usdcReceived.toFixed(2)
            : amount || "0.00",
      rewardIcon: coinIcon || "/tokens/usdc.png",
      solValue: "0.001",
      boxType: "Blue Box",
      boxId: 0,
      rentUsed: "0",
      computeUnits: "200000",
      timestamp: new Date().toISOString(),
      status: "PENDING",
    };
  };

  const rewardData = getRewardData();

  const actualSignature = transactionSignature || state.transactionHash;
  const displayHash = actualSignature
    ? `${actualSignature.replace(/^0x/, "").slice(0, 6)}...${actualSignature.replace(/^0x/, "").slice(-16)}`
    : "0000...0000";

  const copyHashToClipboard = () => {
    const signatureToCopy = transactionSignature || state.transactionHash;
    if (signatureToCopy) {
      navigator.clipboard.writeText(signatureToCopy.replace(/^0x/, ""));
    }
  };

  const getExplorerUrl = () => {
    const signatureToUse = transactionSignature || state.transactionHash;
    if (!signatureToUse) return "#";

    // Remove '0x' prefix if present since Solana signatures don't use it
    const signature = signatureToUse.replace(/^0x/, "");
    return `https://solscan.io/tx/${signature}?cluster=devnet`;
  };

  const explorerUrl = getExplorerUrl();

  const getExplorerName = () => {
    return "Solscan";
  };

  const handleRestake = () => {
    onRestake();
    setIsSliderSwiped(false);
  };

  const handleViewOnExplorer = () => {
    const signatureToUse = transactionSignature || state.transactionHash;
    if (signatureToUse) {
      window.open(explorerUrl, "_blank");
    }
  };

  const CLIP_PATH =
    "polygon(25px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 25px)";

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center bg-terminal-black/80 z-50">
        <div className="relative w-[1020px] h-[700px] mx-auto">
          <FrameReceiptModal position="left" />
          <FrameReceiptModal position="right" />
          <div
            className="font-mono text-terminal-white p-[1px] bg-terminal-green"
            style={{ clipPath: CLIP_PATH }}
          >
            <div
              className="bg-terminal-black"
              style={{ width: 1020, height: 700, clipPath: CLIP_PATH }}
            >
              <div className="relative h-10 border-b border-terminal-green flex items-center justify-between px-6">
                <span className="text-terminal-green font-bold text-sm uppercase">
                  RECEIPT
                </span>
                <button
                  onClick={onClose}
                  className="flex items-center gap-2 group"
                >
                  <span className="text-terminal-gray-light font-bold text-sm group-hover:underline">
                    EXIT
                  </span>
                  <X
                    size={16}
                    className="text-terminal-gray-light transition-colors hover:text-terminal-green-light"
                  />
                </button>
              </div>

              <div className="flex flex-col p-6 justify-between h-full">
                <div className="text-terminal-gray-light text-base flex items-center gap-1 cursor-pointer">
                  <span>
                    <Image
                      src="/backArrow.svg"
                      alt="arrow-left"
                      width={16}
                      height={16}
                    />
                  </span>
                  [GO BACK]
                </div>
                <div className="flex flex-row p-4 justify-between h-full items-center gap-4">
                  <div className="flex flex-col gap-4 w-[320px] min-w-[280px] max-w-[340px] justify-center">
                    <div className="flex flex-col gap-3 pb-4">
                      <div className="flex items-center gap-2">
                        <Image
                          src="/code-one.svg"
                          alt="code-one"
                          width={55}
                          height={55}
                        />
                        <div className="uppercase tracking-widest text-xs text-terminal-green">
                          CONSOLE 1
                          <div className="text-terminal-green-light text-base">
                            TERMINAL
                          </div>
                        </div>
                      </div>
                      <ProgressBar animationType={"leftToRight"} />
                    </div>
                    <div className="text-terminal-gray-light text-base">
                      INITIALIZING PHREAKIN BOX <br /> SEQUENCE...
                    </div>
                    <div className="text-terminal-green text-base">
                      → DECRYPTING REWARD PAYLOAD... [██████████] 100% COMPLETE
                    </div>
                    <div className="text-terminal-green text-base">
                      <div className="flex flex-row gap-2">
                        <Image
                          src="/check.svg"
                          alt="check"
                          width={20}
                          height={20}
                        />
                        <div className="text-terminal-green text-base">
                          ACCESS GRANTED
                        </div>
                      </div>
                    </div>
                    <div className="text-terminal-white text-base">
                      CRYPTO REWARD UNLOCKED: <br /> [{rewardData.rewardToken}]{" "}
                      {rewardData.rewardAmount} TRANSFERRED
                    </div>
                    <div className="text-terminal-white text-base">
                      READY FOR NEXT OPERATION <br /> Awaiting for user input
                    </div>
                    {state.transactionHash && (
                      <div className="text-terminal-green text-sm">
                        → TRANSACTION CONFIRMED ON BLOCKCHAIN
                      </div>
                    )}
                    <div className="text-terminal-gray-light text-sm">
                      → SOL PAID: {rewardData.solValue} SOL
                    </div>
                    <div className="text-terminal-gray-light text-sm">
                      → NETWORK: Solana Devnet
                    </div>
                    {(transactionSignature || state.transactionHash) && (
                      <div className="text-terminal-gray-light text-sm">
                        → BLOCK EXPLORER: {getExplorerName()}
                      </div>
                    )}
                    {(transactionSignature || state.transactionHash) && (
                      <div className="text-terminal-gray-light text-sm">
                        → COMPUTE UNITS: {rewardData.computeUnits}
                      </div>
                    )}
                    {state.processingTime > 0 && (
                      <div className="text-terminal-gray-light text-sm">
                        → PROCESSING TIME: {state.processingTime}s
                      </div>
                    )}
                    <div className="text-terminal-green text-sm">
                      → MYSTERY BOX OPENED SUCCESSFULLY
                    </div>
                  </div>
                  <div className="flex flex-col gap-8 w-[370px] min-w-[320px] max-w-[400px] items-center justify-center">
                    <div className="relative flex flex-col gap-4 items-center justify-center border-2 border-terminal-gray-light py-3 px-2">
                      <FrameXReceiptModal position="left" />
                      <FrameYReceiptModal position="top" />
                      <Image
                        src={boxImage}
                        alt={rewardData.rewardToken}
                        width={220}
                        height={240}
                        className="w-[220px] h-[240px] object-contain"
                      />
                      <FrameXReceiptModal position="right" />
                      <FrameYReceiptModal position="bottom" />
                    </div>
                    <div className="flex flex-col gap-2 w-full max-w-[280px] mx-auto mt-12">
                      <div className="text-terminal-green text-xs text-center uppercase tracking-wide opacity-90">
                        HERE IS YOUR REWARD
                      </div>

                      <div className="flex items-center justify-center gap-3 bg-terminal-black border border-terminal-green/40 px-6 py-4 rounded">
                        <Image
                          src={rewardData.rewardIcon}
                          alt={rewardData.rewardToken}
                          width={18}
                          height={18}
                        />
                        <span className="text-terminal-white font-bold text-lg">
                          {rewardData.rewardAmount}
                        </span>
                        <span className="text-terminal-green text-sm">
                          USDC
                        </span>
                      </div>

                      <div className="text-terminal-green-light text-xs text-center opacity-70">
                        ✓ Successfully transferred
                      </div>
                    </div>
                    <div className="w-full flex justify-center">
                      <div className="w-[290px] text-base mb-4">
                        <SliderButton
                          text="[Restake]"
                          onClick={handleRestake}
                          center
                          isSwiped={isSliderSwiped}
                          onSwipeChange={setIsSliderSwiped}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4 items-center justify-center w-[250px] min-w-[200px] max-w-[290px] mb-16">
                    <div className="text-terminal-gray-light text-base">
                      Transaction Details:
                    </div>
                    <ProgressBar animationType="center" />

                    <div className="w-full text-center">
                      <div className="text-terminal-gray-light text-xs mb-1">
                        Transaction Signature:
                      </div>
                      <div
                        className="text-terminal-green font-bold text-sm cursor-pointer hover:underline"
                        onClick={copyHashToClipboard}
                        title="Click to copy full signature"
                      >
                        {displayHash}
                      </div>
                    </div>

                    <div className="w-full flex justify-center mt-4">
                      <Button
                        value={`View on ${getExplorerName()}`}
                        variant="secondary"
                        text="center"
                        rightIcon={<ArrowRightIcon size={16} />}
                        className="text-sm"
                        onClick={handleViewOnExplorer}
                        disabled={
                          !(transactionSignature || state.transactionHash)
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {children}
    </>
  );
};

export default ReceiptModal;
