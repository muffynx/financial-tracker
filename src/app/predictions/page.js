"use client";
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Predictions() {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/transactions', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const transactions = await res.json();

        const aiRes = await fetch('http://localhost:5001/api/predictions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactions }),
        });
        const data = await aiRes.json();
        if (aiRes.ok) {
          setPrediction(data.predicted_expense);
        } else {
          setError(data.error || 'Failed to fetch prediction');
        }
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch prediction');
        setLoading(false);
      }
    };
    fetchPrediction();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Predictions - Financial Tracker</title>
      </Head>

      <div className="container mx-auto py-12">
        <h1 className="text-3xl font-bold mb-6">Expense Predictions</h1>
        <div className="bg-white p-6 rounded shadow">
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : (
            <p>Predicted next month’s expense: ${prediction}</p>
          )}
        </div>
      </div>
    </div>
  );
}