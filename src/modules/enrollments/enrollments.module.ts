import {Module} from '@nestjs/common';
import {EnrollmentsService} from './enrollments.service';
import {EnrollmentsController} from './enrollments.controller';
import {EnrollmentsRepository} from "./enrollments.repository";
import {MongooseModule} from "@nestjs/mongoose";
import {Enrollment, EnrollmentSchema} from "./schemas/enrollments.schema";
import {CoursesModule} from "../courses/courses.module";

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: Enrollment.name, schema: EnrollmentSchema},
        ]),
        CoursesModule,
    ],
    controllers: [EnrollmentsController],
    providers: [EnrollmentsService, EnrollmentsRepository],
    exports: [EnrollmentsRepository],
})
export class EnrollmentsModule {
}
