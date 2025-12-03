import React from 'react';
import { DayData } from '../types';
import { format } from 'date-fns';
import { Loader2, Sparkles } from 'lucide-react';

interface DayCellProps {
  day: DayData;
  isCurrentMonth: boolean;
  onGenerateArt: (date: Date) => void;
}

export const DayCell: React.FC<DayCellProps> = ({ day, isCurrentMonth, onGenerateArt }) => {
  const hasEvents = day.events.length > 0;
  
  return (
    <div 
      className={`
        relative h-48 md:h-56 border-r border-b border-slate-200 p-2 overflow-hidden group flex flex-col
        ${!isCurrentMonth ? 'bg-slate-50/50 text-slate-400' : 'bg-white text-slate-800'}
        print:h-[220px] print:border-slate-300
      `}
    >
      {/* Background Image - Absolute positioned */}
      {day.imageData && (
        <div 
            className="absolute inset-0 z-0 pointer-events-none bg-cover bg-center opacity-35"
            style={{ backgroundImage: `url(${day.imageData})` }}
        >
          {/* Light overlay to ensure text readability if image is dark */}
          <div className="absolute inset-0 bg-white/20"></div>
        </div>
      )}

      {/* Content Container - z-index higher than image */}
      <div className="relative z-10 flex flex-col h-full w-full">
        <div className="flex justify-between items-start mb-2">
          <span className={`font-bold text-lg font-fredoka ${isCurrentMonth ? 'text-slate-700' : 'text-slate-300'}`}>
            {format(day.date, 'd')}
          </span>

          {/* Generate Button (Hover only, not in print) */}
          {hasEvents && !day.imageData && !day.isGenerating && isCurrentMonth && (
             <button 
               onClick={(e) => {
                 e.stopPropagation();
                 onGenerateArt(day.date);
               }}
               className="opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-full p-1.5 no-print"
               title="Generate AI Art for this day"
             >
               <Sparkles className="w-3 h-3" />
             </button>
          )}
          
          {day.isGenerating && (
            <Loader2 className="w-3 h-3 animate-spin text-indigo-500" />
          )}
        </div>

        {/* Events List */}
        <div className="space-y-1 flex-1 w-full">
          {day.events.slice(0, 5).map(event => (
            <div 
              key={event.id} 
              className={`
                text-[11px] leading-snug rounded px-1.5 py-0.5 mb-1 w-full
                ${day.imageData ? 'bg-white/85 shadow-sm text-slate-900 font-medium' : 'bg-indigo-50 text-indigo-900'}
                print:text-[10px] print:bg-white/80 print:text-black
              `}
            >
               {/* Simplified layout to prevent PDF overlap issues */}
               <span className="inline-block opacity-70 font-semibold text-[10px] mr-1 align-top">
                   {event.allDay ? 'All Day' : format(event.startDate, 'h:mm a')}
               </span>
               <span className="align-top break-words">
                 {event.title}
               </span>
            </div>
          ))}
          {day.events.length > 5 && (
            <div className="text-[10px] font-bold text-slate-500 text-center bg-white/50 rounded py-0.5">
              + {day.events.length - 5} more
            </div>
          )}
        </div>
      </div>
    </div>
  );
};