import {Injectable} from "@nestjs/common";
import {GradeResponseDto} from "./dto/grade-response.dto";
import {GradeRowResponseDto} from "./dto/grade-row-response.dto";
import {ClassworkResponseDto} from "../courses/dto/classwork-response.dto";

@Injectable()
export class GradesMapper {

    toGradeResponse(this: void, grades: GradeRowResponseDto[], classworks: ClassworkResponseDto[]): GradeResponseDto {
        const processedRows = grades.map(row => {
            const studentGrades = new Map<string, number | null>();
            type GradesRecord = Record<string, number | null>;

            classworks.forEach(cw => {
                studentGrades.set(cw._id, row.grades[cw._id] !== undefined ?
                    row.grades[cw._id] : null
                );
            });

            return {
                ...row,
                grades: Object.fromEntries(studentGrades) as GradesRecord,
            }
        });

        return {
            columns: classworks,
            rows: processedRows
        };
    }
}