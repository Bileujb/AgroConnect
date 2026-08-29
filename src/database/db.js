/*import * as SQLite from 'expo-sqlite';
import { CREATE_TABLES_SQL } from './schema';

// guarda a conexao aberta pra nao abrir o banco de novo toda hora
let dbInstance = null;

export async function getDb() {
  if (dbInstance) return dbInstance;

  // abre (ou cria, se nao existir) o arquivo "agroconnect.db" no celular
  dbInstance = await SQLite.openDatabaseAsync('agroconnect.db');

  // cria as tabelas (so na primeira vez - depois disso nao faz nada, ja existem)
  await dbInstance.execAsync(CREATE_TABLES_SQL);

  return dbInstance;
}*/