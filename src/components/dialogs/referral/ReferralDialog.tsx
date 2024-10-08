import React, { useState } from 'react';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Button,
    TextField,
    Box,
    Typography,
    IconButton,
} from '@mui/material';
import {
    AccountCircle as AccountIcon,
    Redeem as RedeemIcon,
    ContentCopyRounded as ContentCopyRoundedIcon,
} from '@mui/icons-material';
import { addReferredBy, getUserReferral } from '../../../DAL/BackendDAL';
import { showGlobalSnackbar } from '../../alert-context/AlertContext';

interface ReferralDialogProps {
    open: boolean;
    onClose: () => void;
    walletAddress: string;
    referralCode?: string | null; // Used to display referral code if it exists
    mode: 'get' | 'add'; // To control the mode of the dialog (get vs. add referral)
    setReferralCode?: (referredBy: string) => void;
}

const ReferralDialog: React.FC<ReferralDialogProps> = ({
    open,
    onClose,
    walletAddress,
    referralCode,
    mode,
    setReferralCode,
}) => {
    const [referredByCode, setReferredByCode] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [retrievedReferralCode, setRetrievedReferralCode] = useState<string | null>(referralCode || null);

    const [, setCopied] = useState(false);

    // Copy referral code to clipboard
    const copyToClipboard = (text: string) => {
        navigator.clipboard
            .writeText(text)
            .then(() => {
                setCopied(true);
                showGlobalSnackbar({
                    message: 'Copied to clipboard',
                    severity: 'success',
                });
                setTimeout(() => setCopied(false), 2000);
            })
            .catch((err) => {
                console.error('Failed to copy: ', err);
            });
    };

    // Add referred by code
    const handleAddReferredBy = async () => {
        setLoading(true);

        const result = await addReferredBy(walletAddress, referredByCode);
        if (result) {
            if (setReferralCode) {
                setReferralCode(referredByCode);
            }
            showGlobalSnackbar({
                message: 'Referred by code added successfully!',
                severity: 'success',
            });
        } else {
            showGlobalSnackbar({
                message: 'Failed to add referred by code.',
                severity: 'error',
            });
        }
        setReferredByCode('');
        setLoading(false);
        onClose();
    };

    const handleGetReferralCode = async () => {
        setLoading(true);
        try {
            const result = await getUserReferral(walletAddress); // Call the correct service function
            if (result && result.referralCode) {
                setRetrievedReferralCode(result.referralCode); // Set the retrieved referral code
                showGlobalSnackbar({
                    message: 'Referral code retrieved successfully.',
                    severity: 'success',
                });
            } else {
                throw new Error('Referral code not found.');
            }
        } catch (error) {
            showGlobalSnackbar({
                message: 'Failed to retrieve referral code.',
                severity: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Box display="flex" alignItems="center">
                    <RedeemIcon fontSize="large" style={{ marginRight: 10 }} />
                    {mode === 'get' ? (
                        <Typography variant="h6">Your Referral Code</Typography>
                    ) : (
                        <Box
                            sx={{
                                display: 'flex',
                                width: '100%', // Full width
                                justifyContent: 'space-between', // Align Typography and Button with space in-between
                                alignItems: 'center', // Vertically center the Typography and Button
                            }}
                        >
                            <Typography variant="h6">Referral System</Typography>
                            <Button
                                sx={{ marginLeft: 'auto' }}
                                variant="outlined"
                                color="secondary"
                                onClick={
                                    retrievedReferralCode
                                        ? () => copyToClipboard(retrievedReferralCode)
                                        : handleGetReferralCode
                                }
                                disabled={loading}
                                endIcon={retrievedReferralCode && <ContentCopyRoundedIcon fontSize="small" />}
                            >
                                {retrievedReferralCode ? retrievedReferralCode : 'Get Referral Code'}
                            </Button>
                        </Box>
                    )}
                </Box>
            </DialogTitle>
            <DialogContent>
                {mode === 'get' && referralCode ? (
                    <Box display="flex" alignItems="center" justifyContent="center">
                        <AccountIcon fontSize="large" style={{ marginRight: 10 }} />
                        <Typography>
                            <strong>{referralCode}</strong>
                        </Typography>
                        <IconButton
                            onClick={() => copyToClipboard(referralCode)}
                            aria-label="Copy Referral Code"
                            sx={{ marginLeft: 1 }}
                        >
                            <ContentCopyRoundedIcon />
                        </IconButton>
                    </Box>
                ) : (
                    <>
                        <Box display="flex" alignItems="center">
                            <AccountIcon fontSize="large" style={{ marginRight: 10 }} />
                            <Typography>
                                Welcome to our referral program! Share your referral code with others, and when
                                they sign up, both of you will earn points. The more you share, the more you earn!
                            </Typography>
                        </Box>
                        <Box marginTop={1} display="flex" flexDirection="column" alignItems="center">
                            {/* Input field to add a referral code */}
                            <TextField
                                label="Referral Code"
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                value={referredByCode}
                                onChange={(e) => setReferredByCode(e.target.value)}
                            />

                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                onClick={handleAddReferredBy}
                                disabled={loading || referredByCode.length === 0}
                            >
                                Submit Referral Code
                            </Button>
                        </Box>
                    </>
                )}
            </DialogContent>
            <DialogActions sx={{ paddingTop: 0 }}>
                <Button onClick={onClose} color="secondary">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ReferralDialog;
