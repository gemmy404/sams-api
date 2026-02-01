import {Module} from '@nestjs/common';
import {InstructorCourseController} from './instructor-course.controller';
import {CoursesModule} from "../courses/courses.module";
import {MaterialsModule} from "../materials/materials.module";
import {InstructorMaterialController} from "./instructor-material.controller";
import {InstructorQuizController} from "./instructor-quiz.controller";
import {QuizzesModule} from "../quiz/quizzes.module";

@Module({
    imports: [
        CoursesModule,
        MaterialsModule,
        QuizzesModule,
    ],
    controllers: [InstructorCourseController, InstructorMaterialController, InstructorQuizController]
})
export class InstructorModule {
}
