/**
 * Module for the PuzzleController.
 *
 * @author Anja Willsund
 * @version 1.0.0
 */

import { Puzzle } from '../models/puzzle.js'

/**
 * Encapsulates a controller.
 */
export class PuzzleController {
  /**
   * Adds a puzzle to the database.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async addPuzzle (req, res, next) {
    try {
      const puzzle = new Puzzle({
        title: req.body.title,
        piecesNumber: req.body.piecesNumber,
        size: req.body.size,
        manufacturer: req.body.manufacturer,
        lastPlayed: req.body.lastPlayed,
        location: req.body.location,
        complete: req.body.complete,
        missingPiecesNumber: req.body.missingPiecesNumber,
        privateNote: req.body.privateNote,
        sharedNote: req.body.sharedNote,
        isPrivate: req.body.isPrivate
      })
      const response = await puzzle.save()
      if (!response.ok) {
        console.log(response)
      }
      res.status(201).json({ message: 'Puzzle added successfully.' })
    } catch (error) {
      console.log('Error: ' + error.message)
      error.status = 400
      next(error)
    }
  }
}
