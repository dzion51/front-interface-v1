import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import {
    Avatar,
    Button,
    Divider,
    ListItem,
    ListItemAvatar,
    ListItemButton,
    ListItemText,
    Tooltip,
    Typography,
} from '@mui/material';
import moment from 'moment';
import { FC } from 'react';
import { formatNumberWithCommas, simplifyNumber } from '../../../utils/Utils';
import { capitalizeFirstLetter, formatDate } from '../grid-krc-20/Krc20Grid.config';
import { mintKRC20Token } from '../../../utils/KaswareUtils';
import { Stat, StatNumber, StatHelpText, StatArrow } from '@chakra-ui/react';
import { useAlert } from '../../../utils/UseAlert';

interface TokenRowProps {
    token: any;
    handleItemClick: (token: any) => void;
    tokenKey: string;
    walletBalance: number;
    walletConnected: boolean;
}

export const TokenRow: FC<TokenRowProps> = (props) => {
    const { token, handleItemClick, tokenKey, walletBalance, walletConnected } = props;
    const { showAlert } = useAlert();

    const handleMint = async (event, ticker: string) => {
        event.stopPropagation();
        if (!walletConnected) {
            showAlert('Please connect your wallet to mint a token', 'error');
            return;
        }
        if (walletBalance < 1) {
            showAlert('You need at least 1 KAS to mint a token', 'error');
            return;
        }
        const inscribeJsonString = JSON.stringify({
            p: 'KRC-20',
            op: 'mint',
            tick: ticker,
        });
        try {
            const mint = await mintKRC20Token(inscribeJsonString);
            if (mint) {
                const { commit, reveal } = JSON.parse(mint);
                showAlert('Token minted successfully', 'success', null, commit, reveal);
                console.log(mint);
            }
        } catch (error) {
            showAlert('Token minting failed', 'error', error.message);
        }
    };

    const preMintedIcons = (preMinted: string, totalSupply: string) => {
        const preMintedNumber = parseFloat(preMinted);
        const totalSupplyNumber = parseFloat(totalSupply);
        const preMintPercentage = ((preMintedNumber / totalSupplyNumber) * 100).toFixed(2);

        return (
            <ListItemText
                sx={{ display: 'flex', justifyContent: 'center' }}
                primary={
                    <Tooltip title={`${preMintPercentage}% Pre Minted`}>
                        {preMintedNumber === 0 ? (
                            <CheckCircleOutlineRoundedIcon style={{ color: 'green', opacity: 0.5 }} />
                        ) : (
                            <ErrorOutlineRoundedIcon style={{ color: 'red', opacity: 0.5 }} />
                        )}
                    </Tooltip>
                }
            />
        );
    };

    return (
        <div key={tokenKey}>
            <ListItem onClick={() => handleItemClick(token)} disablePadding sx={{ height: '12vh' }}>
                <ListItemButton>
                    <ListItemAvatar>
                        <Avatar
                            sx={{
                                width: '6vh',
                                height: '6vh',
                            }}
                            style={{
                                marginLeft: '0.1vw',
                                borderRadius: 5,
                            }}
                            variant="square"
                            alt={token.tick}
                            src="/kaspa.svg"
                        />
                    </ListItemAvatar>

                    <ListItemText
                        sx={{
                            maxWidth: '11vw',
                        }}
                        primary={
                            <Tooltip title={token.tick}>
                                <Typography variant="body1" style={{ fontSize: '1.2vw' }}>
                                    {capitalizeFirstLetter(token.tick)}
                                </Typography>
                            </Tooltip>
                        }
                        secondary={
                            <Typography variant="body2" style={{ fontSize: '1.1vw' }}>
                                {formatDate(token.mtsAdd)}
                            </Typography>
                        }
                    />

                    <ListItemText
                        sx={{ maxWidth: '8vw' }}
                        primary={
                            <Typography
                                variant="body2"
                                style={{ fontSize: '1.1vw', display: 'flex', justifyContent: 'center' }}
                            >
                                {`${moment().diff(Number(token.mtsAdd), 'days')} days`}
                            </Typography>
                        }
                    />
                    <ListItemText
                        sx={{ maxWidth: '11vw' }}
                        primary={
                            <Tooltip title={formatNumberWithCommas(token.max)}>
                                <Typography
                                    variant="body2"
                                    style={{ fontSize: '1.1vw', display: 'flex', justifyContent: 'center' }}
                                >
                                    {simplifyNumber(token.max)}
                                </Typography>
                            </Tooltip>
                        }
                    />
                    <Stat sx={{ maxWidth: '11vw' }}>
                        <StatNumber style={{ fontSize: '1.1vw' }}>
                            {((token.minted / token.max) * 100).toFixed(2)}%
                        </StatNumber>
                        <StatHelpText style={{ fontSize: '0.8vw' }}>
                            <StatArrow sx={{ color: 'green', marginRight: '2px' }} type="increase" />
                            23.36%
                        </StatHelpText>
                    </Stat>
                    {/* <ListItemText
                        sx={{ maxWidth: '11vw' }}
                        primary={
                            <Typography variant="body2" style={{ fontSize: '1.1vw' }}>
                                {((token.minted / token.max) * 100).toFixed(2)}%
                            </Typography>
                        }
                    /> */}

                    <Stat sx={{ maxWidth: '11vw' }}>
                        <StatNumber style={{ fontSize: '1.1vw' }}>
                            {token.holder ? token.holder.length : 0}
                        </StatNumber>
                        <StatHelpText style={{ fontSize: '0.8vw' }}>
                            <StatArrow sx={{ color: 'green', marginRight: '2px' }} type="increase" />
                            10.36%
                        </StatHelpText>
                    </Stat>
                    {/* <ListItemText
                        sx={{ maxWidth: '9.5vw' }}
                        primary={
                            <Typography variant="body2" style={{ fontSize: '1.1vw' }}>
                                {token.holder ? token.holder.length : 0}
                            </Typography>
                        }
                    /> */}

                    {/* <ListItemText
                        sx={{ maxWidth: '9.5vw' }}
                        primary={
                            <Typography variant="body2" style={{ fontSize: '1.1vw' }}>
                                {token.transferTotal ? token.transferTotal : 0}
                            </Typography>
                        }
                    /> */}

                    <ListItemText
                        sx={{ maxWidth: '11vw' }}
                        primary={
                            <Typography variant="body2" style={{ fontSize: '1.1vw' }}>
                                {preMintedIcons(token.pre, token.max)}
                            </Typography>
                        }
                    />
                    {token.minted < token.max && (
                        <ListItemText
                            sx={{ maxWidth: '11vw', display: 'flex', justifyContent: 'center' }}
                            primary={
                                <Button
                                    onClick={(event) => handleMint(event, token.tick)}
                                    variant="contained"
                                    color="primary"
                                    style={{
                                        minWidth: '2vw',
                                        width: '3vw',
                                        fontSize: '0.8vw',
                                    }}
                                    disabled={token.minted >= token.max}
                                >
                                    Mint
                                </Button>
                            }
                        />
                    )}
                </ListItemButton>
            </ListItem>
            <Divider />
        </div>
    );
};
