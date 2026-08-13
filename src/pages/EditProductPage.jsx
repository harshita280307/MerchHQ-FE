import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productsApi } from '../api/productsApi';
import { useToast } from '../context/ToastContext';
import { useCurrency } from '../context/CurrencyContext';
import { 
  ArrowLeft, 
  Save, 
  Image, 
  IndianRupee, 
  Package, 
  Info, 
  Upload, 
  X, 
  Loader2 
} from 'lucide-react';

export const EditProductPage = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Each entry: { previewUrl, file?, url, publicId?, uploading, error }
  const [images, setImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const { showToast } = useToast();
  const navigate = useNavigate();

  // ── Fetch existing product from MongoDB ──────────────────────────────────────
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const p = await productsApi.getById(id);
        setFormData({
          name: p.name || '',
          description: p.description || '',
          category: p.category || 'Electronics',
          brand: p.brand || '',
          price: p.price !== undefined ? String(p.price) : '',
          discount: p.discount !== undefined ? String(p.discount) : '0',
          gstPercentage: p.gstPercentage !== undefined ? String(p.gstPercentage) : '18',
          stock: p.stock !== undefined ? String(p.stock) : '',
          sku: p.sku || '',
          availability: p.availability || 'In Stock'
        });

        // Initialize images array from MongoDB images
        const existingImages = (p.images || []).map(img => {
          if (typeof img === 'string') {
            return { previewUrl: img, url: img, publicId: '', uploading: false, error: null };
          }
          if (typeof img === 'object' && img?.url) {
            return { previewUrl: img.url, url: img.url, publicId: img.publicId || '', uploading: false, error: null };
          }
          return null;
        }).filter(Boolean);

        setImages(existingImages);
      } catch (err) {
        showToast('Failed to load product details.', 'error');
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ── Upload new file to Cloudinary ───────────────────────────────────────────
  const uploadFile = async (file, index) => {
    try {
      const result = await productsApi.uploadImage(file);
      setImages(prev => prev.map((img, i) =>
        i === index
          ? { ...img, uploading: false, url: result.url, publicId: result.publicId, error: null }
          : img
      ));
    } catch (err) {
      console.error('Upload failed:', err);
      setImages(prev => prev.map((img, i) =>
        i === index
          ? { ...img, uploading: false, error: 'Upload failed. Try again.' }
          : img
      ));
    }
  };

  const addFiles = useCallback((files) => {
    const validFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (!validFiles.length) return;

    setImages(prev => {
      const startIndex = prev.length;
      const newEntries = validFiles.map(file => ({
        previewUrl: URL.createObjectURL(file),
        file,
        url: null,
        publicId: null,
        uploading: true,
        error: null,
      }));
      newEntries.forEach((_, i) => {
        setTimeout(() => uploadFile(validFiles[i], startIndex + i), 0);
      });
      return [...prev, ...newEntries];
    });
  }, []);

  const handleFileInput = (e) => {
    if (e.target.files) addFiles(e.target.files);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const removeImage = (index) => {
    setImages(prev => {
      const entry = prev[index];
      if (entry?.file && entry?.previewUrl) URL.revokeObjectURL(entry.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  // ── Submit product updates to MongoDB ───────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.stock) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    const stillUploading = images.some(img => img.uploading);
    if (stillUploading) {
      showToast('Please wait for images to finish uploading.', 'error');
      return;
    }

    const uploadedImages = images.filter(img => img.url).map(img => ({
      url: img.url,
      publicId: img.publicId || '',
    }));

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        brand: formData.brand.trim() || 'Generic',
        price: Number(formData.price),
        discount: Number(formData.discount || 0),
        gstPercentage: Number(formData.gstPercentage || 18),
        stock: Number(formData.stock),
        sku: formData.sku.trim(),
        images: uploadedImages,
      };

      await productsApi.update(id, payload);
      showToast(`Product "${formData.name}" updated successfully!`, 'success');
      navigate('/products');
    } catch (err) {
      console.error(err);
      showToast('Failed to update product in database.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !formData) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const basePrice = Number(formData.price || 0);
  const discountAmt = basePrice * (Number(formData.discount || 0) / 100);
  const discountedPrice = basePrice - discountAmt;
  const gstAmt = discountedPrice * (Number(formData.gstPercentage || 18) / 100);
  const finalPrice = discountedPrice + gstAmt;

  const { formatPrice } = useCurrency();

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/products')}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Edit Product</h1>
            <p className="text-xs text-slate-500">Updating product ID: <span className="font-mono text-slate-700 font-semibold">{id}</span></p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Details */}
        <div className="seller-card p-6 space-y-5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-blue-600 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Package className="w-4 h-4" />
            1. Basic Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Product Title *</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">SKU Code (Optional)</label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                placeholder="e.g. SP-NC-001 (Optional)"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="Electronics">Electronics</option>
                <option value="Apparel">Apparel</option>
                <option value="Home & Living">Home & Living</option>
                <option value="Footwear">Footwear</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Brand Name</label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Description</label>
            <textarea
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
            ></textarea>
          </div>
        </div>

        {/* Pricing & GST */}
        <div className="seller-card p-6 space-y-5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-blue-600 flex items-center gap-2 border-b border-slate-100 pb-3">
            <IndianRupee className="w-4 h-4" />
            2. Pricing & GST Structure
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Base Price (₹) *</label>
              <input
                type="number"
                name="price"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Discount (%)</label>
              <input
                type="number"
                name="discount"
                min="0"
                max="100"
                value={formData.discount}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-orange-600 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">GST Slab (%)</label>
              <select
                name="gstPercentage"
                value={formData.gstPercentage}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="5">5% GST (Essential)</option>
                <option value="12">12% GST (Apparel/Footwear)</option>
                <option value="18">18% GST (Electronics/Standard)</option>
                <option value="28">28% GST (Luxury)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Current Stock *</label>
              <input
                type="number"
                name="stock"
                required
                min="0"
                value={formData.stock}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2 text-blue-900 font-medium">
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Calculated Final Selling Price:</span>
            </div>
            <div className="text-right">
              <span className="text-lg font-black text-blue-700">{formatPrice(finalPrice)}</span>
            </div>
          </div>
        </div>

        {/* Media & Images — Cloudinary Multi-Upload */}
        <div className="seller-card p-6 space-y-5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-blue-600 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Image className="w-4 h-4" />
            3. Product Images (Cloudinary)
          </h3>

          {/* Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all select-none ${
              isDragging
                ? 'border-blue-500 bg-blue-50 scale-[1.01]'
                : 'border-slate-200 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleFileInput}
            />
            <div className="flex flex-col items-center gap-2.5 pointer-events-none">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center">
                <Upload className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Click to upload or drag & drop new images</p>
                <p className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, WEBP · Auto-saves to Cloudinary & MongoDB</p>
              </div>
            </div>
          </div>

          {/* Image Preview Grid */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((img, index) => (
                <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                  <img
                    src={img.previewUrl || img.url}
                    alt={`Product ${index + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {/* Uploading overlay */}
                  {img.uploading && (
                    <div className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center gap-1">
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                      <span className="text-[10px] text-white font-bold">Uploading...</span>
                    </div>
                  )}

                  {/* Error overlay */}
                  {img.error && (
                    <div className="absolute inset-0 bg-rose-900/70 flex flex-col items-center justify-center gap-1 p-2">
                      <span className="text-[10px] text-white font-bold text-center">{img.error}</span>
                    </div>
                  )}

                  {/* Uploaded badge */}
                  {!img.uploading && !img.error && img.url && (
                    <div className="absolute top-1.5 left-1.5 bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-xs">
                      ✓ Saved
                    </div>
                  )}

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-slate-900/70 hover:bg-rose-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                    title="Remove image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-200/70 border border-slate-300 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || images.some(img => img.uploading)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /><span>Updating...</span></>
            ) : (
              <><Save className="w-4 h-4" /><span>Update Product</span></>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
