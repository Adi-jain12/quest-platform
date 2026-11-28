import Link from "next/link";
import {
  availableSpots,
  formatActivityDate,
  formatActivityPrice,
  personInitials,
} from "@/lib/activity-format";
import type { ExploreActivity } from "@/types/activity";

export default function ActivityCard({
  activity,
}: {
  activity: ExploreActivity;
}) {
  const spots = availableSpots(activity);

  return (
    <Link
      aria-label={`${activity.title}, ${activity.locationName}, ${formatActivityDate(activity.startsAt)}`}
      className="activity-card"
      href={`/activities/${activity.id}`}
    >
      <div
        aria-label={activity.title}
        className="activity-card-image"
        role="img"
        style={{
          backgroundImage: `linear-gradient(180deg, rgb(20 30 25 / 0%) 48%, rgb(20 30 25 / 38%) 100%), url("${activity.coverImage ?? ""}")`,
        }}
      >
        <span className="activity-category-badge">{activity.category.name}</span>
        <span
          className={`activity-spots-badge${spots === 0 ? " is-full" : ""}`}
        >
          {spots === 0 ? "Full" : `${spots} spots left`}
        </span>
      </div>

      <div className="activity-card-content">
        <h2>{activity.title}</h2>
        <p className="activity-card-location">
          <svg aria-hidden="true" fill="none" viewBox="0 0 16 16">
            <path
              d="M13 6.5c0 3.2-5 7-5 7s-5-3.8-5-7a5 5 0 1 1 10 0Z"
              stroke="currentColor"
              strokeWidth="1.3"
            />
            <circle cx="8" cy="6.5" r="1.6" stroke="currentColor" strokeWidth="1.3" />
          </svg>
          {activity.locationName}
        </p>
        <p className="activity-card-date">
          <svg aria-hidden="true" fill="none" viewBox="0 0 16 16">
            <rect
              height="10"
              rx="1.6"
              stroke="currentColor"
              strokeWidth="1.3"
              width="11"
              x="2.5"
              y="3.5"
            />
            <path
              d="M5 2v3M11 2v3M2.8 6.5h10.4"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.3"
            />
          </svg>
          {formatActivityDate(activity.startsAt)}
        </p>

        <div className="activity-card-footer">
          <span className="activity-host">
            <span aria-hidden="true" className="host-avatar">
              {personInitials(activity.host.name)}
            </span>
            <span className="activity-host-name">{activity.host.name}</span>
          </span>
          <span className="activity-price">
            <strong>{formatActivityPrice(activity.pricePerPerson)}</strong>
            {activity.pricePerPerson !== null && <span> / person</span>}
          </span>
        </div>
      </div>
    </Link>
  );
}
