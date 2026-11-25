import { db } from './db.js';

const categories = [
  { name: 'Sports & Fitness', slug: 'sports-fitness' },
  { name: 'Food & Dining', slug: 'food-dining' },
  { name: 'Movies & Entertainment', slug: 'movies-entertainment' },
  { name: 'Travel & Outdoors', slug: 'travel-outdoors' },
  { name: 'Gaming', slug: 'gaming' },
  { name: 'Social Gatherings', slug: 'social-gatherings' },
  { name: 'Learning & Workshops', slug: 'learning-workshops' },
  { name: 'Arts & Culture', slug: 'arts-culture' },
] as const;

async function seedCategories() {
  let created = 0;
  let skipped = 0;

  try {
    for (const category of categories) {
      const bySlug = await db.orm.public.ActivityCategory
        .whereUnique({ slug: category.slug })
        .first();
      const byName = bySlug
        ? null
        : await db.orm.public.ActivityCategory
            .whereUnique({ name: category.name })
            .first();

      if (bySlug || byName) {
        skipped += 1;
        console.log(`Already exists; leaving unchanged: ${category.name}`);
        continue;
      }

      await db.orm.public.ActivityCategory.create(category);
      created += 1;
      console.log(`Created: ${category.name}`);
    }

    console.log(`Activity categories seeded: ${created} created, ${skipped} unchanged.`);
  } finally {
    await db.close();
  }
}

try {
  await seedCategories();
} catch (error) {
  console.error('Failed to seed activity categories:', error);
  process.exitCode = 1;
}
