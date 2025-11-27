import React, { useState, useEffect } from 'react';
import { fetchQuote } from '../services/marketService';
import { executeTrade } from '../services/portfolioService';
import { Transaction, Asset } from '../types';

interface TradePanelProps {
  symbol: string;
  isRealMode: boolean;
  assets: Asset[];
  onTradeComplete: (newAssets: Asset[], newTxs: Transaction[]) => void;
}

const TradePanel: React.FC<TradePanelProps> = ({ symbol, isRealMode, assets, onTradeComplete }) => {
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [type, setType] = useState<'BUY' | 'SELL'>('BUY');
  const [loading, setLoading] = useState(false);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // 當股票代號改變，重置報價
  useEffect(() => {
    setCurrentPrice(null);
    setMessage(null);
  }, [symbol]);

  const handleQuote = async () => {
    setQuoteLoading(true);
    const price = await fetchQuote(symbol, isRealMode);
    setCurrentPrice(price);
    setQuoteLoading(false);
  };

  const handleTrade = async () => {
    if (!currentPrice) {
      setMessage("請先進行詢價");
      return;
    }

    setLoading(true);
    setMessage(null);

    const total = currentPrice * quantity;
    const newTx: Transaction = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      symbol,
      type,
      price: currentPrice,
      quantity,
      total
    };

    try {
      const result = await executeTrade(isRealMode, newTx, assets);
      onTradeComplete(result.newAssets, result.newTransactions);
      setMessage(`交易成功！${type === 'BUY' ? '買入' : '賣出'} ${quantity} 股 ${symbol}`);
      setQuantity(1);
    } catch (e: any) {
      setMessage(`交易失敗: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">模擬交易下單</h3>
      
      <div className="space-y-4">
        {/* Symbol Display */}
        <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
          <span className="text-gray-500 font-medium">標的</span>
          <span className="text-xl font-bold text-slate-800">{symbol}</span>
        </div>

        {/* Quote Section */}
        <div className="flex items-center gap-4">
          <button 
            onClick={handleQuote}
            disabled={quoteLoading}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex justify-center items-center"
          >
            {quoteLoading ? "查詢中..." : "詢價 (Quote)"}
          </button>
          <div className="flex-1 text-right">
            <span className="text-sm text-gray-500 block">最新價格</span>
            <span className={`text-2xl font-bold ${currentPrice ? 'text-emerald-600' : 'text-gray-300'}`}>
              {currentPrice ? `$${currentPrice}` : '---'}
            </span>
          </div>
        </div>

        {/* Trade Form */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">交易方向</label>
            <div className="flex rounded-md shadow-sm" role="group">
              <button
                type="button"
                onClick={() => setType('BUY')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-l-lg border ${
                  type === 'BUY' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                買入
              </button>
              <button
                type="button"
                onClick={() => setType('SELL')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-r-lg border ${
                  type === 'SELL' 
                    ? 'bg-red-50 text-red-700 border-red-200' 
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                賣出
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">股數</label>
            <input 
              type="number" 
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
            />
          </div>
        </div>

        {/* Total Estimate */}
        {currentPrice && (
          <div className="flex justify-between items-center py-2 text-sm">
            <span className="text-gray-500">預估總額</span>
            <span className="font-bold text-slate-800">${(currentPrice * quantity).toFixed(2)}</span>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleTrade}
          disabled={loading || !currentPrice}
          className={`w-full py-3 px-4 rounded-lg font-bold text-white shadow-md transition-all ${
            loading || !currentPrice
              ? 'bg-gray-300 cursor-not-allowed'
              : type === 'BUY' 
                ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200' 
                : 'bg-red-500 hover:bg-red-600 shadow-red-200'
          }`}
        >
          {loading ? "處理中..." : `確認${type === 'BUY' ? '買入' : '賣出'}`}
        </button>
        
        {message && (
          <div className={`p-3 rounded-lg text-sm text-center ${message.includes('成功') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default TradePanel;