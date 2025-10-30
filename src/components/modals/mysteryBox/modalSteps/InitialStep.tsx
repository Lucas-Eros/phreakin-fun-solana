import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { X, PlusIcon, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/button";
import SliderButton from "@/components/ui/SliderButton";
import DonationInput from "@/components/ui/DonationInput";
import { useSolana } from "@/hooks/useSolana";
import { useMysteryBoxStore, useBoxFlowStore, useUIStore } from "@/stores";
import {
  currencies,
  getBoxId,
  getSupportedTokens,
  getBlockchainType,
} from "@/constants/currencies";
import { useWallet } from "@solana/wallet-adapter-react";
import { toast } from "react-hot-toast";

interface InitialStepProps {
  title: string;
  image: string;
  onClose: () => void;
  description: string;
  CLIP_PATH: string;
}

const InitialStep: React.FC<InitialStepProps> = ({
  title,
  image,
  onClose,
  description,
  CLIP_PATH,
}) => {
  const { showToast } = useUIStore();

  // Local state for purchase management
  const [purchaseAmounts, setPurchaseAmounts] = useState<string[]>([""]);
  const [selectedTokens, setSelectedTokens] = useState<string[]>(["None"]);

  const {
    purchaseBox,
    setTransactionHash,
    finishProcessing,
    errorProcessing,
    startProcessing,
    setRewards,
    updateState,
  } = useMysteryBoxStore();
  const { goToNextStep } = useBoxFlowStore();

  // Solana blockchain hook
  const solanaWallet = useWallet();
  const {
    balances: solanaBalances,
    balancesInitialized: solanaBalancesInitialized,
    isLoading: solanaLoading,
    isPurchasing: solanaPurchasing,
    error: solanaError,
    contractActive: solanaContractActive,
    purchaseMysteryBox: purchaseSolanaMysteryBox,
    validatePurchaseAmount,
    formatBalance,
    getBalance,
  } = useSolana();

  const [isSliderSwiped, setIsSliderSwiped] = useState(false);
  const [currentTokenIndex, setCurrentTokenIndex] = useState(0);
  const [isTokenDropdownOpen, setIsTokenDropdownOpen] = useState(false);

  const hasInitialized = useRef(false);

  const isWhiteBox = title.toLowerCase().includes("white");
  const isBlueBox = title.toLowerCase().includes("blue");
  const blockchainType = getBlockchainType(title);

  useEffect(() => {
    if (!hasInitialized.current) {
      setCurrentTokenIndex(0);
      setIsTokenDropdownOpen(false);
      setIsSliderSwiped(false);
      hasInitialized.current = true;
    }
  }, []);

  useEffect(() => {
    return () => {
      hasInitialized.current = false;
    };
  }, []);

  useEffect(() => {
    if (purchaseAmounts.length === 0) {
      setPurchaseAmounts([""]);
    }

    if (isBlueBox) {
      if (selectedTokens.length === 0) {
        setSelectedTokens(["SOL"]);
      }
    } else {
      if (selectedTokens.length === 0) {
        setSelectedTokens(["None"]);
      }
    }
  }, [isBlueBox, purchaseAmounts.length, selectedTokens.length]);

  useEffect(() => {
    if (solanaError) {
      showToast(solanaError, "error");
    }
  }, [solanaError, showToast]);

  const addTokenRow = () => {
    if (isWhiteBox) return;

    if (purchaseAmounts.length < 4) {
      setPurchaseAmounts([...purchaseAmounts, ""]);
      const defaultToken = isBlueBox ? "SOL" : "None";
      setSelectedTokens([...selectedTokens, defaultToken]);
    }
  };

  const updateCurrentAmount = (value: string) => {
    const newAmounts = [...purchaseAmounts];
    newAmounts[currentTokenIndex] = value;
    setPurchaseAmounts(newAmounts);
  };

  const updateCurrentToken = (tokenCode: string) => {
    const newTokens = [...selectedTokens];
    newTokens[currentTokenIndex] = tokenCode;
    setSelectedTokens(newTokens);
    setIsTokenDropdownOpen(false);
  };

  const getAvailableTokens = () => {
    const supportedTokens = getSupportedTokens(title);

    if (!currencies || currencies.length === 0) {
      return [];
    }

    const filtered = currencies.filter((currency) => {
      const isSupported = supportedTokens.includes(currency.code);

      const isCurrentlySelected =
        currency.code === selectedTokens[currentTokenIndex];
      const isSelectedElsewhere =
        selectedTokens.includes(currency.code) && !isCurrentlySelected;

      return isSupported && !isSelectedElsewhere;
    });

    return filtered;
  };

  const getCurrentBalanceText = () => {
    const tokenCode = selectedTokens[currentTokenIndex];

    if (!solanaWallet.connected) return "Connect Wallet";
    if (!solanaBalancesInitialized) return "[Balance] Loading...";

    if (tokenCode === "None") return "[Balance] 0";
    if (tokenCode === "SOL") return `[Balance] ${formatBalance("SOL")}`;
    if (tokenCode === "JUP") return `[Balance] ${formatBalance("JUP")}`;

    return "[Balance] 0";
  };

  const getCurrentTokenText = () => {
    const tokenCode = selectedTokens[currentTokenIndex];
    return tokenCode === "None" ? "[Select]" : `[${tokenCode}]`;
  };

  const canPurchase = () => {
    if (!solanaWallet.connected || !solanaContractActive) return false;

    const hasValidAmounts = purchaseAmounts.some((amount, index) => {
      const tokenCode = selectedTokens[index];
      return tokenCode !== "None" && parseFloat(amount) > 0;
    });

    return hasValidAmounts && !solanaPurchasing;
  };

  const handleSliderComplete = async () => {
    if (!canPurchase()) return;

    try {
      if (blockchainType === "solana") {
        if (!solanaWallet.connected) {
          showToast(
            "Please connect your Solana wallet using the header button",
            "error",
          );
          return;
        }

        setIsSliderSwiped(true);

        // Handle Solana purchase
        const firstValidIndex = purchaseAmounts.findIndex(
          (amount, index) =>
            selectedTokens[index] !== "None" && parseFloat(amount) > 0,
        );

        if (firstValidIndex === -1) {
          showToast("Enter a valid amount", "error");
          setIsSliderSwiped(false);
          return;
        }

        const tokenType = selectedTokens[firstValidIndex] as "SOL" | "JUP";
        const amount = parseFloat(purchaseAmounts[firstValidIndex]);

        const validation = validatePurchaseAmount(tokenType, amount);
        if (validation) {
          showToast(validation, "error");
          setIsSliderSwiped(false);
          return;
        }

        const result = await purchaseSolanaMysteryBox(tokenType, amount);

        if (result.success) {
          // Create synthetic reward for Solana transaction
          const usdcAmount = result.usdcReceived || 0;
          const syntheticReward = {
            type: "reward" as const,
            message: `Received ${usdcAmount.toFixed(2)} USDC`,
            eventName: "Transfer" as const,
            tokenAddress: "USDC",
            tokenSymbol: "USDC",
            tokenName: "USD Coin",
            from: "mystery_box",
            to: "user",
            value: (usdcAmount * Math.pow(10, 6)).toString(), // Convert to raw value
            formattedValue: usdcAmount.toFixed(2),
            blockNumber: BigInt(0),
            transactionHash: result.signature,
            logIndex: 0,
          };

          setTransactionHash(result.signature as `0x${string}`);
          setRewards([syntheticReward]);
          updateState({ usdcReceived: usdcAmount });
          startProcessing();
          goToNextStep();
        } else {
          throw new Error(result.error || "Purchase failed");
        }

        return;
      }

      // For now, just proceed to processing step
      updateState({ step: "processing" });
      goToNextStep();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      showToast(errorMessage, "error");
      errorProcessing(errorMessage);
    } finally {
      setIsSliderSwiped(false);
    }
  };

  const nextToken = () => {
    if (currentTokenIndex < purchaseAmounts.length - 1) {
      setCurrentTokenIndex(currentTokenIndex + 1);
    }
  };

  const prevToken = () => {
    if (currentTokenIndex > 0) {
      setCurrentTokenIndex(currentTokenIndex - 1);
    }
  };

  return (
    <div
      className="bg-terminal-black"
      style={{ width: 648, height: 448, clipPath: CLIP_PATH }}
    >
      <div className="relative h-10 border-b border-terminal-green flex items-center justify-between px-6">
        <span className="text-terminal-green font-bold text-sm uppercase">
          {title}
        </span>
        <button onClick={onClose} className="flex items-center gap-2 group">
          <span className="text-terminal-gray-light font-bold text-sm group-hover:underline">
            EXIT
          </span>
          <X
            size={16}
            className="text-terminal-gray-light transition-colors hover:text-terminal-green-light"
          />
        </button>
      </div>

      <div className="flex flex-row gap-8 p-6 h-[418px]">
        <div className="flex-1 flex flex-col justify-between">
          <div className="whitespace-pre-line text-sm text-white mb-6">
            {description}
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <div className="flex-1 relative w-32 min-w-32">
                <Button
                  value={getCurrentTokenText()}
                  variant="secondary"
                  className="!w-full"
                  rightIcon={
                    <motion.div
                      animate={{ rotate: isTokenDropdownOpen ? 180 : 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                      <ChevronDown size={16} />
                    </motion.div>
                  }
                  onClick={() =>
                    !isWhiteBox && setIsTokenDropdownOpen(!isTokenDropdownOpen)
                  }
                  disabled={isWhiteBox}
                />

                <AnimatePresence>
                  {isTokenDropdownOpen && !isWhiteBox && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute bottom-full mb-1 left-0 right-0 bg-terminal-black border border-terminal-green z-50 max-h-48 overflow-y-auto"
                      style={{
                        clipPath:
                          "polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px)",
                      }}
                    >
                      <div className="py-2">
                        {(() => {
                          const availableTokens = getAvailableTokens();

                          return availableTokens.map((currency) => (
                            <button
                              key={currency.code}
                              className="w-full px-4 py-2 text-left text-sm text-terminal-green hover:bg-terminal-green-hover cursor-pointer transition-colors border-b border-terminal-green last:border-b-0"
                              onClick={() => updateCurrentToken(currency.code)}
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="font-bold hover:underline">
                                    [
                                    {currency.code === "None"
                                      ? "Select"
                                      : currency.code}
                                    ]
                                  </div>
                                  <div className="text-xs text-terminal-gray-light">
                                    {currency.name}
                                  </div>
                                </div>
                              </div>
                            </button>
                          ));
                        })()}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Button
                value={getCurrentBalanceText()}
                variant="secondary"
                className={`${
                  !solanaWallet.connected
                    ? "text-red-400"
                    : "text-terminal-white"
                } !whitespace-nowrap !w-48 !min-w-48`}
              />
            </div>

            <DonationInput
              value={purchaseAmounts[currentTokenIndex] || ""}
              onChange={updateCurrentAmount}
              placeholder="0"
              data-testid="amount-input"
            />

            {purchaseAmounts.length > 1 && (
              <div className="flex justify-between items-center text-sm text-terminal-green">
                <button
                  onClick={prevToken}
                  disabled={currentTokenIndex === 0}
                  className="disabled:opacity-50"
                >
                  ← Previous
                </button>
                <span>
                  Token {currentTokenIndex + 1} of {purchaseAmounts.length}
                </span>
                <button
                  onClick={nextToken}
                  disabled={currentTokenIndex === purchaseAmounts.length - 1}
                  className="disabled:opacity-50"
                >
                  Next →
                </button>
              </div>
            )}

            <Button
              value="[Add Token]"
              variant="primary"
              leftIcon={<PlusIcon size={18} />}
              text="center"
              onClick={addTokenRow}
              disabled={purchaseAmounts.length >= 4 || isWhiteBox}
            />
          </div>
        </div>

        <div className="w-[260px] flex flex-col items-center justify-between">
          <div className="relative border-2 border-white p-2">
            <Image
              src={image}
              alt={title}
              width={220}
              height={250}
              className="w-[220px] h-[250px] object-contain"
            />
          </div>

          <div className="w-full">
            {blockchainType === "solana" ? (
              <SliderButton
                text={
                  !solanaWallet.connected
                    ? "[Connect Wallet]"
                    : solanaPurchasing
                      ? "[Processing...]"
                      : "[Swipe to purchase]"
                }
                onClick={handleSliderComplete}
                disabled={!canPurchase()}
                isSwiped={isSliderSwiped}
                onSwipeChange={setIsSliderSwiped}
                data-testid="purchase-slider"
              />
            ) : (
              <SliderButton
                text={
                  !solanaWallet.connected
                    ? "[Connect Wallet]"
                    : solanaPurchasing
                      ? "[Processing...]"
                      : "[Swipe to purchase]"
                }
                onClick={handleSliderComplete}
                disabled={!canPurchase()}
                isSwiped={isSliderSwiped}
                onSwipeChange={setIsSliderSwiped}
                data-testid="purchase-slider"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InitialStep;
