import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {Types} from "mongoose";
import {UserRoles} from "../enums/user-roles.enum";

@Schema({timestamps: true})
export class Roles {
    _id: Types.ObjectId;

    @Prop({
        enum: UserRoles,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    })
    name: UserRoles;
}

export const RoleSchema = SchemaFactory.createForClass(Roles);