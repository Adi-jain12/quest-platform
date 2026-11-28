import type { ExploreActivity } from "@/types/activity";

function ahmedabadDateParts() {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Kolkata",
    year: "numeric",
  }).formatToParts(new Date());

  return {
    year: Number(parts.find((part) => part.type === "year")?.value),
    month: Number(parts.find((part) => part.type === "month")?.value),
    day: Number(parts.find((part) => part.type === "day")?.value),
  };
}

function dateAt(dayOffset: number, hour: number) {
  const { year, month, day } = ahmedabadDateParts();
  return new Date(
    Date.UTC(year, month - 1, day + dayOffset, hour - 5, 30),
  ).toISOString();
}

function weekendDate(day: 0 | 1, hour: number) {
  const { year, month, day: currentDay } = ahmedabadDateParts();
  const weekday = new Date(Date.UTC(year, month - 1, currentDay)).getUTCDay();
  let daysUntilSaturday = (6 - weekday + 7) % 7;
  if (weekday === 0) daysUntilSaturday = -1;

  let daysUntilEvent = daysUntilSaturday + day;
  const currentHour = Number(
    new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      hourCycle: "h23",
      timeZone: "Asia/Kolkata",
    }).format(new Date()),
  );
  if (daysUntilEvent < 0 || (daysUntilEvent === 0 && hour <= currentHour)) {
    daysUntilEvent += 7;
  }

  return new Date(
    Date.UTC(
      year,
      month - 1,
      currentDay + daysUntilEvent,
      hour - 5,
      30,
    ),
  ).toISOString();
}

function category(name: ExploreActivity["category"]["name"]) {
  return {
    id: name.toLowerCase().replace(/[^a-z]+/g, "-"),
    name,
    slug: name.toLowerCase().replace(/[^a-z]+/g, "-"),
    isActive: true,
  };
}

export function getMockActivities(): ExploreActivity[] {
  return [
    {
      id: "ahmedabad-home-cooking",
      title: "Authentic cooking with a local family",
      description:
        "Learn to make a few much-loved Gujarati dishes, share stories around the kitchen, and sit down to enjoy the meal together.",
      coverImage:
        "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=85",
      locationName: "Ahmedabad",
      address: "Old City, Ahmedabad",
      startsAt: dateAt(3, 18),
      endsAt: dateAt(3, 20),
      capacity: 8,
      approvedCount: 5,
      status: "PUBLISHED",
      category: category("Food & Drinks"),
      host: { id: "host-meera", name: "Meera Shah", email: "meera@example.com" },
      createdAt: dateAt(-8, 12),
      updatedAt: dateAt(-2, 12),
      pricePerPerson: 650,
      popularityScore: 92,
    },
    {
      id: "weekend-football",
      title: "Weekend football with new friends",
      description:
        "A relaxed, all-levels five-a-side game. Bring your energy; we’ll bring the ball and a cold drink for after.",
      coverImage:
        "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1200&q=85",
      locationName: "Ahmedabad",
      address: "Riverfront Sports Ground",
      startsAt: weekendDate(0, 8),
      endsAt: weekendDate(0, 10),
      capacity: 14,
      approvedCount: 10,
      status: "PUBLISHED",
      category: category("Sports"),
      host: { id: "host-rahul", name: "Rahul Desai", email: "rahul@example.com" },
      createdAt: dateAt(-2, 12),
      updatedAt: dateAt(-1, 12),
      pricePerPerson: 180,
      popularityScore: 98,
    },
    {
      id: "wood-carving-workshop",
      title: "Wood carving for curious beginners",
      description:
        "Spend an easy afternoon learning safe carving basics and shape a small keepsake to take home.",
      coverImage:
        "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1200&q=85",
      locationName: "Ahmedabad",
      address: "The Maker’s Room, Navrangpura",
      startsAt: dateAt(6, 15),
      endsAt: dateAt(6, 17),
      capacity: 8,
      approvedCount: 6,
      status: "PUBLISHED",
      category: category("Other"),
      host: { id: "host-isha", name: "Isha Patel", email: "isha@example.com" },
      createdAt: dateAt(-11, 12),
      updatedAt: dateAt(-3, 12),
      pricePerPerson: 850,
      popularityScore: 78,
    },
    {
      id: "movie-night",
      title: "Movie night under the stars",
      description:
        "Bring a blanket, pick a classic from the group shortlist, and enjoy an open-air screening with snacks.",
      coverImage:
        "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=85",
      locationName: "Ahmedabad",
      address: "Prahlad Nagar Garden",
      startsAt: weekendDate(1, 19),
      endsAt: weekendDate(1, 22),
      capacity: 16,
      approvedCount: 16,
      status: "PUBLISHED",
      category: category("Movies"),
      host: { id: "host-kavya", name: "Kavya Rao", email: "kavya@example.com" },
      createdAt: dateAt(-4, 12),
      updatedAt: dateAt(-1, 12),
      pricePerPerson: null,
      popularityScore: 85,
    },
    {
      id: "board-game-evening",
      title: "Board games, chai & good company",
      description:
        "Try a few easy-to-learn favourites, meet fellow game lovers, and take a break for chai and snacks.",
      coverImage:
        "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=1200&q=85",
      locationName: "Ahmedabad",
      address: "Common Room Café, Bodakdev",
      startsAt: dateAt(4, 17),
      endsAt: dateAt(4, 20),
      capacity: 10,
      approvedCount: 6,
      status: "PUBLISHED",
      category: category("Gaming"),
      host: { id: "host-amit", name: "Amit Joshi", email: "amit@example.com" },
      createdAt: dateAt(-6, 12),
      updatedAt: dateAt(-1, 12),
      pricePerPerson: 250,
      popularityScore: 90,
    },
    {
      id: "weekend-house-party",
      title: "A cosy house party, no small talk",
      description:
        "A small gathering with good music, shared snacks, and a few conversation games to make meeting easy.",
      coverImage:
        "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=1200&q=85",
      locationName: "Ahmedabad",
      address: "Satellite, Ahmedabad",
      startsAt: weekendDate(1, 18),
      endsAt: weekendDate(1, 22),
      capacity: 12,
      approvedCount: 7,
      status: "PUBLISHED",
      category: category("Parties"),
      host: { id: "host-nisha", name: "Nisha Mehta", email: "nisha@example.com" },
      createdAt: dateAt(-3, 12),
      updatedAt: dateAt(-1, 12),
      pricePerPerson: 400,
      popularityScore: 87,
    },
  ];
}
