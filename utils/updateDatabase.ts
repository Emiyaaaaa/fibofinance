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

  await sql(
    `ALTER TABLE finance_data ALTER COLUMN created_at TYPE TIMESTAMPTZ`
  );
  await sql(
    `ALTER TABLE finance_data ALTER COLUMN updated_at TYPE TIMESTAMPTZ`
  );

  if (!tableExists) {
    await sql(
      `
        CREATE TABLE IF NOT EXISTS finance_data (
          id SERIAL PRIMARY KEY,
          created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          owner VARCHAR(255),
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

  // check if owner column exists
  const ownerExists = await sql(
    `
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'finance_data' 
    AND column_name = 'owner';
  `
  ).then((res) => Boolean(res[0]));

  if (!ownerExists) {
    await sql(`ALTER TABLE finance_data ADD COLUMN owner VARCHAR(255)`);
  }
};
