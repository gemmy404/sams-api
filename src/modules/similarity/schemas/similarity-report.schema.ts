import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Types} from 'mongoose';
import {SimilarityResult, SimilarityResultSchema} from "./similarity-result.schema";
import {SimilarityStatus} from "../enums/similarity-status.enum";
import {Assignment} from "../../assignments/schemas/assignments.schema";

@Schema({timestamps: true})
export class SimilarityReport {
    @Prop({
        type: Types.ObjectId,
        ref: Assignment.name,
        required: true,
    })
    assignment: Types.ObjectId;

    @Prop({
        type: String,
        enum: SimilarityStatus,
        default: SimilarityStatus.PENDING,
    })
    status: string;

    @Prop({
        type: [SimilarityResultSchema],
        default: [],
    })
    results: SimilarityResult[];

    @Prop({
        type: String,
        required: false,
    })
    errorLog?: string;
}

export const SimilarityReportSchema = SchemaFactory.createForClass(SimilarityReport);