import {forwardRef, Module} from '@nestjs/common';
import {AssignmentSubmissionsService} from './assignment-submissions.service';
import {AssignmentSubmissionsController} from './assignment-submissions.controller';
import {MongooseModule} from "@nestjs/mongoose";
import {AssignmentSubmission, AssignmentSubmissionSchema} from "./schemas/assignment-submissions.schema";
import {AssignmentSubmissionsRepository} from "./assignment-submissions.repository";
import {AssignmentsModule} from "../assignments/assignments.module";
import {MaterialsModule} from "../materials/materials.module";

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: AssignmentSubmission.name, schema: AssignmentSubmissionSchema}
        ]),
        forwardRef(() => AssignmentsModule),
        MaterialsModule,
    ],
    controllers: [AssignmentSubmissionsController],
    providers: [AssignmentSubmissionsRepository, AssignmentSubmissionsService],
    exports: [AssignmentSubmissionsRepository, AssignmentSubmissionsService],
})
export class AssignmentSubmissionsModule {
}
