import Link from "next/link";
import ProfileMenu from "@/components/explore/profile-menu";

function QuestMark() {
  return (
    <span aria-hidden="true" className="explore-logo-mark">
      <svg fill="none" viewBox="0 0 32 32">
        <path
          d="M16 3.5 27 9.75v12.5L16 28.5 5 22.25V9.75L16 3.5Z"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M12.1 12.35a5.55 5.55 0 1 1 7.8 7.9l-7.8-7.9Zm0 0 7.8 7.9"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
    </span>
  );
}

export default function ExploreHeader() {
  return (
    <header className="explore-header">
      <Link aria-label="Quest home" className="explore-brand" href="/explore">
        <QuestMark />
        <span>quest</span>
      </Link>

      <nav aria-label="Main navigation" className="explore-nav">
        <Link aria-current="page" className="explore-nav-link is-active" href="/explore">
          Explore
        </Link>
        <span aria-disabled="true" className="explore-nav-link is-unavailable">
          My Activities
        </span>
        <span aria-disabled="true" className="explore-nav-link is-unavailable">
          Become a Host
        </span>
      </nav>

      <ProfileMenu />
    </header>
  );
}
