import React, { useState, useRef, useEffect } from "react";
// Added Trash2 icon for delete functionality
import { Upload, ArrowLeft, Bot, Plus, MessageSquare, Menu, Camera, Loader2, Trash2, Pill, AlertTriangle } from "lucide-react";

// --- Color Definitions ---
const MAIN_BG_COLOR = "#18181B"; // Deep Black/Dark Gray (bg-zinc-900 equivalent)
const SECONDARY_BG_COLOR = "#0F0F11"; // Near Black for sidebar/input bar
const ACCENT_BUTTON_STYLE = {
    background: "linear-gradient(90deg, #079A82 0%, #15B3A1 100%)",
    boxShadow: "0 4px 15px rgba(21, 179, 161, 0.4)",
};

// --- Sidebar report item (ReportHistoryItem) ---
const ReportHistoryItem = ({ report, currentReport, onClick, onDelete }) => (
  <div
    className={`p-3 cursor-pointer transition-all rounded-lg text-sm truncate flex items-center justify-between group border ${
      report.id === currentReport.id
        ? "bg-sky-700/50 text-sky-100 border-sky-600 font-semibold" 
        : "bg-zinc-800 hover:bg-zinc-700 border-zinc-700" 
    }`}
  >
    <div className="flex-1 min-w-0" onClick={onClick}>
      <p className="truncate">{report.title}</p>
      {report.fileName && <p className="text-xs text-slate-400 mt-1 truncate">File: {report.fileName}</p>}
    </div>
    
    <button
      onClick={(e) => {
        e.stopPropagation(); 
        onDelete(report.id);
      }}
      className={`ml-3 p-1 rounded-full text-slate-400 hover:text-red-400 hover:bg-zinc-700 transition-colors ${
        report.id === currentReport.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
      }`}
      aria-label={`Delete chat ${report.title}`}
    >
      <Trash2 size={16} />
    </button>
  </div>
);

// --- Component to display the Prescription Analysis Data ---
const PrescriptionDataDisplay = ({ apiData }) => {
    if (!apiData || !apiData.raw_extraction || !apiData.analysis) {
        return (
            <div className="text-center p-8 bg-zinc-800 rounded-xl text-slate-400">
                Analysis data is incomplete or missing.
            </div>
        );
    }

    const { raw_extraction, analysis } = apiData;
    const medications = raw_extraction.medicines || [];

    // Combine extracted names with detailed analysis
    const fullMedicationList = medications.map(med => ({
        name: med.name,
        form: med.form,
        // Match the extracted medicine name (key) to the analysis details (value)
        details: analysis[med.name] || { purpose: "Details unavailable.", side_effects: "N/A", interactions: "N/A" }
    }));

    const Disclaimer = () => (
        <div className="p-3 rounded-lg border border-red-500 bg-red-900/40 text-sm font-semibold text-red-300 shadow">
            <p className="flex items-center"><AlertTriangle size={18} className="mr-2 inline-block"/> This analysis is based on extraction and AI knowledge. It is NOT a substitute for professional medical advice. Always consult your pharmacist or doctor before taking medication.</p>
        </div>
    );

    return (
        <div className="w-full space-y-8">
            <Disclaimer />

            {/* Extracted Medications */}
            <div className="bg-zinc-800 p-6 rounded-xl border border-zinc-700 shadow-xl">
                <h3 className="text-xl font-bold mb-4 text-green-400 flex items-center">
                    <Pill size={24} className="mr-2" /> Extracted Medications ({fullMedicationList.length})
                </h3>
                
                <ul className="space-y-4">
                    {fullMedicationList.length > 0 ? (
                        fullMedicationList.map((med, idx) => (
                            <li key={idx} className="border-b border-zinc-700 pb-4 last:border-b-0">
                                <p className="text-lg font-extrabold text-sky-400 mb-1">{med.name} <span className="text-sm font-medium text-slate-400">({med.form || 'Form Unknown'})</span></p>
                                
                                <div className="pl-4 text-sm space-y-1">
                                    <p><strong className="text-slate-300">Purpose:</strong> {med.details.purpose}</p>
                                    <p><strong className="text-slate-300">Side Effects:</strong> {med.details.side_effects}</p>
                                    {/* Highlight Major Warning in red */}
                                    <p><strong className="text-red-400">Major Warning:</strong> {med.details.interactions}</p>
                                </div>
                            </li>
                        ))
                    ) : (
                        <p className="text-slate-400">No specific medications were extracted from the file. Please try a clearer image.</p>
                    )}
                </ul>
            </div>
            
            {/* Diagram Placeholder */}
            {medications.length > 0 && (
                <div className="text-center p-4 rounded-xl border border-sky-600 bg-sky-900/20">
                    <p className="text-sky-300 italic"></p>
                </div>
            )}
        </div>
    );
};


