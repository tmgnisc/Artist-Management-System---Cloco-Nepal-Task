import express from 'express'
import {
  getSongById,
  updateSong,
  deleteSong,
  listSongs,
} from '../controllers/songController.js'
import { authenticate, authorize } from '../middleware/auth.js'
import {
  validateUpdateSong,
  validateListSongs,
} from '../middleware/validation.js'

const router = express.Router()

// admin view: super_admin and artist_manager
router.use(authenticate, authorize('super_admin', 'artist_manager'))

router.get('/', validateListSongs, listSongs)
router.get('/:id', getSongById)
router.put('/:id', validateUpdateSong, updateSong)
router.delete('/:id', deleteSong)

export default router
