import { Router } from 'express'
const router = Router()
import * as WelcomeController from '../controllers/WelcomeController.js'
import { verifyToken } from '../middlewares/verifyToken.js'
import { routeGroup } from '../core/routeGroup.js'
import { controller } from '../core/http.js'

const Welcome = controller(WelcomeController)

routeGroup(router, "/api", [verifyToken], (api) => {
    api.get('/wellcome', Welcome.apiWellcome)
});

export default router

