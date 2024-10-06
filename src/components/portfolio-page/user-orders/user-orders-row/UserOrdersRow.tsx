import React from 'react';
import {
    ListItem,
    Typography,
    Box,
    ListItemText,
    Tooltip,
    Divider,
    Button,
    DialogActions,
    Dialog,
    DialogContent,
    DialogTitle,
    TextField,
} from '@mui/material';
import { Order, SellOrderStatus } from '../../../../types/Types';
import LoadingSpinner from '../../../common/spinner/LoadingSpinner';

interface UserOrdersRowProps {
    order: Order;
    kasPrice: number;
    walletConnected: boolean;
    handleDelist: (orderId: string) => void;
    handleRelist: (orderId: string) => void;
    handleEditOrder: (orderId: string, pricePerToken: number, totalPrice: number) => void;
    handleCancelOrder?: (orderId: string) => void;
    cancelOrderWaitingConfirmation: boolean;
    cancelOrderWaitingPayment: boolean;
    setCancelOrderWaitingConfirmation: (value: boolean) => void;
}

const UserOrdersRow: React.FC<UserOrdersRowProps> = (props) => {
    const {
        order,
        kasPrice,
        handleDelist,
        handleEditOrder,
        handleRelist,
        handleCancelOrder,
        cancelOrderWaitingConfirmation,
        cancelOrderWaitingPayment,
        setCancelOrderWaitingConfirmation,
    } = props;
    const [openEditDialog, setOpenEditDialog] = React.useState(false);
    const [pricePerToken, setPricePerToken] = React.useState('');
    const [totalPrice, setTotalPrice] = React.useState('');
    const [editError, setEditError] = React.useState('');
    const [openCancelDialog, setOpenCancelDialog] = React.useState(false);

    const handleCloseEditDialog = () => {
        setOpenEditDialog(false);
        setPricePerToken('');
        setTotalPrice('');
        setEditError('');
    };

    const formatPrice = (price: number) => {
        if (price >= 1) return price.toFixed(2);
        if (price >= 0.01) return price.toFixed(3);
        return price.toFixed(6);
    };

    // Format date for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString(); // Customize as per your requirement
    };

    const handleTotalPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const totalStr = e.target.value;
        setTotalPrice(totalStr);

        const total = parseFloat(totalStr);
        const amount = order.quantity; // The amount is fixed as per your requirement

        if (!isNaN(total)) {
            if (total >= 25) {
                // Minimum total price check
                setPricePerToken((total / amount).toFixed(2)); // Calculate price per token
                setEditError(''); // Clear error if any
            } else {
                setEditError('Total price must be at least 25 KAS.');
            }
        } else {
            setPricePerToken('');
            setEditError('');
        }
    };

    const handlePricePerTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const priceStr = e.target.value;
        setPricePerToken(priceStr);

        const pricePerTokenValue = parseFloat(priceStr);
        const amount = order.quantity;

        if (!isNaN(pricePerTokenValue)) {
            const newTotalPrice = pricePerTokenValue * amount;
            if (newTotalPrice >= 25) {
                setTotalPrice(newTotalPrice.toFixed(2)); // Calculate total price
                setEditError(''); // Clear error if any
            } else {
                setEditError('Total price must be at least 25 KAS.');
            }
        } else {
            setTotalPrice('');
            setEditError('');
        }
    };

    const editOrderHandler = async () => {
        if (pricePerToken === '' || totalPrice === '') {
            setEditError('Please fill in all fields');
            return;
        }
        if (isNaN(Number(pricePerToken)) || isNaN(Number(totalPrice))) {
            setEditError('Please enter a valid number');
            return;
        }
        if (Number(totalPrice) < 25) {
            setEditError('Total price must be at least 25 KAS.');
            return;
        }

        await handleEditOrder(order.orderId, Number(pricePerToken), Number(totalPrice));
        handleCloseEditDialog();
    };

    const cancelOrderHandler = async (orderId: string) => {
        await handleCancelOrder(orderId);
        setOpenCancelDialog(false);
        setCancelOrderWaitingConfirmation(false);
    };

    return (
        <div key={order.orderId}>
            <ListItem disablePadding sx={{ height: '12vh' }}>
                {/* Order Ticker */}
                <ListItemText
                    sx={{ width: '3vw', marginLeft: '1rem' }}
                    primary={
                        <Typography variant="body1" sx={{ fontSize: '0.75rem', fontWeight: 'bold' }}>
                            {order.ticker}
                        </Typography>
                    }
                />

                {/* Created At */}
                <ListItemText
                    sx={{ width: '12vw' }}
                    primary={
                        <Typography
                            variant="body1"
                            sx={{ fontSize: '0.75rem', fontWeight: 'bold', justifyContent: 'center' }}
                        >
                            {formatDate(order.createdAt)}
                        </Typography>
                    }
                />

                {/* Quantity */}
                <ListItemText
                    sx={{ width: '2vw' }}
                    primary={
                        <Typography variant="body1" sx={{ fontSize: '0.75rem', fontWeight: 'bold' }}>
                            {order.quantity}
                        </Typography>
                    }
                />

                {/* Price Per Token */}
                <ListItemText
                    sx={{ width: '5vw' }}
                    primary={
                        <Tooltip title={`${order.pricePerToken} KAS`}>
                            <Typography
                                variant="body1"
                                style={{
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    justifyContent: 'center',
                                }}
                            >
                                {formatPrice(order.pricePerToken)}
                            </Typography>
                        </Tooltip>
                    }
                />

                {/* Total Price */}
                <ListItemText
                    sx={{ width: '6vw' }}
                    primary={
                        <Typography
                            variant="body1"
                            style={{
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                display: 'flex',
                                justifyContent: 'center',
                            }}
                        >
                            {order.totalPrice.toFixed(2)} KAS
                        </Typography>
                    }
                    secondary={
                        <Typography
                            variant="body2"
                            style={{
                                fontSize: '0.7rem',
                                display: 'flex',
                                justifyContent: 'center',
                                color: 'gray', // Optional: to differentiate the secondary text
                            }}
                        >
                            (${(order.totalPrice * kasPrice).toFixed(2)})
                        </Typography>
                    }
                />
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        width: '24vw',
                        justifyContent: 'center',
                        paddingRight: '9rem',
                    }}
                >
                    {order.status === SellOrderStatus.OFF_MARKETPLACE && (
                        <>
                            <Tooltip title="Relist is to put the order back to sell">
                                <Button
                                    onClick={() => handleRelist(order.orderId)}
                                    variant="contained"
                                    color="primary"
                                    sx={{
                                        minWidth: '3.5vw',
                                        width: '3vw',
                                        fontSize: '0.6rem',
                                    }}
                                >
                                    Relist
                                </Button>
                            </Tooltip>

                            <Tooltip title="Edit is to change the order details">
                                <Button
                                    onClick={() => setOpenEditDialog(true)}
                                    variant="contained"
                                    color="primary"
                                    sx={{
                                        minWidth: '3.5vw',
                                        width: '3vw',
                                        fontSize: '0.6rem',
                                    }}
                                >
                                    Edit
                                </Button>
                            </Tooltip>

                            <Tooltip title="Cancel is to retrieve the tokens back to your wallet">
                                <Button
                                    onClick={() => setOpenCancelDialog(true)}
                                    variant="contained"
                                    color="primary"
                                    sx={{
                                        minWidth: '3.5vw',
                                        width: '3vw',
                                        fontSize: '0.6rem',
                                    }}
                                >
                                    Cancel
                                </Button>
                            </Tooltip>
                        </>
                    )}

                    {order.status === SellOrderStatus.LISTED_FOR_SALE && (
                        <Button
                            onClick={() => handleDelist(order.orderId)}
                            variant="contained"
                            color="primary"
                            sx={{
                                minWidth: '3.5vw',
                                width: '3vw',
                                fontSize: '0.7rem',
                            }}
                        >
                            Delist
                        </Button>
                    )}
                </Box>
            </ListItem>
            <Divider />
            <Dialog
                PaperProps={{
                    sx: {
                        width: '40vw',
                    },
                }}
                open={openEditDialog}
                onClose={handleCloseEditDialog}
            >
                <DialogTitle>Edit Order - Amount of Tokens: {order.quantity}</DialogTitle>
                <DialogContent>
                    <>
                        <TextField
                            margin="dense"
                            id="totalPrice"
                            label="Total Price"
                            type="text"
                            fullWidth
                            variant="outlined"
                            value={totalPrice}
                            onChange={handleTotalPriceChange}
                            error={!!editError}
                            helperText={editError || ''}
                        />
                        <TextField
                            autoFocus
                            margin="dense"
                            id="pricePerToken"
                            label="Price Per Token"
                            type="text"
                            fullWidth
                            variant="outlined"
                            value={pricePerToken}
                            onChange={handlePricePerTokenChange}
                            error={!!editError}
                        />

                        {/* Total Price Field */}
                    </>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseEditDialog}>Cancel</Button>
                    <Button onClick={editOrderHandler}>Save</Button>
                </DialogActions>
            </Dialog>
            <Dialog
                PaperProps={{
                    sx: {
                        width: '40vw',
                    },
                }}
                open={openCancelDialog}
                onClose={() => setOpenCancelDialog(false)}
            >
                <DialogTitle sx={{ fontWeight: 'bold' }}>
                    {cancelOrderWaitingPayment || cancelOrderWaitingConfirmation ? '' : 'Cancel Order Process'}
                </DialogTitle>
                <DialogContent>
                    {/* Conditionally show the loading spinner or the content based on the state */}
                    {cancelOrderWaitingPayment ? (
                        <LoadingSpinner title="Waiting for payment in wallet" size={60} />
                    ) : cancelOrderWaitingConfirmation ? (
                        <LoadingSpinner title="Waiting for confirmation" size={60} />
                    ) : (
                        <Box sx={{ marginBottom: 2 }}>
                            <Typography variant="body1">
                                To cancel your order and retrieve your tokens, you will need to send{' '}
                                <strong>5 Kas</strong> to cover the expected gas fees. This ensures the transaction
                                can be processed smoothly on the network.{' '}
                                <strong>
                                    In most cases, you will receive approximately 4.9 Kas back, depends on network
                                    fees
                                </strong>{' '}
                                after the tokens are successfully sent and the transaction is completed.
                            </Typography>
                            <Typography variant="body1" sx={{ marginTop: 2 }}>
                                The <strong>small difference</strong> accounts for minor fluctuations in network
                                fees, but rest assured,{' '}
                                <strong>the majority of your sent amount will be returned to your wallet</strong>.
                            </Typography>
                            <Typography variant="body1" sx={{ marginTop: 2 }}>
                                Please confirm if you wish to proceed with the cancellation process.
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                {cancelOrderWaitingConfirmation || cancelOrderWaitingPayment ? null : (
                    <DialogActions>
                        <Button onClick={() => cancelOrderHandler(order.orderId)} variant="contained">
                            Cancel Order
                        </Button>
                        <Button onClick={() => setOpenCancelDialog(false)}>Exit</Button>
                    </DialogActions>
                )}
            </Dialog>
        </div>
    );
};

export default UserOrdersRow;
