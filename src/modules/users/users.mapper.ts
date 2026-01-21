import {Injectable} from "@nestjs/common";
import {UserResponseDto} from "./dto/user-response.dto";
import {Users} from "./schemas/users.schema";

@Injectable()
export class UsersMapper {

    toUserResponse(user: Users): UserResponseDto {
        return {
            _id: user._id?.toString() || null,
            name: user.name,
            academicEmail: user.academicEmail,
            academicId: user.academicId,
            profilePic: user.profilePic || null
        }
    }
}