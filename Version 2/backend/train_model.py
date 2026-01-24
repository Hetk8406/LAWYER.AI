import json
import pickle
import os
import glob
from sklearn.feature_extraction.text import TfidfVectorizer
import re

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
MODEL_PATH = os.path.join(BASE_DIR, 'legal_model.pkl')

def normalize_text(text):
    if not isinstance(text, str):
        return ""
    return re.sub(r'\s+', ' ', text.strip().lower())

def load_all_data():
    all_data = []
    # Pattern to match the specific files we want
    files = glob.glob(os.path.join(DATA_DIR, '*.json'))
    
    print(f"Found {len(files)} data files.")
    
    for file_path in files:
        filename = os.path.basename(file_path)
        print(f"Loading {filename}...")
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                # Tag data with source
                for record in data:
                    record['source_file'] = filename
                    # Normalize keys to handle variations across files if any
                    # Assuming checking 'Description' exists is enough for now
                all_data.extend(data)
        except Exception as e:
            print(f"Error loading {filename}: {e}")
            
    return all_data

def train_model():
    data = load_all_data()
    print(f"Total records loaded: {len(data)}")

    if not data:
        print("No data loaded. Aborting.")
        return

    # Prepare corpus from descriptions
    # We combine multiple fields to improve searchability
    corpus = []
    for record in data:
        text = f"{record.get('Section', '')} {record.get('IPC Section', '')} {record.get('Description', '')} {record.get('Offence', '')}"
        corpus.append(normalize_text(text))

    print("Training TF-IDF Vectorizer...")
    vectorizer = TfidfVectorizer(stop_words='english')
    tfidf_matrix = vectorizer.fit_transform(corpus)
    
    model_data = {
        'vectorizer': vectorizer,
        'tfidf_matrix': tfidf_matrix,
        'data': data
    }
    
    print("Saving model to:", MODEL_PATH)
    with open(MODEL_PATH, 'wb') as f:
        pickle.dump(model_data, f)
        
    print("Model generation successful!")

if __name__ == "__main__":
    train_model()
