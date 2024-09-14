import { FC, useEffect, useState } from 'react';
import { PortfolioLayout } from './PortfolioPageLayout';
import UserProfile from '../../components/portfolio-page/user-profile/UserProfile';
import PortfolioPanel from '../../components/portfolio-page/portfolio-tab-panel/PortfolioPanel';
import { kaspaLivePrice } from '../../DAL/KaspaApiDal';
import { PortfolioValue, TokenRowActivityItem, TokenRowPortfolioItem } from '../../types/Types';
import { fetchWalletActivity, fetchWalletKRC20TokensBalance } from '../../DAL/Krc20DAL';
import { fetchTokenPortfolio } from '../../DAL/BackendDAL';

interface PortfolioPageProps {
    walletAddress: string | null;
    backgroundBlur: boolean;
    walletConnected: boolean;
    walletBalance: number;
}

const portfolioValue: PortfolioValue = {
    kas: 6089.56,
    change: 14.5,
    changeDirection: 'increase',
};

// export const mockTokenRowPortfolioItems: TokenRowPortfolioItem[] = [
//     {
//         ticker: 'KASPER',
//         balance: '1,200.50',
//         price: '0.032',
//         logoUrl: '/kasper.svg',
//     },
//     {
//         ticker: 'NACHO',
//         balance: '8,000.00',
//         price: '0.025',
//         logoUrl: '/nacho.svg',
//     },
//     {
//         ticker: 'KEKE',
//         balance: '5,500.75',
//         price: '0.015',
//         logoUrl: '/keke.jpg',
//     },
// ];

const PortfolioPage: FC<PortfolioPageProps> = (props) => {
    const { walletAddress, backgroundBlur, walletConnected, walletBalance } = props;
    const [kasPrice, setkasPrice] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isLoadingActivity, setIsLoadingActivity] = useState<boolean>(false);
    const [portfolioAssetTickers, setPortfolioAssetTickers] = useState<string[]>([]);
    const [portfolioAssetsActivity, setPortfolioAssetsActivity] = useState<TokenRowActivityItem[]>([]);
    const [portfolioTokenInfo, setPortfolioTokenInfo] = useState<TokenRowPortfolioItem[]>([]);
    const [paginationActivityKey, setPaginationActivityKey] = useState<string | null>(null);
    const [paginationActivityDirection, setPaginationActivityDirection] = useState<'next' | 'prev' | null>(null);
    const [activityNext, setActivityNext] = useState<string | null>(null);
    const [activityPrev, setActivityPrev] = useState<string | null>(null);
    const [paginationPortfolioKey, setPaginationPortfolioKey] = useState<string | null>(null);
    const [paginationPortfolioDirection, setPaginationPortfolioDirection] = useState<'next' | 'prev' | null>(null);
    const [portfolioNext, setPortfolioNext] = useState<string | null>(null);
    const [portfolioPrev, setPortfolioPrev] = useState<string | null>(null);
    const [lastActivityPage, setLastActivityPage] = useState<boolean>(false);
    const [lastPortfolioPage, setLastPortfolioPage] = useState<boolean>(false);
    const [operationFinished, setOperationFinished] = useState<boolean>(false);

    useEffect(() => {
        const fetchPrice = async () => {
            const newPrice = await kaspaLivePrice();
            setkasPrice(newPrice);
        };

        // Fetch the price immediately when the component mounts
        fetchPrice();

        // Set up the interval to fetch the price every 30 seconds
        const interval = setInterval(fetchPrice, 30000);

        // Clean up the interval when the component unmounts
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const fetchPortfolioData = async () => {
            setIsLoading(true);
            try {
                const tokenData = await fetchWalletKRC20TokensBalance(
                    walletAddress,
                    paginationPortfolioKey,
                    paginationPortfolioDirection,
                );

                // Extract the tickers for later use in metadata fetch
                const tickers = tokenData.portfolioItems.map((token) => token.ticker);
                const tickersPortfolio = await fetchTokenPortfolio(tickers);

                // Update tokenData with logo URLs
                const updatedTokenData = tokenData.portfolioItems.map((token) => {
                    const tokenInfo = tickersPortfolio.find((item) => item.ticker === token.ticker);
                    return {
                        ...token,
                        state: tokenInfo ? tokenInfo.state : null,
                        logoUrl: tokenInfo ? tokenInfo.logo : null,
                    };
                });

                setPortfolioAssetTickers(tickers);

                // Set the portfolio token info state
                setPortfolioTokenInfo(updatedTokenData);
                setPortfolioNext(tokenData.next); // Save the 'next' key for further requests
                setPortfolioPrev(tokenData.prev); // Save the 'prev' key for further requests
                const checkNext = await fetchWalletKRC20TokensBalance(walletAddress, tokenData.next, 'next');
                if (checkNext.portfolioItems.length === 0) {
                    setLastPortfolioPage(true);
                } else {
                    setLastPortfolioPage(false);
                }
            } catch (error) {
                console.error('Error fetching portfolio data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (walletConnected) {
            fetchPortfolioData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [walletAddress, walletConnected, operationFinished, paginationPortfolioKey]);

    useEffect(() => {
        const fetchActivity = async () => {
            setIsLoadingActivity(true);
            try {
                const activityData = await fetchWalletActivity(
                    walletAddress,
                    paginationActivityKey,
                    paginationActivityDirection,
                );
                setPortfolioAssetsActivity(activityData.activityItems);
                setActivityNext(activityData.next); // Save the 'next' key for further requests
                setActivityPrev(activityData.prev); // Save the 'prev' key for further requests
                const checkNext = await fetchWalletActivity(walletAddress, activityData.next, 'next');
                if (checkNext.activityItems.length === 0) {
                    setLastActivityPage(true);
                } else {
                    setLastActivityPage(false);
                }
            } catch (error) {
                console.error('Error fetching activity data:', error);
            } finally {
                setIsLoadingActivity(false);
            }
        };

        if (walletConnected) {
            fetchActivity();
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [walletAddress, walletConnected, paginationActivityKey, operationFinished]);

    const handleActivityPagination = (direction: 'next' | 'prev') => {
        setPortfolioAssetsActivity([]);
        setPaginationActivityDirection(direction);
        setPaginationActivityKey(direction === 'next' ? activityNext : activityPrev);
    };

    const handlePortfolioPagination = (direction: 'next' | 'prev') => {
        setPortfolioTokenInfo([]);
        setPaginationPortfolioDirection(direction);
        setPaginationPortfolioKey(direction === 'next' ? portfolioNext : portfolioPrev);
    };

    const handleChange = () => {
        setTimeout(() => {
            setOperationFinished((prev) => !prev);
            console.log('Operation finished', operationFinished);
        }, 9000); // 5000 milliseconds = 5 seconds
    };

    return (
        <PortfolioLayout backgroundBlur={backgroundBlur}>
            <UserProfile walletAddress={walletAddress} portfolioValue={portfolioValue} kasPrice={kasPrice} />
            <PortfolioPanel
                handleChange={handleChange}
                handleActivityPagination={handleActivityPagination}
                handlePortfolioPagination={handlePortfolioPagination}
                lastPortfolioPage={lastPortfolioPage}
                lastActivityPage={lastActivityPage}
                walletBalance={walletBalance}
                isLoading={isLoading}
                isLoadingActivity={isLoadingActivity}
                kasPrice={kasPrice}
                walletConnected={walletConnected}
                tokenList={portfolioTokenInfo}
                tokensActivityList={portfolioAssetsActivity}
                tickers={portfolioAssetTickers}
            />
        </PortfolioLayout>
    );
};

export default PortfolioPage;
