import { QRCodeSVG } from "qrcode.react";

function QRMenu() {
  const menuUrl = `${window.location.origin}/menu/today`;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-8">
      <div className="rounded-2xl bg-white p-10 text-center shadow-xl">

        <h1 className="text-3xl font-bold">
          Scan Our Menu
        </h1>

        <p className="mt-2 text-gray-500">
          Scan the QR code using your phone
        </p>

        <div className="my-8 flex justify-center">
          <QRCodeSVG
            value={menuUrl}
            size={280}
          />
        </div>

        <p className="text-sm text-gray-500">
          Today's Menu
        </p>

      </div>
    </div>
  );
}

export default QRMenu;