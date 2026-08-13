/**
 * Utility helper to calculate the Final Selling Price:
 * Final Selling Price = Base Price - Discount + GST
 */
export const calculateFinalPrice = (product) => {
  if (!product) return 0;
  const basePrice = Number(product.price || 0);
  const discountPercent = Number(product.discount || 0);
  const gstPercent = Number(product.gstPercentage || 18);

  const discountAmount = basePrice * (discountPercent / 100);
  const discountedPrice = basePrice - discountAmount;
  const gstAmount = discountedPrice * (gstPercent / 100);

  return Math.round((discountedPrice + gstAmount) * 100) / 100;
};

export const getDisplayPrice = (product) => {
  if (!product) return 0;
  if (product.finalPrice !== undefined && product.finalPrice !== null) {
    return product.finalPrice;
  }
  return calculateFinalPrice(product);
};
