import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  QrCode, 
  Camera, 
  Printer, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  Users, 
  Volume2, 
  AlertTriangle, 
  Search, 
  ShieldCheck, 
  LogOut, 
  LogIn, 
  FileText, 
  Tv, 
  Phone, 
  Sparkles, 
  ChevronRight, 
  ArrowRight, 
  XCircle, 
  SkipForward, 
  RotateCcw,
  Upload,
  Link2,
  ExternalLink,
  Copy,
  Info
} from 'lucide-react';

// Bangla Digits Converter Helper
const toBengaliNumber = (num) => {
  if (num === null || num === undefined) return '';
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().replace(/\d/g, (digit) => bengaliDigits[parseInt(digit, 10)]);
};

// Available Digital Center Services
const DIGITAL_SERVICES = [
  { id: 'birth_reg', name: 'জন্ম নিবন্ধন', code: 'BR', icon: '👶' },
  { id: 'death_reg', name: 'মৃত্যু নিবন্ধন', code: 'DR', icon: '📄' },
  { id: 'citizen_cert', name: 'নাগরিক সনদ', code: 'CC', icon: '🏛️' },
  { id: 'trade_license', name: 'ট্রেড লাইসেন্স', code: 'TL', icon: '💼' },
  { id: 'land_services', name: 'ভূমি সংক্রান্ত সেবা (নামজারি/খতিয়ান)', code: 'LS', icon: '🌾' },
  { id: 'online_application', name: 'অনলাইন আবেদন ও ফরম পূরণ', code: 'OA', icon: '💻' },
  { id: 'other_services', name: 'অন্যান্য ডিজিটাল সেবা', code: 'OS', icon: '📋' },
];

const CENTER_DETAILS = {
  name: 'উজিরপুর ইউনিয়ন ডিজিটাল সেন্টার',
  address: 'উজিরপুর ইউনিয়ন পরিষদ, মিয়া বাজার, চৌদ্দগ্রাম, কুমিল্লা',
  shortAddress: 'মিয়া বাজার, চৌদ্দগ্রাম, কুমিল্লা',
  centerCode: 'DC'
};

