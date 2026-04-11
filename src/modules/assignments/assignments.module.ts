import {Module} from '@nestjs/common';
import {AssignmentsService} from './assignments.service';
import {AssignmentsController} from './assignments.controller';
import {MongooseModule} from "@nestjs/mongoose";
import {Assignment, AssignmentSchema} from "./schemas/assignments.schema";
import {AssignmentsRepository} from "./assignments.repository";
import {AssignmentsMapper} from "./assignments.mapper";
import {CoursesModule} from "../courses/courses.module";
import {MaterialsModule} from "../materials/materials.module";
import {S3Module} from "../s3/s3.module";

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: Assignment.name, schema: AssignmentSchema},
        ]),
        CoursesModule,
        MaterialsModule,
        S3Module,
    ],
    controllers: [AssignmentsController],
    providers: [AssignmentsRepository, AssignmentsService, AssignmentsMapper],
    exports: [AssignmentsRepository, AssignmentsService],
})
export class AssignmentsModule {
}
