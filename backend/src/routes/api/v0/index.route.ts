// this file contains the index for the /api/v0 routes
// you can import routers here and mount them to this router
// the base path is /api/v0
import { Router } from 'express'
const router = Router();

// TODO: remove test route
router.get('/', (req, res) => {
    res.send('Hello World!');
});

export default router;