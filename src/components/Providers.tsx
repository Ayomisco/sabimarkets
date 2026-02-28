"use client";

import { getDefaultConfig, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { WagmiProvider } from 'wagmi';
import { polygon } from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import {
  injectedWallet,
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
  trustWallet,
  coinbaseWallet,
  phantomWallet,
} from '@rainbow-me/rainbowkit/wallets';

// ⚠️  REQUIRED: Set NEXT_PUBLIC_WC_PROJECT_ID in your .env.local
// Get a free project ID at https://cloud.walletconnect.com
const WC_PROJECT_ID = process.env.NEXT_PUBLIC_WC_PROJECT_ID || 'YOUR_WALLETCONNECT_PROJECT_ID';

const config = getDefaultConfig({
  appName: 'SabiMarket',
  appDescription: "Africa's Native Prediction Market",
  appUrl: 'https://sabimarket.xyz',
  projectId: WC_PROJECT_ID,
  chains: [polygon],
  ssr: true,
  wallets: [
    {
      groupName: 'Popular',
      wallets: [
        injectedWallet,
        metaMaskWallet,
        trustWallet,
        coinbaseWallet,
        rainbowWallet,
        walletConnectWallet,
        phantomWallet,
      ],
    },
  ],
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#00C566',
            accentColorForeground: 'black',
            borderRadius: 'large',
            fontStack: 'system',
          })}
          modalSize="compact"
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
