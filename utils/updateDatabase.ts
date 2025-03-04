import { neon } from "@neondatabase/serverless";

export const createTableIfNotExists = async () => {
  const sql = neon(`${process.env.DATABASE_URL}`);

  // check if the table exists
  const tableExists = await sql(
    `
    SELECT tablename 
    FROM pg_catalog.pg_tables
    WHERE schemaname = 'public' 
    AND tablename = 'finance_data';
  `
  ).then((res) => Boolean(res[0]));

  if (!tableExists) {
    await sql(
      `
        CREATE TABLE IF NOT EXISTS finance_data (
          id SERIAL PRIMARY KEY,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          type VARCHAR(255),
          amount DECIMAL(10, 2) NOT NULL,
          currency VARCHAR(255) NOT NULL
        )
      `
    );
  }

  // check if description column exists
  const descriptionExists = await sql(
    `
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'finance_data' 
    AND column_name = 'description';
  `
  ).then((res) => Boolean(res[0]));

  if (!descriptionExists) {
    await sql(`ALTER TABLE finance_data ADD COLUMN description TEXT`);
  }
};
