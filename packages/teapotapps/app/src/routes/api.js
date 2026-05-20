import { Router } from 'express'
const router = Router()
import * as WelcomeController from '../controllers/WelcomeController.js'
import { verifyToken } from '../middlewares/verifyToken.js'
import { routeGroup } from '../core/routeGroup.js'

routeGroup(router, "/api", [verifyToken], (api) => {
    api.get('/wellcome', WelcomeController.apiWellcome)
});

export default router

