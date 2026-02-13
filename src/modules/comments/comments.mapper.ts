import {CommentResponseDto} from "./dto/comment-response.dto";
import {Injectable} from "@nestjs/common";
import {Comment} from "./schemas/comments.schema";
import {Users} from "../users/schemas/users.schema";
import {getStaticUrl} from "../../common/utils/get-static-url.util";

@Injectable()
export class CommentsMapper {

    toCommentResponse(this: void, comment: Comment): CommentResponseDto {
        const author = comment.author as unknown as Users;
        let profilePic: string | null = null;
        if (author.profilePic) {
            profilePic = getStaticUrl(author.profilePic);
        }
        return {
            _id: comment._id!.toString(),
            content: comment.content,
            commentedAt: comment.commentedAt.toLocaleString(),
            author: {
                name: author.name,
                academicId: author.academicId,
                profilePic: profilePic,
            },
        };
    }

}