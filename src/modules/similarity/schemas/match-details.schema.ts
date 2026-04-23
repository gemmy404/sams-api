import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {Types} from "mongoose";
import {Users} from "../../users/schemas/users.schema";
import {AssignmentSubmission} from "../../assignment-submissions/schemas/assignment-submissions.schema";

@Schema({_id: false})
export class MatchDetails {
    @Prop({
        type: Types.ObjectId,
        ref: Users.name,
        required: true
    })
    comparedWithStudent: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref: AssignmentSubmission.name,
        required: true
    })
    comparedWithSubmission: Types.ObjectId;

    @Prop({
        type: Number,
        required: true,
    })
    similarityPercentage: number;
}

export const MatchDetailsSchema = SchemaFactory.createForClass(MatchDetails);