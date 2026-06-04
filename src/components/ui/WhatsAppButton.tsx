import { LOVETH_CONTACT } from "@/constants";
import { MessageCircle } from "lucide-react";
import { motion } from "motion/react";

export default function WhatsAppButton() {
  return (
    <motion.a
      href={`https://wa.me/${LOVETH_CONTACT.whatsapp}`}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      className="fixed bottom-6 left-6 z-40 bg-[#25D366] text-white p-4 rounded-full shadow-2xl flex items-center justify-center transition-transform"
    >
      <MessageCircle size={28} fill="white" />
    </motion.a>
  );
}
