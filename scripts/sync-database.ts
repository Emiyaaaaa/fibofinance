import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const main = async () => {
  const { syncDatabase } = await import("../utils/syncDatabase");

  await syncDatabase();
};

main()
  .then(() => {
    console.log("Database synced");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed to sync database", error);
    process.exit(1);
  });
