export const SCREEN_SIZE = {
  width: 500,
  height: 500,
};

export const DEFAULT_URL = "https://github.com";

export const AWS_CONFIG = {
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_KEY,
    secretAccessKey: process.env.AWS_SECRET,
  },
};

export const MAX_RETRY = 20;

export const RETRY_WAIT_TIME = 3; //seconds

export const KEY = "/snap/mir-kiosk-electron/certs/private.key";
export const CERTIFICATE = "/snap/mir-kiosk-electron/certificate.pem";
