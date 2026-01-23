import {CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException} from "@nestjs/common";
import {Reflector} from "@nestjs/core";
import {ROLES_KEY} from "../../../common/decorators/roles.decorator";
import {CurrentUserDto} from "../../../common/dto/current-user.dto";

@Injectable()
export class RolesGuard implements CanActivate {

    constructor(private reflector: Reflector) {
    }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles: string[] = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles || requiredRoles.length === 0) return true;

        const user = context.switchToHttp().getRequest().user as CurrentUserDto;

        if (!user || !user.roles || user.roles.length === 0) {
            console.log(user.roles);
            throw new ForbiddenException('Access denied: No roles assigned to user');
        }

        const roles = user.roles as string[];
        const hasRole: boolean = requiredRoles.some((role) => roles.includes(role));

        if (!hasRole) {
            throw new ForbiddenException('You do not have the necessary permissions to access this resource');
        }

        return true;
    }

}