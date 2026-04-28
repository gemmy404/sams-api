import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {Types} from "mongoose";
import {MatchDetails, MatchDetailsSchema} from "./match-details.schema";
import {Users} from "../../users/schemas/users.schema";
import {AssignmentSubmission} from "../../assignment-submissions/schemas/assignment-submissions.schema";

@Schema({_id: false})
export class SimilarityResult {
    @Prop({
        type: Types.ObjectId,
        ref: Users.name,
        required: true,
    })
    student: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref: AssignmentSubmission.name,
        required: true,
    })
    submission: Types.ObjectId;

    @Prop({
        type: [MatchDetailsSchema],
        default: [],
    })
    matches: MatchDetails[];
}

export const SimilarityResultSchema = SchemaFactory.createForClass(SimilarityResult);