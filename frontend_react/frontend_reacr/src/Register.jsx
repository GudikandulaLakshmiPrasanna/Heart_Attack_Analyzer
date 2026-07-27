import React, { useState } from 'react';
import { jsPDF } from 'jspdf';

function Register() {
  const [formData, setFormData] = useState({
    age: '',
    gender: '1',          // ML Model: sex (1 = Male, 0 = Female)
    weight: '',
    bloodPressure: '',    // ML Model: trtbps
    cholesterol: '',       // ML Model: chol
    
    // clinical and life fields
    cp: '0',              // Chest Pain Type (0 to 3)
    restecg: '0',         // Resting ECG (0 to 2)
    thalachh: '',         // Maximum Heart Rate Achieved
    exng: '0',            // Exercise Induced Angina (1 = Yes, 0 = No)
    diabetes: '0',        // Diabetes (1 = Yes, 0 = No)
    smoking: '0',         // Smoking Status (1 = Yes, 0 = No)
    familyHistory: '0',   // Family History of Heart Disease (1 = Yes, 0 = No)
    troponin: '',         // Troponin Levels (Optional)

    
    fbs: '0',
    oldpeak: '0.0',
    slp: '2',
    caa: '0',
    thall: '2'
  });

  const [aiReport, setAiReport] = useState(""); 
  const [mlRisk, setMlRisk] = useState("");             // 🎯 ప్రతి వ్యక్తికి విడిగా రిస్క్ స్టోర్ చేయడానికి
  const [mlProbability, setMlProbability] = useState(0); // 🎯 ప్రతి వ్యక్తికి ఒరిజినల్ పర్సంటేజ్ స్టోర్ చేయడానికి
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAiReport("");
    setMlRisk("");          // for new prediction old data reset
    setMlProbability(0);

    const payload = {
      age: parseInt(formData.age) || 0,
      sex: parseInt(formData.gender) || 1,
      cp: parseInt(formData.cp) || 0,
      trtbps: parseInt(formData.bloodPressure) || 120, 
      chol: parseInt(formData.cholesterol) || 200,     
      fbs: parseInt(formData.fbs) || (formData.diabetes === '1' ? 1 : 0),
      restecg: parseInt(formData.restecg) || 0,
      thalachh: parseInt(formData.thalachh) || 150,    
      exng: parseInt(formData.exng) || 0,
      oldpeak: parseFloat(formData.oldpeak) || 0.0,
      slp: parseInt(formData.slp) || 2,
      caa: parseInt(formData.caa) || 0,
      thall: parseInt(formData.thall) || 2,
      
      weight: parseInt(formData.weight) || 70,
      diabetes: parseInt(formData.diabetes) || 0,
      smoking: parseInt(formData.smoking) || 0,
      family_history: parseInt(formData.familyHistory) || 0,
      troponin: formData.troponin ? parseFloat(formData.troponin) : null
    };

    try {
      const response = await fetch('http://127.0.0.1:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }
      
      const data = await response.json();
      
      // 🎯 from backend orginal Kaggle model is savedhere dynamically!
      setMlRisk(data.heart_attack_risk === 1 ? "HIGH RISK" : "LOW RISK");
      setMlProbability(data.probability);
      setAiReport(data.gen_ai_report);
    } catch (error) {
      console.error("Error:", error);
      setAiReport("Failed to connect to AI server. Please ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  // multi page  PDF  download 
  const downloadPDF = () => {
    if (!aiReport) return;
    const doc = new jsPDF();
    
    // PDF header styling
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(220, 38, 38); 
    doc.text("HeartAI - Personalized Medical Report", 20, 20);
    
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 26, 190, 26); 

    // body text setting
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(50, 50, 50);

    // geminii report is breaked accourding to page width
    const splitReport = doc.splitTextToSize(aiReport, 170);
    
    let yAxis = 35;          //  first page starting point
    const pageHeight = 280;  // A4  size maximum height

    // 
    for (let i = 0; i < splitReport.length; i++) {
      if (yAxis > pageHeight) {
        doc.addPage();       // new page creation!
        yAxis = 20;          //  In the new page again satted from the first
      }
      doc.text(splitReport[i], 20, yAxis);
      yAxis += 7;            //  (Line spacing)
    }

    // finally full PDF saved
    doc.save(`HeartAI_Gemini_Report.pdf`);
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-8 bg-base-100/90 backdrop-blur-md shadow-2xl rounded-3xl border border-base-300 transition-all duration-300">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-black text-primary transition-all duration-300">Heart Health AI Analyzer</h1>
        <p className="text-base-content/60 mt-1 text-sm">Advanced Kaggle ML & Gemini AI Clinical Assessment</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Basic Fields */}
        <div>
          <label className="block text-sm font-semibold text-base-content/80 mb-1">Age</label>
          <input type="number" name="age" value={formData.age} onChange={handleChange} className="input input-bordered w-full rounded-xl focus:outline-none" required />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-base-content/80 mb-1">Gender</label>
          <select name="gender" value={formData.gender} onChange={handleChange} className="select select-bordered w-full rounded-xl focus:outline-none">
            <option value="1">Male</option>
            <option value="0">Female</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-base-content/80 mb-1">Weight (kg)</label>
          <input type="number" name="weight" value={formData.weight} onChange={handleChange} className="input input-bordered w-full rounded-xl focus:outline-none" required />
        </div>

        <div>
          <label className="block text-sm font-semibold text-base-content/80 mb-1">Blood Pressure (mmHg)</label>
          <input type="number" name="bloodPressure" value={formData.bloodPressure} onChange={handleChange} className="input input-bordered w-full rounded-xl focus:outline-none" required />
        </div>

        <div>
          <label className="block text-sm font-semibold text-base-content/80 mb-1">Cholesterol (mg/dL)</label>
          <input type="number" name="cholesterol" value={formData.cholesterol} onChange={handleChange} className="input input-bordered w-full rounded-xl focus:outline-none" required />
        </div>

        <div>
          <label className="block text-sm font-semibold text-base-content/80 mb-1">Heart Rate (thalachh)</label>
          <input type="number" name="thalachh" value={formData.thalachh} onChange={handleChange} placeholder="e.g. 150" className="input input-bordered w-full rounded-xl focus:outline-none" required />
        </div>

        {/* Clinical Dropdowns */}
        <div>
          <label className="block text-sm font-semibold text-base-content/80 mb-1">Chest Pain Type</label>
          <select name="cp" value={formData.cp} onChange={handleChange} className="select select-bordered w-full rounded-xl focus:outline-none">
            <option value="0">Typical Angina</option>
            <option value="1">Atypical Angina</option>
            <option value="2">Non-anginal Pain</option>
            <option value="3">Asymptomatic</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-base-content/80 mb-1">Resting ECG</label>
          <select name="restecg" value={formData.restecg} onChange={handleChange} className="select select-bordered w-full rounded-xl focus:outline-none">
            <option value="0">Normal</option>
            <option value="1">ST-T Wave Abnormality</option>
            <option value="2">Left Ventricular Hypertrophy</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-base-content/80 mb-1">Exercise Induced Angina</label>
          <select name="exng" value={formData.exng} onChange={handleChange} className="select select-bordered w-full rounded-xl focus:outline-none">
            <option value="0">No</option>
            <option value="1">Yes</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-base-content/80 mb-1">Diabetes Status</label>
          <select name="diabetes" value={formData.diabetes} onChange={handleChange} className="select select-bordered w-full rounded-xl focus:outline-none">
            <option value="0">No</option>
            <option value="1">Yes</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-base-content/80 mb-1">Smoking History</label>
          <select name="smoking" value={formData.smoking} onChange={handleChange} className="select select-bordered w-full rounded-xl focus:outline-none">
            <option value="0">Non-Smoker</option>
            <option value="1">Smoker</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-base-content/80 mb-1">Family Heart History</label>
          <select name="familyHistory" value={formData.familyHistory} onChange={handleChange} className="select select-bordered w-full rounded-xl focus:outline-none">
            <option value="0">No History</option>
            <option value="1">Has Family History</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-base-content/80 mb-1">Troponin Level (ng/mL) - Optional</label>
          <input type="number" step="0.01" name="troponin" value={formData.troponin} onChange={handleChange} placeholder="Leave blank if not available" className="input input-bordered w-full rounded-xl focus:outline-none" />
        </div>

        <div className="md:col-span-2 mt-4">
          <button type="submit" disabled={loading} className="w-full btn btn-primary text-primary-content py-3 rounded-xl text-lg font-bold normal-case shadow-lg transition-all duration-300">
            {loading ? "Analyzing Medical Data..." : "Get Detailed AI Analysis"}
          </button>
        </div>
      </form>

      {/* 📊 🎯 Dynamic Response UI Box */}
      {aiReport && (
        <div className="mt-8 p-6 bg-base-200 border border-base-300 rounded-2xl text-center space-y-4 transition-all duration-300">
          
          {/* every ones data  dynamicallyy changed box! */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className={`p-4 border rounded-xl text-center ${mlRisk === "HIGH RISK" ? "bg-error/10 border-error/20" : "bg-success/10 border-success/20"}`}>
              <span className="block text-xs uppercase font-bold text-base-content/60 mb-1">Kaggle ML Prediction</span>
              <span className={`text-2xl font-black ${mlRisk === "HIGH RISK" ? "text-error" : "text-success"}`}>
                {mlRisk}
              </span>
            </div>
            
            <div className="p-4 bg-warning/10 border border-warning/20 rounded-xl text-center">
              <span className="block text-xs uppercase font-bold text-base-content/60 mb-1">Heart Attack Probability</span>
              <span className="text-2xl font-black text-warning">
                {mlProbability.toFixed(1)}%
              </span>
            </div>
          </div>

          <hr className="border-base-300 my-2" />

          <h3 className="text-xl font-bold text-primary">Gemini AI Clinical Analysis Report</h3>
          
          <div className="text-left text-base-content text-sm bg-base-100 p-4 rounded-xl max-h-80 overflow-y-auto whitespace-pre-line border border-base-300 shadow-inner">
            {aiReport}
          </div>

          <button onClick={downloadPDF} className="w-full btn btn-success text-success-content font-bold py-3 px-4 rounded-xl shadow-md normal-case transition-all duration-300">
            📥 Download Complete Gemini Report (PDF)
          </button>
        </div>
      )}
    </div>
  );
}

export default Register;