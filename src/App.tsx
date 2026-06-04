/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import HomePage from "./pages/HomePage";
import BrowsePage from "./pages/BrowsePage";
import PropertyDetailsPage from "./pages/PropertyDetailsPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import AdminPage from "./pages/AdminPage";
import ChatBot from "./components/chat/ChatBot";
import { motion, AnimatePresence } from "motion/react";
import WhatsAppButton from "./components/ui/WhatsAppButton";

export default function App() {
  return (
    <TooltipProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-[#FFFFFF] text-[#0A0A0A] font-sans selection:bg-[#C9A84C] selection:text-white">
          <Navbar />
          <main className="flex-grow">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/properties" element={<BrowsePage />} />
                <Route path="/properties/:id" element={<PropertyDetailsPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/admin" element={<AdminPage />} />
              </Routes>
            </AnimatePresence>
          </main>
          <Footer />
          <ChatBot />
          <WhatsAppButton />
        </div>
      </Router>
    </TooltipProvider>
  );
}

