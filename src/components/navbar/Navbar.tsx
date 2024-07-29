import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import NightlightRoundIcon from '@mui/icons-material/NightlightRound';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { IconButton, Tooltip, Typography } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    ConnectButton,
    Logo,
    NavbarContainer,
    NavButton,
    NavCenter,
    SearchContainer,
    WalletBalance,
} from './NavBar.s';
// import { ThemeContext } from '../../main';

interface NavbarProps {
    walletAddress: string | null;
    connectWallet: () => void;
    disconnectWallet: () => void;
    network: string;
    onNetworkChange: (network: string) => void;
    walletBalance: number;
    walletConnected: boolean;
}

const Navbar: React.FC<NavbarProps> = (props) => {
    const { walletBalance, walletConnected, disconnectWallet, connectWallet } = props;
    const [activePage, setActivePage] = useState('/');
    // const themeContext = useContext(ThemeContext);
    const [, setSearchValue] = useState('');
    const navigate = useNavigate();
    // const darkmode = themeContext.themeMode === ThemeModes.DARK;
    useEffect(() => {
        setActivePage(window.location.pathname);
    }, []);

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(event.target.value);
    };

    const handleNavButtonClick = (page: string) => {
        setActivePage(page);
        navigate(page);
    };

    const formatNumberWithCommas = (value: number) => value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    const handleConnectButton = () => {
        if (walletConnected) {
            disconnectWallet();
        } else {
            connectWallet();
        }
    };

    return (
        <NavbarContainer>
            <Logo>
                <Link to="/">
                    <img src="/logo.svg" alt="Logo" width={150} height={60} />
                </Link>
            </Logo>
            <NavCenter>
                <NavButton isActive={activePage === '/'} onClick={() => handleNavButtonClick('/')}>
                    KRC-20
                </NavButton>
                <NavButton isActive={activePage === '/deploy'} onClick={() => handleNavButtonClick('deploy')}>
                    Deploy
                </NavButton>
                <NavButton
                    isActive={activePage === '/portfolio'}
                    onClick={() => handleNavButtonClick('portfolio')}
                >
                    Portfolio
                </NavButton>
            </NavCenter>
            <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
                <SearchContainer
                    type="search"
                    placeholder={'Search KRC-20 Tokens'}
                    value={''}
                    onChange={(event) => handleSearch(event as React.ChangeEvent<HTMLInputElement>)}
                    sx={{
                        '& input': {
                            fontSize: '1vw',
                        },
                        '& input::placeholder': {
                            fontSize: '1vw',
                        },
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchRoundedIcon sx={{ fontSize: '1vw', color: 'white' }} />
                            </InputAdornment>
                        ),
                        style: {
                            height: '3.5vh',
                        },
                    }}
                />
                <WalletBalance>
                    <Typography variant="body1" style={{ fontSize: '1vw', marginRight: '1vw' }}>
                        {formatNumberWithCommas(walletBalance)} KAS
                    </Typography>
                </WalletBalance>
                <ConnectButton onClick={() => handleConnectButton()}>
                    {walletConnected ? 'Disconnect' : 'Connect'}
                </ConnectButton>
                {/* <FormControl variant="outlined" size="small" sx={{ marginLeft: '1vw' }}>
                    <NetworkSelect
                        SelectDisplayProps={{
                            style: {
                                padding: '0.5vh 0.5vw',
                            },
                        }}
                        value={network}
                        onChange={(event) => onNetworkChange(event.target.value as string)}
                        displayEmpty
                        inputProps={{ 'aria-label': 'Without label' }}
                    >
                        <NetworkSelectItem value="mainnet">Mainnet</NetworkSelectItem>
                        <NetworkSelectItem value="testnet">Testnet</NetworkSelectItem>
                    </NetworkSelect>
                </FormControl> */}
                {true ? (
                    <Tooltip title={'Light Mode'} placement="bottom">
                        <IconButton>
                            <LightModeRoundedIcon />
                        </IconButton>
                    </Tooltip>
                ) : (
                    <Tooltip title={'Dark Mode'} placement="bottom">
                        <IconButton>
                            <NightlightRoundIcon />
                        </IconButton>
                    </Tooltip>
                )}
            </div>
        </NavbarContainer>
    );
};

export default Navbar;
