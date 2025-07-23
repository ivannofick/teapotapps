import { Router } from 'express'
const router = Router()
import WelcomeController from '../controllers/WelcomeController.js'
import { verifyToken } from '../middlewares/verifyToken.js'

router.get('/', WelcomeController.wellcome)
router.get('/api', verifyToken, WelcomeController.apiWellcome)
export default router

