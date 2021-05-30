import { DesktopCapturer } from "electron";
const imageFormat = "image/jpeg";

const handleStream = ({ stream, width, height, saveImage }) => {
  // Create hidden video tag
  const video = document.createElement("video");

  video.style.cssText = "position:absolute;top:-10000px;left:-10000px;";

  // Event connected to stream
  video.onloadedmetadata = async () => {
    // Set video ORIGINAL height (screenshot)
    video.style.height = height + "px"; // videoHeight
    video.style.width = width + "px"; // videoWidth

    await video.play();

    // Create canvas
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    // Draw video on canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    if (saveImage) {
      // Save screenshot to base64
      saveImage(canvas.toDataURL(imageFormat));
    } else {
      console.log("Need callback!");
    }

    // Remove hidden video tag
    video.remove();
    try {
      // Destroy connect to stream
      stream.getTracks()[0].stop();
    } catch (e) {}
  };

  video.srcObject = stream;
};

const handleError = (e) => {
  console.log(e);
};

interface MediaTrackConstraints {
  audio: boolean;
  video: {
    mandatory?: {
      chromeMediaSource: "desktop";
      chromeMediaSourceId?: string;
    };
  };
}

interface MediaDevices {
  getUserMedia(constraints?: MediaTrackConstraints): Promise<MediaStream>;
}

const desktopCapture = (
  desktopCapturer: DesktopCapturer,
  width,
  height,
  saveImage
): void => {
  console.log({ width, height });
  desktopCapturer
    .getSources({ types: ["window", "screen"] })
    .then(async (sources) => {
      console.log(sources);

      for (const source of sources) {
        if (source.name === "Screen 1") {
          try {
            const mediaDevices = navigator.mediaDevices as MediaDevices;
            const stream = await mediaDevices.getUserMedia({
              audio: false,
              video: {
                mandatory: {
                  chromeMediaSource: "desktop",
                  chromeMediaSourceId: source.id,
                },
              },
            });

            handleStream({ stream, width, height, saveImage });
          } catch (e) {
            handleError(e);
          }
        }
      }
    });
};

export default desktopCapture;
