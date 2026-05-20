import { neon } from "@neondatabase/serverless";

export const sql = process.env.DATABASE_URL ? neon(`${process.env.DATABASE_URL}`) : null;
