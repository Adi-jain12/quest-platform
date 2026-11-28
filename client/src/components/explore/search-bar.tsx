"use client";

import {
  activityCategories,
} from "@/types/activity";
import type { SearchCriteria, SearchDate } from "@/hooks/use-explore-activities";

interface SearchBarProps {
  value: SearchCriteria;
  onChange: (value: SearchCriteria) => void;
  onSearch: () => void;
}

export default function SearchBar({
  value,
  onChange,
  onSearch,
}: SearchBarProps) {
  function update<K extends keyof SearchCriteria>(
    key: K,
    nextValue: SearchCriteria[K],
  ) {
    onChange({ ...value, [key]: nextValue });
  }

  return (
    <form
      className="explore-search"
      onSubmit={(event) => {
        event.preventDefault();
        onSearch();
      }}
    >
      <label className="search-field search-location">
        <svg aria-hidden="true" fill="none" viewBox="0 0 20 20">
          <path
            d="M16.2 8.2c0 4.1-6.2 9-6.2 9s-6.2-4.9-6.2-9a6.2 6.2 0 1 1 12.4 0Z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <circle cx="10" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <span className="search-field-copy">
          <span className="search-field-label">Location</span>
          <input
            aria-label="Search by location"
            list="quest-destinations"
            onChange={(event) => update("location", event.target.value)}
            placeholder="City or destination"
            value={value.location}
          />
          <datalist id="quest-destinations">
            <option value="Ahmedabad" />
            <option value="Gandhinagar" />
            <option value="Sanand" />
          </datalist>
        </span>
      </label>

      <label className="search-field">
        <svg aria-hidden="true" fill="none" viewBox="0 0 20 20">
          <rect
            height="12.5"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.5"
            width="13.5"
            x="3.25"
            y="4.25"
          />
          <path
            d="M6.5 2.75v3M13.5 2.75v3M3.5 8h13"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.5"
          />
        </svg>
        <span className="search-field-copy">
          <span className="search-field-label">Date</span>
          <select
            aria-label="Filter by date"
            onChange={(event) =>
              update("date", event.target.value as SearchDate)
            }
            value={value.date}
          >
            <option value="any">Any date</option>
            <option value="today">Today</option>
            <option value="weekend">This weekend</option>
          </select>
        </span>
      </label>

      <label className="search-field search-category">
        <svg aria-hidden="true" fill="none" viewBox="0 0 20 20">
          <circle cx="7" cy="7" r="2.25" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="14" cy="7" r="2.25" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M2.8 16c.4-2.2 1.8-3.5 4.2-3.5 1.2 0 2.2.4 2.9 1.1M10.2 16c.4-2.2 1.8-3.5 4.2-3.5s3.8 1.3 4.2 3.5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.5"
          />
        </svg>
        <span className="search-field-copy">
          <span className="search-field-label">Activity</span>
          <select
            aria-label="Filter by activity category"
            onChange={(event) => update("category", event.target.value)}
            value={value.category}
          >
            <option value="all">All activities</option>
            {activityCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </span>
      </label>

      <button className="search-submit" type="submit">
        <svg aria-hidden="true" fill="none" viewBox="0 0 20 20">
          <circle cx="8.75" cy="8.75" r="5.75" stroke="currentColor" strokeWidth="1.7" />
          <path
            d="m13 13 4 4"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.7"
          />
        </svg>
        <span>Search</span>
      </button>
    </form>
  );
}
