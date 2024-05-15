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

router.route('/login')
  .post((req, res, next) => controller.loginPost(req, res, next))
router.route('/create')
  .post((req, res, next) => controller.createPost(req, res, next))
router.route('/logout')
  .get(authenticateToken,
    (req, res, next) => controller.logout(req, res, next))
