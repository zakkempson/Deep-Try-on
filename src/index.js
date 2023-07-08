import * as deepar from "deepar";
import platform from "platform";
import { CircularProgressBar } from "./circularProgressBar.js";
import QRCode from "qrcode";

const VIDEO_TIME_LIMIT_SECONDS = 10;
let queryString = window.location.search;
let params = new URLSearchParams(queryString);
let id = params.get('id');
console.log(id);
let effect = {};
let effects = {
  effect1: {
    trigger: "effect1",
    path: "assets/effects/prada-glasses.deepar",
    name: "Prada Glasses"
  }
};

const products = [
  {
    id: 1,
    productName: "Prada Glasses",
    img: "assets/images/tryon/prada.jpg",
    price: 199,
    effect1: {
      trigger: "effect1",
      path: "assets/effects/prada-glasses.deepar",
      name: "Prada Glasses",
    },
    desc: "Made from high-quality fabrics, this hoodie provides a comfortable and breathable experience, ensuring you stay cool and confident throughout the day. Its soft texture and exceptional durability make it a reliable and long-lasting addition to your wardrobe.",
    likes: 220,
  },
  {
    id: 2,
    productName: "Airmax Nike shoes",
    img: "assets/images/tryon/airmax-shoe2.jpg",
    price: 299,
    effect1: {
      trigger: "effect1",
      path: "assets/effects/airmax.deepar",
      name: "Airmax Nike shoes",
    },
    desc: "Designed with the iconic Airmax cushioning system, these shoes offer exceptional comfort and impact absorption. The advanced cushioning technology provides a responsive and supportive feel, allowing you to stay comfortable and confident during your workouts or everyday activities.",
    likes: 123,
  },
  {
    id: 3,
    productName: "Black Jens Hat",
    img: "assets/images/tryon/jens-hat.jpg",
    price: 99,
    effect1: {
      trigger: "effect1",
      path: "assets/effects/simple-hat.deepar",
      name: "Black Jens Hat",
    },
    desc: "With its timeless black color, the Black Jens Hat effortlessly complements any outfit, making it a versatile addition to your wardrobe. Step up your fashion game with this stylish and reliable hoodie that is sure to make a statement wherever you go.",
    likes: 267,
  },
];

function filterArray(){
  effect = products.filter((product)=>
    product.id == id
  ) 
}

// async function fetchJSONData() {
//   let products = [];
//   try {
//     const response = await fetch('assets/json/effects.json');
//     const data = await response.json();
//     products = data.products;
//     console.log(products);
//   } catch (error) {
//     console.error('Error fetching JSON data:', error);
//   }

//   let product = products.find((product) => {
//     return product.id == id;
//   });

//   effect = product.effect1;
//   effects = {
//     effect1: effect
//   };
// }

// async function fetchDataAndAssignEffect() {
//   try {
//     await fetchJSONData();
//     console.log(effect);
//     console.log(effects);
//   } catch (error) {
//     console.log("error in effects"+error);
//     // Handle error if needed
//   }
// }

// fetchDataAndAssignEffect();

