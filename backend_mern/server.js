require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const nodemailer = require('nodemailer');
const multer = require('multer');
const bcrypt = require('bcryptjs');

const upload = multer({ dest: 'uploads/' });

const app = express();
app.use(express.json());
app.use(cors());

// 1. MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/heart_disease_db';
mongoose.connect(MONGO_URI)
  .then(() => console.log("yes... MongoDB Compass it was connected !"))
  .catch((err) => console.error("in database connection:", err));

// -------------------------------------------------------------
// 🔑 2. USER AUTHENTICATION
// -------------------------------------------------------------
const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', UserSchema);

app.post('/api/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ status: 'error', message: 'Email already exists! Please Login.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();
        res.json({ status: 'success', message: 'Signup successful! Please login.' });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ status: 'error', message: 'Server error during signup' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ status: 'error', message: 'User not found! Please Sign Up first.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ status: 'error', message: 'Invalid email or password!' });
        }

        res.json({
            status: 'success',
            message: 'Login successful!',
            user: { name: user.name, email: user.email }
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ status: 'error', message: 'Server error during login' });
    }
});

// -------------------------------------------------------------
// 🩺 3. PATIENT DATA & PREDICTION
// -------------------------------------------------------------
const PatientSchema = new mongoose.Schema({
    age: Number, sex: Number, cp: Number, trtbps: Number, chol: Number,
    fbs: Number, restecg: Number, thalachh: Number, exng: Number,
    oldpeak: Number, slp: Number, caa: Number, thall: Number,
    prediction: Number,
    probability: Number,
    gen_ai_report: String,
    createdAt: { type: Date, default: Date.now }
});
const Patient = mongoose.model('Patient', PatientSchema);

app.get('/', (req, res) => {
    res.send("hello! MERN Node.js server + MongoDB ready!");
});

app.post('/api/predict', async (req, res) => {
    try {
        const patientData = req.body;
        const pythonResponse = await axios.post('http://127.0.0.1:8000/predict', patientData);
        const { heart_attack_risk, probability, gen_ai_report } = pythonResponse.data;

        const newPatientReport = new Patient({
            ...patientData,
            prediction: heart_attack_risk,
            probability: probability,
            gen_ai_report: gen_ai_report
        });
        await newPatientReport.save();

        res.json({
            success: true,
            message: "In the database the data was saved successfully!",
            risk: heart_attack_risk,
            probability: probability,
            report: gen_ai_report
        });

    } catch (error) {
        console.error("error:", error.message);
        res.status(500).json({ success: false, message: "In server some problem came!" });
    }
});

// -------------------------------------------------------------
// 📩 4. DOCTOR CONSULTATION & EMAIL ROUTE (DYNAMIC)
// -------------------------------------------------------------
const DoctorReportSchema = new mongoose.Schema({
    patientName: String,
    patientEmail: String,
    doctorEmail: String,
    reportFileName: String,
    createdAt: { type: Date, default: Date.now }
});
const DoctorReport = mongoose.model('DoctorReport', DoctorReportSchema);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER || 'classnotwo1223@gmail.com',
        pass: process.env.GMAIL_PASS
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.error("❌ Nodemailer Gmail Config Error:", error.message);
    } else {
        console.log("✅ Gmail Nodemailer ready to send emails!");
    }
});

app.post('/api/send-report-to-doctor', upload.single('reportFile'), async (req, res) => {
    try {
        console.log("📥 Received Body:", req.body);
        console.log("📎 Received File:", req.file ? req.file.originalname : "No File");

        // 1. ఫ్రంటెండ్ నుంచి పంపిన User Email తీసుకోబడుతుంది
        const userEmail = req.body.userEmail || req.body.email;
        if (!userEmail) {
            return res.status(400).json({ status: 'error', message: 'Patient email is required!' });
        }

        const TARGET_DOCTOR_EMAIL = process.env.DOCTOR_EMAIL || "classnotwo1223@gmail.com";

        // 2. Database లో Patient వివరాలు వెతకడం
        let patientDetails = await User.findOne({ email: { $regex: new RegExp(`^${userEmail.trim()}$`, 'i') } });

        // 3. పేరుని dynamic గా డ్రా చేసుకోవడం (DB లో ఉన్న పేరు లేదా Frontend నుండి వచ్చిన పేరు)
        const patientName = req.body.patientName || (patientDetails ? patientDetails.name : "Patient");
        const finalPatientEmail = userEmail.trim();

        // 4. Consultation Record సేవ్ చేయడం
        const newDoctorReport = new DoctorReport({
            patientName: patientName,
            patientEmail: finalPatientEmail,
            doctorEmail: TARGET_DOCTOR_EMAIL,
            reportFileName: req.file ? req.file.originalname : 'No File'
        });
        await newDoctorReport.save();

        // 5. Dynamic Details తో Email Sending
        const mailOptions = {
            from: `"HeartAI Portal" <${TARGET_DOCTOR_EMAIL}>`,
            to: TARGET_DOCTOR_EMAIL,
            subject: `🚨 Patient Assessment Report - ${patientName}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h2 style="color: #4F46E5;">HeartAI Patient Medical Consultation</h2>
                    <hr />
                    <h3>👤 Patient Details:</h3>
                    <p><strong>Name:</strong> ${patientName}</p>
                    <p><strong>Email:</strong> ${finalPatientEmail}</p>
                    <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                    <hr />
                    <p style="color: #059669; font-weight: bold;">
                        📎 Please find attached the Gemini AI Health Report provided by the patient.
                    </p>
                </div>
            `,
            attachments: req.file ? [
                {
                    filename: req.file.originalname,
                    path: req.file.path
                }
            ] : []
        };

        await transporter.sendMail(mailOptions);
        console.log(`✉️ Email sent successfully for Patient: ${patientName} (${finalPatientEmail})`);

        return res.json({
            status: 'success',
            message: `Report for ${patientName} (${finalPatientEmail}) successfully sent to Doctor!`
        });

    } catch (error) {
        console.error("❌ Doctor report sending error:", error);
        return res.status(500).json({ status: 'error', message: error.message || 'Failed to process report or send mail' });
    }
});

// -------------------------------------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`MERN server http://localhost:${PORT} it was running!`);
});