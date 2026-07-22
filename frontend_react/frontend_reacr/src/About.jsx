import React from 'react';

const About = () => {
  return (
    <div style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'Poppins, sans-serif' }}>
      
      {/* 🚀 Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: '#4A154B', fontSize: '32px', fontWeight: 'bold' }}>
          HeartAI - User Guide & Parameter Assessment
        </h1>
        <p style={{ color: '#666', fontSize: '16px', marginTop: '10px' }}>
          Comprehensive guide on how to fill in clinical parameters for accurate heart attack risk prediction.
        </p>
      </div>

      {/* 📋 Parameter Guide Section */}
      <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <h2 style={{ color: '#2C3E50', fontSize: '22px', marginBottom: '20px', borderBottom: '2px solid #edf2f7', paddingBottom: '10px' }}>
          🩺 Medical Parameters & How to Fill Them
        </h2>

        {/* 1. Basic Vitals */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ color: '#3182ce', fontSize: '18px', marginBottom: '8px' }}>
            1. Basic Vitals & Patient Details
          </h3>
          <p style={{ color: '#4a5568', lineHeight: '1.7', margin: 0 }}>
            <strong>• Age & Gender:</strong> Select the patient's age in years and legal gender.<br />
            <strong>• Weight (kg):</strong> Enter the current body weight in kilograms.<br />
            <strong>• Blood Pressure (mmHg):</strong> Enter the <i>Systolic Blood Pressure</i> (the top number on a BP monitor, e.g., enter 120 if your reading is 120/80 mmHg).<br />
            <strong>• Cholesterol (mg/dL):</strong> Enter the <i>Total Cholesterol</i> value obtained from a standard Lipid Profile blood test (e.g., 180 or 210 mg/dL).
          </p>
        </div>

        {/* 2. Heart Metrics */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ color: '#3182ce', fontSize: '18px', marginBottom: '8px' }}>
            2. Cardiac Tests & ECG Scans
          </h3>
          <p style={{ color: '#4a5568', lineHeight: '1.7', margin: 0 }}>
            <strong>• Maximum Heart Rate (thalachh):</strong> The peak heart rate achieved during physical exertion or stress testing (typically ranges between 100 and 180 bpm).<br />
            <strong>• Chest Pain Type:</strong> <br />
            &nbsp;&nbsp;- <i>Typical Angina:</i> Classic heavy chest pressure or squeezing sensation.<br />
            &nbsp;&nbsp;- <i>Atypical Angina:</i> Discomfort spreading to jaw, shoulders, or back.<br />
            &nbsp;&nbsp;- <i>Non-anginal Pain:</i> Chest pain caused by non-cardiac issues like acid reflux/gas.<br />
            &nbsp;&nbsp;- <i>Asymptomatic:</i> No chest pain present.<br />
            <strong>• Resting ECG:</strong> Select based on your Electrocardiogram test report:<br />
            &nbsp;&nbsp;- <i>Normal:</i> Standard ECG waveform without abnormalities.<br />
            &nbsp;&nbsp;- <i>ST-T Wave Abnormality:</i> Indicates minor ST segment or T wave shifts.<br />
            &nbsp;&nbsp;- <i>Left Ventricular Hypertrophy:</i> Shows thickening of the heart's main pumping chamber.
          </p>
        </div>

        {/* 3. Clinical & Lifestyle Factors */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ color: '#3182ce', fontSize: '18px', marginBottom: '8px' }}>
            3. Lifestyle & Specialized Clinical Markers
          </h3>
          <p style={{ color: '#4a5568', lineHeight: '1.7', margin: 0 }}>
            <strong>• Exercise Induced Angina:</strong> Select <i>Yes</i> if you experience chest tightness/pain during physical exertion or walking uphill; otherwise select <i>No</i>.<br />
            <strong>• Diabetes & Smoking Status:</strong> Specify if you have diagnosed diabetes and whether you are an active smoker.<br />
            <strong>• Family Heart History:</strong> Select <i>Yes</i> if immediate family members (parents/siblings) have a history of cardiovascular disease.<br />
            <strong>• Troponin Level (ng/mL) [Optional]:</strong> High-sensitivity Troponin blood test used in clinical setups to detect heart muscle damage (e.g., 0.01 - 0.04 ng/mL). You can leave this blank if not tested.
          </p>
        </div>

      </div>

      {/* ⚙️ How System Works */}
      <div style={{ backgroundColor: '#f7fafc', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '30px' }}>
        <h2 style={{ color: '#2C3E50', fontSize: '20px', marginBottom: '12px' }}>
          ⚙️ How the Prediction System Works
        </h2>
        <p style={{ color: '#4a5568', lineHeight: '1.7', margin: 0 }}>
          1. Once you submit the form, your data is processed through our <strong>FastAPI backend</strong>.<br />
          2. The trained <strong>Kaggle Machine Learning Model</strong> calculates your precise Heart Attack Risk percentage.<br />
          3. <strong>Google Gemini AI</strong> analyzes your combined clinical profile to generate customized diet plans, exercise recommendations, and key health targets.
        </p>
      </div>

      {/* ⚠️ Medical Disclaimer */}
      <div style={{ backgroundColor: '#fff5f5', borderLeft: '4px solid #e53e3e', padding: '15px 20px', borderRadius: '6px' }}>
        <p style={{ color: '#c53030', margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
          <strong>Medical Disclaimer:</strong> This application is meant solely for educational and preliminary screening purposes. It should not replace professional diagnosis or clinical decision-making by a certified Cardiologist.
        </p>
      </div>

    </div>
  );
};

export default About;