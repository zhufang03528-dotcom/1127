import { ApiConfig } from '../types';

// Helper to get env variables safely
// 支援 VITE_ 前綴 (Vite) 或普通 process.env (Webpack/CRA)
const getEnvVar = (key: string): string | null => {
  try {
    // @ts-ignore
    if (import.meta && import.meta.env && import.meta.env[key]) {
      // @ts-ignore
      return import.meta.env[key];
    }
  } catch (e) {
    // Ignore error
  }
  
  try {
     // @ts-ignore
    if (process && process.env && process.env[key]) {
       // @ts-ignore
      return process.env[key];
    }
  } catch (e) {
     // Ignore
  }
  
  return null;
};

export const getApiConfig = (): ApiConfig => {
  const finnhubKey = getEnvVar('VITE_FINNHUB_API_KEY');
  const firebaseStr = getEnvVar('VITE_FIREBASE_CONFIG_STRING');
  const geminiKey = getEnvVar('API_KEY'); // As per standard instructions

  let firebaseConfig = null;
  if (firebaseStr) {
    try {
      firebaseConfig = JSON.parse(firebaseStr);
    } catch (e) {
      console.error("Firebase Config Parsing Error", e);
    }
  }

  return {
    finnhubKey,
    firebaseConfig,
    geminiKey
  };
};