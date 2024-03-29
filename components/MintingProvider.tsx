import React, {
    ReactNode,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { useAccount, useDisconnect, useEnsName } from 'wagmi';

enum ConnectType {
    META_MASK,
    WALLET_CONNECT,
}

enum TicketStatus {
    DISCONNECTED,
    CONNECTED,
    MINTING,
}

type MintingCtx = {
    disconnect: () => void;
    account: string | null | undefined;
    ens: string | null | undefined;
    ticketStatus: TicketStatus;
    setTicketStatus: (status: TicketStatus) => void;
    printerStatus: string;
    setPrinterStatus: (status: string) => void;

    error: string;
    setError: (error: string) => void;
};

const MintingContext = React.createContext<MintingCtx | null>(null);

type MintingProviderProps = {
    children: ReactNode;
};

function MintingProvider({ children }: MintingProviderProps) {
    const { data: account } = useAccount();
    const { data: ensName } = useEnsName({ address: account?.address });
    const { disconnect } = useDisconnect();
    const [error, setError] = useState('');
    const [ticketStatus, setTicketStatus] = useState<TicketStatus>(
        TicketStatus.DISCONNECTED,
    );
    const [printerStatus, setPrinterStatus] = useState('waiting');

    useEffect(() => {
        if (!account) {
            setTicketStatus(TicketStatus.DISCONNECTED);
            setPrinterStatus('waiting');
            setError('');
        }

        if (account?.address) {
            setTicketStatus(TicketStatus.CONNECTED);
            setPrinterStatus('connected');
        }
    }, [account]);

    useEffect(() => {
        if (error) {
            setPrinterStatus('errored');
        } else {
            if (account) {
                setPrinterStatus('connected');
            } else {
                setPrinterStatus('waiting');
            }
        }
    }, [error, account]);

    const ctx: MintingCtx = useMemo(
        () => ({
            disconnect,
            ticketStatus,
            setTicketStatus,
            error,
            setError,
            account: account?.address,
            ens: ensName,
            printerStatus,
            setPrinterStatus,
        }),
        [
            disconnect,
            ticketStatus,
            setTicketStatus,
            error,
            setError,
            account,
            ensName,
            printerStatus,
            setPrinterStatus,
        ],
    );

    return (
        <MintingContext.Provider value={ctx}>
            {children}
        </MintingContext.Provider>
    );
}

const useMintingContext = (): MintingCtx => {
    const ctx = useContext(MintingContext);
    if (!ctx) {
        throw new Error(
            'useMintingContext must be used within a MintingProvider',
        );
    }

    return ctx;
};

export { useMintingContext, TicketStatus, ConnectType };

export default MintingProvider;
