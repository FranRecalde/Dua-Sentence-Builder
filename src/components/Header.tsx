import React, { useState } from 'react';
import { 
  Volume2, 
  Eye, 
  EyeOff, 
  Type, 
  Sparkles, 
  Sliders, 
  Maximize2, 
  Minimize2, 
  BookOpen,
  RotateCcw,
  Menu,
  X,
  Upload,
  ChevronRight,
  Pin,
  HelpCircle,
  Lock,
  Edit3
} from 'lucide-react';
import { SentenceBuilder, TeacherPreferences, ScaffoldingMode, FontSizeMode } from '../types';
import { speakSpanish } from '../utils/speech';

interface HeaderProps {
  builders: SentenceBuilder[];
  activeBuilderId: string;
  onSelectBuilder: (id: string) => void;
  preferences: TeacherPreferences;
  onUpdatePreferences: (updates: Partial<TeacherPreferences>) => void;
  isEditMode: boolean;
  onToggleEditMode: (isEdit: boolean) => void;
  onOpenNewBuilderModal: () => void;
  onOpenUploadModal: () => void;
  onOpenSettingsModal: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onResetToDefaults: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  builders,
  activeBuilderId,
  onSelectBuilder,
  preferences,
  onUpdatePreferences,
  isEditMode,
  onToggleEditMode,
  onOpenNewBuilderModal,
  onOpenUploadModal,
  onOpenSettingsModal,
  isFullscreen,
  onToggleFullscreen,
  onResetToDefaults,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const activeBuilder = builders.find(b => b.id === activeBuilderId) || builders[0];

  const scaffoldingOptions: { id: ScaffoldingMode; label: string; example: string }[] = [
    { id: 'full', label: 'Full Words', example: 'Hola' },
    { id: 'vowels_removed', label: 'Vowels Off', example: 'H*l*' },
    { id: 'initials_only', label: 'Initials Only', example: 'H***' },
    { id: 'no_scaffolding', label: 'No Clues', example: '****' },
  ];

  const fontOptions: { id: FontSizeMode; label: string; desc: string }[] = [
    { id: 'normal', label: 'Compact', desc: 'Fits all on one screen' },
    { id: 'large', label: 'Standard', desc: 'Classroom display' },
    { id: 'xlarge', label: 'Large', desc: 'Back of classroom' },
  ];

  const handleSpeakQuestion = () => {
    if (activeBuilder.questionSpanish) {
      speakSpanish(activeBuilder.questionSpanish, { rate: preferences.audioSpeed });
    }
  };

