import Cookies from "js-cookie";

const FALLBACK_CURRENCY = "PHP";

export function getActiveCurrencyCode(): string {
  return Cookies.get("active_business_currency") || FALLBACK_CURRENCY;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: getActiveCurrencyCode(),
  }).format(value);
}

export const currency = {
  format: formatCurrency,
};
