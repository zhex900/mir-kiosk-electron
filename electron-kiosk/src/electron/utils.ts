import { osInfo } from "systeminformation";

// macAddress.all().then((a) => console.log(a));
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
  const { serial, hostname } = await osInfo();
  return `${hostname}-${serial}`.toLocaleLowerCase().replace(/ /g, ".");
};
