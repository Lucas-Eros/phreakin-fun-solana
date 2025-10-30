# 📦 DFK Mystery Box - Technical Documentation

## 🎯 Overview

**DFK Mystery Box** is a decentralized application built with Next.js that allows users to interact with mystery boxes on the Solana blockchain (Devnet). The application features fast token swaps using Jupiter integration, providing users with an engaging way to exchange tokens on Solana.

## 🚀 Technologies Used

### **Frontend**

- **Next.js 15.3.2** - React framework for web applications
- **React 19** - Library for user interfaces
- **TypeScript** - Static typing for JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library

### **Blockchain & Web3**

- **@solana/wallet-adapter-react** - React hooks for Solana wallets
- **@solana/web3.js** - Solana JavaScript SDK  
- **@coral-xyz/anchor** - Solana program framework
- **Jupiter Swap** - Token swap aggregator for Solana
- **Phantom, Solflare & other Solana wallets** - Wallet integration

### **UI/UX**

- **Radix UI** - Accessible primitive components
- **Lucide React** - SVG icons
- **Class Variance Authority** - CSS variant management
- **React Scramble Text** - Animated text effect

### **Build & Deploy**

- **Netlify** - Deployment platform with Next.js plugin
- **ESLint & Prettier** - Code linting and formatting
- **Turbopack** - Fast bundler for development

## 🏗️ Application Architecture

### **Directory Structure**

```
src/
├── app/                    # Next.js App Router
├── components/             # Reusable React components
├── config/                 # Box flow configurations
├── constants/              # Constants and program addresses
├── contexts/               # React Contexts for global state
├── hooks/                  # Custom hooks
├── lib/                    # Utilities and libraries
├── styles/                 # Style files
└── types/                  # TypeScript type definitions
```

### **Design Patterns**

- **Context API** - Global state management
- **Custom Hooks** - Reusable logic
- **Component Composition** - Modular components
- **Type Safety** - TypeScript throughout the application

## 📦 Box Implementation

### **Blue Box - Solana Swap**

#### **Concept**

The Blue Box allows users to deposit SOL or JUP tokens and receive USDC of equivalent value through Jupiter's optimal swap routing on Solana.

#### **Features**

- **Fast Swaps** - Lightning-fast token swaps on Solana
- **Jupiter Integration** - Optimal routing for best swap rates
- **Low Fees** - 5% fee with minimal network costs
- **Automatic Processing** - Automated SOL/JUP → USDC conversion

#### **Operation Flow**

1. **Initial Step** - User selects token and amount
2. **Processing** - Execution of swap through Jupiter
3. **Finished** - Display of swap receipt and transaction details

#### **Accepted Tokens**

- **SOL** - Solana native token
- **JUP** - Jupiter token
- **Output** - USDC (SPL token)

#### **Smart Contract**

- **Program ID** - `FDXxJHprFRFf293SMGkB8pdDMbM4zaxw9ykuqvATihEs`
- **Main Instruction** - `purchase_box` with Jupiter swap integration
- **Network** - Solana Devnet

## 🔗 Smart Contracts

### **Program Addresses (Solana Devnet)**

```typescript
const addresses = {
  // Main Program
  mysteryBoxProgram: "FDXxJHprFRFf293SMGkB8pdDMbM4zaxw9ykuqvATihEs",
  
  // Token Mints
  USDC_MINT: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU", // USDC Devnet
  JUP_MINT: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",   // Jupiter Token
  
  // Jupiter Integration  
  JUPITER_PROGRAM: "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4", // Jupiter V6
};
```

### **Program IDLs**

- `mystery_box_solana.json` - IDL for main mystery box program
- `jupiter-interface.ts` - Jupiter swap integration types
- `spl-token.ts` - SPL token program interfaces

## 🎨 User Interface

### **Main Components**

- **EnhancedMysteryBoxModal** - Main modal for box interaction
- **InitialStep** - Token and amount selection
- **ProcessingStep** - Transaction processing
- **FinishedStep** - Final result and receipts

### **Design System**

- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui Components** - Customizable base components
- **Framer Motion Animations** - Smooth transitions
- **Responsive Design** - Adaptable to different devices
- **Solana Wallet Integration** - Native wallet adapter UI

### **Themes and Colors**

- **Terminal Theme** - Retro terminal aesthetic
- **Solana Brand Colors** - Solana ecosystem color palette
- **Box-specific Colors** - Unique colors for each box type

## 🔧 Configuration and Development

### **Environment Variables**

```bash
# Solana configurations
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_ENVIRONMENT=development
```

### **Available Scripts**

```bash
npm run dev          # Development with Turbopack
npm run build        # Production build
npm run start        # Production server
npm run lint         # Linting with ESLint
npm run lint:fix     # Automatic lint fix
npm run format       # Formatting with Prettier
npm run format:check # Format verification
```

### **Deploy**

- **Platform** - Netlify
- **Plugin** - @netlify/plugin-nextjs
- **Build Command** - `npm run build`
- **Publish Directory** - `.next`
- **Network** - Solana Devnet (with future Mainnet support)