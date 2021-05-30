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
        const path = `${payload.deviceId}/${new Date().getTime()}`;
        type Keys = {
          [key: string]: string;
        };
        const keys: Keys = {
          expected: `${path}/expected.png`,
          actual: `${path}/actual.png`,
          difference: `${path}/difference.png`,
        };
        type SignedURLs = {
          [key: string]: string;
        };
        const putSignedURLs: SignedURLs = {};
        const getSignedURLs: SignedURLs = {};
        await new Promise(async (resolve, reject) => {
          await Promise.all(
            Object.keys(keys).map(async (key) => {
              putSignedURLs[key] = <string>(
                await getSignedUrl("putObject", payload.S3Bucket, keys[key])
              );
              if (!putSignedURLs[key]) {
                reject("Error in signed URL");
              }
            })
          );
          console.log({ putSignedURLs });
          const params = {
            topic: `${payload.deviceId}/validateScreenContent`,
            payload: JSON.stringify({
              ...payload,
              putSignedURLs,
            }),
            qos: 0,
          };

          iot.publish(params, (error: any, data: any) =>
            error ? reject(error) : resolve(data)
          );
        });

        await Promise.all(
          Object.keys(keys).map(async (key) => {
            getSignedURLs[key] = <string>(
              await getSignedUrl("getObject", payload.S3Bucket, keys[key])
            );
          })
        );
        console.log({ getSignedURLs });
        // const url = await getSignedUrl("getObject", payload.S3Bucket, Key);
        return {
          statusCode: 200,
          body: JSON.stringify({
            ...getSignedURLs,
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
