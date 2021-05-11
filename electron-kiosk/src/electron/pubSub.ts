import { getDeviceId, isJsonString } from "./utils";
import { TextDecoder } from "util";
import { IoTClient, DescribeEndpointCommand } from "@aws-sdk/client-iot";
import { io, iot, mqtt } from "aws-iot-device-sdk-v2";
import { MqttClientConnection } from "aws-crt/dist/native/mqtt";
import { CrtError } from "aws-crt/dist/native/error";
import { AWS_CONFIG, MAX_RETRY, RETRY_WAIT_TIME } from "../constants";
console.log({ AWS_CONFIG });
let connection: MqttClientConnection;
let deviceId: string;

const getIoTEndpoint = async (): Promise<string> => {
  try {
    // Each AWS account has a unique IoT endpoint per region. We need to retrieve this value:
    const iota = new IoTClient(AWS_CONFIG);
    const response = await iota.send(
      new DescribeEndpointCommand({ endpointType: "iot:Data-ATS" }) //@TODO move to constants
    );

    return response.endpointAddress;
  } catch (e) {
    return "";
  }
};

export const publish = async (
  channel: string,
  payload: string
): Promise<void> => {
  try {
    await connection.publish(
      `${deviceId}/${channel}`,
      payload,
      mqtt.QoS.AtLeastOnce
    );
  } catch (e) {
    console.error(e);
  }
};

export const subscribe = async (
  channel: string,
  callback: any //@TODO define the type
): Promise<void> => {
  try {
    await connection.subscribe(
      `${deviceId}/${channel}`,
      mqtt.QoS.AtLeastOnce,
      async (topic: string, payload: ArrayBuffer) => {
        const decoder = new TextDecoder("utf8"); //@TODO move to constants
        const message = decoder.decode(new Uint8Array(payload));

        console.log(`Message received: topic=${topic} ${message}`);

        if (typeof callback === "function") {
          const data = isJsonString(message) ? JSON.parse(message) : message;
          callback({ deviceId, data });
        }
      }
    );
  } catch (e) {
    console.error(e);
  }
};

export const connect = async (): Promise<MqttClientConnection> => {
  const iotEndpoint = await getIoTEndpoint();

  deviceId = await getDeviceId();
  console.log({ deviceId, iotEndpoint });
  return new Promise((resolve, reject) => {
    if (
      !process.env.AWS_REGION ||
      !process.env.AWS_KEY ||
      !process.env.AWS_SECRET
    ) {
      reject("No AWS credentials");
    }
    const config = iot.AwsIotMqttConnectionConfigBuilder.new_with_websockets()
      .with_clean_session(true)
      .with_client_id(deviceId)
      .with_endpoint(iotEndpoint)
      .with_credentials(
        //@TODO replace with certs
        process.env.AWS_REGION,
        process.env.AWS_KEY,
        process.env.AWS_SECRET
      )
      .build();

    const clientBootstrap = new io.ClientBootstrap();

    console.log("Connecting websocket...");

    const client = new mqtt.MqttClient(clientBootstrap);

    connection = client.new_connection(config);
    connection.on("connect", () => {
      console.log("connected!");
      resolve(connection);
    });
    connection.on("interrupt", (error: CrtError) => {
      console.log(`Connection interrupted: error=${error}`);
    });
    connection.on("resume", (code: number, session: boolean) => {
      console.log(`Resumed: rc: ${code} existing session: ${session}`);
    });
    connection.on("disconnect", () => {
      console.log("Disconnected");
    });
    connection.on("error", (error: CrtError) => {
      console.log("connection failed", error);
      resolve(null);
    });
    connection.connect();
  });
};

const waitForSeconds = (seconds: number): Promise<void> =>
  new Promise<void>((resolve) => {
    setTimeout(() => resolve(), seconds * 1000);
  });

export const connectWithRetry = async (
  retryAttempt: number
): Promise<MqttClientConnection> => {
  const connection = await connect();
  if (!connection && retryAttempt < MAX_RETRY) {
    console.log("RETRY", retryAttempt);
    await waitForSeconds(RETRY_WAIT_TIME);
    return connectWithRetry(retryAttempt + 1);
  }
  return connection;
};
