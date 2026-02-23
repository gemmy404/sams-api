import {Controller, UseGuards} from '@nestjs/common';
import {GradesService} from './grades.service';
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";

@Controller('api/v1/grades')
@UseGuards(JwtAuthGuard)
export class GradesController {

    constructor(private readonly gradesService: GradesService) {
    }

}
