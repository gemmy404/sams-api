import { Types } from "mongoose";

export class CurrentUserDto {
  _id: string;
  academicEmail: string;
  roles: string[] | Types.ObjectId[];
}