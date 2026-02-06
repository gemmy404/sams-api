import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {Types} from "mongoose";

@Schema({timestamps: true})
export class Option {
    _id?: Types.ObjectId;

    @Prop({
        type: String,
        required: true,
    })
    text: string;

    @Prop({
        type: Boolean,
        default: false,
    })
    isCorrect: boolean;
}

export const OptionSchema = SchemaFactory.createForClass(Option);
