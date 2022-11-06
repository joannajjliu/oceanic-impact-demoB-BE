import Profile, { IProfile } from "@models/profile.model";
import { HydratedDocument } from "mongoose";

export default class ProfileService {
    public async getProfileByUserId(
        userId: string
    ): Promise<HydratedDocument<IProfile> | null> {
        const profile = await Profile.findOne({user: userId}); // find user by id
        return profile;
    }

  public async getProfileById(
    id: string
   ): Promise<HydratedDocument<IProfile> | null> {
    const profile = await Profile
        .findById(id)

    return profile
  }
}
