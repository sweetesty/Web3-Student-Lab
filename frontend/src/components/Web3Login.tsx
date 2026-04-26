'use client';

import { AlertCircle, CheckCircle, Loader2, Wallet } from 'lucide-react';
import React, { useState } from 'react';
import { Web3AuthResponse, web3AuthService } from '../services/web3.service';

// Add TypeScript declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

interface Web3LoginProps {
  onLoginSuccess?: (user: Web3AuthResponse) => void;
  onLoginError?: (error: Error) => void;
  className?: string;
}

export const Web3Login: React.FC<Web3LoginProps> = ({
  onLoginSuccess,
  onLoginError,
  className = '',
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const handleConnectWallet = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if MetaMask is installed
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
      }

      // Get wallet address first
      const address = await web3AuthService.getWalletAddress();
      if (address) {
        setWalletAddress(address);
      }

      // Authenticate with Web3
      const authResponse = await web3AuthService.authenticate();

      setWalletAddress(authResponse.user.email); // Will show wallet address
      onLoginSuccess?.(authResponse);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      setError(errorMessage);
      onLoginError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    web3AuthService.disconnect();
    setWalletAddress(null);
    setError(null);
  };

  // Check if already connected on mount
  React.useEffect(() => {
    const storedUser = web3AuthService.getStoredUser();
    if (storedUser) {
      setWalletAddress(storedUser.email);
    }
  }, []);

  return (
    <div className={`web3-login ${className}`}>
      {walletAddress ? (
        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-900">Wallet Connected</p>
              <p className="text-xs text-green-700 font-mono">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </p>
            </div>
          </div>

          <button
            onClick={handleDisconnect}
            className="flex items-center justify-center space-x-2 w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            <Wallet className="h-4 w-4" />
            <span>Disconnect Wallet</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col space-y-4">
          <button
            onClick={handleConnectWallet}
            disabled={isLoading}
            className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors font-medium"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <Wallet className="h-4 w-4" />
                <span>Connect Wallet</span>
              </>
            )}
          </button>

          {error && (
            <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="text-xs text-gray-500 text-center">
            <p>Connect your Ethereum wallet to sign in securely.</p>
            <p className="mt-1">Requires MetaMask or compatible wallet.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Web3Login;
