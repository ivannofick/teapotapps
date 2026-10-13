import { Router } from 'express';
import { routeGroup, verifyToken } from 'teapotapps';
import * as WelcomeController from '../controllers/WelcomeController.js';

const router = Router();

// Public API routes
router.get('/api/wellcome', WelcomeController.apiWellcome);

// Protected API routes
routeGroup(router, "/api", [verifyToken], (api) => {
    // Register protected endpoints here
});

export default router;

