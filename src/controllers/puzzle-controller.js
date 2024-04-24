/**
 * Module for the PuzzleController.
 *
 * @author Anja Willsund
 * @version 1.0.0
 */

import crypto from 'crypto'
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
      const imageBinary = await this.#convertImageToPng(req)
      const puzzle = new Puzzle({
        title: req.body.title,
        ...(req.body.piecesNumber && { piecesNumber: req.body.piecesNumber }),
        ...(req.body.sizeHeight && { sizeHeight: req.body.sizeHeight }),
        ...(req.body.sizeWidth && { sizeWidth: req.body.sizeWidth }),
        ...(req.body.manufacturer && { manufacturer: req.body.manufacturer }),
        lastPlayed: req.body.lastPlayed,
        ...(req.body.location && { location: req.body.location }),
        complete: req.body.complete,
        ...(req.body.missingPiecesNumber && { missingPiecesNumber: req.body.missingPiecesNumber }),
        privateNote: req.body.privateNote,
        sharedNote: req.body.sharedNote,
        isLentOut: req.body.isLentOut,
        // ...(req.body.lentOutTo && { lentOutTo: req.body.lentOutTo }),
        ...(req.body.lentOutToString && { lentOutToString: req.body.lentOutToString }),
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

  // TODO: Hur hantera pussel som saknar bild?
  /**
   * Gets a specific puzzle by id.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async getPuzzle (req, res, next) {
    try {
      const puzzle = req.puzzle
      const responseData = this.#transformPuzzleData(puzzle)
      res.status(200).json(responseData)
    } catch (error) {
      next(error)
    }
  }

  /**
   * Transforms the data of a puzzle to a format that can be sent as a response.
   *
   * @param {object} puzzle - The puzzle to transform.
   * @returns {object} The transformed puzzle data.
   */
  #transformPuzzleData (puzzle) {
    let responseData
    if (puzzle.image !== null) {
      const imageBase64 = puzzle.image.toString('base64')
      const { _id, image, createdAt, updatedAt, __v, ...puzzleData } = puzzle.toJSON()
      responseData = {
        ...puzzleData,
        id: _id,
        imageUrl: `data:image/png;base64,${imageBase64}`
      }
    } else {
      const { _id, image, createdAt, updatedAt, __v, ...puzzleData } = puzzle.toJSON()
      responseData = {
        ...puzzleData,
        id: _id
      }
    }
    if (puzzle.privateNote) {
      const { iv, encryptedData } = JSON.parse(puzzle.privateNote)
      const key = Buffer.from(process.env.SECRET_ENCRYPTION_KEY, 'base64')
      const decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.from(iv, 'hex'))
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8')
      decrypted += decipher.final('utf8')
      responseData.privateNote = decrypted
    }
    if (puzzle.lastPlayed) {
      const lastPlayed = new Date(puzzle.lastPlayed)
      responseData.lastPlayed = lastPlayed.toISOString().slice(0, 10)
    }
    return responseData
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
      const puzzles = await Puzzle.find({ owner: req.user.id }, '_id -owner -createdAt -updatedAt -__v')
      if (!puzzles) {
        next(createError(404, 'No puzzles found'))
        return
      }
      const updatedPuzzles = puzzles.map(puzzle => {
        if (puzzle.image === null) {
          return { ...puzzle.toObject() }
        }
        const imageBase64 = puzzle.image.toString('base64')
        return { ...puzzle.toObject(), imageUrl: `data:image/png;base64,${imageBase64}` }
      })
      res.status(200).json(updatedPuzzles)
    } catch (error) {
      next(error)
    }
  }

  /**
   * Updates a specific puzzle by id.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async updatePuzzle (req, res, next) {
    try {
      console.log(req.body.complete)
      console.log(req.body.missingPiecesNumber)
      if (req.body.lastPlayed) {
        req.body.lastPlayed = this.#adjustTimeZone(req.body.lastPlayed)
      }
      if (!req.body.piecesNumber) {
        req.body.complete = true
        req.body.missingPiecesNumber = ''
      }
      if (req.body.complete === true) {
        req.body.missingPiecesNumber = ''
      }
      const imageBinary = await this.#convertImageToPng(req)
      const puzzle = req.puzzle
      puzzle.title = req.body.title || puzzle.title
      req.body.piecesNumber ? puzzle.piecesNumber = req.body.piecesNumber : puzzle.piecesNumber = ''
      puzzle.sizeHeight = req.body.sizeHeight || puzzle.sizeHeight
      puzzle.sizeWidth = req.body.sizeWidth || puzzle.sizeWidth
      puzzle.manufacturer = req.body.manufacturer || puzzle.manufacturer
      puzzle.lastPlayed = req.body.lastPlayed || ''
      req.body.location ? puzzle.location = req.body.location : puzzle.location = ' '
      puzzle.complete = req.body.complete
      req.body.missingPiecesNumber ? puzzle.missingPiecesNumber = req.body.missingPiecesNumber : puzzle.missingPiecesNumber = ''
      req.body.privateNote ? puzzle.privateNote = req.body.privateNote : puzzle.privateNote = ''
      req.body.sharedNote ? puzzle.sharedNote = req.body.sharedNote : puzzle.sharedNote = ''
      puzzle.isPrivate = req.body.isPrivate || puzzle.isPrivate
      puzzle.isLentOut = req.body.isLentOut || puzzle.isLentOut
      // puzzle.lentOutTo = req.body.lentOutTo || puzzle.lentOutTo
      !puzzle.isLentOut ? puzzle.lentOutToString = null : puzzle.lentOutToString = req.body.lentOutToString || puzzle.lentOutToString
      puzzle.image = imageBinary || puzzle.image
      puzzle.save()
      res.status(200).json({ message: 'Puzzle updated successfully.' })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Adjusts the time zone of a date.
   *
   * @param {string} date - The date to adjust.
   * @returns {Date} The adjusted date.
   */
  #adjustTimeZone (date) {
    const newDate = new Date(date)
    newDate.setHours(newDate.getHours() + 1)
    return newDate
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

  /**
   * Converts an image to a PNG.
   *
   * @param {object} req - Express request object.
   * @returns {Buffer} The image as a PNG.
   */
  async #convertImageToPng (req) {
    let imageBinary = null
    if (req.file) {
      const pngBuffer = sharp(req.file.buffer)
        .resize({ width: 500 })
        .png()
        .toBuffer()
      imageBinary = pngBuffer
    }
    return imageBinary
  }
}
