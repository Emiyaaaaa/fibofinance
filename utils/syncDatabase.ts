import { sql } from "./sql";

export const syncDatabase = async () => {
  return Promise.all([syncFinanceData(), syncFinanceChangeData(), syncFinanceGroupData()]);
};

const isTableExists = async (tableName: string) => {
  const result = await sql(
    `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = '${tableName}';
    `,
  ).then((res) => Boolean(res[0]));

  return result;
};

const isFieldExists = async (tableName: string, fieldName: string) => {
  const result = await sql(
    `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = '${tableName}' 
      AND column_name = '${fieldName}';
    `,
  ).then((res) => Boolean(res[0]));

  return result;
};

const syncFinanceData = async () => {
  // check if the table exists
  const finance_data_tableEexists = await isTableExists("finance_data");

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
        `,
    );
  }

  // check if description column exists
  const descriptionExists = await isFieldExists("finance_data", "description");

  if (!descriptionExists) {
    await sql(`ALTER TABLE finance_data ADD COLUMN description TEXT`);
  }

  // check if owner column exists
  const ownerExists = await isFieldExists("finance_data", "owner");

  if (!ownerExists) {
    await sql(`ALTER TABLE finance_data ADD COLUMN owner VARCHAR(255)`);
  }

  const groupIdExists = await isFieldExists("finance_data", "group_id");

  if (!groupIdExists) {
    await sql(`ALTER TABLE finance_data ADD COLUMN group_id INTEGER`);
    await sql(
      `
        UPDATE finance_data 
        SET group_id = 1;
      `,
    );
  }

  // set group_id default value to 1
  await sql(`ALTER TABLE finance_data ALTER COLUMN group_id SET DEFAULT 1`);
};

const syncFinanceChangeData = async () => {
  // check if the table exists
  const finance_change_data_tableEexists = await isTableExists("finance_change_data");

  if (!finance_change_data_tableEexists) {
    await sql(
      `
        CREATE TABLE IF NOT EXISTS finance_change_data (
          id SERIAL PRIMARY KEY,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          group_id INTEGER NOT NULL,
          finance_json TEXT NOT NULL,
          date VARCHAR(255) NOT NULL
        )
    `,
    );
  }
};

const syncFinanceGroupData = async () => {
  // check if the table exists
  const finance_group_data_tableEexists = await isTableExists("finance_group_data");

  if (!finance_group_data_tableEexists) {
    await sql(
      `
        CREATE TABLE IF NOT EXISTS finance_group_data (
          id SERIAL PRIMARY KEY,
          created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          name VARCHAR(255) NOT NULL,
          is_default BOOLEAN NOT NULL DEFAULT FALSE
        )
      `,
    );
    await sql(
      `
        INSERT INTO finance_group_data (name, is_default) VALUES ('Default Group', TRUE);
      `,
    );
  }

  const is_defaultExist = await isFieldExists("finance_group_data", "is_default");

  if (!is_defaultExist) {
    await sql(`ALTER TABLE finance_group_data ADD COLUMN is_default BOOLEAN NOT NULL DEFAULT FALSE`);
  }
};
