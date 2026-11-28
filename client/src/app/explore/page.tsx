import type { Metadata } from "next";
import { connection } from "next/server";
import ExplorePage from "@/components/explore/explore-page";
import { getMockActivities } from "@/data/mock-activities";

export const metadata: Metadata = {
  title: "Explore activities | Quest",
  description: "Find activities and meet people around you.",
};

export default async function ExploreRoute() {
  await connection();
  return <ExplorePage activities={getMockActivities()} />;
}
