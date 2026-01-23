import {Injectable} from "@nestjs/common";
import {UserResponseDto} from "./dto/user-response.dto";
import {Users} from "./schemas/users.schema";
import {CreateUserRequestDto} from "../admin/dto/create-user-request.dto";
import {Types} from "mongoose";

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

    toUserSchema(createdUserRequest: CreateUserRequestDto) {
        return {
            name: createdUserRequest.name,
            academicEmail: createdUserRequest.academicEmail,
            academicId: createdUserRequest.academicId,
            isActive: true,
            password: createdUserRequest.password,
            roles: [new Types.ObjectId(createdUserRequest.roleId)],
        }
    }

}