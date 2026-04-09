import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {AssignmentsRepository} from "./assignments.repository";
import {AddAssignmentRequestDto} from "./dto/add-assignment-request.dto";
import {Types} from "mongoose";
import {CoursesRepository} from "../courses/courses.repository";
import {Assignment} from "./schemas/assignments.schema";
import {AppResponseDto} from "../../common/dto/app-response.dto";
import {HttpStatusText} from "../../common/enums/http-status-text.enum";
import {AssignmentResponseDto} from "./dto/assignment-response.dto";
import {AssignmentsMapper} from "./assignments.mapper";
import {CurrentUserDto} from "../../common/dto/current-user.dto";
import {MaterialsService} from "../materials/materials.service";

@Injectable()
export class AssignmentsService {

    constructor(
        private readonly assignmentsRepository: AssignmentsRepository,
        private readonly assignmentsMapper: AssignmentsMapper,
        private readonly coursesRepository: CoursesRepository,
        private readonly materialsService: MaterialsService,
    ) {
    }

    async createAssignment(
        courseId: Types.ObjectId,
        addAssignmentRequest: AddAssignmentRequestDto
    ): Promise<AppResponseDto<AssignmentResponseDto>> {
        const savedCourse = await this.coursesRepository.findCourse({
            _id: courseId
        });
        if (!savedCourse) {
            throw new NotFoundException('Course not found');
        }

        const savedClasswork = savedCourse.classwork
            .find(cw => cw._id!.toString() === addAssignmentRequest.classworkId.toString());
        if (!savedClasswork) {
            throw new NotFoundException('Classwork not found');
        }

        if (savedClasswork.isUsed) {
            throw new BadRequestException('This classwork is already used in another assignment')
        }

        await this.coursesRepository.updateCourse(
            {
                _id: courseId,
                "classwork._id": addAssignmentRequest.classworkId,
            },
            {
                $set: {"classwork.$[elem].isUsed": true}
            },
            {
                arrayFilters: [{"elem._id": addAssignmentRequest.classworkId}],
                new: true,
            }
        );

        const createdAssignment = await this.assignmentsRepository.createAssignment({
            ...addAssignmentRequest,
            course: courseId,
        } as Assignment);

        const appResponse: AppResponseDto<AssignmentResponseDto> = {
            status: HttpStatusText.SUCCESS,
            data: this.assignmentsMapper.toAssignmentResponse(createdAssignment),
        };

        return appResponse;
    }

    async findAllAssignments(
        courseId: Types.ObjectId,
        currentUser: CurrentUserDto
    ): Promise<AppResponseDto<AssignmentResponseDto[]>> {
        await this.materialsService.authorizeCourseAccess(courseId.toString(), currentUser);

        const assignments = await this.assignmentsRepository
            .findAll({course: courseId,}, {assignmentItems: false});

        const appResponse: AppResponseDto<AssignmentResponseDto[]> = {
            status: HttpStatusText.SUCCESS,
            data: assignments.map(this.assignmentsMapper.toAssignmentResponse),
        };

        return appResponse;
    }

}
