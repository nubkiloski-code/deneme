import { useState, useEffect } from 'react';
import { CryptoCurrency } from '../types';

export const useWallet = () => {
  const [userWalletAddress, setUserWalletAddress] = useState('');

  const connectWallet = async () => {
    const ethereum = (window as any).ethereum;
    
    if (!ethereum) {
      // Check if mobile - if so, deep link to MetaMask
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
          window.location.href = `dapp://${window.location.host}`;
          return;
      }
      
      // Standard alert for desktop
      alert("No crypto wallet detected. Please install a Web3 wallet like MetaMask, Phantom, or Coinbase Wallet.");
      return;
    }

    try {
      // Force permission request to ensure the wallet "Asks" every time
      // This replaces the silent 'eth_requestAccounts' if permissions already exist
      await ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }]
      });

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts.length > 0) {
        setUserWalletAddress(accounts[0]);
      }
    } catch (error: any) {
      // Fallback for wallets that don't support wallet_requestPermissions (like some mobile wallets)
      if (error.code === 4001) {
          console.log("User rejected connection");
      } else {
          console.warn("wallet_requestPermissions failed, falling back to standard request");
          try {
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            if (accounts && accounts.length > 0) {
                setUserWalletAddress(accounts[0]);
            }
          } catch (e) {
            console.error("Connection error", e);
          }
      }
    }
  };

  const disconnectWallet = () => {
    setUserWalletAddress('');
  };

  const sendTransaction = async (toAddress: string, amount: number, currency: CryptoCurrency): Promise<string | null> => {
    const ethereum = (window as any).ethereum;

    try {
        if (currency === CryptoCurrency.ETH) {
            if (!ethereum) {
                alert("MetaMask is required for automatic ETH payments.");
                return null;
            }
            
            // Convert ETH to Wei (18 decimals)
            const weiValue = "0x" + (amount * 1e18).toString(16);

            const txHash = await ethereum.request({
                method: 'eth_sendTransaction',
                params: [
                    {
                        from: userWalletAddress,
                        to: toAddress,
                        value: weiValue,
                    },
                ],
            });
            return txHash;
        } 
        else if (currency === CryptoCurrency.BTC) {
            // Use window.open for protocols to avoid unmounting React components
            const url = `bitcoin:${toAddress}?amount=${amount}`;
            window.open(url, '_self');
            return null;
        }
        else if (currency === CryptoCurrency.LTC) {
            const url = `litecoin:${toAddress}?amount=${amount}`;
            window.open(url, '_self');
            return null;
        }
        
        return null;
    } catch (error) {
        console.error("Payment failed:", error);
        return null;
    }
  };

  useEffect(() => {
    const ethereum = (window as any).ethereum;
    if (ethereum) {
      // NOTE: Auto-connect removed as per request to "always ask"
      
      // Listen for account changes (e.g. if user switches account in extension)
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts && accounts.length > 0) {
          console.log("Wallet changed:", accounts[0]);
          setUserWalletAddress(accounts[0]);
        } else {
          console.log("Wallet disconnected");
          setUserWalletAddress('');
        }
      };

      ethereum.on('accountsChanged', handleAccountsChanged);

      return () => {
        if (ethereum.removeListener) {
            ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
      };
    }
  }, []);

  return { userWalletAddress, connectWallet, disconnectWallet, sendTransaction };
};