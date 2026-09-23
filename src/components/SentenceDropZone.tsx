import React, { useState } from 'react';
import { 
  Volume2, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  Target, 
  ArrowRight,
  Shuffle,
  Lightbulb,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DroppedWord, SentenceBuilder, TeacherPreferences, TargetChallenge } from '../types';
import { speakSpanish } from '../utils/speech';

interface SentenceDropZoneProps {
  sentenceWords: DroppedWord[];
  onRemoveWord: (instanceId: string) => void;
  onClearSentence: () => void;
  onReorderWords: (fromIndex: number, toIndex: number) => void;
  onDropNewWord: (wordData: { wordItem: any; columnId?: string }) => void;
  builder: SentenceBuilder;
  preferences: TeacherPreferences;
  onApplyModelSentence: (words: any[]) => void;
}

export const SentenceDropZone: React.FC<SentenceDropZoneProps> = ({
  sentenceWords,
  onRemoveWord,
  onClearSentence,
  onReorderWords,
  onDropNewWord,
  builder,
  preferences,
  onApplyModelSentence,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSpeakingFull, setIsSpeakingFull] = useState(false);

  // Verification state
  const [verificationResult, setVerificationResult] = useState<{
    status: 'idle' | 'success' | 'warning' | 'error';
    message: string;
    details?: string;
  }>({
    status: 'idle',
    message: '',
  });

  // Active challenge state
  const [activeChallenge, setActiveChallenge] = useState<TargetChallenge | null>(
    builder.challenges && builder.challenges.length > 0 ? builder.challenges[0] : null
  );

  // Re-sync active challenge if builder changes
  React.useEffect(() => {
    if (builder.challenges && builder.challenges.length > 0) {
      setActiveChallenge(builder.challenges[0]);
    } else {
      setActiveChallenge(null);
    }
    setVerificationResult({ status: 'idle', message: '' });
  }, [builder.id]);

  const assembledSpanish = sentenceWords.map((w) => w.wordItem.spanish).join(' ');
  const assembledEnglish = sentenceWords.map((w) => w.wordItem.english).join(' ');

  // Drop handlers for the main drop area
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    // If reordering within the drop zone
    if (draggedItemIndex !== null) {
      // Reordering handled in tile drop handler
      setDraggedItemIndex(null);
      return;
    }

    // If dropping a new word from the board
    try {
      const dataStr = e.dataTransfer.getData('application/json');
      if (dataStr) {
        const data = JSON.parse(dataStr);
        if (data && data.wordItem) {
          onDropNewWord(data);
          setVerificationResult({ status: 'idle', message: '' });
        }
      }
    } catch (err) {
      console.error('Failed to parse dropped word data:', err);
    }
  };

  // Reordering handlers for individual tiles inside drop zone
  const handleTileDragStart = (e: React.DragEvent, index: number) => {
    setDraggedItemIndex(index);
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleTileDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedItemIndex !== null && draggedItemIndex !== targetIndex) {
      onReorderWords(draggedItemIndex, targetIndex);
    }
    setDraggedItemIndex(null);
    setVerificationResult({ status: 'idle', message: '' });
  };

  // Speak full sentence in Spanish
  const handleSpeakSentence = () => {
    if (!assembledSpanish) return;
    setIsSpeakingFull(true);
    speakSpanish(assembledSpanish, {
      rate: preferences.audioSpeed,
      onEnd: () => setIsSpeakingFull(false),
      onError: () => setIsSpeakingFull(false),
    });
  };

  // Copy sentence text
  const handleCopy = () => {
    if (!assembledSpanish) return;
    navigator.clipboard.writeText(assembledSpanish);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Verification logic
  const handleVerify = () => {
    if (sentenceWords.length === 0) {
      setVerificationResult({
        status: 'warning',
        message: 'The drop zone is empty. Drag or click words above to build a sentence!',
      });
      return;
    }

    // Case 1: Active Target Challenge Verification
    if (activeChallenge) {
      const currentSpanishTokens = sentenceWords.map(w => w.wordItem.spanish.toLowerCase().trim());
      
      // Check if current matches any of the acceptable sequences
      const isMatch = activeChallenge.acceptableSpanishSequences.some(seq => {
        if (seq.length !== sentenceWords.length) return false;
        return seq.every((targetWord, idx) => {
          const currentWord = currentSpanishTokens[idx];
          const cleanTarget = targetWord.toLowerCase().trim();
          return currentWord === cleanTarget || cleanTarget.includes(currentWord) || currentWord.includes(cleanTarget);
        });
      });

      if (isMatch) {
        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.7 },
        });

        setVerificationResult({
          status: 'success',
          message: '¡Excelente! Perfect sentence match for the target challenge!',
          details: `"${assembledSpanish}" accurately translates: "${activeChallenge.englishTarget}".`,
        });
        return;
      }
    }

    // Case 2: Structural / Syntactic verification
    if (sentenceWords.length >= 2) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
      setVerificationResult({
        status: 'success',
        message: '¡Muy bien! Valid and coherent sentence structure modeled.',
        details: `Your sentence has ${sentenceWords.length} connected phrases in Spanish.`,
      });
    } else {
      setVerificationResult({
        status: 'warning',
        message: 'Sentence is very short. Add more connecting words to complete the thought!',
        details: 'Try adding an introduction phrase, name, or country to form a complete utterance.',
      });
    }
  };

  // Select next challenge
  const handleNextChallenge = () => {
    if (!builder.challenges || builder.challenges.length === 0) return;
    const currentIndex = builder.challenges.findIndex(c => c.id === activeChallenge?.id);
    const nextIndex = (currentIndex + 1) % builder.challenges.length;
    setActiveChallenge(builder.challenges[nextIndex]);
    setVerificationResult({ status: 'idle', message: '' });
  };

  // Model answer generator
  const handleModelSentence = () => {
    if (activeChallenge && activeChallenge.acceptableSpanishSequences.length > 0) {
      const targetSeq = activeChallenge.acceptableSpanishSequences[0];
      // Find matching word items from builder
      const matchedItems: any[] = [];
      targetSeq.forEach(wordText => {
        // Search in columns
        for (const col of builder.columns) {
          const found = col.items.find(i => i.spanish.toLowerCase() === wordText.toLowerCase() || i.spanish.includes(wordText));
          if (found) {
            matchedItems.push(found);
            return;
          }
        }
        // Search in extras
        const extraFound = builder.extras?.find(e => e.spanish.toLowerCase() === wordText.toLowerCase());
        if (extraFound) {
          matchedItems.push(extraFound);
          return;
        }
        // Search in alphabet
        const alphaFound = builder.alphabet?.find(a => a.letter.toLowerCase() === wordText.toLowerCase());
        if (alphaFound) {
          matchedItems.push({
            id: `alpha-${alphaFound.letter}`,
            spanish: alphaFound.letter,
            english: alphaFound.sound,
          });
        }
      });

      if (matchedItems.length > 0) {
        onApplyModelSentence(matchedItems);
        setVerificationResult({
          status: 'idle',
          message: 'Modeled answer loaded into drop zone.',
        });
      }
    }
  };

  return (
    <div className="w-full bg-white border-t border-slate-300 shadow-sm px-3 py-2 z-20 shrink-0 select-none">
      {/* Verification feedback toast banner if active */}
      {verificationResult.status !== 'idle' && (
        <div
          className={`mb-2 px-3 py-1.5 rounded border flex items-center justify-between text-xs font-semibold ${
            verificationResult.status === 'success'
              ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
              : verificationResult.status === 'warning'
              ? 'bg-amber-100 border-amber-300 text-amber-900'
              : 'bg-rose-100 border-rose-300 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {verificationResult.status === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            )}
            <span>{verificationResult.message}</span>
            {verificationResult.details && (
              <span className="font-normal opacity-90 hidden sm:inline">({verificationResult.details})</span>
            )}
          </div>
          <button
            onClick={() => setVerificationResult({ status: 'idle', message: '' })}
            className="hover:bg-black/10 px-1 py-0.5 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* The Single Line Sentence Builder & Verification Zone: ______________________________ */}
      <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 sm:gap-3">
        {/* Challenge prompt pill if present */}
        {activeChallenge && (
          <div className="shrink-0 flex items-center gap-1.5 bg-amber-50 border border-amber-300 rounded px-2 py-1 text-xs">
            <Target className="w-3.5 h-3.5 text-amber-800 shrink-0" />
            <span className="font-semibold text-slate-800 truncate max-w-[140px] sm:max-w-[180px]" title={activeChallenge.englishTarget}>
              "{activeChallenge.englishTarget}"
            </span>
            <button
              onClick={handleModelSentence}
              className="px-1.5 py-0.5 bg-amber-600 text-white text-[10px] font-bold rounded hover:bg-amber-700 cursor-pointer"
              title="Show model answer"
            >
              Model
            </button>
            <button
              onClick={handleNextChallenge}
              className="p-0.5 bg-white border border-amber-300 text-slate-700 hover:bg-amber-100 rounded cursor-pointer"
              title="Next challenge"
            >
              <Shuffle className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* The Writing Line: ______________________________ */}
        <div
          id="sentence-drop-target"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex-1 min-w-[220px] min-h-[40px] border-b-2 border-slate-700 transition-all flex items-center gap-1.5 px-2 pb-1 overflow-x-auto ${
            isDragOver ? 'bg-amber-50 border-amber-500' : 'bg-slate-50/50'
          }`}
          title="Drag words or click '+' to write along this line"
        >
          {sentenceWords.length === 0 ? (
            <div className="w-full flex items-center gap-2 text-slate-400 font-mono text-xs select-none pointer-events-none">
              <span className="font-sans font-semibold text-slate-700 text-xs tracking-wide">
                Sentence Line:
              </span>
              <span className="text-slate-300 tracking-wider font-mono truncate hidden sm:inline">
                ______________________________________________________________________
              </span>
              <span className="text-[11px] font-medium text-slate-500 italic shrink-0">
                (drop words or click + to place here)
              </span>
            </div>
          ) : (
            <>
              {sentenceWords.map((wordObj, index) => (
                <div
                  key={wordObj.instanceId}
                  draggable={true}
                  onDragStart={(e) => handleTileDragStart(e, index)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleTileDrop(e, index)}
                  className="shrink-0 bg-white border border-slate-300 rounded px-2 py-0.5 flex items-center gap-1.5 shadow-xs cursor-grab active:cursor-grabbing hover:bg-slate-50 transition-colors"
                >
                  <span className="text-[10px] font-mono font-medium text-slate-400">
                    {index + 1}.
                  </span>
                  <span className="font-semibold text-xs sm:text-sm text-slate-900 tracking-tight">
                    {wordObj.wordItem.spanish}
                  </span>
                  {preferences.showEnglish && wordObj.wordItem.english && (
                    <span className="text-[11px] text-blue-600 font-normal hidden sm:inline">
                      ({wordObj.wordItem.english})
                    </span>
                  )}
                  <button
                    onClick={() =>
                      speakSpanish(wordObj.wordItem.spanish, { rate: preferences.audioSpeed })
                    }
                    className="p-0.5 text-slate-400 hover:text-black rounded cursor-pointer"
                    title="Pronounce this word"
                  >
                    <Volume2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onRemoveWord(wordObj.instanceId)}
                    className="p-0.5 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                    title="Remove word"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {/* Visible continuation line: __________________ */}
              <div className="flex-1 min-w-[50px] border-b border-slate-400 border-dashed h-1 self-center ml-1 opacity-60" />
            </>
          )}
        </div>

        {/* Verification & Audio Action Buttons */}
        <div className="shrink-0 flex items-center gap-1 sm:gap-1.5">
          <button
            id="btn-speak-sentence"
            onClick={handleSpeakSentence}
            disabled={sentenceWords.length === 0 || isSpeakingFull}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded border border-amber-300 font-semibold text-xs bg-amber-100 hover:bg-amber-200 text-amber-900 active:translate-y-[1px] disabled:opacity-40 disabled:pointer-events-none cursor-pointer ${
              isSpeakingFull ? 'animate-pulse bg-amber-200' : ''
            }`}
            title="Read whole sentence in native voice"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Read</span>
          </button>

          <button
            id="btn-verify-sentence"
            onClick={handleVerify}
            disabled={sentenceWords.length === 0}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded border border-emerald-300 font-semibold text-xs bg-emerald-100 hover:bg-emerald-200 text-emerald-900 active:translate-y-[1px] disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            title="Verify sentence"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Verify</span>
          </button>

          <button
            onClick={handleCopy}
            disabled={sentenceWords.length === 0}
            className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 active:translate-y-[1px] disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            title="Copy sentence"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            id="btn-clear-sentence"
            onClick={onClearSentence}
            disabled={sentenceWords.length === 0}
            className="p-1.5 rounded border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 active:translate-y-[1px] disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            title="Clear line"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
