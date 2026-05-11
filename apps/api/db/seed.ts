import { mockUser } from '@/mocks/seed.mock.ts';
import { db } from './connection.ts';
import { users } from './schema.ts';

const seed = async () => {
  console.log('Starting database seed...');

  try {
    console.log('Clearing existing data...');
    await db.delete(users);

    console.log('Creating demo users...');
    const [demoUser] = await db.insert(users).values(mockUser).returning();

    console.log('DB seeded successfully');
  } catch (e) {
    console.error('seed failed', e);
    process.exit(1);
  }
};

if (import.meta.url === `file://${process.argv[1]}`) {
  seed()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default seed;
