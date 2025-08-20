"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function Analytics() {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('month');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const categories = [
    { name: 'อาหาร', icon: '🍽️' },
    { name: 'ค่าเดินทาง', icon: '🚗' },
    { name: 'ที่อยู่อาศัย', icon: '🏠' },
    { name: 'บันเทิง', icon: '🎬' },
    { name: 'ช้อปปิ้ง', icon: '🛒' },
    { name: 'สุขภาพ', icon: '🏥' },
    { name: 'การศึกษา', icon: '📚' },
    { name: 'อื่นๆ', icon: '🌐' },
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
    } else {
      setIsLoggedIn(true);
      fetchTransactions(token);
    }
  }, []);

  const fetchTransactions = async (token) => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/transactions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setTransactions(data);
      } else {
        setError(data.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล');
      }
    } catch (error) {
      setError('เกิดข้อผิดพลาด: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    const transactionDate = new Date(t.date);
    const now = new Date();
    if (filter === 'month') return transactionDate >= new Date(now.getFullYear(), now.getMonth(), 1);
    if (filter === '3months') return transactionDate >= new Date(now.getFullYear(), now.getMonth() - 3, 1);
    return true;
  });

  const incomeByCategory = categories.reduce((acc, cat) => {
    acc[cat.name] = filteredTransactions
      .filter((t) => t.type === 'income' && t.category === cat.name)
      .reduce((sum, t) => sum + t.amount, 0);
    return acc;
  }, {});

  const expenseByCategory = categories.reduce((acc, cat) => {
    acc[cat.name] = filteredTransactions
      .filter((t) => t.type === 'expense' && t.category === cat.name)
      .reduce((sum, t) => sum + t.amount, 0);
    return acc;
  }, {});

  const summary = filteredTransactions.reduce(
    (acc, t) => {
      if (t.type === 'income') acc.totalIncome += t.amount;
      else acc.totalExpense += t.amount;
      return acc;
    },
    { totalIncome: 0, totalExpense: 0 }
  );
  summary.balance = summary.totalIncome - summary.totalExpense;

  // Pie Chart Data
  const pieData = {
    labels: categories.filter((cat) => expenseByCategory[cat.name] > 0).map((cat) => cat.name),
    datasets: [
      {
        data: categories.filter((cat) => expenseByCategory[cat.name] > 0).map((cat) => expenseByCategory[cat.name]),
        backgroundColor: ['#2563eb', '#7c3aed', '#db2777', '#dc2626', '#ea580c', '#d97706', '#16a34a', '#059669'],
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  // Bar Chart Data
  const monthlyData = Array.from({ length: filter === 'month' ? 1 : filter === '3months' ? 3 : 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
    const monthTransactions = filteredTransactions.filter(
      (t) =>
        new Date(t.date).getMonth() === date.getMonth() &&
        new Date(t.date).getFullYear() === date.getFullYear()
    );
    const income = monthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = monthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return { monthYear, income, expense };
  }).reverse();
  const barData = {
    labels: monthlyData.map((d) => d.monthYear),
    datasets: [
      {
        label: 'รายรับ',
        data: monthlyData.map((d) => d.income),
        backgroundColor: '#2563eb',
        borderColor: '#2563eb',
        borderWidth: 1,
      },
      {
        label: 'รายจ่าย',
        data: monthlyData.map((d) => d.expense),
        backgroundColor: '#dc2626',
        borderColor: '#dc2626',
        borderWidth: 1,
      },
    ],
  };

  if (!isLoggedIn) return null;

  return (
    <main className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <svg className="w-6 h-6 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933c-.784.57-.943 1.6-.3 2.4z" />
          </svg>
          รายงานการเงิน
        </h1>
      </div>
      {error && (
        <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"/>
          </svg>
          {error}
        </div>
      )}
      {loading ? (
        <div className="text-center text-gray-600">กำลังโหลด...</div>
      ) : (
        <div className="space-y-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">เลือกช่วงเวลา</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="month">เดือนนี้</option>
              <option value="3months">3 เดือนล่าสุด</option>
              <option value="all">ทั้งหมด</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <h3 className="text-sm font-medium text-gray-600">รายรับรวม</h3>
              <p className="text-2xl font-bold text-green-600">{summary.totalIncome.toLocaleString()} บาท</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <h3 className="text-sm font-medium text-gray-600">รายจ่ายรวม</h3>
              <p className="text-2xl font-bold text-red-600">{summary.totalExpense.toLocaleString()} บาท</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <h3 className="text-sm font-medium text-gray-600">ยอดคงเหลือ</h3>
              <p className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {summary.balance.toLocaleString()} บาท
              </p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">รายรับตามหมวดหมู่</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {categories.map((cat) => (
                incomeByCategory[cat.name] > 0 && (
                  <div key={cat.name} className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-3xl mb-2">{cat.icon}</div>
                    <h4 className="text-sm font-medium text-gray-700">{cat.name}</h4>
                    <p className="text-lg font-bold text-green-600">{incomeByCategory[cat.name].toLocaleString()} บาท</p>
                  </div>
                )
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">รายจ่ายตามหมวดหมู่</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {categories.map((cat) => (
                expenseByCategory[cat.name] > 0 && (
                  <div key={cat.name} className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-3xl mb-2">{cat.icon}</div>
                    <h4 className="text-sm font-medium text-gray-700">{cat.name}</h4>
                    <p className="text-lg font-bold text-red-600">{expenseByCategory[cat.name].toLocaleString()} บาท</p>
                  </div>
                )
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">การกระจายรายจ่ายตามหมวดหมู่</h3>
            <div className="max-w-md mx-auto">
              <Pie data={pieData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">รายรับ-รายจ่ายรายเดือน</h3>
            <div className="max-w-4xl mx-auto">
              <Bar data={barData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
            </div>
          </div>
        </div>
      )}
      <div className="mt-8">
        <Link href="/dashboard" className="bg-gray-200 text-gray-800 p-2 rounded-md hover:bg-gray-300 transition-colors">
          กลับไปที่ Dashboard
        </Link>
      </div>
    </main>
  );
}