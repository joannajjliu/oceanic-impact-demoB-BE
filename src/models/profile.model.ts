import mongoose, { Schema, model } from "mongoose";
import { IImage } from "./image.model";
import { IUser } from "./users.model";

export interface IProfile {
  user: IUser;
  avatarImage: IImage;
  bio: string;
  displayName: string;
  createdAt: Date;
  updatedAt: Date;
  emailInfo: {
    isVerified: boolean;
    email: string;
  }
}

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    avatarImage: {
      type: Schema.Types.ObjectId,
      ref: "Image",
    },
    bio: {
      type: String,
    },
    displayName: {
      type: String,
    },
    emailInfo: {
      isVerified: Boolean,
      email: String,
    },
  },
  {
    timestamps: true,
  }
);

const Profile = model<IProfile>("Profile", profileSchema);

export default Profile;
