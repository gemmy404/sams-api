import {ApiProperty} from "@nestjs/swagger";

export class CommentAuthorDto {
    @ApiProperty()
    name: string;

    @ApiProperty()
    academicId: string;

    @ApiProperty({nullable: true})
    profilePic: string | null;
}