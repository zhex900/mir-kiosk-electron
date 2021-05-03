import { isJsonString } from "./utils";
import { TextDecoder } from "util";
import { IoTClient, DescribeEndpointCommand } from "@aws-sdk/client-iot";
import { io, iot, mqtt } from "aws-iot-device-sdk-v2";
import { MqttClientConnection } from "aws-crt/dist/native/mqtt";
import { CrtError } from "aws-crt/dist/native/error";
import macAddress from "macaddress";
import { AWS_CONFIG } from "../constants";

let connection: MqttClientConnection;
let deviceId: string;

const getIoTEndpoint = async (): Promise<string> => {
  // Each AWS account has a unique IoT endpoint per region. We need to retrieve this value:
  const iota = new IoTClient(AWS_CONFIG);
  const response = await iota.send(
    new DescribeEndpointCommand({ endpointType: "iot:Data-ATS" }) //@TODO move to constants
  );

  return response.endpointAddress;
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

  deviceId = await macAddress.one();

  console.log({ deviceId });

  return new Promise((resolve, reject) => {
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

    const client_bootstrap = new io.ClientBootstrap();

    console.log("Connecting websocket...");

    const client = new mqtt.MqttClient(client_bootstrap);

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
      console.log("failed");
      reject(error);
    });
    connection.connect();
  });
};

export const screenCapture = async (
  browserWindow: Electron.BrowserWindow
): Promise<Buffer> => {
  const image = await browserWindow.webContents.capturePage();
  return image.toBitmap();
};
