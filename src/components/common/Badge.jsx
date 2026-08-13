import React from 'react';

export const StockBadge = ({ status, count }) => {
  let badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200";
  let dotStyle = "bg-emerald-500";
  let label = status || "In Stock";

  if (status === 'Low Stock' || (count > 0 && count <= 10)) {
    badgeStyle = "bg-amber-50 text-amber-700 border-amber-200";
    dotStyle = "bg-amber-500";
    label = "Low Stock";
  } else if (status === 'Out of Stock' || count === 0) {
    badgeStyle = "bg-rose-50 text-rose-700 border-rose-200";
    dotStyle = "bg-rose-500";
    label = "Out of Stock";
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeStyle}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotStyle}`}></span>
      {label}
    </span>
  );
};
