/**
 * Mongoose model Puzzle.
 *
 * @author Anja Willsund
 * @version 1.0.0
 */

import mongoose from 'mongoose'

// Create a puzzle schema.
const schema = new mongoose.Schema({
  piecesNumber: {
    type: Number,
    required: false,
    trim: true
  },
  size: {
    type: Number,
    required: false,
    trim: true
    // validate: {
    //   /**
    //    * Validates that the submitted flow is a number.
    //    *
    //    * @param {string} value - The submitted flow.
    //    * @returns {boolean} True if the submitted flow is valid, otherwise false.
    //    */
    //   validator: function (value) {
    //     // The flow must only contain numbers.
    //     return /^\d+$/.test(value)
    //   }
    // },
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
    required: false,
    trim: true
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
  private: {
    type: Boolean,
    default: true
  }
  // image: {
  //   type: String,
  //   required: true,
  //   trim: true
  // }
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
