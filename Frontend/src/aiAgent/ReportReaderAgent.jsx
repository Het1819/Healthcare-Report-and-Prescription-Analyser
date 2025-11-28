import React, { useState, useRef } from "react";
import { Camera, Upload, ArrowLeft, Bot, Plus, MessageSquare, Trash2, Menu, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

// --- Color Definitions (Matching DoctorAgent.jsx) ---
const MAIN_BG_COLOR = "#18181B"; // Deep Black/Dark Gray (bg-zinc-900 equivalent)
const SECONDARY_BG_COLOR = "#0F0F11"; // Near Black for sidebar/input bar
const ACCENT_BUTTON_STYLE = {
    background: "linear-gradient(90deg, #079A82 0%, #15B3A1 100%)",
    boxShadow: "0 4px 15px rgba(21, 179, 161, 0.4)",
};

// --- Sidebar report item ---
const ReportHistoryItem = ({ report, currentReport, onClick, onDelete }) => (
  <div
    className={`p-3 cursor-pointer transition-all rounded-lg text-sm truncate flex items-center justify-between group border ${
      report.id === currentReport.id
        ? "bg-sky-700/50 text-sky-100 border-sky-600 font-semibold"
        : "bg-zinc-800 hover:bg-zinc-700 border-zinc-700" // Updated to zinc colors
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
      aria-label={`Delete report ${report.title}`}
    >
      <Trash2 size={16} />
    </button>
  </div>
);

// --- Main ReportReader component ---
export default function ReportReader() {
  const navigate = useNavigate();
  const AGENT_NAME = "AI Report Analyst";
  const BACKEND_URL = "http://127.0.0.1:5001/analyze_reports"; // Define backend URL

  // UPDATED: Initial reports array now contains only one item named "Report Analysis"
  const initialReports = [
    { id: 1, title: "Report Analysis", fileName: null, apiData: null },
  ];

  const [reports, setReports] = useState(initialReports);
  const [currentReport, setCurrentReport] = useState(initialReports[0]);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const fileInputRef = useRef(null);

  const createNewReport = () => {
    const newReport = { id: Date.now(), title: `New Report`, fileName: null, apiData: null };
    setReports([newReport, ...reports]);
    setCurrentReport(newReport);
    setIsSidebarOpen(false);
  };

  const handleDeleteReport = (reportId) => {
    const updatedReports = reports.filter((r) => r.id !== reportId);
    if (updatedReports.length === 0) createNewReport();
    else {
      if (currentReport.id === reportId) setCurrentReport(updatedReports[0]);
      setReports(updatedReports);
    }
  };
  
  const handleReportSelection = (report) => {
    setCurrentReport(report);
    setIsSidebarOpen(false);
  }

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(BACKEND_URL, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
          throw new Error(data.error || "Server returned an error.");
      }

      const updatedReport = {
        ...currentReport,
        title: `Analysis: ${file.name.substring(0, 25)}...`,
        fileName: file.name,
        apiData: data,
      };

      setReports(reports.map((r) => (r.id === currentReport.id ? updatedReport : r)));
      setCurrentReport(updatedReport);
    } catch (err) {
      console.error(err);
      alert("Failed to process the report. " + err.message);
    } finally {
      setLoading(false);
      e.target.value = null;
    }
  };

  if (!currentReport) return <div className="p-10 text-center">No report selected.</div>;

  const { apiData } = currentReport;

  return (
    // FIX 1: Set main background color
    <div className="flex h-screen text-slate-100 overflow-hidden" style={{ backgroundColor: MAIN_BG_COLOR }}>
      
      {/* Sidebar (Responsive implementation) */}
      <div
        // FIX 2: Set sidebar background color
        className={`fixed inset-y-0 left-0 w-full md:w-80 border-r border-zinc-700 p-4 flex flex-col shrink-0 z-20 transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ backgroundColor: SECONDARY_BG_COLOR }}
      >
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-700">
          <button
            onClick={() => navigate("/")}
            // FIX 3: Update back button background
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

        {/* New Report Button - FIX 4: Applied gradient style */}
        <button
          onClick={createNewReport}
          className="w-full mb-6 flex items-center justify-center gap-2 p-3 rounded-lg text-white font-semibold transition-colors shadow-lg hover:opacity-90"
          style={ACCENT_BUTTON_STYLE}
        >
          <Plus size={20} /> New Analysis
        </button>

        <h3 className="text-lg font-semibold mb-3 flex items-center text-slate-300">
          <MessageSquare size={18} className="mr-2" /> Report History
        </h3>
        <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
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

      {/* Main Panel */}
      <div className="flex-1 flex flex-col relative overflow-hidden" style={{ backgroundColor: MAIN_BG_COLOR }}>
        
        {/* Mobile Header Bar (for Menu/Title) */}
        <div 
          className="md:hidden w-full p-3 border-b border-zinc-700 flex items-center justify-between shadow-lg z-10 shrink-0"
          style={{ backgroundColor: SECONDARY_BG_COLOR }}
        >
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
            aria-label="New report"
          >
            <Plus size={20} />
          </button>
        </div>
        
        {/* Main Content Area */}
        {/* Use pb-28/32 to leave space for the fixed bottom chatbar */}
        <div className="flex-1 flex flex-col items-center p-4 md:p-8 relative overflow-y-auto custom-scrollbar pb-32 md:pb-40"> 
            
            {/* Desktop Header/Title */}
            <h2 className="hidden md:block text-2xl font-bold mb-8 pb-2 border-b border-zinc-700 text-sky-400 w-full text-center max-w-lg shrink-0">
              {currentReport.title}
            </h2>

            <div className="flex flex-col items-center justify-start flex-1 w-full max-w-xl gap-6 pt-4">
              {!apiData ? (
                /* Centered Upload Box (Only shown when no data exists) */
                <div className="flex flex-col items-center gap-8 p-10 bg-zinc-800 rounded-xl border border-zinc-700 shadow-2xl mt-12">
                  <h3 className="text-xl font-semibold text-slate-300">Upload a Report for AI Analysis</h3>
                  <p className="text-sm text-slate-500">Accepts Images, PDFs, and DICOM formats.</p>
                </div>
              ) : (
                /* Report Data Display */
                <div className="w-full space-y-6">
                  {/* Patient Profile */}
                  <div className="bg-zinc-800 p-6 rounded-lg border border-zinc-700 shadow">
                    <h3 className="text-lg font-bold text-green-400 mb-2">Patient Profile</h3>
                    <p><strong>Name:</strong> {apiData.patient_profile.name}</p>
                    <p><strong>Age:</strong> {apiData.patient_profile.age || "N/A"}</p>
                    <p><strong>Gender:</strong> {apiData.patient_profile.gender}</p>
                    <p><strong>History:</strong> {apiData.patient_profile.history}</p>
                    <p><strong>Complaints:</strong> {apiData.patient_profile.complaints}</p>
                  </div>

                  {/* Structured Medical Data */}
                  <div className="bg-zinc-800 p-6 rounded-lg border border-zinc-700 shadow">
                    <h3 className="text-lg font-bold text-green-400 mb-2">Diagnostic Results</h3>
                    <p><strong>Test Name:</strong> {apiData.structured_medical_data.content.diagnostic?.test_name}</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      {apiData.structured_medical_data.content.diagnostic?.results?.map((r, idx) => (
                        <li key={idx}>
                          <strong>{r.item}:</strong> {r.value} {r.unit} — Status: {r.flag || "Normal"}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-2"><strong>Provider:</strong> {apiData.structured_medical_data.provider?.name} ({apiData.structured_medical_data.provider?.facility})</p>
                    <p className="mt-2"><strong>Summary:</strong> {apiData.structured_medical_data.summary}</p>
                  </div>

                  {/* Consultation Summary */}
                  <div className="bg-zinc-800 p-6 rounded-lg border border-zinc-700 shadow">
                    <h3 className="text-lg font-bold text-green-400 mb-2">Consultation Summary</h3>
                    <div dangerouslySetInnerHTML={{ __html: apiData.consultation_summary_html }} />
                  </div>
                </div>
              )}
            </div>
        </div>

        {/* FIX 7: Fixed Bottom Upload Bar (from PrescriptionReaderAgent) */}
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