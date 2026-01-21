import {Injectable, Logger} from '@nestjs/common';
import {DeleteObjectCommand, PutObjectCommand, S3Client} from "@aws-sdk/client-s3";
import {ConfigService} from "@nestjs/config";
import {S3_CONFIG} from "../../common/constants/s3.constant";
import {extname} from "path";
import * as crypto from "node:crypto";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";

@Injectable()
export class S3Service {

    private readonly s3Client: S3Client;
    private readonly bucket: string;
    private readonly logger = new Logger(S3Service.name);

    constructor(private readonly configService: ConfigService) {
        this.s3Client = new S3Client({
            region: this.configService.getOrThrow(S3_CONFIG.REGION),
            credentials: {
                accessKeyId: this.configService.getOrThrow(S3_CONFIG.ACCESS_KEY),
                secretAccessKey: this.configService.getOrThrow(S3_CONFIG.SECRET_ACCESS_KEY),
            },
        });

        this.bucket = configService.getOrThrow(S3_CONFIG.BUCKET_NAME);
    }

    async generateUploadUrl(
        fileName: string,
        contentType: string,
        folderName: string,
        userId: string
    ) {
        const key = `${folderName}/${userId}_${crypto.randomBytes(2).toString('hex')}${extname(fileName)}`;

        const command = new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            ContentType: contentType,
        });

        const uploadUrl: string = await getSignedUrl(this.s3Client, command, {expiresIn: 300});

        return {
            key,
            uploadUrl,
        };
    }

    async deleteFile(key: string) {
        const params = {
            Bucket: this.bucket,
            Key: key,
        };

        try {
            await this.s3Client.send(new DeleteObjectCommand(params));
        } catch (err) {
            this.logger.error('Error deleting file from S3', err.stack);
            throw err;
        }
    }

}
