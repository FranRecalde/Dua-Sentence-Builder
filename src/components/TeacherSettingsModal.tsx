import React from 'react';
import { X, Volume2, Sparkles, Type, Sliders, Check, RotateCcw } from 'lucide-react';
import { TeacherPreferences, ScaffoldingMode, FontSizeMode } from '../types';
import { speakSpanish } from '../utils/speech';

interface TeacherSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: TeacherPreferences;
  onUpdatePreferences: (updates: Partial<TeacherPreferences>) => void;
  onResetCurriculum: () => void;
}

export const TeacherSettingsModal: React.FC<TeacherSettingsModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onUpdatePreferences,
  onResetCurriculum,
}) => {
  if (!isOpen) return null;

  const testAudio = () => {
    speakSpanish('Hola clase, bienvenidos a la lección de español', {
      rate: preferences.audioSpeed,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-[8px_8px_0px_0px_#000] border-3 border-black space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b-2 border-black pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-black" />
            <h3 className="text-xl font-black text-black tracking-tight font-display">Teacher Display Preferences</h3>
          </div>
          <button
            onClick={onClose}
            className="text-black bg-white hover:bg-slate-100 border-2 border-black p-1 shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Setting items */}
        <div className="space-y-4 text-sm">
          {/* Scaffolding Option */}
          <div className="space-y-1.5">
            <label className="font-black text-black flex items-center gap-1.5 uppercase tracking-wide text-xs">
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
              Scaffolding Level (Classroom Retrieval Mode)
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { id: 'full' as ScaffoldingMode, label: 'Full Words', ex: 'Hola' },
                { id: 'vowels_removed' as ScaffoldingMode, label: 'Vowels Removed', ex: 'H*l*' },
                { id: 'initials_only' as ScaffoldingMode, label: 'Initials Only', ex: 'H***' },
                { id: 'no_scaffolding' as ScaffoldingMode, label: 'No Clues', ex: '****' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => onUpdatePreferences({ scaffolding: opt.id })}
                  className={`p-2.5 rounded-lg border-2 border-black text-left transition-all cursor-pointer ${
                    preferences.scaffolding === opt.id
                      ? 'bg-amber-300 text-black font-black shadow-[3px_3px_0px_0px_#000] -translate-y-0.5'
                      : 'bg-white hover:bg-slate-100 text-slate-800 font-bold shadow-[1px_1px_0px_0px_#000]'
                  }`}
                >
                  <div className="text-xs font-black">{opt.label}</div>
                  <div className="font-mono text-xs opacity-80 mt-0.5">{opt.ex}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Font Size for Smartboards */}
          <div className="space-y-1.5">
            <label className="font-black text-black flex items-center gap-1.5 uppercase tracking-wide text-xs">
              <Type className="w-4 h-4 text-black" />
              Font Size (Smartboard & Projector Scaling)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'normal' as FontSizeMode, label: 'Normal', note: 'Standard' },
                { id: 'large' as FontSizeMode, label: 'Large', note: 'Projector' },
                { id: 'xlarge' as FontSizeMode, label: 'Smartboard XL', note: 'Large Hall' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => onUpdatePreferences({ fontSize: f.id })}
                  className={`p-2 rounded-lg border-2 border-black text-center transition-all cursor-pointer ${
                    preferences.fontSize === f.id
                      ? 'bg-black text-white font-black shadow-[2px_2px_0px_0px_#000]'
                      : 'bg-white hover:bg-slate-100 text-slate-800 font-bold shadow-[1px_1px_0px_0px_#000]'
                  }`}
                >
                  <div className="text-xs font-black">{f.label}</div>
                  <div className="text-[10px] opacity-80">{f.note}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Translation Toggles */}
          <div className="space-y-2 pt-2 border-t-2 border-black">
            <label className="font-black text-black uppercase tracking-wide text-xs">Translations Display</label>
            <div className="flex flex-col gap-2">
              <label className="flex items-center justify-between p-2.5 rounded-lg border-2 border-black bg-white shadow-[2px_2px_0px_0px_#000] cursor-pointer">
                <div>
                  <span className="text-black font-black text-xs block">Show English Translations</span>
                  <span className="text-[11px] text-blue-600 font-semibold">Displays blue translation in parentheses: (word)</span>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.showEnglish}
                  onChange={(e) => onUpdatePreferences({ showEnglish: e.target.checked })}
                  className="w-5 h-5 accent-black cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Spanish Voice Speed */}
          <div className="space-y-1.5 pt-2 border-t-2 border-black">
            <div className="flex items-center justify-between">
              <label className="font-black text-black flex items-center gap-1.5 uppercase tracking-wide text-xs">
                <Volume2 className="w-4 h-4 text-black" />
                Spanish Speech Rate: {preferences.audioSpeed}x
              </label>
              <button
                onClick={testAudio}
                className="text-xs text-black bg-amber-300 border border-black px-2 py-0.5 font-black shadow-[1px_1px_0px_0px_#000] cursor-pointer"
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
            <div className="flex justify-between text-[11px] font-bold text-slate-700">
              <span>0.6x (Slow Modeling)</span>
              <span>0.85x (Classroom Recommended)</span>
              <span>1.1x (Native Fast)</span>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-3 border-t-2 border-black">
          <button
            onClick={onResetCurriculum}
            className="flex items-center gap-1.5 text-xs text-black bg-rose-200 hover:bg-rose-300 border-2 border-black font-black px-3 py-2 rounded-lg shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Sheet Default</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg border-2 border-black bg-yellow-400 hover:bg-yellow-300 text-black font-black text-sm shadow-[3px_3px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
