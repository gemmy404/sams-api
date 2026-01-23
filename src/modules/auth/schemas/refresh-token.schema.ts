import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {Users} from "../../users/schemas/users.schema";
import {Types} from "mongoose";

@Schema({timestamps: true})
export class RefreshToken {
    @Prop({
        type: String,
        required: true,
    })
    refreshToken: string;

    @Prop({
        type: Types.ObjectId,
        ref: Users.name,
        required: true,
    })
    userId: Types.ObjectId;

    @Prop({
        type: Date,
        required: true,
    })
    expiresAt: Date;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);