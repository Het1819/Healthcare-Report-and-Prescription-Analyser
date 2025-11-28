import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./screens/Home";
import About from "./screens/About";
import Contact from "./screens/Contact";
import DoctorAgent from "./aiAgent/DoctorAgent";
import ReportReader from "./aiAgent/ReportReaderAgent";
import PrescriptionReader from "./aiAgent/PrescriptionReaderAgent";
import AiAgentPage from "./screens/AiAgentPage";

export default function App() {
  const location = useLocation();

  const noNavbarPaths = [
    "/doctor-agent",
    "/report-reader-agent",
    "/prescription-reader-agent",
  ];

  const marketingPaths = ["/", "/about", "/contact", "/ai-agent"];

  const showNavbar = !noNavbarPaths.includes(location.pathname);
  const showMeshBg = marketingPaths.includes(location.pathname);

  return (
    <div 
      className={`min-h-screen ${showMeshBg ? 'page-bg-mesh' : ''}`} 
      style={{ background: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}
    >
      {showNavbar && <Navbar />}
      
      <div className={showNavbar ? "pt-20 md:pt-16" : ""}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/ai-agent" element={<AiAgentPage />} />
          <Route path="/doctor-agent" element={<DoctorAgent />} />
          <Route path="/report-reader-agent" element={<ReportReader />} />
          <Route path="/prescription-reader-agent" element={<PrescriptionReader />} />
        </Routes>
      </div>
    </div>
  );
}
