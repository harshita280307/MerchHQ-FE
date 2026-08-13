import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { dashboardApi } from '../api/dashboardApi';
import { productsApi } from '../api/productsApi';
import { StockBadge } from '../components/common/Badge';
import { ProductImage } from '../utils/imageUtils';
import { getDisplayPrice } from '../utils/priceUtils';
import { useCurrency } from '../context/CurrencyContext';
import { 
  IndianRupee, 
  Package, 
  AlertTriangle, 
  Plus, 
  ArrowUpRight,
  Sparkles
} from 'lucide-react';

export const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { formatPrice } = useCurrency();

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashStats, prodsList] = await Promise.all([
        dashboardApi.getStats(),
        productsApi.getAll()
      ]);
      setStats(dashStats);
      setProducts(prodsList || []);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError("Unable to load data. We couldn't connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-500">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 seller-card max-w-lg mx-auto space-y-4 my-12">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xl">
          !
        </div>
        <h2 className="text-xl font-extrabold text-slate-900">Unable to load data</h2>
        <p className="text-xs text-slate-500 max-w-md">{error}</p>
        <button
          onClick={fetchData}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  const kpis = stats?.kpis || {};
  const lowStockProducts = products.filter(p => p.stock <= 10 || p.availability === 'Low Stock' || p.availability === 'Out of Stock');

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-3xl p-6 lg:p-8 text-white shadow-xl shadow-blue-500/10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 skew-x-12 pointer-events-none"></div>
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-blue-100 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>MerchHQ Dashboard</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black tracking-tight">Welcome to MerchHQ Seller Hub</h1>
          <p className="text-blue-100 text-xs lg:text-sm max-w-xl">
            Manage your store catalog, pricing, and stock inventory in real time.
          </p>
        </div>
        <NavLink
          to="/products/add"
          className="inline-flex items-center gap-2 px-5 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-2xl shadow-lg shadow-orange-500/30 transition-all shrink-0 self-start md:self-auto"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Product</span>
        </NavLink>
      </div>

      {/* 3 Core KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Card 1: Inventory Valuation */}
        <div className="seller-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Catalog Inventory Value</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-extrabold text-slate-900">{formatPrice(kpis.totalRevenue || 0)}</h3>
            <p className="text-xs font-medium text-slate-500 mt-1">Total value of current stock</p>
          </div>
        </div>

        {/* Card 2: Total Products */}
        <div className="seller-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Products</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-extrabold text-slate-900">{products.length}</h3>
            <p className="text-xs font-medium text-slate-500 mt-1">Active Catalog Items</p>
          </div>
        </div>

        {/* Card 3: Low Stock Alert */}
        <div className="seller-card p-6 flex flex-col justify-between border-amber-200 bg-amber-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Low Stock Alert</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-extrabold text-amber-900">{lowStockProducts.length}</h3>
            <p className="text-xs font-semibold text-amber-700 mt-1">Requires Restock</p>
          </div>
        </div>
      </div>

      {/* Recent Products Table */}
      <div className="seller-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Products</h3>
            <p className="text-xs text-slate-500">Latest catalog items in your store</p>
          </div>
          <NavLink to="/products" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
            View Catalog <ArrowUpRight className="w-3.5 h-3.5" />
          </NavLink>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-10 space-y-3">
            <p className="text-xs font-bold text-slate-700">No products yet</p>
            <p className="text-[11px] text-slate-500">Add your first product to start managing your catalog.</p>
            <NavLink
              to="/products/add"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Product</span>
            </NavLink>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3">Product</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Price (₹)</th>
                  <th className="pb-3">Stock</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {products.slice(0, 8).map((p) => (
                  <tr key={p.id || p._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg border border-slate-200 bg-white overflow-hidden shrink-0">
                        <ProductImage product={p} alt={p.name} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 truncate max-w-[200px]">{p.name}</p>
                        {p.sku && <p className="text-[10px] text-slate-400 font-mono">SKU: {p.sku}</p>}
                      </div>
                    </td>
                    <td className="py-3 text-slate-600 font-medium">{p.category}</td>
                    <td className="py-3 font-bold text-slate-900">{formatPrice(getDisplayPrice(p))}</td>
                    <td className="py-3 text-slate-600">{p.stock} units</td>
                    <td className="py-3 text-right">
                      <StockBadge status={p.availability} count={p.stock} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
