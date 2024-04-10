import createError from 'http-errors'

/**
 * Authorizes a user to edit a specific puzzle for the authenticated user.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {object} next - Express next middleware function.
 */
export const authorizeUser = (req, res, next) => {
  try {
    if (req.puzzle.owner.toString() !== req.user.id) {
      next(createError(403))
    } else {
      next()
    }
  } catch (error) {
    next(error)
  }
}
