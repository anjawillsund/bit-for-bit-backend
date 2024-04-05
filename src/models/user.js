/**
 * Mongoose model User.
 *
 * @author Anja Willsund
 * @version 1.0.0
 */

import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

// Create a user schema.
const schema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    minlength: 1,
    maxlength: [50, 'The username must not contain more than 50 characters.'],
    validate: {
      /**
       * Checks if the username only contains letters and numbers.
       *
       * @param {string} value - The username to validate.
       * @returns {boolean} True if the username only contains letters and numbers.
       */
      validator: (value) => /^[a-zA-Z0-9]+$/.test(value),
      message: 'The username must only contain letters and numbers.'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: [10, 'The password must contain at least 10 characters.'],
    maxlength: [2000, 'The password must not contain more than 2000 characters.']
  },
  friends: {
    type: Array
  }
}, {
  timestamps: true,
  versionKey: false
})

// Encrypts the submitted password.
schema.pre('save', async function () {
  this.password = await bcrypt.hash(this.password, 8)
})

/**
 * Checks if there is a user with the submitted username and if
 * the submitted password matches the password saved in the database.
 *
 * @param {string} username - The submitted username.
 * @param {string} password - The submitted password.
 * @returns {object} The user if the username and password are correct.
 */
schema.statics.authenticate = async function (username, password) {
  const user = await this.findOne({ username })

  // If no user found or if password is wrong, throw an error.
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error('Invalid login attempt. Please try again.')
  }

  return user
}

// Create a model using the schema.
export const User = mongoose.model('User', schema)
