import React, { useEffect, useState } from 'react';
import { categoriesApi } from '../api/categoriesApi';
import { useCurrency } from '../context/CurrencyContext';
import { FolderTree, Plus, IndianRupee, Package, ArrowUpRight } from 'lucide-react';

export const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await categoriesApi.getAll();
      setCategories(data || []);
    } catch (err) {
      console.error(err);
      setError("Unable to load data. We couldn't connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCats();
  }, []);

  const { formatPrice } = useCurrency();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Category Management</h1>
          <p className="text-xs text-slate-500 mt-1">Organize your products into catalog categories.</p>
        </div>
      </div>

      {/* Error State */}
      {error ? (
        <div className="seller-card p-12 text-center space-y-4 max-w-md mx-auto my-8">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center font-bold mx-auto text-lg">
            !
          </div>
          <h3 className="text-base font-extrabold text-slate-900">Unable to load data</h3>
          <p className="text-xs text-slate-500">{error}</p>
          <button
            onClick={fetchCats}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs"
          >
            Retry
          </button>
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-500">Loading categories...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="seller-card p-16 text-center space-y-3 max-w-md mx-auto my-8">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-xl font-bold">
            📂
          </div>
          <h3 className="text-base font-extrabold text-slate-900">No categories yet</h3>
          <p className="text-xs text-slate-500">Create a category or add products to organize your store catalog.</p>
        </div>
      ) : (
        /* Category Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <div key={cat.id} className="seller-card overflow-hidden flex flex-col group">
              <div className="h-44 overflow-hidden relative bg-slate-100 flex items-center justify-center">
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400 font-medium text-xs">
                    <Package className="w-8 h-8 mb-1 opacity-60" />
                    <span>No Category Image</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent pointer-events-none"></div>
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md px-2 py-0.5 rounded border border-white/30">
                    {cat.status}
                  </span>
                  <h3 className="text-lg font-bold mt-1 text-white">{cat.name}</h3>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Products</span>
                    <span className="text-sm font-extrabold text-slate-900 flex items-center gap-1 mt-0.5">
                      <Package className="w-3.5 h-3.5 text-blue-600" />
                      {cat.productCount} Items
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Revenue</span>
                    <span className="text-sm font-extrabold text-blue-700 mt-0.5 block">{formatPrice(cat.revenue)}</span>
                  </div>
                </div>

                <a
                  href={`/products?category=${encodeURIComponent(cat.name)}`}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold rounded-xl text-xs transition-colors"
                >
                  <span>View Catalog Items</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

