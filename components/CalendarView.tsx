import React, { useState, useRef } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  addMonths, 
  subMonths, 
  isSameMonth, 
  isSameDay 
} from 'date-fns';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { CalendarEvent } from '../types';
import { DayCell } from './DayCell';
import { generateDayImage, generateMonthHeader } from '../services/geminiService';
import { ChevronLeft, ChevronRight, Download, Wand2, RefreshCw, XCircle, ImagePlus, Sliders } from 'lucide-react';

interface CalendarViewProps {
  events: CalendarEvent[];
  onBack: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ events, onBack }) => {
  const getInitialMonth = () => {
    if (events.length > 0) {
      const sorted = [...events].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
      return startOfMonth(sorted[0].startDate);
    }
    return startOfMonth(new Date());
  };

  const [currentDate, setCurrentDate] = useState(getInitialMonth());
  const [generatedImages, setGeneratedImages] = useState<Record<string, string>>({});
  const [headerImage, setHeaderImage] = useState<string | null>(null);
  const [isGeneratingHeader, setIsGeneratingHeader] = useState(false);
  const [generatingStatus, setGeneratingStatus] = useState<Record<string, boolean>>({});
  const [generationProgress, setGenerationProgress] = useState<{current: number, total: number} | null>(null);
  
  // Customization State
  const [showSettings, setShowSettings] = useState(false);
  const [headerTheme, setHeaderTheme] = useState("Tollgate Elementary School Gators (Pickerington Local School District)");
  const [dailyPrompt, setDailyPrompt] = useState("");

  const abortControllerRef = useRef<AbortController | null>(null);
  
  const calendarRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Derive days for the grid
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const getEventsForDay = (date: Date) => {
    return events.filter(e => isSameDay(e.startDate, date));
  };

  const handleGenerateImage = async (date: Date) => {
    const dayKey = date.toISOString();
    const dayEvents = getEventsForDay(date);
    
    if (dayEvents.length === 0) return;

    setGeneratingStatus(prev => ({ ...prev, [dayKey]: true }));

    try {
      const summaries = dayEvents.map(e => e.title);
      // Pass the custom daily prompt injection
      const image = await generateDayImage(summaries, dailyPrompt);
      
      if (image) {
        setGeneratedImages(prev => ({ ...prev, [dayKey]: image }));
      }
    } catch (error) {
      console.error("Failed to generate", error);
    } finally {
      setGeneratingStatus(prev => ({ ...prev, [dayKey]: false }));
    }
  };

  const handleGenerateHeader = async () => {
    setIsGeneratingHeader(true);
    try {
      const monthName = format(currentDate, 'MMMM');
      // Pass the custom header theme
      const image = await generateMonthHeader(monthName, headerTheme);
      if (image) {
        setHeaderImage(image);
      }
    } catch (error) {
      console.error("Failed to generate header", error);
    } finally {
      setIsGeneratingHeader(false);
    }
  };

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setGenerationProgress(null);
  };

  const handleGenerateAll = async () => {
    const daysToGenerate = calendarDays.filter(day => {
      const dayKey = day.toISOString();
      return isSameMonth(day, currentDate) && 
             getEventsForDay(day).length > 0 && 
             !generatedImages[dayKey];
    });

    if (daysToGenerate.length === 0) {
      alert("No new days with events to generate art for in this month!");
      return;
    }

    setGenerationProgress({ current: 0, total: daysToGenerate.length });
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    // Strict sequential processing to respect Free Tier Rate Limits (approx 15 RPM)
    // We delay 4000ms + execution time between requests.
    for (let i = 0; i < daysToGenerate.length; i++) {
        if (signal.aborted) break;

        await handleGenerateImage(daysToGenerate[i]);
        
        setGenerationProgress({ current: i + 1, total: daysToGenerate.length });
        
        // Wait 4 seconds before next request to stay under 15 RPM
        if (i < daysToGenerate.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 4000));
        }
    }
    
    setGenerationProgress(null);
    abortControllerRef.current = null;
  };

  const handleExportPDF = async () => {
    if (!calendarRef.current) return;
    setIsExporting(true);

    try {
      const element = calendarRef.current;
      
      // Save original styles
      const originalWidth = element.style.width;
      const originalMaxWidth = element.style.maxWidth; 
      const originalTransform = element.style.transform;
      const originalMargin = element.style.margin;
      
      // Force consistent width for high-res export
      // 1800px provides better horizontal resolution so text doesn't wrap/cut as easily
      element.style.width = '1800px'; 
      element.style.maxWidth = 'none'; 
      element.style.margin = '0';
      
      // Wait a moment for layout to settle
      await new Promise(r => setTimeout(r, 200));

      const canvas = await html2canvas(element, {
        scale: 2, 
        useCORS: true, 
        logging: false,
        width: 1800, 
        windowWidth: 1800, 
        backgroundColor: '#ffffff'
      });

      // Restore original styles
      element.style.width = originalWidth;
      element.style.maxWidth = originalMaxWidth;
      element.style.transform = originalTransform;
      element.style.margin = originalMargin;

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Define margins (10mm)
      const margin = 10;
      const availableWidth = pdfWidth - (margin * 2);
      const availableHeight = pdfHeight - (margin * 2);
      
      const imgProps = pdf.getImageProperties(imgData);
      const ratio = imgProps.width / imgProps.height;
      
      // Calculate dimensions to fit within margins while maintaining aspect ratio
      let w = availableWidth;
      let h = w / ratio;
      
      if (h > availableHeight) {
        h = availableHeight;
        w = h * ratio;
      }
      
      // Center the image within the margins
      const x = margin + (availableWidth - w) / 2;
      const y = margin + (availableHeight - h) / 2;

      pdf.addImage(imgData, 'JPEG', x, y, w, h);
      pdf.save(`${(headerTheme || 'Calendar').substring(0, 10).replace(/[^a-z0-9]/gi, '_')}_${format(currentDate, 'MMM_yyyy')}.pdf`);
    } catch (err) {
      console.error("PDF Export failed", err);
      alert("Failed to export PDF. Try generating fewer images or refreshing.");
    } finally {
      setIsExporting(false);
    }
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden font-nunito">
      {/* Toolbar */}
      <header className="flex flex-col z-30 bg-white shadow-sm no-print flex-shrink-0 transition-all">
        <div className="flex flex-col md:flex-row items-center justify-between px-6 py-4 gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
            <button onClick={onBack} className="text-slate-500 hover:text-slate-700 text-sm font-semibold flex items-center gap-1">
              <ChevronLeft className="w-4 h-4" /> Upload
            </button>
            
            <div className="flex items-center bg-slate-100 rounded-lg p-1">
              <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 hover:bg-white rounded-md transition-all">
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              <span className="px-4 font-bold text-lg w-40 text-center font-fredoka">
                {format(currentDate, 'MMMM yyyy')}
              </span>
              <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 hover:bg-white rounded-md transition-all">
                <ChevronRight className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end flex-wrap">
            <button
               onClick={() => setShowSettings(!showSettings)}
               className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors text-sm font-medium ${showSettings ? 'bg-indigo-100 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
               title="Customize Theme & Prompts"
            >
              <Sliders className="w-4 h-4" />
              <span className="hidden md:inline">Theme</span>
            </button>

            <button 
              onClick={handleGenerateHeader}
              disabled={isGeneratingHeader}
              className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg border border-green-200 hover:bg-green-100 transition-colors text-sm font-medium"
              title="Generate Monthly Header"
            >
              {isGeneratingHeader ? <RefreshCw className="w-3 h-3 animate-spin" /> : <ImagePlus className="w-3 h-3" />}
              <span>{headerImage ? 'Regenerate Header' : 'Generate Header'}</span>
            </button>

            {generationProgress ? (
              <div className="flex items-center gap-3 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <div className="flex flex-col text-xs md:text-sm leading-tight">
                  <span className="font-medium">Generating Art...</span>
                  <span className="opacity-75">{generationProgress.current} / {generationProgress.total} (Slow for Free Tier)</span>
                </div>
                <button 
                    onClick={stopGeneration}
                    className="text-indigo-400 hover:text-red-500 ml-2"
                    title="Stop Generation"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button 
                  onClick={handleGenerateAll}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-semibold"
                >
                  <Wand2 className="w-4 h-4" />
                  <span className="hidden md:inline">Auto-Art Month</span>
                  <span className="md:hidden">Auto</span>
                </button>
            )}
            
            <button 
              onClick={handleExportPDF}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold shadow-md active:transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span className="hidden md:inline">Save PDF</span>
              <span className="md:hidden">PDF</span>
            </button>
          </div>
        </div>
        
        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-slate-50 border-t border-slate-200 p-4 animate-in slide-in-from-top-2 duration-200">
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Month Header Theme</label>
                  <input 
                    type="text" 
                    value={headerTheme}
                    onChange={(e) => setHeaderTheme(e.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm p-2"
                    placeholder="e.g. Winter Wonderland at Hogwarts..."
                  />
                  <p className="text-xs text-slate-400 mt-1">Describe the vibe or mascot for the top banner.</p>
               </div>
               <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Daily Art Injection</label>
                  <input 
                    type="text" 
                    value={dailyPrompt}
                    onChange={(e) => setDailyPrompt(e.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm p-2"
                    placeholder="e.g. Add a small green gator eating the event..."
                  />
                   <p className="text-xs text-slate-400 mt-1">A fun twist added to every daily event collage.</p>
               </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Calendar Area - Scrollable */}
      <main className="flex-1 overflow-auto p-4 md:p-8 bg-slate-100/50">
        <div className="flex justify-center min-w-fit">
          <div 
            ref={calendarRef} 
            className="bg-white shadow-xl rounded-xl overflow-hidden print:shadow-none print:w-full print:max-w-none w-full max-w-6xl mx-auto flex flex-col"
          >
            {/* Calendar Header with Art */}
            <div className="relative bg-white border-b border-slate-200">
                {headerImage && (
                    <div className="w-full h-40 md:h-52 overflow-hidden relative">
                         {/* Use background image for better print/pdf compatibility than object-fit img */}
                        <div 
                            className="w-full h-full bg-cover bg-center"
                            style={{ backgroundImage: `url(${headerImage})` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-40"></div>
                    </div>
                )}
                
                <div className={`p-6 text-center ${headerImage ? 'relative -mt-12 md:-mt-16 pt-0' : ''}`}>
                    <h1 className={`text-4xl md:text-5xl font-bold font-fredoka drop-shadow-sm ${headerImage ? 'text-slate-800 bg-white/80 inline-block px-8 py-2 rounded-full backdrop-blur-sm shadow-sm' : 'text-slate-800'}`}>
                        {format(currentDate, 'MMMM yyyy')}
                    </h1>
                </div>
            </div>

            <div className="grid grid-cols-7 border-b border-slate-200 bg-indigo-50">
              {weekDays.map(day => (
                <div key={day} className="py-3 text-center font-bold text-indigo-800 text-sm uppercase tracking-wider font-fredoka">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 bg-slate-200 gap-[1px] border-l border-t border-slate-200">
               {calendarDays.map((day) => {
                 const dayKey = day.toISOString();
                 return (
                   <DayCell 
                     key={dayKey}
                     day={{
                       date: day,
                       events: getEventsForDay(day),
                       imageData: generatedImages[dayKey],
                       isGenerating: generatingStatus[dayKey]
                     }}
                     isCurrentMonth={isSameMonth(day, currentDate)}
                     onGenerateArt={handleGenerateImage}
                   />
                 );
               })}
            </div>
          </div>
        </div>
        
        <div className="text-center mt-8 text-slate-400 text-sm no-print pb-8">
           <p>Tip: Generate the Header first, then use Auto-Art for events. Allow time for generation.</p>
        </div>
      </main>
    </div>
  );
};