import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { settingsApi } from '../../api/settingsApi';
import { Search, Bell, LogOut, User, Store, ChevronDown, Menu, Globe } from 'lucide-react';

export const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Active currency info
  const [currencyInfo, setCurrencyInfo] = useState({
    code: 'INR',
    symbol: '₹',
    flag: '🇮🇳'
  });

  useEffect(() => {
    if (!user) return;
    settingsApi.getSettings()
      .then(data => {
        if (data) {
          setCurrencyInfo({
            code: data.currencyCode || 'INR',
            symbol: data.currencySymbol || '₹',
            flag: data.countryFlag || data.currencyFlag || '🇮🇳'
          });
        }
      })
      .catch(() => {});
  }, [user]);

  const displayName = user?.name || 'Store Admin';
  const displayAvatar = user?.avatar || '';

  const handleLogout = async () => {
    await logout();
    setShowProfileMenu(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 flex items-center justify-between">
      {/* Left section */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative hidden md:block w-72 lg:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search products, orders, SKU, customers..."
            className="w-full pl-9 pr-4 py-2 text-xs lg:text-sm bg-slate-100/80 hover:bg-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-xl border-none text-slate-800 placeholder-slate-400 transition-all outline-none"
          />
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3">
        {/* Dynamic Currency Indicator */}
        <div 
          onClick={() => navigate('/settings')}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-xs font-semibold border border-blue-200 cursor-pointer hover:bg-blue-100/80 transition-colors"
          title="Click to change currency & region settings"
        >
          <span className="text-sm leading-none">{currencyInfo.flag}</span>
          <span>{currencyInfo.code} ({currencyInfo.symbol})</span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <Bell className="w-5 h-5" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-40">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="font-semibold text-slate-900 text-sm">Notifications</h4>
                <span className="text-xs text-slate-400 font-medium">0 New</span>
              </div>
              <div className="py-6 text-center text-xs text-slate-400">
                No new notifications
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-slate-200"></div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            {displayAvatar ? (
              <img
                src={displayAvatar}
                alt="Avatar"
                className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500/20"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center ring-2 ring-blue-500/20">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-800 leading-tight">{displayName}</p>
              <p className="text-[11px] text-slate-500 flex items-center gap-1">
                <Store className="w-3 h-3 text-orange-500" />
                <span>{user?.storeName || 'MerchHQ Store'}</span>
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-40 text-xs font-medium">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="font-bold text-slate-900">{displayName}</p>
                <p className="text-slate-500 truncate">{user?.email}</p>
              </div>
              <button
                onClick={() => { navigate('/profile'); setShowProfileMenu(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-xl mt-1 transition-colors"
              >
                <User className="w-4 h-4 text-blue-600" />
                My Profile
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
