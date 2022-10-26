import express from 'express';
import indexRoute from './routes/index.route';
export default class App {
    public app: express.Application;

    constructor() {
        this.app = express();
        this.mountRoutes();
    }

    private mountRoutes(): void {
        const indexRoute_ = new indexRoute();
        this.app.use('/', indexRoute_.router); // Mount the indexRouter to the root path
    }    
}