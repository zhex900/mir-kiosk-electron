import { getDeviceId, isJsonString } from "./utils";
import { TextDecoder } from "util";
import { io, iot, mqtt } from "aws-iot-device-sdk-v2";
import { MqttClientConnection } from "aws-crt/dist/native/mqtt";
import { CrtError } from "aws-crt/dist/native/error";
import { MAX_RETRY, RETRY_WAIT_TIME, CERTIFICATE, KEY } from "../constants";

let connection: MqttClientConnection;
let deviceId: string;

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

const waitForSeconds = (seconds: number): Promise<void> =>
  new Promise<void>((resolve) => {
    setTimeout(() => resolve(), seconds * 1000);
  });

export const connect = async (): Promise<MqttClientConnection> => {
  deviceId = getDeviceId();
  console.log({ deviceId }, process.env.IOT_ENDPOINT);
  return new Promise((resolve, reject) => {
    if (!process.env.IOT_ENDPOINT) {
      reject("No IoT endpoint");
    }
    const config = iot.AwsIotMqttConnectionConfigBuilder.new_mtls_builder_from_path(
      CERTIFICATE,
      KEY
    )
      .with_clean_session(true)
      .with_keep_alive_seconds(30)
      .with_client_id(deviceId)
      .with_endpoint(process.env.IOT_ENDPOINT)
      .build();

    const clientBootstrap = new io.ClientBootstrap();

    console.log("Connecting websocket...");

    const client = new mqtt.MqttClient(clientBootstrap);

    connection = client.new_connection(config);
    connection.on("connect", () => {
      console.log("connected!");
      resolve(connection);
    });
    connection.on("interrupt", async (error: CrtError) => {
      console.log(`Connection interrupted: error=${error}`);
      process.exit(0);
    });
    connection.on("resume", async (code: number, session: boolean) => {
      console.log(`Resumed: rc: ${code} existing session: ${session}`);
      process.exit(0);
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
