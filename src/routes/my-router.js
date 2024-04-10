/**
 * My routes.
 *
 * @author Anja Willsund
 * @version 1.0.0
 */

import express from 'express'
import multer from 'multer'
import { authenticateToken } from '../utils/authentication.js'
import { PuzzleController } from '../controllers/puzzle-controller.js'

export const router = express.Router()

const puzzleController = new PuzzleController()
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
})
router.param('id', (req, res, next, id) => puzzleController.loadPuzzle(req, res, next, id))
router.route('/puzzles')
  .post(authenticateToken,
    upload.single('image'),
    (req, res, next) => puzzleController.addPuzzle(req, res, next))
  .get(authenticateToken,
    (req, res, next) => puzzleController.getAllPuzzles(req, res, next))

router.route('/puzzles/:id')
  .get(authenticateToken,
    (req, res, next) => puzzleController.getPuzzle(req, res, next))
  // .put(authenticateToken,
  //   upload.single('image'),
  //   (req, res, next) => puzzleController.updatePuzzle(req, res, next))
  // .delete(authenticateToken,
  //   (req, res, next) => puzzleController.deletePuzzle(req, res, next))
// router.post('/create', controller.createPost)
// router.get('/get-groups', controller.authenticateToken, controller.getUserGroups)
// router.post('/add-group', controller.authenticateToken, controller.addGroup)
// router.get('/logout', controller.authenticateToken, controller.logout)
// router.get('/delete-user', controller.authenticateToken, controller.deleteUser, controller.logout)
