// this file contains the index for all routes in the application
// you can import routers here and mount them to this index router
import { Router } from 'express'
import apiRouter from './api/index.route';
const router = Router();

router.use('/api', apiRouter); // mount the api router to /api

export default router;