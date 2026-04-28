import {IsArray, IsBoolean, IsMongoId, IsNotEmpty, IsOptional, IsString, ValidateNested} from "class-validator";
import {Type} from "class-transformer";
import {SimilarityResultDto} from "./similarity-result.dto";
import {Types} from "mongoose";

export class PlagiarismEndpointResponse {
    @IsNotEmpty()
    @IsMongoId({message: 'Assignment ID must be a valid mongo id'})
    @Type(() => Types.ObjectId)
    assignmentId: Types.ObjectId;

    @IsOptional()
    @IsArray()
    @ValidateNested({each: true})
    @Type(() => SimilarityResultDto)
    results?: SimilarityResultDto[];

    @IsNotEmpty({message: 'Has Error is required'})
    @IsBoolean()
    hasError?: boolean;

    @IsOptional()
    @IsString()
    errorMessage?: string;
}