/**
 * CurrencyContext — Global, per-user currency preference for MerchHQ.
 *
 * - Loads the user's saved currency from their MongoDB settings on login.
 * - Exposes formatPrice(inrAmount) which converts from INR → selected currency
 *   using the exchange rate stored in regionalData.js.
 * - setCurrency(currencyData) updates context instantly; SettingsPage calls this
 *   after saving so all views update without a page refresh.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { settingsApi } from '../api/settingsApi';
import { REGIONS_DATA } from '../data/regionalData';

const DEFAULT_CURRENCY = {
  code: 'INR',
  name: 'Indian Rupee',
  symbol: '₹',
  exchangeRate: 1,
};

const CurrencyContext = createContext({
  currency: DEFAULT_CURRENCY,
  setCurrency: () => {},
  formatPrice: (val) => `₹${val}`,
  convertFromINR: (val) => val,
});

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrencyState] = useState(DEFAULT_CURRENCY);

  // Load saved currency preference from user settings on mount
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data = await settingsApi.getSettings();
        if (!active) return;
        if (data?.currencyCode) {
          applyCurrency(data.currencyCode, data.currencySymbol, data.currencyName);
        }
      } catch {
        // Silently fall back to INR default
      }
    };
    load();
    return () => { active = false; };
  }, []);

  /** Find exchange rate from REGIONS_DATA by currencyCode */
  const getExchangeRate = (code) => {
    const entry = REGIONS_DATA.find((r) => r.currencyCode === code);
    return entry?.exchangeRate ?? 1;
  };

  /** Apply a new currency globally. Called from SettingsPage after save. */
  const setCurrency = useCallback((currencyData) => {
    // currencyData = { currencyCode, currencySymbol, currencyName }
    const code = currencyData.currencyCode || currencyData.code || 'INR';
    const symbol = currencyData.currencySymbol || currencyData.symbol || '₹';
    const name = currencyData.currencyName || currencyData.name || 'Indian Rupee';
    applyCurrency(code, symbol, name);
  }, []);

  const applyCurrency = (code, symbol, name) => {
    const rate = getExchangeRate(code);
    setCurrencyState({ code, symbol, name, exchangeRate: rate });
  };

  /** Convert an INR value to the selected currency */
  const convertFromINR = useCallback((inrAmount) => {
    const num = Number(inrAmount) || 0;
    return num * currency.exchangeRate;
  }, [currency.exchangeRate]);

  /** Format an INR value in the selected currency with symbol */
  const formatPrice = useCallback((inrAmount) => {
    const converted = convertFromINR(inrAmount);
    const code = currency.code;

    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: code,
        maximumFractionDigits: code === 'JPY' || code === 'KRW' || code === 'VND' || code === 'IDR' ? 0 : 2,
      }).format(converted);
    } catch {
      // Fallback for unsupported Intl codes
      const formatted = converted.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      return `${currency.symbol}${formatted}`;
    }
  }, [currency, convertFromINR]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, convertFromINR }}>
      {children}
    </CurrencyContext.Provider>
  );
};

/** Hook for consuming the currency context in any component */
export const useCurrency = () => useContext(CurrencyContext);
