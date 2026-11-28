import type { ExploreActivity } from "@/types/activity";

export function availableSpots(activity: ExploreActivity) {
  return Math.max(0, activity.capacity - activity.approvedCount);
}

export function formatActivityDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
}

export function formatActivityPrice(price: number | null) {
  if (price === null) return "Free";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

export function personInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
