import {Types} from "mongoose";
import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";

@Schema()
export class Classwork {
    _id?: Types.ObjectId;

    @Prop({
        type: String,
        required: true,
    })
    name: string;

    @Prop({
        type: Number,
        required: true,
    })
    points: number;

    @Prop({
        type: Boolean,
        required: false,
        default: true,
    })
    isVisible: boolean;

    @Prop({
        type: Boolean,
        required: false,
        default: false,
    })
    isUsed: boolean;
}

export const ClassworkSchema = SchemaFactory.createForClass(Classwork);