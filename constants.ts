import { CandleData, Asset, Transaction } from './types';

// 預設股票代號
export const DEFAULT_SYMBOL = 'AAPL';

// 模擬 K 線資料生成器
export const generateMockCandles = (count: number, startPrice: number): CandleData[] => {
  const candles: CandleData[] = [];
  let currentPrice = startPrice;
  const now = new Date();
  
  for (let i = count; i > 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const volatility = currentPrice * 0.02;
    const change = (Math.random() - 0.5) * volatility;
    
    const open = currentPrice;
    const close = currentPrice + change;
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;
    const volume = Math.floor(Math.random() * 1000000) + 500000;

    candles.push({
      time: date.getTime() / 1000,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume,
      dateStr: date.toISOString().split('T')[0]
    });
    currentPrice = close;
  }
  return candles;
};

// 模擬資產資料
export const MOCK_ASSETS: Asset[] = [
  { id: '1', symbol: 'AAPL', name: 'Apple Inc.', quantity: 50, avgCost: 150.00, currentPrice: 175.50, type: 'STOCK' },
  { id: '2', symbol: 'TSLA', name: 'Tesla Inc.', quantity: 20, avgCost: 200.00, currentPrice: 195.20, type: 'STOCK' },
  { id: '3', symbol: 'USD', name: '現金餘額', quantity: 10000, avgCost: 1, currentPrice: 1, type: 'CASH' },
];

// 模擬交易紀錄
export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't1', date: '2023-10-01', symbol: 'AAPL', type: 'BUY', price: 150.00, quantity: 50, total: 7500 },
  { id: 't2', date: '2023-11-15', symbol: 'TSLA', type: 'BUY', price: 200.00, quantity: 20, total: 4000 },
];

// 模擬 Gemini 分析結果
export const MOCK_ANALYSIS = {
  summary: "該公司近期表現強勁，受惠於新產品發布與穩健的財報數據。市場情緒偏向樂觀，但需注意全球供應鏈的潛在波動。",
  advice: "短期內建議持有觀望，若股價回調至支撐位可考慮分批加碼。長期投資者可持續關注其在AI領域的佈局。"
};

// 教育內容
export const EDUCATION_CONTENT = [
  { title: "如何看 K 線圖 (Candlestick)", content: "紅色蠟燭代表收盤價低於開盤價 (跌)，綠色蠟燭代表收盤價高於開盤價 (漲)。上下影線代表當日的最高與最低價。" },
  { title: "成交量 (Volume) 的意義", content: "成交量代表市場的活絡程度。價格上漲伴隨大量成交，通常代表趨勢強勁；無量上漲則可能隨時反轉。" },
  { title: "均線 (MA) 策略", content: "當短期均線向上突破長期均線 (黃金交叉) 為買入訊號；反之 (死亡交叉) 為賣出訊號。" }
];