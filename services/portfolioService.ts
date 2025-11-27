import { Asset, Transaction } from '../types';
import { MOCK_ASSETS, MOCK_TRANSACTIONS } from '../constants';
import { getApiConfig } from './envService';

// 注意：由於產生完整 Firebase 連線程式碼較為複雜且依賴具體環境，
// 這裡展示 Hybrid 架構的核心邏輯。
// 在真實專案中，這裡會引入 firebase/app, firebase/firestore

const config = getApiConfig();

// 簡單的 LocalStorage 模擬資料庫
const LOCAL_STORAGE_KEY_ASSETS = 'alpha_trade_assets';
const LOCAL_STORAGE_KEY_TXS = 'alpha_trade_txs';

const getLocalAssets = (): Asset[] => {
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY_ASSETS);
  return saved ? JSON.parse(saved) : MOCK_ASSETS;
};

const getLocalTransactions = (): Transaction[] => {
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY_TXS);
  return saved ? JSON.parse(saved) : MOCK_TRANSACTIONS;
};

export const fetchAssets = async (isRealMode: boolean): Promise<Asset[]> => {
  if (isRealMode && config.firebaseConfig) {
    // TODO: 實作 Firestore 讀取
    console.log("[PortfolioService] Firestore 連線尚未實作完全，降級使用 LocalStorage");
  }
  return getLocalAssets();
};

export const fetchTransactions = async (isRealMode: boolean): Promise<Transaction[]> => {
  return getLocalTransactions();
};

export const executeTrade = async (
  isRealMode: boolean, 
  transaction: Transaction,
  currentAssets: Asset[]
): Promise<{ success: boolean; newAssets: Asset[]; newTransactions: Transaction[] }> => {
  
  // 1. 更新資產邏輯
  let newAssets = [...currentAssets];
  const targetAssetIndex = newAssets.findIndex(a => a.symbol === transaction.symbol);
  
  if (transaction.type === 'BUY') {
    if (targetAssetIndex >= 0) {
      // 平均成本法
      const asset = newAssets[targetAssetIndex];
      const totalCost = (asset.quantity * asset.avgCost) + (transaction.quantity * transaction.price);
      const totalQty = asset.quantity + transaction.quantity;
      newAssets[targetAssetIndex] = {
        ...asset,
        quantity: totalQty,
        avgCost: parseFloat((totalCost / totalQty).toFixed(2))
      };
    } else {
      newAssets.push({
        id: Date.now().toString(),
        symbol: transaction.symbol,
        name: transaction.symbol, // 簡化
        quantity: transaction.quantity,
        avgCost: transaction.price,
        currentPrice: transaction.price,
        type: 'STOCK'
      });
    }
    
    // 扣除現金 (假設有 USD 資產)
    const cashIndex = newAssets.findIndex(a => a.symbol === 'USD');
    if (cashIndex >= 0) {
      newAssets[cashIndex].quantity -= transaction.total;
    }
  } else {
    // SELL
    if (targetAssetIndex >= 0) {
      const asset = newAssets[targetAssetIndex];
      if (asset.quantity >= transaction.quantity) {
        newAssets[targetAssetIndex].quantity -= transaction.quantity;
        // 增加現金
        const cashIndex = newAssets.findIndex(a => a.symbol === 'USD');
        if (cashIndex >= 0) {
          newAssets[cashIndex].quantity += transaction.total;
        }
      } else {
        throw new Error("持倉不足");
      }
    } else {
      throw new Error("未持有該資產");
    }
  }

  // 清理數量為 0 的資產 (現金除外)
  newAssets = newAssets.filter(a => a.quantity > 0 || a.type === 'CASH');

  // 2. 更新交易紀錄
  const currentTxs = getLocalTransactions();
  const newTransactions = [transaction, ...currentTxs];

  // 3. 持久化 (Real: Firestore, Mock: LocalStorage)
  if (isRealMode && config.firebaseConfig) {
     // TODO: Firestore Write
     console.log("[PortfolioService] 寫入 Firestore:", transaction);
  } 
  
  // 總是同步寫入 LocalStorage 以確保體驗
  localStorage.setItem(LOCAL_STORAGE_KEY_ASSETS, JSON.stringify(newAssets));
  localStorage.setItem(LOCAL_STORAGE_KEY_TXS, JSON.stringify(newTransactions));

  return { success: true, newAssets, newTransactions };
};

export const addManualAsset = async (asset: Asset): Promise<Asset[]> => {
  const current = getLocalAssets();
  const updated = [...current, asset];
  localStorage.setItem(LOCAL_STORAGE_KEY_ASSETS, JSON.stringify(updated));
  return updated;
};