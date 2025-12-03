import React, { useRef, useState } from 'react';
import { Upload, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { parseICS } from '../utils/icsParser';
import { CalendarEvent } from '../types';

interface FileUploadProps {
  onEventsLoaded: (events: CalendarEvent[]) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onEventsLoaded }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  };

  const processFiles = async (files: FileList) => {
    setError(null);
    setIsLoading(true);

    const validFiles = Array.from(files).filter(file => file.name.toLowerCase().endsWith('.ics'));

    if (validFiles.length === 0) {
      setError("Please upload at least one valid .ics file.");
      setIsLoading(false);
      return;
    }

    try {
      const allEvents: CalendarEvent[] = [];
      const filePromises = validFiles.map(file => {
        return new Promise<CalendarEvent[]>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            try {
              const content = event.target?.result as string;
              const parsedEvents = parseICS(content);
              resolve(parsedEvents);
            } catch (err) {
              console.error(`Failed to parse ${file.name}`, err);
              // Resolve with empty array so one bad file doesn't break the whole batch
              resolve([]); 
            }
          };
          reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
          reader.readAsText(file);
        });
      });

      const results = await Promise.all(filePromises);
      results.forEach(events => allEvents.push(...events));

      if (allEvents.length === 0) {
        setError("No events found in the uploaded file(s).");
      } else {
        // Deduplicate events based on Title and StartTime
        const uniqueEvents: CalendarEvent[] = [];
        const seenSignatures = new Set<string>();

        allEvents.forEach(event => {
          const signature = `${event.title}-${event.startDate.toISOString()}`;
          if (!seenSignatures.has(signature)) {
            seenSignatures.add(signature);
            uniqueEvents.push(event);
          }
        });

        onEventsLoaded(uniqueEvents);
      }
    } catch (err) {
      setError("An error occurred while processing your files.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  return (
    <div className="w-full max-w-xl mx-auto mt-10 p-6">
      <div 
        className={`
          border-4 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer relative
          ${isDragOver ? 'border-indigo-500 bg-indigo-50' : 'border-indigo-200 hover:border-indigo-300 hover:bg-white'}
          ${isLoading ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept=".ics" 
          className="hidden" 
          multiple
        />
        
        {isLoading ? (
          <div className="flex flex-col items-center gap-4">
             <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
             <h3 className="text-2xl font-bold text-slate-700">Merging Calendars...</h3>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="bg-indigo-100 p-4 rounded-full">
              <Upload className="w-10 h-10 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-700 mb-2">Upload your Calendar(s)</h3>
              <p className="text-slate-500">Drag & drop your .ics file(s) here, or click to browse</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
         <FeatureCard icon={<FileText className="w-6 h-6"/>} title="1. Upload ICS" desc="Upload one or merge multiple .ics files easily." />
         <FeatureCard icon={<span className="text-xl">🎨</span>} title="2. AI Magic" desc="We generate custom watercolor art for your busy days." />
         <FeatureCard icon={<span className="text-xl">🖨️</span>} title="3. Print PDF" desc="Download a beautiful, printable monthly view." />
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
    <div className="text-indigo-500 mb-2">{icon}</div>
    <h4 className="font-bold text-slate-800 text-sm mb-1">{title}</h4>
    <p className="text-xs text-slate-500 leading-tight">{desc}</p>
  </div>
);
