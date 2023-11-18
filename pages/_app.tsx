import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import type { AppProps } from "next/app";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import {
  arbitrumGoerli,
  baseGoerli,
  gnosis,
  goerli,
  lineaTestnet,
  mantleTestnet,
  polygonZkEvmTestnet,
  scrollSepolia,
} from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { ChakraProvider } from "@chakra-ui/react";
import Metamask from "../components/Metamask";
import NonSSRWrapper from "../components/NoSSR";
import {
  MetaMaskButton,
  MetaMaskUIProvider,
  useSDK,
} from "@metamask/sdk-react-ui";

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [
    baseGoerli,
    goerli,
    arbitrumGoerli,
    gnosis,
    scrollSepolia,
    lineaTestnet,
    polygonZkEvmTestnet,
    mantleTestnet,
  ],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: "RainbowKit App",
  projectId: "29f089b368494e3fed5056775f80ee35",
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <WagmiConfig config={wagmiConfig}>
        <RainbowKitProvider chains={chains}>
          {/* <MetaMaskUIProvider
            sdkOptions={{
              dappMetadata: {
                name: "Demo UI React App",
              },
            }}
          > */}
          <Component {...pageProps} />
          {/* </MetaMaskUIProvider> */}
        </RainbowKitProvider>
      </WagmiConfig>
    </ChakraProvider>
  );
}

export default MyApp;
