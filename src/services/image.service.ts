import Image from "@/models/image.model";
import User, { IUser } from "@models/users.model";
import { HydratedDocument, Types } from "mongoose";

export default class ImageService {
  public image_model = Image;

  public async getOwnerById(
    imageId: string
  ): Promise<HydratedDocument<IUser> | null> {
    const image = await this.image_model.findOne({ _id: imageId }) // find image by id
    if (!image) {
      return null;
    }
    
    const owner = image!.author;
    return owner as HydratedDocument<IUser> | null;
  }

  public async checkOwnerById(
    imageId: string,
    userId: string | Types.ObjectId
  ): Promise<boolean> {
    const owner = await this.getOwnerById(imageId);

    if (!owner) {
      return false;
    }

    return owner._id.equals(userId);
  }
}
