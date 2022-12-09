import express from 'express';
import indexRoute from './routes/index.route';
import passport from 'passport';
import authStrategy from './passport/authStrategy';
import User from '@models/users.model';

export default class App {
    public app: express.Application;

    constructor() {
        this.app = express();
        
        this.useMiddleware().then(() => {
            this.mountRoutes();
        });
    }

    private mountRoutes(): void {
        const indexRoute_ = new indexRoute();
        this.app.use('/', indexRoute_.router); // Mount the indexRouter to the root path
    }    

    private async useMiddleware(): Promise<void> {
        this.app.use(express.json()); // Parse JSON bodies
        this.app.use(passport.initialize());
        this.initPassport();
    }

    private initPassport(): void {
        passport.use(authStrategy);
        passport.serializeUser(function(user, done) {
            process.nextTick(function() {
                return done(null, user._id);
            });
        });
        
        passport.deserializeUser(function(id, done) {
            User.findById(id, function(err: any, user: Express.User) {
                if (err) done(err);

                done(err, {
                    _id: user._id,
                    email: user.email,
                });
            });
        });
    }
}