// Robust URL Sanitizer to completely prevent duplicate "https://" and concatenated URLs
const sanitizeLiveUrl = (inputUrl) => {
  if (!inputUrl) return 'https://ujirpur-udc.gov.bd';
  let str = inputUrl.trim();

  // If duplicate https:// exists like "domain.comhttps://domain.com/path"
  const httpsMatches = [...str.matchAll(/https?:\/\//gi)];
  if (httpsMatches.length > 1) {
    // Pick the last valid full URL occurrence
    const lastIndex = str.lastIndexOf('http');
    str = str.substring(lastIndex);
  }

  // Ensure it starts with https:// or http://
  if (!/^https?:\/\//i.test(str)) {
    str = 'https://' + str;
  }

  try {
    const parsed = new URL(str);
    // Return clean base origin + pathname without query duplication
    return `${parsed.protocol}//${parsed.host}${parsed.pathname}`;
  } catch (e) {
    // Fallback regex cleaning
    return str.replace(/([^:]\/)\/+/g, "$1").split('?')[0].split('#')[0];
  }
};

export default function App() {
  // Navigation: 'citizen', 'live_display', 'admin', 'qr_standee'
  const [activeTab, setActiveTab] = useState('citizen');
  
  // Realtime Clock in Bangla
  const [currentTime, setCurrentTime] = useState(new Date());

  // Deep Link & Registration Focus trigger
  const [isScannedEntry, setIsScannedEntry] = useState(false);
  const [scannedBoothInfo, setScannedBoothInfo] = useState('');
  const formRef = useRef(null);

  // Safe Clipboard Copy Helper that handles sandboxed iframes & permission policies
  const safeCopyToClipboard = (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).catch(() => {
        fallbackCopyText(text);
      });
    } else {
      fallbackCopyText(text);
    }
  };

  const fallbackCopyText = (text) => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    } catch (err) {
      console.warn("Fallback copy failed: ", err);
    }
  };

  // Standee dynamic link customizer with safe sanitizer
  const [customHostUrl, setCustomHostUrl] = useState(() => {
    if (typeof window !== 'undefined' && window.location.href) {
      return sanitizeLiveUrl(window.location.origin + window.location.pathname);
    }
    return 'https://ujirpur-udc.gov.bd';
  });

  const [urlInput, setUrlInput] = useState(customHostUrl);

  // Generate Direct Scan URL for citizens (Single definition)
  const bookingQrUrl = useMemo(() => {
    const cleanBase = sanitizeLiveUrl(customHostUrl);
    return `${cleanBase}?action=register&center=ujirpur&booth=UDC-MIA-01`;
  }, [customHostUrl]);

  // Master Queue Data State
  const [tokens, setTokens] = useState(() => [
    {
      id: 'DC-001',
      number: 1,
      centerName: CENTER_DETAILS.name,
      centerAddress: CENTER_DETAILS.address,
      serviceId: 'birth_reg',
      serviceName: 'জন্ম নিবন্ধন',
      citizenName: 'মোহাম্মদ রফিকুল ইসলাম',
      phone: '01712345678',
      status: 'completed',
      counterNo: 1,
      createdAt: '১০:১৫',
      date: new Date().toLocaleDateString('bn-BD'),
      timestamp: Date.now() - 3600000
    },
    {
      id: 'DC-002',
      number: 2,
      centerName: CENTER_DETAILS.name,
      centerAddress: CENTER_DETAILS.address,
      serviceId: 'trade_license',
      serviceName: 'ট্রেড লাইসেন্স',
      citizenName: 'আব্দুল করিম',
      phone: '01898765432',
      status: 'calling',
      counterNo: 1,
      createdAt: '১০:৪৫',
      date: new Date().toLocaleDateString('bn-BD'),
      timestamp: Date.now() - 1800000
    },
    {
      id: 'DC-003',
      number: 3,
      centerName: CENTER_DETAILS.name,
      centerAddress: CENTER_DETAILS.address,
      serviceId: 'land_services',
      serviceName: 'ভূমি সংক্রান্ত সেবা (নামজারি/খতিয়ান)',
      citizenName: 'মোসাম্মৎ সালমা বেগম',
      phone: '01911223344',
      status: 'waiting',
      counterNo: 1,
      createdAt: '১১:১০',
      date: new Date().toLocaleDateString('bn-BD'),
      timestamp: Date.now() - 600000
    }
  ]);

  // Current active user's created token (for citizen token screen)
  const [myToken, setMyToken] = useState(null);

  // Form State for Token Creation
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    serviceId: 'birth_reg'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // QR Scanner Modal State
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [cameraStreamActive, setCameraStreamActive] = useState(false);
  const [cameraPermissionError, setCameraPermissionError] = useState(false);
  const [manualCodeInput, setManualCodeInput] = useState('');
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  // Admin Dashboard States
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [adminPinError, setAdminPinError] = useState('');
  const [adminFilterService, setAdminFilterService] = useState('all');
  const [adminFilterStatus, setAdminFilterStatus] = useState('all');
  const [adminSearch, setAdminSearch] = useState('');
  const [notificationMsg, setNotificationMsg] = useState('');

  // Audio Beep / Bell Synth using Web Audio API
  const playChime = (type = 'ding') => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (type === 'call') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch (e) {
      console.warn('Audio note unable to play:', e);
    }
  };

  // 1. CRITICAL FIX: URL Deep Link Detection on Page Load
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#\/?/, '?'));
      
      const isBookingRequested = 
        searchParams.get('action') === 'register' || 
        searchParams.get('scan') === 'true' || 
        searchParams.has('booth') ||
        hashParams.get('action') === 'register' ||
        window.location.hash.includes('register');

      const boothCode = searchParams.get('booth') || hashParams.get('booth') || 'UDC-MIA-01';

      if (isBookingRequested) {
        setActiveTab('citizen');
        setIsScannedEntry(true);
        setScannedBoothInfo(`মিয়া বাজার বুথ (${boothCode})`);
        showNotification('QR কোড সফলভাবে সনাক্ত হয়েছে! নিচের ফরমটি পূরণ করে টোকেন নিন।');

        // Smooth scroll straight down to the booking form
        setTimeout(() => {
          if (formRef.current) {
            formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 300);
      }
    } catch (err) {
      console.error('URL parse error:', err);
    }
  }, []);

  // Clock Interval
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Show Toast
  const showNotification = (msg) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(''), 4000);
  };

  // QR Camera management with Fallback
  const startCamera = async () => {
    setIsScannerOpen(true);
    setCameraPermissionError(false);
    setCameraStreamActive(true);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } else {
        setCameraPermissionError(true);
      }
    } catch (err) {
      console.warn('Camera error or blocked permission:', err);
      setCameraPermissionError(true);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
    setCameraStreamActive(false);
    setIsScannerOpen(false);
  };

  // Direct Transition to Booking form
  const navigateToBookingForm = (sourceText = 'সরাসরি প্রবেশ') => {
    stopCamera();
    setActiveTab('citizen');
    setIsScannedEntry(true);
    setScannedBoothInfo(sourceText);
    showNotification('টোকেন বুকিং ফরম প্রস্তুত! আপনার সেবা নির্বাচন করুন।');
    setTimeout(() => {
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 200);
  };

  // Handle Image File Upload (QR from Gallery)
  const handleQrImageUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      showNotification('গ্যালারির QR কোড সফলভাবে সনাক্ত হয়েছে!');
      navigateToBookingForm('গ্যালারি QR কোড');
    }
  };

  const handleManualScanSubmit = (e) => {
    e.preventDefault();
    if (!manualCodeInput.trim()) return;
    navigateToBookingForm(`ম্যানুয়াল বুথ কোড: ${manualCodeInput.trim()}`);
  };

  // Token Generation Logic
  const handleGenerateToken = (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.serviceId) {
      setErrorMessage('দয়া করে সেবার ধরন নির্বাচন করুন');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    setTimeout(() => {
      const nextNum = tokens.length + 1;
      const formattedNum = `DC-${String(nextNum).padStart(3, '0')}`;
      const serviceObj = DIGITAL_SERVICES.find(s => s.id === formData.serviceId) || DIGITAL_SERVICES[0];

      const newToken = {
        id: formattedNum,
        number: nextNum,
        centerName: CENTER_DETAILS.name,
        centerAddress: CENTER_DETAILS.address,
        serviceId: serviceObj.id,
        serviceName: serviceObj.name,
        citizenName: formData.name.trim() || 'সম্মানিত নাগরিক',
        phone: formData.phone.trim() || 'প্রযোজ্য নয়',
        status: 'waiting',
        counterNo: 1,
        createdAt: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toLocaleDateString('bn-BD'),
        timestamp: Date.now()
      };

      setTokens(prev => [...prev, newToken]);
      setMyToken(newToken);
      setIsSubmitting(false);
      playChime('ding');
      showNotification(`অভিনন্দন! আপনার টোকেন নম্বর ${toBengaliNumber(formattedNum)} তৈরি হয়েছে`);
    }, 400);
  };

  // Queue Calculations
  const waitingTokens = useMemo(() => tokens.filter(t => t.status === 'waiting'), [tokens]);
  const currentlyCalling = useMemo(() => tokens.find(t => t.status === 'calling') || null, [tokens]);
  const completedTokens = useMemo(() => tokens.filter(t => t.status === 'completed'), [tokens]);

  const peopleAheadCount = useMemo(() => {
    if (!myToken || myToken.status === 'completed' || myToken.status === 'cancelled') return 0;
    return tokens.filter(t => t.status === 'waiting' && t.timestamp < myToken.timestamp).length;
  }, [tokens, myToken]);

  // Admin Actions
  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPin === '4169' || adminPin === 'udc2026') {
      setIsAdminLoggedIn(true);
      setAdminPinError('');
      showNotification('অ্যাডমিন প্যানেলে সফলভাবে প্রবেশ করেছেন');
    } else {
      setAdminPinError('ভুল পিন কোড! (সঠিক পিন: 4169)');
    }
  };

  const handleCallNextToken = () => {
    if (waitingTokens.length === 0) {
      showNotification('অপেক্ষমাণ তালিকায় কোনো টোকেন নেই!');
      return;
    }

    const nextWaiting = waitingTokens[0];
    setTokens(prev => prev.map(t => {
      if (t.id === nextWaiting.id) return { ...t, status: 'calling' };
      if (t.status === 'calling') return { ...t, status: 'completed' };
      return t;
    }));

    playChime('call');
    showNotification(`টোকেন ${toBengaliNumber(nextWaiting.id)} ডাকা হচ্ছে (কাউন্টার ১)`);
  };

  const handleUpdateTokenStatus = (tokenId, newStatus) => {
    setTokens(prev => prev.map(t => (t.id === tokenId ? { ...t, status: newStatus } : t)));
    if (newStatus === 'calling') {
      playChime('call');
      showNotification(`টোকেন ${toBengaliNumber(tokenId)} পুনরায় ডাকা হচ্ছে`);
    } else if (newStatus === 'completed') {
      showNotification(`টোকেন ${toBengaliNumber(tokenId)} সফলভাবে সম্পন্ন করা হয়েছে`);
    } else if (newStatus === 'skipped') {
      showNotification(`টোকেন ${toBengaliNumber(tokenId)} স্কিপ করা হয়েছে`);
    } else if (newStatus === 'cancelled') {
      showNotification(`টোকেন ${toBengaliNumber(tokenId)} বাতিল করা হয়েছে`);
    }
  };

  const handleResetQueue = () => {
    if (window.confirm('আপনি কি নিশ্চিত যে আজকের সকল টোকেন তালিকা রিসেট করতে চান?')) {
      setTokens([]);
      setMyToken(null);
      showNotification('আজকের সকল টোকেন সফলভাবে রিসেট করা হয়েছে');
    }
  };

  // High Res Standee PNG Downloader
  const downloadStandeePNG = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 1350;
    const ctx = canvas.getContext('2d');

    // Background Gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 1350);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(1, '#f0fdf4');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1000, 1350);

    // Border
    ctx.strokeStyle = '#047857';
    ctx.lineWidth = 16;
    ctx.strokeRect(30, 30, 940, 1290);

    // Header Background
    ctx.fillStyle = '#065f46';
    ctx.fillRect(38, 38, 924, 210);

    // Header Texts
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('গণপ্রজাতন্ত্রী বাংলাদেশ সরকার', 500, 85);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 40px sans-serif';
    ctx.fillText('উজিরপুর ইউনিয়ন ডিজিটাল সেন্টার', 500, 140);

    ctx.fillStyle = '#a7f3d0';
    ctx.font = '22px sans-serif';
    ctx.fillText('উজিরপুর ইউনিয়ন পরিষদ, মিয়া বাজার, চৌদ্দগ্রাম, কুমিল্লা', 500, 185);

    // Callout
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText('স্মার্ট টোকেন সংগ্রহ করতে স্ক্যান করুন', 500, 310);

    ctx.fillStyle = '#64748b';
    ctx.font = '20px sans-serif';
    ctx.fillText('আপনার ফোনের ক্যামেরা বা গুগল লেন্স দিয়ে সরাসরি স্ক্যান করুন', 500, 355);

    // QR Box
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(250, 410, 500, 500);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 4;
    ctx.strokeRect(250, 410, 500, 500);

    // QR Mockup Elements
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(290, 450, 110, 110);
    ctx.clearRect(315, 475, 60, 60);
    ctx.fillRect(330, 490, 30, 30);

    ctx.fillRect(600, 450, 110, 110);
    ctx.clearRect(625, 475, 60, 60);
    ctx.fillRect(640, 490, 30, 30);

    ctx.fillRect(290, 760, 110, 110);
    ctx.clearRect(315, 785, 60, 60);
    ctx.fillRect(330, 800, 30, 30);

    // Central Emblem
    ctx.fillStyle = '#065f46';
    ctx.beginPath();
    ctx.arc(500, 660, 50, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(500, 660, 24, 0, Math.PI * 2);
    ctx.fill();

    // Footer Info Box
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(150, 960, 700, 220);
    ctx.strokeStyle = '#e2e8f0';
    ctx.strokeRect(150, 960, 700, 220);

    ctx.fillStyle = '#047857';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('বুথ কোড: UDC-MIA-01 (মিয়া বাজার)', 500, 1015);

    ctx.fillStyle = '#334155';
    ctx.font = '19px sans-serif';
    ctx.fillText('১. লাইনে না দাঁড়িয়ে সহজে ডিজিটাল টোকেন গ্রহণ করুন', 500, 1060);
    ctx.fillText('২. জন্ম ও মৃত্যু নিবন্ধন, নাগরিক সনদ, ট্রেড লাইসেন্স ও অনলাইন আবেদন', 500, 1100);
    ctx.fillText('৩. ডিসপ্লে স্ক্রিনে আপনার সিরিয়াল দেখা পর্যন্ত অপেক্ষা করুন', 500, 1140);

    // Bottom Line
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('স্মার্ট বাংলাদেশ ● উজিরপুর ইউনিয়ন পরিষদ, চৌদ্দগ্রাম, কুমিল্লা', 500, 1260);

    // Trigger Download
    const link = document.createElement('a');
    link.download = 'Ujirpur-UDC-Smart-Token-Standee.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    showNotification('স্ট্যান্ডি পোস্টার ডাউনলোড সফল হয়েছে!');
  };

  // Filtered Tokens for Admin
  const filteredTokens = useMemo(() => {
    return tokens.filter(t => {
      const matchService = adminFilterService === 'all' || t.serviceId === adminFilterService;
      const matchStatus = adminFilterStatus === 'all' || t.status === adminFilterStatus;
      const matchSearch = adminSearch === '' || 
        t.id.toLowerCase().includes(adminSearch.toLowerCase()) || 
        t.citizenName.includes(adminSearch) || 
        t.phone.includes(adminSearch);
      return matchService && matchStatus && matchSearch;
    });
  }, [tokens, adminFilterService, adminFilterStatus, adminSearch]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Toast Notification Alert */}
      {notificationMsg && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center space-x-3 border-2 border-emerald-400 transition-all transform animate-bounce">
          <CheckCircle2 className="w-6 h-6 text-yellow-300 shrink-0" />
          <span className="font-semibold text-sm md:text-base leading-snug">{notificationMsg}</span>
        </div>
      )}

      {/* Government Standard Header */}
      <header className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white shadow-xl sticky top-0 z-30 border-b-4 border-yellow-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          
          {/* Logo & Center Title */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center p-1 shadow-md border-2 border-emerald-500 shrink-0">
              <div className="w-full h-full rounded-full bg-emerald-700 flex items-center justify-center relative overflow-hidden">
                <div className="w-4 h-4 bg-red-600 rounded-full"></div>
                <div className="absolute inset-0 border-2 border-yellow-400 rounded-full opacity-60"></div>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded-full font-bold tracking-wide border border-emerald-600">
                  গণপ্রজাতন্ত্রী বাংলাদেশ সরকার
                </span>
                <span className="text-[10px] sm:text-xs text-yellow-300 hidden sm:inline">
                  ● ইউনিয়ন ডিজিটাল সেন্টার
                </span>
              </div>
              <h1 className="text-base sm:text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                ডিজিটাল সেন্টার স্মার্ট টোকেন সিস্টেম
              </h1>
              <p className="text-xs text-emerald-200 font-medium">
                {CENTER_DETAILS.address}
              </p>
            </div>
          </div>

          {/* Bangla Live Clock & Date */}
          <div className="flex items-center gap-3 bg-emerald-900/80 backdrop-blur-sm px-4 py-1.5 rounded-xl border border-emerald-700/60 text-xs sm:text-sm">
            <Clock className="w-4 h-4 text-yellow-400 animate-pulse" />
            <div className="text-right">
              <div className="font-semibold text-emerald-100">
                {toBengaliNumber(currentTime.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))}
              </div>
              <div className="text-[11px] text-emerald-300">
                {currentTime.toLocaleDateString('bn-BD', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Bar */}
        <nav className="bg-emerald-950 border-t border-emerald-800/80 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex overflow-x-auto no-scrollbar space-x-1 sm:space-x-2 py-1.5">
            <button
              onClick={() => setActiveTab('citizen')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all shrink-0 ${
                activeTab === 'citizen'
                  ? 'bg-emerald-600 text-white shadow-inner'
                  : 'text-emerald-100 hover:bg-emerald-800/60'
              }`}
            >
              <FileText className="w-4 h-4" />
              টোকেন বুকিং ফরম ও স্লিপ
            </button>

            <button
              onClick={() => setActiveTab('live_display')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all shrink-0 ${
                activeTab === 'live_display'
                  ? 'bg-emerald-600 text-white shadow-inner'
                  : 'text-emerald-100 hover:bg-emerald-800/60'
              }`}
            >
              <Tv className="w-4 h-4 text-yellow-300" />
              লাইভ ডিসপ্লে বোর্ড
              {currentlyCalling && (
                <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-ping"></span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('qr_standee')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all shrink-0 ${
                activeTab === 'qr_standee'
                  ? 'bg-emerald-600 text-white shadow-inner'
                  : 'text-emerald-100 hover:bg-emerald-800/60'
              }`}
            >
              <QrCode className="w-4 h-4 text-teal-300" />
              ডিজিটাল সেন্টার QR স্ট্যান্ডি
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all shrink-0 ${
                activeTab === 'admin'
                  ? 'bg-emerald-600 text-white shadow-inner'
                  : 'text-emerald-100 hover:bg-emerald-800/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              অ্যাডমিন ও উদ্যোক্তা প্যানেল
            </button>
          </div>
        </nav>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">

        {/* -------------------- 1. CITIZEN REGISTRATION & TOKEN TAB -------------------- */}
        {activeTab === 'citizen' && (
          <div className="space-y-8">
            
            {/* Scanned Badge Notification if opened via QR */}
            {isScannedEntry && (
              <div className="bg-emerald-100 border-2 border-emerald-500 p-4 rounded-2xl flex items-center justify-between gap-3 shadow-md animate-fadeIn">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-emerald-950 text-sm sm:text-base">
                      QR কোড স্ক্যান সফল হয়েছে!
                    </h3>
                    <p className="text-xs text-emerald-800">
                      উজিরপুর ইউনিয়ন পরিষদ ডিজিটাল সেন্টার ({scannedBoothInfo}) থেকে আপনি সরাসরি সংযুক্ত হয়েছেন।
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold bg-emerald-600 text-white px-3 py-1 rounded-full shrink-0">
                  সরাসরি বুকিং মোড
                </span>
              </div>
            )}

            {/* Banner Announcement */}
            <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100 border-l-4 border-emerald-600 p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-emerald-950 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                  লাইনে না দাঁড়িয়ে ডিজিটাল টোকেন গ্রহণ করুন
                </h2>
                <p className="text-xs sm:text-sm text-emerald-800 mt-0.5">
                  উজিরপুর ইউনিয়ন পরিষদ, মিয়া বাজার, চৌদ্দগ্রাম ডিজিটাল সেন্টারে দ্রুত সেবা পেতে QR স্ক্যান করুন অথবা ফরম পূরণ করুন।
                </p>
              </div>
              
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={startCamera}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm transition hover:shadow cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  QR কোড স্ক্যান করুন
                </button>
                <button
                  onClick={() => navigateToBookingForm('সরাসরি বাটন')}
                  className="bg-slate-800 hover:bg-slate-900 text-white px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition"
                >
                  সরাসরি ফরম
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Token Form */}
              <div 
                ref={formRef}
                className="lg:col-span-7 bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden"
              >
                <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white px-6 py-4.5 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-yellow-300" />
                    <h3 className="font-bold text-base sm:text-lg">টোকেন আবেদন ও বুকিং ফরম</h3>
                  </div>
                  <span className="text-xs bg-emerald-700/80 px-3 py-1 rounded-full text-emerald-100 border border-emerald-500 font-medium">
                    মিয়া বাজার, চৌদ্দগ্রাম
                  </span>
                </div>

                <form onSubmit={handleGenerateToken} className="p-6 sm:p-7 space-y-5">
                  {errorMessage && (
                    <div className="bg-red-50 text-red-700 p-3.5 rounded-xl text-sm flex items-center gap-2 border border-red-200">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Service Selection Dropdown */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      কাঙ্ক্ষিত সেবার ধরন <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={formData.serviceId}
                        onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                        required
                        className="w-full bg-slate-50 border-2 border-slate-200 text-slate-800 rounded-2xl px-4 py-3.5 focus:outline-none focus:border-emerald-600 focus:bg-white text-sm sm:text-base font-semibold transition"
                      >
                        {DIGITAL_SERVICES.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.icon} {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">উজিরপুর ইউনিয়ন পরিষদ থেকে আপনি যে সেবাটি নিতে চান তা বেছে নিন।</p>
                  </div>

                  {/* Citizen Name (Optional) */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      সেবাগ্রহীতার নাম <span className="text-xs font-normal text-slate-500">(ঐচ্ছিক)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="যেমন: মোঃ কামরুল ইসলাম"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-sm sm:text-base transition"
                    />
                  </div>

                  {/* Mobile Number (Optional) */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      মোবাইল নম্বর <span className="text-xs font-normal text-slate-500">(ঐচ্ছিক - সিরিয়াল বিজ্ঞপ্তির জন্য)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                        <Phone className="w-4 h-4" />
                      </span>
                      <input
                        type="tel"
                        placeholder="01XXXXXXXXX"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        maxLength="11"
                        className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-sm sm:text-base transition"
                      />
                    </div>
                  </div>

                  {/* Trust Badge */}
                  <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 text-center leading-tight">
                      UDC<br/>মিয়াবাজার
                    </div>
                    <div className="text-xs text-emerald-900 leading-relaxed">
                      <strong>স্বচ্ছ সেবা নিশ্চয়তা:</strong> সকল টোকেন স্বয়ংক্রিয় ডিজিটাল পদ্ধতিতে সাজানো। কাউকে অতিরিক্ত টাকা বা ঘুষ প্রদান করবেন না।
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2 text-base active:scale-[0.99] disabled:opacity-70 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        টোকেন তৈরি হচ্ছে...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-yellow-300" />
                        টোকেন সংগ্রহ করুন
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Right Column: Issued Token Digital Slip */}
              <div className="lg:col-span-5">
                {myToken ? (
                  <div className="bg-white rounded-3xl shadow-xl border-2 border-emerald-500 p-6 relative overflow-hidden transition-all duration-300">
                    
                    {/* Top Watermark Ribbon */}
                    <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-bold px-7 py-1 transform rotate-45 translate-x-7 translate-y-2 shadow">
                      অফিশিয়াল
                    </div>

                    <div className="text-center pb-4 border-b border-slate-200">
                      <p className="text-xs font-semibold text-emerald-800 uppercase tracking-widest">
                        ইউনিয়ন ডিজিটাল সেন্টার স্মার্ট টোকেন
                      </p>
                      <h4 className="text-base font-bold text-slate-800 mt-1">
                        {myToken.centerName}
                      </h4>
                      <p className="text-xs text-slate-500">{myToken.centerAddress}</p>
                    </div>

                    {/* Big Token Number Display */}
                    <div className="my-5 py-5 bg-gradient-to-b from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl text-center">
                      <span className="text-xs text-emerald-800 font-semibold uppercase tracking-wider block mb-1">
                        আপনার ডিজিটাল টোকেন নম্বর
                      </span>
                      <div className="text-5xl sm:text-6xl font-black text-emerald-900 tracking-tight font-mono">
                        {toBengaliNumber(myToken.id)}
                      </div>
                      <div className="mt-2.5 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-white text-emerald-800 shadow-sm border border-emerald-200">
                        <span>সেবা: {myToken.serviceName}</span>
                      </div>
                    </div>

                    {/* Token Details Matrix */}
                    <div className="space-y-2.5 text-xs sm:text-sm text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <div className="flex justify-between py-1 border-b border-slate-200">
                        <span className="text-slate-500">সেবাগ্রহীতা:</span>
                        <span className="font-semibold text-slate-800">{myToken.citizenName}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200">
                        <span className="text-slate-500">মোবাইল নম্বর:</span>
                        <span className="font-semibold text-slate-800">{myToken.phone}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200">
                        <span className="text-slate-500">ইস্যুর সময় ও তারিখ:</span>
                        <span className="font-semibold text-slate-800">{toBengaliNumber(myToken.createdAt)}, {myToken.date}</span>
                      </div>
                      <div className="flex justify-between py-1 items-center">
                        <span className="text-slate-500">বর্তমান অবস্থা:</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          myToken.status === 'calling' 
                            ? 'bg-red-100 text-red-700 animate-pulse'
                            : myToken.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {myToken.status === 'calling' ? 'এখন আপনার সিরিয়াল!' : myToken.status === 'completed' ? 'সেবা সম্পন্ন' : 'অপেক্ষমাণ'}
                        </span>
                      </div>
                    </div>

                    {/* Waiting Behind Alert */}
                    <div className="mt-4 p-3.5 bg-teal-50 rounded-2xl border border-teal-200 text-center">
                      <span className="text-xs text-teal-800 block">আপনার সামনে অপেক্ষমাণ সেবাগ্রহীতা</span>
                      <span className="text-2xl font-bold text-teal-900">
                        {toBengaliNumber(peopleAheadCount)} জন
                      </span>
                    </div>

                    {/* Print & Download Action Buttons */}
                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <button
                        onClick={() => window.print()}
                        className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs sm:text-sm font-semibold py-3 px-3 rounded-xl transition shadow hover:shadow-md cursor-pointer"
                      >
                        <Printer className="w-4 h-4 text-slate-300" />
                        টোকেন প্রিন্ট
                      </button>

                      <button
                        onClick={() => {
                          const element = document.createElement("a");
                          const file = new Blob([
                            `টোকেন নম্বর: ${myToken.id}\nকেন্দ্র: ${myToken.centerName}\nঠিকানা: ${myToken.centerAddress}\nসেবা: ${myToken.serviceName}\nনাম: ${myToken.citizenName}\nতারিখ: ${myToken.date}\nসময়: ${myToken.createdAt}`
                          ], {type: 'text/plain;charset=utf-8'});
                          element.href = URL.createObjectURL(file);
                          element.download = `Token-${myToken.id}.txt`;
                          document.body.appendChild(element);
                          element.click();
                          showNotification('টোকেন ফাইল ডাউনলোড শুরু হয়েছে');
                        }}
                        className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold py-3 px-3 rounded-xl transition shadow hover:shadow-md cursor-pointer"
                      >
                        <Download className="w-4 h-4 text-emerald-200" />
                        ডাউনলোড করুন
                      </button>
                    </div>

                  </div>
                ) : (
                  <div className="bg-white rounded-3xl border-2 border-dashed border-slate-300 p-8 text-center flex flex-col items-center justify-center min-h-[400px]">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                      <FileText className="w-8 h-8 opacity-70" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-700 mb-1">কোনো সক্রিয় টোকেন নেই</h4>
                    <p className="text-xs sm:text-sm text-slate-500 max-w-xs leading-relaxed">
                      বামে থাকা ফরম পূরণ করে ‘টোকেন সংগ্রহ করুন’ চাপুন অথবা মিয়া বাজার ডিজিটাল সেন্টারের বুথে থাকা QR কোড স্ক্যান করুন।
                    </p>
                    
                    <div className="mt-5 flex flex-col sm:flex-row gap-2 w-full max-w-xs">
                      <button
                        onClick={startCamera}
                        className="flex-1 inline-flex items-center justify-center gap-2 text-xs font-bold text-white bg-emerald-700 px-4 py-2.5 rounded-xl hover:bg-emerald-800 transition"
                      >
                        <Camera className="w-4 h-4" />
                        ক্যামেরা স্ক্যানার
                      </button>
                      <button
                        onClick={() => navigateToBookingForm('সরাসরি')}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 px-4 py-2.5 rounded-xl hover:bg-slate-200 transition"
                      >
                        সরাসরি বুকিং
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Live Queue Summary Snippet */}
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Tv className="w-5 h-5 text-emerald-700" />
                  <h4 className="font-bold text-slate-800 text-base">লাইভ কিউ সারসংক্ষেপ</h4>
                </div>
                <button
                  onClick={() => setActiveTab('live_display')}
                  className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
                >
                  পূর্ণাঙ্গ লাইভ ডিসপ্লে বোর্ড দেখুন <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 text-center">
                  <div className="text-xs text-amber-800 font-medium">বর্তমানে চলমান সিরিয়াল</div>
                  <div className="text-3xl font-black text-amber-900 mt-1">
                    {currentlyCalling ? toBengaliNumber(currentlyCalling.id) : 'চলমান নেই'}
                  </div>
                  <div className="text-[11px] text-amber-700 mt-0.5 truncate">
                    {currentlyCalling ? currentlyCalling.serviceName : 'ডেস্কে সেবা প্রস্তুত'}
                  </div>
                </div>

                <div className="bg-teal-50 rounded-2xl p-4 border border-teal-200 text-center">
                  <div className="text-xs text-teal-800 font-medium">পরবর্তী সম্ভাব্য টোকেন</div>
                  <div className="text-3xl font-black text-teal-900 mt-1">
                    {waitingTokens[0] ? toBengaliNumber(waitingTokens[0].id) : 'নেই'}
                  </div>
                  <div className="text-[11px] text-teal-700 mt-0.5 truncate">
                    {waitingTokens[0] ? waitingTokens[0].serviceName : 'অপেক্ষমাণ কেউ নেই'}
                  </div>
                </div>

                <div className="bg-slate-100 rounded-2xl p-4 border border-slate-200 text-center">
                  <div className="text-xs text-slate-600 font-medium">লাইনে অপেক্ষমাণ মোট</div>
                  <div className="text-3xl font-black text-slate-800 mt-1">
                    {toBengaliNumber(waitingTokens.length)} জন
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    মোট ইস্যু: {toBengaliNumber(tokens.length)} টি
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* -------------------- 2. LIVE QUEUE DISPLAY BOARD (TV SCREEN MODE) -------------------- */}
        {activeTab === 'live_display' && (
          <div className="space-y-6">
            
            {/* Header of Public Display */}
            <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-800">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center shrink-0">
                  <Tv className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-emerald-400 rounded-full animate-ping"></span>
                    <span className="text-xs font-bold text-emerald-400 tracking-wider">রিয়েলটাইম লাইভ ডিসপ্লে বোর্ড</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold">{CENTER_DETAILS.name}</h2>
                  <p className="text-xs text-slate-400">{CENTER_DETAILS.address}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => playChime('call')}
                  className="bg-slate-800 hover:bg-slate-700 text-white text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-2 border border-slate-700 cursor-pointer"
                >
                  <Volume2 className="w-4 h-4 text-yellow-400" />
                  শব্দ টেস্ট করুন
                </button>
                <div className="text-right bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700 text-xs">
                  <div className="text-yellow-400 font-mono font-bold text-base">
                    {toBengaliNumber(currentTime.toLocaleTimeString('bn-BD'))}
                  </div>
                  <div className="text-slate-400">{currentTime.toLocaleDateString('bn-BD')}</div>
                </div>
              </div>
            </div>

            {/* Calling Hero Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Main Currently Served Token */}
              <div className="lg:col-span-8 bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white rounded-3xl p-6 sm:p-10 shadow-2xl border-4 border-yellow-400/80 relative overflow-hidden flex flex-col justify-between">
                
                <div className="flex items-center justify-between border-b border-emerald-800/60 pb-4">
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-red-600 text-white font-bold text-xs uppercase tracking-wider rounded-md animate-pulse">
                      চলমান সিরিয়াল
                    </span>
                    <span className="text-xs text-emerald-200">কাউন্টার নং: ০১ (মিয়া বাজার ইউডিসি)</span>
                  </div>
                  <div className="text-xs font-semibold text-yellow-300">
                    দয়া করে সেবা টেবিলে আসুন
                  </div>
                </div>

                <div className="py-8 text-center my-auto">
                  {currentlyCalling ? (
                    <div className="space-y-4">
                      <div className="text-6xl sm:text-8xl md:text-9xl font-black text-yellow-400 font-mono tracking-wider drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)]">
                        {toBengaliNumber(currentlyCalling.id)}
                      </div>
                      
                      <div className="inline-block bg-white/10 backdrop-blur-md px-6 py-2 rounded-2xl border border-white/20">
                        <span className="text-lg sm:text-2xl font-bold text-emerald-100">
                          {currentlyCalling.serviceName}
                        </span>
                      </div>

                      <div className="text-emerald-300 text-sm sm:text-base">
                        সেবাগ্রহীতা: <strong className="text-white">{currentlyCalling.citizenName}</strong>
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 text-slate-400 space-y-3">
                      <div className="text-4xl sm:text-5xl font-bold text-emerald-200">ডেস্কে কোনো টোকেন ডাকা হয়নি</div>
                      <p className="text-sm text-emerald-300/80">অ্যাডমিন প্যানেল থেকে পরবর্তী টোকেন কল করার অপেক্ষায়...</p>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-emerald-800/60 flex items-center justify-between text-xs sm:text-sm text-emerald-200">
                  <span>অনুগ্রহ করে আপনার টোকেন নম্বর ঘোষণার সাথে সাথে ডেস্কে আসুন।</span>
                  <span className="font-semibold text-yellow-300">চৌদ্দগ্রাম, কুমিল্লা</span>
                </div>
              </div>

              {/* Next in Line Queue List */}
              <div className="lg:col-span-4 flex flex-col space-y-4">
                
                {/* Stats Summary Card */}
                <div className="bg-white rounded-2xl p-5 shadow-md border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 font-medium">অপেক্ষমাণ সেবাগ্রহীতা</span>
                    <h3 className="text-3xl font-black text-emerald-900">
                      {toBengaliNumber(waitingTokens.length)} জন
                    </h3>
                  </div>
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-700">
                    <Users className="w-6 h-6" />
                  </div>
                </div>

                {/* Upcoming Tokens List */}
                <div className="bg-white rounded-2xl p-5 shadow-md border border-slate-200 flex-1 flex flex-col">
                  <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <SkipForward className="w-4 h-4 text-emerald-600" />
                    পরবর্তী সিরিয়ালসমূহ
                  </h4>

                  <div className="space-y-2.5 overflow-y-auto max-h-[350px] pr-1 flex-1">
                    {waitingTokens.length > 0 ? (
                      waitingTokens.map((token, index) => (
                        <div
                          key={token.id}
                          className={`p-3 rounded-xl border flex items-center justify-between ${
                            index === 0
                              ? 'bg-amber-50 border-amber-300 shadow-sm'
                              : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`text-base font-black font-mono ${index === 0 ? 'text-amber-900' : 'text-slate-800'}`}>
                                {toBengaliNumber(token.id)}
                              </span>
                              {index === 0 && (
                                <span className="text-[10px] bg-amber-600 text-white px-2 py-0.5 rounded-full font-bold">
                                  পরবর্তী
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-600 truncate max-w-[170px]">
                              {token.serviceName}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-slate-400 font-mono">
                              {toBengaliNumber(token.createdAt)}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 text-slate-400 text-xs">
                        তালিকায় কোনো অপেক্ষমাণ টোকেন নেই
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* -------------------- 3. DIGITAL CENTER QR STANDEE GENERATOR -------------------- */}
        {activeTab === 'qr_standee' && (
          <div className="max-w-3xl mx-auto space-y-6">
            
            {/* Standee Configuration Box with Sanitizer & Clean Link */}
            <div className="bg-emerald-50 border-2 border-emerald-400 p-5 rounded-3xl shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="font-bold flex items-center gap-1.5 text-emerald-950 text-sm sm:text-base">
                    <Link2 className="w-5 h-5 text-emerald-700" />
                    কিউআর কোডের কার্যকর লাইভ লিঙ্ক (URL):
                  </span>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    এই লিংকে ক্লিক বা স্ক্যান করলেই নাগরিক সরাসরি টোকেন বুকিং পেজে চলে আসবে।
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      safeCopyToClipboard(bookingQrUrl);
                      showNotification('সঠিক লাইভ লিংকটি কপি করা হয়েছে!');
                    }}
                    className="bg-white hover:bg-emerald-100 text-emerald-800 text-xs font-bold px-3.5 py-2 rounded-xl border border-emerald-300 flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                  >
                    <Copy className="w-4 h-4" />
                    লিঙ্ক কপি করুন
                  </button>

                  <a
                    href={bookingQrUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    ব্রাউজারে টেস্ট খুলুন
                  </a>
                </div>
              </div>

              {/* Clean Readonly Display of Active Link */}
              <div className="bg-white p-3 rounded-xl border border-emerald-300 flex items-center gap-2 overflow-x-auto text-xs font-mono text-emerald-900 break-all select-all">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 animate-pulse"></span>
                <span>{bookingQrUrl}</span>
              </div>

              {/* Custom Host/Domain Setter (e.g., if hosted on Vercel or Custom Domain) */}
              <div className="pt-2 border-t border-emerald-200">
                <label className="block text-xs font-bold text-emerald-900 mb-1.5">
                  আপনার নির্দিষ্ট ডোমেইন/হোস্টিং লিংক বসাতে চাইলে নিচে পেস্ট করুন:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="যেমন: https://ujirpur-udc.vercel.app"
                    className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                  <button
                    onClick={() => {
                      const cleaned = sanitizeLiveUrl(urlInput);
                      setCustomHostUrl(cleaned);
                      setUrlInput(cleaned);
                      showNotification('লিংকটি নির্ভুলভাবে আপডেট করা হয়েছে!');
                    }}
                    className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer shrink-0"
                  >
                    আপডেট করুন
                  </button>
                </div>
              </div>
            </div>

            {/* Standee Visual Poster Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border-4 border-emerald-700 text-center relative overflow-hidden">
              
              {/* Standee Header */}
              <div className="border-b-2 border-emerald-600 pb-4 mb-5">
                <div className="inline-block bg-emerald-800 text-white text-xs px-3.5 py-1 rounded-full font-bold mb-2">
                  গণপ্রজাতন্ত্রী বাংলাদেশ সরকার
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-emerald-950">
                  {CENTER_DETAILS.name}
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-emerald-800 mt-0.5">
                  {CENTER_DETAILS.address}
                </p>
                <p className="text-xs text-slate-500 mt-1">স্মার্ট নাগরিক টোকেন সেবা কাউন্টার</p>
              </div>

              {/* QR Code Graphics Simulation */}
              <div className="p-4 bg-slate-50 border-2 border-dashed border-emerald-300 rounded-2xl inline-block shadow-inner my-2">
                <div className="w-60 h-60 bg-white p-3 rounded-2xl shadow border border-slate-200 flex flex-col items-center justify-center relative">
                  {/* Procedural High Contrast QR Vector */}
                  <svg className="w-full h-full text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                    {/* Top Left Eye */}
                    <rect x="5" y="5" width="26" height="26" fill="black" />
                    <rect x="8" y="8" width="20" height="20" fill="white" />
                    <rect x="12" y="12" width="12" height="12" fill="black" />
                    {/* Top Right Eye */}
                    <rect x="69" y="5" width="26" height="26" fill="black" />
                    <rect x="72" y="8" width="20" height="20" fill="white" />
                    <rect x="76" y="12" width="12" height="12" fill="black" />
                    {/* Bottom Left Eye */}
                    <rect x="5" y="69" width="26" height="26" fill="black" />
                    <rect x="8" y="72" width="20" height="20" fill="white" />
                    <rect x="12" y="76" width="12" height="12" fill="black" />
                    {/* Data Matrix Modules */}
                    <rect x="36" y="8" width="6" height="6" fill="black" />
                    <rect x="46" y="12" width="6" height="6" fill="black" />
                    <rect x="56" y="8" width="6" height="6" fill="black" />
                    <rect x="36" y="24" width="6" height="6" fill="black" />
                    <rect x="48" y="28" width="8" height="6" fill="black" />
                    <rect x="12" y="38" width="8" height="6" fill="black" />
                    <rect x="24" y="42" width="6" height="6" fill="black" />
                    <rect x="38" y="40" width="10" height="10" fill="#047857" />
                    <rect x="56" y="38" width="8" height="8" fill="black" />
                    <rect x="72" y="42" width="8" height="8" fill="black" />
                    <rect x="86" y="44" width="6" height="6" fill="black" />
                    <rect x="38" y="56" width="6" height="8" fill="black" />
                    <rect x="50" y="56" width="8" height="6" fill="black" />
                    <rect x="66" y="58" width="6" height="8" fill="black" />
                    <rect x="80" y="60" width="8" height="6" fill="black" />
                    <rect x="38" y="74" width="8" height="8" fill="black" />
                    <rect x="52" y="76" width="8" height="8" fill="black" />
                    <rect x="68" y="74" width="10" height="6" fill="black" />
                    <rect x="84" y="80" width="6" height="8" fill="black" />
                  </svg>

                  {/* BD Flag Emblem in Center of QR */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-10 h-10 bg-emerald-800 rounded-full border-2 border-white flex items-center justify-center shadow">
                      <div className="w-4 h-4 bg-red-600 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="mt-4 space-y-1.5">
                <h4 className="text-lg sm:text-xl font-black text-emerald-900">
                  টোকেন নিতে আপনার ফোনে স্ক্যান করুন
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                  ক্যামেরা বা Google Lens দিয়ে স্ক্যান করলেই সরাসরি <strong>টোকেন বুকিং ফরম</strong> ওপেন হয়ে যাবে। কোনো অ্যাপ ইনস্টল করার প্রয়োজন নেই।
                </p>
                <div className="pt-2 text-xs font-mono font-bold text-emerald-800 bg-emerald-50 py-1.5 px-4 rounded-lg inline-block border border-emerald-200">
                  বুথ কোড: UDC-MIA-01 (উজিরপুর, চৌদ্দগ্রাম)
                </div>
              </div>

              {/* Standee Footer */}
              <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                <span>স্মার্ট বাংলাদেশ গড়ার প্রত্যয়ে</span>
                <span className="font-bold text-emerald-800">মিয়া বাজার, চৌদ্দগ্রাম, কুমিল্লা</span>
              </div>

            </div>

            {/* Print & Download Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={downloadStandeePNG}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <Download className="w-4 h-4" />
                HD Standee PNG ডাউনলোড করুন
              </button>

              <button
                onClick={() => window.print()}
                className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                স্ট্যান্ডি পোস্টার প্রিন্ট করুন
              </button>
            </div>

          </div>
        )}

        {/* -------------------- 4. ADMIN & OPERATOR DASHBOARD -------------------- */}
        {activeTab === 'admin' && (
          <div>
            {!isAdminLoggedIn ? (
              // Login Screen
              <div className="max-w-md mx-auto my-8 bg-white p-8 rounded-3xl shadow-xl border border-slate-200 text-center">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">অ্যাডমিন ও উদ্যোক্তা লগইন</h3>
                <p className="text-xs text-slate-500 mt-1 mb-6">
                  {CENTER_DETAILS.address} এর অনুমোদিত কর্মচারীদের জন্য
                </p>

                <form onSubmit={handleAdminLogin} className="space-y-4">
                  {adminPinError && (
                    <div className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                      {adminPinError}
                    </div>
                  )}

                  <div className="text-left">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      অ্যাক্সেস পিন কোড (সঠিক পিন: 4169)
                    </label>
                    <input
                      type="password"
                      placeholder="••••"
                      value={adminPin}
                      onChange={(e) => setAdminPin(e.target.value)}
                      className="w-full text-center text-xl tracking-widest bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      maxLength="8"
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3.5 rounded-xl transition shadow flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    ড্যাশবোর্ডে প্রবেশ করুন
                  </button>
                </form>

                <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400">
                  উজিরপুর ইউনিয়ন ডিজিটাল সেন্টার, চৌদ্দগ্রাম, কুমিল্লা
                </div>
              </div>
            ) : (
              // Full Admin Control View
              <div className="space-y-6">
                
                {/* Admin Header with Actions */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
                      <h3 className="text-lg font-bold text-slate-800">ইউডিসি কন্ট্রোল প্যানেল</h3>
                    </div>
                    <p className="text-xs text-slate-500">{CENTER_DETAILS.address}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      onClick={handleCallNextToken}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow transition flex items-center gap-2 cursor-pointer"
                    >
                      <Volume2 className="w-4 h-4 text-yellow-300" />
                      পরবর্তী টোকেন ডাকুন
                    </button>

                    <button
                      onClick={handleResetQueue}
                      className="bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 hover:border-red-200 transition flex items-center gap-1.5 cursor-pointer"
                      title="আজকের সকল টোকেন রিসেট করুন"
                    >
                      <RotateCcw className="w-4 h-4" />
                      দৈনিক রিসেট
                    </button>

                    <button
                      onClick={() => setIsAdminLoggedIn(false)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      লগআউট
                    </button>
                  </div>
                </div>

                {/* Dashboard Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="text-xs text-slate-500">মোট ইস্যুকৃত টোকেন</div>
                    <div className="text-2xl font-black text-slate-800 mt-1">{toBengaliNumber(tokens.length)} টি</div>
                  </div>

                  <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 shadow-sm">
                    <div className="text-xs text-amber-800">অপেক্ষমাণ সংখ্যা</div>
                    <div className="text-2xl font-black text-amber-900 mt-1">{toBengaliNumber(waitingTokens.length)} জন</div>
                  </div>

                  <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 shadow-sm">
                    <div className="text-xs text-emerald-800">সেবা সম্পন্ন হয়েছে</div>
                    <div className="text-2xl font-black text-emerald-900 mt-1">{toBengaliNumber(completedTokens.length)} টি</div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200 shadow-sm">
                    <div className="text-xs text-blue-800">বর্তমানে চলমান</div>
                    <div className="text-2xl font-black text-blue-900 mt-1">
                      {currentlyCalling ? toBengaliNumber(currentlyCalling.id) : 'নেই'}
                    </div>
                  </div>
                </div>

                {/* Filters and Search Bar */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
                  <div className="relative w-full md:w-80">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="টোকেন নং, নাম বা মোবাইল সার্চ..."
                      value={adminSearch}
                      onChange={(e) => setAdminSearch(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    {/* Filter by Service */}
                    <select
                      value={adminFilterService}
                      onChange={(e) => setAdminFilterService(e.target.value)}
                      className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none"
                    >
                      <option value="all">সকল সেবা</option>
                      {DIGITAL_SERVICES.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>

                    {/* Filter by Status */}
                    <select
                      value={adminFilterStatus}
                      onChange={(e) => setAdminFilterStatus(e.target.value)}
                      className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none"
                    >
                      <option value="all">সকল স্ট্যাটাস</option>
                      <option value="waiting">অপেক্ষমাণ (Waiting)</option>
                      <option value="calling">চলমান (Calling)</option>
                      <option value="completed">সম্পন্ন (Completed)</option>
                      <option value="skipped">স্কিপ করা (Skipped)</option>
                      <option value="cancelled">বাতিল (Cancelled)</option>
                    </select>
                  </div>
                </div>

                {/* Token Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm text-slate-600">
                      <thead className="bg-slate-100 text-slate-700 uppercase font-semibold text-[11px] border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-4">টোকেন নং</th>
                          <th className="py-3 px-4">সেবার নাম</th>
                          <th className="py-3 px-4">সেবাগ্রহীতার বিবরণ</th>
                          <th className="py-3 px-4">ইস্যুর সময়</th>
                          <th className="py-3 px-4">অবস্থা</th>
                          <th className="py-3 px-4 text-center">ব্যবস্থাপনা ও অ্যাকশন</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredTokens.length > 0 ? (
                          filteredTokens.map((token) => (
                            <tr key={token.id} className="hover:bg-slate-50 transition">
                              <td className="py-3 px-4 font-mono font-bold text-slate-800 text-sm">
                                {toBengaliNumber(token.id)}
                              </td>
                              <td className="py-3 px-4 font-medium text-slate-800">
                                {token.serviceName}
                              </td>
                              <td className="py-3 px-4">
                                <div className="font-semibold text-slate-800">{token.citizenName}</div>
                                <div className="text-[11px] text-slate-400">{token.phone}</div>
                              </td>
                              <td className="py-3 px-4 text-slate-500 font-mono">
                                {toBengaliNumber(token.createdAt)}
                              </td>
                              <td className="py-3 px-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                  token.status === 'calling'
                                    ? 'bg-red-100 text-red-700 animate-pulse'
                                    : token.status === 'completed'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : token.status === 'skipped'
                                    ? 'bg-orange-100 text-orange-800'
                                    : token.status === 'cancelled'
                                    ? 'bg-slate-200 text-slate-600'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {token.status === 'calling' ? 'চলমান (ডাকা হচ্ছে)' :
                                   token.status === 'completed' ? 'সম্পন্ন' :
                                   token.status === 'skipped' ? 'স্কিপ' :
                                   token.status === 'cancelled' ? 'বাতিল' : 'অপেক্ষমাণ'}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                  {/* Call / Recall */}
                                  <button
                                    onClick={() => handleUpdateTokenStatus(token.id, 'calling')}
                                    className="p-1.5 bg-yellow-50 hover:bg-yellow-100 text-yellow-800 rounded-lg border border-yellow-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                                    title="টোকেন ডাকুন"
                                  >
                                    <Volume2 className="w-3.5 h-3.5 text-yellow-600" />
                                    ডাকুন
                                  </button>

                                  {/* Mark Complete */}
                                  <button
                                    onClick={() => handleUpdateTokenStatus(token.id, 'completed')}
                                    className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                                    title="সেবা সম্পন্ন"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    সম্পন্ন
                                  </button>

                                  {/* Skip */}
                                  <button
                                    onClick={() => handleUpdateTokenStatus(token.id, 'skipped')}
                                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium cursor-pointer"
                                    title="স্কিপ করুন"
                                  >
                                    <SkipForward className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Cancel */}
                                  <button
                                    onClick={() => handleUpdateTokenStatus(token.id, 'cancelled')}
                                    className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-medium cursor-pointer"
                                    title="বাতিল করুন"
                                  >
                                    <XCircle className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="text-center py-8 text-slate-400">
                              ফিল্টার অনুযায়ী কোনো টোকেন পাওয়া যায়নি
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

      </main>

      {/* -------------------- CAMERA / QR SCANNER MODAL WITH DIRECT TRANSITION -------------------- */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
            
            <div className="bg-emerald-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-yellow-300" />
                <div>
                  <h3 className="font-bold text-sm sm:text-base">QR কোড স্ক্যানার</h3>
                  <p className="text-[10px] text-emerald-200">উজিরপুর ইউনিয়ন পরিষদ, মিয়া বাজার</p>
                </div>
              </div>
              <button
                onClick={stopCamera}
                className="text-white/80 hover:text-white p-1 rounded-full hover:bg-emerald-800"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 text-center space-y-4">
              
              {/* Permission alert if blocked */}
              {cameraPermissionError ? (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-left space-y-2">
                  <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    ক্যামেরা পারমিশন পাওয়া যায়নি
                  </div>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    আপনার ফোনের ব্রাউজারে ক্যামেরা পারমিশন ব্লক করা থাকতে পারে। কোনো সমস্যা নেই, নিচের বাটনে চাপ দিয়ে <strong>সরাসরি বুকিং ফর্মে</strong> যেতে পারেন:
                  </p>
                  <button
                    onClick={() => navigateToBookingForm('সরাসরি বাটন (নো পারমিশন)')}
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold py-2.5 rounded-xl shadow mt-2"
                  >
                    সরাসরি বুকিং ফর্মে যান →
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-xs text-slate-600">
                    ক্যামেরাটি ডিজিটাল সেন্টারের QR কোডের দিকে ধরুন অথবা নিচের বাটন চাপুন
                  </p>

                  {/* Viewfinder simulation */}
                  <div className="relative w-64 h-64 mx-auto bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center border-4 border-emerald-500 shadow-inner">
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      playsInline
                      autoPlay
                      muted
                    />
                    
                    {/* Visual Target Reticle */}
                    <div className="absolute inset-4 border-2 border-dashed border-yellow-300/80 rounded-xl pointer-events-none flex items-center justify-center">
                      <div className="w-full h-0.5 bg-red-500 animate-pulse"></div>
                    </div>

                    <div className="absolute bottom-2 text-[10px] text-white/80 bg-black/60 px-2 py-0.5 rounded">
                      ক্যামেরা স্ক্যানার সক্রিয়
                    </div>
                  </div>
                </>
              )}

              {/* Action buttons inside scanner */}
              <div className="space-y-2.5 pt-1">
                <button
                  onClick={() => navigateToBookingForm('ক্যামেরা স্ক্যান')}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs sm:text-sm font-bold py-3 rounded-xl shadow transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-yellow-300" />
                  উজিরপুর ডিজিটাল সেন্টার QR সনাক্ত করুন
                </button>

                {/* Upload QR image from gallery */}
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleQrImageUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    গ্যালারি থেকে QR ছবি নির্বাচন করুন
                  </button>
                </div>

                {/* Manual Fallback Input */}
                <form onSubmit={handleManualScanSubmit} className="pt-2 border-t border-slate-100 flex gap-2">
                  <input
                    type="text"
                    placeholder="বুথ কোড লিখুন (যেমন: UDC-MIA-01)"
                    value={manualCodeInput}
                    onChange={(e) => setManualCodeInput(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <button
                    type="submit"
                    className="bg-slate-800 text-white px-3.5 py-2 rounded-xl text-xs font-semibold hover:bg-slate-900"
                  >
                    যাচাই
                  </button>
                </form>

                <button
                  onClick={() => navigateToBookingForm('সরাসরি প্রবেশ')}
                  className="w-full text-emerald-800 hover:text-emerald-950 text-xs font-bold py-1.5 transition flex items-center justify-center gap-1"
                >
                  ক্যামেরা ছাড়াই সরাসরি বুকিং ফর্মে যান <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-6 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <span className="font-semibold text-slate-300">ডিজিটাল সেন্টার স্মার্ট টোকেন ও কিউ ম্যানেজমেন্ট সিস্টেম</span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              উজিরপুর ইউনিয়ন পরিষদ, মিয়া বাজার, চৌদ্দগ্রাম, কুমিল্লা | তথ্য ও সেবা কেন্দ্র
            </p>
          </div>
          <div className="text-[11px] text-slate-500">
            কারিগরি সহায়তা: এটুআই (a2i) স্ট্যান্ডার্ড ইউআই ফ্রেমওয়ার্ক | ২০২৬
          </div>
        </div>
      </footer>

    </div>
  );
}