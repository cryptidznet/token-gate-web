export const formatNumber = (value: number | string) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  const truncated = n >= 0 ? Math.floor(n) : Math.ceil(n);
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(truncated);
};
