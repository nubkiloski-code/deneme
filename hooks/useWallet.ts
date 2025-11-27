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
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts.length > 0) {
        setUserWalletAddress(accounts[0]);
      }
    } catch (error) {
      console.error("User rejected connection", error);
      // Don't alert if user just closed the modal, only on actual error
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
            // Note: This is a basic conversion. For production, use ethers.js or viem
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
            window.location.href = `bitcoin:${toAddress}?amount=${amount}`;
            return null;
        }
        else if (currency === CryptoCurrency.LTC) {
            window.location.href = `litecoin:${toAddress}?amount=${amount}`;
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
      // 1. Check if already connected (Auto-connect on reload)
      ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts && accounts.length > 0) {
            console.log("Wallet auto-connected:", accounts[0]);
            setUserWalletAddress(accounts[0]);
          }
        })
        .catch((err: any) => console.error("Error checking wallet connection:", err));

      // 2. Listen for account changes
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