import React, { useState, useEffect } from 'react';
import { analyzeStock } from '../services/geminiService';
import { AnalysisResult } from '../types';

interface AnalysisCardProps {
  symbol: string;
  isRealMode: boolean;
}

const AnalysisCard: React.FC<AnalysisCardProps> = ({ symbol, isRealMode }) => {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    // 假設我們傳入最近的價格 150 (在 TradePanel 有更精確的獲取方式，這裡簡化)
    const result = await analyzeStock(symbol, 150, isRealMode);
    setAnalysis(result);
    setLoading(false);
  };

  useEffect(() => {
    // 股票代號切換時清空舊分析
    setAnalysis(null);
  }, [symbol]);

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-xl shadow-sm border border-indigo-100">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-indigo-900 flex items-center gap-2">
            ✨ Gemini 智能分析
          </h3>
          <p className="text-sm text-indigo-500 mt-1">針對 {symbol} 提供即時投資洞察</p>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-200"
        >
          {loading ? "AI 思考中..." : "開始分析"}
        </button>
      </div>

      {analysis ? (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-indigo-50">
            <h4 className="font-bold text-slate-700 mb-2 border-l-4 border-blue-500 pl-2">市場表現總結</h4>
            <p className="text-slate-600 text-sm leading-relaxed">{analysis.summary}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-indigo-50">
            <h4 className="font-bold text-slate-700 mb-2 border-l-4 border-emerald-500 pl-2">投資建議</h4>
            <p className="text-slate-600 text-sm leading-relaxed">{analysis.advice}</p>
          </div>
          
          <div className="text-right text-xs text-gray-400 mt-2">
            分析時間: {analysis.timestamp} • 由 Google Gemini 提供
          </div>
        </div>
      ) : (
        <div className="h-40 flex flex-col items-center justify-center text-indigo-300 border-2 border-dashed border-indigo-100 rounded-lg">
          <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <p>點擊分析以獲取 AI 觀點</p>
        </div>
      )}
    </div>
  );
};

export default AnalysisCard;