async function main() {
  initialLoading();
  const loadingProgressBar = document.getElementById("loading-progress-bar");
  loadingProgressBar.style.width = "100%";

  const main = document.getElementById("main");
  main.style.visibility = "visible";

  let faceTracked = false;
  let currentCarouselIndex = 0;

  const canvas = document.getElementById("deepar-canvas");
  var appendSeconds = document.getElementById("seconds");
  const recordingStatus = document.getElementById("recording-status");
  const recordingStateCanvas = document.getElementById(
    "recording-status-canvas"
  );

  const pixelRatio = window.devicePixelRatio || 1; // avoid a blurry canvas on high DPI screens
  const width = Math.min(recordingStateCanvas.width * pixelRatio);
  const height = Math.min(recordingStateCanvas.height * pixelRatio);
  recordingStateCanvas.width = width;
  recordingStateCanvas.height = height;

  let seconds = 0;
  let isRecording = false;
  let recordingStarted;

  function setUiScreen(screen) {
    console.log("setUiScreen", screen);
    var loadingScreen = document.getElementById("loading");
    var arScreen = document.getElementById("ar-screen");
    const shareImageScreen = document.getElementById("share-image");
    const shareVideoScreen = document.getElementById("share-video");
    const permissionDeniedScreen = document.getElementById("permission-denied");

    const main = document.getElementById("main");
    if (main.style.visibility === "hidden") {
      return;
    }

    const switchScreens = (newScreen = "loading") => {
      loadingScreen.style.visibility =
        newScreen === "loading" ? "visible" : "hidden";
      arScreen.style.visibility =
        newScreen === "ar-screen" ? "visible" : "hidden";
      shareImageScreen.style.visibility =
        newScreen === "share-image" ? "visible" : "hidden";
      shareVideoScreen.style.visibility =
        newScreen === "share-video" ? "visible" : "hidden";
      permissionDeniedScreen.style.visibility =
        newScreen === "permission-denied" ? "visible" : "hidden";
    };

    switchScreens(screen);
  }
  setUiScreen("loading");

  let recordingStateCtx;
  let circularProgressBar;

  const initProgressBar = () => {
    recordingStateCtx = recordingStateCanvas.getContext("2d");
    recordingStateCtx.fillStyle = "#000";
    recordingStateCtx.fill();
    circularProgressBar = new CircularProgressBar(recordingStateCtx, {
      xPos: recordingStateCanvas.width / 2,
      yPos: recordingStateCanvas.height / 2,
      radius: recordingStateCanvas.width / 2 - 10,
      backgroundLineWidth: recordingStateCanvas.width / 10,
      lineWidth: recordingStateCanvas.width / 10,
      backgroundColor: "#000",
    });
    circularProgressBar.onchange = () => {
      recordingStateCtx.clearRect(
        0,
        0,
        recordingStateCanvas.width,
        recordingStateCanvas.height
      );
      circularProgressBar.draw();
    };
    circularProgressBar.draw();
  };


  initProgressBar();

  // watermarked canvas
  const watermarkedCanvas = document.getElementById("watermarked-canvas");
  const scale = window.devicePixelRatio; // avoid a blurry canvas on high DPI screens
  watermarkedCanvas.width = Math.floor(window.innerWidth * scale);
  watermarkedCanvas.height = Math.floor(window.innerHeight * scale);
  const watermarkCtx = watermarkedCanvas.getContext("2d");
  let deepAR = null;
  if (!deepAR) {
    try {
      const scale = window.devicePixelRatio;
      canvas.width = Math.floor(window.innerWidth * scale);
      canvas.height = Math.floor(window.innerHeight * scale);

      deepAR = await deepar.initialize({
        licenseKey: "d0ed18eca49f760439c1d7a5fab6e56981a85daef65cea34ef2e52baf4d9464df0a8a4508ef93971",
        canvas,
        effect: effects.effect1.path,
        additionalOptions: {
          cameraConfig: {
            cameraPermissionAsked: () => {
              cameraPermissionAskedEvent();
            },
            cameraPermissionGranted: () => {
              cameraPermissionGrantedEvent();
            },
          },
        },
      });

      window.effectPath = effects.effect1.path;
      window.effectName = effects.effect1.name;
      deepARInitialisedEvent(platform);

      const effectTitleElement = document.getElementById("effect-title");
      effectTitleElement.innerHTML = effects.effect1.name;

      setUiScreen("ar-screen");
      arLoadedEvent();
      trackUsage();

      deepAR.callbacks = {}; // Create an empty object for deepAR.callbacks

      deepAR.callbacks.__deeparRendered = function () {
        // this allows us to render graphics (like a logo) on top of the deepAR canvas for the video recording
        if (!isRecording) {
          return;
        }
        const milliseconds = Date.now() - recordingStarted;
        const seconds = Math.floor(milliseconds / 1000);
        window.videoRecordingDurationSeconds = seconds;
        appendSeconds.innerHTML = seconds;
        circularProgressBar.setPercent(milliseconds / 10000);

        if (seconds >= VIDEO_TIME_LIMIT_SECONDS && isRecording) {
          stopRecordingWithCallback();
        }

        watermarkCtx.drawImage(
          canvas,
          0,
          0,
          watermarkedCanvas.width,
          watermarkedCanvas.height
        );
      };

      deepAR.callbacks.onFaceTracked = function (face) {
        if (!faceTracked) {
          faceTracked = true;
          trackUsage();
        }
      };
    } catch (error) {
      console.log("Error initializing deepAR:", error);
      setUiScreen("permission-denied");
      cameraPermissionDeniedEvent();
    }
  }



  const updateCanvasSize = () => {
    const scale = window.devicePixelRatio; // avoid a blurry canvas on high DPI screens
    var canvasWidth = Math.floor(window.innerWidth * scale);
    var canvasHeight = Math.floor(window.innerHeight * scale);

    const canvas = document.getElementById("deepar-canvas");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
  };
  window.addEventListener("resize", updateCanvasSize);



  const closeShareImage = document.getElementById("close-share-image");
  if (closeShareImage) {
    closeShareImage.onclick = () => {
      setUiScreen("ar-screen");
      deepAR.setPaused(false);
    };
  }

  const closeShareVideo = document.getElementById("close-share-video");
  if (closeShareVideo) {
    closeShareVideo.onclick = () => {
      setUiScreen("ar-screen");
      deepAR.setPaused(false);
      const video = document.getElementById("player");
      video.src = "";
      const shareVideoButton = document.getElementById("share-video-btn");
      if (shareVideoButton) {
        shareVideoButton.onclick = null;
      }
    };
  }

  const webShareSupported = "canShare" in navigator;

  const shareButtonText = document.getElementById("share-image-btn-text");
  if (shareButtonText) {
    shareButtonText.textContent = webShareSupported ? "Share" : "Download";
  }

  const shareButtonDownloadIcon = document.getElementById(
    "share-image-btn-download-icon"
  );
  if (shareButtonDownloadIcon) {
    shareButtonDownloadIcon.style.display = webShareSupported
      ? "none"
      : "block";
  }

  const shareButtonSendIcon = document.getElementById(
    "share-image-btn-send-icon"
  );
  if (shareButtonSendIcon) {
    shareButtonSendIcon.style.display = webShareSupported ? "block" : "none";
  }

  const shareButton = document.getElementById("share-image-btn");
  if (shareButton) {
    shareButton.onclick = () => {
      const canvas = window.screenshotCanvas;
      if (!canvas) {
        console.log("no canvas to download or share");
        return;
      }
      const fileName = "deep-ar-effect.jpg";
      canvas.toBlob((blob) => {
        shareOrDownload(blob, fileName);
      }, "image/jpeg");
    };
  }

  const shareOrDownload = async (blob, fileName) => {
    const webShareSupported = "canShare" in navigator;
    console.log("type: blob.type", blob.type);
    // Using the Web Share API.
    if (webShareSupported) {
      const data = {
        files: [
          new File([blob], fileName, {
            type: blob.type,
          }),
        ],
        // cannot add title or text to web share or some apps (like whatsapp) will consider it a text share and not show the image :()
        // title,
        // text,
      };
      if (navigator.canShare(data)) {
        shareStartedEvent(blob.type);
        try {
          await navigator.share(data);
          setUiScreen("ar-screen");
          deepAR.setPaused(false);
        } catch (err) {
          if (err.name !== "AbortError") {
            console.error(err.name, err.message);
          }
        } finally {
          shareCompletedEvent(blob.type);
          return;
        }
      }
    }
    // Fallback implementation.
    const a = document.createElement("a");
    a.download = fileName;
    a.style.display = "none";
    a.href = URL.createObjectURL(blob);
    a.addEventListener("click", () => {
      setTimeout(() => {
        URL.revokeObjectURL(a.href);
        a.remove();
      }, 1000);
    });
    document.body.append(a);
    a.click();
    shareDownloadedEvent(blob.type);
  };

  if (platform.os.family === "Windows" || platform.os.family === "OS X") {
    console.log("platform.os.family", platform.os.family);
    await generateQRCode(window.location.href);
  }

  const welcomePopupWrapper = document.getElementById("welcome-popup-wrapper");
  if (welcomePopupWrapper) {
    welcomePopupWrapper.onclick = () => {
      welcomePopupWrapper.style.display = "none";
    };
    const welcomePopupCloseButton = document.getElementById(
      "welcome-popup-close-button"
    );
    if (welcomePopupCloseButton) {
      welcomePopupCloseButton.onclick = () => {
        welcomePopupWrapper.style.display = "none";
      };
    }
  }
}

