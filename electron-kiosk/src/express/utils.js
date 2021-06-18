/* eslint-disable @typescript-eslint/no-var-requires */
const { hostname } = require("os");
const si = require("systeminformation");

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

const getDefaultMacAddress = async () => {
  const defaultInterface = await si.networkInterfaceDefault();
  const networkInterfaces = await si.networkInterfaces();

  const mac = networkInterfaces.find(
    ({ iface }) => iface === defaultInterface
  ).mac;
  console.log(mac);
  return mac;
};
module.exports = {
  getDefaultMacAddress,
  isJsonString,
  getDeviceId,
  isUrl,
};
