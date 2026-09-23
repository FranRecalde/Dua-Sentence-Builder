import React, { useState } from 'react';
import { X, Plus, Trash2, Check, Sparkles, AlertCircle } from 'lucide-react';
import { SentenceBuilder, BuilderColumn, WordItem } from '../types';

interface CustomBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveBuilder: (builder: SentenceBuilder) => void;
  currentBuilder?: SentenceBuilder;
}

export const CustomBuilderModal: React.FC<CustomBuilderModalProps> = ({
  isOpen,
  onClose,
  onSaveBuilder,
  currentBuilder,
}) => {
  if (!isOpen) return null;

  const [unit, setUnit] = useState(currentBuilder?.unit || 'Year 7 Spanish: Custom Unit');
  const [title, setTitle] = useState(currentBuilder?.title || 'Custom Sentence Builder');
  const [questionSpanish, setQuestionSpanish] = useState(currentBuilder?.questionSpanish || '');
  const [questionEnglish, setQuestionEnglish] = useState(currentBuilder?.questionEnglish || '');
  const [questionLiteral, setQuestionLiteral] = useState(currentBuilder?.questionLiteral || '');

  // Columns state
  const [columns, setColumns] = useState<BuilderColumn[]>(
    currentBuilder?.columns || [
      {
        id: 'col-1',
        title: 'Starters',
        englishPrompt: 'Choose starter',
        colorTheme: 'blue',
        items: [
          { id: 'w-1', spanish: 'Me gusta', english: 'I like' },
          { id: 'w-2', spanish: 'No me gusta', english: "I don't like" },
        ],
      },
      {
        id: 'col-2',
        title: 'Activities',
        englishPrompt: 'Choose activity',
        colorTheme: 'purple',
        items: [
          { id: 'w-3', spanish: 'jugar al fútbol', english: 'to play football' },
          { id: 'w-4', spanish: 'escuchar música', english: 'to listen to music' },
        ],
      },
    ]
  );

  const addColumn = () => {
    const themes: BuilderColumn['colorTheme'][] = ['blue', 'purple', 'emerald', 'amber', 'rose', 'cyan'];
    const newTheme = themes[columns.length % themes.length];
    setColumns([
      ...columns,
      {
        id: `col-${Date.now()}`,
        title: `Column ${columns.length + 1}`,
        englishPrompt: 'Category prompt',
        colorTheme: newTheme,
        items: [],
      },
    ]);
  };

  const removeColumn = (colId: string) => {
    setColumns(columns.filter((c) => c.id !== colId));
  };

  const updateColumn = (colId: string, updates: Partial<BuilderColumn>) => {
    setColumns(columns.map((c) => (c.id === colId ? { ...c, ...updates } : c)));
  };

  const addWordToColumn = (colId: string) => {
    const newWord: WordItem = {
      id: `w-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      spanish: '',
      english: '',
    };
    setColumns(
      columns.map((c) => (c.id === colId ? { ...c, items: [...c.items, newWord] } : c))
    );
  };

  const updateWord = (colId: string, wordId: string, updates: Partial<WordItem>) => {
    setColumns(
      columns.map((c) => {
        if (c.id !== colId) return c;
        return {
          ...c,
          items: c.items.map((w) => (w.id === wordId ? { ...w, ...updates } : w)),
        };
      })
    );
  };

  const removeWord = (colId: string, wordId: string) => {
    setColumns(
      columns.map((c) => {
        if (c.id !== colId) return c;
        return {
          ...c,
          items: c.items.filter((w) => w.id !== wordId),
        };
      })
    );
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert('Please enter a title for the sentence builder.');
      return;
    }

    const newBuilder: SentenceBuilder = {
      id: currentBuilder?.id || `custom-builder-${Date.now()}`,
      unit: unit.trim() || 'Spanish Curriculum',
      title: title.trim(),
      questionSpanish: questionSpanish.trim() || undefined,
      questionEnglish: questionEnglish.trim() || undefined,
      questionLiteral: questionLiteral.trim() || undefined,
      columns: columns.map((col) => ({
        ...col,
        items: col.items.filter((w) => w.spanish.trim().length > 0),
      })),
      challenges: [
        {
          id: `c-custom-1`,
          englishTarget: 'Practice modeled sentence',
          acceptableSpanishSequences: [],
          hint: 'Select words across columns from left to right',
        },
      ],
    };

    onSaveBuilder(newBuilder);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-[8px_8px_0px_0px_#000] border-3 border-black">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-black">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-black" />
            <h3 className="text-xl font-black text-black tracking-tight font-display">Sentence Builder Editor</h3>
          </div>
          <button
            onClick={onClose}
            className="text-black bg-white hover:bg-slate-100 border-2 border-black p-1 shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Metadata inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#F8FAFC] p-4 rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_#000]">
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-black block mb-1">
                Unit / Curriculum Module
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g. Year 7 Cycle 1 Unit 1: Identity"
                className="w-full bg-white border-2 border-black rounded-lg px-3 py-2 text-sm font-bold text-black focus:outline-hidden focus:ring-2 focus:ring-black shadow-[1px_1px_0px_0px_#000]"
              />
            </div>
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-black block mb-1">
                Sentence Builder Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Sentence Builder 3: Mis pasatiempos"
                className="w-full bg-white border-2 border-black rounded-lg px-3 py-2 text-sm font-bold text-black focus:outline-hidden focus:ring-2 focus:ring-black shadow-[1px_1px_0px_0px_#000]"
              />
            </div>

            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-black text-black block mb-1">
                  Prompt in Spanish (Optional)
                </label>
                <input
                  type="text"
                  value={questionSpanish}
                  onChange={(e) => setQuestionSpanish(e.target.value)}
                  placeholder="e.g. ¿Qué te gusta hacer?"
                  className="w-full bg-white border-2 border-black rounded-lg px-3 py-1.5 text-sm font-bold text-black focus:outline-hidden focus:ring-2 focus:ring-black shadow-[1px_1px_0px_0px_#000]"
                />
              </div>
              <div>
                <label className="text-xs font-black text-black block mb-1">
                  English Meaning
                </label>
                <input
                  type="text"
                  value={questionEnglish}
                  onChange={(e) => setQuestionEnglish(e.target.value)}
                  placeholder="e.g. What do you like to do?"
                  className="w-full bg-white border-2 border-black rounded-lg px-3 py-1.5 text-sm font-bold text-black focus:outline-hidden focus:ring-2 focus:ring-black shadow-[1px_1px_0px_0px_#000]"
                />
              </div>
              <div>
                <label className="text-xs font-black text-black block mb-1">
                  Literal Grammar [bracketed]
                </label>
                <input
                  type="text"
                  value={questionLiteral}
                  onChange={(e) => setQuestionLiteral(e.target.value)}
                  placeholder="e.g. [What to you pleases to do?]"
                  className="w-full bg-white border-2 border-black rounded-lg px-3 py-1.5 text-sm font-bold text-black focus:outline-hidden focus:ring-2 focus:ring-black shadow-[1px_1px_0px_0px_#000]"
                />
              </div>
            </div>
          </div>

          {/* Columns Editor */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-black text-black uppercase tracking-wide">Matrix Columns & Vocabulary Chunks</h4>
              <button
                onClick={addColumn}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-300 text-black border-2 border-black text-xs font-black shadow-[2px_2px_0px_0px_#000] hover:bg-emerald-400 active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Column</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {columns.map((col, index) => (
                <div
                  key={col.id}
                  className="bg-white border-2 border-black rounded-xl p-3.5 space-y-3 shadow-[4px_4px_0px_0px_#000]"
                >
                  <div className="flex items-center justify-between gap-2 border-b-2 border-black pb-2">
                    <span className="w-6 h-6 border border-black bg-black text-white text-xs font-black flex items-center justify-center">
                      {index + 1}
                    </span>
                    <input
                      type="text"
                      value={col.title}
                      onChange={(e) => updateColumn(col.id, { title: e.target.value })}
                      placeholder="Column title (e.g. Verbs)"
                      className="flex-1 font-black text-sm text-black border-b-2 border-dashed border-black px-1 py-0.5 focus:outline-hidden"
                    />
                    <select
                      value={col.colorTheme}
                      onChange={(e) =>
                        updateColumn(col.id, { colorTheme: e.target.value as any })
                      }
                      className="text-xs font-black bg-white border-2 border-black rounded px-1.5 py-0.5 shadow-[1px_1px_0px_0px_#000]"
                    >
                      <option value="blue">Blue</option>
                      <option value="purple">Purple</option>
                      <option value="emerald">Emerald</option>
                      <option value="amber">Amber</option>
                      <option value="rose">Rose</option>
                      <option value="cyan">Cyan</option>
                    </select>
                    {columns.length > 1 && (
                      <button
                        onClick={() => removeColumn(col.id)}
                        className="text-black hover:bg-rose-200 border border-black p-1 bg-white shadow-[1px_1px_0px_0px_#000] cursor-pointer"
                        title="Delete Column"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      </button>
                    )}
                  </div>

                  {/* Words list in this column */}
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {col.items.map((word) => (
                      <div
                        key={word.id}
                        className="flex items-center gap-2 bg-[#F8FAFC] border-2 border-black rounded-lg p-2 text-xs shadow-[2px_2px_0px_0px_#000]"
                      >
                        <div className="flex-1 space-y-1">
                          <input
                            type="text"
                            value={word.spanish}
                            onChange={(e) =>
                              updateWord(col.id, word.id, { spanish: e.target.value })
                            }
                            placeholder="Spanish word/phrase (e.g. Me llamo)"
                            className="w-full font-black text-black bg-white border border-black rounded px-2 py-1 text-xs"
                          />
                          <div className="grid grid-cols-2 gap-1.5">
                            <input
                              type="text"
                              value={word.english}
                              onChange={(e) =>
                                updateWord(col.id, word.id, { english: e.target.value })
                              }
                              placeholder="English meaning"
                              className="w-full font-bold text-slate-700 bg-white border border-black rounded px-2 py-0.5 text-[11px]"
                            />
                            <input
                              type="text"
                              value={word.literal || ''}
                              onChange={(e) =>
                                updateWord(col.id, word.id, { literal: e.target.value })
                              }
                              placeholder="[Literal note]"
                              className="w-full font-bold text-purple-900 bg-white border border-purple-800 rounded px-2 py-0.5 text-[11px]"
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => removeWord(col.id, word.id)}
                          className="text-black hover:bg-rose-200 border border-black p-1 bg-white shadow-[1px_1px_0px_0px_#000] cursor-pointer"
                          title="Remove word"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => addWordToColumn(col.id)}
                    className="w-full py-1.5 border-2 border-dashed border-black rounded-lg text-xs font-black text-black bg-yellow-100 hover:bg-yellow-200 flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-[1px_1px_0px_0px_#000]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Word to Column {index + 1}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t-2 border-black bg-[#F8FAFC] rounded-b-xl">
          <span className="text-xs font-bold text-slate-700">
            Changes will be active immediately and saved to this browser session.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border-2 border-black bg-white text-black text-sm font-black shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg border-2 border-black bg-yellow-400 hover:bg-yellow-300 text-black text-sm font-black shadow-[3px_3px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Save & Model</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
