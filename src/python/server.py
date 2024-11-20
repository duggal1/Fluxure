from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, LSTM
import joblib
import json
import threading
import queue
import time

app = Flask(__name__)
CORS(app)

class EnterpriseAI:
    def __init__(self):
        self.models = {
            'supply_chain': None,
            'customer_intelligence': None,
            'demand_forecast': None,
            'risk_assessment': None
        }
        self.scalers = {}
        self.training_queue = queue.Queue()
        self._start_training_worker()

    def _start_training_worker(self):
        worker = threading.Thread(target=self._process_training_queue, daemon=True)
        worker.start()

    def _process_training_queue(self):
        while True:
            try:
                task = self.training_queue.get()
                model_type = task['type']
                data = task['data']
                
                if model_type == 'supply_chain':
                    self._train_supply_chain_model(data)
                elif model_type == 'customer_intelligence':
                    self._train_customer_intelligence_model(data)
                elif model_type == 'demand_forecast':
                    self._train_demand_forecast_model(data)
                
                self.training_queue.task_done()
            except Exception as e:
                print(f"Training error: {e}")
            time.sleep(1)

    def _train_supply_chain_model(self, data):
        model = Sequential([
            LSTM(64, return_sequences=True, input_shape=(30, 10)),
            LSTM(32),
            Dense(16, activation='relu'),
            Dense(1)
        ])
        model.compile(optimizer='adam', loss='mse')
        self.models['supply_chain'] = model

    def _train_customer_intelligence_model(self, data):
        model = Sequential([
            Dense(64, activation='relu', input_shape=(20,)),
            Dense(32, activation='relu'),
            Dense(16, activation='relu'),
            Dense(8, activation='softmax')
        ])
        model.compile(optimizer='adam', loss='categorical_crossentropy')
        self.models['customer_intelligence'] = model

    def predict_supply_chain(self, data):
        if self.models['supply_chain'] is None:
            raise ValueError("Supply chain model not trained")
        return self.models['supply_chain'].predict(data)

    def analyze_customer_behavior(self, data):
        if self.models['customer_intelligence'] is None:
            raise ValueError("Customer intelligence model not trained")
        return self.models['customer_intelligence'].predict(data)

ai_engine = EnterpriseAI()

@app.route('/api/supply-chain/optimize', methods=['POST'])
def optimize_supply_chain():
    try:
        data = request.json
        result = ai_engine.predict_supply_chain(np.array(data['features']))
        return jsonify({
            'optimization_result': result.tolist(),
            'recommendations': [
                {'action': 'Optimize inventory levels', 'impact': 0.85},
                {'action': 'Adjust shipping routes', 'impact': 0.72},
                {'action': 'Update supplier agreements', 'impact': 0.68}
            ]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/customer/analyze', methods=['POST'])
def analyze_customer():
    try:
        data = request.json
        result = ai_engine.analyze_customer_behavior(np.array(data['features']))
        return jsonify({
            'segments': result.tolist(),
            'insights': [
                {'category': 'Behavior', 'score': float(result[0])},
                {'category': 'Loyalty', 'score': float(result[1])},
                {'category': 'Value', 'score': float(result[2])}
            ]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/train', methods=['POST'])
def train_model():
    try:
        data = request.json
        ai_engine.training_queue.put(data)
        return jsonify({'message': f'Training queued for {data["type"]}'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000)