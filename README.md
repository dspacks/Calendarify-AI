<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# 📅 Calendarify AI

**Transform your ICS calendar files into beautiful, printable PDF calendars with AI-generated watercolor art.**

[![License](https://img.shields.io/badge/license-CC%20BY--NC--SA%204.0-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19.2-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Powered by Gemini](https://img.shields.io/badge/Powered%20by-Google%20Gemini-orange.svg)](https://ai.google.dev/)

[View in AI Studio](https://ai.studio/apps/drive/1hO4RMt01FqIzeluJiFEniKD7fltlEdOG) | [Report Bug](https://github.com/dspacks/Calendarify-AI/issues) | [Request Feature](https://github.com/dspacks/Calendarify-AI/issues)

</div>

---

## ✨ Overview

Calendarify AI transforms your boring ICS calendar exports into vibrant, printable monthly calendars. Using Google Gemini AI's image generation capabilities, it creates unique watercolor collages that represent your daily events, making your schedule both functional and beautiful.

Perfect for:
- 🏫 School calendars with custom themes
- 👨‍👩‍👧‍👦 Family calendars to hang on the wall
- 📆 Event planning and visualization
- 🎨 Creative calendar gifts

## 🚀 Features

### Core Functionality
- **📥 ICS File Upload**: Upload one or multiple .ics calendar files
- **🎨 AI-Generated Art**: Google Gemini creates unique watercolor collages for each day with events
- **🖼️ Custom Month Headers**: Generate themed banner images for each month
- **📄 PDF Export**: High-quality, printable A4 landscape PDFs
- **📱 Responsive Design**: Works on desktop, tablet, and mobile devices

### Customization Options
- **🎭 Theme Customization**: Set custom themes for month headers (e.g., "Winter Wonderland", "School Gators")
- **✨ Daily Art Injection**: Add creative twists to daily event collages
- **🔄 Regeneration**: Regenerate individual day images or entire months
- **📅 Multi-Month Support**: Navigate through different months easily

### User Experience
- **⚡ Batch Generation**: Auto-generate art for all events in a month
- **🎯 Hover Interactions**: Generate art for specific days on hover
- **🔄 Progress Tracking**: Real-time progress display during bulk generation
- **🛑 Cancellable Operations**: Stop long-running generation tasks
- **⏱️ Rate Limit Handling**: Built-in delays to respect API free tier limits

## 🛠️ Technology Stack

### Frontend
- **[React 19.2](https://reactjs.org/)** - UI framework
- **[TypeScript 5.8](https://www.typescriptlang.org/)** - Type safety
- **[Vite 6.2](https://vitejs.dev/)** - Build tool and dev server
- **[Tailwind CSS](https://tailwindcss.com/)** - Styling (via inline classes)

### AI & APIs
- **[@google/genai](https://www.npmjs.com/package/@google/genai)** - Google Gemini AI integration
- **Gemini 2.5 Flash Image** - AI image generation model

### Libraries
- **[date-fns](https://date-fns.org/)** - Date manipulation and formatting
- **[jsPDF](https://github.com/parallax/jsPDF)** - PDF generation
- **[html2canvas](https://html2canvas.hertzen.com/)** - HTML to canvas conversion
- **[lucide-react](https://lucide.dev/)** - Icon library

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Google Gemini API Key** ([Get one here](https://ai.google.dev/))

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/dspacks/Calendarify-AI.git
cd Calendarify-AI
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

> **Note**: Get your free API key from [Google AI Studio](https://ai.google.dev/)

### 4. Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### 5. Build for Production

```bash
npm run build
npm run preview
```

## 📖 Usage Guide

### Step 1: Upload Your Calendar

1. Export your calendar as an `.ics` file from your calendar app (Google Calendar, Outlook, Apple Calendar, etc.)
2. Drag and drop the file(s) into the upload area, or click to browse
3. You can upload multiple `.ics` files - they will be automatically merged

### Step 2: Navigate & Customize

1. **Navigate Months**: Use the left/right arrows to switch between months
2. **Customize Theme**: Click the "Theme" button to set custom prompts
   - **Month Header Theme**: Describe the vibe for your monthly banner (e.g., "Winter Wonderland at Hogwarts")
   - **Daily Art Injection**: Add a creative twist to daily event collages (e.g., "Add a small green gator")

### Step 3: Generate AI Art

**Option A - Auto-Generate All** (Recommended):
1. Click "Generate Header" to create a themed monthly banner
2. Click "Auto-Art Month" to generate art for all days with events
3. Wait for generation to complete (respects free tier rate limits)

**Option B - Generate Individual Days**:
1. Hover over any day with events
2. Click the sparkle icon to generate art for that day only

### Step 4: Export PDF

1. Once satisfied with your calendar, click "Save PDF"
2. The calendar will be exported as a high-quality A4 landscape PDF
3. Print or share your beautiful calendar!

## 📁 Project Structure

```
Calendarify-AI/
├── components/              # React components
│   ├── CalendarView.tsx    # Main calendar display with month grid
│   ├── DayCell.tsx         # Individual day cell with events
│   └── FileUpload.tsx      # File upload interface
├── services/               # Business logic
│   └── geminiService.ts    # Google Gemini AI integration
├── utils/                  # Utility functions
│   └── icsParser.ts        # ICS file parser
├── types.ts                # TypeScript type definitions
├── App.tsx                 # Root application component
├── index.tsx               # Application entry point
├── index.html              # HTML template
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
├── package.json            # Dependencies and scripts
└── README.md               # This file
```

## 🎨 How It Works

### ICS Parsing
The `icsParser.ts` utility parses standard ICS calendar files:
- Extracts event summaries, descriptions, start/end dates
- Handles both all-day and timed events
- Supports multiple date formats (YYYYMMDD, YYYYMMDDTHHMMSSZ)
- Deduplicates events when merging multiple calendars

### AI Image Generation
The `geminiService.ts` handles AI interactions:

**Daily Event Collages**:
```typescript
generateDayImage(eventSummaries, customPrompt?)
```
- Creates soft, faded watercolor paintings
- Combines multiple event titles into a cohesive collage
- Maintains light, minimal aesthetic for text readability
- Generates 1:1 aspect ratio images

**Monthly Headers**:
```typescript
generateMonthHeader(monthName, theme?)
```
- Creates wide panoramic header illustrations
- Customizable themes (school mascots, holidays, etc.)
- 16:9 aspect ratio for banner-style display

### PDF Generation
The `CalendarView` component uses:
- **html2canvas**: Converts the calendar HTML to a canvas
- **jsPDF**: Generates A4 landscape PDF with proper margins
- High resolution export (2x scale) for print quality

### Rate Limiting
To respect Gemini API free tier limits (~15 requests per minute):
- Sequential generation with 4-second delays between requests
- Progress tracking for bulk operations
- Cancellable generation tasks

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Your Google Gemini API key | Yes |

### Customization Options

Edit `vite.config.ts` to customize:
- Port (default: 3000)
- Build output directory
- Environment variable naming

Edit component styles directly (Tailwind classes used inline).

## 🐛 Known Limitations

1. **Rate Limits**: Free tier Gemini API has ~15 requests/minute limit
2. **Image Quality**: AI-generated images vary in quality and adherence to prompts
3. **Browser Compatibility**: PDF export works best in Chrome/Edge
4. **File Size**: Large calendars with many events may cause performance issues
5. **Timezone**: All dates treated as local timezone for simplicity

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow existing formatting conventions
- Add comments for complex logic
- Update documentation for new features

## 📜 License

This project is licensed under the **Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License**.

See [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini** for AI image generation capabilities
- **Lucide Icons** for beautiful iconography
- **Tailwind CSS** for rapid UI development
- **React & TypeScript** communities

## 📞 Support

- 🐛 Issues: [GitHub Issues](https://github.com/dspacks/Calendarify-AI/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/dspacks/Calendarify-AI/discussions)

## 🗺️ Roadmap

- [ ] More export formats (PNG, JPG, SVG)
- [ ] Mobile app versions
- [ ] Event filtering and categorization

---

<div align="center">

**Made with ❤️ using React, TypeScript, and Google Gemini AI**

[⬆ Back to Top](#-calendarify-ai)

</div>
