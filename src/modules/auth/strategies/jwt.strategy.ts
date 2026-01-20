import {Injectable, UnauthorizedException} from "@nestjs/common";
import {PassportStrategy} from "@nestjs/passport";
import {ExtractJwt, Strategy} from "passport-jwt";
import {ConfigService} from "@nestjs/config";
import {CurrentUserDto} from "../../../common/dto/current-user.dto";
import {UsersRepository} from "../../users/users.repository";
import {JWT_CONFIG} from "../../../common/constants/jwt.constant";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

    constructor(configService: ConfigService, private readonly usersRepository: UsersRepository) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.getOrThrow(JWT_CONFIG.ACCESS_TOKEN_SECRET)
        });
    }

    async validate(payload: CurrentUserDto) {
        const user = await this.usersRepository.findUser({_id: payload._id});
        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        return payload;
    }
}