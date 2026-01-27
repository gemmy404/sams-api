import * as process from "node:process";

export const getStaticUrl = (objectKey: string) => {
    const baseCloudFrontUrl = process.env.BASE_CLOUDFRONT_URL;
    return baseCloudFrontUrl ? `${baseCloudFrontUrl}/${objectKey}` : null;
}