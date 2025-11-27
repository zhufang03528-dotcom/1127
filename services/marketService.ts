import { CandleData, TimeRange } from '../types';
import { generateMockCandles } from '../constants';
import { getApiConfig } from './envService';

const config = getApiConfig();

// 獲取 K 線資料 (Mock vs Real)
export const fetchMarketCandles = async (symbol: string, range: TimeRange, isRealMode: boolean): Promise<CandleData[]> => {
  // --- 模擬模式 fallback ---
  if (!isRealMode || !config.finnhubKey) {
    console.log(`[MarketService] 使用模擬資料 (Symbol: ${symbol})`);
    const count = range === TimeRange.DAY ? 24 : range === TimeRange.MONTH ? 30 : 250;
    // 使用簡單的 hash 算法讓同一個 symbol 的 mock 數據看起來固定
    const seed = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return generateMockCandles(count, 150 + (seed % 50));
  }

  // --- 真實模式 (Finnhub) ---
  console.log(`[MarketService] 呼叫真實 API: Finnhub (Symbol: ${symbol})`);
  
  // 計算時間戳
  const end = Math.floor(Date.now() / 1000);
  let start = end;
  let resolution = 'D';

  switch (range) {
    case TimeRange.DAY:
      start = end - (24 * 60 * 60); // 1天
      resolution = '60'; // 每小時
      break;
    case TimeRange.MONTH:
      start = end - (30 * 24 * 60 * 60); // 1個月
      resolution = 'D'; // 每天
      break;
    case TimeRange.YEAR:
      start = end - (365 * 24 * 60 * 60); // 1年
      resolution = 'W'; // 每週
      break;
  }

  try {
    const response = await fetch(
      `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${start}&to=${end}&token=${config.finnhubKey}`
    );
    const data = await response.json();

    if (data.s === 'ok') {
      return data.t.map((timestamp: number, index: number) => ({
        time: timestamp,
        open: data.o[index],
        high: data.h[index],
        low: data.l[index],
        close: data.c[index],
        volume: data.v[index],
        dateStr: new Date(timestamp * 1000).toLocaleDateString()
      }));
    } else {
      throw new Error("API returned no data");
    }
  } catch (error) {
    console.error("Finnhub API Error, falling back to mock:", error);
    return generateMockCandles(30, 150);
  }
};

// 獲取單一報價 (用於模擬交易)
export const fetchQuote = async (symbol: string, isRealMode: boolean): Promise<number> => {
  if (!isRealMode || !config.finnhubKey) {
     const seed = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
     const mockPrice = 100 + (seed % 400) + Math.random() * 5;
     return parseFloat(mockPrice.toFixed(2));
  }

  try {
    const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${config.finnhubKey}`);
    const data = await response.json();
    return data.c || 0;
  } catch (error) {
    console.error("Quote Error", error);
    return 150.00;
  }
};