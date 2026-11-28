export const activityCategories = [
  "Outdoor",
  "Sports",
  "Food & Drinks",
  "Movies",
  "Gaming",
  "Parties",
  "Travel",
  "Other",
] as const;

export type ActivityCategoryName = (typeof activityCategories)[number];
export type ActivityStatus = "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";

export interface ActivityCategory {
  id: string;
  name: ActivityCategoryName;
  slug: string;
  isActive: boolean;
}

export interface ActivityHost {
  id: string;
  name: string;
  email: string;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  coverImage: string | null;
  locationName: string;
  address: string | null;
  startsAt: string;
  endsAt: string | null;
  capacity: number;
  approvedCount: number;
  status: ActivityStatus;
  category: ActivityCategory;
  host: ActivityHost;
  createdAt: string;
  updatedAt: string;
}

export interface ExploreActivity extends Activity {
  // These are demo listing values; the current GraphQL Activity type has no pricing or popularity fields.
  pricePerPerson: number | null;
  popularityScore: number;
}
