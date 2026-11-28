"use client";

import { useMemo, useState } from "react";
import type { ExploreActivity } from "@/types/activity";

export type SearchDate = "any" | "today" | "weekend";
export type SortOption =
  | "best-match"
  | "newest"
  | "upcoming"
  | "price-low"
  | "popular";
export type GroupSize = "any" | "small" | "medium" | "large";
export type PriceMode = "any" | "free" | "paid" | "custom";
export type FilterDate = SearchDate | "custom";

export interface SearchCriteria {
  location: string;
  date: SearchDate;
  category: string;
}

export interface ActivityFilters {
  destination: string;
  categories: string[];
  date: FilterDate;
  startDate: string;
  endDate: string;
  groupSize: GroupSize;
  onlyAvailable: boolean;
  priceMode: PriceMode;
  minPrice: number | null;
  maxPrice: number | null;
}

export const initialSearch: SearchCriteria = {
  location: "Ahmedabad",
  date: "any",
  category: "all",
};

export const emptyActivityFilters: ActivityFilters = {
  destination: "",
  categories: [],
  date: "any",
  startDate: "",
  endDate: "",
  groupSize: "any",
  onlyAvailable: false,
  priceMode: "any",
  minPrice: null,
  maxPrice: null,
};

function localDateKey(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Kolkata",
    year: "numeric",
  }).formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value ?? "";
  const month = parts.find((part) => part.type === "month")?.value ?? "";
  const day = parts.find((part) => part.type === "day")?.value ?? "";
  return `${year}-${month}-${day}`;
}

function matchesDate(activity: ExploreActivity, selection: SearchDate) {
  if (selection === "any") {
    return true;
  }

  const activityDate = localDateKey(activity.startsAt);
  const [year, month, dayOfMonth] = localDateKey(new Date())
    .split("-")
    .map(Number);
  const today = new Date(year, month - 1, dayOfMonth, 12);
  if (selection === "today") {
    return activityDate === localDateKey(today);
  }

  const day = today.getDay();
  const daysUntilSaturday =
    day === 0 ? -1 : (6 - day + 7) % 7;
  const saturday = new Date(today);
  saturday.setDate(today.getDate() + daysUntilSaturday);
  const sunday = new Date(saturday);
  sunday.setDate(saturday.getDate() + 1);
  return (
    activityDate >= localDateKey(saturday) &&
    activityDate <= localDateKey(sunday)
  );
}

function matchesFilterDate(activity: ExploreActivity, filters: ActivityFilters) {
  if (filters.date !== "custom") {
    return matchesDate(activity, filters.date);
  }

  const activityDate = localDateKey(activity.startsAt);
  return (
    (!filters.startDate || activityDate >= filters.startDate) &&
    (!filters.endDate || activityDate <= filters.endDate)
  );
}

function matchesGroupSize(activity: ExploreActivity, groupSize: GroupSize) {
  if (groupSize === "small") return activity.capacity <= 8;
  if (groupSize === "medium") {
    return activity.capacity >= 9 && activity.capacity <= 16;
  }
  if (groupSize === "large") return activity.capacity > 16;
  return true;
}

function matchesPrice(activity: ExploreActivity, filters: ActivityFilters) {
  if (filters.priceMode === "free") {
    return activity.pricePerPerson === null;
  }
  if (filters.priceMode === "paid") {
    return activity.pricePerPerson !== null;
  }
  if (filters.priceMode === "custom") {
    const price = activity.pricePerPerson ?? 0;
    return (
      (filters.minPrice === null || price >= filters.minPrice) &&
      (filters.maxPrice === null || price <= filters.maxPrice)
    );
  }
  return true;
}

function getActiveFilterCount(filters: ActivityFilters) {
  return (
    Number(filters.destination.trim().length > 0) +
    Number(filters.categories.length > 0) +
    Number(filters.date !== "any") +
    Number(filters.groupSize !== "any") +
    Number(filters.onlyAvailable) +
    Number(filters.priceMode !== "any")
  );
}

export function useExploreActivities(activities: ExploreActivity[]) {
  const [searchDraft, setSearchDraft] = useState(initialSearch);
  const [search, setSearch] = useState(initialSearch);
  const [filters, setFilters] = useState(emptyActivityFilters);
  const [sort, setSort] = useState<SortOption>("best-match");

  const visibleActivities = useMemo(() => {
    const queryLocation = search.location.trim().toLowerCase();
    const filterLocation = filters.destination.trim().toLowerCase();

    const filtered = activities.filter((activity) => {
      const location = activity.locationName.toLowerCase();
      const matchesLocation =
        (!queryLocation || location.includes(queryLocation)) &&
        (!filterLocation || location.includes(filterLocation));
      const matchesCategory =
        search.category === "all" ||
        activity.category.name === search.category;
      const matchesFilterCategory =
        filters.categories.length === 0 ||
        filters.categories.includes(activity.category.name);
      const availableSpots = activity.capacity - activity.approvedCount;
      const matchesAvailability =
        !filters.onlyAvailable || availableSpots > 0;
      const matchesPriceRange = matchesPrice(activity, filters);
      const groupMatches = matchesGroupSize(activity, filters.groupSize);

      return (
        matchesLocation &&
        matchesCategory &&
        matchesDate(activity, search.date) &&
        matchesFilterCategory &&
        matchesFilterDate(activity, filters) &&
        matchesAvailability &&
        matchesPriceRange &&
        groupMatches
      );
    });

    switch (sort) {
      case "newest":
        return filtered.sort(
          (first, second) =>
            Date.parse(second.createdAt) - Date.parse(first.createdAt),
        );
      case "upcoming":
        return filtered.sort(
          (first, second) =>
            Date.parse(first.startsAt) - Date.parse(second.startsAt),
        );
      case "price-low":
        return filtered.sort(
          (first, second) =>
            (first.pricePerPerson ?? 0) - (second.pricePerPerson ?? 0),
        );
      case "popular":
        return filtered.sort(
          (first, second) => second.popularityScore - first.popularityScore,
        );
      default:
        return filtered;
    }
  }, [activities, filters, search, sort]);

  function applySearch() {
    setSearch(searchDraft);
  }

  function resetSearchAndFilters() {
    setSearchDraft(initialSearch);
    setSearch(initialSearch);
    setFilters(emptyActivityFilters);
  }

  return {
    searchDraft,
    setSearchDraft,
    applySearch,
    filters,
    setFilters,
    sort,
    setSort,
    visibleActivities,
    activeFilterCount: getActiveFilterCount(filters),
    resetSearchAndFilters,
  };
}
