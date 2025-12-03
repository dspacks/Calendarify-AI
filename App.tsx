import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { CalendarView } from './components/CalendarView';
import { CalendarEvent } from './types';
import { Calendar, Palette } from 'lucide-react';

const App: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [hasFile, setHasFile] = useState(false);

  const handleEventsLoaded = (loadedEvents: CalendarEvent[]) => {
    setEvents(loadedEvents);
    setHasFile(true);
  };

  const handleBack = () => {
    setHasFile(false);
    setEvents([]);
  };

  if (hasFile) {
    return <CalendarView events={events} onBack={handleBack} />;
  }

  return (
    <div className="min-h-screen bg-indigo-50 flex flex-col">
       <nav className="bg-white border-b border-indigo-100 p-4">
         <div className="max-w-6xl mx-auto flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-indigo-900 tracking-tight">Calendarify AI</h1>
         </div>
       </nav>

       <main className="flex-1 flex flex-col items-center justify-center p-4">
         <div className="text-center mb-8 max-w-2xl">
           <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
             Your Schedule, <span className="text-indigo-600">Reimagined</span>
           </h2>
           <p className="text-lg text-slate-600 leading-relaxed">
             Turn your boring ICS exports into vibrant, printable monthly calendars. 
             We use Google Gemini AI to create unique watercolor collages that represent your day's events.
           </p>
         </div>

         <FileUpload onEventsLoaded={handleEventsLoaded} />
         
         <div className="mt-16 flex items-center gap-8 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
            {/* Decorative placeholder to show what it looks like */}
            <div className="bg-white p-4 rounded-lg shadow-lg rotate-[-6deg] w-48 h-48 border border-slate-200 hidden md:block">
              <div className="h-full w-full bg-indigo-100 rounded overflow-hidden relative">
                 <div className="absolute inset-0 bg-gradient-to-br from-pink-200 to-indigo-200 opacity-50"></div>
                 <div className="absolute top-2 left-2 font-bold text-slate-700">14</div>
                 <div className="absolute bottom-2 left-2 right-2 text-xs bg-white/80 p-1 rounded text-slate-800">
                    Dinner w/ Sarah
                 </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-lg rotate-[6deg] w-48 h-48 border border-slate-200 hidden md:block z-10">
              <div className="h-full w-full bg-orange-100 rounded overflow-hidden relative">
                 <div className="absolute inset-0 bg-gradient-to-tr from-yellow-200 to-orange-200 opacity-50"></div>
                 <div className="absolute top-2 left-2 font-bold text-slate-700">15</div>
                 <div className="absolute bottom-2 left-2 right-2 text-xs bg-white/80 p-1 rounded text-slate-800">
                    Team Offsite
                 </div>
              </div>
            </div>
         </div>
       </main>
       
       <footer className="bg-white py-6 text-center text-slate-400 text-sm border-t border-indigo-50">
         <p>© {new Date().getFullYear()} Calendarify AI. Powered by Google Gemini.</p>
       </footer>
    </div>
  );
};

export default App;
