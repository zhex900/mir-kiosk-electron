import { resolve } from "path";
export const SCREEN_SIZE = {
  width: 500,
  height: 500,
};

export const DEFAULT_URL = "https://github.com";

export const MAX_RETRY = 20;

export const RETRY_WAIT_TIME = 3; //seconds

export const IOT_ENDPOINT =
  "a2c20hllaiyqiw-ats.iot.ap-southeast-2.amazonaws.com";

const CERT_PATH = `${__dirname}/../../awsIoT/certs`;

export const CLAIM_CERT_PATH = resolve(
  `${CERT_PATH}/claim/provisionClaim.certificate.pem`
);
export const CLAIM_CERT_KEY = resolve(
  `${CERT_PATH}/claim/provisionClaim.private.key`
);
export const CA_PATH = resolve(`${CERT_PATH}/claim/AmazonRootCA1.pem`);
export const TEMPLATE_NAME = "fleet-provisioning-template";
export const DEVICE_KEY_PATH = resolve(`${CERT_PATH}/device/devicePrivate.key`);
export const DEVICE_CERTIFICATE_PATH = resolve(
  `${CERT_PATH}/device/deviceCertificate.pem`
);
