import {IsArray, IsMongoId, IsNotEmpty, ValidateNested} from "class-validator";
import {Types} from "mongoose";
import {Type} from "class-transformer";
import {MatchDetailsDto} from "./match-details.dto";

export class SimilarityResultDto {
    @IsNotEmpty({message: 'Student ID is required'})
    @IsMongoId({message: 'Student ID must be a valid mongo id'})
    @Type(() => Types.ObjectId)
    studentId: Types.ObjectId;

    @IsNotEmpty({message: 'Submission ID is required'})
    @IsMongoId({message: 'Submission ID must be a valid mongo id'})
    @Type(() => Types.ObjectId)
    submissionId: Types.ObjectId;

    @IsNotEmpty({message: 'Matches is required'})
    @IsArray()
    @ValidateNested({each: true})
    @Type(() => MatchDetailsDto)
    matches: MatchDetailsDto[]
}