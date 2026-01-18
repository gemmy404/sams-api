import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {Types} from "mongoose";

@Schema({timestamps: true})
export class Roles {
    _id: Types.ObjectId;

    @Prop({
        type: String,
        required: true,
        unique: true,
    })
    name: string;
}

export const RoleSchema = SchemaFactory.createForClass(Roles);