import express from 'express';
import indexRoute from './routes/index.route';
import passport from 'passport';
import authStrategy from './passport/authStrategy';
import session from 'express-session';
import User from '@models/users.model';
import MongoStore from 'connect-mongo';
import mongoose from 'mongoose';

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
        this.app.use(session({
            secret: process.env.SESSION_SECRET as string,
            resave: false,
            saveUninitialized: false,
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
                secure: process.env.NODE_ENV === 'production', // set { secure: true } in production
            },
            store: MongoStore.create({ // preserve session data in MongoDB so it persists across server instances/restarts
                client: (await mongoose.connection.asPromise()).getClient(),
                dbName: process.env.MONGO_DB_NAME as string,
            })
        }))
        this.app.use(passport.initialize());
        this.app.use(passport.session());
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