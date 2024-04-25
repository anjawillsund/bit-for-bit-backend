/**
 * Mongoose model Puzzle.
 *
 * @author Anja Willsund
 * @version 1.0.0
 */

import crypto from 'crypto'
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
        return /^[a-zA-Z0-9åäöÅÄÖéóèòáà\-.,:;! ]+$/.test(value)
      }
    },
    minLength: 1,
    maxLength: [100, 'The title must not contain more than 100 characters.']
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
        return value === null || (/^\d+$/.test(value) && value >= 2 && value <= 20000)
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
        return ((value >= 1 && value <= 100000)) && !(value && !this.sizeWidth)
      },
      /**
       * This message is shown when the validation fails,
       * indicating that both `sizeHeight` and `sizeWidth` fields must be provided together.
       *
       * @param {object} props - The context properties object provided by Mongoose, which contains information about the failed validation.
       * @returns {string} The custom error message for the validation failure.
       */
      message: props => 'If \'sizeHeight\' is provided, \'sizeWidth\' must also be provided. \'sizeHeight\' must not be larger than 100 000.'
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
        return ((value >= 1 && value <= 100000)) && !(value && !this.sizeHeight)
      },
      /**
       * This message is shown when the validation fails,
       * indicating that both `sizeHeight` and `sizeWidth` fields must be provided together.
       *
       * @param {object} props - The context properties object provided by Mongoose, which contains information about the failed validation.
       * @returns {string} The custom error message for the validation failure.
       */
      message: props => 'If \'sizeWidth\' is provided, \'sizeHeight\' must also be provided. \'sizeWidth\' must not be larger than 100 000.'
    }
  },
  manufacturer: {
    type: String,
    required: false,
    trim: true,
    maxLength: [50, 'The manufacturer must not contain more than 50 characters.'],
    validate: {
      /**
       * Validates that the submitted title is a string.
       *
       * @param {string} value - The submitted title.
       * @returns {boolean} True if the submitted title is valid, otherwise false.
       */
      validator: function (value) {
        // The title must only contain letters, numbers, and spaces.
        return value === '' || /^[a-zA-Z0-9åäöÅÄÖéóèòáà\-.,:;! ]+$/.test(value)
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
    maxLength: [100, 'The location must not contain more than 100 characters.'],
    validate: {
      /**
       * Validates that the submitted title is a string.
       *
       * @param {string} value - The submitted title.
       * @returns {boolean} True if the submitted title is valid, otherwise false.
       */
      validator: function (value) {
        // The title must only contain letters, numbers, and spaces.
        return value === '' || /^[a-zA-Z0-9åäöÅÄÖéóèòáà\-.,:;! ]+$/.test(value)
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
      },
      /**
       * This message is shown when the validation fails,
       * indicating that 'missingPiecesNumber' must be provided if 'complete' is false.
       *
       * @param {object} props - The context properties object provided by Mongoose, which contains information about the failed validation.
       * @returns {string} The custom error message for the validation failure.
       */
      message: props => 'If \'complete\' is false, \'missingPiecesNumber\' must also be provided.'
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
        return value === null || (value >= 1 && value < this.piecesNumber)
      },
      /**
       * This message is shown when the validation fails,
       * indicating that 'missingPiecesNumber' must be provided if 'complete' is false.
       *
       * @param {object} props - The context properties object provided by Mongoose, which contains information about the failed validation.
       * @returns {string} The custom error message for the validation failure.
       */
      message: props => 'The number of missing pieces must not be 0 or greater than the total number of pieces.'
    }
  },
  privateNote: {
    type: String,
    required: false,
    trim: true,
    maxLength: [1000, 'The private note must not contain more than 1 000 characters.']
  },
  sharedNote: {
    type: String,
    required: false,
    trim: true,
    maxLength: [1000, 'The shared note must not contain more than 1 000 characters.']
  },
  isPrivate: {
    type: Boolean,
    default: true
  },
  isLentOut: {
    type: Boolean,
    default: false,
    validate: {
      /**
       * Validates that if the puzzle lent out, whom the puzzle is lent out to must also be submitted.
       *
       * @param {string} value - The submitted boolean.
       * @returns {boolean} True if the submitted boolean is valid, otherwise false.
       */
      validator: function (value) {
        return !(value === true && !this.lentOutToString)
      },
      /**
       * This message is shown when the validation fails,
       * indicating that 'lentOutTo' must be provided if 'isLentOut' is true.
       *
       * @param {object} props - The context properties object provided by Mongoose, which contains information about the failed validation.
       * @returns {string} The custom error message for the validation failure.
       */
      message: props => 'If \'isLentOut\' is true, \'lentOutToString\' must also be provided.'
    }
  },
  // lentOutTo: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'User',
  //   required: false,
  //   validate: {
  //     /**
  //      * Validates that if the puzzle lent out, whom the puzzle is lent out to must also be submitted.
  //      *
  //      * @param {string} value - The submitted user id.
  //      * @returns {boolean} True if the submitted user id is not '6617db0e18569854b2352a68' or if lentOutToString has been submitted, otherwise false.
  //      */
  //     validator: function (value) {
  //       return !(value.toString() === '6617db0e18569854b2352a68' && !this.lentOutToString)
  //     },
  //     /**
  //      * This message is shown when the validation fails,
  //      * indicating that 'lentOutToString' must be provided if 'lentOutTo' is '6617db0e18569854b2352a68'.
  //      *
  //      * @param {object} props - The context properties object provided by Mongoose, which contains information about the failed validation.
  //      * @returns {string} The custom error message for the validation failure.
  //      */
  //     message: props => 'If \'lentOutTo\' is \'other\', \'lentOutToString\' must also be provided.'
  //   }
  // },
  lentOutToString: {
    type: String,
    required: false,
    trim: true,
    maxLength: [50, 'The name of the person the puzzle is lent out to must not contain more than 50 characters.'],
    validate: {
      /**
       * Validates that the name of the person the puzzle is lent out to only contains letters, numbers, and spaces.
       *
       * @param {string} value - The submitted name.
       * @returns {boolean} True if the submitted name is valid, otherwise false.
       */
      validator: function (value) {
        return /^[a-zA-Z0-9åäöÅÄÖéóèòáà\-.,:;! ]+$/.test(value)
      },
      /**
       * This message is shown when the validation fails,
       * indicating that 'lentOutToString' is not valid.
       *
       * @param {object} props - The context properties object provided by Mongoose, which contains information about the failed validation.
       * @returns {string} The custom error message for the validation failure.
       */
      message: props => 'The name of the person lending the puzzle must only contain letters, numbers and spaces.'
    }
  },
  image: {
    type: Buffer,
    default: null
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

schema.pre('save', function () {
  // Set the 'complete' field based on the 'missingPiecesNumber' field.
  if (this.missingPiecesNumber > 0) {
    this.complete = false
  }
  if (this.lentOutTo) {
    this.isLentOut = true
    this.lentOutToString = null
  }
  if (this.lentOutToString && !this.lentOutTo) {
    this.lentOutTo = '6617db0e18569854b2352a68'
    this.isLentOut = true
  }
  if (this.privateNote) {
    this.privateNote = JSON.stringify(encryptPrivateNote(this.privateNote))
  }
})

/**
 * Encrypts a private note.
 *
 * @param {string} privateNote - The private note to encrypt.
 * @returns {object} The encrypted private note.
 */
function encryptPrivateNote (privateNote) {
  const key = Buffer.from(process.env.SECRET_ENCRYPTION_KEY, 'base64')
  const iv = Buffer.from(process.env.SECRET_ENCRYPTION_IV, 'base64')
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
  let encrypted = cipher.update(privateNote, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return { iv: iv.toString('hex'), encryptedData: encrypted }
}

// Create a model using the schema.
export const Puzzle = mongoose.model('Puzzle', schema)
