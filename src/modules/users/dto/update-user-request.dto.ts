import {IsOptional, IsString} from 'class-validator';
import {ApiProperty} from "@nestjs/swagger";

export class UpdateUserRequestDto {
    @ApiProperty()
    @IsOptional()
    @IsString({message: 'Name must be a string'})
    name: string;
}
