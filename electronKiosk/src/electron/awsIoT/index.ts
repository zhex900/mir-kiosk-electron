import { platform } from "os";
import { setSubscriptions } from "./windowsSockets";
import { loadURL, validateScreenContent } from "../browserWindow";

const subscriptions = [loadURL, validateScreenContent];

export const startAwsIoT = async () => {
  if (platform() === "win32") {
    setSubscriptions(subscriptions);
  } else {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { setSubscriptions } = require("../../../awsIoT/src");
    setSubscriptions(subscriptions);
  }
};
