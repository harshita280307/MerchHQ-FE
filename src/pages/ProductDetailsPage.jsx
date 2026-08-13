import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams, NavLink } from 'react-router-dom';
import { productsApi } from '../api/productsApi';
import { StockBadge } from '../components/common/Badge';
import { DeleteProductModal } from '../components/modals/DeleteProductModal';
import { StockAdjustmentModal } from '../components/modals/StockAdjustmentModal';
import { ProductImage } from '../utils/imageUtils';
import { useToast } from '../context/ToastContext';
import { useCurrency } from '../context/CurrencyContext';
import { 
  ArrowLeft, 
  Edit3, 
  Trash2, 
  Tag,
  SlidersHorizontal,
  History,
  Clock,
  User,
  ArrowDownRight
} from 'lucide-react';

export const ProductDetailsPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [isAdjusting, setIsAdjusting] = useState(false);

  const { showToast } = useToast();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  const fetchProduct = useCallback(async () => {
    setLoading(true);
    try {
      const data = await productsApi.getById(id);
      setProduct(data);
    } catch (err) {
      showToast('Failed to load product details.', 'error');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  }, [id, navigate, showToast]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleConfirmDelete = async () => {
    if (!product) return;
    setIsDeleting(true);
    try {
      await productsApi.delete(id);
      showToast(`Product "${product.name}" deleted.`, 'success');
      navigate('/products');
    } catch (err) {
      showToast('Failed to delete product.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmStockAdjustment = async (quantity, reason) => {
    if (!product) return;
    setIsAdjusting(true);
    try {
      const updated = await productsApi.adjustStock(id, { quantity, reason });
      setProduct(updated);
      showToast(`Stock reduced by ${quantity} units!`, 'success');
      setAdjustModalOpen(false);
    } catch (err) {
      console.error('Stock adjustment error:', err);
      const msg = err.response?.data?.detail || 'Failed to adjust stock.';
      showToast(msg, 'error');
    } finally {
      setIsAdjusting(false);
    }
  };


  if (loading || !product) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const basePrice = product.price || 0;
  const discountAmt = basePrice * ((product.discount || 0) / 100);
  const netSellingPrice = basePrice - discountAmt;
  const gstAmt = netSellingPrice * ((product.gstPercentage || 18) / 100);
  const finalSellingPrice = product.finalPrice || (netSellingPrice + gstAmt);
  const stockHistory = product.stockHistory || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/products')}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Product Details</h1>
            {product.sku && <p className="text-xs text-slate-500 font-mono">SKU: {product.sku}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAdjustModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/20 transition-all"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Adjust Stock</span>
          </button>
          <NavLink
            to={`/products/edit/${id}`}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Item</span>
          </NavLink>
          <button
            onClick={() => setDeleteModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Large Image Preview & Quick Specifications */}
        <div className="lg:col-span-5 space-y-4">
          <div className="seller-card p-4 overflow-hidden bg-white flex items-center justify-center min-h-[320px] rounded-2xl">
            <div className="w-full h-80 rounded-xl overflow-hidden">
              <ProductImage
                product={product}
                alt={product.name}
                className="w-full h-full object-contain rounded-xl hover:scale-105 transition-transform duration-300"
                iconSize="w-10 h-10"
              />
            </div>
          </div>

          <div className="seller-card p-4 space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Database ID</span>
              <span className="font-mono text-slate-800 font-bold">{product.id || product._id}</span>
            </div>
            {product.createdAt && (
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Created At</span>
                <span className="text-slate-800">{new Date(product.createdAt).toLocaleString('en-IN')}</span>
              </div>
            )}
            {product.updatedAt && (
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Last Updated</span>
                <span className="text-slate-800">{new Date(product.updatedAt).toLocaleString('en-IN')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Info & Pricing */}
        <div className="lg:col-span-7 space-y-6">
          <div className="seller-card p-6 space-y-5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-extrabold uppercase text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                {product.category}
              </span>
              <StockBadge status={product.availability} count={product.stock} />
            </div>

            <h2 className="text-xl lg:text-2xl font-black text-slate-900 leading-snug">{product.name}</h2>
            <p className="text-xs font-semibold text-slate-500 flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-orange-500" />
              <span>Brand: <strong>{product.brand}</strong></span>
            </p>

            {/* Price Highlight */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 flex items-baseline justify-between">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Final Selling Price (Inc. GST & Discount)</span>
                <span className="text-3xl font-black text-blue-700">{formatPrice(finalSellingPrice)}</span>
                {product.discount > 0 && (
                  <span className="ml-2 text-xs font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                    {product.discount}% OFF
                  </span>
                )}
              </div>
              <div className="text-right text-xs text-slate-600 space-y-0.5">
                <p>Base Price: <strong className="text-slate-900">{formatPrice(basePrice)}</strong></p>
                <p>GST ({product.gstPercentage}%): <strong className="text-blue-700">{formatPrice(gstAmt)}</strong></p>
              </div>
            </div>

            {/* Inventory Count & Quick Action */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 text-xs font-semibold block">Available Stock</span>
                  <span className="text-xl font-black text-slate-900">{product.stock} units</span>
                </div>
                <button
                  onClick={() => setAdjustModalOpen(true)}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-lg transition-colors border border-indigo-200"
                >
                  Adjust
                </button>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-500 text-xs font-semibold block">SKU Reference</span>
                <span className="text-sm font-mono font-bold text-blue-600">{product.sku || 'N/A'}</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Product Description</h4>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                {product.description || 'No detailed description specified.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stock Adjustment History Section ──────────────────────────────── */}
      <div className="seller-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-600" />
            Manual Stock Adjustment History
          </h3>
          <span className="text-xs text-slate-400 font-medium">
            {stockHistory.length} adjustment {stockHistory.length === 1 ? 'record' : 'records'}
          </span>
        </div>

        {stockHistory.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs font-medium space-y-1">
            <p>No manual stock adjustments recorded for this product yet.</p>
            <p className="text-[11px] text-slate-400">Click "Adjust Stock" above to record offline sales, returns, or audit changes.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Date & Time</th>
                  <th className="py-2.5 px-3">Quantity Reduced</th>
                  <th className="py-2.5 px-3">Stock Change</th>
                  <th className="py-2.5 px-3">Reason</th>
                  <th className="py-2.5 px-3 text-right">Adjusted By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {stockHistory.map((h) => (
                  <tr key={h.id || h.date} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 text-slate-600 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{new Date(h.date).toLocaleString('en-IN')}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                        -{h.quantity} units
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-slate-800">
                      {h.previousStock} → <strong className="text-blue-600">{h.newStock}</strong>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900">{h.reason}</td>
                    <td className="py-3 px-3 text-right text-slate-500 flex items-center justify-end gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      <span>{h.updatedBy || 'Admin'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteProductModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        product={product}
        isDeleting={isDeleting}
      />

      {/* Stock Adjustment Modal */}
      <StockAdjustmentModal
        isOpen={adjustModalOpen}
        onClose={() => setAdjustModalOpen(false)}
        onConfirm={handleConfirmStockAdjustment}
        product={product}
        isSubmitting={isAdjusting}
      />
    </div>
  );
};
