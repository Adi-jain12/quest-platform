"use client";

import ActivityResults from "@/components/explore/activity-results";
import ExploreHeader from "@/components/explore/explore-header";
import SearchBar from "@/components/explore/search-bar";
import { useExploreActivities } from "@/hooks/use-explore-activities";
import type { ExploreActivity } from "@/types/activity";

export default function ExplorePage({
  activities,
}: {
  activities: ExploreActivity[];
}) {
  const {
    searchDraft,
    setSearchDraft,
    applySearch,
    filters,
    setFilters,
    sort,
    setSort,
    visibleActivities,
    activeFilterCount,
    resetSearchAndFilters,
  } = useExploreActivities(activities);

  return (
    <div className="explore-backdrop explore-page-backdrop">
      <main className="explore-shell explore-page-shell">
        <ExploreHeader />
        <div className="explore-search-wrap">
          <SearchBar
            onChange={setSearchDraft}
            onSearch={applySearch}
            value={searchDraft}
          />
        </div>
        <ActivityResults
          activeFilterCount={activeFilterCount}
          activities={visibleActivities}
          filters={filters}
          onApplyFilters={setFilters}
          onReset={resetSearchAndFilters}
          onSortChange={setSort}
          sort={sort}
        />
      </main>
    </div>
  );
}
