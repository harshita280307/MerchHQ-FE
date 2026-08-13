import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Store, 
  Package, 
  Layers, 
  ShoppingBag, 
  ShieldCheck, 
  BarChart3, 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  UserCheck, 
  LogOut
} from 'lucide-react';
import { motion } from 'framer-motion';

export const LandingPage = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleAuthAction = (path) => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate(path);
    }
  };

  const currencies = [
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-blue-500 selection:text-white font-sans">
      {/* Background Lighting & Glow Effects */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-orange-600/10 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-blue-500/20">
              M
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-white">MerchHQ</span>
              <span className="ml-1.5 text-[10px] uppercase font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                Store Hub
              </span>
            </div>
          </NavLink>

          {/* Dynamic Navigation Links based on Auth State */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
            {!isAuthenticated ? (
              <>
                <a href="#home" className="hover:text-blue-400 transition-colors">Home</a>
                <a href="#about" className="hover:text-blue-400 transition-colors">About</a>
                <a href="#features" className="hover:text-blue-400 transition-colors">Features</a>
                <a href="#contact" className="hover:text-blue-400 transition-colors">Contact</a>
              </>
            ) : (
              <>
                <NavLink to="/dashboard" className="hover:text-blue-400 transition-colors">Dashboard</NavLink>
                <NavLink to="/products" className="hover:text-blue-400 transition-colors">Products</NavLink>
                <NavLink to="/categories" className="hover:text-blue-400 transition-colors">Categories</NavLink>
                <NavLink to="/orders" className="hover:text-blue-400 transition-colors">Orders</NavLink>
                <NavLink to="/settings" className="hover:text-blue-400 transition-colors">Profile</NavLink>
              </>
            )}
          </nav>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-3">
            {!isAuthenticated ? (
              <>
                <NavLink
                  to="/login"
                  className="px-4 py-2 text-sm font-bold text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </NavLink>
                <NavLink
                  to="/signup"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all hover:scale-105"
                >
                  Get Started
                </NavLink>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-xl border border-slate-700 text-xs">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-slate-200">{user?.name}</span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 px-4 py-2 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white rounded-xl font-bold text-xs border border-rose-500/30 transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="pt-20 pb-16 px-4 sm:px-8 relative">
        <div className="max-w-7xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>E-Commerce Store Management Platform</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-tight max-w-4xl mx-auto"
          >
            Your Store. Your Products. <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-orange-400">
              All in One Place.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto font-normal leading-relaxed"
          >
            MerchHQ helps you manage products, inventory, categories, and orders from one simple and organized platform.
          </motion.p>

          {/* Hero CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4 pt-2"
          >
            <button
              onClick={() => handleAuthAction('/signup')}
              className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-base rounded-2xl shadow-xl shadow-blue-600/30 transition-all hover:scale-105"
            >
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => handleAuthAction('/login')}
              className="flex items-center gap-2 px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-base rounded-2xl border border-slate-700 transition-all hover:scale-105"
            >
              <span>Sign In</span>
            </button>
          </motion.div>

          {/* High Quality Dashboard Preview Illustration */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="pt-10 max-w-5xl mx-auto"
          >
            <div className="p-3 bg-slate-800/80 rounded-3xl border border-slate-700/80 shadow-2xl shadow-blue-500/10 backdrop-blur-md">
              <div className="relative rounded-2xl overflow-hidden border border-slate-700">
                <img
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80"
                  alt="E-Commerce Admin Dashboard Preview"
                  className="w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-left">
                  <div>
                    <span className="text-xs font-bold text-orange-400 uppercase tracking-widest bg-orange-500/10 px-2.5 py-1 rounded border border-orange-500/20">
                      Live Preview
                    </span>
                    <h3 className="text-xl font-bold text-white mt-1">MerchHQ Store Management Dashboard</h3>
                  </div>
                  <NavLink
                    to="/dashboard"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
                  >
                    Open Dashboard
                  </NavLink>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-slate-950/60 border-y border-slate-800 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/10 text-orange-400 rounded-full text-xs font-bold border border-orange-500/20">
              <Store className="w-3.5 h-3.5" />
              <span>About The Platform</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Everything You Need to Manage Your Store
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              MerchHQ makes everyday store management easier. Add and update products, keep track of stock, organize your catalog, and manage orders without switching between different tools.
            </p>

            <div className="space-y-3">
              {[
                "Add and update products with all important details in one place",
                "Keep track of available stock and identify items that need restocking",
                "Organize your catalog into clean, easy-to-manage categories",
                "Track customer orders and their current status at a glance"
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 text-xs font-semibold text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <h3 className="text-3xl font-black text-blue-400">Simple</h3>
              <p className="text-xs font-bold text-slate-300">Easy to Use</p>
              <p className="text-[11px] text-slate-500">An interface designed for everyday use, with no unnecessary complexity.</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <h3 className="text-3xl font-black text-orange-400">Organized</h3>
              <p className="text-xs font-bold text-slate-300">All in One Place</p>
              <p className="text-[11px] text-slate-500">Products, inventory, categories, and orders managed together.</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <h3 className="text-3xl font-black text-emerald-400">Efficient</h3>
              <p className="text-xs font-bold text-slate-300">Save Time</p>
              <p className="text-[11px] text-slate-500">Reduce time spent on managing products and finding information.</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <h3 className="text-3xl font-black text-purple-400">Flexible</h3>
              <p className="text-xs font-bold text-slate-300">Scalable</p>
              <p className="text-[11px] text-slate-500">Suitable for small stores as well as growing online businesses.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Everything Your Store Needs
            </h2>
            <p className="text-slate-400 text-sm">
              A complete set of tools to manage every part of your online store from one convenient dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Package,
                color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
                title: "Product Management",
                desc: "Add, update, view, and organize your products with all important details in one place."
              },
              {
                icon: BarChart3,
                color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
                title: "Inventory Tracking",
                desc: "Keep track of available stock and quickly identify products that need restocking."
              },
              {
                icon: Layers,
                color: "text-orange-400 bg-orange-500/10 border-orange-500/20",
                title: "Category Management",
                desc: "Organize your products into categories so your catalog stays clean and easy to manage."
              },
              {
                icon: ShoppingBag,
                color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
                title: "Order Management",
                desc: "Keep track of customer orders and their current status from one convenient dashboard."
              },
              {
                icon: Search,
                color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
                title: "Easy Search & Filters",
                desc: "Find the product you need quickly using search, categories, stock, and other filters."
              },
              {
                icon: ShieldCheck,
                color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
                title: "Secure Account Access",
                desc: "Sign in securely and access your store management tools through your personal account."
              }
            ].map((f, idx) => {
              const Icon = f.icon;
              return (
                <div key={idx} className="p-8 rounded-3xl bg-slate-800/50 border border-slate-700/80 hover:border-blue-500/50 transition-all group">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border mb-6 ${f.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{f.title}</h3>
                  <p className="text-slate-400 text-xs mt-2 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-slate-950/80 border-t border-slate-800 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Why MerchHQ?</span>
            <h2 className="text-3xl font-extrabold text-white">Built to Make Store Management Simple</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
            {[
              { label: "Simple", desc: "Easy-to-understand interface for everyday use" },
              { label: "Organized", desc: "Products, inventory, categories & orders together" },
              { label: "Efficient", desc: "Reduce time managing products & information" },
              { label: "Flexible", desc: "Small stores & growing businesses" },
              { label: "Responsive", desc: "Desktop, tablet & mobile ready" },
              { label: "Reliable", desc: "Store information organized & accessible" }
            ].map((w, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-slate-900 border border-slate-800/80 hover:border-slate-700 transition-colors">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
                <h4 className="font-bold text-white text-sm">{w.label}</h4>
                <p className="text-[11px] text-slate-500 mt-1">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Currency Support Section */}
      <section className="py-20 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">Currency Support</span>
            <h2 className="text-3xl font-extrabold text-white">Manage Prices in Your Preferred Currency</h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              MerchHQ supports multiple currencies so businesses can manage product pricing according to their market.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currencies.map((c, idx) => (
              <div key={idx} className="flex items-center gap-4 p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60 hover:border-blue-500/40 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0 group-hover:border-blue-500/50 transition-colors">
                  <span className="text-lg font-black text-blue-400">{c.symbol}</span>
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{c.name}</h4>
                  <p className="text-[11px] text-slate-400">{c.symbol} {c.code}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call To Action (CTA) */}
      <section id="contact" className="py-20 px-4 sm:px-8 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="max-w-4xl mx-auto p-10 lg:p-14 rounded-3xl bg-gradient-to-r from-blue-900/60 via-indigo-900/60 to-purple-900/60 border border-blue-500/30 text-center space-y-8 relative overflow-hidden shadow-2xl">
          <div className="space-y-4 relative z-10">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Ready to Organize Your Store?
            </h2>
            <p className="text-slate-300 text-sm max-w-xl mx-auto">
              Manage your products, track inventory, organize categories, and keep your orders under control with MerchHQ.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 relative z-10">
            <button
              onClick={() => handleAuthAction('/signup')}
              className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-orange-500/30 transition-all hover:scale-105"
            >
              Get Started
            </button>
            <button
              onClick={() => handleAuthAction('/login')}
              className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-2xl border border-slate-700 transition-all"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-12 px-4 sm:px-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">M</div>
              <span className="font-bold text-white text-base">MerchHQ</span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Simple tools for smarter store management.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-sm">Quick Links</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li><a href="#home" className="hover:text-blue-400 transition-colors">Home</a></li>
              <li><a href="#about" className="hover:text-blue-400 transition-colors">About</a></li>
              <li><a href="#features" className="hover:text-blue-400 transition-colors">Features</a></li>
              <li><a href="#contact" className="hover:text-blue-400 transition-colors">Contact</a></li>
              <li><NavLink to="/login" className="hover:text-blue-400 transition-colors">Sign In</NavLink></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-sm">Legal</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li><a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Terms & Conditions</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-slate-900 text-center text-[11px] text-slate-500">
          <p>© 2026 MerchHQ. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
