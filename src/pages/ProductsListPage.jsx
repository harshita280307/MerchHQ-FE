import React, { useEffect, useState, useCallback } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { productsApi } from '../api/productsApi';
import { StockBadge } from '../components/common/Badge';
import { DeleteProductModal } from '../components/modals/DeleteProductModal';
import { StockAdjustmentModal } from '../components/modals/StockAdjustmentModal';
import { ProductImage } from '../utils/imageUtils';
import { getDisplayPrice } from '../utils/priceUtils';
import { useCurrency } from '../context/CurrencyContext';
import { useToast } from '../context/ToastContext';
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit3, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react';

export const ProductsListPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Stock Adjustment Modal State
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [adjustingProduct, setAdjustingProduct] = useState(null);
  const [isAdjusting, setIsAdjusting] = useState(false);

  const { showToast } = useToast();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const location = useLocation();

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productsApi.getAll({
        search: searchTerm,
        category: selectedCategory,
        availability: selectedStatus,
        _t: Date.now()
      });
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products catalog from MongoDB:', err);
      setError("Unable to load product data from MongoDB server. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory, selectedStatus]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts, location.key, location.state]);

  const handleDeleteClick = (product) => {
    setSelectedProduct(product);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedProduct) return;
    const targetId = selectedProduct.id || selectedProduct._id;
    setIsDeleting(true);

    try {
      await productsApi.delete(targetId);
      showToast(`Product "${selectedProduct.name}" deleted successfully!`, 'success');
      setProducts(prev => prev.filter(p => (p.id || p._id) !== targetId));
      setDeleteModalOpen(false);
      setSelectedProduct(null);
      await loadProducts();
    } catch (err) {
      showToast('Failed to delete product from database.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAdjustStockClick = (product) => {
    setAdjustingProduct(product);
    setAdjustModalOpen(true);
  };

  const handleConfirmStockAdjustment = async (quantity, reason) => {
    if (!adjustingProduct) return;
    const pid = adjustingProduct.id || adjustingProduct._id;
    setIsAdjusting(true);

    try {
      await productsApi.adjustStock(pid, { quantity, reason });
      showToast(`Stock for "${adjustingProduct.name}" reduced by ${quantity} units!`, 'success');
      setAdjustModalOpen(false);
      setAdjustingProduct(null);
      await loadProducts();
    } catch (err) {
      console.error('Stock adjustment error:', err);
      const msg = err.response?.data?.detail || 'Failed to adjust stock.';
      showToast(msg, 'error');
    } finally {
      setIsAdjusting(false);
    }
  };

  const isFiltered = searchTerm.trim() !== '' || selectedCategory !== 'All' || selectedStatus !== 'All';

  // Pagination logic
  const totalPages = Math.ceil(products.length / itemsPerPage) || 1;
  const paginatedProducts = products.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Products Management</h1>
          <p className="text-xs text-slate-500 mt-1">Real-time product catalog & stock inventory management.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadProducts}
            className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors shadow-xs"
            title="Refresh Catalog from Database"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <NavLink
            to="/products/add"
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </NavLink>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="seller-card p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by name, brand, SKU..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <span>Filters:</span>
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="All">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Apparel">Apparel</option>
            <option value="Home & Living">Home & Living</option>
            <option value="Footwear">Footwear</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="All">All Stock Statuses</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Error State */}
      {error ? (
        <div className="seller-card p-12 text-center space-y-4 max-w-md mx-auto my-8">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center font-bold mx-auto text-lg">
            !
          </div>
          <h3 className="text-base font-extrabold text-slate-900">Unable to load catalog</h3>
          <p className="text-xs text-slate-500">{error}</p>
          <button
            onClick={loadProducts}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs"
          >
            Retry Fetch
          </button>
        </div>
      ) : (
        /* Products Table */
        <div className="seller-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Product Details</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Brand</th>
                  <th className="py-3.5 px-4">Price (₹)</th>
                  <th className="py-3.5 px-4">Discount</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span>Syncing product catalog with MongoDB...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedProducts.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-16 text-center">
                      {isFiltered ? (
                        <div className="space-y-2 max-w-sm mx-auto">
                          <p className="text-sm font-bold text-slate-800">No matching products found</p>
                          <p className="text-xs text-slate-500">Try changing your search or filter.</p>
                          <button
                            onClick={() => {
                              setSearchTerm('');
                              setSelectedCategory('All');
                              setSelectedStatus('All');
                            }}
                            className="mt-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                          >
                            Reset Filters
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3 max-w-sm mx-auto">
                          <p className="text-base font-extrabold text-slate-900">No products in MongoDB</p>
                          <p className="text-xs text-slate-500">Add your first product to start building your catalog.</p>
                          <NavLink
                            to="/products/add"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Add Product</span>
                          </NavLink>
                        </div>
                      )}
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((p) => {
                    const pid = p.id || p._id;
                    return (
                      <tr key={pid} className="hover:bg-slate-50/80 transition-colors">
                        {/* Product Name & Image */}
                        <td className="py-3.5 px-4 flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 shadow-xs">
                            <ProductImage product={p} alt={p.name} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate max-w-[200px] text-xs">{p.name}</p>
                            {p.sku && (
                              <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">SKU: {p.sku}</span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-slate-700 font-semibold">{p.category}</td>
                        <td className="py-3.5 px-4 text-slate-600">{p.brand}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">{formatPrice(getDisplayPrice(p))}</td>
                        <td className="py-3.5 px-4 text-orange-600 font-bold">{p.discount || 0}% OFF</td>
                        <td className="py-3.5 px-4 font-bold text-slate-800">{p.stock} units</td>
                        <td className="py-3.5 px-4">
                          <StockBadge status={p.availability} count={p.stock} />
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleAdjustStockClick(p)}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Adjust Stock Level"
                            >
                              <SlidersHorizontal className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => navigate(`/products/${pid}`)}
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Product Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => navigate(`/products/edit/${pid}`)}
                              className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Edit Product"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(p)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {products.length > 0 && (
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-semibold">
              <span>Showing {paginatedProducts.length} of {products.length} Products</span>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="p-2 rounded-lg border border-slate-200 bg-white disabled:opacity-40 hover:bg-slate-100 text-slate-700"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg font-bold text-slate-800">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="p-2 rounded-lg border border-slate-200 bg-white disabled:opacity-40 hover:bg-slate-100 text-slate-700"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteProductModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        product={selectedProduct}
        isDeleting={isDeleting}
      />

      {/* Stock Adjustment Modal */}
      <StockAdjustmentModal
        isOpen={adjustModalOpen}
        onClose={() => setAdjustModalOpen(false)}
        onConfirm={handleConfirmStockAdjustment}
        product={adjustingProduct}
        isSubmitting={isAdjusting}
      />
    </div>
  );
};
