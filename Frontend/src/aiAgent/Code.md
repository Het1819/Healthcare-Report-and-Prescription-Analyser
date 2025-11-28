```Javascript
import React, { useState, useRef, useEffect } from "react";
// Added general AI/Chat icons, kept Upload/Camera for the multi-modal use case
import { Upload, ArrowLeft, Plus, Bot, MessageSquare, Menu, Camera, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

// --- Custom Components for Cleanliness and Reusability ---

// Component for a single chat history item
const ChatHistoryItem = ({ chat, currentChat, onClick }) => (
  <div
    onClick={onClick}
    className={`p-3 cursor-pointer transition-all rounded-lg text-sm truncate ${
      chat.id === currentChat.id
        ? "bg-sky-600/30 text-sky-200 border-sky-600 border"
        : "bg-slate-700/50 hover:bg-slate-700 border border-slate-700"
    }`}
  >
    <p className="font-semibold">{chat.title}</p>
    <p className="text-xs text-slate-400 mt-1">{chat.fileName || "No file uploaded"}</p>
  </div>
);

// Component for a single message displaying the analysis result
const AnalysisMessage = ({ msg }) => (
  <div className="flex justify-start">
    <div className="max-w-4xl w-full bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-700 rounded-tl-none">
      <div className="flex items-center mb-3 pb-2 border-b border-slate-700">
        <Bot size={20} className="text-sky-400 mr-2" />
        <h3 className="text-lg font-bold text-sky-400">{msg.fileName} - Analysis</h3>
      </div>

      {/* Medicines Extracted */}
      <div className="mb-4">
        <h4 className="font-semibold text-green-300 mb-2 border-l-4 border-green-500 pl-2">
          Extracted Medicines:
        </h4>
        <div className="space-y-2">
          {msg.data.raw_extraction?.medicines?.map((med, i) => (
            <div key={i} className="bg-slate-900 p-3 rounded-md border border-slate-700">
              <p>
                <span className="font-semibold text-sky-300">Form:</span>{" "}
                <span className="text-slate-200">{med.form}</span>
              </p>
              <p>
                <span className="font-semibold text-sky-300">Name:</span>{" "}
                <span className="text-slate-200">{med.name}</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Analysis */}
      <div>
        <h4 className="font-semibold text-green-300 mb-2 border-l-4 border-green-500 pl-2">
          Detailed Analysis:
        </h4>
        <div className="space-y-3">
          {Object.entries(msg.data.analysis || {}).map(([medicine, details], i) => (
            <div key={i} className="bg-slate-900 p-4 rounded-md border border-slate-700 shadow-inner">
              <p className="mb-2">
                <span className="font-bold text-sky-300">Medicine:</span>{" "}
                <span className="text-lg text-white">{medicine}</span>
              </p>
              <ul className="text-slate-200 space-y-1 ml-4 list-disc list-outside">
                <li>
                  <span className="font-bold text-sky-300">Purpose:</span> {details.purpose}
                </li>
                <li>
                  <span className="font-bold text-sky-300">Side Effects:</span> {details.side_effects}
                </li>
                <li>
                  <span className="font-bold text-sky-300">Interactions:</span> {details.interactions}
                </li>
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// --- Main Component ---

export default function AIAgentPrescriptionChat() {
  const navigate = useNavigate();
  // Renamed state variables for better clarity (prescriptions -> chats)
  const [chats, setChats] = useState([{ id: 1, title: "Prescription Analysis 1", fileName: null, messages: [] }]);
  const [currentChat, setCurrentChat] = useState(chats[0]);
  const [messages, setMessages] = useState(chats[0].messages);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // For mobile menu

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Removed scroll progress logic as it added complexity without significant UI gain
  
  const AGENT_NAME = "Health AI Reader";
  const BACKEND_URL = "http://localhost:5000/analyze"; // Kept for backend integration

  // Auto scroll to bottom when new messages appear
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Sync messages state when currentChat changes
  useEffect(() => {
    const chat = chats.find(c => c.id === currentChat.id);
    if (chat) {
      setMessages(chat.messages);
    }
  }, [currentChat, chats]);

  const createNewChat = () => {
    const newChat = {
      id: chats.length + 1,
      title: `New Analysis ${chats.length + 1}`,
      fileName: null,
      messages: [],
    };
    setChats([newChat, ...chats]);
    setCurrentChat(newChat);
    setMessages(newChat.messages); // Update messages view
    setIsSidebarOpen(false); // Close sidebar on new chat for mobile
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // --- Simulate Network Request ---
      // In a real app, this is where the fetch would happen.
      // const response = await fetch(BACKEND_URL, { method: "POST", body: formData });
      // const data = await response.json();
      
      // Simulated response data structure (keeping original structure for display)
      const data = await new Promise(resolve => setTimeout(() => resolve({
          raw_extraction: {
              medicines: [
                  { form: "Tablet", name: "Amoxicillin 500mg" },
                  { form: "Syrup", name: "Dolo 650" }
              ]
          },
          analysis: {
              "Amoxicillin 500mg": { purpose: "Antibiotic for bacterial infections.", side_effects: "Diarrhea, nausea, rash.", interactions: "Can interact with blood thinners." },
              "Dolo 650": { purpose: "Pain and fever relief.", side_effects: "Rare, but can cause liver damage with overdose.", interactions: "Avoid concurrent use with other paracetamol products." }
          }
      }), 2000));
      // --- End Simulation ---
      
      const newAnalysisMessage = { 
        id: Date.now(), 
        fileName: file.name, 
        data 
      };

      // Update the messages for the current chat
      const updatedChats = chats.map(chat => {
        if (chat.id === currentChat.id) {
          return {
            ...chat,
            fileName: file.name,
            title: `Analysis: ${file.name.substring(0, 25)}...`,
            messages: [...chat.messages, newAnalysisMessage]
          };
        }
        return chat;
      });
      
      setChats(updatedChats);
      // Immediately update current view with the new message
      setMessages(prev => [...prev, newAnalysisMessage]);
      
      setLoading(false);
    } catch (error) {
      console.error("Upload/Analysis Error:", error);
      alert("Analysis failed. Please try a different file or check the server!");
      setLoading(false);
    } finally {
      // Clear the file input for re-uploading the same file
      e.target.value = null; 
    }
  };
  
  const handleChatSelection = (chat) => {
    setCurrentChat(chat);
    setMessages(chat.messages);
    setIsSidebarOpen(false); // Close sidebar on selection for mobile
  }

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 overflow-hidden">
      
      {/* 1. Left Sidebar / Chat History */}
      <div
        className={`fixed inset-y-0 left-0 w-80 bg-slate-800 border-r border-slate-700 p-4 flex flex-col z-20 transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Agent Name & Back Button */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-700">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
          >
            <ArrowLeft size={18} /> Back
          </button>
          <div className="flex items-center">
            <Bot size={24} className="text-sky-400 mr-2" />
            <span className="text-xl font-bold text-sky-400">{AGENT_NAME}</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-2 rounded-full hover:bg-slate-700"
            aria-label="Close sidebar"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* New Chat Button */}
        <button
          onClick={createNewChat}
          className="w-full mb-6 flex items-center justify-center gap-2 p-3 bg-sky-600 hover:bg-sky-700 rounded-lg text-white font-semibold transition-colors shadow-lg"
        >
          <Plus size={20} /> Start New Analysis
        </button>

        {/* Chat History List */}
        <h3 className="text-lg font-semibold mb-3 flex items-center text-slate-300">
          <MessageSquare size={18} className="mr-2" /> History
        </h3>
        <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar">
          {chats.map((chat) => (
            <ChatHistoryItem 
              key={chat.id} 
              chat={chat} 
              currentChat={currentChat}
              onClick={() => handleChatSelection(chat)}
            />
          ))}
        </div>
      </div>

      {/* 2. Main Chat Panel */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* Mobile Header Bar */}
        <div className="md:hidden w-full bg-slate-800 p-3 border-b border-slate-700 flex items-center justify-between shadow-lg z-10">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-full hover:bg-slate-700"
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

        {/* Messages Display Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24 md:pb-28">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 pt-20">
                <Bot size={64} className="text-slate-600 mb-4" />
                <p className="text-xl font-semibold mb-2">Welcome to {AGENT_NAME}</p>
                <p>Upload an image or PDF of a prescription to get started.</p>
            </div>
          )}
          
          {messages.map((msg) => (
            <AnalysisMessage key={msg.id} msg={msg} />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Fixed Bottom Input Bar (for file upload) */}
        <div className="fixed bottom-0 left-0 right-0 md:left-80 flex items-center justify-center p-4 border-t border-slate-700 bg-slate-800 transition-all duration-300 z-10">
          <div className="flex items-center justify-center max-w-2xl w-full">
            <button
              className="flex items-center justify-center p-3 mr-3 rounded-full border border-slate-700 hover:bg-slate-700/50 transition-colors"
              onClick={() => alert("Camera feature not implemented yet, using file upload.")}
              aria-label="Capture image"
              disabled={loading}
            >
              <Camera size={24} className="text-sky-400" />
            </button>
            <button
              className={`flex-1 flex items-center justify-center p-3 rounded-full font-semibold transition-colors ${loading ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-sky-600 hover:bg-sky-500 text-white'}`}
              onClick={() => fileInputRef.current.click()}
              aria-label="Upload prescription file"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={24} className="animate-spin mr-2" />
                  Processing File...
                </>
              ) : (
                <>
                  <Upload size={24} className="mr-2" />
                  Upload Prescription (Image/PDF)
                </>
              )}
            </button>
            
            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={handleUpload}
              disabled={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
```
# Code

```Javascript
import React, { useState, useRef, useEffect } from "react";
import { Camera, Upload, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PrescriptionReader() {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState([{ id: 1, title: "Prescription 1" }]);
  const [currentPrescription, setCurrentPrescription] = useState(prescriptions[0]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const leftScrollRef = useRef(null);
  const rightScrollRef = useRef(null);
  const [leftProgress, setLeftProgress] = useState(0);
  const [rightProgress, setRightProgress] = useState(0);

  const BACKEND_URL = "http://localhost:5000/analyze";

  // Auto scroll to bottom when new messages appear
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Update scroll progress
  useEffect(() => {
    const handleScroll = (ref, setProgress) => () => {
      if (!ref.current) return;
      const scrollTop = ref.current.scrollTop;
      const scrollHeight = ref.current.scrollHeight - ref.current.clientHeight;
      const fraction = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
      setProgress(fraction);
    };

    const leftRef = leftScrollRef.current;
    const rightRef = rightScrollRef.current;

    leftRef?.addEventListener("scroll", handleScroll(leftScrollRef, setLeftProgress));
    rightRef?.addEventListener("scroll", handleScroll(rightScrollRef, setRightProgress));

    return () => {
      leftRef?.removeEventListener("scroll", handleScroll(leftScrollRef, setLeftProgress));
      rightRef?.removeEventListener("scroll", handleScroll(rightScrollRef, setRightProgress));
    };
  }, []);

  const createNewPrescription = () => {
    const newPrescription = {
      id: prescriptions.length + 1,
      title: `New Prescription ${prescriptions.length + 1}`,
    };
    setPrescriptions([newPrescription, ...prescriptions]);
    setCurrentPrescription(newPrescription);
    setMessages([]);
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(BACKEND_URL, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      setMessages((prev) => [...prev, { id: Date.now(), fileName: file.name, data }]);
      setLoading(false);
    } catch (error) {
      console.error("Upload Error:", error);
      alert("Server Error, try again!");
      setLoading(false);
    }
  };

  // Helper to calculate gradient based on progress
  const getProgressBg = (fraction) =>
    `linear-gradient(to bottom, rgb(7,89,133) ${fraction * 100}%, rgb(30,41,59) ${fraction * 100}%)`;

  return (
    <div className="flex flex-col h-screen text-slate-100">
      {/* Top Header */}
      <div className="w-full bg-slate-800 p-4 border-b border-slate-700 flex justify-center">
        <h1 className="text-2xl font-bold text-sky-400">Prescription Reader</h1>
      </div>

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Left Sidebar */}
        <div
          ref={leftScrollRef}
          className="w-full md:w-80 border-r border-slate-700 p-4 flex flex-col overflow-y-auto"
          style={{ background: getProgressBg(leftProgress) }}
        >
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-1 px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded-md text-sm transition-colors"
            >
              <ArrowLeft size={16} /> Back
            </button>
            <button
              onClick={createNewPrescription}
              className="px-2 py-1 bg-sky-500 hover:bg-sky-600 rounded-md text-white text-sm transition-colors"
            >
              + New
            </button>
          </div>

          <div className="flex-1 space-y-2">
            {prescriptions.map((prescription) => (
              <div
                key={prescription.id}
                onClick={() => setCurrentPrescription(prescription)}
                className={`p-3 cursor-pointer border border-slate-700 ${
                  prescription.id === currentPrescription.id ? "bg-slate-700" : "bg-slate-800"
                } hover:bg-slate-600 transition-colors rounded-md`}
              >
                {prescription.title}
              </div>
            ))}
          </div>
        </div>

        {/* Right Chat Panel */}
        <div
          ref={rightScrollRef}
          className="flex-1 flex flex-col relative overflow-y-auto"
          style={{ background: getProgressBg(rightProgress) }}
        >
          {/* Messages */}
          <div className="flex-1 p-4 space-y-4 mb-20">
            {messages.map((msg) => (
              <div key={msg.id} className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                <h3 className="text-lg font-bold text-sky-400 mb-3">{msg.fileName}</h3>

                {/* Medicines */}
                <div className="mb-3">
                  <h4 className="font-semibold text-green-300 mb-2">Medicines:</h4>
                  <div className="space-y-2">
                    {msg.data.raw_extraction?.medicines?.map((med, i) => (
                      <div key={i} className="bg-slate-900 p-2 rounded-md border border-slate-700">
                        <p>
                          <span className="font-semibold text-sky-300">Form:</span>{" "}
                          <span className="text-slate-200">{med.form}</span>
                        </p>
                        <p>
                          <span className="font-semibold text-sky-300">Name:</span>{" "}
                          <span className="text-slate-200">{med.name}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Analysis */}
                <div>
                  <h4 className="font-semibold text-green-300 mb-2">Analysis:</h4>
                  <div className="space-y-2">
                    {Object.entries(msg.data.analysis || {}).map(([medicine, details], i) => (
                      <div key={i} className="bg-slate-900 p-3 rounded-md border border-slate-700">
                        <p>
                          <span className="font-bold text-sky-300">Medicine:</span>{" "}
                          <span className="text-slate-200">{medicine}</span>
                        </p>
                        <p>
                          <span className="font-bold text-sky-300">Purpose:</span>{" "}
                          <span className="text-slate-200">{details.purpose}</span>
                        </p>
                        <p>
                          <span className="font-bold text-sky-300">Side Effects:</span>{" "}
                          <span className="text-slate-200">{details.side_effects}</span>
                        </p>
                        <p>
                          <span className="font-bold text-sky-300">Interactions:</span>{" "}
                          <span className="text-slate-200">{details.interactions}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Fixed Bottom Chat Bar */}
          <div className="fixed bottom-0 left-80 right-0 flex items-center p-3 border-t border-slate-700 bg-slate-800">
            <button
              className="flex items-center justify-center p-3 mr-2 rounded-full border border-slate-700 hover:bg-slate-700/50 transition-colors"
              onClick={() => alert("Camera access required")}
            >
              <Camera size={24} className="text-sky-400" />
            </button>
            <button
              className="flex items-center justify-center p-3 mr-2 rounded-full border border-slate-700 hover:bg-slate-700/50 transition-colors"
              onClick={() => fileInputRef.current.click()}
            >
              <Upload size={24} className="text-sky-400" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={handleUpload}
            />
            {loading && <span className="text-sky-400 ml-3">⏳ Processing...</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
```

