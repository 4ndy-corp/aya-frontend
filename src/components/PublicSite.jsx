import React, { useState } from "react";
import { CartProvider } from "../context/CartContext";
import SiteHeader from "./SiteHeader";
import Hero from "./Hero";
import FeaturedProducts from "./FeaturedProducts";
import AboutBrand from "./AboutBrand";
import Testimonials from "./Testimonials";
import Newsletter from "./Newsletter";
import Catalog from "./Catalog";
import Footer from "./Footer";
import CartDrawer from "./CartDrawer";
import Checkout from "./Checkout";

export default function PublicSite() {
  const [view, setView] = useState("home"); // home | checkout

  return (
    <CartProvider>
      <div style={{ background: "#0A0A09", minHeight: "100vh" }}>
        <SiteHeader />

        {view === "home" && (
          <>
            <Hero />
            <FeaturedProducts />
            <AboutBrand />
            <Testimonials />
            <Newsletter />
            <Catalog />
            <Footer />
          </>
        )}

        {view === "checkout" && (
          <Checkout onOrderComplete={() => {}} />
        )}

        <CartDrawer onGoToCheckout={() => setView("checkout")} />
      </div>
    </CartProvider>
  );
}
