"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      window.location.href = '/dashboard'; // Redirect ไป dashboard ถ้าล็อกอิน
    }
    setIsLoggedIn(!!token);
  }, []);
//min-h-screen bg-gray-100 flex items-center justify-center
  return (
    <main className="container mx-auto px-6 py-8 min-h-screen  ">
      {/* Welcome Section */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">ยินดีต้อนรับสู่ Financial Tracker! 👋</h2>
            <p className="text-gray-600 mb-4">จัดการการเงินของคุณได้อย่างง่ายดายและมีประสิทธิภาพ</p>
            {!isLoggedIn && (
              <div className="space-x-4">
                <Link href="/register" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  เริ่มต้นใช้งาน
                </Link>
                <Link href="/login" className="inline-block bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors">
                  เข้าสู่ระบบ
                </Link>
              </div>
            )}
          </div>
          <div className="hidden md:block">
            
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                <path fill-rule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 102 0V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 2a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">ติดตามธุรกรรม</h3>
            <p className="text-gray-600">บันทึกรายรับและรายจ่ายได้อย่างง่ายดาย</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">วิเคราะห์การเงิน</h3>
            <p className="text-gray-600">ดูรายงานและสถิติการเงินแบบเรียลไทม์</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">การแจ้งเตือน</h3>
            <p className="text-gray-600">รับการแจ้งเตือนเมื่อเกินงบประมาณ</p>
          </div>
        </div>
      </div>
    </main>
  );
}