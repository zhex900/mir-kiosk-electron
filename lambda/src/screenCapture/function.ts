import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from "aws-lambda";
import { IotData } from "aws-sdk";
import { IOT_ENDPOINT } from "../constants";
import { getSignedUrl } from "../utils";

const iot = new IotData({
  endpoint: IOT_ENDPOINT,
});

export const lambdaHandler: Handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    if (typeof event.body === "string") {
      const payload = JSON.parse(event.body);
      if (payload.deviceId) {
        const Key = `${
          payload.deviceId
        }/${new Date().getTime()}-screenshot.jpeg`;

        await new Promise(async (resolve, reject) => {
          const url = await getSignedUrl("putObject", payload.S3Bucket, Key);
          if (!url) {
            reject("Error in signed URL");
          }

          const params = {
            topic: `${payload.deviceId}/screenCapture`,
            payload: JSON.stringify({
              ...payload,
              url,
            }),
            qos: 0,
          };

          iot.publish(params, (error: any, data: any) =>
            error ? reject(error) : resolve(data)
          );
        });

        const url = await getSignedUrl("getObject", payload.S3Bucket, Key);
        return {
          statusCode: 200,
          body: JSON.stringify({
            url,
          }),
        };
      }
    }

    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Wrong payload",
      }),
    };
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error,
      }),
    };
  }
};