window.onload = main;

async function generateQRCode(url) {
  const qrCodeCanvasContainer = document.getElementById(
    "qr-code-canvas-container"
  );
  const qrCodeCavas = document.getElementById("qr-code-canvas");

  try {
    await QRCode.toCanvas(qrCodeCavas, url, {
      scale: 10,
    });
    qrCodeCanvasContainer.style.display = "flex";
  } catch (error) {
    console.error(error);
  }
}

/**
 * Tracking events
 * These are just suggestions, feel free to add or remove events as you wish
 * */

export function trackEvent(event, props) {
  console.log("trackEvent", event, props);
  // you can send events to your favorite analytics tool here
}

export function initialLoading() {
  timing.initialLoadingEvent = (performance.now() - window.startTime) / 1000.0;
  trackEvent("Initial UI Loaded", {
    Time: timing.initialLoadingEvent,
  });
}

export function deepARInitialisedEvent(platform) {
  timing.uiLoaded = (performance.now() - window.startTime) / 1000.0;
  var majorVersion = parseInt(platform.version.split(".")[0]);
  var pl = {
    os: platform.os.family,
    name: platform.name,
    version: platform.version,
    majorVersion: majorVersion,
  };
  trackEvent("DeepAR Initialized", {
    Time: timing.uiLoaded,
    Platform: JSON.stringify(pl),
  });
}

