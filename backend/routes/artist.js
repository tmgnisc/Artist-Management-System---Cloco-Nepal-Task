import express from 'express';
import multer from 'multer';
import {
  listArtists,
  createArtist,
  getArtistById,
  updateArtist,
  deleteArtist,
  listArtistSongs,
  importArtistsFromCsv,
  exportArtistsToCsv,
} from '../controllers/artistController.js';
import { createSong } from '../controllers/songController.js';
import {
  validateCreateSong,
  validateCreateArtist,
  validateUpdateArtist,
} from '../middleware/validation.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router.use(authenticate, authorize('super_admin', 'artist_manager', 'artist'));

router.get('/', listArtists);
router.post('/', validateCreateArtist, createArtist);
router.get('/:id', getArtistById);
router.put('/:id', validateUpdateArtist, updateArtist);
router.delete('/:id', deleteArtist);

router.get('/:id/songs', listArtistSongs);
router.post('/:artistId/songs', validateCreateSong, createSong);

router.post('/import/csv', upload.single('file'), importArtistsFromCsv);
router.get('/export/csv', exportArtistsToCsv);

export default router;

