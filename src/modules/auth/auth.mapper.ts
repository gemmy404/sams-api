import {Injectable} from "@nestjs/common";
import {LoginResponseDto} from "./dto/login-response.dto";
import {Users} from "../users/schemas/users.schema";
import {getStaticUrl} from "../../common/utils/get-static-url.util";

@Injectable()
export class AuthMapper {

    toLoginResponse(tokens: any, user: Users): LoginResponseDto {
        let profilePic: string | null = null;
        if (user.profilePic) {
            profilePic = getStaticUrl(user.profilePic);
        }
        return {
            ...tokens,
            user: {
                name: user.name,
                academicEmail: user.academicEmail,
                profilePic: profilePic,
            }
        }
    }

}