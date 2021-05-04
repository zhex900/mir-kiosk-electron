import macAddress from "macaddress";
import os from "os";

export const isJsonString = (string: string): boolean => {
  try {
    JSON.parse(string);
  } catch (e) {
    return false;
  }
  return true;
};

export const isUrl = (string: string): boolean => {
  try {
    return Boolean(new URL(string));
  } catch (e) {
    return false;
  }
};

export const getDeviceId = async (): Promise<string> =>
  `${os.hostname()}-${await macAddress.one()}`
    .toLocaleLowerCase()
    .replace(/ /g, ".");
