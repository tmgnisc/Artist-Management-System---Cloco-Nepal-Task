import { query } from '../config/database.js';
import { AppError, asyncHandler } from '../utils/errors.js';
import { sendSuccess } from '../utils/response.js';

const VALID_GENRES = ['rnb', 'country', 'classic', 'rock', 'jazz'];

//create song under an artist
export const createSong = asyncHandler(async (req, res) => {
  const { artistId } = req.params;
  const { title, album_name, genre } = req.body;

  // verify artist exists
  const artists = await query('SELECT id, name FROM artists WHERE id = ?', [
    artistId,
  ]);
  if (artists.length === 0) {
    throw new AppError('Artist not found', 404);
  }

  // insert song
  const result = await query(
    `INSERT INTO songs (artist_id, title, album_name, genre)
     VALUES (?, ?, ?, ?)`,
    [artistId, title, album_name || null, genre]
  );

  const songId = result.insertId;

  const songs = await query(
    `SELECT id, artist_id, title, album_name, genre, created_at, updated_at
     FROM songs WHERE id = ?`,
    [songId]
  );

  sendSuccess(
    res,
    { artist: artists[0], song: songs[0] },
    'Song created successfully',
    201
  );
});

//get single song by id
export const getSongById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const songs = await query(
    `SELECT s.id, s.artist_id, s.title, s.album_name, s.genre, s.created_at, s.updated_at,
            a.name as artist_name
     FROM songs s
     JOIN artists a ON s.artist_id = a.id
     WHERE s.id = ?`,
    [id]
  );

  if (songs.length === 0) {
    throw new AppError('Song not found', 404);
  }

  sendSuccess(res, { song: songs[0] }, 'Song retrieved successfully');
});

//update song
export const updateSong = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, album_name, genre } = req.body;

  const songs = await query('SELECT id FROM songs WHERE id = ?', [id]);
  if (songs.length === 0) {
    throw new AppError('Song not found', 404);
  }

  const updates = [];
  const values = [];

  if (title !== undefined) {
    updates.push('title = ?');
    values.push(title);
  }
  if (album_name !== undefined) {
    updates.push('album_name = ?');
    values.push(album_name || null);
  }
  if (genre !== undefined) {
    if (!VALID_GENRES.includes(genre)) {
      throw new AppError(
        'Invalid genre. Must be one of: rnb, country, classic, rock, jazz',
        400
      );
    }
    updates.push('genre = ?');
    values.push(genre);
  }

  if (updates.length === 0) {
    throw new AppError('No fields to update', 400);
  }

  values.push(id);

  await query(`UPDATE songs SET ${updates.join(', ')} WHERE id = ?`, values);

  const updatedSongs = await query(
    `SELECT s.id, s.artist_id, s.title, s.album_name, s.genre, s.created_at, s.updated_at,
            a.name as artist_name
     FROM songs s
     JOIN artists a ON s.artist_id = a.id
     WHERE s.id = ?`,
    [id]
  );

  sendSuccess(res, { song: updatedSongs[0] }, 'Song updated successfully');
});

//delete song
export const deleteSong = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const songs = await query('SELECT id FROM songs WHERE id = ?', [id]);
  if (songs.length === 0) {
    throw new AppError('Song not found', 404);
  }

  await query('DELETE FROM songs WHERE id = ?', [id]);

  sendSuccess(res, null, 'Song deleted successfully');
});

//admin view: list all songs with filters + pagination
export const listSongs = asyncHandler(async (req, res) => {
  let page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) || 10;
  const genre = req.query.genre || '';
  const artistId = req.query.artistId || '';
  const title = req.query.title || '';

  if (page < 1) page = 1;
  if (limit < 1) limit = 1;
  if (limit > 100) limit = 100;

  let whereClause = '1=1';
  const params = [];

  if (genre) {
    if (!VALID_GENRES.includes(genre)) {
      throw new AppError(
        'Invalid genre filter. Must be one of: rnb, country, classic, rock, jazz',
        400
      );
    }
    whereClause += ' AND s.genre = ?';
    params.push(genre);
  }

  if (artistId) {
    whereClause += ' AND s.artist_id = ?';
    params.push(artistId);
  }

  if (title) {
    whereClause += ' AND s.title LIKE ?';
    params.push(`%${title}%`);
  }

  const offset = (page - 1) * limit;

  const countRows = await query(
    `SELECT COUNT(*) as total
     FROM songs s
     JOIN artists a ON s.artist_id = a.id
     WHERE ${whereClause}`,
    params
  );
  const total = countRows[0].total;

  const songs = await query(
    `SELECT s.id, s.artist_id, s.title, s.album_name, s.genre, s.created_at, s.updated_at,
            a.name as artist_name
     FROM songs s
     JOIN artists a ON s.artist_id = a.id
     WHERE ${whereClause}
     ORDER BY s.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  const totalPages = Math.ceil(total / limit);

  sendSuccess(
    res,
    {
      songs,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    },
    'Songs retrieved successfully'
  );
});

