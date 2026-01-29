import {CanActivate, ExecutionContext, ForbiddenException, Injectable, NotFoundException} from "@nestjs/common";
import {Request} from "express";
import {CurrentUserDto} from "../../../common/dto/current-user.dto";
import {MaterialsRepository} from "../materials.repository";
import {Course} from "../../courses/schemas/courses.schema";

@Injectable()
export class IsMaterialOwnerGuard implements CanActivate {

    constructor(private readonly materialsRepository: MaterialsRepository) {
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request: Request = context.switchToHttp().getRequest();

        const user: CurrentUserDto = request.user as CurrentUserDto;
        const materialId: string = request.params.materialId as string;

        if (!materialId) {
            throw new ForbiddenException('Material ID is required for this action');
        }

        const savedMaterial = await this.materialsRepository.findMaterialOwner({
            _id: materialId
        });
        if (!savedMaterial) {
            throw new NotFoundException('Material not found');
        }

        const course = savedMaterial.course as unknown as Course;
        const isOwner: boolean = course.instructor._id.toString() === user._id.toString();
        if (!isOwner) {
            throw new ForbiddenException('You are not authorized to manage this course');
        }

        return true;
    }
}