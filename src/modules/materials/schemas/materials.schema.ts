import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {Types} from "mongoose";
import {Course} from "../../courses/schemas/courses.schema";
import {MaterialItem, MaterialItemSchema} from "./material-items.schema";

@Schema({timestamps: true})
export class Material {
    _id?: Types.ObjectId;

    @Prop({
        type: String,
        required: true,
        maxlength: [50, 'Title must not exceed 50 characters'],
    })
    title: string;

    @Prop({
        type: String,
        required: false,
        maxlength: [100, 'Description must not exceed 100 characters'],
    })
    description: string;

    @Prop({
        type: Types.ObjectId,
        ref: Course.name,
        required: true,
    })
    course: Types.ObjectId;

    @Prop({
        type: [MaterialItemSchema],
        required: false,
        default: [],
    })
    materialItems: MaterialItem[];
}

export const MaterialSchema = SchemaFactory.createForClass(Material);