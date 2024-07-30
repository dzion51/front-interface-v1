import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Navbar from './components/navbar/Navbar';
import { fetchWalletBalance } from './DAL/KaspaApiDal';
import { ThemeContext } from './main';
import GridPage from './pages/krc-20/GridPage';
import TokenPage from './pages/token-page/TokenPage';
import { darkTheme } from './theme/DarkTheme';
import { lightTheme } from './theme/LightTheme';
import {
    disconnect,
    isKasWareInstalled,
    onAccountsChanged,
    removeAccountsChangedListener,
    requestAccounts,
    switchNetwork,
} from './utils/KaswareUtils';
import { getLocalThemeMode, setWalletBalanceUtil, ThemeModes } from './utils/Utils';
import DeployPage from './pages/deploy-page/DeployPage';

const App = () => {
    const [themeMode, setThemeMode] = useState(getLocalThemeMode());
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [walletBalance, setWalletBalance] = useState<number>(0);
    const [walletConnected, setWalletConnected] = useState<boolean>(false);
    const [showNotification, setShowNotification] = useState<boolean>(false);
    const [network, setNetwork] = useState<string>('mainnet'); // New state for network
    const [, setIsConnecting] = useState<boolean>(false);

    const toggleThemeMode = () => {
        const newMode = themeMode === ThemeModes.DARK ? ThemeModes.LIGHT : ThemeModes.DARK;
        localStorage.setItem('theme_mode', newMode);
        setThemeMode(newMode);
    };

    useEffect(() => {
        const handleAccountsChanged = async (accounts: string[]) => {
            if (accounts.length === 0) {
                setWalletAddress(null);
                setWalletBalance(0);
                setWalletConnected(false);
                localStorage.removeItem('isWalletConnected');
            } else {
                setWalletAddress(accounts[0]);
                const balance = await fetchWalletBalance(accounts[0]);
                setWalletBalance(setWalletBalanceUtil(balance));
                setWalletConnected(true);
            }
        };

        if (isKasWareInstalled()) {
            onAccountsChanged(handleAccountsChanged);
            window.kasware.on('disconnect', handleDisconnect);
        }

        return () => {
            if (isKasWareInstalled()) {
                removeAccountsChangedListener(handleAccountsChanged);
                window.kasware.removeListener('disconnect', handleDisconnect);
            }
        };
    }, []);

    const handleConnectWallet = async () => {
        setIsConnecting(true);
        try {
            if (isKasWareInstalled()) {
                const accounts = await requestAccounts();
                if (accounts.length > 0) {
                    setWalletAddress(accounts[0]);
                    setWalletConnected(true);
                    const balance = await fetchWalletBalance(accounts[0]);
                    setWalletBalance(setWalletBalanceUtil(balance));
                    setShowNotification(true);
                    setTimeout(() => setShowNotification(false), 5000);
                }
            }
        } catch (error) {
            console.error('Error connecting to wallet:', error);
        } finally {
            setIsConnecting(false);
        }
    };

    const handleDisconnect = async () => {
        const { origin } = window.location;
        await disconnect(origin);
        setWalletAddress(null);
        setWalletConnected(false);
        setWalletBalance(0);
        localStorage.removeItem('isWalletConnected');
    };

    const handleNetworkChange = async (newNetwork: string) => {
        if (network !== newNetwork) {
            try {
                await switchNetwork(newNetwork);
                setNetwork(newNetwork);
            } catch (error) {
                console.error('Error switching network:', error);
            }
        }
    };

    if (!themeMode) {
        return null;
    } else {
        return (
            <ThemeContext.Provider value={{ themeMode, toggleThemeMode }}>
                <ThemeProvider theme={themeMode === ThemeModes.DARK ? darkTheme : lightTheme}>
                    <CssBaseline />
                    <BrowserRouter>
                        <Navbar
                            walletConnected={walletConnected}
                            walletAddress={walletAddress}
                            network={network}
                            onNetworkChange={handleNetworkChange}
                            walletBalance={walletBalance}
                            connectWallet={requestAccounts}
                            disconnectWallet={handleDisconnect}
                        />
                        <Routes>
                            <Route
                                path="/"
                                element={
                                    <GridPage
                                        walletAddress={walletAddress}
                                        walletBalance={walletBalance}
                                        showNotification={showNotification}
                                        setShowNotification={setShowNotification}
                                    />
                                }
                            />
                            <Route
                                path="/token/:ticker"
                                element={
                                    <TokenPage
                                        network={network}
                                        showNotification={showNotification}
                                        setShowNotification={setShowNotification}
                                        walletAddress={walletAddress}
                                        connectWallet={requestAccounts}
                                        handleNetworkChange={handleNetworkChange}
                                    />
                                }
                            />
                            <Route path="/deploy" element={<DeployPage />} />
                            {/* Handle 404 - Not Found */}
                            <Route path="*" element={<div>404 - Not Found</div>} />
                        </Routes>
                    </BrowserRouter>
                </ThemeProvider>
            </ThemeContext.Provider>
        );
    }
};

export default App;
