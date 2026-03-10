process.chdir(__dirname);
require('dotenv').config();
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Groq = require('groq-sdk');

const app = express();

// --- 1. ENSURE UPLOADS DIRECTORY EXISTS ---
const uploadDir = '/tmp/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// --- 2. UPDATED MULTER CONFIGURATION ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = '.webm';
        cb(null, Date.now() + ext);
    }
});
const upload = multer({ storage: storage });

// --- 3. SECURE API INITIALIZATION ---
// REMOVED HARDCODED FALLBACK KEY TO PREVENT GITHUB PUSH ERRORS
const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
    console.error("❌ ERROR: GROQ_API_KEY is missing from .env file.");
    console.error("Deployment will fail. Please add your key to .env or Vercel Secrets.");
} else {
    console.log("✅ .env file loaded successfully!");
}

const groq = new Groq({ apiKey: apiKey });

app.use(express.static('public'));

// --- 4. VOICE RESPONSE ROUTE ---
app.post('/respond-to-voice', upload.single('audio'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).send("No audio uploaded.");

        const audioPath = req.file.path;

        // 1. STT: Transcription (Whisper v3)
        const transcription = await groq.audio.transcriptions.create({
            file: fs.createReadStream(audioPath),
            model: "whisper-large-v3",
            language: "en", 
        });

        console.log(`User Said: ${transcription.text}`);

        // 2. LLM: Chat Completion (Llama 3.1)
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { 
                    role: "system", 
                    content: "You are a helpful and concise voice assistant. IMPORTANT: You must respond ONLY in English. Do not use any other language." 
                },
                { role: "user", content: transcription.text }
            ],
            model: "llama-3.1-8b-instant", 
        });

        const aiResponse = chatCompletion.choices[0].message.content;
        console.log(`AI Replied: ${aiResponse}`);

        // 3. CLEANUP: Remove temp audio file
        fs.unlinkSync(audioPath);

        // 4. RESPONSE: Fixed variable name (aiResponse)
        res.json({ 
            userInput: transcription.text,
            text: aiResponse 
        });

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "Processing failed", details: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 SUCCESS! Agent live at http://localhost:${PORT}`);
});