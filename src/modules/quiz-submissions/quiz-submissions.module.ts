import {forwardRef, Module} from '@nestjs/common';
import {QuizSubmissionsService} from './quiz-submissions.service';
import {QuizSubmissionsController} from './quiz-submissions.controller';
import {MongooseModule} from "@nestjs/mongoose";
import {QuizSubmission, QuizSubmissionSchema} from "./schemas/quiz-submissions.schema";
import {QuizSubmissionsRepository} from "./quiz-submissions.repository";
import {QuizzesModule} from "../quiz/quizzes.module";
import {QuestionsModule} from "../questions/questions.module";

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: QuizSubmission.name, schema: QuizSubmissionSchema},
        ]),
        forwardRef(() => QuizzesModule),
        QuestionsModule,
    ],
    controllers: [QuizSubmissionsController],
    providers: [QuizSubmissionsRepository, QuizSubmissionsService],
    exports: [QuizSubmissionsRepository, QuizSubmissionsService],
})
export class QuizSubmissionsModule {
}
