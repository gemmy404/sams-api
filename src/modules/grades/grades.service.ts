import {Injectable} from '@nestjs/common';
import {GradesRepository} from "./grades.repository";

@Injectable()
export class GradesService {

    constructor(
        private readonly gradesRepository: GradesRepository,

    ) {
    }

}
