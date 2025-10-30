"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Connection, Keypair } from "@solana/web3.js";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import {
  SwapProcessor,
  initializeSwapProcessor,
} from "../lib/solana/swap-processor";
import { MYSTERY_BOX_CONFIG } from "../lib/solana/constants";

interface SwapProcessorProps {
  connection: Connection;
  adminWallet?: AnchorWallet;
  enabled?: boolean;
}

interface ProcessorStatus {
  isRunning: boolean;
  isInitializing: boolean;
  error: string | null;
  lastProcessedSwap: string | null;
  totalSwapsProcessed: number;
}

export const SwapProcessorComponent: React.FC<SwapProcessorProps> = ({
  connection,
  adminWallet,
  enabled = false,
}) => {
  const [processor, setProcessor] = useState<SwapProcessor | null>(null);
  const [status, setStatus] = useState<ProcessorStatus>({
    isRunning: false,
    isInitializing: false,
    error: null,
    lastProcessedSwap: null,
    totalSwapsProcessed: 0,
  });

  // Initialize processor
  const initProcessor = useCallback(async () => {
    if (!adminWallet || !enabled) return;
    if (!adminWallet) return;

    setStatus((prev) => ({ ...prev, isInitializing: true, error: null }));

    try {
      console.log("🔄 Initializing swap processor...");

      // Convert AnchorWallet to Wallet for the processor
      const wallet = {
        publicKey: adminWallet.publicKey,
        signTransaction: adminWallet.signTransaction,
        signAllTransactions: adminWallet.signAllTransactions,
        payer: adminWallet.publicKey,
      };

      const swapProcessor = await initializeSwapProcessor(
        connection,
        wallet as any,
      );
      setProcessor(swapProcessor);

      setStatus((prev) => ({
        ...prev,
        isRunning: true,
        isInitializing: false,
      }));

      console.log("✅ Swap processor initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize swap processor:", error);
      setStatus((prev) => ({
        ...prev,
        isInitializing: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to initialize processor",
      }));
    }
  }, [connection, adminWallet, enabled]);

  // Stop processor
  const stopProcessor = useCallback(() => {
    if (processor) {
      processor.stopProcessing();
      setProcessor(null);
      setStatus((prev) => ({
        ...prev,
        isRunning: false,
      }));
      console.log("⏹️ Swap processor stopped");
    }
  }, [processor]);

  // Initialize when component mounts or dependencies change
  useEffect(() => {
    if (enabled && adminWallet && !processor) {
      initProcessor();
    } else if (!enabled && processor) {
      stopProcessor();
    }

    // Cleanup on unmount
    return () => {
      if (processor) {
        processor.stopProcessing();
      }
    };
  }, [enabled, adminWallet, processor, initProcessor, stopProcessor]);

  // Test swap processing
  const testProcessor = useCallback(async () => {
    if (!processor) return;

    try {
      console.log("🧪 Testing processor functionality...");
      await processor.getProgramBalances();
      console.log("✅ Processor test successful");
    } catch (error) {
      console.error("❌ Processor test failed:", error);
      setStatus((prev) => ({
        ...prev,
        error: "Processor test failed",
      }));
    }
  }, [processor]);

  if (!enabled) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <span className="text-yellow-600">⚠️</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Swap Processor Disabled
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Automatic swap processing is currently disabled. Enable it to
                automatically convert SOL/JUP to USDC after purchases.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!adminWallet) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <span className="text-red-600">❌</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Admin Wallet Required
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>
                Swap processing requires an admin wallet to execute swaps and
                distribute USDC.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Swap Processor</h3>
        <div className="flex items-center space-x-2">
          {status.isRunning ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <div className="w-2 h-2 bg-green-600 rounded-full mr-1.5 animate-pulse"></div>
              Running
            </span>
          ) : status.isInitializing ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              <div className="w-2 h-2 bg-yellow-600 rounded-full mr-1.5 animate-spin"></div>
              Initializing
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              <div className="w-2 h-2 bg-gray-600 rounded-full mr-1.5"></div>
              Stopped
            </span>
          )}
        </div>
      </div>

      {status.error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-600">❌</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Processor Error
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{status.error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm font-medium text-gray-500">Status</div>
          <div className="mt-1 text-lg font-semibold text-gray-900">
            {status.isRunning ? "Active" : "Inactive"}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm font-medium text-gray-500">
            Swaps Processed
          </div>
          <div className="mt-1 text-lg font-semibold text-gray-900">
            {status.totalSwapsProcessed}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm font-medium text-gray-500">Admin Wallet</div>
          <div className="mt-1 text-sm font-mono text-gray-900">
            {adminWallet.publicKey.toString().slice(0, 8)}...
          </div>
        </div>
      </div>

      {status.lastProcessedSwap && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-blue-600">🔄</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Last Processed Swap
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p className="font-mono">{status.lastProcessedSwap}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex space-x-3">
        {!status.isRunning && !status.isInitializing && (
          <button
            onClick={initProcessor}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Start Processor
          </button>
        )}

        {status.isRunning && (
          <button
            onClick={stopProcessor}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Stop Processor
          </button>
        )}

        {processor && (
          <button
            onClick={testProcessor}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Test Processor
          </button>
        )}
      </div>

      <div className="text-xs text-gray-500 bg-gray-50 rounded p-2">
        <p>
          <strong>How it works:</strong>
        </p>
        <ul className="mt-1 space-y-1 list-disc list-inside">
          <li>
            Listens for SwapRequested events from the mystery box contract
          </li>
          <li>Automatically executes SOL/JUP → USDC swaps via Jupiter</li>
          <li>Distributes USDC to users after successful swaps</li>
          <li>Requires admin wallet with sufficient SOL and USDC</li>
        </ul>
      </div>
    </div>
  );
};

export default SwapProcessorComponent;
