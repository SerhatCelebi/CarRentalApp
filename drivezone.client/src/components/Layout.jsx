import React from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export const Layout = ({ children }) => {
  return (
    <div className="dz-layout">
      <Navbar />
      <main className="dz-main-content">{children}</main>
      <Footer />
    </div>
  );
};
