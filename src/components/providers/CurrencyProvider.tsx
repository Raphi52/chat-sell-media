"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { CurrencyConfig, currencies, formatPrice as formatPriceUtil } from "@/lib/currency";

interface CurrencyContextType {
  currency: CurrencyConfig;
  country: string;
  isLoading: boolean;
  formatPrice: (priceUSD: number) => string;
  convertPrice: (priceUSD: number) => number;
  setCurrency: (currencyCode: string) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyConfig>(currencies.USD);
  const [country, setCountry] = useState<string>("US");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage first for user preference
    const savedCurrency = localStorage.getItem("preferred_currency");
    if (savedCurrency && currencies[savedCurrency]) {
      setCurrencyState(currencies[savedCurrency]);
      setIsLoading(false);
      return;
    }

    // Fetch currency based on IP
    fetch("/api/geo")
      .then((res) => res.json())
      .then((data) => {
        if (data.currency) {
          setCurrencyState(data.currency);
          setCountry(data.country);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch geo data:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const formatPrice = (priceUSD: number): string => {
    return formatPriceUtil(priceUSD, currency);
  };

  const convertPrice = (priceUSD: number): number => {
    return priceUSD * currency.rate;
  };

  const setCurrency = (currencyCode: string) => {
    if (currencies[currencyCode]) {
      setCurrencyState(currencies[currencyCode]);
      localStorage.setItem("preferred_currency", currencyCode);
    }
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        country,
        isLoading,
        formatPrice,
        convertPrice,
        setCurrency,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
