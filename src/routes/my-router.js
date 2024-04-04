/**
 * My routes.
 *
 * @author Anja Willsund
 * @version 1.0.0
 */

import express from 'express'
import { authenticateToken } from '../utils/authentication.js'
import { PuzzleController } from '../controllers/puzzle-controller.js'

export const router = express.Router()

const puzzleController = new PuzzleController()

router.route('/puzzles')
  .post(authenticateToken,
    (req, res, next) => puzzleController.addPuzzle(req, res, next))
  .get(authenticateToken,
    (req, res, next) => puzzleController.getAllPuzzles(req, res, next))
// router.post('/create', controller.createPost)
// router.get('/get-groups', controller.authenticateToken, controller.getUserGroups)
// router.post('/add-group', controller.authenticateToken, controller.addGroup)
// router.get('/logout', controller.authenticateToken, controller.logout)
// router.get('/delete-user', controller.authenticateToken, controller.deleteUser, controller.logout)
