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
import {GradesModule} from "../grades/grades.module";
import {InstructorGradeController} from "./instructor-grade.controller";
import {InstructorAssignmentController} from "./instructor-assignment.controller";
import {AssignmentsModule} from "../assignments/assignments.module";
import {AssignmentSubmissionsModule} from "../assignment-submissions/assignment-submissions.module";
import {InstructorAssignmentSubmissionsController} from "./instructor-assignment-submissions.controller";
import {SimilarityModule} from "../similarity/similarity.module";

@Module({
    imports: [
        CoursesModule,
        MaterialsModule,
        QuizzesModule,
        QuestionsModule,
        QuizSubmissionsModule,
        AnnouncementsModule,
        GradesModule,
        AssignmentsModule,
        AssignmentSubmissionsModule,
        SimilarityModule,
    ],
    controllers: [
        InstructorCourseController,
        InstructorMaterialController,
        InstructorQuizController,
        InstructorQuestionsController,
        InstructorQuizSubmissionController,
        InstructorAnnouncementController,
        InstructorGradeController,
        InstructorAssignmentController,
        InstructorAssignmentSubmissionsController,
    ]
})
export class InstructorModule {
}
