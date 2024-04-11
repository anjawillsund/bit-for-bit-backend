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
        return /^[a-zA-Z0-9åäöÅÄÖéóèòáà ]+$/.test(value)
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
        return ((value >= 1 && value <= 99999)) && !(value && !this.sizeWidth)
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
        return ((value >= 1 && value <= 99999)) && !(value && !this.sizeHeight)
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
    trim: true,
    maxLength: [100, 'The manufacturer must not contain more than 100 characters'],
    validate: {
      /**
       * Validates that the submitted title is a string.
       *
       * @param {string} value - The submitted title.
       * @returns {boolean} True if the submitted title is valid, otherwise false.
       */
      validator: function (value) {
        // The title must only contain letters, numbers, and spaces.
        return /^[a-zA-Z0-9åäöÅÄÖéóèòáà ]+$/.test(value)
      }
    }
  },
  // TODO: Lägga in mer validering här?
  lastPlayed: {
    type: Date,
    required: false
  },
  location: {
    type: String,
    required: false,
    trim: true,
    maxLength: [100, 'The location must not contain more than 100 characters'],
    validate: {
      /**
       * Validates that the submitted title is a string.
       *
       * @param {string} value - The submitted title.
       * @returns {boolean} True if the submitted title is valid, otherwise false.
       */
      validator: function (value) {
        // The title must only contain letters, numbers, and spaces.
        return /^[a-zA-Z0-9åäöÅÄÖéóèòáà ]+$/.test(value)
      }
    }
  },
  complete: {
    type: Boolean,
    required: false,
    validate: {
      /**
       * Validates that if the puzzle is not complete, the number of missing pieces must not be 0.
       *
       * @param {string} value - The submitted boolean.
       * @returns {boolean} True if the submitted boolean is valid, otherwise false.
       */
      validator: function (value) {
        return !(value === false && !this.missingPiecesNumber)
      }
    }
  },
  missingPiecesNumber: {
    type: Number,
    required: false,
    validate: {
      /**
       * Validates that if the number of missing pieces can not be greater than the total number of pieces.
       *
       * @param {string} value - The number of missing pieces.
       * @returns {boolean} True if the number of missing pieces is more than 0 and less than the total number of pieces, otherwise false.
       */
      validator: function (value) {
        return (value >= 1 && value < this.piecesNumber)
      }
    }
  },
  privateNote: {
    type: String,
    required: false,
    trim: true,
    maxLength: [1000, 'The private note must not contain more than 1 000 characters']
  },
  sharedNote: {
    type: String,
    required: false,
    trim: true,
    maxLength: [1000, 'The shared note must not contain more than 1 000 characters']
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

// Pre-save hook to set the 'complete' field based on the 'missingPiecesNumber' field.
schema.pre('save', async function () {
  if (this.missingPiecesNumber > 0) {
    this.complete = false
  }
})

// Create a model using the schema.
export const Puzzle = mongoose.model('Puzzle', schema)
