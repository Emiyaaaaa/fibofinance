import { sql } from "./sql";

export const syncDatabase = async () => {
  return Promise.all([syncFinanceData(), syncFinanceChangeData(), syncFinanceGroupData(), syncIconsData()]);
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

  // check if icon column exists
  const iconExists = await isFieldExists("finance_data", "icon");

  if (!iconExists) {
    await sql(`ALTER TABLE finance_data ADD COLUMN icon VARCHAR(255)`);
  }
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

const syncIconsData = async () => {
  // check if the table exists
  const icons_tableExists = await isTableExists("icons");

  if (!icons_tableExists) {
    await sql(
      `
        CREATE TABLE IF NOT EXISTS icons (
          id SERIAL PRIMARY KEY,
          key VARCHAR(255) UNIQUE NOT NULL,
          svg TEXT NOT NULL,
          name VARCHAR(255),
          created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `,
    );

    // Add some default icons
    await sql(
      `
        INSERT INTO icons (key, name, svg) VALUES 
        ('cash', 'Cash', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>'),
        ('bank', 'Bank', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>'),
        ('house', 'House', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>'),
        ('wallet', 'Wallet', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h12v5"></path><path d="M10 3v18"></path><path d="M13 21v-6a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1h-5"></path></svg>'),
        ('chart', 'Chart', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>'),
        ('coin', 'Coin', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"></circle><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path><path d="M12 18V6"></path></svg>'),
        ('stock', 'Stock', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>'),
        ('piggy-bank', 'Savings', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2z"></path><path d="M2 9v1c0 1.1.9 2 2 2h1"></path><path d="M16 11h0"></path></svg>'),
        ('trending-up', 'Growth', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>'),
        ('shield', 'Insurance', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>'),
        ('building', 'Real Estate', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>'),
        ('briefcase', 'Business', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>')
        ON CONFLICT (key) DO NOTHING
      `,
    );
  }
};
