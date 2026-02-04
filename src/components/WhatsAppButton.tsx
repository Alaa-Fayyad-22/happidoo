"use client";

import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";

const PHONE_NUMBER = "9613748496"; 

const MESSAGE = encodeURIComponent(
  "Hi! I’d like more information, please."
);

export default function WhatsAppButton() {
  return (
    <Link
      href={`https://wa.me/${PHONE_NUMBER}?text=${MESSAGE}`}
      target="_blank"
      aria-label="Chat on WhatsApp"
      className="
        fixed bottom-5 right-5 z-50
        flex h-14 w-14 items-center justify-center
        rounded-full bg-green-500 text-white
        shadow-lg
        transition-transform duration-300
        hover:-translate-y-2 hover:scale-105
        animate-float
      "
    >
      <FaWhatsapp className="h-7 w-7" />
    </Link>
  );
}
