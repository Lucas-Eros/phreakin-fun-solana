"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import Button from "../ui/button";
import { ChevronDown, Plus, HelpCircle } from "lucide-react";
import { useTutorialStore } from "@/stores";
import { HelpModal } from "@/components/ui/HelpModal";
import { UnifiedWalletButton } from "./UnifiedWalletButton";

const TypingLogo = () => {
  const fullText = "Phreakin Fun";
  const [displayText, setDisplayText] = useState("");
  const [cursorVisible, setCursorVisible] = useState(true);
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (isTyping && displayText.length < fullText.length) {
      const timeout = setTimeout(() => {
        setDisplayText(fullText.substring(0, displayText.length + 1));
      }, 120);
      return () => clearTimeout(timeout);
    } else if (isTyping) {
      setIsTyping(false);
    }
  }, [displayText, isTyping, fullText]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="text-terminal-white font-medium text-[20px]">
      {displayText}
      <span
        className={`${cursorVisible ? "opacity-100" : "opacity-0"} transition-opacity duration-100`}
      >
        _
      </span>
    </span>
  );
};

export default function Header() {
  const { startTutorial, resetTutorial } = useTutorialStore();
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  return (
    <>
      <header className="w-full flex items-center justify-between py-4 px-8 bg-terminal-black border-b border-terminal-green font-mono text-terminal-green text-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-5 cursor-pointer">
            <Image
              src="/logo.svg"
              alt="Phreakin Fun Logo"
              width={25}
              height={25}
              style={{ width: "auto", height: "auto" }}
              className="rounded-sm"
            />
            <TypingLogo />
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* <Button
          value="$20,00"
          variant="secondary"
          rightIcon={<ChevronDown size={16} />}
        /> */}
          {/* <Button value="CASHIER" variant="primary" /> */}
          {/* <Button
          value="[23:58:26] 10% BOOST"
          variant="secondary"
          rightIcon={<Plus size={16} />}
        /> */}
          <Button
            value="Help"
            variant="secondary"
            rightIcon={<HelpCircle size={16} />}
            onClick={() => setIsHelpModalOpen(true)}
            title="Open Help & Tutorial"
          />
          {/* <Button
          value="[account] Blackmamba42"
          variant="secondary"
          rightIcon={<ChevronDown size={16} />}
        /> */}
          <UnifiedWalletButton className="data-testid-connect-wallet-button" />
        </div>
      </header>

      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </>
  );
}
