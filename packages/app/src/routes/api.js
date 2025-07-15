import { Router } from 'express'
import WelcomeController from '../controllers/WelcomeController.js'
const router = Router()

router.get('/', WelcomeController.wellcome)

export default router
