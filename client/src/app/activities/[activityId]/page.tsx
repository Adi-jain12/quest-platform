import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ActivityDetailPage from "@/components/activity-detail/activity-detail-page";
import { getMockActivities } from "@/data/mock-activities";

export const metadata: Metadata = {
  title: "Activity details | Quest",
};

export default async function ActivityRoute({
  params,
}: {
  params: Promise<{ activityId: string }>;
}) {
  const { activityId } = await params;
  const activity = getMockActivities().find((item) => item.id === activityId);
  if (!activity) notFound();

  return <ActivityDetailPage activity={activity} />;
}
