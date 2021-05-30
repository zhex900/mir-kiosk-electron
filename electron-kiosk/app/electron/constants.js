const DEFAULT_URL = "https://github.com";
const MAX_RETRY = 20;
const RETRY_WAIT_TIME = 3; //seconds
const KEY = `${process.env.CERT_PATH}/private.key`;
const CERTIFICATE = `${process.env.CERT_PATH}/certificate.pem`;
const PORT = 40992; // Hardcoded; needs to match webpack.development.js and package.json
const SELF_HOST = `http://localhost:${PORT}`;

module.exports = {
  DEFAULT_URL,
  MAX_RETRY,
  RETRY_WAIT_TIME,
  KEY,
  CERTIFICATE,
  SELF_HOST,
};
