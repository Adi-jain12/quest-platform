"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  activityCategories,
  type ActivityCategoryName,
} from "@/types/activity";
import {
  emptyActivityFilters,
  type ActivityFilters,
} from "@/hooks/use-explore-activities";

interface FiltersDialogProps {
  initialFilters: ActivityFilters;
  onApply: (filters: ActivityFilters) => void;
  onClose: () => void;
}

export default function FiltersDialog({
  initialFilters,
  onApply,
  onClose,
}: FiltersDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState<ActivityFilters>(() => ({
    ...initialFilters,
    categories: [...initialFilters.categories],
  }));

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, []);

  function toggleCategory(category: ActivityCategoryName) {
    setDraft((current) => ({
      ...current,
      categories: current.categories.includes(category)
        ? current.categories.filter((selected) => selected !== category)
        : [...current.categories, category],
    }));
  }

  function submitFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onApply(draft);
    onClose();
  }

  function resetFilters() {
    setDraft(emptyActivityFilters);
    onApply(emptyActivityFilters);
  }

  return (
    <dialog
      aria-describedby="filters-description"
      aria-labelledby="filters-title"
      className="filters-dialog"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      ref={dialogRef}
    >
      <form className="filters-form" onSubmit={submitFilters}>
        <header className="filters-dialog-header">
          <div>
            <p className="filters-eyebrow">MAKE IT YOUR KIND OF PLAN</p>
            <h2 id="filters-title">Filters</h2>
            <p id="filters-description">
              Find a plan that feels just right.
            </p>
          </div>
          <button
            aria-label="Close filters"
            className="icon-button"
            onClick={onClose}
            type="button"
          >
            <svg aria-hidden="true" fill="none" viewBox="0 0 20 20">
              <path
                d="m5 5 10 10M15 5 5 15"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.7"
              />
            </svg>
          </button>
        </header>

        <div className="filters-body">
          <section className="filter-section">
            <h3>Location</h3>
            <label className="filter-location-field">
              <span className="sr-only">City or destination</span>
              <svg aria-hidden="true" fill="none" viewBox="0 0 20 20">
                <path
                  d="M16.2 8.2c0 4.1-6.2 9-6.2 9s-6.2-4.9-6.2-9a6.2 6.2 0 1 1 12.4 0Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <circle cx="10" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              <input
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    destination: event.target.value,
                  }))
                }
                placeholder="City or destination"
                value={draft.destination}
              />
            </label>
          </section>

          <fieldset className="filter-section">
            <legend>Activity category</legend>
            <div className="category-options">
              {activityCategories.map((category) => (
                <label className="filter-check" key={category}>
                  <input
                    checked={draft.categories.includes(category)}
                    onChange={() => toggleCategory(category)}
                    type="checkbox"
                  />
                  <span>{category}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="filter-section">
            <legend>Date</legend>
            <div className="filter-choice-grid">
              {[
                ["any", "Any date"],
                ["today", "Today"],
                ["weekend", "This weekend"],
                ["custom", "Custom date range"],
              ].map(([value, label]) => (
                <label className="filter-radio" key={value}>
                  <input
                    checked={draft.date === value}
                    name="filter-date"
                    onChange={() =>
                      setDraft((current) => ({
                        ...current,
                        date: value as ActivityFilters["date"],
                      }))
                    }
                    type="radio"
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
            {draft.date === "custom" && (
              <div className="filter-date-range">
                <label>
                  <span>From</span>
                  <input
                    aria-label="Start date"
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        startDate: event.target.value,
                      }))
                    }
                    type="date"
                    value={draft.startDate}
                  />
                </label>
                <label>
                  <span>To</span>
                  <input
                    aria-label="End date"
                    min={draft.startDate || undefined}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        endDate: event.target.value,
                      }))
                    }
                    type="date"
                    value={draft.endDate}
                  />
                </label>
              </div>
            )}
          </fieldset>

          <fieldset className="filter-section">
            <legend>Group size</legend>
            <div className="filter-choice-grid">
              {[
                ["any", "Any group"],
                ["small", "Small group"],
                ["medium", "Medium group"],
                ["large", "Large group"],
              ].map(([value, label]) => (
                <label className="filter-radio" key={value}>
                  <input
                    checked={draft.groupSize === value}
                    name="filter-group-size"
                    onChange={() =>
                      setDraft((current) => ({
                        ...current,
                        groupSize: value as ActivityFilters["groupSize"],
                      }))
                    }
                    type="radio"
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <section className="filter-section availability-section">
            <h3>Availability</h3>
            <label className="filter-check">
              <input
                checked={draft.onlyAvailable}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    onlyAvailable: event.target.checked,
                  }))
                }
                type="checkbox"
              />
              <span>Activities with available spots</span>
            </label>
          </section>

          <fieldset className="filter-section">
            <legend>Price per person</legend>
            <div className="filter-choice-grid">
              {[
                ["any", "Any price"],
                ["free", "Free activities"],
                ["paid", "Paid activities"],
                ["custom", "Custom price range"],
              ].map(([value, label]) => (
                <label className="filter-radio" key={value}>
                  <input
                    checked={draft.priceMode === value}
                    name="filter-price"
                    onChange={() =>
                      setDraft((current) => ({
                        ...current,
                        priceMode: value as ActivityFilters["priceMode"],
                      }))
                    }
                    type="radio"
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
            {draft.priceMode === "custom" && (
              <div className="filter-price-range">
                <label>
                  <span>Minimum (₹)</span>
                  <input
                    min={0}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        minPrice:
                          event.target.value === ""
                            ? null
                            : Number(event.target.value),
                      }))
                    }
                    placeholder="0"
                    type="number"
                    value={draft.minPrice ?? ""}
                  />
                </label>
                <label>
                  <span>Maximum (₹)</span>
                  <input
                    min={draft.minPrice ?? 0}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        maxPrice:
                          event.target.value === ""
                            ? null
                            : Number(event.target.value),
                      }))
                    }
                    placeholder="No limit"
                    type="number"
                    value={draft.maxPrice ?? ""}
                  />
                </label>
              </div>
            )}
          </fieldset>
        </div>

        <footer className="filters-dialog-footer">
          <button
            className="filters-reset"
            onClick={resetFilters}
            type="button"
          >
            Reset
          </button>
          <button className="filters-apply" type="submit">
            Apply filters
          </button>
        </footer>
      </form>
    </dialog>
  );
}
