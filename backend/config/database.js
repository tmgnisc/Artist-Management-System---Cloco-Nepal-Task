import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
import { initializeTables } from './initDatabase.js'

dotenv.config()

let pool = null
let tablesInitialized = false

export const createConnection = async () => {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'artistmgmt',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    })

    console.log('Database connection pool created')

    // Initialize tables if not already done
    if (!tablesInitialized) {
      try {
        await initializeTables()
        tablesInitialized = true
      } catch (error) {
        console.error('Failed to initialize database tables:', error)
        throw error
      }
    }
  }
  return pool
}

export const getConnection = async () => {
  if (!pool) {
    await createConnection()
  }
  return pool
}

export const query = async (sql, params = []) => {
  const connection = await getConnection()
  try {
    const [results] = await connection.execute(sql, params)
    return results
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}
