"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Tesseract from 'tesseract.js';

export default function AddTransaction() {
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense',
    category: 'อาหาร',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState(null);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [image, setImage] = useState(null);
  const [ocrResult, setOcrResult] = useState('');
  const [ocrLoading, setOcrLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [parsedData, setParsedData] = useState(null);

  const categories = ['อาหาร ', 'ค่าเดินทาง', 'ที่อยู่อาศัย', 'บันเทิง', 'ช้อปปิ้ง', 'สุขภาพ', 'การศึกษา', 'อื่นๆ'];

  useEffect(() => {
    // Check login status
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
    } else {
      setIsLoggedIn(true);
    }

    // Check if SpeechRecognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.lang = 'th-TH';
      recog.interimResults = true;
      recog.continuous = true;
      setRecognition(recog);
      setIsSpeechSupported(true);
    }
  }, []);

  // Handle speech recognition
  const startRecording = () => {
    if (!recognition) return;
    setIsRecording(true);
    setTranscript('');
    recognition.start();
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join('');
      setTranscript(transcript);
      parseTranscript(transcript);
    };
    recognition.onerror = (event) => {
      setError('เกิดข้อผิดพลาดในการบันทึกเสียง: ' + event.error);
      setIsRecording(false);
    };
    recognition.onend = () => {
      setIsRecording(false);
    };
  };

  const stopRecording = () => {
    if (recognition) {
      recognition.stop();
      setIsRecording(false);
    }
  };

  // Parse transcript to form data
  const parseTranscript = (text) => {
    console.log('Transcript received:', text);
    const lowerText = text.toLowerCase();
    let newFormData = { ...formData };

    // Detect amount
    const amountMatch = lowerText.match(/(\d{1,3}(,\d{3})*(\.\d+)?)/);
    if (amountMatch) {
      const rawAmount = amountMatch[0].replace(/,/g, '');
      newFormData.amount = rawAmount;
      console.log('Parsed amount:', rawAmount);
    }

    // Detect type
    if (lowerText.includes('รับ') || lowerText.includes('รายรับ')) {
      newFormData.type = 'income';
    } else if (lowerText.includes('จ่าย') || lowerText.includes('รายจ่าย')) {
      newFormData.type = 'expense';
    }

    // Detect category
    for (const cat of categories) {
      if (lowerText.includes(cat.toLowerCase())) {
        newFormData.category = cat;
        break;
      }
    }

    // Detect notes
    const notesMatch = lowerText.match(/(หมายเหตุ|สำหรับ)\s*([\s\S]*)/);
    if (notesMatch) {
      newFormData.notes = notesMatch[2].trim();
    }

    console.log('Parsed formData:', newFormData);
    setFormData(newFormData);
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setError('กรุณาอัปโหลดไฟล์รูปภาพ (.jpg, .png)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('ขนาดไฟล์ต้องไม่เกิน 10MB');
      return;
    }

    setImage(URL.createObjectURL(file));
    setOcrLoading(true);
    setOcrResult('');

    // Perform OCR with Tesseract.js
    Tesseract.recognize(
      file,
      'tha+eng', // Support Thai and English
      {
        logger: (m) => console.log(m), // Debug OCR progress
      }
    ).then(({ data: { text } }) => {
      console.log('OCR result:', text);
      setOcrResult(text);
      setOcrLoading(false);
      const parsed = parseOcrText(text);
      setParsedData(parsed);
      setShowConfirmModal(true);
    }).catch((err) => {
      setError('เกิดข้อผิดพลาดในการสแกนใบเสร็จ: ' + err.message);
      setOcrLoading(false);
    });
  };

  // Parse OCR text to form data
  const parseOcrText = (text) => {
    console.log('OCR text received:', text);
    const lowerText = text.toLowerCase();
    let parsedData = { ...formData };

    // Detect amount (look for numbers followed by "บาท" or "฿")
    const amountMatch = lowerText.match(/(\d{1,3}(,\d{3})*(\.\d+)?)\s*(บาท|฿)/);
    if (amountMatch) {
      const rawAmount = amountMatch[1].replace(/,/g, '');
      parsedData.amount = rawAmount;
      console.log('Parsed OCR amount:', rawAmount);
    } else {
      console.log('No matching amount found with currency');
    }

    // Detect type (assume expense for receipts unless specified)
    parsedData.type = 'expense';

    // Detect category
    for (const cat of categories) {
      if (lowerText.includes(cat.toLowerCase())) {
        parsedData.category = cat;
        break;
      }
    }

    // Detect date (e.g., "15/08/2025", "15 สิงหาคม 2568")
    const dateMatch = lowerText.match(/(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/) || 
                     lowerText.match(/(\d{1,2})\s*(มกราคม|กุมภาพันธ์|มีนาคม|เมษายน|พฤษภาคม|มิถุนายน|กรกฎาคม|สิงหาคม|กันยายน|ตุลาคม|พฤศจิกายน|ธันวาคม)\s*(\d{4})/);
    if (dateMatch) {
      let formattedDate;
      if (dateMatch[2].match(/\d{1,2}/)) {
        // Format: DD/MM/YYYY or DD-MM-YYYY
        formattedDate = `${dateMatch[3]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[1].padStart(2, '0')}`;
      } else {
        // Format: DD Month YYYY (Thai)
        const thaiMonths = {
          'มกราคม': '01', 'กุมภาพันธ์': '02', 'มีนาคม': '03', 'เมษายน': '04',
          'พฤษภาคม': '05', 'มิถุนายน': '06', 'กรกฎาคม': '07', 'สิงหาคม': '08',
          'กันยายน': '09', 'ตุลาคม': '10', 'พฤศจิกายน': '11', 'ธันวาคม': '12'
        };
        formattedDate = `${parseInt(dateMatch[3]) - 543}-${thaiMonths[dateMatch[2]]}-${dateMatch[1].padStart(2, '0')}`;
      }
      parsedData.date = formattedDate;
      console.log('Parsed OCR date:', formattedDate);
    }

    // Detect notes (remaining text)
    parsedData.notes = text.split('\n').slice(0, 2).join(' ').trim();

    console.log('Parsed OCR formData:', parsedData);
    return parsedData;
  };

  // Confirm OCR data
  const confirmOcrData = () => {
    setFormData(parsedData);
    setShowConfirmModal(false);
    setImage(null);
    setOcrResult('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!formData.amount || formData.amount <= 0) {
      setError('กรุณากรอกจำนวนเงินที่มากกว่า 0');
      setLoading(false);
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    if (formData.date > today) {
      setError('วันที่ธุรกรรมต้องไม่เป็นวันในอนาคต');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        window.location.href = '/dashboard';
      } else {
        setError(data.message || 'เกิดข้อผิดพลาดในการบันทึกธุรกรรม');
        setLoading(false);
      }
    } catch (error) {
      setError('เกิดข้อผิดพลาด: ' + error.message);
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return null; // Show blank page while redirecting
  }

  return (
    <main className="container mx-auto px-6 py-8">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <svg className="w-6 h-6 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"/>
          </svg>
          เพิ่มธุรกรรม
        </h1>
        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"/>
            </svg>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">จำนวนเงิน</label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="เช่น 500.00"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">ประเภท</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="income">รายรับ</option>
              <option value="expense">รายจ่าย</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">หมวดหมู่</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">วันที่</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">หมายเหตุ (ไม่บังคับ)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="เช่น ซื้ออาหารเย็นที่ร้าน XYZ"
              rows="4"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">สแกนใบเสร็จ</label>
            <input
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleImageUpload}
              className="w-full p-2 border rounded-md"
            />
            {image && (
              <div className="mt-2">
                <img src={image} alt="Receipt Preview" className="w-full h-auto rounded-md" />
              </div>
            )}
            {ocrLoading && (
              <div className="mt-2 p-2 bg-gray-100 rounded-md text-gray-700">
                <p className="text-sm">กำลังสแกนใบเสร็จ...</p>
              </div>
            )}
            {ocrResult && (
              <div className="mt-2 p-2 bg-gray-100 rounded-md text-gray-700">
                <p className="text-sm">ผลลัพธ์การสแกน: {ocrResult}</p>
              </div>
            )}
          </div>
          {isSpeechSupported && (
            <div>
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-full p-2 rounded-md flex items-center justify-center space-x-2 transition-colors ${
                  isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'
                } text-white`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0 5 5 0 01-10 0 1 1 0 10-2 0 7.001 7.001 0 006 6.93V17a1 1 0 102 0v-2.07z"/>
                </svg>
                <span>{isRecording ? 'หยุดบันทึกเสียง' : 'บันทึกด้วยเสียง'}</span>
              </button>
              {transcript && (
                <div className="mt-2 p-2 bg-gray-100 rounded-md text-gray-700">
                  <p className="text-sm">ผลลัพธ์เสียง: {transcript}</p>
                </div>
              )}
            </div>
          )}
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {loading ? 'กำลังบันทึก...' : 'บันทึกธุรกรรม'}
            </button>
            <Link
              href="/dashboard"
              className="flex-1 bg-gray-200 text-gray-800 p-2 rounded-md hover:bg-gray-300 text-center transition-colors"
            >
              ยกเลิก
            </Link>
          </div>
        </form>

        {/* Confirmation Modal */}
        {showConfirmModal && parsedData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-md mx-4 shadow-2xl">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">ยืนยันข้อมูลจากใบเสร็จ</h3>
              <div className="space-y-2">
                <p><strong>จำนวนเงิน:</strong> {parsedData.amount || 'ไม่พบ'}</p>
                <p><strong>ประเภท:</strong> {parsedData.type === 'income' ? 'รายรับ' : 'รายจ่าย'}</p>
                <p><strong>หมวดหมู่:</strong> {parsedData.category}</p>
                <p><strong>วันที่:</strong> {parsedData.date}</p>
                <p><strong>หมายเหตุ:</strong> {parsedData.notes || 'ไม่พบ'}</p>
              </div>
              <div className="flex space-x-4 mt-6">
                <button
                  onClick={confirmOcrData}
                  className="flex-1 bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  ยืนยัน
                </button>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 p-2 rounded-md hover:bg-gray-300 transition-colors"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}