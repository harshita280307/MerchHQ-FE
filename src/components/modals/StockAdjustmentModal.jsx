import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X, ArrowDownRight, AlertCircle, Loader2 } from 'lucide-react';

export const StockAdjustmentModal = ({ isOpen, onClose, onConfirm, product, isSubmitting }) => {
  const [quantity, setQuantity] = useState('1');
  const [reason, setReason] = useState('Offline Sale');
  const [customReason, setCustomReason] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setQuantity('1');
      setReason('Offline Sale');
      setCustomReason('');
      setError('');
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const currentStock = intVal(product.stock);
  const qtyNum = parseInt(quantity, 10) || 0;

  function intVal(val) {
    const parsed = parseInt(val, 10);
    return isNaN(parsed) ? 0 : parsed;
  }

  const newStock = Math.max(0, currentStock - qtyNum);
  
  let newStatus = "In Stock";
  if (newStock <= 0) newStatus = "Out of Stock";
  else if (newStock <= 10) newStatus = "Low Stock";

  const handleQtyChange = (e) => {
    const val = e.target.value;
    setQuantity(val);
    const num = parseInt(val, 10);

    if (isNaN(num) || num <= 0) {
      setError('Quantity to reduce must be greater than 0.');
    } else if (num > currentStock) {
      setError(`Quantity cannot exceed available stock (${currentStock}).`);
    } else {
      setError('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (qtyNum <= 0) {
      setError('Quantity to reduce must be greater than 0.');
      return;
    }
    if (qtyNum > currentStock) {
      setError(`Quantity cannot exceed available stock (${currentStock}).`);
      return;
    }
    const finalReason = reason === 'Other' ? (customReason.trim() || 'Manual Adjustment') : reason;
    onConfirm(qtyNum, finalReason);
  };

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
          <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-blue-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Adjust Stock Level</h3>
                <p className="text-xs text-slate-500 font-medium">Manual inventory reduction</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Product Summary Pill */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3 text-xs">
              <div className="min-w-0">
                <p className="font-bold text-slate-900 truncate">{product.name}</p>
                {product.sku && <p className="font-mono text-[10px] text-slate-500">SKU: {product.sku}</p>}
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Current Stock</span>
                <span className="text-sm font-extrabold text-slate-900">{currentStock} units</span>
              </div>
            </div>

            {/* Quantity to Reduce */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Quantity to Reduce *
              </label>
              <input
                type="number"
                min="1"
                max={currentStock}
                value={quantity}
                onChange={handleQtyChange}
                required
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm font-bold text-slate-900 focus:ring-2 outline-none transition-all ${
                  error ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/20' : 'border-slate-200 focus:ring-blue-500 focus:bg-white'
                }`}
              />
              {error && (
                <p className="text-xs font-semibold text-rose-600 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{error}</span>
                </p>
              )}
            </div>

            {/* Reason Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Adjustment Reason
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="Offline Sale">Offline Store Sale</option>
                <option value="Customer Order">Customer Manual Order</option>
                <option value="Damaged / Expired">Damaged / Expired Goods</option>
                <option value="Inventory Audit">Inventory Audit Correction</option>
                <option value="Returned Item">Item Returned / Defective</option>
                <option value="Other">Other Reason</option>
              </select>

              {reason === 'Other' && (
                <input
                  type="text"
                  placeholder="Specify custom reason..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="w-full mt-2 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
                />
              )}
            </div>

            {/* Calculated Stock Result Preview */}
            {!error && qtyNum > 0 && (
              <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-blue-900 font-medium">
                  <ArrowDownRight className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Calculated Remaining Stock:</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-blue-700">{newStock} units</span>
                  <span className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    newStatus === 'Out of Stock' ? 'bg-rose-100 text-rose-700' : newStatus === 'Low Stock' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {newStatus}
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !!error || qtyNum <= 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /><span>Updating...</span></>
                ) : (
                  <span>Update Stock</span>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
