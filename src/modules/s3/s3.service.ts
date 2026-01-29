import {Injectable, Logger} from '@nestjs/common';
import {
    DeleteObjectCommand,
    DeleteObjectsCommand,
    DeleteObjectsCommandOutput,
    GetObjectCommand,
    PutObjectCommand,
    S3Client
} from "@aws-sdk/client-s3";
import {ConfigService} from "@nestjs/config";
import {S3_CONFIG} from "../../common/constants/s3.constant";
import {extname} from "path";
import * as crypto from "node:crypto";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";
import {getStaticUrl} from "../../common/utils/get-static-url.util";
import {CreateUploadUrlResponseDto} from "./dto/create-upload-url-response.dto";

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
        fileNamePrefix: string,
    ): Promise<CreateUploadUrlResponseDto> {
        const key = `${folderName}/${fileNamePrefix}_${crypto.randomBytes(3).toString('hex')}${extname(fileName)}`;

        const command = new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            ContentType: contentType,
        });

        const uploadUrl: string = await getSignedUrl(this.s3Client, command, {expiresIn: 300});

        return {
            originalFileName: fileName,
            key,
            uploadUrl,
        };
    }

    async getFileUrl(objectKey: string, isPrivate: boolean = true) {
        if (isPrivate) {
            const command = new GetObjectCommand({
                Bucket: this.bucket,
                Key: objectKey,
            });

            return await getSignedUrl(this.s3Client, command, {expiresIn: 3600});
        }

        return getStaticUrl(objectKey);
    }

    async deleteFile(key: string): Promise<void> {
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

    async deleteMultipleFiles(keys: { Key: string }[]): Promise<DeleteObjectsCommandOutput> {
        const command = new DeleteObjectsCommand({
            Bucket: this.bucket,
            Delete: {
                Objects: keys,
                Quiet: true,
            },
        });

        try {
            const response: DeleteObjectsCommandOutput = await this.s3Client.send(command);
            if (response.Errors && response.Errors.length > 0) {
                this.logger.error(`Some files failed to delete: ${JSON.stringify(response.Errors)}`);
            }
            return response;
        } catch (err) {
            this.logger.error('Error executing multi-object delete', err);
            throw err;
        }
    }

}
