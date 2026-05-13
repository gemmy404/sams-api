import {Processor, WorkerHost} from "@nestjs/bullmq";
import {Job} from "bullmq";
import {Types} from "mongoose";
import {MeetingStatus} from "./enums/meeting-status.enum";
import {MeetingService} from "./meeting.service";
import {Logger} from "@nestjs/common";

@Processor('meeting')
export class MeetingProcessor extends WorkerHost {

    private readonly logger: Logger;

    constructor(
        private readonly meetingService: MeetingService,
    ) {
        super();
        this.logger = new Logger(MeetingProcessor.name);
    }

    async process(job: Job): Promise<any> {
        const meetingId = new Types.ObjectId(job.data.meetingId as Types.ObjectId);

        try {
            await this.meetingService.changeStatus(
                meetingId,
                {newStatus: MeetingStatus.ONGOING}
            );

            this.logger.log(`Meeting ${meetingId.toString()} is now ONGOING`);
        } catch (error) {
            this.logger.error(`Failed to start meeting ${meetingId.toString()}: ${error.message}`);
            throw error;
        }

    }
}