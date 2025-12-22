import { Router } from 'express'
const router = Router()
import WelcomeController from '../controllers/WelcomeController.js'
import { verifyToken } from '../middlewares/verifyToken.js'
import { routeGroup } from '../core/routeGroup.js'

router.get('/', WelcomeController.wellcome)
routeGroup(router, "/api", [verifyToken], (api) => {
    router.get('/wellcome', verifyToken, WelcomeController.apiWellcome)
});

export default router

