import React from "react";
import Hero from "../components/Hero";
import WhatWeDo from "../components/WhatWeDo";
import { HowItWorks } from "../components/HowItWorks";
import { WhoThisIsFor } from "../components/WhoThisIsFor";
import { OurPromise } from "../components/OurPromise";
import { Footer } from "../components/Footer";
import data from "../data/whatwedo.json";

export default function Home() {
  return (
    <div className="min-h-screen" style={{ color: 'var(--color-text-primary)' }}>
      <Hero />
      
      <div className="divider max-w-7xl mx-auto" />
      
      <WhatWeDo items={data} />
      
      <HowItWorks />
      
      <WhoThisIsFor />
      
      <OurPromise />
      
      <Footer />
    </div>
  );
}
