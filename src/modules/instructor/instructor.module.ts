import {Module} from '@nestjs/common';
import {InstructorCourseController} from './instructor-course.controller';
import {CoursesModule} from "../courses/courses.module";
import {MaterialsModule} from "../materials/materials.module";
import {InstructorMaterialController} from "./instructor-material.controller";

@Module({
    imports: [
        CoursesModule,
        MaterialsModule
    ],
    controllers: [InstructorCourseController, InstructorMaterialController]
})
export class InstructorModule {
}
