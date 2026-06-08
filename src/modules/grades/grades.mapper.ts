import {Injectable} from "@nestjs/common";
import {GradeResponseDto} from "./dto/grade-response.dto";
import {GradeRowResponseDto} from "./dto/grade-row-response.dto";
import {MyGradeResponseDto} from "./dto/my-grade-response.dto";
import {Classwork} from "../courses/schemas/classwork.schema";
import {Grade} from "./schemas/grades.schema";
import {GradeColumnResponseDto} from "./dto/grade-column-response.dto";

@Injectable()
export class GradesMapper {

    toGradeResponse(
        grades: GradeRowResponseDto[],
        maxScoresMap: Map<string, Grade>,
        classworks: Classwork[]
    ): GradeResponseDto {
        const processedRows = grades.map(row => {
            const studentGrades = new Map<string, number | null>();
            type GradesRecord = Record<string, number | null>;

            classworks.forEach(cw => {
                let actualScore: number | undefined = row.grades[cw._id!.toString()] || 0;
                if (row.grades[cw._id!.toString()] === undefined) {

                    actualScore = undefined;
                    console.log("actualScore", actualScore);
                }

                const maxScore: number = maxScoresMap.get(cw._id!.toString())?.maxScore || 1;
                const weight: number = cw.points;

                const weightedScore = actualScore !== undefined ? (actualScore / maxScore) * weight : null;
                studentGrades.set(cw._id!.toString(),
                    actualScore !== undefined && maxScore
                        ? Number(weightedScore!.toFixed(1))
                        : null
                );
            });

            return {
                ...row,
                grades: Object.fromEntries(studentGrades) as GradesRecord,
            }
        });

        return {
            columns: [
                {
                    key: 'student.academicId',
                    name: 'ID'
                },
                {
                    key: 'student.name',
                    name: 'Name'
                },
                ...classworks.map(this.toGradeColumnResponse)
            ],
            rows: processedRows
        };
    }

    toGradeColumnResponse(this: void, classworks: Classwork): GradeColumnResponseDto {
        return {
            key: classworks._id!.toString(),
            name: classworks.name,
            points: classworks.points,
            isVisible: classworks.isVisible,
        }
    }

    toMyGradeResponse(
        this: void,
        savedGrades: Grade[],
        classworks: Classwork[]
    ): MyGradeResponseDto {
        const gradesMap = new Map<string, { actualScore: number | undefined, maxScore: number }>(
            savedGrades.map(g => {
                const val = {
                    actualScore: g.score >= 0 ? g.score : undefined,
                    maxScore: g.maxScore || 1,
                }
                return [g.classworkId.toString(), val];
            })
        );

        return classworks.map(cw => {
            const {actualScore, maxScore} = gradesMap.get(cw._id!.toString()) || {actualScore: undefined, maxScore: 1};
            const weight = cw.points;
            const weightedScore = actualScore !== undefined? (actualScore / maxScore) * weight : null;

            return {
                classwork: cw.name,
                score: (actualScore !== undefined && cw.isVisible) ? Number(weightedScore!.toFixed(1)) : null,
                maxScore: cw.points,
                isVisible: cw.isVisible,
            }
        }) as unknown as MyGradeResponseDto;
    }
}