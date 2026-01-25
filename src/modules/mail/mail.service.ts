import {BadRequestException, Injectable} from '@nestjs/common';
import {MailerService} from "@nestjs-modules/mailer";
import {ConfigService} from "@nestjs/config";
import {join} from "path";
import * as process from "node:process";
import {MAIL_CONFIG} from "../../common/constants/mail.constant";
import {SendMailDto} from "./dto/send-mail.dto";

@Injectable()
export class MailService {

    constructor(
        private readonly mailerService: MailerService,
        private readonly configService: ConfigService,
    ) {
    }

    async sendMail(sendMailDto: SendMailDto): Promise<void> {
        try {
            await this.mailerService.sendMail({
                subject: sendMailDto.subject,
                to: sendMailDto.to,
                from: this.configService.getOrThrow<string>(MAIL_CONFIG.MAIL_USER),
                template: join(process.cwd(), 'dist', 'templates', 'verification-mail.hbs'),
                context: {
                    subject: sendMailDto.subject,
                    name: sendMailDto.name,
                    message: sendMailDto.message,
                    otp: sendMailDto.otp,
                    timeInMin: sendMailDto.timeInMin,
                },
            });
        } catch (err) {
            throw new BadRequestException(`Sending mail failed: ${err.message}`);
        }
    }
}
