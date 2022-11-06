import { Request, Response } from 'express';
import ProfileService from '@/services/profile.service';

export default class ProfileController {
    private profileService = new ProfileService();

    public getMe = async (req: Request, res: Response) => {
        try {
            const profile = await this.profileService.getProfileByUserId(req.user!._id);// req.user is set by passport in middleware
            if (!profile) {
                return res.status(404).json({error: 'Profile not found for user'});
            }
            
            res.status(200).json({
                profile
            });
        } catch (error: any) {
            console.error(error);
            res.status(500).json({
                message: "Server error",
            });
        }
    }

    public getProfileById = async (req: Request, res: Response) => {
        try {
            const profile = await this.profileService.getProfileById(req.params.profileID);
            if (!profile) {
                return res.status(404).json({error: 'Profile not found'});
            }
            
            res.status(200).json({
                profile
            });
        } catch (error: any) {
            console.error(error);
            res.status(500).json({
                message: "Server error",
            });
        }
    }
}