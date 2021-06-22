import { mqtt, io, iot, iotidentity } from "aws-iot-device-sdk-v2";
import {
  CA_PATH,
  CLAIM_CERT_KEY,
  CLAIM_CERT_PATH,
  TEMPLATE_NAME,
  DEVICE_KEY_PATH,
  DEVICE_CERTIFICATE_PATH,
} from "common/constants";
import fs from "fs";

async function acquireDeviceCerts(identity: iotidentity.IotIdentityClient) {
  return new Promise(async (resolve, reject) => {
    try {
      console.log(
        "Subscribing to CreateKeysAndCertificate Accepted and Rejected topics.."
      );

      const keysSubRequest: iotidentity.model.CreateKeysAndCertificateSubscriptionRequest =
        {};

      await identity.subscribeToCreateKeysAndCertificateAccepted(
        keysSubRequest,
        mqtt.QoS.AtLeastOnce,

        (
          error?: iotidentity.IotIdentityError,
          response?: iotidentity.model.CreateKeysAndCertificateResponse
        ) => {
          if (response) {
            console.log(
              "CreateKeysAndCertificateResponse for certificateId=" +
                response.certificateId
            );
            console.log(
              "save cert",
              response.certificatePem,
              response.privateKey
            );

            fs.writeFileSync(DEVICE_KEY_PATH, response.privateKey || "");
            fs.writeFileSync(
              DEVICE_CERTIFICATE_PATH,
              response.certificatePem || ""
            );
          }

          if (error || !response) {
            console.log("Error occurred..");
            reject(error);
          } else {
            resolve(response.certificateOwnershipToken);
          }
        }
      );

      await identity.subscribeToCreateKeysAndCertificateRejected(
        keysSubRequest,
        mqtt.QoS.AtLeastOnce,

        (
          error?: iotidentity.IotIdentityError,
          response?: iotidentity.model.ErrorResponse
        ) => {
          if (response) {
            console.log(
              "CreateKeysAndCertificate ErrorResponse for " +
                " statusCode=:" +
                response.statusCode +
                " errorCode=:" +
                response.errorCode +
                " errorMessage=:" +
                response.errorMessage
            );
          }
          if (error) {
            console.log("Error occurred..");
          }
          reject(error);
        }
      );

      console.log("Publishing to CreateKeysAndCertificate topic..");
      const keysRequest: iotidentity.model.CreateKeysAndCertificateRequest = {
        toJSON() {
          return {};
        },
      };

      await identity.publishCreateKeysAndCertificate(
        keysRequest,
        mqtt.QoS.AtLeastOnce
      );
    } catch (error) {
      reject(error);
    }
  });
}

async function registerThing(
  identity: iotidentity.IotIdentityClient,
  token: string,
  deviceId: string
) {
  return new Promise<void>(async (resolve, reject) => {
    try {
      console.log(
        "Subscribing to RegisterThing Accepted and Rejected topics.."
      );
      const registerThingSubRequest: iotidentity.model.RegisterThingSubscriptionRequest =
        { templateName: TEMPLATE_NAME };
      await identity.subscribeToRegisterThingAccepted(
        registerThingSubRequest,
        mqtt.QoS.AtLeastOnce,
        (
          error?: iotidentity.IotIdentityError,
          response?: iotidentity.model.RegisterThingResponse
        ) => {
          if (response) {
            console.log(
              "RegisterThingResponse for thingName=" + response.thingName
            );
          }

          if (error) {
            console.log("Error occurred..");
          }
          resolve();
        }
      );

      await identity.subscribeToRegisterThingRejected(
        registerThingSubRequest,
        mqtt.QoS.AtLeastOnce,
        (
          error?: iotidentity.IotIdentityError,
          response?: iotidentity.model.ErrorResponse
        ) => {
          if (response) {
            console.log(
              "RegisterThing ErrorResponse for " +
                "statusCode=:" +
                response.statusCode +
                "errorCode=:" +
                response.errorCode +
                "errorMessage=:" +
                response.errorMessage
            );
          }
          if (error) {
            console.log("Error occurred..");
          }
          resolve();
        }
      );

      console.log("Publishing to RegisterThing topic..");
      const map: { [key: string]: string } = {
        SerialNumber: deviceId, // thing name, @TODO change it to MacAddress
        ModelType: "IntelNuc", //@TODO add more fields
      };

      console.log("token=" + token);

      const registerThing: iotidentity.model.RegisterThingRequest = {
        parameters: map,
        templateName: TEMPLATE_NAME,
        certificateOwnershipToken: token,
      };
      await identity.publishRegisterThing(registerThing, mqtt.QoS.AtLeastOnce);
    } catch (error) {
      reject(error);
    }
  });
}

export default async (
  deviceId: string,
  iotEndpoint: string,
  debug: boolean = false
) => {
  if (debug) {
    const level: io.LogLevel = parseInt(io.LogLevel[5]);
    io.enable_logging(level);
  }

  try {
    const client_bootstrap = new io.ClientBootstrap();

    let config_builder = null;

    console.log({ CLAIM_CERT_PATH });
    config_builder =
      iot.AwsIotMqttConnectionConfigBuilder.new_mtls_builder_from_path(
        CLAIM_CERT_PATH,
        CLAIM_CERT_KEY
      );

    config_builder.with_certificate_authority_from_path(undefined, CA_PATH);

    config_builder.with_clean_session(false);
    config_builder.with_client_id(deviceId);
    config_builder.with_endpoint(iotEndpoint);

    // force node to wait 60 seconds before killing itself, promises do not keep node alive
    const timer = setTimeout(() => {}, 60 * 1000);

    const config = config_builder.build();
    const client = new mqtt.MqttClient(client_bootstrap);
    const connection = client.new_connection(config);

    const identity = new iotidentity.IotIdentityClient(connection);
    console.log("try to connect");
    const result = await connection.connect();
    console.log("result", result);

    //Keys workflow
    let token = await acquireDeviceCerts(identity);
    await registerThing(identity, token as string, deviceId);

    await connection.disconnect();
    // Allow node to die if the promise above resolved
    clearTimeout(timer);
  } catch (e) {
    console.log(e);
  }
};
