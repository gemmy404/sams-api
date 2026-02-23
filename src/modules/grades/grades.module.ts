import {Module} from '@nestjs/common';
import {GradesService} from './grades.service';
import {GradesController} from './grades.controller';
import {MongooseModule} from "@nestjs/mongoose";
import {Grade, GradeSchema} from "./schemas/grades.schema";
import {GradesRepository} from "./grades.repository";
import {CoursesModule} from "../courses/courses.module";
import {EnrollmentsModule} from "../enrollments/enrollments.module";
import {GradesMapper} from "./grades.mapper";

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: Grade.name, schema: GradeSchema}
        ]),
        CoursesModule,
        EnrollmentsModule,
    ],
    controllers: [GradesController],
    providers: [GradesRepository, GradesService, GradesMapper],
    exports: [GradesRepository, GradesService]
})
export class GradesModule {
}
