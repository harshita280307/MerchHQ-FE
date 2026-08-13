import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Trash2 } from 'lucide-react';
import { ProductImage } from '../../utils/imageUtils';
import { getDisplayPrice } from '../../utils/priceUtils';

export const DeleteProductModal = ({ isOpen, onClose, onConfirm, product, isDeleting }) => {
  if (!isOpen || !product) return null;

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(getDisplayPrice(product));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-rose-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Delete Product</h3>
                <p className="text-xs text-rose-600 font-medium">This action cannot be undone</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6">
            <div className="flex items-start gap-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 mb-4">
              <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-white">
                <ProductImage product={product} alt={product.name} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-slate-900 text-sm truncate">{product.name}</h4>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                  {product.sku && (
                    <span className="font-mono text-slate-600 bg-slate-200/60 px-1.5 py-0.5 rounded">SKU: {product.sku}</span>
                  )}
                  <span>{product.category || 'General'}</span>
                </div>
                <p className="text-base font-bold text-blue-600 mt-1">{formattedPrice}</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete this product document from your database?
            </p>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-100 bg-slate-50/50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-200/70 border border-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 shadow-sm transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              {isDeleting ? 'Deleting...' : 'Confirm Delete'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
