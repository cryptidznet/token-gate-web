"use client";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function ToasterProvider() {
  return (
    <ToastContainer
      position="bottom-center"
      autoClose={4000}
      newestOnTop
      closeOnClick
      pauseOnFocusLoss={false}
      pauseOnHover
      draggable
      theme="colored"
    />
  );
}


