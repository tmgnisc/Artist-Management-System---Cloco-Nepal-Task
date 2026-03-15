import { getConnection } from './database.js';

export const initializeTables = async () => {
  const connection = await getConnection();
  
  try {
    // Create User table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        dob DATE,
        gender ENUM('m', 'f', 'o') NOT NULL,
        address TEXT,
        role ENUM('super_admin', 'artist_manager', 'artist') NOT NULL DEFAULT 'artist',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log(' Users table initialized');

    // Create Artist table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS artists (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        dob DATE,
        gender ENUM('m', 'f', 'o'),
        address TEXT,
        first_release_year INT,
        no_of_albums_released INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_name (name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log(' Artists table initialized');

    // Create Song table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS songs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        artist_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        album_name VARCHAR(255),
        genre ENUM('rnb', 'country', 'classic', 'rock', 'jazz') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE ON UPDATE CASCADE,
        INDEX idx_artist_id (artist_id),
        INDEX idx_genre (genre),
        INDEX idx_title (title)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log(' Songs table initialized');

    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database tables:', error);
    throw error;
  }
};
