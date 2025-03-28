import { sql } from "./sql";

export const syncDatabase = async () => {
  return Promise.all([
    syncFinanceData(),
    syncFinanceChangeData(),
    syncFinanceGroupData(),
  ]);
};

const syncFinanceData = async () => {
  // check if the table exists
  const finance_data_tableEexists = await sql(
    `
      SELECT tablename 
      FROM pg_catalog.pg_tables
      WHERE schemaname = 'public' 
      AND tablename = 'finance_data';
    `
  ).then((res) => Boolean(res[0]));

  if (!finance_data_tableEexists) {
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
            currency VARCHAR(255) NOT NULL,
            group_id INTEGER NOT NULL DEFAULT 1
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

  const groupIdExists = await sql(
    `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'finance_data' 
      AND column_name = 'group_id';
    `
  ).then((res) => Boolean(res[0]));

  if (!groupIdExists) {
    await sql(`ALTER TABLE finance_data ADD COLUMN group_id INTEGER`);
  }

  // set group_id default value to 1
  await sql(`ALTER TABLE finance_data ALTER COLUMN group_id SET DEFAULT 1`);
};

const syncFinanceChangeData = async () => {
  // check if the table exists
  const finance_change_data_tableEexists = await sql(
    `
      SELECT tablename 
      FROM pg_catalog.pg_tables
      WHERE schemaname = 'public' 
      AND tablename = 'finance_change_data';
    `
  ).then((res) => Boolean(res[0]));

  if (!finance_change_data_tableEexists) {
    await sql(
      `
        CREATE TABLE IF NOT EXISTS finance_change_data (
          id SERIAL PRIMARY KEY,
          created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          group_id INTEGER NOT NULL,
          total_cny DECIMAL(10, 2) NOT NULL,
          finance_json TEXT NOT NULL
        )
    `
    );
  }
};

const syncFinanceGroupData = async () => {
  // check if the table exists
  const finance_group_data_tableEexists = await sql(
    `
      SELECT tablename 
      FROM pg_catalog.pg_tables
      WHERE schemaname = 'public' 
      AND tablename = 'finance_group_data';
    `
  ).then((res) => Boolean(res[0]));

  console.log(finance_group_data_tableEexists);
  if (!finance_group_data_tableEexists) {
    await sql(
      `
        CREATE TABLE IF NOT EXISTS finance_group_data (
          id SERIAL PRIMARY KEY,
          created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          name VARCHAR(255) NOT NULL
        )
      `
    );
    await sql(
      `
        INSERT INTO finance_group_data (name) VALUES ('Default Group');
      `
    );
  }
};
