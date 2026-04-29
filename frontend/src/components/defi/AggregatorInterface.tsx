import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, TrendingUp, Zap, AlertCircle } from 'lucide-react';

interface Pool {
  id: number;
  dex: string;
  reserveA: number;
  reserveB: number;
  fee: number;
  liquidity: number;
}

interface Route {
  pools: number[];
  price: number;
  slippage: number;
  gasCost: number;
  netPrice: number;
  efficiency: number;
  priceImprovement: number;
  mevRisk: number;
  finalScore: number;
}

interface Split {
  poolId: number;
  amount: number;
  expectedOutput: number;
}

export const AggregatorInterface: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'swap' | 'compare' | 'history'>('swap');
  const [amountIn, setAmountIn] = useState<string>('');
  const [selectedTokenIn, setSelectedTokenIn] = useState<string>('USDC');
  const [selectedTokenOut, setSelectedTokenOut] = useState<string>('XLM');
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [splits, setSplits] = useState<Split[]>([]);
  const [loading, setLoading] = useState(false);
  const [priceImprovementVsSingle, setPriceImprovementVsSingle] = useState<number>(0);
  const [executionTime, setExecutionTime] = useState<number>(0);
  const [pools, setPools] = useState<Pool[]>([]);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    const mockPools: Pool[] = [
      { id: 1, dex: 'Stellar', reserveA: 1000000, reserveB: 1000000, fee: 30, liquidity: 2000000 },
      { id: 2, dex: 'Meridian', reserveA: 500000, reserveB: 600000, fee: 50, liquidity: 1100000 },
      { id: 3, dex: 'Soroswap', reserveA: 750000, reserveB: 800000, fee: 25, liquidity: 1550000 },
      { id: 4, dex: 'Aquarius', reserveA: 300000, reserveB: 350000, fee: 100, liquidity: 650000 },
    ];
    setPools(mockPools);
  }, []);

  const findBestRoute = async () => {
    if (!amountIn || parseFloat(amountIn) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const amount = parseFloat(amountIn);
      const mockRoutes: Route[] = pools.map((pool) => {
        const k = pool.reserveA * pool.reserveB;
        const newReserveA = pool.reserveA + amount;
        const amountOut = pool.reserveB - (k / newReserveA);
        const feeAmount = (amountOut * pool.fee) / 10000;
        const netOutput = amountOut - feeAmount;

        const slippage = Math.floor(((amount - netOutput) * 10000) / amount);
        const gasCost = 1000 + (pool.fee / 10);
        const netPrice = netOutput - gasCost;

        return {
          pools: [pool.id],
          price: netOutput,
          slippage,
          gasCost,
          netPrice,
          efficiency: Math.floor((netOutput / amount) * 10000),
          priceImprovement: Math.floor(((netOutput - amount) * 10000) / amount),
          mevRisk: Math.floor((amount * 10000) / pool.liquidity),
          finalScore: Math.floor(
            ((netOutput * 50) / 100) +
            ((30 * 10000) / (gasCost + 1)) / 10000 +
            (((10000 - (amount * 10000) / pool.liquidity) * 15) / 10000) +
            5
          ),
        };
      });

      mockRoutes.sort((a, b) => b.finalScore - a.finalScore);
      setRoutes(mockRoutes);

      if (mockRoutes.length > 0) {
        const bestRoute = mockRoutes[0];
        setSelectedRoute(bestRoute);

        const mockSplits: Split[] = bestRoute.pools.map((poolId) => ({
          poolId,
          amount: amount / bestRoute.pools.length,
          expectedOutput: bestRoute.price / bestRoute.pools.length,
        }));
        setSplits(mockSplits);

        const singleDexPrice = mockRoutes[mockRoutes.length - 1].price;
        const improvement = ((bestRoute.netPrice - singleDexPrice) / singleDexPrice) * 100;
        setPriceImprovementVsSingle(improvement);
        setExecutionTime(Math.floor(Math.random() * 800) + 200);

        setSuccess(`Found optimal route with ${bestRoute.finalScore} score`);
      }
    } catch (err) {
      setError('Failed to find best route');
    } finally {
      setLoading(false);
    }
  };

  const executeSwap = async () => {
    if (!selectedRoute || !amountIn) {
      setError('Please select a route first');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const amount = parseFloat(amountIn);
      const success = amount <= 100000;

      if (success) {
        setSuccess(`Swap executed successfully! Received ${selectedRoute.price.toFixed(2)} ${selectedTokenOut}`);
        setAmountIn('');
      } else {
        setError('Swap execution failed: Amount exceeds liquidity');
      }
    } catch (err) {
      setError('Failed to execute swap');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">DEX Aggregator</h1>
            <p className="text-gray-600 mt-2">Find the best prices across multiple decentralized exchanges</p>
          </div>
          <TrendingUp className="w-10 h-10 text-blue-600" />
        </div>

        <div className="flex space-x-4 mb-6 border-b border-gray-200">
          {(['swap', 'compare', 'history'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab === 'swap' && 'Swap'}
              {tab === 'compare' && 'Price Comparison'}
              {tab === 'history' && 'History'}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-700">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700">{success}</p>
          </div>
        )}

        {activeTab === 'swap' && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">You send</label>
              <div className="flex gap-3">
                <div className="flex-1">
                  <input
                    type="number"
                    value={amountIn}
                    onChange={(e) => setAmountIn(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={selectedTokenIn}
                  onChange={(e) => setSelectedTokenIn(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
                >
                  <option>USDC</option>
                  <option>XLM</option>
                  <option>USDT</option>
                </select>
              </div>
            </div>

            <div className="flex justify-center">
              <button className="p-2 bg-blue-100 rounded-full hover:bg-blue-200 transition">
                <ArrowRightLeft className="w-6 h-6 text-blue-600" />
              </button>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">You receive</label>
              <div className="flex gap-3">
                <div className="flex-1">
                  <div className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-500">
                    {selectedRoute ? selectedRoute.price.toFixed(6) : '0.00'}
                  </div>
                </div>
                <select
                  value={selectedTokenOut}
                  onChange={(e) => setSelectedTokenOut(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
                >
                  <option>XLM</option>
                  <option>USDC</option>
                  <option>USDT</option>
                </select>
              </div>
            </div>

            {selectedRoute && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Price Improvement</p>
                  <p className="text-lg font-semibold text-blue-600">
                    {priceImprovementVsSingle > 0 ? '+' : ''}{priceImprovementVsSingle.toFixed(2)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Execution Time</p>
                  <p className="text-lg font-semibold text-blue-600">{executionTime}ms</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Gas Cost</p>
                  <p className="text-lg font-semibold text-blue-600">{selectedRoute.gasCost.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">MEV Risk</p>
                  <p className={`text-lg font-semibold ${selectedRoute.mevRisk < 1000 ? 'text-green-600' : 'text-yellow-600'}`}>
                    {(selectedRoute.mevRisk / 100).toFixed(2)}%
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={findBestRoute}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5" />
                {loading ? 'Finding route...' : 'Find Best Route'}
              </button>
              <button
                onClick={executeSwap}
                disabled={!selectedRoute || loading}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 transition"
              >
                {loading ? 'Executing...' : 'Execute Swap'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'compare' && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">DEX</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Price</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Slippage</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Gas Cost</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Net Price</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {routes.map((route, idx) => (
                    <tr
                      key={idx}
                      className={`border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                        selectedRoute === route ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => setSelectedRoute(route)}
                    >
                      <td className="px-4 py-3 font-medium">{pools[route.pools[0] - 1]?.dex}</td>
                      <td className="px-4 py-3">{route.price.toFixed(6)}</td>
                      <td className="px-4 py-3">{(route.slippage / 100).toFixed(2)}%</td>
                      <td className="px-4 py-3">{route.gasCost.toFixed(2)}</td>
                      <td className="px-4 py-3 font-semibold">{route.netPrice.toFixed(6)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-lg text-white text-xs font-bold ${
                          route.finalScore > 50 ? 'bg-green-600' : route.finalScore > 30 ? 'bg-yellow-600' : 'bg-red-600'
                        }`}>
                          {route.finalScore}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="text-center py-12">
            <p className="text-gray-600">No swap history yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AggregatorInterface;
