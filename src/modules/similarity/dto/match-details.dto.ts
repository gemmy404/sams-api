import {Types} from "mongoose";
import {IsMongoId, IsNotEmpty, IsNumber} from "class-validator";
import {Type} from "class-transformer";

export class MatchDetailsDto {
    @IsNotEmpty({message: 'Compared With Student is required'})
    @IsMongoId({message: 'Compared With Student must be a valid mongo id'})
    @Type(() => Types.ObjectId)
    comparedWithStudent: Types.ObjectId;

    @IsNotEmpty({message: 'Compared With Submission is required'})
    @IsMongoId({message: 'Compared With Submission must be a valid mongo id'})
    @Type(() => Types.ObjectId)
    comparedWithSubmission: Types.ObjectId;

    @IsNotEmpty({message: 'Similarity Percentage is required'})
    @IsNumber({}, {message: 'Similarity Percentage must be a number'})
    similarityPercentage: number;
}