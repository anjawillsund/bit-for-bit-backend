import jwt from 'jsonwebtoken'
// TODO: Ska jag använda createError här?
import createError from 'http-errors'

/**
 * Authenticates a user by verifying the JWT token.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {object} next - Express next middleware function.
 */
export const authenticateJWT = (req, res, next) => {
  const authorization = req.headers.authorization?.split(' ')
  if (authorization?.[0] !== 'Bearer') {
    next(createError(401))
    return
  }
  try {
    req.jwt = jwt.verify(authorization[1], process.env.PUBLIC_RSA_KEY)
    req.userId = req.jwt.id
    req.userRole = req.jwt.role
    req.username = req.jwt.username

    next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      next(createError(401))
    } else {
      next(createError(500))
    }
  }
}
