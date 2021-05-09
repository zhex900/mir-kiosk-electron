import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
  Handler,
} from "aws-lambda";

import { IotData } from "aws-sdk";
import { IOT_ENDPOINT } from "../constants";

const iot = new IotData({
  endpoint: IOT_ENDPOINT,
});

export const lambdaHandler: Handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    if (typeof event.body === "string") {
      const payload = JSON.parse(event.body);
      if (payload.deviceId && payload.url) {
        await new Promise((resolve, reject) => {
          const params = {
            topic: `${payload.deviceId}/loadURL`,
            payload: JSON.stringify({
              url: payload.url,
            }),
            qos: 0,
          };

          iot.publish(params, (error: any, data: any) =>
            error ? reject(error) : resolve(data)
          );
        });

        return {
          statusCode: 200,
          body: JSON.stringify({
            status: "ok",
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
