import { BrowserWindow } from "electron";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { publish } from "./pubSub";
import { AWS_CONFIG, SCREEN_SIZE, SCREENSHOT_S3_BUCKET } from "../constants";
import { isUrl } from "./utils";

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;

interface data {
  data: {
    url?: string;
  };
  deviceId: string;
}

export const createBrowserWindow = async (): Promise<Electron.BrowserWindow> => {
  // Create the browser window.
  let browserWindow = new BrowserWindow({
    ...SCREEN_SIZE,
    frame: false,
    show: false,
  });

  browserWindow.once("ready-to-show", () => {
    browserWindow.show();
    browserWindow.maximize();
  });

  //garbage collection handle
  browserWindow.on("close", function () {
    browserWindow = null;
  });

  // and load the index.html of the app.
  await browserWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  return browserWindow;
};

export const loadURL = (browserWindow: Electron.BrowserWindow) => async ({
  data: { url },
}: data): Promise<void> => {
  console.log({ url });
  if (isUrl(url)) {
    await browserWindow.loadURL(url);
  }
};

export const screenCapture = (browserWindow: Electron.BrowserWindow) => async ({
  deviceId,
}: data): Promise<void> => {
  const s3 = new S3Client(AWS_CONFIG);
  const image = await browserWindow.webContents.capturePage();
  try {
    const imageName = `${deviceId}/screenshot.png`;
    const response = await s3.send(
      new PutObjectCommand({
        Bucket: SCREENSHOT_S3_BUCKET,
        Key: imageName,
        Body: image.toPNG(),
        ContentType: "image/png",
      })
    );

    if (response["$metadata"].httpStatusCode === 200) {
      const url = await getSignedUrl(
        s3,
        new GetObjectCommand({
          Bucket: SCREENSHOT_S3_BUCKET,
          Key: imageName,
        }),
        { expiresIn: 3600 }
      );
      //@TODO move to constants
      await publish("screenCaptureResult", JSON.stringify({ url }));
    } else {
      await publish("screenCaptureResult", JSON.stringify({ error: response }));
    }
  } catch (error) {
    console.error(error);
    await publish("screenCaptureResult", JSON.stringify({ error }));
  }
};
