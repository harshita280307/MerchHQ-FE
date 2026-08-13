import React from 'react';
import { ImageOff } from 'lucide-react';

/**
 * Single source of truth helper for extracting the product image URL
 * from MongoDB product documents.
 */
export const getProductImageUrl = (product) => {
  if (!product) return null;
  const imgs = product.images;
  if (!imgs || !Array.isArray(imgs) || imgs.length === 0) return null;
  
  const first = imgs[0];
  if (typeof first === 'string' && first.trim() !== '') {
    return first;
  }
  if (typeof first === 'object' && first !== null) {
    if (first.url && typeof first.url === 'string' && first.url.trim() !== '') {
      return first.url;
    }
  }
  return null;
};

/**
 * Standard ProductImage component to render uploaded Cloudinary product images
 * consistently across Product Listing, Product Details, Dashboard, Categories, and Edit Product.
 * Renders a clean "No Image" fallback badge when no image is available.
 */
export const ProductImage = ({ product, alt, className = "w-full h-full object-cover", iconSize = "w-5 h-5" }) => {
  const imageUrl = getProductImageUrl(product);

  if (!imageUrl) {
    return (
      <div className={`bg-slate-100 border border-slate-200/80 flex flex-col items-center justify-center text-slate-400 font-medium text-[11px] select-none ${className}`}>
        <ImageOff className={`${iconSize} mb-0.5 opacity-60`} />
        <span>No Image</span>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt || product?.name || 'Product Image'}
      className={className}
      onError={(e) => {
        // Fallback to clean No Image badge if image URL fails to load
        e.target.onerror = null;
        if (e.target.parentElement) {
          e.target.parentElement.innerHTML = `
            <div className="w-full h-full bg-slate-100 border border-slate-200/80 flex flex-col items-center justify-center text-slate-400 font-medium text-[11px] select-none">
              <svg class="${iconSize} mb-0.5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              <span>No Image</span>
            </div>
          `;
        }
      }}
    />
  );
};
