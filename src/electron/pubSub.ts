import { Iot } from "aws-sdk";
import { isJsonString } from "./utils";
import AWS_CONFIG from "../../.aws.json";
import { TextDecoder } from "util";
import { io, iot, mqtt } from "aws-iot-device-sdk-v2";
import { MqttClientConnection } from "aws-crt/dist/native/mqtt";

let connection: MqttClientConnection;

const getIoTEndpoint = async (): Promise<string> => {
  // Each AWS account has a unique IoT endpoint per region. We need to retrieve this value:
  const iota = new Iot({
    ...AWS_CONFIG,
  });
  const response = await iota
    .describeEndpoint({ endpointType: "iot:Data-ATS" })
    .promise();

  return response.endpointAddress;
};

export const subscribe = (
  deviceId: string,
  channel: string,
  callback: any
): void => {
  try {
    connection.subscribe(
      `${deviceId}/${channel}`,
      mqtt.QoS.AtLeastOnce,
      (topic: any, payload: any, dup: any, qos: any, retain: any) => {
        const decoder = new TextDecoder("utf8");
        const message = decoder.decode(new Uint8Array(payload));

        console.log(`Message received: topic=${topic} ${message}`);

        if (typeof callback === "function") {
          const data = isJsonString(message) ? JSON.parse(message) : message;
          callback(data);
        }
      }
    );
  } catch (e) {
    console.error(e);
  }
};

export const connect = async (
  deviceId: string
): Promise<MqttClientConnection> => {
  const iotEndpoint = await getIoTEndpoint();
  console.log(iotEndpoint);
  return new Promise((resolve, reject) => {
    const config = iot.AwsIotMqttConnectionConfigBuilder.new_with_websockets()
      .with_clean_session(true)
      .with_client_id(deviceId)
      .with_endpoint(iotEndpoint)
      .with_credentials(
        AWS_CONFIG.region,
        AWS_CONFIG.accessKeyId,
        AWS_CONFIG.secretAccessKey
      )
      .build();
    const client_bootstrap = new io.ClientBootstrap();

    console.log("Connecting websocket...");

    const client = new mqtt.MqttClient(client_bootstrap);

    connection = client.new_connection(config);
    connection.on("connect", () => {
      console.log("connected!");
      resolve(connection);
    });
    connection.on("interrupt", (error: any) => {
      console.log(`Connection interrupted: error=${error}`);
    });
    connection.on("resume", (code: any, session: any) => {
      console.log(`Resumed: rc: ${code} existing session: ${session}`);
    });
    connection.on("disconnect", () => {
      console.log("Disconnected");
    });
    connection.on("error", (error: any) => {
      console.log("failed");
      reject(error);
    });
    connection.connect();
  });
};
