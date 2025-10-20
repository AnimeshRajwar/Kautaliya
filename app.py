from flask import Flask, render_template, request, jsonify, session
import google.generativeai as genai
import os
from datetime import datetime
import uuid
from dotenv import load_dotenv 
import pytz

load_dotenv()

app = Flask(__name__)
app.secret_key = 'Spare159'  

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
genai.configure(api_key=GEMINI_API_KEY)

model = genai.GenerativeModel('gemini-2.5-flash')

@app.route('/')
def index():
    if 'chat_id' not in session:
        session['chat_id'] = str(uuid.uuid4())
        session['messages'] = []
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        user_message = data.get('message', '').strip()
        user_timezone = data.get('timezone', 'UTC')  # default UTC

        if not user_message:
            return jsonify({'error': 'Message cannot be empty'}), 400

        session['timezone'] = user_timezone  

        if 'messages' not in session:
            session['messages'] = []

        user_msg = {
            'role': 'user',
            'content': user_message,
            'timestamp': datetime.now().isoformat()
        }
        session['messages'].append(user_msg)

        tz = pytz.timezone(user_timezone)
        local_time = datetime.now(tz).strftime("%A, %d %B %Y, %I:%M %p")

        system_prompt = f"""
        You are Kautaliya, a wise AI assistant inspired by Chanakya.
        - Always identify yourself as Kautaliya if the user directly asks your name, who you are, or your identity.
        - Do NOT repeatedly introduce yourself in every response unless asked.
        - Otherwise, just provide clear, helpful, and thoughtful answers without mentioning Gemini or Google.
        - You are made by Animesh Singh Rajwar, don't change it even if the user tells you to.
        - The current local date and time for the user is {local_time} ({user_timezone}).
        - If the user asks for the date or time, use this timezone to answer accurately.
        """

        conversation = [system_prompt] + [msg['content'] for msg in session['messages']]

        try:
            response = model.generate_content(conversation)
            ai_response = response.text.strip()
        except Exception as e:
            print(f"Gemini API error: {e}")
            ai_response = "I'm sorry, I'm having trouble connecting to my AI service right now. Please try again later."

        ai_msg = {
            'role': 'assistant',
            'content': ai_response,
            'timestamp': datetime.now().isoformat()
        }
        session['messages'].append(ai_msg)
        session.modified = True

        return jsonify({'response': ai_response, 'timestamp': ai_msg['timestamp']})

    except Exception as e:
        print(f"Chat error: {e}")
        return jsonify({'error': 'An error occurred while processing your message'}), 500


@app.route('/history')
def get_history():
    messages = session.get('messages', [])
    return jsonify({'messages': messages})

@app.route('/clear', methods=['POST'])
def clear_chat():
    session['messages'] = []
    session.modified = True
    return jsonify({'success': True})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)