import {Injectable} from "@nestjs/common";
import {GradesService} from "./grades.service";
import {format} from "fast-csv";
import {Types} from "mongoose";
import type {Response} from "express";
import {GetEnrollmentsFilterDto} from "./dto/get-enrollments-filter.dto";
import {GradeResponseDto} from "./dto/grade-response.dto";

@Injectable()
export class GradesCsvService {

    constructor(private readonly gradesService: GradesService) {
    }

    async generateCsv(
        courseId: Types.ObjectId,
        response: Response
    ): Promise<void> {
        const data: GradeResponseDto = (await this.gradesService.getCourseGradesSheet(
            courseId,
            {sortBy: 'name', sortOrder: 'asc'} as GetEnrollmentsFilterDto,
            'ar'
        )).data;

        response.setHeader('Content-Type', 'text/csv');
        response.setHeader('Content-Disposition', `attachment; filename="grades.csv"`);

        response.write('\ufeff');

        const csvStream = format({
            headers: data.columns.map(col => col.name)
        });

        csvStream.pipe(response);

        data.rows.forEach(row => {
            const flatRow = data.columns.map(col => {
                const key = col.key;

                if (key === 'student.academicId') return row.student.academicId;
                if (key === 'student.name') return row.student.name;

                return row.grades[key] ?? '';
            });

            csvStream.write(flatRow);
        });

        csvStream.end();
    }
}