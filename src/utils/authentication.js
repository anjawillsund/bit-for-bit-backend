import jwt from 'jsonwebtoken'

/**
 * Authenticates token.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {object} next - Express next middleware function.
 */
export const authenticateToken = (req, res, next) => {
  // Extract the token from the authorization header
  const token = req.headers.authorization?.split(' ')[1]

  // Check if the token is missing
  if (!token) {
    console.log('No token provided.')
    res.status(401).json({ error: 'No token provided.' })
    return
  }

  // Verify the token using the secret key
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    // Check if there is an error during token verification
    if (err) {
      console.log(err)
      // Return a 401 error if the token is invalid
      res.status(401).json({ error: 'Invalid token.' })
      return
    }
    // Attach the decoded user information to the request object for further processing
    req.user = decoded
    console.log('Token authenticated')
    // Proceed to the next middleware or route handler if the token is valid
    next()
  })
}
