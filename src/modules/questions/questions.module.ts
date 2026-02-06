import {forwardRef, Module} from '@nestjs/common';
import {QuestionsService} from './questions.service';
import {MongooseModule} from "@nestjs/mongoose";
import {Question, QuestionSchema} from "./schemas/questions.schema";
import {QuestionsRepository} from "./questions.repository";
import {QuizzesModule} from "../quiz/quizzes.module";
import {MaterialsModule} from "../materials/materials.module";
import {QuestionsMapper} from "./questions.mapper";

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: Question.name, schema: QuestionSchema},
        ]),
        forwardRef(() => QuizzesModule),
        MaterialsModule,
    ],
    providers: [QuestionsRepository, QuestionsService, QuestionsMapper],
    exports: [QuestionsRepository, QuestionsService, QuestionsMapper],
})
export class QuestionsModule {
}
