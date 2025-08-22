import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { CHAIN_ID, RPC_URL } from '@/lib/web3';

// Configure chains
const supportedChains = [mainnet]; // Add other chains as needed

// Create wagmi config
const config = getDefaultConfig({
  appName: 'Card Vault Pulse',
  projectId: 'card-vault-pulse', // Replace with your WalletConnect project ID
  chains: supportedChains,
  ssr: false,
  transports: {
    [mainnet.id]: http(RPC_URL, {
      retryCount: 3,
      retryDelay: 1_000,
    }),
  },
});

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#7C3AED',
            accentColorForeground: 'white',
            borderRadius: 'medium',
            fontStack: 'system',
            overlayBlur: 'small',
          })}
          appInfo={{
            appName: 'Card Vault Pulse',
            learnMoreUrl: 'https://docs.pepuns.xyz',
          }}
          modalSize="compact"
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