export function cameraPermissionAskedEvent() {
  timing.cameraPermissionAsked =
    (performance.now() - window.startTime) / 1000.0;
  trackEvent("Camera Permission Asked", {
    Time: timing.cameraPermissionAsked,
  });
}

export function cameraPermissionDeniedEvent() {
  timing.cameraPermissionDenied =
    (performance.now() - window.startTime) / 1000.0;
  trackEvent("Camera Permission Denied", {
    Time: timing.cameraPermissionDenied,
  });
}

export function cameraPermissionGrantedEvent() {
  timing.cameraPermissionGranted =
    (performance.now() - window.startTime) / 1000.0;
  trackEvent("Camera Permission Granted", {
    Time: timing.cameraPermissionGranted,
  });
}

export function effectSelectedEvent(effect) {
  var timeNow = (performance.now() - window.startTime) / 1000.0;
  trackEvent("Effect Selected", {
    Time: timeNow,
    Effect: effect.name,
    Path: effect.path,
  });
}

export function takePhotoEvent() {
  var timeNow = (performance.now() - window.startTime) / 1000.0;
  trackEvent("Photo Taken", {
    Time: timeNow,
    Effect: window.effectName,
  });
}

export function startVideoRecordingEvent() {
  var timeNow = (performance.now() - window.startTime) / 1000.0;
  trackEvent("Start Video Recording", {
    Time: timeNow,
    Effect: window.effectName,
  });
}

export function endVideoRecordingEvent(duration) {
  var timeNow = (performance.now() - window.startTime) / 1000.0;
  trackEvent("End Video Recording", {
    Time: timeNow,
    Effect: window.effectName,
    Duration_Seconds: duration,
  });
}

export function shareStartedEvent(fileType) {
  var timeNow = (performance.now() - window.startTime) / 1000.0;
  trackEvent("Share Started", {
    Time: timeNow,
    Effect: window.effectName,
    File_Type: fileType,
  });
}

export function shareCompletedEvent(fileType) {
  var timeNow = (performance.now() - window.startTime) / 1000.0;
  trackEvent("Share Completed", {
    Time: timeNow,
    Effect: window.effectName,
    File_Type: fileType,
  });
}

export function shareDownloadedEvent(fileType) {
  var timeNow = (performance.now() - window.startTime) / 1000.0;
  trackEvent("Share Downloaded", {
    Time: timeNow,
    Effect: window.effectName,
    File_Type: fileType,
  });
}

export function arLoadedEvent() {
  var timeNow = (performance.now() - window.startTime) / 1000.0;
  timing.arLoaded = timeNow;
  trackEvent("AR Loaded", {
    Time: timeNow,
  });
}

export function moreInfoScreenEvent() {
  var timeNow = (performance.now() - window.startTime) / 1000.0;
  trackEvent("More Info Screen Viewed", {
    Time: timeNow,
  });
}

export function moreInfoTrayEvent() {
  var timeNow = (performance.now() - window.startTime) / 1000.0;
  trackEvent("More Info Tray Viewed", {
    Time: timeNow,
  });
}

var trackUsageEventNumber = 0;
var trackUsageEventInterval = 1000;

/**
 *  Tracks usage every 1 second
 */
export function trackUsage() {
  trackUsageEventNumber++;

  var timeout =
    trackUsageEventNumber * trackUsageEventInterval -
    (performance.now() - timing.arLoaded * 1000) -
    10;

  if (isNaN(timeout)) {
    timeout = 1000;
  }

  setTimeout(function () {
    var time = (trackUsageEventNumber * trackUsageEventInterval) / 1000;
    trackEvent("Usage", { Time: time });
    trackUsage();
  }, timeout || 1000);
}

export const loadImage = async (url) =>
  new Promise(async (resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => {
      resolve(image);
    });
    image.addEventListener("error", (err) => reject(err));
    image.setAttribute("crossorigin", "anonymous");
    image.crossOrigin = "Anonymous";
    image.src = url;
  });
