"use client";
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Placeholder: Fetch notifications from backend or Firebase
    setNotifications([
      { id: 1, title: 'Overspending Alert', body: 'You’ve exceeded your food budget!', date: '2025-08-08' },
    ]);
    setLoading(false);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Notifications - Financial Tracker</title>
      </Head>
 
      <div className="container mx-auto py-12">
        <h1 className="text-3xl font-bold mb-6">Notifications</h1>
        <div className="bg-white p-6 rounded shadow">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ul>
              {notifications.map((notif) => (
                <li key={notif.id} className="border-b py-2">
                  <h3 className="font-semibold">{notif.title}</h3>
                  <p>{notif.body}</p>
                  <p className="text-sm text-gray-500">{notif.date}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}