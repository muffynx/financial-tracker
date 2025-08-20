"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import './globals.css';

export default function RootLayout({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    window.location.href = '/';
  };

  return (
    <html lang="th">
      <head>
        <title>Financial Tracker</title>
   
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Sans+Thai:wght@300;400;500;600;700&display=swap"
        />
      </head>
      <body
        className="min-h-screen flex flex-col bg-gray-50"
        style={{ fontFamily: "'Noto Sans Thai','Inter',sans-serif" }}
      >
    
        <header className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg sticky top-0 z-10">
          <div className="container mx-auto px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold sm:text-3xl">Financial Tracker</h1>
              </div>

              <div className="md:hidden">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="text-white hover:text-purple-200 focus:outline-none"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"/>
                  </svg>
                </button>
              </div>

      
              <nav className={`${isMenuOpen ? 'block' : 'hidden'} md:flex md:items-center md:space-x-6 w-full md:w-auto`}>
                <div className="md:flex md:space-x-6 mt-4 md:mt-0">
                  <Link href="/" className="flex items-center space-x-2 hover:text-purple-200 transition-colors text-sm sm:text-base py-2 md:py-0">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                    </svg>
                    <span>หน้าหลัก</span>
                  </Link>

                  {isLoggedIn ? (
                    <>
                      <Link href="/analytics" className="flex items-center space-x-2 hover:text-purple-200 transition-colors text-sm sm:text-base py-2 md:py-0">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
                        </svg>
                        <span>วิเคราะห์</span>
                      </Link>

                      <Link href="/predictions" className="flex items-center space-x-2 hover:text-purple-200 transition-colors text-sm sm:text-base py-2 md:py-0">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
                        </svg>
                        <span>การพยากรณ์</span>
                      </Link>

                      <Link href="/notifications" className="flex items-center space-x-2 hover:text-purple-200 transition-colors text-sm sm:text-base py-2 md:py-0">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
                        </svg>
                        <span>การแจ้งเตือน</span>
                      </Link>

                      <Link href="/profile" className="flex items-center space-x-2 hover:text-purple-200 transition-colors text-sm sm:text-base py-2 md:py-0">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"/>
                        </svg>
                        <span>โปรไฟล์</span>
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 hover:text-purple-200 transition-colors text-sm sm:text-base py-2 md:py-0"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"/>
                        </svg>
                        <span>ออกจากระบบ</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" className="flex items-center space-x-2 hover:text-purple-200 transition-colors text-sm sm:text-base py-2 md:py-0">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L11.586 11H4a1 1 0 110-2h7.586l-1.293-1.293a1 1 0 010-1.414z"/>
                        </svg>
                        <span>เข้าสู่ระบบ</span>
                      </Link>

                      <Link href="/register" className="flex items-center space-x-2 hover:text-purple-200 transition-colors text-sm sm:text-base py-2 md:py-0">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z"/>
                        </svg>
                        <span>สมัครสมาชิก</span>
                      </Link>
                    </>
                  )}
                </div>
              </nav>
            </div>
          </div>
        </header>

        <main className="flex-1 container mx-auto px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>

        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-gray-600">
                <Link href="/help" className="flex items-center space-x-2 hover:text-purple-600 transition-colors text-sm sm:text-base">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"/>
                  </svg>
                  <span>ช่วยเหลือ</span>
                </Link>
                <Link href="/contact" className="flex items-center space-x-2 hover:text-purple-600 transition-colors text-sm sm:text-base">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                  </svg>
                  <span>ติดต่อเรา</span>
                </Link>
              </div>
              <div className="text-center text-gray-500 text-sm sm:text-base">
                © 2025 Financial Tracker. สงวนลิขสิทธิ์
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
