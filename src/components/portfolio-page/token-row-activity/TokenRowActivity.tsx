import { Divider, ListItem, ListItemText, Tooltip, Typography } from '@mui/material';
import { FC } from 'react';
import { TokenRowActivityItem } from '../../../types/Types';
import { capitalizeFirstLetter } from '../../../utils/Utils';

interface TokenRowActivityProps {
    token: TokenRowActivityItem;
    walletConnected: boolean;
    kasPrice: number;
    walletBalance: number;
}

const TokenRowActivity: FC<TokenRowActivityProps> = (props) => {
    const { token } = props;

    return (
        <div key={token.ticker}>
            <ListItem disablePadding sx={{ height: '12vh', marginLeft: '1.4vw' }}>
                <ListItemText
                    sx={{
                        width: '10vw',
                    }}
                    primary={
                        <Tooltip title={token.ticker}>
                            <Typography variant="body1" sx={{ fontSize: '0.75rem' }}>
                                {capitalizeFirstLetter(token.ticker)}
                            </Typography>
                        </Tooltip>
                    }
                />

                <ListItemText
                    sx={{ width: '10vw' }}
                    primary={
                        <Typography
                            variant="body1"
                            style={{
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                display: 'flex',
                                justifyContent: 'start',
                            }}
                        >
                            {token.amount}
                        </Typography>
                    }
                />
                <ListItemText
                    sx={{ width: '10vw' }}
                    primary={
                        <Typography
                            variant="body1"
                            style={{
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                display: 'flex',
                                justifyContent: 'start',
                            }}
                        >
                            {token.type}
                        </Typography>
                    }
                />
                <ListItemText
                    sx={{ width: '32vw' }}
                    primary={
                        <Typography
                            variant="body1"
                            style={{
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                display: 'flex',
                                justifyContent: 'start',
                            }}
                        >
                            {token.time}
                        </Typography>
                    }
                />
            </ListItem>
            <Divider />
        </div>
    );
};

export default TokenRowActivity;
