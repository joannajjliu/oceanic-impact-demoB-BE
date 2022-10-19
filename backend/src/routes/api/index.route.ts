// this file contains the index for /api routes
// the base path is /api
// versioning of the api routes is done here
import { Router } from 'express'
import v0Router from './v0/index.route';
const router = Router();

router.use('/v0', v0Router); // mount the v0 router to /api/v0

export default router;