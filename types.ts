// Enum for Chart Ranges
export enum TimeRange {
  DAY = '1D',
  MONTH = '1M',
  YEAR = '1Y'
}

// Market Data Interface
export interface CandleData {
  time: number; // Unix timestamp
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  dateStr?: string; // Formatted date string for tooltip
}

// Asset Interface
export interface Asset {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  avgCost: number;
  currentPrice: number;
  type: 'STOCK' | 'CASH' | 'CRYPTO';
}

// Transaction Interface
export interface Transaction {
  id: string;
  date: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  price: number;
  quantity: number;
  total: number;
}

// System Mode
export type AppMode = 'REAL' | 'MOCK';

// Gemini Analysis Result
export interface AnalysisResult {
  symbol: string;
  summary: string;
  advice: string;
  timestamp: string;
}

// API Configuration
export interface ApiConfig {
  finnhubKey: string | null;
  firebaseConfig: any | null;
  geminiKey: string | null;
}