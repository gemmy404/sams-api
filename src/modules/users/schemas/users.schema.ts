import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {Types} from "mongoose";
import {Roles} from "../../roles/schemas/roles.schema";

@Schema({timestamps: true})
export class Users {
    _id?: Types.ObjectId;

    @Prop({
        type: String,
        required: true,
        minlength: [6, 'Name must be at least 6 characters'],
        maxlength: [30, 'Name must not be more than 30 characters'],
    })
    name: string;

    @Prop({
        type: String,
        required: true,
        unique: true,
    })
    academicEmail: string;

    @Prop({
        type: String,
        required: true,
        unique: true,
        minlength: [9, 'Academic id must be 9 characters'],
        maxlength: [9, 'Academic id must be 9 characters'],
    })
    academicId: string;

    @Prop({
        type: String,
        required: true,
    })
    password: string;

    @Prop({
        type: Boolean,
        default: true,
    })
    isActive?: boolean;

    @Prop({
        type: String,
        required: false,
    })
    profilePic?: string;

    @Prop({
        type: String,
        required: false,
    })
    refreshToken?: string;

    @Prop({
        type: [Types.ObjectId],
        ref: Roles.name,
        required: true,
    })
    roles: Types.ObjectId[];

    updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(Users);