"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { HfInference } from '@huggingface/inference';

interface AIContextType {
  gemini: GoogleGenerativeAI | null;
  huggingface: HfInference | null;
  isInitialized: boolean;
}

const AIContext = createContext<AIContextType>({
  gemini: null,
  huggingface: null,
  isInitialized: false,
});

export function AIProvider({ children }: { children: React.ReactNode }) {
  const [ai, setAI] = useState<AIContextType>({
    gemini: null,
    huggingface: null,
    isInitialized: false,
  });

  useEffect(() => {
    const geminiAPI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
    const hfInference = new HfInference(process.env.HUGGINGFACE_API_KEY);

    setAI({
      gemini: geminiAPI,
      huggingface: hfInference,
      isInitialized: true,
    });
  }, []);

  return (
    <AIContext.Provider value={ai}>
      {children}
    </AIContext.Provider>
  );
}

export const useAI = () => useContext(AIContext);