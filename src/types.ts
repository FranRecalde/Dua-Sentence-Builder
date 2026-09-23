export type ScaffoldingMode = 'full' | 'vowels_removed' | 'initials_only' | 'no_scaffolding';

export type FontSizeMode = 'normal' | 'large' | 'xlarge';

export interface WordItem {
  id: string;
  spanish: string;
  english: string;
  literal?: string;
  phonetic?: string;
  category?: string;
}

export interface BuilderColumn {
  id: string;
  title: string;
  englishPrompt?: string;
  literalPrompt?: string;
  colorTheme: 'blue' | 'purple' | 'emerald' | 'amber' | 'rose' | 'indigo' | 'cyan' | 'slate';
  items: WordItem[];
  allowMultipleSelect?: boolean;
  isDoubled?: boolean;
}

export interface TargetChallenge {
  id: string;
  englishTarget: string;
  acceptableSpanishSequences: string[][]; // Array of acceptable word/phrase sequence arrays
  hint?: string;
}

export interface SentenceBuilder {
  id: string;
  unit: string;
  title: string;
  description?: string;
  questionSpanish?: string;
  questionEnglish?: string;
  questionLiteral?: string;
  columns: BuilderColumn[];
  extras?: WordItem[];
  alphabet?: {
    letter: string;
    sound: string;
  }[];
  challenges?: TargetChallenge[];
}

export interface TeacherPreferences {
  showEnglish: boolean;
  showLiteral: boolean;
  showPhonetic: boolean;
  scaffolding: ScaffoldingMode;
  fontSize: FontSizeMode;
  audioSpeed: number; // 0.7 to 1.0
  autoPronounceOnTap: boolean;
  colorCoding: boolean;
}

export interface DroppedWord {
  instanceId: string;
  wordItem: WordItem;
  columnId?: string;
}
