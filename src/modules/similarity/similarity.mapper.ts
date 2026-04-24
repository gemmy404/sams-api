import {Injectable} from "@nestjs/common";
import {SimilarityReport} from "./schemas/similarity-report.schema";
import {SimilarityReportResponseDto} from "./dto/similarity-report-response.dto";
import {Users} from "../users/schemas/users.schema";
import {MatchDetails} from "./schemas/match-details.schema";
import {AssignmentSubmission} from "../assignment-submissions/schemas/assignment-submissions.schema";
import {SimilarityArrayDto} from "./dto/similarity-array.dto";
import {getStaticUrl} from "../../common/utils/get-static-url.util";
import {Assignment} from "../assignments/schemas/assignments.schema";

@Injectable()
export class SimilarityMapper {

    toSimilarityReportResponse(report: SimilarityReport): SimilarityReportResponseDto {
        const result = report.results[0];
        const student = result.student as unknown as Users;
        return {
            assignmentPlagiarismThreshold: (report.assignment as unknown as Assignment).plagiarismThreshold,
            studentName: student.name,
            similarities: this.toSimilarityArray(result.matches)
                .sort((a, b) => b.similarityPercentage - a.similarityPercentage),
        }
    }

    private toSimilarityArray(matches: MatchDetails[]) {
        const result: SimilarityArrayDto[] = [];
        matches.forEach(match => {
            if (match.comparedWithSubmission) {
                const contentReference = (match.comparedWithSubmission as unknown as AssignmentSubmission)
                    .submittedItems[0].contentReference;
                const comparative = {
                    studentName: (match.comparedWithStudent as unknown as Users).name,
                    submissionUrl: getStaticUrl(contentReference) as string,
                    similarityPercentage: +match.similarityPercentage.toFixed(0),
                }
                result.push(comparative);
            }
        })
        return result;
    }
}