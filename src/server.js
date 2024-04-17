/**
 * The starting point of the application.
 *
 * @author Anja Willsund
 * @version 1.0.0
 */

import express from 'express'
import session from 'express-session'
import logger from 'morgan'
import helmet from 'helmet'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { router } from './routes/router.js'
import { connectDB } from './config/mongoose.js'

try {
  await connectDB()

  const app = express()

  const directoryFullName = dirname(fileURLToPath(import.meta.url))

  app.use(logger('dev'))

  // TODO: Ska detta finnas kvar?
  app.use(express.urlencoded({ extended: true, limit: '10mb' }))

  app.use(express.static(join(directoryFullName, '..', 'public')))

  app.use(helmet())

  // TODO: Ska detta finnas kvar med React? Fanns inte med i PixFlixr
  app.use(express.json({ limit: '10mb' }))

  // Add headers to allow cross origin requests.
  app.use((req, res, next) => {
    const allowedOrigins = [process.env.ORIGIN, process.env.FRONTEND]
    const origin = req.headers.origin

    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin)
    }

    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
      return res.sendStatus(200)
    }

    next()
  })

  // Setup and use session middleware (https://github.com/expressjs/session).
  const sessionOptions = {
    name: process.env.SESSION_NAME,
    secret: process.env.SESSION_SECRET,
    resave: false, // Resave even if a request is not changing the session.
    saveUninitialized: false, // Don't save a created but not modified session.
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      sameSite: 'strict'
    }
  }

  // If the app is in production, extra layers of security are added
  if (app.get('env') === 'production') {
    // Shows that this express application is run behind a reverse proxy, and which proxy that is trusted.
    app.set('trust proxy', 1) // Trust first proxy.
    // Tells the web browser to only send session cookies over HTTPS.
    sessionOptions.cookie.secure = true // Serve secure cookies.
  }

  app.use(session(sessionOptions))

  app.use('/', router)

  // Error handler.
  app.use(function (err, req, res, next) {
    // 400 Bad Request.
    if (err.status === 400) {
      return res.status(400).json({ message: err.message })
    }

    // 401 Unauthorized.
    if (err.status === 401) {
      return res.status(401).json({ message: err.message })
    }

    // 403 Forbidden.
    if (err.status === 403) {
      return res.status(403).json({ message: err.message })
    }

    // 404 Not Found.
    if (err.status === 404) {
      return res.status(404).json({ message: err.message })
    }

    // 405 Method Not Allowed.
    if (err.status === 405) {
      return res.status(405).json({ message: err.message })
    }

    // 500 Internal Server Error (in production, all other errors send this response).
    if (req.app.get('env') !== 'development') {
      return res.status(500).json({ message: err.message })
    }

    // Development only!
    // Only providing detailed error in development.
    res.status(err.status || 500).send('Internal Server Error')
  })

  // Starts the HTTP server listening for connections.
  app.listen(process.env.PORT, () => {
    console.log(`Server running at http://localhost:${process.env.PORT}`)
    console.log('Press Ctrl-C to terminate...')
  })
} catch (err) {
  console.error(err)
  process.exitCode = 1
}
