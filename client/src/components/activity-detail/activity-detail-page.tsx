import Link from "next/link";
import ExploreHeader from "@/components/explore/explore-header";
import {
  availableSpots,
  formatActivityDate,
  formatActivityPrice,
  personInitials,
} from "@/lib/activity-format";
import type { ExploreActivity } from "@/types/activity";

export default function ActivityDetailPage({
  activity,
}: {
  activity: ExploreActivity;
}) {
  const spots = availableSpots(activity);

  return (
    <div className="explore-backdrop detail-backdrop">
      <main className="explore-shell activity-detail-shell">
        <ExploreHeader />
        <article className="activity-detail">
          <Link className="detail-back-link" href="/explore">
            <svg aria-hidden="true" fill="none" viewBox="0 0 18 18">
              <path
                d="M14.5 9h-11m0 0 4.5-4.5M3.5 9 8 13.5"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
            </svg>
            Back to Explore
          </Link>

          <div className="activity-detail-layout">
            <div
              aria-label={activity.title}
              className="activity-detail-image"
              role="img"
              style={{
                backgroundImage: `linear-gradient(180deg, rgb(20 30 25 / 0%) 48%, rgb(20 30 25 / 28%) 100%), url("${activity.coverImage ?? ""}")`,
              }}
            >
              <span className="activity-category-badge">
                {activity.category.name}
              </span>
            </div>

            <div className="activity-detail-copy">
              <p className="detail-eyebrow">{activity.locationName}</p>
              <h1>{activity.title}</h1>
              <div className="detail-facts">
                <span>
                  <strong>{formatActivityDate(activity.startsAt)}</strong>
                </span>
                <span>
                  <strong>
                    {spots === 0 ? "Fully booked" : `${spots} spots left`}
                  </strong>
                </span>
                <span>
                  <strong>
                    {formatActivityPrice(activity.pricePerPerson)}
                    {activity.pricePerPerson !== null && " / person"}
                  </strong>
                </span>
              </div>
              <p className="detail-description">{activity.description}</p>
              <div className="detail-host">
                <span aria-hidden="true" className="host-avatar detail-host-avatar">
                  {personInitials(activity.host.name)}
                </span>
                <span>
                  <span className="detail-host-caption">Hosted by</span>
                  <strong>{activity.host.name}</strong>
                </span>
              </div>
              <div className="detail-address">
                <strong>Where you’ll meet</strong>
                <span>{activity.address ?? activity.locationName}</span>
              </div>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}
