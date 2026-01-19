import {Processor, WorkerHost} from "@nestjs/bullmq";
import {Job} from "bullmq";
import {SendMailDto} from "./dto/send-mail.dto";
import {MailService} from "./mail.service";

@Processor('mail')
export class MailProcessor extends WorkerHost {

    constructor(private readonly mailService: MailService) {
        super();
    }

    async process(job: Job, token?: string): Promise<any> {
        console.log("Token", token);
        const mailDetails: SendMailDto = job.data as SendMailDto;

        await this.mailService.sendMail(mailDetails);
    }

}