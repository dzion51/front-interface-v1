import moment from 'moment';
import { getTxnInfo } from '../DAL/KaspaApiDal';

export enum ThemeModes {
    DARK = 'dark',
    LIGHT = 'light',
}
const KASPIANO_WALLET = import.meta.env.VITE_APP_KAS_WALLET_ADDRESS;

export const getLocalThemeMode = () =>
    localStorage.getItem('theme_mode') ? (localStorage.getItem('theme_mode') as ThemeModes) : ThemeModes.DARK;

export const setWalletBalanceUtil = (balanceInKaspa: number) =>
    isNaN(balanceInKaspa) ? 0 : parseFloat(balanceInKaspa.toFixed(4));

export function simplifyNumber(value) {
    if (value >= 1e12) {
        return `${(value / 1e12).toFixed(0)}T`;
    } else if (value >= 1e9) {
        return `${(value / 1e9).toFixed(0)}B`;
    } else if (value >= 1e6) {
        return `${(value / 1e6).toFixed(0)}M`;
    } else if (value >= 1e3) {
        return `${(value / 1e3).toFixed(0)}K`;
    } else {
        return value?.toString().length <= 7 ? value : 'Value too BIG';
    }
}

export const formatNumberWithCommas = (value) => value?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export const shortenAddress = (address, startLength = 6, endLength = 4) => {
    if (address.length <= startLength + endLength) {
        return address;
    }
    const start = address.substring(0, startLength);
    const end = address.substring(address.length - endLength);
    return `${start}...${end}`;
};

export const formatDate = (timestamp: string | number): string => moment(Number(timestamp)).format('DD/MM/YYYY');

export const capitalizeFirstLetter = (string: string): string => {
    if (!string) return string;
    return string.charAt(0).toUpperCase() + string.slice(1);
};

export const convertToProtocolFormat = (value: string): string => (parseFloat(value) * 1e8).toFixed(0);

export function generateNonce() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Function to generate a unique request ID
export function generateRequestId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0,
            v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const verifyPaymentTransaction = async (
    txnId: string,
    senderAddr: string,
    amount: number,
    receiverAddr = KASPIANO_WALLET,
): Promise<boolean> => {
    const txnInfo = await getTxnInfo(txnId);
    if (!txnInfo) {
        console.error('Transaction info not found.');
        return false;
    }

    // 1. Verify sender address
    const input = txnInfo.inputs.find((input: any) => input.previous_outpoint_address === senderAddr);

    if (!input) {
        console.error('Sender address not found in the inputs.');
        return false;
    }

    // 2. Verify the output amount and receiver address
    const output = txnInfo.outputs.find(
        (output: any) => output.amount === amount && output.script_public_key_address === receiverAddr,
    );

    if (!output) {
        console.error('Receiver address or amount mismatch in the outputs.');
        return false;
    }

    // If both checks pass
    return true;
};
