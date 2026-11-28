"use client";

import { useState } from "react";
import ActivityCard from "@/components/explore/activity-card";
import FiltersDialog from "@/components/explore/filters-dialog";
import type {
  ActivityFilters,
  SortOption,
} from "@/hooks/use-explore-activities";
import type { ExploreActivity } from "@/types/activity";

interface ActivityResultsProps {
  activities: ExploreActivity[];
  activeFilterCount: number;
  filters: ActivityFilters;
  sort: SortOption;
  onApplyFilters: (filters: ActivityFilters) => void;
  onReset: () => void;
  onSortChange: (sort: SortOption) => void;
}

export default function ActivityResults({
  activities,
  activeFilterCount,
  filters,
  sort,
  onApplyFilters,
  onReset,
  onSortChange,
}: ActivityResultsProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <section aria-labelledby="results-heading" className="activity-results" id="activities">
      <div className="results-toolbar">
        <div className="results-leading">
          <div>
            <h1 id="results-heading">
              {activities.length} {activities.length === 1 ? "activity" : "activities"}
              <span> available</span>
            </h1>
            <p>Find your next good plan around Ahmedabad.</p>
          </div>
          <button
            aria-haspopup="dialog"
            className="filters-trigger"
            onClick={() => setFiltersOpen(true)}
            type="button"
          >
            <svg aria-hidden="true" fill="none" viewBox="0 0 18 18">
              <path
                d="M3 5h12M5.5 9h7M7.5 13h3"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.5"
              />
            </svg>
            Filters
            {activeFilterCount > 0 && (
              <span aria-label={`${activeFilterCount} active filters`} className="filter-count">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        <label className="sort-control">
          <span>Sort by</span>
          <select
            aria-label="Sort activities"
            onChange={(event) => onSortChange(event.target.value as SortOption)}
            value={sort}
          >
            <option value="best-match">Best match</option>
            <option value="newest">Newest</option>
            <option value="upcoming">Upcoming</option>
            <option value="price-low">Price: Low to High</option>
            <option value="popular">Most popular</option>
          </select>
        </label>
      </div>

      {activities.length > 0 ? (
        <div className="activity-grid">
          {activities.map((activity) => (
            <ActivityCard activity={activity} key={activity.id} />
          ))}
        </div>
      ) : (
        <div className="empty-activities">
          <span aria-hidden="true" className="empty-activities-icon">
            ✳
          </span>
          <h2>No activities found</h2>
          <p>Try changing your search or clearing the filters.</p>
          <button className="empty-reset-button" onClick={onReset} type="button">
            Clear search and filters
          </button>
        </div>
      )}

      {filtersOpen && (
        <FiltersDialog
          initialFilters={filters}
          onApply={onApplyFilters}
          onClose={() => setFiltersOpen(false)}
        />
      )}
    </section>
  );
}
