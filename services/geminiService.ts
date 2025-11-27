import { GoogleGenAI } from "@google/genai";
import { AnalysisResult } from '../types';
import { MOCK_ANALYSIS } from '../constants';
import { getApiConfig } from './envService';

const config = getApiConfig();

export const analyzeStock = async (symbol: string, price: number, isRealMode: boolean): Promise<AnalysisResult> => {
  // --- 模擬模式 ---
  if (!isRealMode || !config.geminiKey) {
    console.log(`[GeminiService] 使用模擬 AI 分析 (Symbol: ${symbol})`);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          symbol,
          summary: `[模擬] ${MOCK_ANALYSIS.summary} (針對 ${symbol} 價格 ${price})`,
          advice: `[模擬] ${MOCK_ANALYSIS.advice}`,
          timestamp: new Date().toLocaleTimeString()
        });
      }, 1500); // 模擬網路延遲
    });
  }

  // --- 真實模式 (Gemini 2.5 Flash) ---
  console.log(`[GeminiService] 呼叫 Gemini API (Symbol: ${symbol})`);
  
  try {
    const ai = new GoogleGenAI({ apiKey: config.geminiKey });
    
    const prompt = `
      請擔任專業的金融分析師。
      目前的股票代號是 ${symbol}，現價約為 ${price}。
      請給出兩個簡短的段落 (繁體中文)：
      1. 市場表現總結：分析可能的近期趨勢 (不要使用 Markdown，純文字)。
      2. 投資建議：給出具體的操作建議 (例如：觀望、買入、賣出) 與理由 (不要使用 Markdown，純文字)。
      
      格式要求：
      Summary: [你的總結]
      Advice: [你的建議]
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text || "";
    
    // 簡單解析回應
    let summary = "分析生成失敗";
    let advice = "無法提供建議";

    const lines = text.split('\n');
    let isSummary = false;
    let isAdvice = false;
    let summaryText = "";
    let adviceText = "";

    lines.forEach(line => {
      if (line.toLowerCase().includes('summary:')) {
        isSummary = true;
        isAdvice = false;
        summaryText += line.replace(/summary:/i, '').trim() + " ";
      } else if (line.toLowerCase().includes('advice:')) {
        isAdvice = true;
        isSummary = false;
        adviceText += line.replace(/advice:/i, '').trim() + " ";
      } else {
        if (isSummary) summaryText += line.trim() + " ";
        if (isAdvice) adviceText += line.trim() + " ";
      }
    });

    if (!summaryText) summaryText = text.substring(0, 100) + "...";

    return {
      symbol,
      summary: summaryText,
      advice: adviceText || "建議持續觀察市場動態。",
      timestamp: new Date().toLocaleTimeString()
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      symbol,
      summary: "AI 服務目前無法連線，請稍後再試。",
      advice: "無法提供建議。",
      timestamp: new Date().toLocaleTimeString()
    };
  }
};