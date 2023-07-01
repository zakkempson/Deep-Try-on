import QRCode from "qrcode";
import platform from "platform";

async function generateQRCode(url) {
  const qrCodeCanvasContainer = document.getElementById("qr-code-canvas-container");
  const qrCodeCanvas = document.getElementById("qr-code-canvas");

  try {
    const qrCodeImageData = await QRCode.toCanvas(qrCodeCanvas, url, {
      scale: 10,
    });
    console.log("QR code image data:", qrCodeImageData);
    qrCodeCanvasContainer.style.display = "flex";
  } catch (error) {
    console.error(error);
  }
}

if (platform.os.family === "Windows" || platform.os.family === "OS X") {
  console.log("platform.os.family", platform.os.family);
  await generateQRCode(window.location.href);
}
