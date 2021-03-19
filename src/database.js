import path from 'path';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const filename = path.resolve(process.cwd(), process.env.DATABASE);

const db = await open({
  filename,
  driver: sqlite3.Database,
});

export default db;
