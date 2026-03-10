Voice Agent Implementation: High-Inference AI 
This project is a technical demonstration of a low-latency voice assistant developed for the Bizoforce evaluation. The goal was to build a system that feels "human-speed" by minimizing the time between a user finishing a sentence and the AI beginning its response.

 Live Link
https://bizoforce-voice-agent.vercel.app/
 The Engineering Approach
Most voice bots feel sluggish because of the "round-trip" delay. To solve this, I focused on three specific areas:

Inference Speed: I utilized the Groq LPU (Language Processing Unit). By using Whisper-large-v3 for transcription and Llama-3.1-8b for logic, the "brain" of the agent operates in milliseconds, not seconds.

Edge Processing: Instead of doing Text-to-Speech (TTS) on the server (which adds heavy data transfer), I utilized the browser's native Web Speech API. This allows the AI to "start talking" the moment the text arrives.

Stateless Execution: Designed as a serverless-first application, the backend functions are ephemeral. It processes the audio in a secure /tmp/ buffer and cleans up immediately, ensuring no user data lingers on the server.

 Architecture Breakdown
Capture: MediaRecorder API handles the audio stream in the browser.

Transport: Multer handles the multi-part form data transition to the Node.js backend.

Intelligence: The Groq SDK manages the dual-pipeline:

STT: Converting voice to a text string.

LLM: Understanding intent and generating a concise response.

Feedback: The frontend renders the user's transcript and the AI's response in real-time for visual confirmation.

🛠️ Getting Started
1. Requirements
Node.js v18 or higher.

A Groq API Key (Accessible via Groq Cloud).

2. Local Setup
Bash
# Clone and enter the project
git clone https://github.com/Thanushnanaiah/bizoforce-voice-agent.git
cd bizoforce-voice-agent

# Install dependencies
npm install

# Set up environment variables
# Create a .env file and add:
GROQ_API_KEY=your_key_here

# Fire it up
npm start
The agent will be live at http://localhost:3000.

 Key Features & UX Logic
Smart Termination: I implemented a manual 'Stop' trigger. In voice UX, the ability to interrupt the AI is just as important as the ability to hear it.

Zero-Footprint Storage: Using /tmp/ for audio processing ensures compatibility with modern cloud environments like Vercel while maintaining strict data privacy.

Language Guardrails: The system prompt is tuned to ensure the agent stays concise and strictly English-speaking, preventing "hallucination" into other languages during noisy transcriptions.
