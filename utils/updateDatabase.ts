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
    // 名称，类型，金额，货币类型
    await sql(
      `
        CREATE TABLE IF NOT EXISTS finance_data (
          id SERIAL PRIMARY KEY,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          name VARCHAR(255) NOT NULL,
          type VARCHAR(255),
          amount DECIMAL(10, 2) NOT NULL,
          currency VARCHAR(255) NOT NULL
        )
      `
    );
  }
};
