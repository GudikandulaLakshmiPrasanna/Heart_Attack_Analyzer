import React, { useState } from 'react';

export default function Contact({ user }) {
  const [reportFile, setReportFile] = useState(null);
  const [status, setStatus] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  // 🎯 ఇక్కడ నీ Doctor Email ID ఇవ్వు భాయ్
  const DOCTOR_EMAIL = "yourdoctor@gmail.com"; // 👈 నీ డాక్టర్ ఇమెయిల్ ఇక్కడ మార్చుకో

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!reportFile) {
      setStatus({ text: 'దయచేసి మీ Gemini AI Report ఫైల్‌ని అప్‌లోడ్ చేయండి!', type: 'error' });
      return;
    }

    setLoading(true);
    setStatus({ text: '', type: '' });

    const formData = new FormData();
    formData.append('userEmail', user?.email);
    formData.append('doctorEmail', DOCTOR_EMAIL);
    formData.append('reportFile', reportFile);

    try {
      const response = await fetch('http://localhost:5000/api/send-report-to-doctor', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        setStatus({ text: '✅ Gemini Report & Patient Details sent to Doctor successfully!', type: 'success' });
        setReportFile(null);
        e.target.reset(); // Clear input
      } else {
        setStatus({ text: data.message || 'Failed to send report!', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setStatus({ text: 'Backend Server connection error!', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] px-4">
      <div className="w-full max-w-lg p-8 bg-white shadow-2xl rounded-3xl border border-gray-100">
        
        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold text-indigo-600">Contact Doctor</h2>
          <p className="text-sm text-gray-500 mt-2">
            Logged in Patient: <span className="font-semibold text-gray-800">{user?.name} ({user?.email})</span>
          </p>
        </div>

        {status.text && (
          <div className={`p-3 mb-6 text-center text-sm font-bold rounded-xl ${
            status.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-600 border border-red-200'
          }`}>
            {status.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* 📄 Gemini AI Report File Upload (PDF / Image) */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Upload Gemini AI Health Report (PDF / File)
            </label>
            <input
              type="file"
              onChange={(e) => setReportFile(e.target.files[0])}
              className="w-full p-2 border border-gray-300 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
              required
            />
            <p className="text-xs text-gray-400 mt-2">
              *By Seeing this doctor gives you  Medications.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold text-lg shadow-lg transition duration-200"
          >
            {loading ? "Sending Report..." : "Send Report to Doctor"}
          </button>

        </form>

      </div>
    </div>
  );
}