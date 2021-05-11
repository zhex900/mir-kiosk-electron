import { machineId } from "node-machine-id";
import { hostname } from "os";

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

export const getDeviceId = async (): Promise<string> => {
  return `${hostname()}-${await machineId(true)}`
    .toLocaleLowerCase()
    .replace(/ /g, ".");
};
