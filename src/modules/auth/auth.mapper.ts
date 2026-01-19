import {Injectable} from "@nestjs/common";
import {LoginResponseDto} from "./dto/login-response.dto";
import {Users} from "../users/schemas/users.schema";

@Injectable()
export class AuthMapper {

    toLoginResponse(tokens: any, user: Users): LoginResponseDto {
        return {
            ...tokens,
            user: {
                name: user.name,
                academicEmail: user.academicEmail,
                profilePic: user.profilePic || null
            }
        }
    }

}