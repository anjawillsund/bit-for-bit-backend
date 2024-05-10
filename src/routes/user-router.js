/**
 * User routes.
 *
 * @author Anja Willsund
 * @version 1.0.0
 */

import express from 'express'
import { authenticateToken } from '../utils/authentication.js'
import { UserController } from '../controllers/user-controller.js'

export const router = express.Router()

const controller = new UserController()

router.post('/login', controller.loginPost)
router.post('/create', controller.createPost)
router.get('/logout', authenticateToken, controller.logout)
