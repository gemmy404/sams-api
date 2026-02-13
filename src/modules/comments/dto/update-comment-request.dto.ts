import {PartialType} from "@nestjs/swagger";
import {CreateCommentRequestDto} from "./create-comment-request.dto";

export class UpdateCommentRequestDto extends PartialType(CreateCommentRequestDto) {
}