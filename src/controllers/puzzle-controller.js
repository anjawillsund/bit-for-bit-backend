/**
 * Module for the PuzzleController.
 *
 * @author Anja Willsund
 * @version 1.0.0
 */

import createError from 'http-errors'
import sharp from 'sharp'
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
      let imageBinary = null
      if (req.file) {
        console.log(req.file.size)
        console.log(req.file.buffer.length)
        const pngBuffer = await sharp(req.file.buffer)
          .resize({ width: 1600 })
          .png()
          .toBuffer()
        imageBinary = pngBuffer
        console.log(pngBuffer.length)
      }
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
        isPrivate: req.body.isPrivate,
        image: imageBinary,
        owner: req.user.id
      })
      const response = await puzzle.save()
      if (!response.ok) {
        console.log(response)
      }
      res.status(201).json({ id: response.id, message: 'Puzzle added successfully.' })
    } catch (error) {
      // TODO: Titta på denna felhantering
      if (error.message === 'offset is out of bounds') {
        error.message = 'Image is too large. Maximum size is 10 MB.'
      }
      console.log('Error: ' + error.message)
      error.status = 400
      next(error)
    }
  }

  /**
   * Gets a specific puzzle.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   * @param {string} id - The id of the puzzle to load.
   */
  async loadPuzzle (req, res, next, id) {
    try {
      // This error is added to handle the case when the id is not a valid ObjectId, which must be a string consisting of exactly 24 hexadecimal characters.
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        next(createError(400, 'Invalid id'))
        return
      }
      const puzzle = await Puzzle.findOne({ _id: id })
      if (!puzzle) {
        next(createError(404, 'Puzzle not found'))
        return
      }
      req.puzzle = puzzle

      next()
    } catch (error) {
      next(error)
    }
  }

  /**
   * Gets a specific puzzle by id.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async getPuzzle (req, res, next) {
    try {
      const puzzle = await Puzzle.findById(req.params.id)
      const imageBase64 = puzzle.image.toString('base64')
      // const imageBinary = puzzle.image
      // if (!imageBinary) {
      //   return res.status(404).send('Image not found.');
      // }
      const responseData = {
        ...puzzle.toJSON(), // Assuming puzzle is a Mongoose document; adjust as necessary
        imageUrl: `data:image/png;base64,${imageBase64}` // Prepend the data URI scheme
      }
      // res.type('png').send(puzzle)
      // res.status(200).type('png').json({ puzzle })
      res.json(responseData.imageUrl)
    } catch (error) {
      next(error)
    }
  }

  // TODO: Kolla att denna fungerar i React, blir för stor response i Postman
  /**
   * Gets all puzzles for the authenticated user.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async getAllPuzzles (req, res, next) {
    try {
      const puzzles = await Puzzle.find({ owner: req.user.id })
      res.status(200).json(puzzles)
    } catch (error) {
      next(error)
    }
  }

  /**
   * Deletes a specific puzzle by id.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async deletePuzzle (req, res, next) {
    try {
      console.log(req)
      const puzzle = await Puzzle.deleteOne({ _id: req.puzzle.id.toString() })
      if (puzzle.deletedCount === 1) {
        console.log('Puzzle was deleted successfully.')
        req.message = 'Puzzle was deleted successfully.'
      } else {
        throw new Error('An unknown error occured. Please try again.')
      }
      res.status(204).send()
    } catch (error) {
      next(error)
    }
  }
}
