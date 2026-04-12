import {forwardRef, Module} from '@nestjs/common';
import {CoursesService} from './courses.service';
import {MongooseModule} from "@nestjs/mongoose";
import {Course, CourseSchema} from "./schemas/courses.schema";
import {CoursesRepository} from "./courses.repository";
import {CoursesMapper} from "./courses.mapper";
import {EnrollmentsModule} from "../enrollments/enrollments.module";
import {S3Module} from "../s3/s3.module";
import { CoursesController } from './courses.controller';

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: Course.name, schema: CourseSchema},
        ]),
        forwardRef(() => EnrollmentsModule),
        S3Module,
    ],
    providers: [CoursesService, CoursesRepository, CoursesMapper],
    controllers: [CoursesController],
    exports: [CoursesRepository, CoursesService, CoursesMapper],
})
export class CoursesModule {
}
