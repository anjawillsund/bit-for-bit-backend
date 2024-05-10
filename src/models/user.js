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
    maxlength: [50, 'Användarnamnet får inte innehålla fler än 50 tecken.'],
    validate: {
      /**
       * Checks if the username only contains letters and numbers.
       *
       * @param {string} value - The username to validate.
       * @returns {boolean} True if the username only contains letters and numbers.
       */
      validator: (value) => /^[a-zA-Z0-9]+$/.test(value),
      message: 'Användarnamnet får endast innehålla bokstäver och siffror.'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: [10, 'Lösenordet måste innehålla minst 10 tecken.'],
    maxlength: [2000, 'Lösenordet får inte innehålla fler än 2 000 tecken.']
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
    throw new Error('Felaktiga uppgifter. Vänligen testa igen.')
  }

  return user
}

// Create a model using the schema.
export const User = mongoose.model('User', schema)
