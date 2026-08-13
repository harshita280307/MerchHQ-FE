import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useCurrency } from '../context/CurrencyContext';
import { settingsApi } from '../api/settingsApi';
import { 
  REGIONS_DATA, 
  TIMEZONE_OPTIONS 
} from '../data/regionalData';
import { 
  Store, 
  Bell, 
  Globe, 
  Save, 
  Search, 
  ChevronDown, 
  Check, 
  Clock, 
  Loader2 
} from 'lucide-react';

export const SettingsPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { setCurrency } = useCurrency();

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [storeName, setStoreName] = useState('');
  const [gstin, setGstin] = useState('');
  const [stockAlertThreshold, setStockAlertThreshold] = useState(10);
  const [emailNotifications, setEmailNotifications] = useState(true);

  // Regional Settings State
  const [selectedCountry, setSelectedCountry] = useState('India');
  const [countryFlag, setCountryFlag] = useState('🇮🇳');

  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState('INR');
  const [selectedCurrencyName, setSelectedCurrencyName] = useState('Indian Rupee');
  const [selectedCurrencySymbol, setSelectedCurrencySymbol] = useState('₹');
  const [selectedCurrencyFlag, setSelectedCurrencyFlag] = useState('🇮🇳');

  const [timeZone, setTimeZone] = useState('Asia/Kolkata (IST)');

  // Dropdown Open/Close & Search States
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const [currencySearch, setCurrencySearch] = useState('');

  const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState(false);
  const [regionSearch, setRegionSearch] = useState('');

  const currencyDropdownRef = useRef(null);
  const regionDropdownRef = useRef(null);

  // ── 1. Fetch settings from MongoDB backend on mount ─────────────────────────
  useEffect(() => {
    let isMounted = true;
    const fetchSettings = async () => {
      try {
        const data = await settingsApi.getSettings();
        if (!isMounted) return;

        setStoreName(data.storeName || user?.storeName || 'MerchHQ Store');
        setGstin(data.gstin || '');
        setStockAlertThreshold(data.stockAlertThreshold ?? 10);
        setEmailNotifications(data.emailNotifications ?? true);

        // Region settings
        setSelectedCountry(data.country || 'India');
        setCountryFlag(data.countryFlag || '🇮🇳');

        // Currency settings
        setSelectedCurrencyCode(data.currencyCode || 'INR');
        setSelectedCurrencyName(data.currencyName || 'Indian Rupee');
        setSelectedCurrencySymbol(data.currencySymbol || '₹');
        setSelectedCurrencyFlag(data.currencyFlag || '🇮🇳');

        // Time Zone
        setTimeZone(data.timeZone || 'Asia/Kolkata (IST)');
      } catch (err) {
        console.error('Failed to fetch store settings:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSettings();
    return () => { isMounted = false; };
  }, [user?.uid]);

  // ── 2. Click outside listeners to close custom dropdowns ─────────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (currencyDropdownRef.current && !currencyDropdownRef.current.contains(e.target)) {
        setIsCurrencyDropdownOpen(false);
      }
      if (regionDropdownRef.current && !regionDropdownRef.current.contains(e.target)) {
        setIsRegionDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── 3. Region Selection Handler (Auto-fills defaults) ────────────────────────
  const handleSelectRegion = (item) => {
    setSelectedCountry(item.country);
    setCountryFlag(item.flag);

    // Auto-update regional defaults for selected country
    setSelectedCurrencyCode(item.currencyCode);
    setSelectedCurrencyName(item.currencyName);
    setSelectedCurrencySymbol(item.currencySymbol);
    setSelectedCurrencyFlag(item.flag);

    setTimeZone(item.timeZone);

    setIsRegionDropdownOpen(false);
    setRegionSearch('');
  };

  // ── 4. Currency Selection Handler ───────────────────────────────────────────
  const handleSelectCurrency = (item) => {
    setSelectedCurrencyCode(item.currencyCode);
    setSelectedCurrencyName(item.currencyName);
    setSelectedCurrencySymbol(item.currencySymbol);
    setSelectedCurrencyFlag(item.flag);

    setIsCurrencyDropdownOpen(false);
    setCurrencySearch('');
  };

  // ── 5. Save Settings Handler ────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const payload = {
        storeName: storeName.trim(),
        gstin: gstin.trim(),
        country: selectedCountry,
        countryFlag,
        currencyCode: selectedCurrencyCode,
        currencyName: selectedCurrencyName,
        currencySymbol: selectedCurrencySymbol,
        currencyFlag: selectedCurrencyFlag,
        timeZone,
        stockAlertThreshold: Number(stockAlertThreshold),
        emailNotifications,
      };

      await settingsApi.updateSettings(payload);
      // Instantly propagate the new currency to the entire app (no page refresh needed)
      setCurrency({
        currencyCode: selectedCurrencyCode,
        currencySymbol: selectedCurrencySymbol,
        currencyName: selectedCurrencyName,
      });
      showToast('Store settings saved successfully!', 'success');
    } catch (err) {
      console.error('Failed to save settings:', err);
      showToast('Failed to save settings. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Filtered Search Lists ───────────────────────────────────────────────────
  const filteredCurrencies = REGIONS_DATA.filter((item) => {
    const query = currencySearch.toLowerCase();
    return (
      item.currencyCode.toLowerCase().includes(query) ||
      item.currencyName.toLowerCase().includes(query) ||
      item.country.toLowerCase().includes(query) ||
      item.currencySymbol.toLowerCase().includes(query)
    );
  });

  const filteredRegions = REGIONS_DATA.filter((item) => {
    const query = regionSearch.toLowerCase();
    return (
      item.country.toLowerCase().includes(query) ||
      item.currencyCode.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">MerchHQ Store Settings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure profile, GSTIN tax rules, currency preference, and time zone.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* ── 1. Store & Profile Info ─────────────────────────────────────── */}
        <div className="seller-card p-6 space-y-5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-blue-600 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Store className="w-4 h-4" />
            1. Store & Profile Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Registered Store Name</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="MerchHQ Store"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">GSTIN / Tax Registration Number</label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                placeholder="22AAAAA0000A1Z5"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-blue-600 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* ── 2. Currency & Region Selection ───────────────────────────────── */}
        <div className="seller-card p-6 space-y-5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-blue-600 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Globe className="w-4 h-4" />
            2. Currency & Region Preferences
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Region / Country Dropdown */}
            <div className="relative" ref={regionDropdownRef}>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Region / Country *
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsRegionDropdownOpen(!isRegionDropdownOpen);
                  setIsCurrencyDropdownOpen(false);
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 hover:bg-slate-100 focus:ring-2 focus:ring-blue-500 outline-none transition"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className="text-lg leading-none">{countryFlag}</span>
                  <span className="truncate">{selectedCountry}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
              </button>

              {/* Region Dropdown Menu */}
              {isRegionDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 overflow-hidden">
                  <div className="relative p-2 border-b border-slate-100 mb-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      autoFocus
                      placeholder="Search country..."
                      value={regionSearch}
                      onChange={(e) => setRegionSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 bg-slate-100 rounded-lg text-xs font-medium outline-none"
                    />
                  </div>
                  <div className="max-h-56 overflow-y-auto space-y-0.5">
                    {filteredRegions.length === 0 ? (
                      <div className="py-4 text-center text-xs text-slate-400">No country found</div>
                    ) : (
                      filteredRegions.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectRegion(item)}
                          className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl hover:bg-blue-50 transition-colors ${
                            selectedCountry === item.country ? 'bg-blue-50/70 font-bold text-blue-700' : 'text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-base">{item.flag}</span>
                            <span>{item.country}</span>
                          </div>
                          {selectedCountry === item.country && (
                            <Check className="w-4 h-4 text-blue-600" />
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Primary Currency Searchable Dropdown */}
            <div className="relative" ref={currencyDropdownRef}>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Primary Currency *
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen);
                  setIsRegionDropdownOpen(false);
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 hover:bg-slate-100 focus:ring-2 focus:ring-blue-500 outline-none transition"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-lg leading-none">{selectedCurrencyFlag}</span>
                  <span className="font-medium truncate">
                    {selectedCurrencyName} — <strong className="font-bold text-blue-600">{selectedCurrencyCode}</strong> — <span className="font-bold text-slate-900">{selectedCurrencySymbol}</span>
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
              </button>

              {/* Currency Dropdown Menu */}
              {isCurrencyDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 overflow-hidden">
                  <div className="relative p-2 border-b border-slate-100 mb-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      autoFocus
                      placeholder="Search currency by code, name, or symbol..."
                      value={currencySearch}
                      onChange={(e) => setCurrencySearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 bg-slate-100 rounded-lg text-xs font-medium outline-none"
                    />
                  </div>
                  <div className="max-h-56 overflow-y-auto space-y-0.5">
                    {filteredCurrencies.length === 0 ? (
                      <div className="py-4 text-center text-xs text-slate-400">No currency found</div>
                    ) : (
                      filteredCurrencies.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectCurrency(item)}
                          className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl hover:bg-blue-50 transition-colors ${
                            selectedCurrencyCode === item.currencyCode ? 'bg-blue-50/70 font-bold text-blue-700' : 'text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-base">{item.flag}</span>
                            <span>{item.currencyName}</span>
                            <span className="font-mono text-[11px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">
                              {item.currencyCode}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{item.currencySymbol}</span>
                            {selectedCurrencyCode === item.currencyCode && (
                              <Check className="w-4 h-4 text-blue-600" />
                            )}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Time Zone Setting ───────────────────────────────── */}
          <div className="grid grid-cols-1 gap-5 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Time Zone
              </label>
              <select
                value={timeZone}
                onChange={(e) => setTimeZone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none truncate"
              >
                {TIMEZONE_OPTIONS.map((tz, i) => (
                  <option key={i} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Regional Settings Summary Box */}
          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{countryFlag}</span>
              <div>
                <p className="font-bold text-blue-900">
                  {selectedCountry} Regional Preferences Active
                </p>
                <p className="text-slate-500 text-[11px]">
                  Currency: <strong className="text-slate-800">{selectedCurrencyFlag} {selectedCurrencyName} ({selectedCurrencySymbol} {selectedCurrencyCode})</strong> · Time Zone: <span className="text-slate-700">{timeZone}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── 3. Inventory & Stock Alerts ────────────────────────────────── */}
        <div className="seller-card p-6 space-y-5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-blue-600 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Bell className="w-4 h-4" />
            3. Inventory & Stock Alerts
          </h3>

          <div className="space-y-4 text-xs font-medium text-slate-700">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <p className="font-bold text-slate-900">Email Low Stock Warnings</p>
                <p className="text-slate-500">Receive instant alerts when product inventory drops below threshold.</p>
              </div>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* ── Save Settings Button ────────────────────────────────────────── */}
        <div className="flex items-center justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
          >
            {isSaving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /><span>Saving...</span></>
            ) : (
              <><Save className="w-4 h-4" /><span>Save Settings</span></>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
