"use client";

import Link from "next/link";
import { useAuthSession } from "@/providers/auth-provider";

function initials(name: string | undefined) {
  if (!name) return "Q";
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function ProfileMenu() {
  const { user } = useAuthSession();

  return (
    <details className="profile-menu">
      <summary aria-label="Open account menu" className="profile-trigger">
        <span className="profile-summary">
          <span className="profile-name">{user?.name ?? "Your account"}</span>
          <span className="profile-caption">
            {user ? "Quest member" : "Join the community"}
          </span>
        </span>
        <span aria-hidden="true" className="profile-avatar">
          {initials(user?.name)}
        </span>
        <svg
          aria-hidden="true"
          className="profile-chevron"
          fill="none"
          viewBox="0 0 16 16"
        >
          <path
            d="m4 6 4 4 4-4"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
        </svg>
      </summary>
      <div className="profile-popover">
        {user ? (
          <>
            <p className="profile-popover-label">Signed in as</p>
            <strong>{user.name}</strong>
            <span className="profile-email">{user.email}</span>
            <span className="profile-role">{user.role.toLowerCase()}</span>
          </>
        ) : (
          <>
            <strong>Good plans start here.</strong>
            <p>Sign in or create an account to meet your people.</p>
            <Link className="profile-action" href="/login">
              Sign in
            </Link>
          </>
        )}
      </div>
    </details>
  );
}
