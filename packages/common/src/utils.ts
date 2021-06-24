import si from "systeminformation";
import fs from "fs";
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

export const getDefaultMacAddress = async (): Promise<string> => {
  const defaultInterfaceName = await si.networkInterfaceDefault();
  const networkInterfaces = await si.networkInterfaces();

  const defaultInterface = networkInterfaces.find(
    ({ iface }) => iface === defaultInterfaceName
  );

  return defaultInterface ? defaultInterface.mac : "";
};

export const fileExists = async (path: string) =>
  new Promise<boolean>((resolve) =>
    fs.access(path, fs.constants.F_OK, (error) =>
      error ? resolve(false) : resolve(true)
    )
  );
