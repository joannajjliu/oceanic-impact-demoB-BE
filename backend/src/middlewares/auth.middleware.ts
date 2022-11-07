import { Request, Response, NextFunction } from 'express';

export function verifyAuth(req: Request, res: Response, next: NextFunction) {
    if (req.isAuthenticated()) {
        return next();
    }
    
    res.status(401).json({error: 'Unauthorized'});
}