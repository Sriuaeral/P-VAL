import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Date normalization utilities
const DATE_KEY_REGEX = /^(date|startDate|endDate|completionDate)$/i;

function isAlreadyDDMMYYYY(value: string): boolean {
  return /^\d{2}-\d{2}-\d{4}$/.test(value);
}

function isLikelyDateString(value: string): boolean {
  // ISO or YYYY-MM-DD or strings containing 'T' timestamp
  return /\d{4}-\d{2}-\d{2}/.test(value) || /T\d{2}:\d{2}:\d{2}/.test(value);
}

export function formatToDDMMYYYY(input: string | Date): string {
  // Handle plain date strings (YYYY-MM-DD) without timezone drift
  if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
    const [yyyy, mm, dd] = input.split('-');
    return `${dd}-${mm}-${yyyy}`;
  }

  const date = input instanceof Date ? input : new Date(input);
  if (isNaN(date.getTime())) {
    // Fallback: return as-is if unparsable
    return typeof input === 'string' ? input : '';
  }

  // Use UTC components to avoid timezone-dependent day shifts
  const dd = String(date.getUTCDate()).padStart(2, '0');
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = String(date.getUTCFullYear());
  return `${dd}-${mm}-${yyyy}`;
}

export function normalizeDateFields<T = any>(payload: T): T {
  if (payload == null) return payload;

  const seen = new WeakSet();

  const normalize = (value: any, parentKey?: string): any => {
    if (value == null) return value;

    if (Array.isArray(value)) {
      return value.map((v) => normalize(v));
    }

    if (value instanceof Date) {
      return formatToDDMMYYYY(value);
    }

    if (typeof value === 'object') {
      if (seen.has(value)) return value;
      seen.add(value);
      Object.keys(value).forEach((key) => {
        const v = (value as any)[key];
        if (v == null) return;
        if (DATE_KEY_REGEX.test(key)) {
          if (v instanceof Date) {
            (value as any)[key] = formatToDDMMYYYY(v);
          } else if (typeof v === 'string' && !isAlreadyDDMMYYYY(v) && isLikelyDateString(v)) {
            (value as any)[key] = formatToDDMMYYYY(v);
          }
        } else if (key.toLowerCase() !== 'timestamp') {
          (value as any)[key] = normalize(v, key);
        }
      });
      return value;
    }

    if (typeof value === 'string' && parentKey && DATE_KEY_REGEX.test(parentKey)) {
      if (!isAlreadyDDMMYYYY(value) && isLikelyDateString(value)) {
        return formatToDDMMYYYY(value);
      }
    }

    return value;
  };

  return normalize(payload);
}
