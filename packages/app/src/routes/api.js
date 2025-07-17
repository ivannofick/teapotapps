import { Router } from 'express'
const router = Router()
import WelcomeController from '../controllers/WelcomeController.js'

router.get('/', WelcomeController.wellcome)
router.get('/api', WelcomeController.apiWellcome)
export default router

