from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from sklearn.linear_model import LinearRegression
import os

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

@app.route('/api/predictions', methods=['POST'])
def predict_expense():
    try:
        data = request.json
        transactions = data.get('transactions', [])
        df = pd.DataFrame(transactions)

        # Prepare data for Linear Regression
        df['date'] = pd.to_datetime(df['date'])
        df['days'] = (df['date'] - df['date'].min()).dt.days
        X = df[df['type'] == 'expense'][['days']]
        y = df[df['type'] == 'expense']['amount']

        if len(X) < 2:
            return jsonify({'error': 'Insufficient data for prediction'}), 400

        # Train model
        model = LinearRegression()
        model.fit(X, y)

        # Predict next month's expense (assume 30 days from last date)
        last_day = X['days'].max()
        next_month = [[last_day + 30]]
        predicted_expense = model.predict(next_month)[0]

        return jsonify({'predicted_expense': round(predicted_expense, 2)})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5001)