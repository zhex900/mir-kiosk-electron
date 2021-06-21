import si from "systeminformation";

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
  const defaultInterface = await si.networkInterfaceDefault();
  const networkInterfaces = await si.networkInterfaces();

  const mac = networkInterfaces.find(
    ({ iface }) => iface === defaultInterface
  ).mac;
  console.log(mac);
  return mac;
};
