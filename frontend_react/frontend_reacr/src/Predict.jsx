import React, { useState } from 'react';
import { jsPDF } from 'jspdf';

export default function Predict() {
  const loggedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userName = loggedUser?.name || loggedUser?.username || "Patient";

  const [formData, setFormData] = useState({
    name: userName,
    age: '', 
    gender: '0', 
    weight: '', 
    bloodPressure: '', 
    cholesterol: '', 
    cp: '0', // 0 = Low Risk (Asymptomatic)
    restecg: '0', 
    thalachh: '', 
    exng: '0', 
    diabetes: '0', 
    smoking: '0', 
    familyHistory: '0', 
    troponin: '', 
    fbs: '0', 
    oldpeak: '0.0', 
    slp: '2', 
    caa: '0', 
    thall: '2'
  });

  const [aiReport, setAiReport] = useState(""); 
  const [mlRisk, setMlRisk] = useState(""); 
  const [mlProbability, setMlProbability] = useState(0); 
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAiReport(""); 
    setMlRisk(""); 
    setMlProbability(0);

    const payload = {
      name: formData.name,
      age: parseInt(formData.age) || 30,
      sex: parseInt(formData.gender), 
      cp: parseInt(formData.cp), 
      trtbps: parseInt(formData.bloodPressure) || 120, 
      chol: parseInt(formData.cholesterol) || 180, 
      fbs: parseInt(formData.fbs) || (formData.diabetes === '1' ? 1 : 0),
      restecg: parseInt(formData.restecg) || 0,
      thalachh: parseInt(formData.thalachh) || 160, 
      exng: parseInt(formData.exng) || 0,
      oldpeak: parseFloat(formData.oldpeak) || 0.0,
      slp: parseInt(formData.slp) || 2,
      caa: parseInt(formData.caa) || 0,
      thall: parseInt(formData.thall) || 2,
      weight: parseInt(formData.weight) || 60,
      diabetes: parseInt(formData.diabetes) || 0,
      smoking: parseInt(formData.smoking) || 0,
      family_history: parseInt(formData.familyHistory) || 0,
      troponin: formData.troponin ? parseFloat(formData.troponin) : 0.01
    };

    try {
      // ✅ Render Backend API URL ఇక్కడ చేర్చాం
      const response = await fetch('https://heart-attack-analyzer.onrender.com/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) throw new Error(`Server status: ${response.status}`);
      
      const data = await response.json();
      const prob = data.probability || 0;

      // 🎯 Dynamic Risk Calculation
      let finalRisk = data.mlRisk;
      if (!finalRisk) {
        if (prob >= 65) {
          finalRisk = "HIGH RISK";
        } else if (prob >= 35) {
          finalRisk = "MEDIUM RISK";
        } else {
          finalRisk = "LOW RISK";
        }
      }
      
      setMlRisk(finalRisk);
      setMlProbability(prob);
      setAiReport(data.gen_ai_report);
    } catch (error) {
      console.error("Error:", error);
      setAiReport("Failed to connect to server. Ensure Backend on Render is awake and running.");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!aiReport) return;
    const doc = new jsPDF();
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(220, 38, 38); 
    doc.text(`HeartAI Report: ${formData.name}`, 20, 20);
    doc.line(20, 26, 190, 26); 

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(50, 50, 50);

    const splitReport = doc.splitTextToSize(aiReport, 170);
    let yAxis = 35; 

    for (let i = 0; i < splitReport.length; i++) {
      if (yAxis > 280) {
        doc.addPage();
        yAxis = 20; 
      }
      doc.text(splitReport[i], 20, yAxis);
      yAxis += 7; 
    }
    doc.save(`${formData.name}_HeartAI_Report.pdf`);
  };

  // 🎨 Risk Level UI Dynamic Helpers
  const getCardBg = () => {
    if (mlRisk === "HIGH RISK") return "bg-error/10 border-error/20";
    if (mlRisk === "MEDIUM RISK") return "bg-warning/10 border-warning/20";
    return "bg-success/10 border-success/20";
  };

  const getTextColor = () => {
    if (mlRisk === "HIGH RISK") return "text-error";
    if (mlRisk === "MEDIUM RISK") return "text-warning";
    return "text-success";
  };

  return (
    <div className="max-w-2xl mx-auto my-10 p-8 bg-base-100 shadow-2xl rounded-3xl border">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-black text-primary">Heart Assessment Form</h1>
        <p className="text-sm opacity-70">Logged in Patient: <b>{formData.name}</b></p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Age</label>
          <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="e.g. 28" className="input input-bordered w-full rounded-xl" required />
        </div>
        
        <div>
          <label className="block text-sm font-semibold mb-1">Gender</label>
          <select name="gender" value={formData.gender} onChange={handleChange} className="select select-bordered w-full rounded-xl">
            <option value="0">Female</option>
            <option value="1">Male</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Weight (kg)</label>
          <input type="number" name="weight" value={formData.weight} onChange={handleChange} placeholder="e.g. 55" className="input input-bordered w-full rounded-xl" required />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Blood Pressure (mmHg)</label>
          <input type="number" name="bloodPressure" value={formData.bloodPressure} onChange={handleChange} placeholder="e.g. 115" className="input input-bordered w-full rounded-xl" required />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Cholesterol (mg/dL)</label>
          <input type="number" name="cholesterol" value={formData.cholesterol} onChange={handleChange} placeholder="e.g. 165" className="input input-bordered w-full rounded-xl" required />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Heart Rate (thalachh)</label>
          <input type="number" name="thalachh" value={formData.thalachh} onChange={handleChange} placeholder="e.g. 168" className="input input-bordered w-full rounded-xl" required />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Chest Pain Type</label>
          <select name="cp" value={formData.cp} onChange={handleChange} className="select select-bordered w-full rounded-xl">
            <option value="0">No Chest Pain (Asymptomatic - Low Risk)</option>
            <option value="1">Atypical Angina (Arm/Jaw Pain)</option>
            <option value="2">Non-anginal Pain (Gas / Acid reflux)</option>
            <option value="3">Typical Angina (Heavy Pain - High Risk)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Resting ECG</label>
          <select name="restecg" value={formData.restecg} onChange={handleChange} className="select select-bordered w-full rounded-xl">
            <option value="0">Normal</option>
            <option value="1">ST-T Wave Abnormality</option>
            <option value="2">Left Ventricular Hypertrophy</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Exercise Induced Angina</label>
          <select name="exng" value={formData.exng} onChange={handleChange} className="select select-bordered w-full rounded-xl">
            <option value="0">No Pain during Exercise</option>
            <option value="1">Yes (Chest Pain during Exercise)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Diabetes Status</label>
          <select name="diabetes" value={formData.diabetes} onChange={handleChange} className="select select-bordered w-full rounded-xl">
            <option value="0">No Diabetes</option>
            <option value="1">Has Diabetes</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Smoking History</label>
          <select name="smoking" value={formData.smoking} onChange={handleChange} className="select select-bordered w-full rounded-xl">
            <option value="0">Non-Smoker</option>
            <option value="1">Smoker</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Family Heart History</label>
          <select name="familyHistory" value={formData.familyHistory} onChange={handleChange} className="select select-bordered w-full rounded-xl">
            <option value="0">No Family History</option>
            <option value="1">Has Family History</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold mb-1">Troponin Level (ng/mL) - Optional</label>
          <input type="number" step="0.01" name="troponin" value={formData.troponin} onChange={handleChange} placeholder="e.g. 0.01" className="input input-bordered w-full rounded-xl" />
        </div>

        <div className="md:col-span-2 mt-4">
          <button type="submit" disabled={loading} className="w-full btn btn-primary py-3 rounded-xl text-lg font-bold">
            {loading ? "Analyzing..." : "Get Detailed AI Analysis"}
          </button>
        </div>
      </form>

      {aiReport && (
        <div className="mt-8 p-6 bg-base-200 border rounded-2xl text-center space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            
            <div className={`p-4 border rounded-xl text-center ${getCardBg()}`}>
              <span className="block text-xs uppercase font-bold opacity-60 mb-1">Prediction</span>
              <span className={`text-2xl font-black ${getTextColor()}`}>{mlRisk}</span>
            </div>
            
            <div className="p-4 bg-warning/10 border border-warning/20 rounded-xl text-center">
              <span className="block text-xs uppercase font-bold opacity-60 mb-1">Probability</span>
              <span className="text-2xl font-black text-warning">{mlProbability.toFixed(1)}%</span>
            </div>
          </div>

          <h3 className="text-xl font-bold text-primary">Gemini AI Report</h3>
          <div className="text-left text-sm bg-base-100 p-4 rounded-xl max-h-80 overflow-y-auto whitespace-pre-line border shadow-inner">
            {aiReport}
          </div>

          <button onClick={downloadPDF} className="w-full btn btn-success font-bold py-3 rounded-xl shadow-md">
            📥 Download Report PDF
          </button>
        </div>
      )}
    </div>
  );
}