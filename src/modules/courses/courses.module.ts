import {Module} from '@nestjs/common';
import {CoursesService} from './courses.service';
import {InstructorCourseController} from '../instructor/instructor-course.controller';
import {MongooseModule} from "@nestjs/mongoose";
import {Course, CourseSchema} from "./schemas/courses.schema";
import {CoursesRepository} from "./courses.repository";
import {CoursesMapper} from "./courses.mapper";

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: Course.name, schema: CourseSchema},
        ]),
    ],
    controllers: [InstructorCourseController],
    providers: [CoursesService, CoursesRepository, CoursesMapper],
    exports: [CoursesRepository, CoursesService, CoursesMapper],
})
export class CoursesModule {
}
