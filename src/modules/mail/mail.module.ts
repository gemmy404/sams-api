import {Module} from '@nestjs/common';
import {MailService} from './mail.service';
import {MailerModule} from "@nestjs-modules/mailer";
import {ConfigService} from "@nestjs/config";
import {MAIL_CONFIG} from "../../common/constants/mail.constant";
import {join} from "path";
import {HandlebarsAdapter} from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
import {BullModule} from "@nestjs/bullmq";
import {MailProcessor} from "./mail.processor";

@Module({
    imports: [
        MailerModule.forRootAsync({
            useFactory: (configService: ConfigService) => ({
                transport: {
                    host: configService.getOrThrow<string>(MAIL_CONFIG.MAIL_HOST),
                    port: configService.getOrThrow<number>(MAIL_CONFIG.MAIL_PORT),
                    secure: true,
                    auth: {
                        user: configService.getOrThrow<string>(MAIL_CONFIG.MAIL_USER),
                        pass: configService.getOrThrow<string>(MAIL_CONFIG.MAIL_PASS)
                    },
                },
                template: {
                    dir: join(process.cwd(), 'templates'),
                    adapter: new HandlebarsAdapter(),
                    options: {
                        strict: true
                    },
                },
            }),
            inject: [ConfigService],
        }),
        BullModule.registerQueue({
            name: "mail",
        }),
    ],
    providers: [MailService, MailProcessor],
    exports: [BullModule],
})
export class MailModule {
}
