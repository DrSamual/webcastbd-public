/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Tv,
  Flame,
  Play,
  Film,
  Radio,
  Search,
  Moon,
  Sun,
  Menu,
  X,
  Copy,
  Check,
  Download,
  BookOpen,
  Users,
  Clock,
  ArrowRight,
  Maximize2,
  RotateCcw,
  Bell,
  Code2,
  MonitorPlay,
  Trophy,
  Server,
  Share2,
  Bookmark,
  BookmarkCheck,
  Send,
  Flag,
  Sparkles,
  Layers,
  Heart
} from 'lucide-react';

interface ServerOption {
  name: string;
  url: string;
}

interface MatchItem {
  id: string;
  title: string;
  team1Name: string;
  team1Logo: string;
  team2Name: string;
  team2Logo: string;
  startTime: string;
  endTime: string;
  status: 'live' | 'upcoming' | 'finished';
  servers: ServerOption[];
}

interface ChannelItem {
  id: string;
  name: string;
  category: string;
  logoUrl: string;
  streamUrl: string;
}

interface MovieItem {
  id: string;
  title: string;
  category: 'bangla_movie' | 'natok' | 'series' | 'hindi' | 'action' | string;
  type: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration?: string;
}

export default function App() {
  // Navigation & View Mode
  const [activeTab, setActiveTab] = useState<'preview' | 'xmlCode'>('preview');
  const [filter, setFilter] = useState<'all' | 'matches' | 'channels' | 'movies' | 'favorites'>('all');
  const [subMovieFilter, setSubMovieFilter] = useState<'all' | 'natok' | 'series' | 'bangla_movie' | 'hindi' | 'action'>('all');
  const [channelFilter, setChannelFilter] = useState<'all' | 'Sports' | 'News' | 'Music' | 'Docu'>('all');
  
  // UI States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpenMobile, setIsSearchOpenMobile] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [xmlContent, setXmlContent] = useState<string>('');

  // Player state
  const [activePlayer, setActivePlayer] = useState<{
    title: string;
    subtitle: string;
    servers: ServerOption[];
    currentServerIndex: number;
    type?: 'match' | 'channel' | 'movie';
  } | null>(null);

  // Player recommendation tab
  const [playerRecTab, setPlayerRecTab] = useState<'matches' | 'channels' | 'movies'>('matches');

  // Favorites in LocalStorage
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('wc_favorites');
      return saved ? JSON.parse(saved) : ['m1', 'c1'];
    } catch {
      return ['m1', 'c1'];
    }
  });

  // Online visitors count (synced from Firebase / simulated fallback)
  const [onlineCount, setOnlineCount] = useState(1350);

  // Notice ticker text
  const [noticeText, setNoticeText] = useState(
    'স্বাগতম WebCast BD-এ: কোনো প্রকার বাফারিং ছাড়াই সরাসরি লাইভ ক্রিকেট, ফুটবল ম্যাচ, টিভি চ্যানেল এবং এইচডি মুভি উপভোগ করুন!'
  );

  // Default rich data & Firebase fetched states
  const [realChannels, setRealChannels] = useState<ChannelItem[]>([]);
  const [realMovies, setRealMovies] = useState<MovieItem[]>([]);
  const [, setTick] = useState(0);

  // Fallback initial data
  const defaultMatches: MatchItem[] = [
    {
      id: 'm1',
      title: 'ICC Champions Trophy 2026',
      team1Name: 'বাংলাদেশ (Bangladesh)',
      team1Logo: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=120&auto=format&fit=crop&q=80',
      team2Name: 'শ্রীলঙ্কা (Sri Lanka)',
      team2Logo: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=120&auto=format&fit=crop&q=80',
      startTime: new Date(Date.now() - 40 * 60000).toISOString(),
      endTime: new Date(Date.now() + 180 * 60000).toISOString(),
      status: 'live',
      servers: [
        { name: 'Server 1 (T Sports HD)', url: 'https://tvsen5.aynaott.com/TnMn5kZz8aLm/index.m3u8' },
        { name: 'Server 2 (Fast 720p)', url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' },
        { name: 'Server 3 (Ultra Low Buffer)', url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' }
      ]
    },
    {
      id: 'm2',
      title: 'UEFA Champions League · Quarter Final',
      team1Name: 'রিয়াল মাদ্রিদ (Real Madrid)',
      team1Logo: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=120&auto=format&fit=crop&q=80',
      team2Name: 'ম্যান সিটি (Man City)',
      team2Logo: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=120&auto=format&fit=crop&q=80',
      startTime: new Date(Date.now() + 115 * 60000).toISOString(),
      endTime: new Date(Date.now() + 240 * 60000).toISOString(),
      status: 'upcoming',
      servers: [
        { name: 'Server 1 (Sony Ten 1 HD)', url: 'https://bldcmprod-cdn.toffeelive.com/cdn/live/sony_sports_1_hd/playlist.m3u8' },
        { name: 'Server 2 (Fast Stream)', url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' }
      ]
    },
    {
      id: 'm3',
      title: 'English Premier League · Derby',
      team1Name: 'আর্সেনাল (Arsenal)',
      team1Logo: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=120&auto=format&fit=crop&q=80',
      team2Name: 'লিভারপুল (Liverpool)',
      team2Logo: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=120&auto=format&fit=crop&q=80',
      startTime: new Date(Date.now() + 320 * 60000).toISOString(),
      endTime: new Date(Date.now() + 450 * 60000).toISOString(),
      status: 'upcoming',
      servers: [
        { name: 'Server 1 (Star Sports 1)', url: 'https://streamhub.dhruvpatil681.workers.dev/1088.m3u8' },
        { name: 'Server 2 (Backup)', url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' }
      ]
    },
    {
      id: 'm4',
      title: 'BPL 2026 · Grand Final',
      team1Name: 'রংপুর রাইডার্স (Rangpur)',
      team1Logo: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=120&auto=format&fit=crop&q=80',
      team2Name: 'ফরচুন বরিশাল (Barishal)',
      team2Logo: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=120&auto=format&fit=crop&q=80',
      startTime: new Date(Date.now() + 720 * 60000).toISOString(),
      endTime: new Date(Date.now() + 960 * 60000).toISOString(),
      status: 'upcoming',
      servers: [
        { name: 'T Sports 4K Server', url: 'https://tvsen5.aynaott.com/TnMn5kZz8aLm/index.m3u8' }
      ]
    }
  ];

  const defaultSeedMovies: MovieItem[] = [
    {
      id: 'mov1',
      title: 'তুফান (Toofan)',
      category: 'bangla_movie',
      type: 'সিনেমা',
      thumbnailUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=350&auto=format&fit=crop&q=80',
      videoUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      duration: '2h 28m'
    },
    {
      id: 'mov2',
      title: 'ব্যাচেলর পয়েন্ট (Bachelor Point S5)',
      category: 'natok',
      type: 'বাংলা নাটক',
      thumbnailUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=350&auto=format&fit=crop&q=80',
      videoUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      duration: 'পর্ব ৮৪'
    },
    {
      id: 'mov3',
      title: 'কারাগার (Karagar Series)',
      category: 'series',
      type: 'ওয়েব সিরিজ',
      thumbnailUrl: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=350&auto=format&fit=crop&q=80',
      videoUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      duration: 'সিজন ১-২'
    },
    {
      id: 'mov4',
      title: 'প্রিয়তমা (Priyotoma)',
      category: 'bangla_movie',
      type: 'সিনেমা',
      thumbnailUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=350&auto=format&fit=crop&q=80',
      videoUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      duration: '2h 15m'
    },
    {
      id: 'mov5',
      title: 'মহানগর ২ (Mohanagar Season 2)',
      category: 'series',
      type: 'ওয়েব সিরিজ',
      thumbnailUrl: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=350&auto=format&fit=crop&q=80',
      videoUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      duration: '৮টি পর্ব'
    },
    {
      id: 'mov6',
      title: 'বুকভরা ভালোবাসা (নাটক)',
      category: 'natok',
      type: 'টেলিফিল্ম',
      thumbnailUrl: 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=350&auto=format&fit=crop&q=80',
      videoUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      duration: 'নাটক'
    },
    {
      id: 'mov7',
      title: 'সাল্যার: পার্ট ১ (Salaar)',
      category: 'hindi',
      type: 'হিন্দি ডাবিং',
      thumbnailUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=350&auto=format&fit=crop&q=80',
      videoUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      duration: '2h 55m'
    },
    {
      id: 'mov8',
      title: 'Dune: Part Two',
      category: 'action',
      type: 'হলিউড অ্যাকশন',
      thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=350&auto=format&fit=crop&q=80',
      videoUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      duration: '2h 46m'
    }
  ];

  // Fetch real data directly from the user's Firebase Realtime Database
  useEffect(() => {
    // 1. Fetch Real Live Channels
    fetch('https://webcastbd-4070e-default-rtdb.firebaseio.com/liveChannels.json')
      .then((r) => r.json())
      .then((data) => {
        if (data && typeof data === 'object') {
          const list: ChannelItem[] = Object.keys(data).map((key) => {
            const item = data[key];
            const name = item.name || 'Channel';
            let cat = 'Sports';
            if (name.includes('Music') || name.includes('9X') || name.includes('Hits') || name.includes('Zoom')) {
              cat = 'Music';
            } else if (name.includes('Discovery') || name.includes('Animal') || name.includes('Geographic') || name.includes('Travel')) {
              cat = 'Docu';
            } else if (name.includes('News') || name.includes('Somoy') || name.includes('Jamuna')) {
              cat = 'News';
            }
            return {
              id: key,
              name: item.name,
              category: cat,
              logoUrl: item.logoUrl || 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=120&auto=format&fit=crop&q=80',
              streamUrl: item.streamUrl || 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
            };
          });
          if (list.length > 0) {
            setRealChannels(list);
          }
        }
      })
      .catch((e) => console.log('Firebase channels fetch info:', e));

    // 2. Fetch Real Movies from Firebase and merge
    fetch('https://webcastbd-4070e-default-rtdb.firebaseio.com/movies.json')
      .then((r) => r.json())
      .then((data) => {
        if (data && typeof data === 'object') {
          const fbMovies: MovieItem[] = Object.keys(data).map((k) => ({
            id: k,
            title: data[k].title || 'Movie',
            category: (data[k].category || 'action').toLowerCase(),
            type: data[k].category || 'সিনেমা',
            thumbnailUrl: data[k].thumbnailUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=350&auto=format&fit=crop&q=80',
            videoUrl: data[k].videoUrl || 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
            duration: 'HD'
          }));
          setRealMovies([...fbMovies, ...defaultSeedMovies]);
        } else {
          setRealMovies(defaultSeedMovies);
        }
      })
      .catch(() => setRealMovies(defaultSeedMovies));

    // 3. Fetch Settings
    fetch('https://webcastbd-4070e-default-rtdb.firebaseio.com/settings.json')
      .then((r) => r.json())
      .then((st) => {
        if (st) {
          if (st.noticeText) setNoticeText(st.noticeText);
          if (st.onlineUsers) setOnlineCount(st.onlineUsers);
        }
      })
      .catch(() => {});

    // 4. Fetch XML file text for viewer
    fetch('/webcastbd-blogger-theme.xml')
      .then((res) => res.text())
      .then((text) => setXmlContent(text))
      .catch(() => {
        fetch('/assets/aistudio/webcastbduser-v1_273bb05a.xml')
          .then((r) => r.text())
          .then((t) => setXmlContent(t));
      });
  }, []);

  // Update countdown every second
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Toast utility
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Toggle Favorite
  const toggleFavorite = (id: string, name: string) => {
    const next = favorites.includes(id) ? favorites.filter((f) => f !== id) : [...favorites, id];
    setFavorites(next);
    localStorage.setItem('wc_favorites', JSON.stringify(next));
    showToast(favorites.includes(id) ? `"${name}" ফেভারিট থেকে বাদ দেওয়া হয়েছে` : `"${name}" প্রিয় তালিকায় যোগ করা হয়েছে`);
  };

  // Copy XML handler
  const handleCopyXml = async () => {
    try {
      if (xmlContent) {
        await navigator.clipboard.writeText(xmlContent);
      } else {
        const res = await fetch('/webcastbd-blogger-theme.xml');
        const txt = await res.text();
        await navigator.clipboard.writeText(txt);
      }
      setCopied(true);
      showToast('পুরো XML কোড সফলভাবে কপি হয়েছে!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      alert('ক্লিপবোর্ডে কপি করতে সমস্যা হয়েছে। দয়া করে কোড ভিউ থেকে ম্যানুয়ালি কপি করুন।');
    }
  };

  // Download XML file
  const handleDownloadXml = () => {
    const element = document.createElement('a');
    const file = new Blob([xmlContent], { type: 'text/xml' });
    element.href = URL.createObjectURL(file);
    element.download = 'webcastbd-blogger-theme-v3.5.xml';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showToast('XML ফাইল ডাউনলোড শুরু হয়েছে');
  };

  // Calculate remaining countdown
  const getCountdown = (targetIso: string) => {
    const diff = new Date(targetIso).getTime() - Date.now();
    if (diff <= 0) return 'শুরু হচ্ছে...';
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    if (d > 0) return `${d}দিন ${h}ঘণ্টা ${m}মি`;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentChannels = realChannels.length > 0 ? realChannels : [
    { id: 'c1', name: 'T Sports HD', category: 'Sports', logoUrl: 'https://i.postimg.cc/Qx3GZn6T/20240823_024117.png', streamUrl: 'https://tvsen5.aynaott.com/TnMn5kZz8aLm/index.m3u8' },
    { id: 'c2', name: 'Star Sports 1', category: 'Sports', logoUrl: 'https://i.postimg.cc/DzDHjCJm/20240823_024249.png', streamUrl: 'https://streamhub.dhruvpatil681.workers.dev/1088.m3u8' },
    { id: 'c3', name: 'Sony Ten 1', category: 'Sports', logoUrl: 'https://i.postimg.cc/65fsWLS1/20240823_024136.png', streamUrl: 'https://bldcmprod-cdn.toffeelive.com/cdn/live/sony_sports_1_hd/playlist.m3u8' },
    { id: 'c4', name: 'Willow Sports', category: 'Sports', logoUrl: 'https://i.postimg.cc/HntSg3xw/20240823_024624.png', streamUrl: 'https://streamhub.dhruvpatil681.workers.dev/2028.m3u8' },
    { id: 'c5', name: 'Discovery HD', category: 'Docu', logoUrl: 'https://i.postimg.cc/cJ90sMKN/20240823_023541.png', streamUrl: 'http://202.70.146.135:8000/play/a05z/index.m3u8' },
    { id: 'c6', name: '9XM Music', category: 'Music', logoUrl: 'https://i.postimg.cc/SRKS6TwR/20240823_022008.png', streamUrl: 'http://103.175.73.12:8080/live/155/155_0.m3u8' }
  ];

  const currentMovies = realMovies.length > 0 ? realMovies : defaultSeedMovies;

  // Filtered lists
  const filteredMatches = defaultMatches.filter((m) => {
    if (filter === 'favorites' && !favorites.includes(m.id)) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return m.title.toLowerCase().includes(q) || m.team1Name.toLowerCase().includes(q) || m.team2Name.toLowerCase().includes(q);
  });

  const filteredChannels = currentChannels.filter((c) => {
    if (filter === 'favorites' && !favorites.includes(c.id)) return false;
    if (channelFilter !== 'all' && c.category !== channelFilter) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.category.toLowerCase().includes(q);
  });

  const filteredMovies = currentMovies.filter((mov) => {
    if (filter === 'favorites' && !favorites.includes(mov.id)) return false;
    if (subMovieFilter !== 'all' && mov.category !== subMovieFilter) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return mov.title.toLowerCase().includes(q) || mov.category.toLowerCase().includes(q) || mov.type.toLowerCase().includes(q);
  });

  const videoRef = useRef<HTMLVideoElement>(null);

  // Play video with HLS support
  useEffect(() => {
    if (activePlayer && videoRef.current) {
      const activeServer = activePlayer.servers[activePlayer.currentServerIndex];
      if (activeServer?.url) {
        const url = activeServer.url;
        if (url.includes('.m3u8')) {
          import('hls.js').then(({ default: Hls }) => {
            if (Hls.isSupported() && videoRef.current) {
              const hls = new Hls({ enableWorker: true });
              hls.loadSource(url);
              hls.attachMedia(videoRef.current);
            } else if (videoRef.current?.canPlayType('application/vnd.apple.mpegurl')) {
              videoRef.current.src = url;
            }
          });
        } else {
          videoRef.current.src = url;
        }
      }
    }
  }, [activePlayer]);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#07090e] text-slate-100' : 'bg-slate-50 text-slate-900'} font-sans flex flex-col selection:bg-rose-600 selection:text-white transition-colors duration-300`}>
      
      {/* ===== TOAST NOTIFICATION ===== */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-[100] bg-rose-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ===== BLOGGER CONTROLS TOP BAR ===== */}
      <div className="bg-[#0b0e17] border-b border-rose-900/30 text-xs py-2 px-3 sm:px-6 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-extrabold tracking-tight text-white flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-rose-500" />
              <span>WebCast BD · ব্লগার থিম এক্সএমএল (Blogger XML)</span>
            </span>
            <span className="hidden sm:inline-block text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
              Firebase Connected
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="bg-black/50 p-0.5 rounded-lg border border-white/10 flex items-center">
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1 px-3 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  activeTab === 'preview'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <MonitorPlay className="w-3 h-3" />
                <span>লাইভ প্রিভিউ</span>
              </button>
              <button
                onClick={() => setActiveTab('xmlCode')}
                className={`flex items-center gap-1 px-3 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  activeTab === 'xmlCode'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Code2 className="w-3 h-3" />
                <span>পুরো XML কোড</span>
              </button>
            </div>

            <button
              onClick={handleCopyXml}
              className="flex items-center gap-1 px-3 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-colors shadow-sm cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'কপি হয়েছে!' : 'কোড কপি'}</span>
            </button>

            <button
              onClick={handleDownloadXml}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-[11px] transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>ডাউনলোড</span>
            </button>

            <button
              onClick={() => setShowSetupGuide(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-semibold text-[11px] transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ইনস্টল গাইড</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===== XML CODE VIEWER TAB ===== */}
      {activeTab === 'xmlCode' ? (
        <div className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 flex flex-col">
          <div className="bg-[#121724] border border-slate-800 rounded-2xl p-4 sm:p-6 mb-4 shadow-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-rose-500" />
                  <span>webcastbd-blogger-theme-v3.5.xml</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  এই পূর্ণাঙ্গ Blogger XML ফাইলটিতে রিয়েলটাইম ফায়ারবেস ইন্টিগ্রেশন, ড্রামা/সিরিজ ক্যাটাগরি, প্লেয়ার ও মোবাইল রেসপনসিভনেস সাজানো রয়েছে।
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyXml}
                  className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'কপি সম্পন্ন!' : 'এক ক্লিকে পুরো XML কপি'}</span>
                </button>
                <button
                  onClick={handleDownloadXml}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>.xml ডাউনলোড</span>
                </button>
              </div>
            </div>

            <div className="mt-4 relative">
              <pre className="bg-[#07090e] border border-slate-800 text-slate-300 text-xs p-4 rounded-xl overflow-x-auto max-h-[600px] font-mono leading-relaxed select-all">
                {xmlContent || 'Loading XML content...'}
              </pre>
            </div>
          </div>
        </div>
      ) : (
        /* ===== LIVE BLOGGER THEME PREVIEW TAB ===== */
        <div className="flex-1 flex flex-col pb-20">
          {/* Main Topbar */}
          <header className={`sticky top-[41px] z-40 border-b backdrop-blur-xl transition-colors ${
            isDark ? 'bg-[#07090e]/92 border-slate-800/80' : 'bg-white/95 border-slate-200'
          }`}>
            <div className="max-w-7xl mx-auto px-4 h-15 flex items-center justify-between gap-3">
              {/* Left Logo & Drawer Trigger */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsDrawerOpen(true)}
                  className={`p-2 rounded-xl border transition-all hover:scale-105 ${
                    isDark ? 'bg-[#131824] border-slate-800 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900'
                  }`}
                  aria-label="Menu"
                >
                  <Menu className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setActivePlayer(null); setFilter('all'); }}>
                  <div className="w-8.5 h-8.5 rounded-xl bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center text-white shadow-lg shadow-rose-600/30">
                    <Tv className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-lg font-extrabold tracking-tight">
                      WebCast<span className="text-rose-500">BD</span>
                    </span>
                    <span className="text-[9px] font-extrabold uppercase bg-rose-600 text-white px-1.5 py-0.5 rounded tracking-wider shadow-sm">
                      PRO
                    </span>
                  </div>
                </div>
              </div>

              {/* Center Search Bar */}
              <div className="hidden md:flex flex-1 max-w-md mx-4">
                <div className={`w-full flex items-center gap-2 px-3.5 py-2 rounded-xl border transition-all ${
                  isDark ? 'bg-[#131824] border-slate-800 focus-within:border-rose-500 focus-within:shadow-[0_0_15px_rgba(229,9,20,0.2)]' : 'bg-slate-100 border-slate-200 focus-within:border-rose-500'
                }`}>
                  <Search className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ম্যাচ, চ্যানেল, মুভি, নাটক বা সিরিজ খুঁজুন..."
                    className="w-full bg-transparent text-xs outline-none placeholder:text-slate-500"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-white">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Right Controls */}
              <div className="flex items-center gap-2">
                {/* Live Online Badge */}
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${
                  isDark ? 'bg-[#131824] border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="font-mono font-bold">{onlineCount.toLocaleString('bn-BD')}</span>
                  <span className="hidden sm:inline text-slate-400 text-[11px]">অনলাইনে</span>
                </div>

                {/* Mobile Search Toggle */}
                <button
                  onClick={() => setIsSearchOpenMobile(!isSearchOpenMobile)}
                  className={`md:hidden p-2 rounded-xl border transition-colors ${
                    isDark ? 'bg-[#131824] border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <Search className="w-4.5 h-4.5" />
                </button>

                {/* Theme Toggle */}
                <button
                  onClick={() => setIsDark(!isDark)}
                  className={`p-2 rounded-xl border transition-colors ${
                    isDark ? 'bg-[#131824] border-slate-800 text-amber-400' : 'bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                  title="Theme toggle"
                >
                  {isDark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {/* Mobile Expanded Search */}
            {isSearchOpenMobile && (
              <div className="md:hidden px-4 pb-3 pt-1 border-t border-slate-800">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#131824] border border-slate-800">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ম্যাচ, নাটক, চ্যানেল খুঁজুন..."
                    className="w-full bg-transparent text-xs outline-none"
                    autoFocus
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')}>
                      <X className="w-4 h-4 text-slate-400" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </header>

          {/* ===== NEWS TICKER ===== */}
          <div className="bg-[#0d111a] border-b border-slate-800/80 text-xs py-1.5 px-3 flex items-center overflow-hidden">
            <div className="flex items-center gap-1.5 bg-rose-600 text-white px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider shrink-0 mr-3 shadow-sm">
              <Bell className="w-3 h-3" />
              <span>LIVE</span>
            </div>
            <div className="whitespace-nowrap overflow-hidden">
              <div className="inline-block animate-marquee text-slate-300">
                <span className="mx-4">
                  <strong className="text-white">নোটিশ:</strong> {noticeText}
                </span>
                <span className="mx-4">
                  ⚡ <strong className="text-amber-400">হাই স্পিড স্ট্রিমিং:</strong> ফায়ারবেস রিয়েলটাইম ডেটাবেজ যুক্ত।
                </span>
                <span className="mx-4">
                  🏆 <strong className="text-rose-400">লাইভ স্পোর্টস:</strong> টি স্পোর্টস, স্টার স্পোর্টস ১, সনি টেন ১ সরাসরি দেখুন।
                </span>
              </div>
            </div>
          </div>

          {/* ===== MAIN CONTAINER ===== */}
          <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 pt-5">
            {/* If video player is active */}
            {activePlayer ? (
              <div className="mb-8">
                {/* Back button & Action controls */}
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <button
                    onClick={() => setActivePlayer(null)}
                    className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#131824] border border-slate-800 text-slate-300 hover:text-white hover:border-rose-500 transition-colors cursor-pointer"
                  >
                    <ArrowRight className="w-4 h-4 rotate-180" />
                    <span>ফিরে যান (Back to List)</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({ title: activePlayer.title, url: window.location.href });
                        } else {
                          navigator.clipboard.writeText(window.location.href);
                          showToast('লিংক কপি করা হয়েছে!');
                        }
                      }}
                      className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">শেয়ার</span>
                    </button>
                    <button
                      onClick={() => setShowReportModal(true)}
                      className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-red-950/40 text-red-300 border border-red-800/40 hover:bg-red-900/40 cursor-pointer"
                    >
                      <Flag className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">রিপোর্ট</span>
                    </button>
                  </div>
                </div>

                {/* Player Main Card */}
                <div className="bg-[#131824] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                  {/* Video Screen */}
                  <div className="aspect-video w-full bg-black relative flex items-center justify-center">
                    <video
                      ref={videoRef}
                      controls
                      autoPlay
                      playsInline
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Player Details Bar */}
                  <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base sm:text-lg font-extrabold text-white">
                        {activePlayer.title}
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">{activePlayer.subtitle}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (videoRef.current) {
                            videoRef.current.load();
                            videoRef.current.play().catch(() => {});
                            showToast('স্ট্রিম রিলোড করা হচ্ছে...');
                          }
                        }}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                        title="রিলোড"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (videoRef.current?.requestFullscreen) {
                            videoRef.current.requestFullscreen();
                          }
                        }}
                        className="p-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition-colors cursor-pointer"
                        title="ফুলস্ক্রিন"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Multi-server switcher */}
                  <div className="p-3 bg-[#0d111a] flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-bold text-slate-400 flex items-center gap-1.5 mr-1">
                      <Server className="w-3.5 h-3.5 text-rose-500" />
                      <span>সার্ভার নির্বাচন:</span>
                    </span>
                    {activePlayer.servers.map((server, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setActivePlayer({ ...activePlayer, currentServerIndex: idx });
                          showToast(`${server.name} চালু হয়েছে`);
                        }}
                        className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all cursor-pointer ${
                          activePlayer.currentServerIndex === idx
                            ? 'bg-rose-600 text-white shadow-md'
                            : 'bg-[#131824] border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                        }`}
                      >
                        {server.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ===== TABBED RECOMMENDATIONS BELOW PLAYER ===== */}
                <div className="mt-8">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4 overflow-x-auto">
                    <button
                      onClick={() => setPlayerRecTab('matches')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        playerRecTab === 'matches'
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'bg-[#131824] text-slate-400 hover:text-white'
                      }`}
                    >
                      <Trophy className="w-3.5 h-3.5" />
                      <span>লাইভ ম্যাচসমূহ</span>
                    </button>
                    <button
                      onClick={() => setPlayerRecTab('channels')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        playerRecTab === 'channels'
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'bg-[#131824] text-slate-400 hover:text-white'
                      }`}
                    >
                      <Radio className="w-3.5 h-3.5" />
                      <span>টিভি চ্যানেল</span>
                    </button>
                    <button
                      onClick={() => setPlayerRecTab('movies')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        playerRecTab === 'movies'
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'bg-[#131824] text-slate-400 hover:text-white'
                      }`}
                    >
                      <Film className="w-3.5 h-3.5" />
                      <span>মুভি ও নাটক</span>
                    </button>
                  </div>

                  {playerRecTab === 'matches' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {defaultMatches.map((m) => (
                        <div
                          key={m.id}
                          onClick={() => {
                            setActivePlayer({
                              title: `${m.team1Name} বনাম ${m.team2Name}`,
                              subtitle: m.title,
                              servers: m.servers,
                              currentServerIndex: 0
                            });
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="bg-[#131824] border border-slate-800 hover:border-rose-500/60 p-3.5 rounded-xl cursor-pointer transition-all flex items-center justify-between group"
                        >
                          <div className="truncate">
                            <span className="text-[10px] text-slate-400 font-semibold">{m.title}</span>
                            <h4 className="text-xs font-bold text-white truncate mt-0.5">
                              {m.team1Name} vs {m.team2Name}
                            </h4>
                          </div>
                          <span className="p-2 rounded-lg bg-rose-600/20 text-rose-400 text-xs shrink-0 ml-2 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                            <Play className="w-3.5 h-3.5 fill-current" />
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {playerRecTab === 'channels' && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                      {currentChannels.slice(0, 6).map((c) => (
                        <div
                          key={c.id}
                          onClick={() => {
                            setActivePlayer({
                              title: c.name,
                              subtitle: `লাইভ টিভি সম্প্রচার · ${c.category}`,
                              servers: [{ name: `${c.name} HD`, url: c.streamUrl }],
                              currentServerIndex: 0
                            });
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="bg-[#131824] border border-slate-800 hover:border-rose-500/60 p-3 rounded-xl flex flex-col items-center text-center cursor-pointer transition-all group"
                        >
                          <img src={c.logoUrl} alt={c.name} className="w-10 h-10 rounded-full object-cover mb-1.5" />
                          <span className="text-xs font-bold text-white truncate w-full">{c.name}</span>
                          <span className="text-[9px] text-emerald-400 font-bold mt-1">LIVE</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {playerRecTab === 'movies' && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {currentMovies.slice(0, 4).map((mov) => (
                        <div
                          key={mov.id}
                          onClick={() => {
                            setActivePlayer({
                              title: mov.title,
                              subtitle: mov.type,
                              servers: [{ name: 'HD Video Server', url: mov.videoUrl }],
                              currentServerIndex: 0
                            });
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="bg-[#131824] border border-slate-800 hover:border-rose-500/60 rounded-xl overflow-hidden cursor-pointer transition-all group flex flex-col"
                        >
                          <img src={mov.thumbnailUrl} alt={mov.title} className="aspect-[16/10] w-full object-cover" />
                          <div className="p-2">
                            <span className="text-xs font-bold text-white truncate block">{mov.title}</span>
                            <span className="text-[10px] text-slate-400">{mov.type}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* ===== HERO BANNER ===== */}
                <div className="relative rounded-2xl overflow-hidden border border-slate-800 mb-6 bg-gradient-to-r from-slate-950 via-[#101420] to-slate-900 min-h-[220px] sm:min-h-[260px] flex items-end p-5 sm:p-8 shadow-2xl">
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-30"
                    style={{
                      backgroundImage:
                        'url("https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1400&auto=format&fit=crop&q=80")'
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-[#07090e]/75 to-transparent" />

                  <div className="relative z-10 max-w-xl">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-600/20 text-rose-400 border border-rose-500/30 text-[11px] font-bold mb-3">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                      <span>ফিচারড লাইভ ক্রিকেট</span>
                    </div>
                    <h1 className="text-xl sm:text-3xl font-extrabold text-white leading-tight mb-2">
                      বাংলাদেশ বনাম শ্রীলঙ্কা · T20 চ্যাম্পিয়নস ট্রফি
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-300 mb-4 line-clamp-2">
                      কোনো বাধা ছাড়াই সম্পূর্ণ ফুল এইচডি কোয়ালিটিতে দেখুন সরাসরি সম্প্রচার। একাধিক ফাস্ট সার্ভার সাপোর্ট সহ।
                    </p>
                    <button
                      onClick={() =>
                        setActivePlayer({
                          title: 'বাংলাদেশ বনাম শ্রীলঙ্কা · T20 লাইভ',
                          subtitle: 'ICC Champions Trophy 2026',
                          servers: defaultMatches[0].servers,
                          currentServerIndex: 0
                        })
                      }
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white font-bold text-xs sm:text-sm shadow-lg shadow-rose-600/30 transition-all hover:-translate-y-0.5 cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>সরাসরি দেখুন (Watch Live)</span>
                    </button>
                  </div>
                </div>

                {/* ===== MAIN CATEGORY FILTER TABS ===== */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
                  <button
                    onClick={() => setFilter('all')}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      filter === 'all'
                        ? 'bg-rose-600 text-white shadow-md'
                        : 'bg-[#131824] border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>সব কিছু (All)</span>
                  </button>
                  <button
                    onClick={() => setFilter('matches')}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      filter === 'matches'
                        ? 'bg-rose-600 text-white shadow-md'
                        : 'bg-[#131824] border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Trophy className="w-3.5 h-3.5" />
                    <span>লাইভ ম্যাচ ({defaultMatches.length})</span>
                  </button>
                  <button
                    onClick={() => setFilter('channels')}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      filter === 'channels'
                        ? 'bg-rose-600 text-white shadow-md'
                        : 'bg-[#131824] border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>টিভি চ্যানেল ({currentChannels.length})</span>
                  </button>
                  <button
                    onClick={() => setFilter('movies')}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      filter === 'movies'
                        ? 'bg-rose-600 text-white shadow-md'
                        : 'bg-[#131824] border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Film className="w-3.5 h-3.5" />
                    <span>মুভি, নাটক ও সিরিজ ({currentMovies.length})</span>
                  </button>
                  <button
                    onClick={() => setFilter('favorites')}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      filter === 'favorites'
                        ? 'bg-amber-600 text-white shadow-md'
                        : 'bg-[#131824] border border-slate-800 text-amber-400 hover:text-white'
                    }`}
                  >
                    <BookmarkCheck className="w-3.5 h-3.5" />
                    <span>প্রিয় তালিকা ({favorites.length})</span>
                  </button>
                </div>

                {/* ===== MATCHES SECTION ===== */}
                {(filter === 'all' || filter === 'matches' || filter === 'favorites') && filteredMatches.length > 0 && (
                  <section className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-rose-500/20 text-rose-500">
                          <Trophy className="w-4 h-4" />
                        </span>
                        <h2 className="text-base font-extrabold text-white">লাইভ ও আসন্ন ম্যাচসমূহ</h2>
                      </div>
                      <span className="text-xs text-slate-400">{filteredMatches.length}টি ম্যাচ</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredMatches.map((m) => {
                        const isLive = m.status === 'live';
                        const isFav = favorites.includes(m.id);
                        return (
                          <div
                            key={m.id}
                            className="bg-[#131824] border border-slate-800 hover:border-rose-500/60 p-4 rounded-2xl transition-all hover:-translate-y-0.5 hover:shadow-xl group relative"
                          >
                            {/* Card Top */}
                            <div className="flex items-center justify-between text-xs mb-3">
                              <span className="text-slate-400 font-semibold flex items-center gap-1 truncate max-w-[60%]">
                                <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                <span className="truncate">{m.title}</span>
                              </span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleFavorite(m.id, `${m.team1Name} vs ${m.team2Name}`);
                                  }}
                                  className="p-1 rounded text-slate-400 hover:text-amber-400 transition-colors"
                                  title="Add to favorites"
                                >
                                  {isFav ? <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" /> : <Bookmark className="w-3.5 h-3.5" />}
                                </button>
                                {isLive ? (
                                  <span className="px-2 py-0.5 rounded-md bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-extrabold uppercase animate-pulse">
                                    🔴 সরাসরি LIVE
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold">
                                    আসন্ন
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Teams Row */}
                            <div
                              onClick={() =>
                                setActivePlayer({
                                  title: `${m.team1Name} বনাম ${m.team2Name}`,
                                  subtitle: m.title,
                                  servers: m.servers,
                                  currentServerIndex: 0
                                })
                              }
                              className="flex items-center justify-between py-2 cursor-pointer"
                            >
                              <div className="flex-1 flex flex-col items-center text-center">
                                <img
                                  src={m.team1Logo}
                                  alt={m.team1Name}
                                  className="w-12 h-12 rounded-full border border-slate-700 bg-slate-900 object-cover p-1 mb-1.5 group-hover:scale-105 transition-transform"
                                />
                                <span className="text-xs font-bold text-white max-w-[110px] truncate">
                                  {m.team1Name}
                                </span>
                              </div>

                              <div className="flex flex-col items-center px-3 shrink-0">
                                <span className="text-[11px] font-extrabold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded mb-1">
                                  VS
                                </span>
                                <span className={`text-xs font-mono font-bold ${isLive ? 'text-red-400' : 'text-amber-400'}`}>
                                  {isLive ? 'LIVE' : getCountdown(m.startTime)}
                                </span>
                              </div>

                              <div className="flex-1 flex flex-col items-center text-center">
                                <img
                                  src={m.team2Logo}
                                  alt={m.team2Name}
                                  className="w-12 h-12 rounded-full border border-slate-700 bg-slate-900 object-cover p-1 mb-1.5 group-hover:scale-105 transition-transform"
                                />
                                <span className="text-xs font-bold text-white max-w-[110px] truncate">
                                  {m.team2Name}
                                </span>
                              </div>
                            </div>

                            {/* Card Bottom */}
                            <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                              <span className="flex items-center gap-1 text-[11px]">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{m.servers.length}টি এইচডি সার্ভার</span>
                              </span>
                              <button
                                onClick={() =>
                                  setActivePlayer({
                                    title: `${m.team1Name} বনাম ${m.team2Name}`,
                                    subtitle: m.title,
                                    servers: m.servers,
                                    currentServerIndex: 0
                                  })
                                }
                                className="font-bold text-rose-500 flex items-center gap-1 group-hover:text-rose-400 cursor-pointer"
                              >
                                <span>সরাসরি দেখুন</span>
                                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* ===== CHANNELS SECTION ===== */}
                {(filter === 'all' || filter === 'channels' || filter === 'favorites') && filteredChannels.length > 0 && (
                  <section className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                          <Radio className="w-4 h-4" />
                        </span>
                        <h2 className="text-base font-extrabold text-white">লাইভ টিভি চ্যানেলসমূহ (ফায়ারবেস থেকে লাইভ)</h2>
                      </div>
                      <span className="text-xs text-slate-400">{filteredChannels.length}টি চ্যানেল</span>
                    </div>

                    {/* Sub Channels Category Chips */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none text-xs">
                      {(['all', 'Sports', 'News', 'Music', 'Docu'] as const).map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setChannelFilter(cat)}
                          className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                            channelFilter === cat
                              ? 'bg-blue-600 text-white'
                              : 'bg-[#131824] border border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {cat === 'all' ? 'সব চ্যানেল' : cat === 'Sports' ? 'স্পোর্টস টিভি' : cat === 'News' ? 'সংবাদ টিভি' : cat === 'Music' ? 'মিউজিক চ্যানেল' : 'তথ্যচিত্র/ডিসকভারি'}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {filteredChannels.map((c) => {
                        const isFav = favorites.includes(c.id);
                        return (
                          <div
                            key={c.id}
                            onClick={() =>
                              setActivePlayer({
                                title: c.name,
                                subtitle: `লাইভ টিভি স্ট্রিম · ${c.category}`,
                                servers: [{ name: `${c.name} HD`, url: c.streamUrl }],
                                currentServerIndex: 0
                              })
                            }
                            className="bg-[#131824] border border-slate-800 hover:border-rose-500/60 p-3.5 rounded-2xl flex flex-col items-center text-center cursor-pointer transition-all hover:-translate-y-1 group relative"
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(c.id, c.name);
                              }}
                              className="absolute top-2 right-2 text-slate-400 hover:text-amber-400"
                            >
                              {isFav ? <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" /> : <Bookmark className="w-3.5 h-3.5" />}
                            </button>

                            <div className="w-14 h-14 rounded-full border-2 border-slate-700 bg-slate-900 p-1 mb-2 group-hover:border-rose-500 transition-colors overflow-hidden">
                              <img src={c.logoUrl} alt={c.name} className="w-full h-full rounded-full object-cover" />
                            </div>
                            <h4 className="text-xs font-bold text-white truncate w-full">{c.name}</h4>
                            <span className="text-[10px] text-slate-400 truncate w-full mt-0.5">{c.category}</span>
                            <span className="mt-2 text-[9px] font-bold text-emerald-400 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              <span>LIVE</span>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* ===== MOVIES / SERIES / DRAMA SECTION ===== */}
                {(filter === 'all' || filter === 'movies' || filter === 'favorites') && filteredMovies.length > 0 && (
                  <section className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                          <Film className="w-4 h-4" />
                        </span>
                        <h2 className="text-base font-extrabold text-white">সিনেমা, ওয়েব সিরিজ ও নাটক</h2>
                      </div>
                      <span className="text-xs text-slate-400">{filteredMovies.length}টি শো</span>
                    </div>

                    {/* Sub-Filters: Natok, Series, Bangla Cinema, Hindi, Hollywood */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none text-xs">
                      {[
                        { id: 'all', label: 'সব শো' },
                        { id: 'natok', label: 'বাংলা নাটক' },
                        { id: 'series', label: 'ওয়েব সিরিজ' },
                        { id: 'bangla_movie', label: 'বাংলা সিনেমা' },
                        { id: 'hindi', label: 'হিন্দি ডাবিং' },
                        { id: 'action', label: 'হলিউড অ্যাকশন' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSubMovieFilter(item.id as any)}
                          className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                            subMovieFilter === item.id
                              ? 'bg-rose-600 text-white shadow-sm'
                              : 'bg-[#131824] border border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4">
                      {filteredMovies.map((mov) => {
                        const isFav = favorites.includes(mov.id);
                        return (
                          <div
                            key={mov.id}
                            onClick={() =>
                              setActivePlayer({
                                title: mov.title,
                                subtitle: `${mov.type} · ${mov.duration || 'Full HD'}`,
                                servers: [{ name: 'HD Streaming Server', url: mov.videoUrl }],
                                currentServerIndex: 0
                              })
                            }
                            className="bg-[#131824] border border-slate-800 hover:border-rose-500/60 rounded-2xl overflow-hidden cursor-pointer transition-all hover:-translate-y-1 group flex flex-col relative"
                          >
                            <div className="aspect-[2/3] w-full bg-slate-900 relative overflow-hidden">
                              <img
                                src={mov.thumbnailUrl}
                                alt={mov.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <span className="absolute top-2 right-2 bg-black/70 backdrop-blur-md text-amber-400 border border-amber-400/30 text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                                HD
                              </span>
                              <span className="absolute top-2 left-2 bg-rose-600/90 text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">
                                {mov.type}
                              </span>
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <span className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-600/50">
                                  <Play className="w-4 h-4 fill-white ml-0.5" />
                                </span>
                              </div>
                            </div>
                            <div className="p-3 flex items-center justify-between">
                              <div className="truncate flex-1">
                                <h4 className="text-xs font-bold text-white truncate">{mov.title}</h4>
                                <p className="text-[10px] text-slate-400 truncate mt-0.5">{mov.duration || mov.type}</p>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(mov.id, mov.title);
                                }}
                                className="p-1 text-slate-400 hover:text-amber-400 ml-1"
                              >
                                {isFav ? <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" /> : <Bookmark className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}
              </>
            )}
          </main>

          {/* ===== FOOTER ===== */}
          <footer className="mt-12 border-t border-slate-800/80 py-8 text-center text-xs text-slate-400">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-center justify-center gap-2 mb-2 font-extrabold text-white text-base">
                <Tv className="w-5 h-5 text-rose-500" />
                <span>WebCast BD · Premium Streaming</span>
              </div>
              <p className="text-slate-400 max-w-md mx-auto mb-4">
                লাইভ স্পোর্টস, ক্রিকেট, ফুটবল, ৪K টিভি চ্যানেল এবং বাংলা নাটক ও সিনেমার সর্বাধুনিক প্ল্যাটফর্ম।
              </p>
              <div className="flex items-center justify-center gap-3 mb-4">
                <button
                  onClick={handleCopyXml}
                  className="px-3.5 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs cursor-pointer hover:bg-rose-500 shadow-md"
                >
                  পুরো XML কোড কপি করুন
                </button>
                <button
                  onClick={() => setShowSetupGuide(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-200 font-semibold text-xs border border-slate-700 cursor-pointer hover:bg-slate-700"
                >
                  ইনস্টল গাইড
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Designed &amp; Developed for Blogger by <strong className="text-amber-400">Abdulla Al Galib</strong> · Version 3.5.0
              </p>
            </div>
          </footer>

          {/* ===== MOBILE BOTTOM NAVIGATION BAR ===== */}
          <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 h-15 bg-[#07090e]/95 backdrop-blur-xl border-t border-slate-800 flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)]">
            <button
              onClick={() => {
                setActivePlayer(null);
                setFilter('all');
              }}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 text-[10px] font-semibold transition-colors ${
                filter === 'all' && !activePlayer ? 'text-rose-500 font-bold' : 'text-slate-400'
              }`}
            >
              <Tv className="w-5 h-5" />
              <span>হোম</span>
            </button>
            <button
              onClick={() => {
                setActivePlayer(null);
                setFilter('matches');
              }}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 text-[10px] font-semibold transition-colors relative ${
                filter === 'matches' ? 'text-rose-500 font-bold' : 'text-slate-400'
              }`}
            >
              <Trophy className="w-5 h-5" />
              <span>খেলা</span>
              <span className="absolute top-0.5 right-[calc(50%-14px)] bg-rose-600 text-white text-[8px] font-bold px-1 rounded-full">
                {defaultMatches.length}
              </span>
            </button>
            <button
              onClick={() => {
                setActivePlayer(null);
                setFilter('channels');
              }}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 text-[10px] font-semibold transition-colors ${
                filter === 'channels' ? 'text-rose-500 font-bold' : 'text-slate-400'
              }`}
            >
              <Radio className="w-5 h-5" />
              <span>টিভি</span>
            </button>
            <button
              onClick={() => {
                setActivePlayer(null);
                setFilter('movies');
              }}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 text-[10px] font-semibold transition-colors ${
                filter === 'movies' ? 'text-rose-500 font-bold' : 'text-slate-400'
              }`}
            >
              <Film className="w-5 h-5" />
              <span>মুভি/নাটক</span>
            </button>
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1 text-[10px] font-semibold text-slate-400 hover:text-white"
            >
              <Menu className="w-5 h-5" />
              <span>মেন্যু</span>
            </button>
          </nav>
        </div>
      )}

      {/* ===== ENRICHED SIDEBAR DRAWER ===== */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />
          <div className="relative w-76 max-w-[86vw] bg-[#0d111a] border-r border-slate-800 p-5 flex flex-col h-full z-10 overflow-y-auto">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-600 flex items-center justify-center text-white font-bold">
                  <Tv className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-white text-base">WebCast BD</span>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Navigation */}
            <nav className="flex-1 py-3 space-y-1 text-xs">
              <div className="text-[10px] font-extrabold uppercase text-slate-500 px-3 pt-2 pb-1">
                প্রধান মেন্যু
              </div>
              <button
                onClick={() => {
                  setActivePlayer(null);
                  setFilter('all');
                  setActiveTab('preview');
                  setIsDrawerOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white font-semibold transition-colors text-left"
              >
                <Tv className="w-4 h-4 text-rose-500" />
                <span>হোমপেজ (Home)</span>
              </button>
              <button
                onClick={() => {
                  setActivePlayer(null);
                  setFilter('matches');
                  setActiveTab('preview');
                  setIsDrawerOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white font-semibold transition-colors text-left"
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>লাইভ ম্যাচ ও স্কোর (Sports)</span>
              </button>
              <button
                onClick={() => {
                  setActivePlayer(null);
                  setFilter('channels');
                  setActiveTab('preview');
                  setIsDrawerOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white font-semibold transition-colors text-left"
              >
                <Radio className="w-4 h-4 text-blue-400" />
                <span>টিভি চ্যানেলসমূহ (Live TV)</span>
              </button>

              <div className="text-[10px] font-extrabold uppercase text-slate-500 px-3 pt-3 pb-1">
                মুভি, নাটক ও সিরিজ
              </div>
              <button
                onClick={() => {
                  setActivePlayer(null);
                  setFilter('movies');
                  setSubMovieFilter('natok');
                  setActiveTab('preview');
                  setIsDrawerOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white font-semibold transition-colors text-left"
              >
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>বাংলা নাটক ও টেলিফিল্ম</span>
              </button>
              <button
                onClick={() => {
                  setActivePlayer(null);
                  setFilter('movies');
                  setSubMovieFilter('series');
                  setActiveTab('preview');
                  setIsDrawerOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white font-semibold transition-colors text-left"
              >
                <Film className="w-4 h-4 text-purple-400" />
                <span>ওয়েব সিরিজ (Web Series)</span>
              </button>
              <button
                onClick={() => {
                  setActivePlayer(null);
                  setFilter('movies');
                  setSubMovieFilter('bangla_movie');
                  setActiveTab('preview');
                  setIsDrawerOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white font-semibold transition-colors text-left"
              >
                <Play className="w-4 h-4 text-rose-400" />
                <span>বাংলা সিনেমা (Bangla Cinema)</span>
              </button>
              <button
                onClick={() => {
                  setActivePlayer(null);
                  setFilter('favorites');
                  setActiveTab('preview');
                  setIsDrawerOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-amber-400 hover:bg-slate-800 font-semibold transition-colors text-left"
              >
                <BookmarkCheck className="w-4 h-4" />
                <span>আমার পছন্দের তালিকা ({favorites.length})</span>
              </button>

              <div className="text-[10px] font-extrabold uppercase text-slate-500 px-3 pt-3 pb-1">
                কমিউনিটি ও থিম
              </div>
              <a
                href="https://t.me/webcastbd"
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sky-400 hover:bg-sky-950/30 font-semibold transition-colors text-left"
              >
                <Send className="w-4 h-4" />
                <span>টেলিগ্রাম চ্যানেল (Join Telegram)</span>
              </a>
              <button
                onClick={() => {
                  setActiveTab('xmlCode');
                  setIsDrawerOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-emerald-400 hover:bg-emerald-950/30 font-bold transition-colors text-left"
              >
                <Code2 className="w-4 h-4" />
                <span>ব্লগার XML কোড দেখুন</span>
              </button>
            </nav>

            {/* Drawer Footer */}
            <div className="pt-3 border-t border-slate-800">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#131824] border border-slate-800 text-xs">
                <Users className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="font-bold text-white">{onlineCount.toLocaleString('bn-BD')} জন</div>
                  <div className="text-[10px] text-slate-400">লাইভ দর্শক যুক্ত আছেন</div>
                </div>
              </div>
              <div className="mt-2 text-[11px] text-slate-500 text-center">
                Developer: <strong className="text-amber-400">Abdulla Al Galib</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== REPORT STREAM MODAL ===== */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121724] border border-slate-800 max-w-sm w-full rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-1.5 text-red-400">
                <Flag className="w-4 h-4" />
                <span>স্ট্রিম সমস্যা রিপোর্ট</span>
              </h3>
              <button onClick={() => setShowReportModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            {reportSubmitted ? (
              <div className="text-center py-4 text-xs text-emerald-400">
                <Check className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                <p className="font-bold">রিপোর্ট জমা হয়েছে!</p>
                <p className="text-slate-400 mt-1">আমাদের টিম দ্রুত এই সার্ভারটি পরীক্ষা করবে।</p>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <p className="text-slate-300">ভিডিওতে কী ধরণের সমস্যা হচ্ছে?</p>
                <div className="space-y-1.5">
                  {['ভিডিও চালু হচ্ছে না (Black screen)', 'অতিরিক্ত বাফারিং হচ্ছে', 'শব্দ বা অডিও নেই', 'ভুল ম্যাচ সম্প্রচার'].map((reason, i) => (
                    <label key={i} className="flex items-center gap-2 text-slate-300 cursor-pointer">
                      <input type="radio" name="report" defaultChecked={i === 0} className="accent-rose-600" />
                      <span>{reason}</span>
                    </label>
                  ))}
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShowReportModal(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                  >
                    বাতিল
                  </button>
                  <button
                    onClick={() => {
                      setReportSubmitted(true);
                      setTimeout(() => {
                        setReportSubmitted(false);
                        setShowReportModal(false);
                      }, 2000);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold"
                  >
                    জমা দিন
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== BLOGGER SETUP GUIDE MODAL ===== */}
      {showSetupGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121724] border border-slate-800 max-w-lg w-full rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-rose-500" />
                <h3 className="font-bold text-white text-base">ব্লগারে থিম সেটআপ গাইড</h3>
              </div>
              <button
                onClick={() => setShowSetupGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold shrink-0 mt-0.5">
                  ১
                </span>
                <div>
                  <strong className="text-white block text-sm">কোড কপি করুন:</strong>
                  উপরে থাকা সবুজ <strong>"কোড কপি"</strong> বাটনে চাপ দিন।
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold shrink-0 mt-0.5">
                  ২
                </span>
                <div>
                  <strong className="text-white block text-sm">Blogger এ যান:</strong>
                  <a href="https://blogger.com" target="_blank" rel="noreferrer" className="text-rose-400 underline font-semibold">blogger.com</a> এ গিয়ে আপনার ব্লগের <strong>Theme (থিম)</strong> অপশনে ক্লিক করুন।
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold shrink-0 mt-0.5">
                  ৩
                </span>
                <div>
                  <strong className="text-white block text-sm">Edit HTML এ পেস্ট করুন:</strong>
                  <strong>Customize</strong> বাটনের পাশের তীরে ক্লিক করে <strong>Edit HTML</strong> সিলেক্ট করুন। আগের সব লেখা মুছে দিয়ে নতুন XML কোড পেস্ট করুন।
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 mt-0.5">
                  ৪
                </span>
                <div>
                  <strong className="text-white block text-sm">Save করুন:</strong>
                  ডানদিকের ওপরের <strong>Save (সেভ)</strong> আইকনে ক্লিক করলেই সাইটটি লাইভ হয়ে যাবে!
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#07090e] border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={handleCopyXml}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-xs cursor-pointer flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'কপি সম্পন্ন!' : 'কোড কপি করুন'}</span>
              </button>
              <button
                onClick={() => setShowSetupGuide(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-semibold text-xs cursor-pointer"
              >
                বুঝেছি
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
