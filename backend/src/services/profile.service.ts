import { IImage } from "@/models/image.model";
import Profile, { IProfile } from "@models/profile.model";
import { HydratedDocument } from "mongoose";

export default class ProfileService {
  public async getProfileByUserId(
    userId: string
  ): Promise<HydratedDocument<IProfile> | null> {
    const profile = await Profile.findOne({ user: userId }); // find user by id
    return profile;
  }

  public async getProfileById(
    id: string
  ): Promise<HydratedDocument<IProfile> | null> {
    const profile = await Profile.findById(id);

    return profile;
  }

  public async editProfile(
    id: string,
    updateObj: any
  ): Promise<HydratedDocument<IProfile> | null> {
    const profile = await Profile.findById(id);

    if (!profile) {
      return null;
    }

    try {
      const updatedProfile = await Profile.findOneAndUpdate(
        { _id: id },
        updateObj,
        { new: true }
      );
      return updatedProfile;
    } catch (err) {
      console.error(err);
      return null;
    }

    return profile;
  }
}