// --- Main Prescription Analyst component ---
export default function AIAgentPrescriptionChat() { 
    
    // NOTE: navigate is usually provided by an external router; for a standalone file, we stub it.
    const navigate = (path) => console.log(`Navigating to: ${path}`);
    
    const AGENT_NAME = "Prescription Analyst";
    const BACKEND_URL = `http://127.0.0.1:5001/analyze_prescription`; 
    // const API_BASE_URL is now defined implicitly in BACKEND_URL 

    const initialReports = [
        { id: 1, title: "Report Analysis", fileName: null, apiData: null },
    ];

    const [reports, setReports] = useState(initialReports);
    const [currentReport, setCurrentReport] = useState(initialReports[0]);
    const [loading, setLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); 

    const fileInputRef = useRef(null);
    
    const createNewReport = () => {
        const newReport = { id: Date.now(), title: `New Analysis`, fileName: null, apiData: null };
        setReports([newReport, ...reports]); 
        setCurrentReport(newReport);
        setIsSidebarOpen(false);
    };
    
    const handleDeleteReport = (reportId) => {
        const updatedReports = reports.filter(r => r.id !== reportId);
        
        if (updatedReports.length === 0) {
            createNewReport();
        } else {
            if (currentReport.id === reportId) {
                setCurrentReport(updatedReports[0]);
            }
            setReports(updatedReports);
        }
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

            // console.log(data)

            if (!response.ok || data.status === "error") {
                // Display the specific error message from the backend
                alert(`Analysis failed. Error: ${data.message || data.error || "Server returned an unknown error."}`);
                throw new Error(data.message || data.error || "Server returned an error.");
            }
            
            // Success: data is the direct backend response ({status, raw_extraction, analysis})
            const updatedReport = {
                ...currentReport,
                title: `Analysis: ${file.name.substring(0, 25)}...`,
                fileName: file.name,
                apiData: data, // Store the full successful response object
            };

            setReports(reports.map(r => (r.id === currentReport.id ? updatedReport : r)));
            setCurrentReport(updatedReport);
            
            setLoading(false);
        } catch (error) {
            console.error("Upload/Analysis Error:", error);
            alert("Network or server connection error. Please ensure the Flask app is running on port 5001!");
            setLoading(false);
        } finally {
            e.target.value = null; 
        }
    };
    
    const handleReportSelection = (report) => {
        setCurrentReport(report);
        setIsSidebarOpen(false);
    }
    
    const { apiData } = currentReport;

    return (
        <div className="flex h-screen text-slate-100 overflow-hidden font-sans" style={{ backgroundColor: MAIN_BG_COLOR }}>
            
            {/* 1. Left Sidebar / Chat History */}
            <div
                className={`fixed inset-y-0 left-0 w-full md:w-80 border-r border-zinc-700 p-4 flex flex-col shrink-0 z-20 transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
                style={{ backgroundColor: SECONDARY_BG_COLOR }}
            >
                {/* Agent Name & Back Button */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-700">
                    <button
                        onClick={() => navigate("/")}
                        className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors"
                    >
                        <ArrowLeft size={18} /> Back
                    </button>
                    <div className="flex items-center">
                        <Bot size={24} className="text-sky-400 mr-2" />
                        <span className="text-xl font-bold text-sky-400">{AGENT_NAME}</span>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="md:hidden p-2 rounded-full hover:bg-zinc-700"
                        aria-label="Close sidebar"
                    >
                        <Menu size={24} />
                    </button>
                </div>

                {/* New Report Button */}
                <button
                    onClick={createNewReport}
                    className="w-full mb-6 flex items-center justify-center gap-2 p-3 rounded-lg text-white font-semibold transition-colors shadow-lg hover:opacity-90"
                    style={ACCENT_BUTTON_STYLE}
                >
                    <Plus size={20} /> Start New Analysis
                </button>

                {/* Chat History List */}
                <h3 className="text-lg font-semibold mb-3 flex items-center text-slate-300">
                    <MessageSquare size={18} className="mr-2" /> History
                </h3>
                <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar">
                    {reports.map((report) => (
                        <ReportHistoryItem 
                            key={report.id} 
                            report={report} 
                            currentReport={currentReport}
                            onClick={() => handleReportSelection(report)}
                            onDelete={handleDeleteReport}
                        />
                    ))}
                </div>
            </div>

            {/* 2. Main Panel */}
            <div className="flex-1 flex flex-col relative overflow-hidden" style={{ backgroundColor: MAIN_BG_COLOR }}>
                
                {/* Mobile Header Bar */}
                <div className="md:hidden w-full p-3 border-b border-zinc-700 flex items-center justify-between shadow-lg z-10 shrink-0" style={{ backgroundColor: SECONDARY_BG_COLOR }}>
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 rounded-full hover:bg-zinc-700"
                        aria-label="Open sidebar"
                    >
                        <Menu size={24} />
                    </button>
                    <h2 className="text-lg font-semibold truncate px-2 text-sky-400">
                        {currentReport.title}
                    </h2>
                    <button
                        onClick={createNewReport}
                        className="p-2 bg-sky-600 hover:bg-sky-700 rounded-lg text-white transition-colors"
                        aria-label="New chat"
                    >
                        <Plus size={20} />
                    </button>
                </div>
                
                {/* Main Content Area */}
                <div className="flex-1 flex flex-col items-center p-4 md:p-8 relative overflow-y-auto custom-scrollbar pb-32 md:pb-40"> 
                    
                    {/* Desktop Header/Title */}
                    <h2 className="hidden md:block text-2xl font-bold mb-8 pb-2 border-b border-zinc-700 text-sky-400 w-full text-center max-w-lg shrink-0">
                        {currentReport.title}
                    </h2>

                    <div className="flex flex-col items-center justify-start flex-1 w-full max-w-xl gap-6 pt-4">
                        {!apiData ? (
                            /* Centered Upload Box (Only shown when no data exists) */
                            <div className="flex flex-col items-center gap-8 p-10 bg-zinc-800 rounded-xl border border-zinc-700 shadow-2xl mt-12">
                                <h3 className="text-xl font-semibold text-slate-300">Upload a Prescription for AI Analysis</h3>
                                <p className="text-sm text-slate-500">Accepts Images and PDFs of prescriptions or medicine packaging.</p>
                            </div>
                        ) : (
                            /* Analysis Data Display (Uses PrescriptionDataDisplay component) */
                            <PrescriptionDataDisplay apiData={apiData} />
                        )}
                    </div>
                </div>

                {/* Fixed Bottom Upload Bar */}
                <div 
                    className="fixed bottom-0 left-0 right-0 md:left-80 flex items-center justify-center p-4 border-t border-zinc-700 z-10 shadow-inner"
                    style={{ backgroundColor: SECONDARY_BG_COLOR }}
                >
                    <div className="flex items-center justify-center max-w-2xl w-full gap-4">
                        <button
                            className="flex flex-col items-center justify-center p-4 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors border border-zinc-600 w-32 h-20"
                            onClick={() => alert("Camera feature not implemented yet, using file upload.")}
                            aria-label="Capture image"
                            disabled={loading}
                        >
                            <Camera size={28} className="text-sky-400 mb-1" />
                            <span className="text-sm">Use Camera</span>
                        </button>
                        <button
                            onClick={() => fileInputRef.current.click()}
                            className="flex-1 flex flex-col items-center justify-center p-4 bg-sky-600 hover:bg-sky-500 rounded-lg text-white font-semibold transition-colors border border-sky-500 w-full h-20"
                            aria-label="Upload prescription file"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={28} className="animate-spin mb-1" />
                                    <span className="text-sm">Processing File...</span>
                                </>
                            ) : (
                                <>
                                    <Upload size={28} className="mb-1" />
                                    <span className="text-sm">Upload File</span>
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