import { S3 } from "aws-sdk";
export const getSignedUrl = async (
  Command: string,
  Bucket: string,
  Key: string
): Promise<string | null> => {
  const s3 = new S3({ signatureVersion: "v4" });
  try {
    return await new Promise((resolve, reject) => {
      s3.getSignedUrl(
        Command,
        {
          Bucket,
          Key,
        },
        (error: Error, url: string) => (error ? reject(error) : resolve(url))
      );
    });
  } catch (error) {
    console.error(error);
  }
  return null;
};
