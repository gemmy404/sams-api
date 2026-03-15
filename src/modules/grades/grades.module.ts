import {Module} from '@nestjs/common';
import {GradesService} from './grades.service';
import {GradesController} from './grades.controller';
import {MongooseModule} from "@nestjs/mongoose";
import {Grade, GradeSchema} from "./schemas/grades.schema";
import {GradesRepository} from "./grades.repository";
import {CoursesModule} from "../courses/courses.module";
import {EnrollmentsModule} from "../enrollments/enrollments.module";
import {GradesMapper} from "./grades.mapper";
import {MaterialsModule} from "../materials/materials.module";
import {GradesCsvService} from "./grades-csv.service";

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: Grade.name, schema: GradeSchema}
        ]),
        CoursesModule,
        EnrollmentsModule,
        MaterialsModule,
    ],
    controllers: [GradesController],
    providers: [GradesRepository, GradesService, GradesCsvService,GradesMapper],
    exports: [GradesRepository, GradesService, GradesCsvService]
})
export class GradesModule {
}
