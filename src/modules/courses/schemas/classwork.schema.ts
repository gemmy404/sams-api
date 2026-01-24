import {Types} from "mongoose";
import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";

@Schema()
export class Classwork {
    _id: Types.ObjectId;

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
}

export const ClassworkSchema = SchemaFactory.createForClass(Classwork);