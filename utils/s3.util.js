import { S3Client } from "@aws-sdk/client-s3";
const dotenv = await import("dotenv");
dotenv.config();

const config = {
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
};
const s3 = new S3Client(config);

export default s3;
