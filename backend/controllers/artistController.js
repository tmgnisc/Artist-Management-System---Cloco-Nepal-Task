import { query } from '../config/database.js';
import { AppError, asyncHandler } from '../utils/errors.js';
import { sendSuccess } from '../utils/response.js';
import { format } from '@fast-csv/format';

//list artists with pagination and search by name
export const listArtists = asyncHandler(async (req, res) => {
  let page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';

  if (page < 1) page = 1;
  if (limit < 1) limit = 1;
  if (limit > 100) limit = 100;

  const offset = (page - 1) * limit;

  let whereClause = '1=1';
  const queryParams = [];

  if (search) {
    whereClause += ` AND name LIKE ?`;
    const searchPattern = `%${search}%`;
    queryParams.push(searchPattern);
  }

  const countResult = await query(
    `SELECT COUNT(*) as total FROM artists WHERE ${whereClause}`,
    queryParams
  );
  const total = countResult[0].total;

  const artists = await query(
    `SELECT id, name, dob, gender, address, first_release_year, no_of_albums_released, created_at, updated_at
     FROM artists
     WHERE ${whereClause}
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    [...queryParams, limit, offset]
  );

  const totalPages = Math.ceil(total / limit);

  sendSuccess(
    res,
    {
      artists,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    },
    'Artists retrieved successfully'
  );
});

//create artist
export const createArtist = asyncHandler(async (req, res) => {
  const {
    name,
    dob,
    gender,
    address,
    first_release_year,
    no_of_albums_released,
  } = req.body;

  const result = await query(
    `INSERT INTO artists (name, dob, gender, address, first_release_year, no_of_albums_released)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      name,
      dob || null,
      gender || null,
      address || null,
      first_release_year || null,
      no_of_albums_released || 0,
    ]
  );

  const artistId = result.insertId;

  const artists = await query(
    `SELECT id, name, dob, gender, address, first_release_year, no_of_albums_released, created_at, updated_at
     FROM artists WHERE id = ?`,
    [artistId]
  );

  sendSuccess(res, { artist: artists[0] }, 'Artist created successfully', 201);
});

//get artist by id
export const getArtistById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const artists = await query(
    `SELECT id, name, dob, gender, address, first_release_year, no_of_albums_released, created_at, updated_at
     FROM artists WHERE id = ?`,
    [id]
  );

  if (artists.length === 0) {
    throw new AppError('Artist not found', 404);
  }

  sendSuccess(res, { artist: artists[0] }, 'Artist retrieved successfully');
});

//update artist
export const updateArtist = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    name,
    dob,
    gender,
    address,
    first_release_year,
    no_of_albums_released,
  } = req.body;

  const existingArtists = await query(
    'SELECT id FROM artists WHERE id = ?',
    [id]
  );

  if (existingArtists.length === 0) {
    throw new AppError('Artist not found', 404);
  }

  const updates = [];
  const values = [];

  if (name !== undefined) {
    updates.push('name = ?');
    values.push(name);
  }
  if (dob !== undefined) {
    updates.push('dob = ?');
    values.push(dob || null);
  }
  if (gender !== undefined) {
    updates.push('gender = ?');
    values.push(gender || null);
  }
  if (address !== undefined) {
    updates.push('address = ?');
    values.push(address || null);
  }
  if (first_release_year !== undefined) {
    updates.push('first_release_year = ?');
    values.push(first_release_year || null);
  }
  if (no_of_albums_released !== undefined) {
    updates.push('no_of_albums_released = ?');
    values.push(no_of_albums_released || 0);
  }

  if (updates.length === 0) {
    throw new AppError('No fields to update', 400);
  }

  values.push(id);

  await query(
    `UPDATE artists SET ${updates.join(', ')} WHERE id = ?`,
    values
  );

  const artists = await query(
    `SELECT id, name, dob, gender, address, first_release_year, no_of_albums_released, created_at, updated_at
     FROM artists WHERE id = ?`,
    [id]
  );

  sendSuccess(res, { artist: artists[0] }, 'Artist updated successfully');
});

//delete artist (CASCADE will remove songs)
export const deleteArtist = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const artists = await query(
    'SELECT id FROM artists WHERE id = ?',
    [id]
  );

  if (artists.length === 0) {
    throw new AppError('Artist not found', 404);
  }

  await query('DELETE FROM artists WHERE id = ?', [id]);

  sendSuccess(res, null, 'Artist deleted successfully');
});

//list songs for an artist
export const listArtistSongs = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const artists = await query(
    'SELECT id, name FROM artists WHERE id = ?',
    [id]
  );

  if (artists.length === 0) {
    throw new AppError('Artist not found', 404);
  }

  const songs = await query(
    `SELECT id, artist_id, title, album_name, genre, created_at, updated_at
     FROM songs WHERE artist_id = ?
     ORDER BY created_at DESC`,
    [id]
  );

  sendSuccess(res, { artist: artists[0], songs }, 'Songs retrieved successfully');
});

//CSV import for artists
export const importArtistsFromCsv = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError('CSV file is required', 400);
  }

  const fileBuffer = req.file.buffer.toString('utf-8');

  const rows = fileBuffer.split('\n').filter((line) => line.trim().length > 0);
  if (rows.length <= 1) {
    throw new AppError('CSV file is empty or missing data rows', 400);
  }

  const header = rows[0].trim();
  const expectedHeader = 'name,dob,gender,address,first_release_year,no_of_albums_released';
  if (header.replace(/\s/g, '') !== expectedHeader.replace(/\s/g, '')) {
    throw new AppError(`Invalid CSV header. Expected: ${expectedHeader}`, 400);
  }

  const dataRows = rows.slice(1);
  const values = [];

  for (const line of dataRows) {
    const cols = line.split(',');
    if (cols.length < 1 || !cols[0].trim()) {
      continue;
    }

    const [
      name,
      dob,
      gender,
      address,
      first_release_year,
      no_of_albums_released,
    ] = cols.map((c) => c.trim());

    values.push([
      name,
      dob || null,
      gender || null,
      address || null,
      first_release_year ? parseInt(first_release_year, 10) : null,
      no_of_albums_released
        ? parseInt(no_of_albums_released, 10)
        : 0,
    ]);
  }

  if (values.length === 0) {
    throw new AppError('No valid artist rows found in CSV', 400);
  }

  await query(
    `INSERT INTO artists (name, dob, gender, address, first_release_year, no_of_albums_released)
     VALUES ?`,
    [values]
  );

  sendSuccess(res, { imported: values.length }, 'Artists imported successfully');
});

//CSV export for artists
export const exportArtistsToCsv = asyncHandler(async (req, res) => {
  const artists = await query(
    `SELECT name, dob, gender, address, first_release_year, no_of_albums_released
     FROM artists
     ORDER BY created_at DESC`
  );

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader(
    'Content-Disposition',
    'attachment; filename="artists.csv"'
  );

  const csvStream = format({ headers: true });
  csvStream.pipe(res);

  artists.forEach((artist) => {
    csvStream.write(artist);
  });

  csvStream.end();
});

