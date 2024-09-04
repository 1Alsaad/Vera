import type { Config } from 'drizzle-kit';

export default {
  schema: './db/schema/*',
  out: './drizzle',
  dialect: 'postgresql', // Add this line (or 'mysql' or 'sqlite' depending on your database)
} satisfies Config;