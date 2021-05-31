const { getDeviceId, isJsonString } = require("./utils");
const { TextDecoder } = require("util");
const { io, iot, mqtt } = require("aws-iot-device-sdk-v2");
const { MAX_RETRY, RETRY_WAIT_TIME, CERTIFICATE, KEY } = require("./constants");

let connection;
let deviceId;

const publish = async (channel, payload) => {
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

const subscribe = async (callback) => {
  try {
    await connection.subscribe(
      `${deviceId}/${callback.name}`,
      mqtt.QoS.AtLeastOnce,
      async (topic, payload) => {
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

const waitForSeconds = (seconds) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(), seconds * 1000);
  });

const initConnection = async () => {
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
    connection.on("interrupt", async (error) => {
      console.log(`Connection interrupted: error=${error}`);
    });
    connection.on("resume", async (code, session) => {
      console.log(`Resumed: rc: ${code} existing session: ${session}`);
    });
    connection.on("disconnect", () => {
      console.log("Disconnected");
    });
    connection.on("error", (error) => {
      console.log("connection failed", error);
      resolve(null);
    });
    connection.connect();
  });
};

const connect = async (retryAttempt) => {
  const connection = await initConnection();
  if (!connection && retryAttempt < MAX_RETRY) {
    console.log("RETRY", retryAttempt);
    await waitForSeconds(RETRY_WAIT_TIME);
    return connect(retryAttempt + 1);
  }
  return connection;
};

const disconnect = () => connection.disconnect();

module.exports = {
  connect,
  disconnect,
  subscribe,
  publish,
};