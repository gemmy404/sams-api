import {Module} from '@nestjs/common';
import {InstructorCourseController} from './instructor-course.controller';
import {CoursesModule} from "../courses/courses.module";

@Module({
    imports: [
        CoursesModule,
    ],
    controllers: [InstructorCourseController]
})
export class InstructorModule {
}
