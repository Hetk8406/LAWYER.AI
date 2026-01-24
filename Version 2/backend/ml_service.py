from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import re
import os
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)
CORS(app)

# Absolute path to the model file
# Using dynamic path relative to specific script location
import os
import json
import glob
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'legal_model.pkl')
DATA_DIR = os.path.join(BASE_DIR, 'data')

# Load General Definitions
GENERAL_DATA = []
try:
    with open(os.path.join(DATA_DIR, 'General.json'), 'r', encoding='utf-8') as f:
        GENERAL_DATA = json.load(f)
except Exception as e:
    print(f"Warning: General.json not found or error loading: {e}")

def normalize_text(text):
    return re.sub(r'\s+', ' ', text.strip().lower())

def check_greeting(text):
    greetings = ['hi', 'hello', 'hey', 'greetings', 'sup', 'whatsup', 'hola']
    norm_text = normalize_text(text)
    if norm_text in greetings:
        return "Hello! I am your advanced AI Legal Assistant. I can help you with questions related to IPC, CrPC, CPC, RTI, and SMA. How can I assist you today?"
    return None

def check_general_definition(text):
    """
    Checks if the user is asking for a definition (e.g., "What is IPC", "Full form of CrPC").
    """
    norm_text = normalize_text(text)
    
    for item in GENERAL_DATA:
        keyword = normalize_text(item['Keyword'])
        full_form = normalize_text(item['FullForm'])
        
        # Check patterns with SUBSTRING matching
        # If any of these phrases appear inside the user text, we consider it a match
        patterns = [
            f"what is {keyword}",
            f"define {keyword}",
            f"full form of {keyword}",
            f"meaning of {keyword}",
            f"how to file {keyword}", # Added for filing queries
            f"procedure for {keyword}",
            full_form
        ]
        
        # 1. Check if ANY pattern is a substring of the user query
        if any(p in norm_text for p in patterns):
             return (
                f"**{item['FullForm']}**\n\n"
                f"{item['Description']}"
            )

        # 2. Strict exact match for keyword alone (to avoid false positives)
        if norm_text == keyword:
             return (
                f"**{item['FullForm']} ({item['Keyword']})**\n\n"
                f"{item['Description']}"
            )
            
    return None

def query_model(user_query, model_data):
    try:
        vectorizer = model_data['vectorizer']
        tfidf_matrix = model_data['tfidf_matrix']
        records = model_data['data']

        user_vector = vectorizer.transform([normalize_text(user_query)])
        similarity_scores = cosine_similarity(user_vector, tfidf_matrix)[0]

        best_match_index = similarity_scores.argmax()
        best_similarity = similarity_scores[best_match_index]
        
        # Smart Scoring: Filter out generic "IPC specific" matches if query is very different
        # But here we rely on the high threshold for good quality
        
        # Threshold for relevance
        if best_similarity < 0.12: # slightly adjusted
            return None, best_similarity

        return records[best_match_index], best_similarity
    except Exception as e:
        print(f"Error in query_model: {str(e)}")
        return None, 0

def format_output(record):
    if not record:
        return "I'm sorry, I couldn't find specific legal information matching your query."
    
    response = ""
    
    # Handle Section/Title
    section = record.get('Section') or record.get('IPC Section') or "Unknown Section"
    response += f"**Section:** {section}\n\n"
    
    if record.get('Description'):
        response += f"**Description:** {record['Description']}\n\n"
        
    if record.get('Offence'):
        response += f"*Offence:* {record['Offence']}\n"
        
    if record.get('Punishment'):
        response += f"*Punishment:* {record['Punishment']}\n"
    
    # Add source if available
    if record.get('source_file'):
        response += f"\n_(Source: {record['source_file']})_"
        
    return response

@app.route('/api/get-answer', methods=['POST'])
def get_answer():
    try:
        # Load the model
        with open(MODEL_PATH, 'rb') as model_file:
            model_data = pickle.load(model_file)

        data = request.json
        question = data.get('question', '').strip()
        
        if not question:
            return jsonify({
                'status': 'error',
                'message': 'Question is required'
            }), 400

        # 1. Check for Greetings
        greeting_response = check_greeting(question)
        if greeting_response:
             return jsonify({
                'status': 'success',
                'answer': greeting_response
            })
            
        # 2. Check General Definitions (Priority)
        general_response = check_general_definition(question)
        if general_response:
            return jsonify({
                'status': 'success',
                'answer': general_response,
                'source': 'general_json'
            })

        # 3. Query Model (Sections)
        result, score = query_model(question, model_data)

        if result:
            return jsonify({
                'status': 'success',
                'answer': format_output(result),
                'confidence': float(score)
            })
        else:
            return jsonify({
                'status': 'success',
                'answer': "I'm sorry, I couldn't find a specific legal match in my database. Could you try asking in a different way?"
            })

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Error processing request: {str(e)}'
        }), 500

if __name__ == '__main__':
    app.run(port=5001, debug=True)
