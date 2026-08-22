import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import Cookies from "js-cookie";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getBusinessIdFromCookie = (): string | null => {
    return Cookies.get('active_business_id') ?? null;
};