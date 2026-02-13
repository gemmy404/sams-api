import {Module} from '@nestjs/common';
import {InstructorCourseController} from './instructor-course.controller';
import {CoursesModule} from "../courses/courses.module";
import {MaterialsModule} from "../materials/materials.module";
import {InstructorMaterialController} from "./instructor-material.controller";
import {InstructorQuizController} from "./instructor-quiz.controller";
import {QuizzesModule} from "../quiz/quizzes.module";
import {InstructorQuestionsController} from "./instructor-questions.controller";
import {QuestionsModule} from "../questions/questions.module";
import {InstructorQuizSubmissionController} from "./instructor-quiz-submission.controller";
import {QuizSubmissionsModule} from "../quiz-submissions/quiz-submissions.module";
import {InstructorAnnouncementController} from "./instructor-announcement.controller";
import {AnnouncementsModule} from "../announcements/announcements.module";

@Module({
    imports: [
        CoursesModule,
        MaterialsModule,
        QuizzesModule,
        QuestionsModule,
        QuizSubmissionsModule,
        AnnouncementsModule,
    ],
    controllers: [
        InstructorCourseController,
        InstructorMaterialController,
        InstructorQuizController,
        InstructorQuestionsController,
        InstructorQuizSubmissionController,
        InstructorAnnouncementController,
    ]
})
export class InstructorModule {
}
