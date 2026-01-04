import React from "react";
import { QRCodeSVG } from "qrcode.react";

export default function UPIQRCode({
  vpa = "singh.4481@superyes",
  payeeName = "AnimeVerse",
  amount,
  transactionNote = "Support AnimeVerse",
  size = 220,
}) {
  const upiUrl = amount
    ? `upi://pay?pa=${vpa}&pn=${encodeURIComponent(
        payeeName
      )}&am=${amount}&tn=${encodeURIComponent(transactionNote)}&cu=INR`
    : `upi://pay?pa=${vpa}&pn=${encodeURIComponent(
        payeeName
      )}&tn=${encodeURIComponent(transactionNote)}&cu=INR`;

  return (
    <div className="relative group">
      <div className="absolute -inset-4 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-500/20 rounded-3xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="relative glass-card-modern p-6 rounded-2xl border border-white/10">
        <div className="bg-white p-4 rounded-xl">
          <QRCodeSVG
            value={upiUrl}
            size={size}
            level="H"
            includeMargin={false}
            bgColor="#ffffff"
            fgColor="#0a0a0f"
          />
        </div>
        {/* <div className="mt-4 text-center">
            <p className="text-xs font-mono text-white/50 tracking-wider">{vpa}</p>
          </div> */}
      </div>
    </div>
  );
}
