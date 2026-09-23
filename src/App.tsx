import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SentenceBuilderBoard } from './components/SentenceBuilderBoard';
import { SentenceDropZone } from './components/SentenceDropZone';
import { TeacherSettingsModal } from './components/TeacherSettingsModal';
import { CustomBuilderModal } from './components/CustomBuilderModal';
import { UploadBuilderModal } from './components/UploadBuilderModal';
import { INITIAL_BUILDERS } from './data/initialBuilders';
import { SentenceBuilder, TeacherPreferences, DroppedWord, WordItem } from './types';

const STORAGE_KEY_BUILDERS = 'mfl_spanish_sentence_builders_v1';
const STORAGE_KEY_PREFS = 'mfl_teacher_preferences_v1';

const DEFAULT_PREFERENCES: TeacherPreferences = {
  showEnglish: true,
  showLiteral: true,
  showPhonetic: true,
  scaffolding: 'full',
  fontSize: 'large', // Default to Large for classroom smartboards
  audioSpeed: 0.85,
  autoPronounceOnTap: false,
  colorCoding: true,
};

export default function App() {
  // Load saved builders or initial curriculum builders
  const [builders, setBuilders] = useState<SentenceBuilder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BUILDERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load saved builders:', e);
    }
    return INITIAL_BUILDERS;
  });

  const [activeBuilderId, setActiveBuilderId] = useState<string>(
    builders[0]?.id || 'builder-1-como-te-llamas'
  );

  // Teacher display and modeling preferences
  const [preferences, setPreferences] = useState<TeacherPreferences>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PREFS);
      if (saved) return { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) };
    } catch (e) {
      console.warn('Failed to load saved preferences:', e);
    }
    return DEFAULT_PREFERENCES;
  });

  // Sentence in the drop zone
  const [sentenceWords, setSentenceWords] = useState<DroppedWord[]>([]);

  // Mode: Presentation (locked default) vs Edit Mode
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  // Modals & Fullscreen
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCustomBuilderOpen, setIsCustomBuilderOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Save preferences to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PREFS, JSON.stringify(preferences));
    } catch (e) {
      console.warn('Error saving preferences:', e);
    }
  }, [preferences]);

  // Save builders to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_BUILDERS, JSON.stringify(builders));
    } catch (e) {
      console.warn('Error saving builders:', e);
    }
  }, [builders]);

  // Track fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn('Fullscreen request blocked or not supported:', err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  const handleUpdatePreferences = (updates: Partial<TeacherPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...updates }));
  };

  const handleAddWord = (word: WordItem, columnId?: string) => {
    const newWord: DroppedWord = {
      instanceId: `drop-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      wordItem: word,
      columnId,
    };
    setSentenceWords((prev) => [...prev, newWord]);
  };

  const handleRemoveWord = (instanceId: string) => {
    setSentenceWords((prev) => prev.filter((w) => w.instanceId !== instanceId));
  };

  const handleClearSentence = () => {
    setSentenceWords([]);
  };

  const handleReorderWords = (fromIndex: number, toIndex: number) => {
    setSentenceWords((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  };

  const handleDropNewWord = (wordData: { wordItem: WordItem; columnId?: string }) => {
    handleAddWord(wordData.wordItem, wordData.columnId);
  };

  const handleApplyModelSentence = (items: WordItem[]) => {
    const mapped: DroppedWord[] = items.map((item, idx) => ({
      instanceId: `model-${Date.now()}-${idx}`,
      wordItem: item,
    }));
    setSentenceWords(mapped);
  };

  const handleSaveCustomBuilder = (newBuilder: SentenceBuilder) => {
    const existingIndex = builders.findIndex((b) => b.id === newBuilder.id);
    if (existingIndex >= 0) {
      const updated = [...builders];
      updated[existingIndex] = newBuilder;
      setBuilders(updated);
    } else {
      setBuilders([...builders, newBuilder]);
    }
    setActiveBuilderId(newBuilder.id);
    setSentenceWords([]);
  };

  const handleResetCurriculum = () => {
    if (window.confirm('Reset all Sentence Builders to default worksheet curriculum?')) {
      setBuilders(INITIAL_BUILDERS);
      setActiveBuilderId(INITIAL_BUILDERS[0].id);
      setPreferences(DEFAULT_PREFERENCES);
      setSentenceWords([]);
      localStorage.removeItem(STORAGE_KEY_BUILDERS);
      localStorage.removeItem(STORAGE_KEY_PREFS);
      setIsSettingsOpen(false);
    }
  };

  const handleUpdateActiveBuilder = (updatedBuilder: SentenceBuilder) => {
    setBuilders((prev) =>
      prev.map((b) => (b.id === updatedBuilder.id ? updatedBuilder : b))
    );
  };

  const activeBuilder =
    builders.find((b) => b.id === activeBuilderId) || builders[0] || INITIAL_BUILDERS[0];

  return (
    <div className="min-h-screen w-full bg-[#F1F5F9] text-black flex flex-col font-sans antialiased selection:bg-yellow-300 selection:text-black">
      {/* Teacher Top Navigation & View Preference Toolbar */}
      <Header
        builders={builders}
        activeBuilderId={activeBuilderId}
        onSelectBuilder={(id) => {
          setActiveBuilderId(id);
          setSentenceWords([]);
        }}
        preferences={preferences}
        onUpdatePreferences={handleUpdatePreferences}
        isEditMode={isEditMode}
        onToggleEditMode={setIsEditMode}
        onOpenNewBuilderModal={() => setIsCustomBuilderOpen(true)}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsOpen(true)}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        onResetToDefaults={handleResetCurriculum}
      />

      {/* Main Interactive Stage for Smartboard & Classroom Modeling */}
      <main className="flex-1 w-full flex flex-col px-3 py-2">
        {/* Sentence Builder Vocabulary Matrix */}
        <SentenceBuilderBoard
          builder={activeBuilder}
          preferences={preferences}
          isEditMode={isEditMode}
          onUpdateBuilder={handleUpdateActiveBuilder}
          onAddWord={handleAddWord}
        />
      </main>

      {/* Sentence Builder & Verification Zone: ______________________________ */}
      <SentenceDropZone
        sentenceWords={sentenceWords}
        onRemoveWord={handleRemoveWord}
        onClearSentence={handleClearSentence}
        onReorderWords={handleReorderWords}
        onDropNewWord={handleDropNewWord}
        builder={activeBuilder}
        preferences={preferences}
        onApplyModelSentence={handleApplyModelSentence}
      />

      {/* Teacher Display & Sound Settings Modal */}
      <TeacherSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        preferences={preferences}
        onUpdatePreferences={handleUpdatePreferences}
        onResetCurriculum={handleResetCurriculum}
      />

      {/* Custom Sentence Builder Editor Modal */}
      <CustomBuilderModal
        isOpen={isCustomBuilderOpen}
        onClose={() => setIsCustomBuilderOpen(false)}
        onSaveBuilder={handleSaveCustomBuilder}
        currentBuilder={activeBuilder}
      />

      {/* Upload/Import Sentence Builder Modal */}
      <UploadBuilderModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSaveBuilder={handleSaveCustomBuilder}
      />
    </div>
  );
}
