export class SendMailDto {
    to: string;
    name: string;
    subject: string;
    message: string;
    otp: string;
    timeInMin: number;
}