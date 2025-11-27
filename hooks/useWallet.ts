import { useState, useEffect } from 'react';

export const useWallet = () => {
  const [userWalletAddress, setUserWalletAddress] = useState('');

  const connectWallet = async () => {
    const ethereum = (window as any).ethereum;
    
    if (!ethereum) {
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
      alert("Connection rejected. Please approve the connection in your wallet.");
    }
  };

  const disconnectWallet = () => {
    setUserWalletAddress('');
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

  return { userWalletAddress, connectWallet, disconnectWallet };
};
