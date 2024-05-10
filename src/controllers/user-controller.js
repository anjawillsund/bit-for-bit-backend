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

        // Generate a new JWT token with user data, using the JWT secret and setting it to expire in 1 hour
        token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' })
        res.status(200).json(token)
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
      if (req.body.password !== req.body.repeatPassword) {
        throw new Error('Lösenorden stämmer inte överens. Vänligen försök igen.')
      }
      req.body.username = req.body.username.trim().toLowerCase()
      const user = new User({
        username: req.body.username,
        password: req.body.password
      })

      await user.save()
      console.log('User account created successfully.')
      res.status(201).json({ message: 'Ditt konto har skapats! Logga in för att använda applikationen.' })
    } catch (error) {
      if (error.message.includes('E11000 duplicate key error collection')) {
        error.message = 'Användarnamnet är inte tillgängligt.'
      }
      console.log(error)
      error.status = 400
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
      res.status(200)
      console.log('User logged out successfully.')
    })
  }
}
