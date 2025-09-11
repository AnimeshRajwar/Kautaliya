# 🧠 Kautaliya - AI Assistant

Kautaliya is a **Flask-based web application** that integrates with **Google Gemini API** to provide an interactive AI chat experience.
It features a **modern TailwindCSS UI**, session-based chat history, and real-time conversation handling with a typing indicator.

## 🚀 Features

* 🔹 Flask backend with **Gemini API** integration.
* 🔹 Persistent **chat sessions** using Flask `session`.
* 🔹 Modern **responsive UI** built with **TailwindCSS**.
* 🔹 **Chat history** and **clear conversation** support.
* 🔹 Smooth **typing animations** and message formatting (Markdown, code blocks).
* 🔹 **Sidebar chat logs** for quick navigation of past questions.

## 📂 Project Structure

```
Kautaliya/
│── app.py           
│── templates/
│   └── index.html   
│── static/
│   ├── script.js    
│   └── style.css    

```

## ⚙️ Setup & Installation

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/kautaliya.git
cd kautaliya
```

### 2️⃣ Create a Virtual Environment

```bash
python3 -m venv venv
source venv/bin/activate   # Linux / macOS
venv\Scripts\activate      # Windows
```

### 3️⃣ Install Dependencies

```bash
pip install flask google-generativeai
```

### 4️⃣ Configure API Key

Create a `.env` file in the root directory and add your **Gemini API Key**:

```
GEMINI_API_KEY=your-gemini-api-key-here
```

Alternatively, export it in your shell:

```bash
export GEMINI_API_KEY="your-gemini-api-key-here"
```

### 5️⃣ Run the App

```bash
python app.py
```

The app will start at: **[http://127.0.0.1:5000/](http://127.0.0.1:5000/)**

## 🎨 UI Preview

* **Sidebar** → shows chat history.
* **Main Chat Window** → interactive conversation with Kautaliya.
* **Footer Input Bar** → type & send messages, press Enter or click the button.
* **Clear Button** → start a new conversation.

## 🛠️ Technologies Used

* **Backend**: Flask, Python, Google Generative AI SDK
* **Frontend**: HTML, TailwindCSS, JavaScript
* **Session Handling**: Flask sessions
