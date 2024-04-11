/**
 * Mongoose model Puzzle.
 *
 * @author Anja Willsund
 * @version 1.0.0
 */

import mongoose from 'mongoose'

// Create a puzzle schema.
const schema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    validate: {
      /**
       * Validates that the submitted title is a string.
       *
       * @param {string} value - The submitted title.
       * @returns {boolean} True if the submitted title is valid, otherwise false.
       */
      validator: function (value) {
        // The title must only contain letters, numbers, and spaces.
        return /^[a-zA-Z0-9åäöÅÄÖ ]+$/.test(value)
      }
    },
    minLength: 1,
    maxLength: [100, 'The title must not contain more than 100 characters']
  },
  piecesNumber: {
    type: Number,
    required: false,
    validate: {
      /**
       * Validates that the submitted number of pieces is a number between 2 and 20 000.
       *
       * @param {string} value - The submitted pieces number.
       * @returns {boolean} True if the submitted pieces number is valid, otherwise false.
       */
      validator: function (value) {
        // The pieces number must only contain numbers.
        return /^\d+$/.test(value) && value >= 2 && value <= 20000
      }
    }
  },
  sizeHeight: {
    type: Number,
    required: false,
    validate: {
      /**
       * Validates that the submitted size is a number between 1 and 99999.
       *
       * @param {string} value - The submitted size.
       * @returns {boolean} True if the submitted size is valid, otherwise false.
       */
      validator: function (value) {
        return (value === undefined || (value >= 1 && value <= 99999)) && !(value && !this.sizeWidth)
      },
      /**
       * This message is shown when the validation fails,
       * indicating that both `sizeHeight` and `sizeWidth` fields must be provided together.
       *
       * @param {object} props - The context properties object provided by Mongoose, which contains information about the failed validation.
       * @returns {string} The custom error message for the validation failure.
       */
      message: props => 'If \'sizeHeight\' is provided, \'sizeWidth\' must also be provided.'
    }
  },
  sizeWidth: {
    type: Number,
    required: false,
    validate: {
      /**
       * Validates that the submitted size is a number between 1 and 99999.
       *
       * @param {string} value - The submitted size.
       * @returns {boolean} True if the submitted size is valid, otherwise false.
       */
      validator: function (value) {
        // return /^\d{1,5}$/.test(value) && !(value && !this.sizeWidth)
        return (value === undefined || (value >= 1 && value <= 99999)) && !(value && !this.sizeHeight)
      },
      /**
       * This message is shown when the validation fails,
       * indicating that both `sizeHeight` and `sizeWidth` fields must be provided together.
       *
       * @param {object} props - The context properties object provided by Mongoose, which contains information about the failed validation.
       * @returns {string} The custom error message for the validation failure.
       */
      message: props => 'If \'sizeWidth\' is provided, \'sizeHeight\' must also be provided.'
    }
  },
  manufacturer: {
    type: String,
    required: false,
    trim: true
  },
  lastPlayed: {
    type: Date,
    required: false
  },
  location: {
    type: String,
    required: false,
    trim: true
  },
  complete: {
    type: Boolean,
    required: false
  },
  missingPiecesNumber: {
    type: Number,
    required: false
  },
  privateNote: {
    type: String,
    required: false,
    trim: true
  },
  sharedNote: {
    type: String,
    required: false,
    trim: true
  },
  isPrivate: {
    type: Boolean,
    default: true
  },
  isLentOut: {
    type: Boolean,
    default: false
  },
  lentOutTo: {
    type: String,
    required: false,
    trim: true
  },
  image: {
    type: Buffer
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toObject: {
    virtuals: true, // ensure virtual fields are serialized
    /**
     * Performs a transformation of the resulting object to remove sensitive information.
     *
     * @param {object} doc - The mongoose document which is being converted.
     * @param {object} ret - The plain object representation which has been converted.
     */
    transform: function (doc, ret) {
      delete ret._id
      delete ret.__v
    }
  }
})

// Makes the code more readable and doesn't expose that we are using
// mongoose.
schema.virtual('id').get(function () {
  return this._id.toHexString()
})

// Create a model using the schema.
export const Puzzle = mongoose.model('Puzzle', schema)
