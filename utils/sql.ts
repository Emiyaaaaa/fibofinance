import { neon } from "@neondatabase/serverless";

export const sql = neon(`${process.env.DATABASE_URL}`);
export const sqlExists = Boolean(process.env.DATABASE_URL);
