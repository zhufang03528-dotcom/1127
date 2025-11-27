import React, { useState, useEffect } from 'react';
import { TimeRange, Asset, Transaction, AppMode } from './types';
import { DEFAULT_SYMBOL, EDUCATION_CONTENT } from './constants';
import { getApiConfig } from './services/envService';
import { fetchMarketCandles } from './services/marketService';
import { fetchAssets, fetchTransactions, addManualAsset } from './services/portfolioService';

// Components
import MarketChart from './components/MarketChart';
import TradePanel from './components/TradePanel';
import AssetDashboard from './components/AssetDashboard';
import AnalysisCard from './components/AnalysisCard';

function App() {
  const [symbol, setSymbol] = useState(DEFAULT_SYMBOL);
  const [inputSymbol, setInputSymbol] = useState(DEFAULT_SYMBOL);
  const [timeRange, setTimeRange] = useState<TimeRange>(TimeRange.DAY);
  const [mode, setMode] = useState<AppMode>('MOCK');
  const [candles, setCandles] = useState<any[]>([]);
  
  const [assets, setAssets] = useState<Asset[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  const [showAddAsset, setShowAddAsset] = useState(false);
  const [newAssetForm, setNewAssetForm] = useState({ symbol: '', qty: 0, cost: 0 });

  // 初始化檢測環境變數
  useEffect(() => {
    const config = getApiConfig();
    const hasKeys = !!config.finnhubKey && !!config.geminiKey;
    if (hasKeys) {
      setMode('REAL');
      console.log("環境變數檢測成功，切換至真實模式");
    } else {
      console.log("未檢測到環境變數，使用模擬模式 (Preview Mode)");
    }
    
    // 初始化資產
    loadPortfolio();
  }, []);

  // 監聽依賴變更以重新獲取數據
  useEffect(() => {
    loadMarketData();
  }, [symbol, timeRange, mode]);

  // 切換模式時重新讀取資產 (因為 Mock 和 Real 的資料源可能不同)
  useEffect(() => {
    loadPortfolio();
  }, [mode]);

  const loadPortfolio = async () => {
    const isReal = mode === 'REAL';
    const loadedAssets = await fetchAssets(isReal);
    const loadedTxs = await fetchTransactions(isReal);
    setAssets(loadedAssets);
    setTransactions(loadedTxs);
  };

  const loadMarketData = async () => {
    const data = await fetchMarketCandles(symbol, timeRange, mode === 'REAL');
    setCandles(data);
  };

  const handleSymbolSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSymbol(inputSymbol.toUpperCase());
  };

  const handleManualAddAsset = async () => {
    if(!newAssetForm.symbol || newAssetForm.qty <= 0) return;
    
    const newAsset: Asset = {
      id: Date.now().toString(),
      symbol: newAssetForm.symbol.toUpperCase(),
      name: '自訂資產',
      quantity: newAssetForm.qty,
      avgCost: newAssetForm.cost,
      currentPrice: newAssetForm.cost, // 暫時假設
      type: 'STOCK'
    };
    
    const updated = await addManualAsset(newAsset);
    setAssets(updated);
    setShowAddAsset(false);
    setNewAssetForm({ symbol: '', qty: 0, cost: 0 });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">A</div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-emerald-500">
                AlphaTrade Pro
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-gray-100 rounded-full p-1">
                <button
                  onClick={() => setMode('MOCK')}
                  className={`px-3 py-1 text-xs rounded-full font-medium transition-all ${mode === 'MOCK' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'}`}
                >
                  模擬 (Mock)
                </button>
                <button
                  onClick={() => setMode('REAL')}
                  className={`px-3 py-1 text-xs rounded-full font-medium transition-all ${mode === 'REAL' ? 'bg-emerald-500 shadow-sm text-white' : 'text-gray-500'}`}
                >
                  實盤 (Real)
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Top Controls: Search & Range */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <form onSubmit={handleSymbolSubmit} className="flex gap-2 w-full md:w-auto">
            <input
              type="text"
              value={inputSymbol}
              onChange={(e) => setInputSymbol(e.target.value)}
              placeholder="輸入股票代號 (如 AAPL)"
              className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-full md:w-64"
            />
            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
              載入
            </button>
          </form>

          <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 p-1">
            {Object.values(TimeRange).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  timeRange === r ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-gray-50'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Chart & Analysis (2/3 width) */}
          <div className="lg:col-span-2 space-y-8">
            <MarketChart data={candles} symbol={symbol} />
            <AnalysisCard symbol={symbol} isRealMode={mode === 'REAL'} />
            
            {/* Education Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                📚 投資小教室
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {EDUCATION_CONTENT.map((edu, idx) => (
                  <div key={idx} className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <h4 className="font-bold text-indigo-700 text-sm mb-2">{edu.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{edu.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Dashboard & Trade (1/3 width) */}
          <div className="space-y-8">
            <AssetDashboard assets={assets} />
            
            <TradePanel 
              symbol={symbol} 
              isRealMode={mode === 'REAL'} 
              assets={assets}
              onTradeComplete={(newAssets, newTxs) => {
                setAssets(newAssets);
                setTransactions(newTxs);
              }}
            />

            {/* Quick Manual Asset Add */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800">記帳功能</h3>
                <button 
                  onClick={() => setShowAddAsset(!showAddAsset)}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  {showAddAsset ? '取消' : '+ 新增資產'}
                </button>
              </div>
              
              {showAddAsset && (
                <div className="space-y-3 bg-gray-50 p-3 rounded-lg animate-fade-in">
                  <input 
                    placeholder="代號 (如 NVDA)" 
                    className="w-full text-sm p-2 border rounded"
                    value={newAssetForm.symbol}
                    onChange={e => setNewAssetForm({...newAssetForm, symbol: e.target.value})}
                  />
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      placeholder="數量" 
                      className="w-1/2 text-sm p-2 border rounded"
                      value={newAssetForm.qty || ''}
                      onChange={e => setNewAssetForm({...newAssetForm, qty: Number(e.target.value)})}
                    />
                    <input 
                      type="number" 
                      placeholder="成本" 
                      className="w-1/2 text-sm p-2 border rounded"
                      value={newAssetForm.cost || ''}
                      onChange={e => setNewAssetForm({...newAssetForm, cost: Number(e.target.value)})}
                    />
                  </div>
                  <button 
                    onClick={handleManualAddAsset}
                    className="w-full bg-slate-800 text-white py-2 rounded text-sm hover:bg-slate-700"
                  >
                    儲存
                  </button>
                </div>
              )}

              <div className="max-h-60 overflow-y-auto custom-scrollbar mt-2">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 bg-gray-50 uppercase">
                    <tr>
                      <th className="px-2 py-2">日期</th>
                      <th className="px-2 py-2">標的</th>
                      <th className="px-2 py-2 text-right">動作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(tx => (
                      <tr key={tx.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                        <td className="px-2 py-2 text-gray-500 text-xs">{tx.date}</td>
                        <td className="px-2 py-2 font-medium">{tx.symbol}</td>
                        <td className={`px-2 py-2 text-right font-medium ${tx.type === 'BUY' ? 'text-emerald-600' : 'text-red-600'}`}>
                          {tx.type} {tx.quantity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;