  return (
    <>
      {/* Sleek, Single-Row Main Top Bar */}
      <header className="bg-white border-b-3 border-black sticky top-0 z-30 shadow-[0_3px_0px_0px_#000] select-none">
        <div className="w-full px-3 sm:px-5 py-2 flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Slide-out Menu Toggle Button */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              id="btn-toggle-menu"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-black border-2 border-black font-black text-xs shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer transition-transform"
              title="Open Curriculum Menu & Preferences"
            >
              <Menu className="w-4 h-4" />
              <span className="hidden sm:inline">Menu</span>
            </button>

            {/* Quick Builder selector pill for rapid classroom switching */}
            <div className="hidden md:flex items-center gap-1 bg-[#F8FAFC] px-2 py-1 border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <BookOpen className="w-3.5 h-3.5 text-black shrink-0" />
              <select
                id="builder-select-top"
                aria-label="Select Sentence Builder"
                value={activeBuilderId}
                onChange={(e) => onSelectBuilder(e.target.value)}
                className="bg-transparent text-xs font-black text-black focus:outline-hidden cursor-pointer max-w-[200px] truncate"
              >
                {builders.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Center: BIG TITLE and prompt in one place */}
          <div className="flex-1 min-w-0 flex items-center justify-center gap-2 text-center">
            <div className="truncate flex items-center gap-2">
              <h1 className="text-base sm:text-xl md:text-2xl font-black text-black tracking-tight font-display truncate">
                {activeBuilder.title}
              </h1>
              {activeBuilder.questionSpanish && (
                <div className="hidden lg:flex items-center gap-1.5 bg-yellow-100 border border-black px-2 py-0.5 rounded-sm">
                  <button
                    onClick={handleSpeakQuestion}
                    className="p-0.5 bg-amber-400 hover:bg-amber-300 border border-black text-black cursor-pointer shadow-[1px_1px_0px_0px_#000]"
                    title="Pronounce prompt"
                  >
                    <Volume2 className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-black text-black italic">
                    "{activeBuilder.questionSpanish}"
                  </span>
                  {preferences.showEnglish && activeBuilder.questionEnglish && (
                    <span className="text-[11px] font-bold text-slate-700">
                      ({activeBuilder.questionEnglish})
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Mode Toggle: Present vs Edit */}
            <div className="flex items-center rounded border-2 border-black bg-[#F8FAFC] p-0.5 shadow-[2px_2px_0px_0px_#000]">
              <button
                id="btn-mode-present"
                onClick={() => onToggleEditMode(false)}
                className={`flex items-center gap-1 px-2 py-1 text-xs font-black cursor-pointer rounded-xs transition-colors ${
                  !isEditMode
                    ? 'bg-amber-300 text-black shadow-xs'
                    : 'text-slate-600 hover:text-black'
                }`}
                title="Presentation Mode: Clean, locked board"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Present</span>
              </button>
              <button
                id="btn-mode-edit"
                onClick={() => onToggleEditMode(true)}
                className={`flex items-center gap-1 px-2 py-1 text-xs font-black cursor-pointer rounded-xs transition-colors ${
                  isEditMode
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-black'
                }`}
                title="Edit Mode: Add/delete words, rows, and columns, drag to move words"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            </div>

            {/* Upload Sentence Builder button */}
            <button
              id="btn-upload-builder-top"
              onClick={onOpenUploadModal}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-black text-black bg-emerald-400 hover:bg-emerald-300 border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer transition-transform"
              title="Upload your own Sentence Builder or generate new one"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Upload / New</span>
            </button>

            {/* Quick Scaffolding indicator toggle */}
            <div className="hidden xl:flex items-center border-2 border-black bg-[#F8FAFC] p-0.5 shadow-[2px_2px_0px_0px_#000]">
              {scaffoldingOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => onUpdatePreferences({ scaffolding: opt.id })}
                  className={`px-2 py-0.5 text-[11px] font-black cursor-pointer transition-all ${
                    preferences.scaffolding === opt.id
                      ? 'bg-amber-300 text-black border border-black'
                      : 'text-slate-600 hover:text-black'
                  }`}
                  title={`${opt.label} (${opt.example})`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Projector Fullscreen Mode */}
            <button
              id="btn-toggle-fullscreen"
              onClick={onToggleFullscreen}
              className="flex items-center gap-1 p-1.5 sm:px-2 sm:py-1.5 text-xs font-black text-black bg-white hover:bg-slate-100 border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer transition-transform"
              title={isFullscreen ? 'Exit Fullscreen' : 'Smartboard / Projector Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isFullscreen ? 'Exit' : 'Projector'}</span>
            </button>

            {/* Teacher Preferences Modal Button */}
            <button
              id="btn-teacher-settings"
              onClick={onOpenSettingsModal}
              className="p-1.5 sm:px-2 sm:py-1.5 text-xs font-black text-black bg-white hover:bg-slate-100 border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer transition-transform"
              title="Full Teacher Settings"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Slide-out & Draggable/Collapsible Menu Drawer from the Left */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-2xs transition-opacity duration-200"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-80 sm:w-96 bg-white border-r-3 border-black shadow-[8px_0px_0px_0px_#000] flex flex-col transition-transform duration-200 ease-out ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-black bg-yellow-300">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-black text-sm border-2 border-black shadow-[1px_1px_0px_0px_#fff]">
              ES
            </div>
            <div>
              <h3 className="font-black text-black text-base tracking-tight font-display">
                Curriculum & Settings
              </h3>
              <p className="text-[11px] font-bold text-slate-800">
                Hide or show anytime from the top bar
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="p-1 bg-white hover:bg-slate-100 border-2 border-black text-black shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
            title="Hide Menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-sans">
          {/* Upload or Create New Sentence Builder Action */}
          <div className="bg-emerald-50 border-2 border-black rounded-lg p-3 space-y-2 shadow-[3px_3px_0px_0px_#000]">
            <div className="flex items-center justify-between">
              <span className="font-black text-emerald-950 uppercase tracking-wider text-[11px]">
                Sentence Builder Manager
              </span>
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            </div>
            <button
              onClick={() => {
                setIsMenuOpen(false);
                onOpenUploadModal();
              }}
              className="w-full py-2 px-3 bg-emerald-400 hover:bg-emerald-300 text-black border-2 border-black font-black text-xs flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer transition-transform"
            >
              <Upload className="w-4 h-4" />
              <span>Upload or Create Sentence Builder</span>
            </button>
            <button
              onClick={() => {
                setIsMenuOpen(false);
                onOpenNewBuilderModal();
              }}
              className="w-full py-1.5 px-3 bg-white hover:bg-slate-100 text-black border-2 border-black font-black text-[11px] flex items-center justify-center gap-1.5 shadow-[1px_1px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
            >
              <span>Open Advanced Grid Editor</span>
            </button>
          </div>

          {/* Sentence Builder Selector List */}
          <div className="space-y-1.5">
            <label className="font-black text-black uppercase tracking-wider text-[11px] block">
              Active Sentence Builders ({builders.length})
            </label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {builders.map((b) => (
                <button
                  key={b.id}
                  onClick={() => {
                    onSelectBuilder(b.id);
                    setIsMenuOpen(false);
                  }}
                  className={`w-full text-left p-2 rounded-lg border-2 border-black transition-all cursor-pointer ${
                    b.id === activeBuilderId
                      ? 'bg-yellow-300 text-black font-black shadow-[2px_2px_0px_0px_#000]'
                      : 'bg-white hover:bg-slate-50 text-slate-800 font-bold shadow-[1px_1px_0px_0px_#000]'
                  }`}
                >
                  <div className="text-[10px] font-black uppercase text-slate-600 truncate">
                    {b.unit}
                  </div>
                  <div className="text-xs truncate">{b.title}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Scaffolding Selector */}
          <div className="space-y-1.5 pt-2 border-t-2 border-black">
            <label className="font-black text-black uppercase tracking-wider text-[11px] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              <span>Scaffolding Level (Retrieval Practice)</span>
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {scaffoldingOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => onUpdatePreferences({ scaffolding: opt.id })}
                  className={`p-2 rounded-lg border-2 border-black text-left cursor-pointer transition-all ${
                    preferences.scaffolding === opt.id
                      ? 'bg-amber-300 text-black font-black shadow-[2px_2px_0px_0px_#000]'
                      : 'bg-white hover:bg-slate-100 text-slate-700 font-bold shadow-[1px_1px_0px_0px_#000]'
                  }`}
                >
                  <div className="font-black text-[11px]">{opt.label}</div>
                  <div className="font-mono text-[10px] opacity-75">{opt.example}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Translations Toggles */}
          <div className="space-y-2 pt-2 border-t-2 border-black">
            <label className="font-black text-black uppercase tracking-wider text-[11px] block">
              Translations
            </label>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => onUpdatePreferences({ showEnglish: !preferences.showEnglish })}
                className={`flex items-center justify-between p-2 rounded-lg border-2 border-black cursor-pointer shadow-[2px_2px_0px_0px_#000] ${
                  preferences.showEnglish ? 'bg-blue-200 text-black font-black' : 'bg-white text-slate-700 font-bold'
                }`}
              >
                <span>English Translations (in blue)</span>
                {preferences.showEnglish ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Font Size & Fit Mode */}
          <div className="space-y-1.5 pt-2 border-t-2 border-black">
            <label className="font-black text-black uppercase tracking-wider text-[11px] flex items-center gap-1">
              <Type className="w-3.5 h-3.5 text-black" />
              <span>Word Size / Single-Page Fit</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {fontOptions.map((f) => (
                <button
                  key={f.id}
                  onClick={() => onUpdatePreferences({ fontSize: f.id })}
                  className={`p-1.5 rounded-lg border-2 border-black text-center cursor-pointer ${
                    preferences.fontSize === f.id
                      ? 'bg-black text-white font-black shadow-[2px_2px_0px_0px_#000]'
                      : 'bg-white hover:bg-slate-100 text-slate-800 font-bold shadow-[1px_1px_0px_0px_#000]'
                  }`}
                >
                  <div className="text-[11px]">{f.label}</div>
                  <div className="text-[9px] opacity-75 truncate">{f.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Voice Speech Rate */}
          <div className="space-y-1 pt-2 border-t-2 border-black">
            <div className="flex items-center justify-between">
              <label className="font-black text-black uppercase tracking-wider text-[11px]">
                Speech Rate: {preferences.audioSpeed}x
              </label>
              <button
                onClick={() => speakSpanish('¡Hola! Hablo español.', { rate: preferences.audioSpeed })}
                className="text-[10px] font-black bg-amber-300 border border-black px-1.5 py-0.5 shadow-[1px_1px_0px_0px_#000] cursor-pointer"
              >
                Test Voice
              </button>
            </div>
            <input
              type="range"
              min="0.6"
              max="1.1"
              step="0.05"
              value={preferences.audioSpeed}
              onChange={(e) => onUpdatePreferences({ audioSpeed: parseFloat(e.target.value) })}
              className="w-full accent-black cursor-pointer"
            />
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-3 border-t-2 border-black bg-[#F8FAFC] flex items-center justify-between">
          <button
            onClick={onResetToDefaults}
            className="flex items-center gap-1 text-[11px] font-black text-rose-700 hover:text-rose-900 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Defaults</span>
          </button>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="px-3 py-1 bg-black text-white font-black text-xs border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
          >
            Close Menu
          </button>
        </div>
      </aside>
    </>
  );
};

