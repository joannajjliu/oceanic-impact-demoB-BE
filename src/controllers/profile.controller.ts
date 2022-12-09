import { Request, Response } from "express";
import ProfileService from "@/services/profile.service";
import _ from "lodash";

export default class ProfileController {
  private profileService = new ProfileService();

  public getMe = async (req: Request, res: Response) => {
    try {
      const profile = await this.profileService.getProfileByUserId(
        req.user!._id
      ); // req.user is set by passport in middleware
      if (!profile) {
        return res.status(404).json({ error: "Profile not found for user" });
      }

      res.status(200).json({
        profile,
      });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({
        message: "Server error",
      });
    }
  };

  public getProfileById = async (req: Request, res: Response) => {
    try {
      const profile = await this.profileService.getProfileById(
        req.params.profileID
      );
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      res.status(200).json({
        profile,
      });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({
        message: "Server error",
      });
    }
  };

  public editProfile = async (req: Request, res: Response) => {
    try {
      const profile = await this.profileService.getProfileByUserId(
        req.user!._id
      ); // req.user is set by passport in middleware
      if (!profile) {
        return res.status(404).json({ error: "Profile not found for user" });
      }

      const update = _.pick(req.body, [
        "bio",
        "displayName",
        "avatarImage",
      ]);

      if (Object.keys(update).length === 0) {
        return res.status(400).json({
          error: "none of them were modifiable",
        });
      }

      const result = await this.profileService.editProfile(
        profile._id.toString(),
        update
      );

      if (!result) {
        return res.status(500).json({
          error: "server error",
        });
      } else {
        return res.status(200).json({
          message: "Successfully updated",
          profile: result,
        });
      }
    } catch (error: any) {
      console.error(error);
      res.status(500).json({
        message: "Server error",
      });
    }
  };
}
