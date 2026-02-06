import {Module} from '@nestjs/common';
import {QuizzesService} from './quizzes.service';
import {QuizzesController} from './quizzes.controller';
import {Quiz, QuizSchema} from "./schemas/quizzes.schema";
import {MongooseModule} from "@nestjs/mongoose";
import {QuizzesMapper} from "./quizzes.mapper";
import {QuizzesRepository} from "./quizzes.repository";
import {MaterialsModule} from "../materials/materials.module";
import {QuestionsModule} from "../questions/questions.module";
import {QuizSubmissionsModule} from "../quiz-submissions/quiz-submissions.module";

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: Quiz.name, schema: QuizSchema},
        ]),
        MaterialsModule,
        QuestionsModule,
        QuizSubmissionsModule,
    ],
    controllers: [QuizzesController],
    providers: [QuizzesService, QuizzesRepository, QuizzesMapper],
    exports: [QuizzesRepository, QuizzesService, QuizzesMapper]
})
export class QuizzesModule {
}
