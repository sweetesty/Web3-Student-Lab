'use client';

import React, { useState } from 'react';
import Web3Login from '../components/Web3Login';
import { Web3AuthResponse } from '../services/web3.service';
import { User, LogOut, Shield, Key } from 'lucide-react';

export default function Web3AuthExample() {
  const [user, setUser] = useState<Web3AuthResponse['user'] | null>(null);
  const [tokens, setTokens] = useState<{ accessToken: string; refreshToken: string } | null>(null);

  const handleLoginSuccess = (authResponse: Web3AuthResponse) => {
    setUser(authResponse.user);
    setTokens({
      accessToken: authResponse.accessToken,
      refreshToken: authResponse.refreshToken,
    });
  };

  const handleLoginError = (error: Error) => {
    console.error('Web3 login failed:', error);
  };

  const handleLogout = () => {
    setUser(null);
    setTokens(null);
    // Clear localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  };

  // Check for existing session on mount
  React.useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedAccessToken = localStorage.getItem('accessToken');
    const storedRefreshToken = localStorage.getItem('refreshToken');

    if (storedUser && storedAccessToken && storedRefreshToken) {
      try {
        setUser(JSON.parse(storedUser));
        setTokens({
          accessToken: storedAccessToken,
          refreshToken: storedRefreshToken,
        });
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
        // Clear corrupted data
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center space-x-2 mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Web3 Authentication</h1>
          </div>
          <p className="text-gray-600">
            Secure login using your Ethereum wallet
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6">
          {user ? (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <User className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Welcome, {user.name}!
                </h2>
                <p className="text-sm text-gray-600 font-mono">
                  {user.email}
                </p>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">User Information</h3>
                <dl className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <dt className="text-gray-600">User ID:</dt>
                    <dd className="font-mono text-gray-900">{user.id.slice(0, 8)}...</dd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <dt className="text-gray-600">Email:</dt>
                    <dd className="font-mono text-gray-900">{user.email}</dd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <dt className="text-gray-600">DID:</dt>
                    <dd className="font-mono text-gray-900">
                      {user.did ? `${user.did.slice(0, 8)}...` : 'Not set'}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <Key className="h-4 w-4 mr-1" />
                  Authentication Tokens
                </h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Access Token:</p>
                    <p className="text-xs font-mono text-gray-900 bg-gray-100 p-2 rounded break-all">
                      {tokens?.accessToken.slice(0, 20)}...{tokens?.accessToken.slice(-20)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Refresh Token:</p>
                    <p className="text-xs font-mono text-gray-900 bg-gray-100 p-2 rounded break-all">
                      {tokens?.refreshToken.slice(0, 20)}...{tokens?.refreshToken.slice(-20)}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center justify-center space-x-2 w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div>
              <Web3Login
                onLoginSuccess={handleLoginSuccess}
                onLoginError={handleLoginError}
              />
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">How it works:</h3>
            <ol className="text-xs text-blue-800 space-y-1 text-left">
              <li>1. Click "Connect Wallet" to connect your Ethereum wallet</li>
              <li>2. Request a cryptographic nonce from the server</li>
              <li>3. Sign the authentication message with your wallet</li>
              <li>4. Server verifies the signature and issues JWT tokens</li>
              <li>5. You're now authenticated and can access protected resources</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
