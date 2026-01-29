import {Module} from '@nestjs/common';
import {MaterialsService} from './materials.service';
import {MaterialsController} from './materials.controller';
import {MongooseModule} from "@nestjs/mongoose";
import {Material, MaterialSchema} from "./schemas/materials.schema";
import {MaterialsRepository} from "./materials.repository";
import {CoursesModule} from "../courses/courses.module";
import {S3Module} from "../s3/s3.module";
import {MaterialsMapper} from "./materials.mapper";
import {EnrollmentsModule} from "../enrollments/enrollments.module";

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: Material.name, schema: MaterialSchema},
        ]),
        CoursesModule,
        S3Module,
        EnrollmentsModule,
    ],
    controllers: [MaterialsController],
    providers: [MaterialsService, MaterialsRepository, MaterialsMapper],
    exports: [MaterialsService, MaterialsRepository],
})
export class MaterialsModule {
}
