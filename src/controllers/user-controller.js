/**
 * Module for the UserController.
 *
 * @author Anja Willsund
 * @version 1.0.0
 */

import { User } from '../models/user.js'
import jwt from 'jsonwebtoken'

/**
 * Encapsulates a controller.
 */
export class UserController {
  /**
   * Tries to log in to user account.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async loginPost (req, res, next) {
    try {
      req.body.username = req.body.username.trim().toLowerCase()
      let token
      // Checks if submitted username and password matches any saved data in database.
      if (await User.authenticate(req.body.username, req.body.password)) {
        const user = await User.findOne({ username: req.body.username })

        const payload = {
          id: user.id.toString(),
          username: req.body.username
        }

        // TODO: Är detta rätt hantering av JWT?
        // Generate a new JWT token with user data, using the JWT secret and setting it to expire in 1 hour
        token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' })
        res.status(200).json({ message: `Welcome ${req.body.username}! You are now logged in.`, token })
      }
      // Regenerates a new session.
      req.session.regenerate(() => {
        // Sets session username to the submitted username.
        req.session.username = req.body.username
        // Sets session token to the generated token.
        req.session.token = token
      })
      console.log('User logged in successfully.')
    } catch (error) {
      console.log('Error: ' + error.message)
      error.status = 401
      next(error)
    }
  }

  /**
   * Creates a new user account.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async createPost (req, res, next) {
    try {
      req.body.username = req.body.username.trim().toLowerCase()
      const user = new User({
        username: req.body.username,
        password: req.body.password
      })

      if (await user.save()) {
        console.log('User account created successfully.')
        res.status(201).json({ message: 'Your account was created successfully. Please log in.' })
      } else {
        throw new Error('An unknown error occured. Please try again.')
      }
    } catch (error) {
      if (error.message.includes('E11000 duplicate key error collection')) {
        error.message = 'The username is not available.'
      } else if (error.message.includes('The username must not contain more than 50 characters.')) {
        error.message = 'The username must not contain more than 50 characters.'
      } else if (error.message.includes('The password must contain at least 10 characters.')) {
        error.message = 'The password must contain at least 10 characters.'
      } else if (error.message.includes('The password must not contain more than 2000 characters.')) {
        error.message = 'The password must not contain more than 2000 characters.'
      }
      console.log(error)
      error.status = 400
      next(error)
    }
  }

  /**
   * Get a copy of the fetched array to the database.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async deleteUser (req, res, next) {
    const token = req.headers.authorization?.split(' ')[1]

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET)

    // TODO: Se över denna metod och ta bort användaren från vänners vänlistor vid borttagning.

    try {
      // Delete the user from the database.
      const user = await User.deleteOne({ _id: decodedToken.id })
      // If the user was deleted successfully.
      if (user.deletedCount === 1) {
        console.log('Account was deleted successfully.')
        req.message = 'Account was deleted successfully.'
      } else {
        throw new Error('An unknown error occured. Please try again.')
      }
      // Go to logout function.
      next()
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  /**
   * Logs out the user.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  async logout (req, res) {
    // Destroys the session when logging out.
    req.session.destroy(() => {
      if (req.message) {
        res.status(200).json({ message: req.message + ' You are now logged out.' })
      } else {
        res.status(200).json({ message: 'You are now logged out.' })
        console.log('User logged out successfully.')
      }
    })
  }
}
