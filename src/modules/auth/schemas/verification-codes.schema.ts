import {Types} from "mongoose";
import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {VerificationType} from "../enums/verification-type.enum";
import {Users} from "../../users/schemas/users.schema";

@Schema({timestamps: true})
export class VerificationCode {
    _id: Types.ObjectId;

    @Prop({
        type: String,
        required: true,
        unique: true,
    })
    code: string;

    @Prop({
        type: Boolean,
        required: true,
    })
    isValid: boolean;

    @Prop({
        type: Date,
        required: false,
    })
    usedAt: Date;

    @Prop({
        type: Date,
        required: true,
    })
    expiresAt: Date;

    @Prop({
        type: String,
        required: true,
        enum: VerificationType,
    })
    type: VerificationType

    @Prop({
        type: Types.ObjectId,
        ref: Users.name,
        required: true,
    })
    user: Types.ObjectId;
}

export const VerificationCodeSchema = SchemaFactory.createForClass(VerificationCode);