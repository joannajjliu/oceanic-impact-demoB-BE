// this file contains the index for /api routes
// the base path is /api
// versioning of the api routes is done here
import { Router } from 'express'
import v0Route from './v0/index.route';
import Route from '@interfaces/route.interface';

export default class APIRoute implements Route {
    public router: Router = Router();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {  
        const v0Route_ = new v0Route();  
        this.router.use('/v0', v0Route_.router); // mount the v0 router to /api/v0
    }
}