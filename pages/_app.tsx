import '../styles/globals.css';
import type { AppProps } from 'next/app';
import '@rainbow-me/rainbowkit/styles.css';
import {
    apiProvider,
    configureChains,
    connectorsForWallets,
    getDefaultWallets,
    lightTheme,
    RainbowKitProvider,
    Theme,
    wallet,
} from '@rainbow-me/rainbowkit';
import merge from 'lodash.merge';
import { chain, createClient, WagmiProvider } from 'wagmi';

const { chains, provider } = configureChains(
    [process.env.NODE_ENV === 'production' ? chain.mainnet : chain.rinkeby],
    [apiProvider.alchemy(process.env.ALCHEMY_ID)],
);

const { wallets } = getDefaultWallets({
    appName: 'AlmostFancy',
    chains,
});

const connectors = connectorsForWallets([...wallets]);

const wagmiClient = createClient({
    autoConnect: true,
    connectors,
    provider,
});

const theme = merge(
    lightTheme({
        borderRadius: 'none',
        accentColor: 'black',
    }),
    {
        colors: {
            modalBorder: 'black',
        },
        fonts: {
            body: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        },
    } as Theme,
);

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <WagmiProvider client={wagmiClient}>
            <RainbowKitProvider
                chains={chains}
                showRecentTransactions
                theme={theme}
            >
                <Component {...pageProps} />
            </RainbowKitProvider>
        </WagmiProvider>
    );
}

export default MyApp;
