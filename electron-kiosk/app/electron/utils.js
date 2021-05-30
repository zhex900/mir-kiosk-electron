const { hostname } = require("os");

const isJsonString = (string) => {
  try {
    JSON.parse(string);
  } catch (e) {
    return false;
  }
  return true;
};

const isUrl = (string) => {
  try {
    return Boolean(new URL(string));
  } catch (e) {
    return false;
  }
};

const getDeviceId = () => {
  return hostname().toLocaleLowerCase().replace(/ /g, ".");
};

module.exports = { getDeviceId, isJsonString, isUrl };
