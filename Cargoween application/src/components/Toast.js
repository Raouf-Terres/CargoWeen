"use client";
import { useEffect } from "react";

export default function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-md shadow-lg text-white
      ${type === "success" ? "bg-green-500" : ""}
      ${type === "error" ? "bg-red-500" : ""}
      ${type === "info" ? "bg-blue-500" : ""}
      ${type === "warning" ? "bg-yellow-500 text-black" : ""}
    `}>
      {message}
    </div>
  );
}
