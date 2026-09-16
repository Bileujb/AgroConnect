import * as SQLite from 'expo-sqlite';
import { CREATE_TABLES_SQL } from './schema';

let dbInstance = null;

export async function getDb() {
  if (dbInstance) return dbInstance;

  // Abre ou cria o banco "agroconnect.db"
  dbInstance = await SQLite.openDatabaseAsync('agroconnect.db');

  // Executa a criação das tabelas
  await dbInstance.execAsync(CREATE_TABLES_SQL);

  return dbInstance;
}