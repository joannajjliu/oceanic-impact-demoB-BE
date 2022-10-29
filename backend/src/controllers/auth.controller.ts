import { NextFunction, Request, Response } from 'express';
import AuthService from '@services/auth.service';

export default class UsersController {
    public authService = new AuthService();

    public logout = async (req: Request, res: Response, next: NextFunction) => {
        req.logout(function(err) {
            if (err) {return next(err); }
            res.redirect('/');
        });
    }

    public signup = async (req: Request, res: Response, next: NextFunction) => {
        const { email, password } = req.body;
        try {
            const user = await this.authService.signup(email, password);
            
            // login the user after signup
            req.login({
                _id: user._id.toString(),
                email: user.email
            }, function(err: any) {
                if (err) { return next(err); }
                return res.redirect(process.env.AUTH_SUCCESS_REDIRECT || '/');
            });
        } catch (error: any) {
            if (error.name === 'MongoError' && error.code === 11000) {
                // duplicate key in index error.
                // See https://www.mongodb.com/docs/manual/core/index-unique/#unique-index-and-missing-field
                return res.status(409).send({ message: `A user with the email: "${email}" already exists` });
            }
            // a;; other errors are assumed to be server errors
            console.error(error);
            res.status(500).json({
                message: 'Error creating new user'
            });
        }
    }
}