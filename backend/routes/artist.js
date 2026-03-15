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
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router.use(authenticate, authorize('super_admin', 'artist'));

router.get('/', listArtists);
router.post('/', createArtist);
router.get('/:id', getArtistById);
router.put('/:id', updateArtist);
router.delete('/:id', deleteArtist);

router.get('/:id/songs', listArtistSongs);

router.post('/import/csv', upload.single('file'), importArtistsFromCsv);
router.get('/export/csv', exportArtistsToCsv);

export default router;

