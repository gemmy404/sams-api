import {forwardRef, Module} from '@nestjs/common';
import {AssignmentSubmissionsService} from './assignment-submissions.service';
import {AssignmentSubmissionsController} from './assignment-submissions.controller';
import {MongooseModule} from "@nestjs/mongoose";
import {AssignmentSubmission, AssignmentSubmissionSchema} from "./schemas/assignment-submissions.schema";
import {AssignmentSubmissionsRepository} from "./assignment-submissions.repository";
import {AssignmentsModule} from "../assignments/assignments.module";
import {MaterialsModule} from "../materials/materials.module";
import {CoursesModule} from "../courses/courses.module";
import {AssignmentSubmissionsMapper} from "./assignment-submissions.mapper";

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: AssignmentSubmission.name, schema: AssignmentSubmissionSchema}
        ]),
        forwardRef(() => AssignmentsModule),
        MaterialsModule,
        CoursesModule,
    ],
    controllers: [AssignmentSubmissionsController],
    providers: [AssignmentSubmissionsRepository, AssignmentSubmissionsService, AssignmentSubmissionsMapper,],
    exports: [AssignmentSubmissionsRepository, AssignmentSubmissionsService],
})
export class AssignmentSubmissionsModule {
}
