import dotenv from 'dotenv'
import { createConnection, query } from '../config/database.js'
import { hashPassword } from '../utils/password.js'

dotenv.config()

const run = async () => {
  try {
    await createConnection()

    const existing = await query(
      "SELECT id, email FROM users WHERE role = 'super_admin' LIMIT 1",
    )

    if (existing.length > 0) {
      console.log('Super admin already exists:', existing[0].email)
      process.exit(0)
    }

    const firstName = process.env.SUPER_ADMIN_FIRST_NAME || 'Super'
    const lastName = process.env.SUPER_ADMIN_LAST_NAME || 'Admin'
    const email = process.env.SUPER_ADMIN_EMAIL || 'superadmin@example.com'
    const plainPassword = process.env.SUPER_ADMIN_PASSWORD || 'ChangeMe123'

    const password = await hashPassword(plainPassword)

    const result = await query(
      `INSERT INTO users (first_name, last_name, email, password, role)
       VALUES (?, ?, ?, ?, 'super_admin')`,
      [firstName, lastName, email, password],
    )

    console.log('Super admin created with ID:', result.insertId)
    console.log('Email:', email)
    if (!process.env.SUPER_ADMIN_PASSWORD) {
      console.log(
        'Temporary password (set SUPER_ADMIN_PASSWORD in .env to override):',
        plainPassword,
      )
    }

    process.exit(0)
  } catch (error) {
    console.error('Failed to create super admin:', error)
    process.exit(1)
  }
}

run()
