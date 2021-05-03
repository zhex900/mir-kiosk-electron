// const path = require("path");
import fs from "fs";

module.exports.screenCapture = (browserView) => () => {
  //start capturing the window
  browserView.webContents.capturePage().then((image) => {
    //writing  image to the disk
    fs.writeFile(`screenshot.png`, image.toPNG(), (err) => {
      if (err) throw err;
      console.log("Image Saved");
    });
  });
  // return the image
};
