import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {Types} from "mongoose";
import {FileContentType} from "../../../common/enums/file-content-type.enum";

@Schema({timestamps: true})
export class MaterialItem {
    _id?: Types.ObjectId;

    @Prop({
        type: String,
        required: true,
        maxlength: [50, 'Original file name must not exceed 50 characters']
    })
    originalFileName: string;

    @Prop({
        enum: FileContentType,
        required: true,
        lowercase: true,
    })
    contentType: FileContentType;

    @Prop({
        type: String,
        required: false,
        maxlength: [100, 'Content reference must not exceed 100 characters'],
    })
    contentReference: string;
}

export const MaterialItemSchema = SchemaFactory.createForClass(MaterialItem);