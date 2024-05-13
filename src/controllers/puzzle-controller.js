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
import fs from 'fs'

// import nullPuzzle from '../assets/images/null-puzzle.jpg'

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
      const puzzleInput = await this.#updatePuzzleInput(req)

      const puzzle = new Puzzle({
        title: puzzleInput.title,
        // Adds the piecesNumber, sizeHeight, sizeWidth, manufacturer, location and missingPiecesNumber property only if it is present in the request body
        ...(puzzleInput.piecesNumber && { piecesNumber: puzzleInput.piecesNumber }),
        ...(puzzleInput.sizeHeight && { sizeHeight: puzzleInput.sizeHeight }),
        ...(puzzleInput.sizeWidth && { sizeWidth: puzzleInput.sizeWidth }),
        ...(puzzleInput.manufacturer && { manufacturer: puzzleInput.manufacturer }),
        lastPlayed: puzzleInput.lastPlayed,
        ...(puzzleInput.location && { location: puzzleInput.location }),
        complete: puzzleInput.complete,
        ...(puzzleInput.missingPiecesNumber && { missingPiecesNumber: puzzleInput.missingPiecesNumber }),
        privateNote: puzzleInput.privateNote,
        sharedNote: puzzleInput.sharedNote,
        isLentOut: puzzleInput.isLentOut,
        // ...(puzzleInput.lentOutTo && { lentOutTo: puzzleInput.lentOutTo }),
        ...(puzzleInput.lentOutToString && { lentOutToString: puzzleInput.lentOutToString }),
        isPrivate: puzzleInput.isPrivate,
        image: puzzleInput.imageBinary,
        owner: req.user.id
      })

      await puzzle.save()
      res.status(201).json({ message: 'Puzzle added successfully.' })
    } catch (error) {
      this.#handleAddOrUpdateError(error, next)
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
      const responseData = await this.#transformPuzzleData(puzzle)
      console.log(responseData)
      res.status(200).json(responseData)
    } catch (error) {
      next(error)
    }
  }

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
      const puzzleInput = await this.#updatePuzzleInput(req)

      const puzzle = req.puzzle
      puzzle.title = puzzleInput.title || puzzle.title
      puzzle.piecesNumber = puzzleInput.piecesNumber || ''
      puzzle.sizeHeight = puzzleInput.sizeHeight || ''
      puzzle.sizeWidth = puzzleInput.sizeWidth || ''
      puzzle.manufacturer = puzzleInput.manufacturer || ''
      puzzle.lastPlayed = puzzleInput.lastPlayed || ''
      puzzle.location = puzzleInput.location || ''
      puzzle.complete = puzzleInput.complete
      puzzle.missingPiecesNumber = puzzleInput.missingPiecesNumber || null
      puzzle.privateNote = puzzleInput.privateNote || ''
      puzzle.sharedNote = puzzleInput.sharedNote || ''
      puzzle.isPrivate = puzzleInput.isPrivate
      puzzle.isLentOut = puzzleInput.isLentOut
      // puzzle.lentOutTo = puzzleInput.lentOutTo || puzzle.lentOutTo
      !puzzle.isLentOut ? puzzle.lentOutToString = null : puzzle.lentOutToString = puzzleInput.lentOutToString || puzzle.lentOutToString
      puzzle.image = puzzleInput.imageBinary || puzzle.image

      await puzzle.save()
      res.status(200).json({ message: 'Puzzle updated successfully.' })
    } catch (error) {
      this.#handleAddOrUpdateError(error, next)
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
   * Transforms the data of a puzzle to a format that can be sent as a response.
   *
   * @param {object} puzzle - The puzzle to transform.
   * @returns {object} The transformed puzzle data.
   */
  async #transformPuzzleData (puzzle) {
    let responseData = {}
    let imageBase64
    if (puzzle.image !== null) {
      imageBase64 = puzzle.image.toString('base64')
    } else {
      const nullImage = './src/assets/images/null-puzzle.png'
      imageBase64 = await this.#convertImageToBase64(nullImage)
    }
    const { _id, image, createdAt, updatedAt, __v, ...puzzleData } = puzzle.toJSON()
    responseData = {
      ...puzzleData,
      id: _id.toString(),
      imageUrl: `data:image/png;base64,${imageBase64}`
    }
    if (puzzle.privateNote) {
      responseData.privateNote = this.#decryptPrivateNote(puzzle.privateNote)
    }
    if (puzzle.lastPlayed) {
      const lastPlayed = new Date(puzzle.lastPlayed)
      responseData.lastPlayed = lastPlayed.toISOString().slice(0, 10)
    }
    return responseData
  }

  /**
   * Decrypts a private note.
   *
   * @param {string} privateNote - The private note to decrypt.
   * @returns {string} The decrypted private note.
   */
  #decryptPrivateNote (privateNote) {
    const { iv, encryptedData } = JSON.parse(privateNote)
    const key = Buffer.from(process.env.SECRET_ENCRYPTION_KEY, 'base64')
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.from(iv, 'hex'))
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  }

  /**
   * Converts an image to a base64 string.
   *
   * @param {string} filePath - The path to the image to convert.
   * @returns {string} The image as a base64 string.
   */
  async #convertImageToBase64 (filePath) {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, (error, data) => {
        if (error) {
          reject(error)
        } else {
          const base64String = Buffer.from(data).toString('base64')
          resolve(base64String)
        }
      })
    })
  }

  /**
   * Handles errors when adding or updating a puzzle.
   *
   * @param {Error} error - The error to handle.
   * @param {Function} next - Express next middleware function.
   */
  #handleAddOrUpdateError (error, next) {
    console.log('Error: ' + error.message)
    if (error.message.includes('Puzzle validation failed') || error.message.includes('inte ett giltigt nummer') || error.message.includes('Namnet på den som har lånat pusslet måste anges') || (error.message.includes('Pusslets titel måste anges.'))) {
      const errors = []
      if (error.message.includes('Puzzle validation failed') && (!error.message.includes('Invalid Date'))) {
        for (const key in error.errors) {
          if (Object.prototype.hasOwnProperty.call(error.errors, key)) {
            errors.push(error.errors[key].message)
          }
        }
      } else if (error.message.includes('Invalid Date')) {
        errors.push('Datumet är ogiltigt.')
      } else {
        errors.push(error.message)
      }
      error.status = 400
      error.message = errors
      next(error)
    } else if (error.message === 'offset is out of bounds') {
      error.message = 'Bilden är för stor, max 10 MB.'
      error.status = 400
      next(error)
    } else {
      console.log('Error: ' + error.message)
      next(error)
    }
  }

  /**
   * Updates the puzzle input.
   *
   * @param {object} req - Express request object.
   * @returns {object} The updated puzzle input.
   * @throws {Error} If the puzzle is lent out and the name of the person who borrowed the puzzle is not specified.
   */
  async #updatePuzzleInput (req) {
    const puzzle = req.body
    // Convert the image to a PNG
    puzzle.imageBinary = await this.#convertImageToPng(req)

    // Check if the values of the number fields are numbers
    this.#isNumberFieldNumber(puzzle)

    if (puzzle.lastPlayed) {
      puzzle.lastPlayed = this.#adjustTimeZone(puzzle.lastPlayed)
    }
    if (!puzzle.piecesNumber) {
      puzzle.complete = true
      puzzle.missingPiecesNumber = ''
    }
    if (puzzle.complete === 'true') {
      puzzle.missingPiecesNumber = ''
    }
    if (puzzle.isLentOut === 'false') {
      puzzle.lentOutToString = null
    }
    if (puzzle.isLentOut === 'true' && !puzzle.lentOutToString) {
      throw new Error('Namnet på den som har lånat pusslet måste anges.')
    }
    if (!puzzle.title) {
      throw new Error('Pusslets titel måste anges.')
    }
    return puzzle
  }

  /**
   * Checks if the values of the number fields are numbers.
   *
   * @param {object} puzzle - The puzzle to check.
   * @throws {Error} If the values are not numbers.
   */
  #isNumberFieldNumber (puzzle) {
    const fieldsToCheck = {
      piecesNumber: 'Antal bitar',
      sizeHeight: 'Höjd',
      sizeWidth: 'Bredd',
      missingPiecesNumber: 'Antal saknade bitar'
    }

    // For each key-value pair in the puzzle object
    for (const [key, value] of Object.entries(puzzle)) {
      // Check if the key is present in the fieldsToCheck object
      if (Object.prototype.hasOwnProperty.call(fieldsToCheck, key)) {
        if (isNaN(value)) {
          // If the value is not a number, throw an error
          throw new Error(`Det angivna värdet för "${fieldsToCheck[key]}" är inte ett giltigt nummer.`)
        }
      }
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
    // Add two hours to adjust the time zone to UTC+2 if it's daylight saving time
    newDate.setHours(newDate.getHours() + 2)
    return newDate
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
    // console.log(await imageBinary)
    return imageBinary
  }
}
