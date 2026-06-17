import { useState, useEffect, useRef } from 'react';

// --- Types ---
type LangToggle = 'en' | 'id';
type ThemeToggle = 'dark' | 'light';

type LangText = { id: string; en: string };

type ScheduleBlock = {
  startH: number;
  startM: number;
  endH: number;
  endM: number;
  name: LangText;
  startMins: number;
  endMins: number;
};

// --- Helpers ---
const timeToMins = (h: number, m: number) => h * 60 + m;

const formatTime = (h: number, m: number) => {
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

const dict = {
  currentMission: { en: "CURRENT MISSION", id: "MISI SAAT INI" },
  questLog: { en: "DAILY QUEST LOG", id: "AGENDA HARI INI" },
  live: { en: "LIVE", id: "LIVE" },
  unknown: { en: "Unknown", id: "Unknown" }
};

const getScheduleForDay = (dayIndex: number): ScheduleBlock[] => {
  const schedule: Omit<ScheduleBlock, 'startMins' | 'endMins'>[] = [];
  
  schedule.push({ startH: 0, startM: 0, endH: 6, endM: 29, name: { id: "Tidur 💤", en: "Sleep 💤" } });

  if (dayIndex >= 1 && dayIndex <= 5) {
    schedule.push({ startH: 6, startM: 30, endH: 6, endM: 59, name: { id: "Bangun 🌅", en: "Wake up 🌅" } });
    schedule.push({ startH: 7, startM: 0, endH: 7, endM: 59, name: { id: "Olahraga 30 mins 💪", en: "Exercise 30 mins 💪" } });
    schedule.push({ startH: 8, startM: 0, endH: 8, endM: 59, name: { id: "Mandi 🚿", en: "Shower 🚿" } });
    schedule.push({ startH: 9, startM: 0, endH: 11, endM: 59, name: { id: "Kerja 👩🏻‍💻", en: "Work 👩🏻‍💻" } });
    schedule.push({ startH: 12, startM: 0, endH: 12, endM: 59, name: { id: "Makan Siang 🍱", en: "Lunch 🍱" } });
    schedule.push({ startH: 13, startM: 0, endH: 17, endM: 59, name: { id: "Kerja 👩🏻‍💻", en: "Work 👩🏻‍💻" } });
    schedule.push({ startH: 18, startM: 0, endH: 18, endM: 59, name: { id: "Mandi + Makan malam 🚿🍛", en: "Shower + Dinner 🚿🍛" } });

    if (dayIndex === 1) { // Monday
      schedule.push({ startH: 19, startM: 0, endH: 20, endM: 59, name: { id: "Meeting 📆", en: "Meeting 📆" } });
      schedule.push({ startH: 21, startM: 0, endH: 23, endM: 59, name: { id: "Waktu Luang 🎮", en: "Free Time 🎮" } });
    } else { // Tuesday - Friday
      schedule.push({ startH: 19, startM: 0, endH: 23, endM: 59, name: { id: "Waktu Luang 🎮", en: "Free Time 🎮" } });
    }
  } else if (dayIndex === 6) { // Saturday
    schedule.push({ startH: 6, startM: 30, endH: 8, endM: 59, name: { id: "Jogging 🏃", en: "Jogging 🏃" } });
    schedule.push({ startH: 9, startM: 0, endH: 9, endM: 59, name: { id: "Sarapan 🥐", en: "Breakfast 🥐" } });
    schedule.push({ startH: 10, startM: 0, endH: 23, endM: 59, name: { id: "Waktu Luang 🎮", en: "Free Time 🎮" } });
  } else if (dayIndex === 0) { // Sunday
    schedule.push({ startH: 6, startM: 30, endH: 17, endM: 59, name: { id: "Waktu Luang 🎮", en: "Free Time 🎮" } });
    schedule.push({ startH: 18, startM: 0, endH: 19, endM: 59, name: { id: "Gereja ⛪", en: "Church ⛪" } });
    schedule.push({ startH: 20, startM: 0, endH: 20, endM: 59, name: { id: "Makan Malam 🍝", en: "Dinner 🍝" } });
    schedule.push({ startH: 21, startM: 0, endH: 23, endM: 59, name: { id: "Waktu Luang 🎮", en: "Free Time 🎮" } });
  }

  return schedule.map((s) => ({
    ...s,
    startMins: timeToMins(s.startH, s.startM),
    endMins: timeToMins(s.endH, s.endM),
  }));
};

export default function App() {
  const [now, setNow] = useState(new Date());
  const [lang, setLang] = useState<LangToggle>('en');
  const [theme, setTheme] = useState<ThemeToggle>('light');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Real-time clock update (UI refresh every second)
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const day = now.getDay();
  const mins = now.getHours() * 60 + now.getMinutes();
  const todaySchedule = getScheduleForDay(day);

  let currentBlock: ScheduleBlock | null = null;
  let activeIndex = -1;

  for (let i = 0; i < todaySchedule.length; i++) {
    const block = todaySchedule[i];
    if (mins >= block.startMins && mins <= block.endMins) {
      currentBlock = block;
      activeIndex = i;
      break;
    }
  }

  // Auto-scroll the quest log
  useEffect(() => {
    if (scrollRef.current && activeIndex !== -1) {
      setTimeout(() => {
        if (scrollRef.current) {
          const activeEl = scrollRef.current.children[activeIndex] as HTMLElement;
          if (activeEl) {
            activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }, 100);
    }
  }, [activeIndex]);

  const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
  
  const dayNameEn = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(now).toUpperCase();
  const dayNameId = new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(now).toUpperCase();
  const displayDayName = lang === 'en' ? dayNameEn : dayNameId;

  const isDark = theme === 'dark';
  
  // Theme Variables
  // Left Column
  const leftBgColor = isDark ? '#1A1A1A' : 'var(--color-pixel-yellow)';
  const leftFgColor = isDark ? 'var(--color-pixel-yellow)' : 'var(--color-pixel-blue)';
  
  // Right Column
  const rightBgColor = isDark ? '#1E355B' : 'var(--color-pixel-blue)';
  const rightActiveFgColor = 'var(--color-pixel-yellow)';
  
  return (
    <div className="flex flex-col lg:flex-row h-screen font-pixel overflow-hidden relative">
      
      {/* Absolute Navbar Spanning Both Columns */}
      <nav className="absolute top-0 left-0 w-full flex justify-between items-center px-4 sm:px-6 lg:px-8 py-4 z-50 pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto" style={{ color: leftFgColor }}>
            <div 
              className="text-lg sm:text-2xl md:text-3xl font-bold tracking-wider" 
              style={{ textShadow: isDark ? '2px 2px 0 #000' : 'none' }}
            >
              {displayDayName} {timeString}
            </div>
        </div>
        <div className="flex gap-2 sm:gap-3 pointer-events-auto">
          <button 
            onClick={() => setLang(lang === 'en' ? 'id' : 'en')}
            className="w-14 h-10 sm:w-16 sm:h-12 border-[4px] border-black bg-black shadow-[4px_4px_0_#000] active:translate-y-1 active:shadow-[0px_0px_0_#000] hover:opacity-90 font-bold tracking-widest flex items-center justify-center text-xs sm:text-base transition-transform"
            style={{ color: rightActiveFgColor }}
          >
            {lang === 'en' ? 'EN' : 'ID'}
          </button>
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-14 h-10 sm:w-16 sm:h-12 border-[4px] border-black bg-black shadow-[4px_4px_0_#000] active:translate-y-1 active:shadow-[0px_0px_0_#000] hover:opacity-90 text-xl sm:text-2xl flex items-center justify-center transition-transform"
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
      </nav>

      {/* LEFT COLUMN: Focus Zone (60%) */}
      <main 
        className="w-full lg:w-[60%] flex flex-col items-center justify-center p-6 sm:p-8 lg:p-12 text-center border-b-[6px] lg:border-b-0 lg:border-r-[6px] border-black transition-colors duration-300 relative z-10 pt-24 h-[50vh] lg:h-full shrink-0" 
        style={{ backgroundColor: leftBgColor, color: leftFgColor }}
      >
        <div className="flex flex-col items-center gap-6 sm:gap-10 md:gap-14 w-full px-2 sm:px-4">
          <div 
            className="px-4 py-2 sm:px-6 sm:py-3 border-[4px] border-black shadow-[4px_4px_0_#000] flex items-center gap-3 sm:gap-4 transition-all" 
            style={{ backgroundColor: isDark ? 'transparent' : 'white' }}
          >
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-500 border-2 border-black animate-pixel-blink" />
            <h2 className="text-xs sm:text-sm md:text-xl tracking-widest leading-none uppercase font-bold" style={{ color: leftFgColor }}>
              {dict.currentMission[lang]}
            </h2>
          </div>
          
          <h1 
            className="text-4xl sm:text-5xl md:text-7xl lg:text-[6rem] xl:text-[7.5rem] leading-[1.2] lg:leading-[1.1] uppercase px-2 transition-colors break-words w-full"
            style={{ 
               textShadow: isDark 
                ? `6px 6px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000`
                : `4px 4px 0 rgba(0,0,0,0.15)`
            }}
          >
            {currentBlock ? currentBlock.name[lang] : dict.unknown[lang]}
          </h1>
        </div>
      </main>

      {/* RIGHT COLUMN: Agenda Zone (40%) */}
      <aside 
        className="w-full lg:w-[40%] flex flex-col transition-colors duration-300 relative z-10 h-[50vh] lg:h-full shrink-0 lg:pt-20" 
        style={{ backgroundColor: rightBgColor }}
      >
        <div className="px-4 py-3 sm:py-5 border-b-[4px] border-black flex justify-center items-center sticky top-0 bg-black/20 backdrop-blur-sm z-10">
            <h3 className="text-sm sm:text-base lg:text-lg tracking-widest uppercase font-bold" style={{ color: rightActiveFgColor, textShadow: '2px 2px 0 #000' }}>
              {dict.questLog[lang]}
            </h3>
        </div>
        
        <div 
          ref={scrollRef}
          className="flex-grow overflow-y-auto scrollbar-pixel p-4 sm:p-6 lg:p-8 flex flex-col gap-2 font-vt323"
        >
          {todaySchedule.map((block, i) => {
            const isActive = activeIndex === i;
            return (
              <div 
                key={i} 
                className={`flex items-start gap-4 p-3 sm:p-4 border-[4px] transition-all
                  ${isActive ? 'bg-black/30 shadow-[4px_4px_0_#000]' : 'border-transparent'}`}
                style={{ 
                  borderColor: isActive ? rightActiveFgColor : 'transparent',
                  color: rightActiveFgColor,
                  opacity: isActive ? 1 : 0.3,
                }}
              >
                <div className="w-6 shrink-0 flex justify-center items-center pt-0.5 md:pt-1">
                  {isActive && <span className="animate-pixel-blink text-xl md:text-2xl">▶</span>}
                </div>
                <div className={`text-xl sm:text-2xl md:text-3xl flex-grow ${isActive ? 'font-bold' : ''}`}>
                  <div className="text-sm sm:text-base md:text-lg mb-1">{formatTime(block.startH, block.startM)} - {formatTime(block.endH, block.endM)}</div>
                  <div className="uppercase tracking-wider leading-tight">{block.name[lang]}</div>
                </div>
              </div>
            )
          })}
        </div>
      </aside>

    </div>
  );
}
