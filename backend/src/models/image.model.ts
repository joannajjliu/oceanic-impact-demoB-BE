import mongoose, { Schema, Document, model, CallbackError } from "mongoose";
import { IUser } from "./users.model";

export interface IImage {
  author: IUser;
  img: {
    data: Buffer;
    contentType: string;
  };
}

const imageSchema = new mongoose.Schema({
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  img: {
    data: Buffer,
    contentType: String,
  },
});

const Image = model<IImage>("Image", imageSchema);

export default Image;
