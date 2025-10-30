"use client";
import React, { useState, useEffect } from "react";
import Header from "@/components/header/header";
import SidebarStatusPanel from "@/components/sidebarStatusPanel/sidebarStatusPanel";
import AdminData from "@/components/adminData/adminData";
import { ProgressBar } from "@/components/ui/progressBar";
import SignalCard from "@/components/common/SignalCard";
import GlobeCard from "@/components/common/GlobeCard";
import MysteryBoxCard from "@/components/common/MysteryBoxCard";
import EnhancedMysteryBoxModal from "@/components/modals/mysteryBox/EnhancedMysteryBoxModal";
import ReceiptModal from "@/components/modals/receiptModal/ReceiptModal";
import FrameReceiptModal from "@/components/modals/receiptModal/FrameReceiptModal";
import ToastContainer from "@/components/ui/ToastContainer";
import { TutorialOverlay } from "@/components/ui/TutorialOverlay";
import {
  useMysteryBoxStore,
  useUIStore,
  selectMysteryBoxStep,
  selectReceiptModal,
  selectMysteryBoxRewards,
  selectMysteryBoxTransactionHash,
  selectMysteryBoxUsdcReceived,
} from "@/stores";

export default function Home() {
  const boxes = [
    {
      title: "Blue Box",
      image: "/boxes/blueBox.svg",
      available: true,
      description:
        "Users deposit SOL or JUP tokens and receive USDC of equivalent value. Built on Solana for fast transactions with 5% fee and Jupiter integration for optimal swaps.",
      type: "Solana Swap",
    },
    {
      title: "Red Box",
      image: "/boxes/redBox.svg",
      available: false,
      description: "",
      type: "Curated Swaps",
    },
    {
      title: "Silver Box",
      image: "/boxes/silverBox.svg",
      available: false,
      description:
        "Users engage in value-for-value swaps, akin to the Blue Box system. These boxes follow specially curated token lists and may offer discounts or incur specific fees depending on the list chosen.",
      type: "Curated Swaps",
    },
    {
      title: "Diamond Box",
      image: "/boxes/diamondBox.svg",
      available: false,
      description:
        "Users engage in value-for-value swaps, akin to the Blue Box system. These boxes follow specially curated token lists and may offer discounts or incur specific fees depending on the list chosen.",
      type: "Curated Swaps",
    },
    {
      title: "White Box",
      image: "/boxes/whiteBox.svg",
      available: false,
      description:
        "This box facilitates P2P swaps without engaging with fiat currencies directly. Users can integrate with third-party solutions, such as Endaoment, to handle fiat conversions, with future potential for charitable organization integration.",
      type: "P2P Exchange",
    },
    {
      title: "Black Box",
      image: "/boxes/blackBox.svg",
      available: false,
      description:
        "This box facilitates P2P swaps without engaging with fiat currencies directly. Users can integrate with third-party solutions, such as Endaoment, to handle fiat conversions, with future potential for charitable organization integration.",
      type: "Private Value Retention",
    },
    {
      title: "Gold Box",
      image: "/boxes/goldBox.svg",
      available: false,
      description:
        "Users engage in value-for-value swaps, akin to the Blue Box system. These boxes follow specially curated token lists and may offer discounts or incur specific fees depending on the list chosen.",
      type: "Curated Swaps",
    },
    {
      title: "Green Box",
      image: "/boxes/greenBox.svg",
      available: false,
      description:
        "Users engage in value-for-value swaps, akin to the Blue Box system. These boxes follow specially curated token lists and may offer discounts or incur specific fees depending on the list chosen.",
      type: "Token Recycling",
    },
    {
      title: "Rainbow Box",
      image: "/boxes/rainbowBox.svg",
      available: false,
      description:
        "Users interact with a randomness-based system, akin to a claw machine. The claw selects a clear sphere containing one of the other boxes. Users have 30 seconds to cancel or re-pick the result at a cost of $100 worth of tokens, adding transparency and excitement while emphasizing risk.",
      type: "Randomized Pick",
    },
  ];

  const [selectedBox, setSelectedBox] = useState<null | (typeof boxes)[0]>(
    null,
  );
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptBox, setReceiptBox] = useState<null | (typeof boxes)[0]>(null);
  const [hoveredBox, setHoveredBox] = useState<null | {
    title: string;
    description: string;
    type: string;
  }>(null);

  const mysteryBoxState = useMysteryBoxStore(selectMysteryBoxStep);
  const mysteryBoxRewards = useMysteryBoxStore(selectMysteryBoxRewards);
  const mysteryBoxTransactionHash = useMysteryBoxStore(
    selectMysteryBoxTransactionHash,
  );
  const mysteryBoxUsdcReceived = useMysteryBoxStore(
    selectMysteryBoxUsdcReceived,
  );
  const isConfirmed = useMysteryBoxStore((state) => state.isConfirmed);
  const receipt = useMysteryBoxStore((state) => state.receipt);
  const resetMysteryBoxState = useMysteryBoxStore((state) => state.resetState);

  const receiptModal = useUIStore(selectReceiptModal);

  useEffect(() => {
    if (
      isConfirmed &&
      mysteryBoxState === "finished" &&
      !showReceipt &&
      selectedBox &&
      mysteryBoxTransactionHash
    ) {
      setReceiptBox(selectedBox);
      setSelectedBox(null);
      setShowReceipt(true);
    }
  }, [
    isConfirmed,
    mysteryBoxState,
    showReceipt,
    selectedBox,
    mysteryBoxTransactionHash,
  ]);

  const getTransactionData = () => {
    if (mysteryBoxRewards && mysteryBoxRewards.length > 0) {
      const firstReward = mysteryBoxRewards[0];
      return {
        coinName: firstReward.tokenSymbol,
        amount: firstReward.formattedValue,
        coinIcon: getTokenIcon(firstReward.tokenSymbol),
        usdcReceived:
          mysteryBoxUsdcReceived ||
          (firstReward.tokenSymbol === "USDC"
            ? parseFloat(firstReward.formattedValue)
            : undefined),
        transactionSignature: mysteryBoxTransactionHash,
      };
    }

    return {
      coinName: "USDC",
      amount: "0.000000",
      coinIcon: "/tokens/usdc.png",
      usdcReceived: mysteryBoxUsdcReceived || 0,
      transactionSignature: mysteryBoxTransactionHash,
    };
  };

  const getTokenIcon = (tokenSymbol: string) => {
    switch (tokenSymbol.toUpperCase()) {
      case "SOL":
        return "/tokens/solana.svg";
      case "USDC":
        return "/tokens/usdc.png";
      case "JUP":
        return "/tokens/jupiter.svg";
      case "USDT":
        return "/tokens/usdt.svg";
      default:
        return "/tokens/usdc.png";
    }
  };

  const handleBoxFinish = (box: (typeof boxes)[0]) => {
    setReceiptBox(box);
    setSelectedBox(null);
    setShowReceipt(true);
  };

  const handleRestake = () => {
    setShowReceipt(false);
    setReceiptBox(null);
    if (receiptBox) {
      setSelectedBox(receiptBox);
    }
    resetMysteryBoxState();
  };

  const transactionData = getTransactionData();

  return (
    <>
      <ToastContainer />
      <div className="flex flex-col min-h-screen bg-terminal-black text-terminal-green font-mono">
        <Header />

        <div className="flex items-center gap-2 px-8 pt-4 mb-2 w-full">
          <div className="flex items-center gap-2">
            <span className="text-xs text-terminal-green-dark">HOME</span>
            <span className="text-terminal-green">{">"}</span>
            <span className="text-xs text-terminal-green">PHREAKIN FUN</span>
          </div>
          <div className="flex-1 flex items-center ml-12">
            <ProgressBar animationType="leftToRight" />
          </div>
        </div>

        <div className="flex flex-1 h-full">
          <div className="w-[20%] min-w-[200px] shrink-0 h-full">
            <SidebarStatusPanel
              hoveredBoxName={hoveredBox?.title}
              hoveredBoxDescription={hoveredBox?.description}
              hoveredBoxType={hoveredBox?.type}
            />
          </div>

          <div className="flex-1 px-8">
            <div className="max-w-[1500px] mx-auto">
              <div className="flex justify-between gap-x-4">
                <div className="basis-1/3">
                  <AdminData />
                </div>
                <div className="basis-1/3">
                  <SignalCard image="/signal.gif" title="SIGNAL STABILITY" />
                </div>
                <div className="basis-1/3">
                  <GlobeCard
                    image1="/globe.gif"
                    image2="/graphic.svg"
                    title="GLOBAL STABILITY"
                  />
                </div>
              </div>
            </div>

            <div className="relative mt-8 w-full px-8">
              <div
                className="absolute inset-0 bg-terminal-green mx-8"
                style={{
                  clipPath: "var(--clip-path-card)",
                  transform: "scale(1.001)",
                }}
              />
              <div
                className="relative w-full border border-terminal-green bg-terminal-black"
                style={{ clipPath: "var(--clip-path-card)" }}
              >
                <div className="border-b border-terminal-green px-4 py-0.5 rounded-t-md">
                  <span className="text-terminal-green font-bold text-base tracking-widest font-mono">
                    Phreakin Tools
                  </span>
                </div>
                <div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6 p-6"
                  data-testid="mystery-box-grid"
                >
                  {boxes.map((box) => (
                    <MysteryBoxCard
                      key={box.title}
                      title={box.title}
                      image={box.image}
                      available={box.available}
                      description={box.description}
                      type={box.type}
                      onClick={() => box.available && setSelectedBox(box)}
                      onMouseEnter={() =>
                        setHoveredBox({
                          title: box.title,
                          description: box.description,
                          type: box.type,
                        })
                      }
                      onMouseLeave={() => setHoveredBox(null)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedBox && (
        <EnhancedMysteryBoxModal
          title={selectedBox.title}
          image={selectedBox.image}
          onClose={() => setSelectedBox(null)}
          onFinish={() => handleBoxFinish(selectedBox)}
        />
      )}

      {showReceipt && receiptBox && transactionData && (
        <ReceiptModal
          boxImage={receiptBox.image}
          coinIcon={transactionData.coinIcon}
          coinName={transactionData.coinName}
          amount={transactionData.amount}
          usdcReceived={transactionData.usdcReceived}
          transactionSignature={transactionData.transactionSignature}
          onClose={() => {
            setShowReceipt(false);
            setReceiptBox(null);
            resetMysteryBoxState();
          }}
          onRestake={handleRestake}
        >
          <FrameReceiptModal position="left" />
          <FrameReceiptModal position="right" />
        </ReceiptModal>
      )}

      <TutorialOverlay />

      {/* ...existing code... */}
    </>
  );
}
