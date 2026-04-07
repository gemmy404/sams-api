import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Types} from 'mongoose';
import {FileContentType} from "../enums/file-content-type.enum";

@Schema({timestamps: true})
export class MediaItem {
    _id?: Types.ObjectId;

    @Prop({
        type: String,
        required: true,
        maxlength: [50, 'Original file name must not exceed 50 characters']
    })
    originalFileName: string;

    @Prop({
        type: String,
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

export const MediaItemSchema = SchemaFactory.createForClass(MediaItem);