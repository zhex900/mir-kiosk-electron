import * as React from "react";
import { FC, useEffect } from "react";
import desktopCapture from "./desktopCapture";

declare global {
  interface Window {
    electron: any;
  }
}

export const App: FC = () => {
  useEffect(() => {
    window.electron.ipcOn("takeDesktopCapture", function (event, arg) {
      console.log("Received takeDesktopCapture", arg);
      const { width, height } = arg;
      desktopCapture(
        window.electron.desktopCapturer,
        width,
        height,
        function (image) {
          window.electron.ipcSend("desktopCapturedImage", image);
        }
      );
    });
  }, []);
  return <div>Hello</div>;
};
