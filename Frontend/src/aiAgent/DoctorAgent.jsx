import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
// Import useNavigate for functional back button
import { ArrowLeft, Bot, Plus, MessageSquare, Send, Trash2, Loader2, AlertTriangle, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom"; // Import useNavigate

// Assuming we are running this front-end in a separate environment from the backend API,
// we define the backend URL here. Adjust if the port changes.
const API_BASE_URL = "http://localhost:5001";
const AGENT_NAME = "Doctor AI 🩺";

// Helper for localStorage persistence
const loadChats = () => {
  const savedChats = localStorage.getItem("doctor_chats");
  if (savedChats) {
    return JSON.parse(savedChats);
  }
  // Default initial chat structure
  const initialChat = { 
    id: 1, 
    title: "New Symptom Check", 
    messages: [
      { content: `Welcome! I'm your non-diagnostic ${AGENT_NAME}. Please describe your symptoms (e.g., "Sharp headache behind my eyes and fever of 101F").`, isAgent: true, isMarkdown: true }
    ] 
  };
  return [initialChat];
};

const saveChats = (chats) => {
  localStorage.setItem("doctor_chats", JSON.stringify(chats));
};

// Component for a single chat history item
const ChatHistoryItem = ({ chat, currentChat, onClick, onDelete }) => (
  <div
    className={`p-3 cursor-pointer transition-all rounded-lg text-sm truncate flex items-center justify-between group border ${
      chat.id === currentChat.id
        ? "bg-sky-700/50 text-sky-100 border-sky-600 font-semibold"
        : "bg-zinc-800 hover:bg-zinc-700 border-zinc-700" // Updated to zinc colors
    }`}
  >
    <div className="flex-1 min-w-0" onClick={onClick}>
        <p className="truncate">{chat.title}</p>
        {chat.messages.length > 0 && (
          <p className="text-xs text-slate-400 mt-1 truncate">
            {chat.messages[chat.messages.length - 1].content.replace(/<[^>]*>/g, '').substring(0, 37) + "..."}
          </p>
        )}
    </div>

    {/* 🗑️ DELETE BUTTON */}
    <button
        onClick={(e) => {
            e.stopPropagation(); 
            onDelete(chat.id);
        }}
        className={`ml-3 p-1 rounded-full text-slate-400 hover:text-red-400 hover:bg-zinc-700 transition-colors ${
            chat.id === currentChat.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
        aria-label={`Delete chat ${chat.title}`}
    >
        <Trash2 size={16} />
    </button>
  </div>
);

// Component for a single message bubble
const ChatBubble = ({ message, isAgent, idx }) => {
  let content = message.content;

  // Modernized Agent Chat Bubble Style: Deep Black/Zinc Gradient
  const agentBubbleStyle = {
    background: "linear-gradient(135deg, #1e293bE0 0%, #0f172aE0 100%)", // Deep Charcoal/Navy Gradient
    border: "1px solid #7F8CAA55",
  };

  if (isAgent && message.isMarkdown) {
      
      // 1. STYLE THE DISCLAIMER (Uses custom HTML for visual alert box)
      const disclaimerPattern = content.match(/(\*\*.*?\*\*)/);
      if (disclaimerPattern) {
          const styledDisclaimer = `
              <div class="p-3 my-4 rounded-lg border border-red-500 bg-red-900/40 text-sm font-semibold flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-alert-triangle text-red-400 mr-2 mt-0.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                  <span class="text-red-300">${disclaimerPattern[1].replace(/\*\*/g, '')}</span>
              </div>
          `;
          content = content.replace(disclaimerPattern[1], styledDisclaimer);
      }
      
      // --- VISUAL & READABILITY ENHANCEMENTS (Custom HTML/Tailwind Injection) ---
      
      // 2. CLEANUP AND STYLE HEADERS (## 1., ## 2., etc.)
      content = content.replace(
          /(##\s\d+\.\s)(.*?)\n/g, 
          // Refined header style: larger font and better color separation
          (match, p1, p2) => `<div class="mt-4 mb-2 p-2 rounded-lg font-extrabold text-xl text-sky-300 border-b border-zinc-600 flex items-center">
            <span class="text-xl mr-2">${p1.replace(/##/g, '').trim()}</span> ${p2}
          </div>`
      );
      
      // 3. ADD HIGHLIGHT TO CORE CONDITION (Current Condition Analysis)
      // Highlighting the core finding for emphasis.
      content = content.replace(
          /You are likely experiencing symptoms consistent with a (.*)\./,
          (match, p1) => `<span class="bg-yellow-900/40 px-2 py-0.5 rounded text-yellow-300 font-bold">${p1}</span>.`
      );
      
      // 4. ADD THE IMAGE TAG (after Possible Medical Problems block)
      content = content.replace(
          /Possible Medical Problems\n/g, 
          `Possible Medical Problems\n\n

[Image of Human Respiratory System and Viral Infection Spread]
\n\n`
      );

      // 5. STYLE RECOMMENDED SPECIALIST SECTION
      content = content.replace(
          /(##\s4\.\sRecommended Specialist\s*\n\s*)(\*\*Specialist:\*\*)\s*(.*?)\n\n/s,
          (match, p1, p2, p3) => {
            const highlightedSpecialistLabel = p2.replace(
                /(\*\*Specialist:\*\*)/,
                `<span class="bg-green-600/70 px-2 py-0.5 rounded font-extrabold text-white">$1</span>`
            );
            
            return `
            <div class="mt-4 p-4 rounded-xl border-l-4 border-sky-500 bg-zinc-800/50 shadow-lg">
                <p class="font-bold text-sky-300 text-lg">4. Recommended Specialist</p>
                <p class="text-xl font-bold mt-1 text-slate-100">${highlightedSpecialistLabel} ${p3}</p>
            </div>
          `;
          }
      );

      // 6. STYLE THE FINAL CALL-TO-ACTION BUTTON
      content = content.replace(
          /(\*\*\*)?\s*Connect the doctor\/hospital near your location\./, 
          `
          <div class="mt-6 p-3 rounded-xl bg-sky-600 hover:bg-sky-500 transition-colors cursor-pointer shadow-lg">
            <span class="flex items-center justify-center font-bold text-lg text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin-check text-white mr-2"><path d="M16.2 3.8a2.7 2.7 0 0 0-3.8 0L8.8 7.4"/><path d="M8.8 7.4a2.7 2.7 0 0 0-3.8 0L1.8 11.6"/><path d="M12 22s-4-4-4-10c0-4.4 3.6-8 8-8s8 3.6 8 8c0 6-4 10-4 10"/><path d="m9 16 2 2 4-4"/></svg>
              Connect the doctor/hospital near your location.
            </span>
          </div>
          `
      ).replace('***', ''); // Remove any remaining horizontal rule
  }

  return (
    <motion.div
      key={idx}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: idx * 0.05 }}
      className={`flex ${isAgent ? "justify-start" : "justify-end"}`}
    >
      <div
        className={`max-w-4xl px-4 py-3 rounded-xl shadow-xl transition-colors duration-300 ${
          isAgent
            ? "text-slate-100 rounded-tl-none border"
            : "bg-sky-600 text-white rounded-br-none"
        }`}
        style={isAgent ? agentBubbleStyle : {}} // Apply dark glass style only to agent
      >
        {!isAgent && <p className="font-semibold text-xs mb-1 opacity-70">You</p>}
        
        {/* Render markdown/HTML content using dangerouslySetInnerHTML */}
        {message.isMarkdown ? (
          <div 
            className="text-slate-100 leading-relaxed space-y-3" 
            dangerouslySetInnerHTML={{ __html: content }} 
          />
        ) : (
          <p>{message.content}</p> 
        )}
      </div>
    </motion.div>
  );
};

// --- Main Component ---

export default function DoctorAgent() {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const [chats, setChats] = useState(loadChats);
  const [currentChat, setCurrentChat] = useState(chats[0]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Auto scroll and save chats
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    saveChats(chats);
  }, [currentChat.messages, chats]);
  
  // Set the current chat correctly on load
  useEffect(() => {
      const activeChat = chats.find(c => c.id === currentChat.id) || chats[0];
      if (activeChat) {
          setCurrentChat(activeChat);
      }
  }, [chats]);
  
  const fetchAnalysis = async (symptoms) => {
    try {
        const response = await fetch(`${API_BASE_URL}/doctor_assistant`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ symptoms: symptoms })
        });

        const result = await response.json();
        
        if (result.status === 'success') {
            return {
                content: result.analysis_markdown, 
                isAgent: true, 
                isMarkdown: true,
                status: 'success'
            };
        } else {
            return {
                content: `Error: ${result.message}`, 
                isAgent: true, 
                isMarkdown: false,
                status: 'error'
            };
        }
    } catch (err) {
        console.error("Network or API call failed:", err);
        return {
            content: `Network Error: Could not connect to the backend server at ${API_BASE_URL}. Please ensure the Flask app is running.`, 
            isAgent: true, 
            isMarkdown: false,
            status: 'error'
        };
    }
  };

  const sendMessage = async () => {
    const symptoms = newMessage.trim();
    if (symptoms === "" || isLoading) return;
    
    setError(null);
    setIsLoading(true);

    const userMessage = { content: symptoms, isAgent: false, isMarkdown: false };

    // 1. Optimistically update UI with user message
    const updatedUserChat = {
      ...currentChat,
      messages: [...currentChat.messages, userMessage],
    };
    
    setChats(chats.map(c => (c.id === currentChat.id ? updatedUserChat : c)));
    setCurrentChat(updatedUserChat);
    setNewMessage("");

    // 2. Fetch agent response
    const agentResponse = await fetchAnalysis(symptoms);

    // 3. Update UI with agent response
    const updatedFullChat = {
        ...updatedUserChat,
        messages: [...updatedUserChat.messages, agentResponse],
    };

    const finalChats = chats.map(c => (c.id === currentChat.id ? updatedFullChat : c));
    
    // Update chat title if it's the first message
    if (currentChat.messages.length === 0) {
        const newTitle = symptoms.length > 30 ? symptoms.substring(0, 30) + '...' : symptoms;
        updatedFullChat.title = newTitle;
    }
    
    setChats(finalChats);
    setCurrentChat(updatedFullChat);

    if (agentResponse.status === 'error') {
        setError(agentResponse.content);
    }
    
    setIsLoading(false);
  };

  const createNewChat = () => {
    const newId = Date.now();
    const newChat = {
      id: newId,
      title: `New Symptom Check`,
      messages: [
        { content: `Welcome! I'm your non-diagnostic ${AGENT_NAME}. Please describe your symptoms (e.g., "Sharp headache behind my eyes and fever of 101F").`, isAgent: true, isMarkdown: true }
      ],
    };
    setChats([newChat, ...chats]);
    setCurrentChat(newChat);
    setIsSidebarOpen(false);
  };
  
  // 🗑️ Delete Chat Handler
  const handleDeleteChat = (chatId) => {
    const updatedChats = chats.filter(chat => chat.id !== chatId);
    
    if (updatedChats.length === 0) {
      createNewChat();
    } else {
      if (currentChat.id === chatId) {
        setCurrentChat(updatedChats[0]);
      }
      setChats(updatedChats);
    }
  };

  const handleChatSelection = (chat) => {
    setCurrentChat(chat);
    setIsSidebarOpen(false);
  }

  // Define the subtle gradient style for buttons/containers
  const gradientButtonStyle = {
    background: "linear-gradient(90deg, #079A82 0%, #15B3A1 100%)",
    boxShadow: "0 4px 15px rgba(21, 179, 161, 0.4)",
  };

  // --- Black Color Combination Definitions ---
  // Main background: Deep black/dark gray (Zinc-900 equivalent)
  const mainBgColor = "#18181B"; 
  // Sidebar/Input Bar: Near black, for subtle elevation
  const secondaryBgColor = "#0F0F11"; 
  // Container/Card BG: Darker gray for contrast inside the main panel
  const cardBgClass = "bg-zinc-800";


  return (
    // FIX 1: Updated main background to Deep Black/Dark Gray
    <div className="flex h-screen text-slate-100 overflow-hidden font-sans" style={{ backgroundColor: mainBgColor }}>
      
      {/* 1. Left Sidebar / Chat History (Responsive implementation) */}
      <div 
        // FIX 2: Updated sidebar background to Near Black
        className={`fixed inset-y-0 left-0 w-full md:w-80 border-r border-slate-700 p-4 flex flex-col shrink-0 z-20 transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ backgroundColor: secondaryBgColor }}
      >
        
        {/* Agent Name & Back Button */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700">
          <button
            onClick={() => navigate("/")}
            // FIX 3: Updated back button background to dark zinc
            className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors"
          >
            <ArrowLeft size={18} /> Back
          </button>
          <div className="flex items-center">
            <Bot size={24} className="text-sky-400 mr-2" />
            <span className="text-xl font-bold text-sky-400">{AGENT_NAME}</span>
          </div>
          {/* Close Sidebar button for mobile */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-2 rounded-full hover:bg-zinc-700"
            aria-label="Close sidebar"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* New Chat Button - FIX: Added modern gradient style */}
        <button
          onClick={createNewChat}
          className="w-full mb-6 flex items-center justify-center gap-2 p-3 rounded-lg text-white font-semibold transition-all shadow-lg hover:opacity-90"
          style={gradientButtonStyle}
        >
          <Plus size={20} /> New Symptom Check
        </button>

        {/* Chat History List */}
        <h3 className="text-lg font-semibold mb-3 flex items-center text-slate-300">
          <MessageSquare size={18} className="mr-2" /> History
        </h3>
        <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
          {chats.map(chat => (
            <ChatHistoryItem 
              key={chat.id} 
              chat={chat} 
              currentChat={currentChat}
              onClick={() => handleChatSelection(chat)}
              onDelete={handleDeleteChat}
            />
          ))}
        </div>
      </div>

      {/* 2. Right Panel: Chat Interface */}
      {/* FIX 4: Updated main content background to Deep Black/Dark Gray */}
      <div className="flex-1 flex flex-col relative overflow-hidden" style={{ backgroundColor: mainBgColor }}>
        
        {/* Mobile Header Bar (for Menu/Title) */}
        {/* FIX 5: Updated mobile header background to match the sidebar background */}
        <div className="md:hidden w-full p-3 border-b border-zinc-700 flex items-center justify-between shadow-lg z-10 shrink-0" style={{ backgroundColor: secondaryBgColor }}>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-full hover:bg-zinc-700"
            aria-label="Open sidebar"
          >
            <Menu size={24} />
          </button>
          <h2 className="text-lg font-semibold truncate px-2 text-sky-400">
            {currentChat.title}
          </h2>
          <button
            onClick={createNewChat}
            className="p-2 bg-sky-600 hover:bg-sky-700 rounded-lg text-white transition-colors"
            aria-label="New chat"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Main Chat Content Area */}
        {/* FIX 6: Updated main content background to Deep Black/Dark Gray */}
        <div className="flex-1 flex flex-col p-4 md:p-6 relative overflow-hidden" style={{ backgroundColor: mainBgColor }}>
          
          {/* Desktop Chat Header (Agent/Topic Name) */}
          <h2 className="hidden md:block text-2xl font-bold mb-4 pb-2 border-b border-zinc-700 text-sky-400 shrink-0">
              {currentChat.title}
          </h2>
          
          {/* Error Display */}
          {error && (
              <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-900/50 border border-red-700 p-3 rounded-lg text-red-300 flex items-center mb-4 shrink-0"
              >
                  <AlertTriangle size={20} className="mr-2" />
                  <span className="font-semibold">API Error:</span> {error}
              </motion.div>
          )}

          {/* Messages Display Area (Scrollable part) */}
          <div className="flex-1 overflow-y-auto space-y-4 pb-4 custom-scrollbar">
            {currentChat.messages.length <= 1 && (
              <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 pt-12">
                  <Bot size={64} className="text-zinc-700 mb-4" />
                  <p className="text-xl font-semibold mb-2">Start a Symptom Analysis</p>
                  <p>Describe your symptoms clearly to get a structured preliminary guide.</p>
              </div>
            )}
            
            {currentChat.messages.map((msg, idx) => (
              <ChatBubble 
                  key={idx} 
                  message={msg} 
                  isAgent={msg.isAgent} 
                  idx={idx}
              />
            ))}
            
            {/* Loading Indicator */}
            {isLoading && (
                <div className="flex justify-start">
                    <div className={`max-w-xs px-4 py-3 rounded-xl shadow-md ${cardBgClass} text-slate-100 rounded-tl-none border border-zinc-700 flex items-center`}>
                        <Loader2 size={20} className="animate-spin mr-2" />
                        Analyzing symptoms...
                    </div>
                </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input Bar (Fixed at the bottom of the main panel) */}
          <div 
            className="flex gap-3 pt-4 border-t border-zinc-700 shrink-0 p-4"
            style={{ backgroundColor: secondaryBgColor }} // FIX 7: Use Near Black for input bar
          >
            <input
              type="text"
              // FIX 8: Updated input background to Darker Gray for contrast
              className="flex-1 p-3 rounded-full bg-zinc-800 border border-zinc-700 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500 shadow-md"
              placeholder="Describe your symptoms (e.g., fever, chest pain)..."
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              className={`p-3 rounded-full text-white font-semibold transition-colors shadow-lg ${
                  newMessage.trim() && !isLoading
                  ? "bg-sky-600 hover:bg-sky-500" 
                  : "bg-zinc-700 text-slate-500 cursor-not-allowed" // Updated disabled color
              }`}
              disabled={!newMessage.trim() || isLoading}
            >
              <Send size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}