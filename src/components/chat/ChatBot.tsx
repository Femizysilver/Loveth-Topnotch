import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, X, Send, User, Bot, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getChatResponse } from "@/services/geminiService";
import ReactMarkdown from "react-markdown";
import { useProperties } from "@/hooks/useProperties";

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const { properties } = useProperties();
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([
    { role: "assistant", text: "Hello! I'm Loveth's Virtual Assistant. How can I help you discover premium property opportunities in Nigeria today?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMessage }]);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      
      const propertiesContext = properties.length > 0 
        ? `We current have ${properties.length} active listings including: ${properties.map(p => `${p.title} in ${p.location} for ₦${p.price.toLocaleString()}`).join('; ')}`
        : "We are currently curating new luxury listings. Please ask Loveth for off-market opportunities.";

      const response = await getChatResponse(userMessage, history, propertiesContext);
      setMessages(prev => [...prev, { role: "assistant", text: response || "Something went wrong." }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", text: "I'm having a little trouble. Please try again or call Loveth directly." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-black text-[#C9A84C] p-4 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform"
      >
        <MessageSquare size={28} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-10rem)] bg-white rounded-3xl shadow-2xl z-50 flex flex-col border border-gray-100 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-black text-white p-6 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-[#C9A84C] p-2 rounded-xl text-white">
                  <Bot size={20} />
                </div>
                <div>
                  <p className="font-bold text-sm">TopNotch Assistant</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">Always Online</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:text-[#C9A84C]">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-grow overflow-y-auto p-6 space-y-6 bg-gray-50/50">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] flex gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${m.role === "user" ? "bg-black text-white" : "bg-[#C9A84C] text-white"}`}>
                      {m.role === "user" ? <User size={14} /> : <Bot size={14} />}
                    </div>
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${m.role === "user" ? "bg-black text-white rounded-tr-none" : "bg-white text-gray-800 rounded-tl-none border border-gray-100"}`}>
                      <div className="markdown-body prose prose-sm max-w-none">
                        <ReactMarkdown>
                          {m.text}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white p-4 rounded-2xl shadow-sm animate-pulse flex items-center gap-2 text-gray-400 text-xs font-medium">
                    <Loader2 className="animate-spin" size={14} />
                    Assistant is typing...
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-100 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask about properties, ROI, or diaspora support..."
                className="flex-grow bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#C9A84C]"
              />
              <Button onClick={handleSend} className="bg-black hover:bg-gray-800 text-[#C9A84C] aspect-square p-0 w-12 rounded-xl">
                <Send size={18} />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
