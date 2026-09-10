import { Router } from 'express'
const router = Router()
import * as WelcomeController from '../controllers/WelcomeController.js'
import { verifyToken } from '../middlewares/verifyToken.js'
import { routeGroup } from '../core/routeGroup.js'

// Public API routes
router.get('/api/wellcome', WelcomeController.apiWellcome);

// Protected API routes
routeGroup(router, "/api", [verifyToken], (api) => {
    // Register protected endpoints here
});

export default router;

