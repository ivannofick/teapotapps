import { Router } from 'express'
const router = Router()
import * as WelcomeController from '../controllers/WelcomeController.js'

router.get('/', WelcomeController.wellcome)
export default router

