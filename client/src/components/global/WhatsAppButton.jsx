"use client";

import React from "react";
import { motion } from "framer-motion";

export default function WhatsAppButton() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 1.5, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 select-none"
    >
      <a
        href="https://wa.me/916362893798?text=Hello%20MIP%20Jewellers%2C%20I%20have%20a%20query%20regarding%20your%20products."
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2.5 group cursor-pointer focus:outline-none"
        aria-label="Connect with us on WhatsApp"
      >
        {/* Inviting text badge (visible on desktop) */}
        <div className="hidden md:block bg-white text-brand-brown px-3.5 py-2 shadow-[0_4px_20px_rgba(78,54,41,0.06)] border border-brand-gold/20 group-hover:border-brand-gold transition-all duration-300 font-primary text-[10px] font-bold tracking-wider uppercase rounded-full">
          Need help?
        </div>

        {/* Small, highly professional floating circle */}
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-[0_4px_15px_rgba(37,211,102,0.25)] group-hover:shadow-[0_8px_25px_rgba(37,211,102,0.4)] group-hover:scale-105 transition-all duration-300 shrink-0">
          {/* WhatsApp SVG Icon */}
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5.5 h-5.5 sm:w-6 sm:h-6 relative z-10"
          >
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.388 2.016 13.91 1.01 11.279 1.01c-5.433 0-9.858 4.373-9.862 9.802-.001 1.814.498 3.59 1.446 5.184l-.998 3.647 3.782-.979zm11.375-5.116c-.31-.154-1.834-.894-2.115-1.002-.281-.102-.485-.154-.689.154-.204.307-.791.998-.97 1.202-.178.204-.356.23-.666.077-.31-.154-1.31-.478-2.493-1.523-.92-.81-1.54-1.812-1.72-2.119-.178-.307-.018-.472.137-.625.139-.138.31-.358.465-.537.155-.179.206-.307.31-.512.102-.204.05-.383-.025-.537-.075-.154-.689-1.636-.944-2.247-.249-.597-.502-.516-.689-.526-.178-.009-.383-.01-.587-.01s-.536.077-.816.383c-.28.307-1.071 1.023-1.071 2.494s1.071 2.894 1.224 3.099c.154.204 2.11 3.178 5.11 4.457.714.303 1.271.485 1.706.625.717.227 1.369.195 1.885.119.574-.085 1.834-.74 2.089-1.457.255-.717.255-1.33.179-1.457-.076-.128-.281-.205-.591-.359z" />
          </svg>
        </div>
      </a>
    </motion.div>
  );
}
