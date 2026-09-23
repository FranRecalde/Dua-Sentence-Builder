import React, { useState } from 'react';
import { 
  Upload, 
  FileText, 
  Plus, 
  Sparkles, 
  X, 
  Check, 
  AlertCircle, 
  Download, 
  Table,
  Layers
} from 'lucide-react';
import { SentenceBuilder, BuilderColumn, WordItem } from '../types';

interface UploadBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveBuilder: (builder: SentenceBuilder) => void;
}

// Built-in Spanish curriculum templates ready for 1-click generation
const QUICK_TEMPLATES = [
  {
    title: 'Sentence Builder: En el restaurante (Ordering Food)',
    unit: 'Unit: Food & Dining',
    questionSpanish: '¿Qué va a tomar para comer?',
    questionEnglish: 'What are you going to have to eat?',
    questionLiteral: '[What are you going to take to eat?]',
    columns: [
      {
        title: 'Polite Intro',
        colorTheme: 'blue' as const,
        items: [
          { spanish: 'De primero', english: 'For starter', literal: '[Of first]' },
          { spanish: 'De segundo', english: 'For main course', literal: '[Of second]' },
          { spanish: 'De postre', english: 'For dessert', literal: '[Of dessert]' },
          { spanish: 'Para beber', english: 'To drink', literal: '[For to drink]' },
        ],
      },
      {
        title: 'Verbs',
        colorTheme: 'purple' as const,
        items: [
          { spanish: 'quisiera', english: 'I would like', literal: '[I would want]' },
          { spanish: 'voy a tomar', english: 'I am going to have', literal: '[I go to take]' },
          { spanish: 'me gustaría', english: 'I would like', literal: '[to me it would please]' },
          { spanish: 'quiero', english: 'I want', literal: '[I want]' },
        ],
      },
      {
        title: 'Dishes / Food',
        colorTheme: 'emerald' as const,
        items: [
          { spanish: 'una paella de marisco', english: 'a seafood paella', literal: '[a paella of seafood]' },
          { spanish: 'un gazpacho andaluz', english: 'a cold tomato soup', literal: '[a gazpacho andaluz]' },
          { spanish: 'pollo con patatas', english: 'chicken with potatoes', literal: '[chicken with potatoes]' },
          { spanish: 'un helado de vainilla', english: 'a vanilla ice cream', literal: '[an ice cream of vanilla]' },
          { spanish: 'una botella de agua', english: 'a bottle of water', literal: '[a bottle of water]' },
        ],
      },
      {
        title: 'Extras & Courtesy',
        colorTheme: 'amber' as const,
        items: [
          { spanish: 'por favor', english: 'please', literal: '[for favour]' },
          { spanish: 'si es posible', english: 'if it is possible', literal: '[if is possible]' },
          { spanish: 'gracias', english: 'thank you', literal: '[graces]' },
          { spanish: 'la cuenta, por favor', english: 'the bill, please', literal: '[the bill, please]' },
        ],
      },
    ],
  },
  {
    title: 'Sentence Builder: Mis pasatiempos (Free Time & Hobbies)',
    unit: 'Unit: Free Time & Hobbies',
    questionSpanish: '¿Qué haces en tu tiempo libre?',
    questionEnglish: 'What do you do in your free time?',
    questionLiteral: '[What do you do in your time free?]',
    columns: [
      {
        title: 'Time markers',
        colorTheme: 'blue' as const,
        items: [
          { spanish: 'En mi tiempo libre', english: 'In my free time', literal: '[In my time free]' },
          { spanish: 'Los fines de semana', english: 'At weekends', literal: '[The ends of week]' },
          { spanish: 'A veces', english: 'Sometimes', literal: '[At times]' },
          { spanish: 'Siempre', english: 'Always', literal: '[Always]' },
          { spanish: 'Normalmente', english: 'Normally', literal: '[Normally]' },
        ],
      },
      {
        title: 'Activity Verbs',
        colorTheme: 'purple' as const,
        items: [
          { spanish: 'juego al fútbol', english: 'I play football', literal: '[I play to the football]' },
          { spanish: 'hago natación', english: 'I do swimming', literal: '[I do swimming]' },
          { spanish: 'escucho música pop', english: 'I listen to pop music', literal: '[I listen music pop]' },
          { spanish: 'monto en bicicleta', english: 'I ride a bike', literal: '[I mount in bicycle]' },
          { spanish: 'veo series en Netflix', english: 'I watch series on Netflix', literal: '[I see series in Netflix]' },
        ],
      },
      {
        title: 'Connectives & Companions',
        colorTheme: 'emerald' as const,
        items: [
          { spanish: 'con mis amigos', english: 'with my friends', literal: '[with my friends]' },
          { spanish: 'con mi familia', english: 'with my family', literal: '[with my family]' },
          { spanish: 'en el parque', english: 'in the park', literal: '[in the park]' },
          { spanish: 'en mi dormitorio', english: 'in my bedroom', literal: '[in my bedroom]' },
        ],
      },
      {
        title: 'Opinions / Reasons',
        colorTheme: 'amber' as const,
        items: [
          { spanish: 'porque es divertido', english: 'because it is fun', literal: '[because is amusing]' },
          { spanish: 'porque es relajante', english: 'because it is relaxing', literal: '[because is relaxing]' },
          { spanish: 'porque me mola', english: 'because I love it', literal: '[because to me it is cool]' },
          { spanish: 'ya que es genial', english: 'since it is great', literal: '[already that is great]' },
        ],
      },
    ],
  },
  {
    title: 'Sentence Builder: Mi rutina diaria (Daily Routine)',
    unit: 'Unit: Daily Routine',
    questionSpanish: '¿A qué hora te despiertas?',
    questionEnglish: 'What time do you wake up?',
    questionLiteral: '[At what hour yourself do you wake?]',
    columns: [
      {
        title: 'Time',
        colorTheme: 'blue' as const,
        items: [
          { spanish: 'Por la mañana', english: 'In the morning', literal: '[For the morning]' },
          { spanish: 'A las siete y media', english: 'At half past seven', literal: '[At the seven and half]' },
          { spanish: 'A las ocho', english: 'At eight o’clock', literal: '[At the eight]' },
          { spanish: 'Por la tarde', english: 'In the afternoon', literal: '[For the afternoon]' },
        ],
      },
      {
        title: 'Reflexive Verbs',
        colorTheme: 'purple' as const,
        items: [
          { spanish: 'me despierto', english: 'I wake up', literal: '[myself I wake]' },
          { spanish: 'me levanto', english: 'I get up', literal: '[myself I lift]' },
          { spanish: 'me ducho', english: 'I take a shower', literal: '[myself I shower]' },
          { spanish: 'me visto', english: 'I get dressed', literal: '[myself I dress]' },
          { spanish: 'desayuno cereales', english: 'I have cereal for breakfast', literal: '[I breakfast cereals]' },
        ],
      },
      {
        title: 'Sequencers',
        colorTheme: 'emerald' as const,
        items: [
          { spanish: 'primero', english: 'first', literal: '[first]' },
          { spanish: 'luego', english: 'then', literal: '[then]' },
          { spanish: 'después', english: 'afterwards', literal: '[after]' },
          { spanish: 'finalmente', english: 'finally', literal: '[finally]' },
        ],
      },
      {
        title: 'School / Action',
        colorTheme: 'amber' as const,
        items: [
          { spanish: 'salgo de casa', english: 'I leave the house', literal: '[I exit of house]' },
          { spanish: 'voy al colegio a pie', english: 'I walk to school', literal: '[I go to the school on foot]' },
          { spanish: 'tomo el autobús', english: 'I take the bus', literal: '[I take the bus]' },
          { spanish: 'llego a tiempo', english: 'I arrive on time', literal: '[I arrive to time]' },
        ],
      },
    ],
  },
];

export const UploadBuilderModal: React.FC<UploadBuilderModalProps> = ({
  isOpen,
  onClose,
  onSaveBuilder,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'generate'>('upload');

  // Metadata
  const [unitTitle, setUnitTitle] = useState('Unit: Custom Sentence Builder');
  const [builderTitle, setBuilderTitle] = useState('Sentence Builder: Nuevo');
  const [questionSpanish, setQuestionSpanish] = useState('');
  const [questionEnglish, setQuestionEnglish] = useState('');
  const [questionLiteral, setQuestionLiteral] = useState('');

  // Paste / File content
  const [pastedText, setPastedText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsedColumns, setParsedColumns] = useState<BuilderColumn[]>([]);

  if (!isOpen) return null;

  // Helper to parse CSV or TSV or lines into columns
  const parseTableText = (text: string) => {
    setParseError(null);
    if (!text.trim()) {
      setParsedColumns([]);
      return;
    }

    try {
      const lines = text
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      if (lines.length === 0) {
        setParsedColumns([]);
        return;
      }

      // Check delimiter: tab vs comma vs semicolon vs pipe
      const firstLine = lines[0];
      let delimiter = ',';
      if (firstLine.includes('\t')) delimiter = '\t';
      else if (firstLine.includes('|')) delimiter = '|';
      else if (firstLine.includes(';')) delimiter = ';';

      // Parse grid
      const grid = lines.map((line) => {
        if (delimiter === '|') {
          return line
            .split('|')
            .map((s) => s.trim())
            .filter((s) => s.length > 0);
        }
        return line.split(delimiter).map((s) => s.trim().replace(/^["']|["']$/g, ''));
      });

      // Determine number of columns
      const maxCols = Math.max(...grid.map((r) => r.length));
      if (maxCols === 0) {
        setParseError('No columns could be detected in the pasted text.');
        return;
      }

      // Header row
      const headers = grid[0];
      const dataRows = grid.slice(1);

      const colorThemes: BuilderColumn['colorTheme'][] = [
        'blue',
        'purple',
        'emerald',
        'amber',
        'rose',
        'indigo',
        'cyan',
        'slate',
      ];

      const columns: BuilderColumn[] = [];

      for (let c = 0; c < maxCols; c++) {
        const colTitle = headers[c] || `Column ${c + 1}`;
        const items: WordItem[] = [];

        dataRows.forEach((row, rowIdx) => {
          const rawCell = row[c];
          if (!rawCell || rawCell.trim() === '') return;

          // Parse cell text: e.g. "Me llamo / My name is [myself I call]" or "Hola (Hello)"
          let spanish = rawCell;
          let english = '';
          let literal = '';

          // Match literal in brackets: [literal]
          const literalMatch = rawCell.match(/\[(.*?)\]/);
          if (literalMatch) {
            literal = literalMatch[1];
            spanish = spanish.replace(literalMatch[0], '').trim();
          }

          // Match English in parentheses: (English)
          const englishMatch = spanish.match(/\((.*?)\)/);
          if (englishMatch) {
            english = englishMatch[1];
            spanish = spanish.replace(englishMatch[0], '').trim();
          }

          // If separated by slash e.g. "Hola / Hello"
          if (spanish.includes(' / ') || spanish.includes(' - ')) {
            const parts = spanish.split(/ \/ | - /);
            spanish = parts[0].trim();
            if (!english && parts[1]) {
              english = parts[1].trim();
            }
          }

          items.push({
            id: `up-${Date.now()}-${c}-${rowIdx}`,
            spanish: spanish || rawCell,
            english: english || spanish,
            literal: literal || undefined,
          });
        });

        columns.push({
          id: `col-${c + 1}-${Date.now()}`,
          title: colTitle,
          colorTheme: colorThemes[c % colorThemes.length],
          items: items.length > 0 ? items : [{ id: `dummy-${c}`, spanish: colTitle, english: colTitle }],
        });
      }

      setParsedColumns(columns);
    } catch (e: any) {
      setParseError(`Failed to parse file/table: ${e.message}`);
    }
  };

  // Handle file drop / file select
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    // Suggest title from file name
    const suggestedTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    setBuilderTitle(`Sentence Builder: ${suggestedTitle}`);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setPastedText(text);
        parseTableText(text);
      }
    };
    reader.readAsText(file);
  };

  // Handle template selection
  const handleSelectTemplate = (template: (typeof QUICK_TEMPLATES)[0]) => {
    setBuilderTitle(template.title);
    setUnitTitle(template.unit);
    setQuestionSpanish(template.questionSpanish);
    setQuestionEnglish(template.questionEnglish);
    setQuestionLiteral(template.questionLiteral);

    const columns: BuilderColumn[] = template.columns.map((col, idx) => ({
      id: `col-tpl-${idx + 1}-${Date.now()}`,
      title: col.title,
      colorTheme: col.colorTheme,
      items: col.items.map((it, itemIdx) => ({
        id: `w-tpl-${idx}-${itemIdx}-${Date.now()}`,
        spanish: it.spanish,
        english: it.english,
        literal: it.literal,
      })),
    }));

    setParsedColumns(columns);
  };

  const handleSaveAndModel = () => {
    if (parsedColumns.length === 0) {
      setParseError('Please upload a valid sentence builder file, paste a table, or select a template.');
      return;
    }

    const newBuilder: SentenceBuilder = {
      id: `custom-builder-${Date.now()}`,
      unit: unitTitle || 'Custom Sentence Builder',
      title: builderTitle || 'Custom Sentence Builder',
      questionSpanish: questionSpanish || undefined,
      questionEnglish: questionEnglish || undefined,
      questionLiteral: questionLiteral || undefined,
      columns: parsedColumns,
      challenges: [
        {
          id: `ch-1-${Date.now()}`,
          englishTarget:
            parsedColumns[0]?.items[0]?.english && parsedColumns[1]?.items[0]?.english
              ? `${parsedColumns[0].items[0].english} ${parsedColumns[1].items[0].english}`
              : 'Construct a sentence',
          acceptableSpanishSequences: [
            parsedColumns.map((c) => c.items[0]?.spanish).filter(Boolean),
          ],
          hint: 'Select the first options across the matrix',
        },
      ],
    };

    onSaveBuilder(newBuilder);
    onClose();
  };

  const sampleCsvContent = `Intro Phrase,Verbs,Companions,Reasons\nEn mi tiempo libre (In my free time),juego al fútbol (I play football),con mis amigos (with my friends),porque es divertido [because is fun]\nLos fines de semana (At weekends),hago natación (I do swimming),con mi familia (with my family),ya que es genial [since is great]\nA veces (Sometimes),escucho música (I listen to music),en mi dormitorio (in my room),porque me mola [because I love it]`;

  const downloadSampleCsv = () => {
    const blob = new Blob([sampleCsvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'sentence_builder_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-[8px_8px_0px_0px_#000] border-3 border-black overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b-2 border-black bg-yellow-300">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-black text-white flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_#fff]">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-black tracking-tight font-display">
                Upload & Create Sentence Builder
              </h3>
              <p className="text-xs font-bold text-slate-800">
                Upload your CSV/Excel spreadsheet, paste a table, or generate from Spanish templates
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-black bg-white hover:bg-slate-100 border-2 border-black p-1 shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b-2 border-black bg-[#F8FAFC]">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2.5 px-4 text-xs sm:text-sm font-black flex items-center justify-center gap-2 border-r-2 border-black transition-all cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-white text-black border-b-3 border-b-black shadow-xs'
                : 'text-slate-600 hover:text-black hover:bg-slate-100'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>1. Upload File (.CSV / .TXT)</span>
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`flex-1 py-2.5 px-4 text-xs sm:text-sm font-black flex items-center justify-center gap-2 border-r-2 border-black transition-all cursor-pointer ${
              activeTab === 'paste'
                ? 'bg-white text-black border-b-3 border-b-black shadow-xs'
                : 'text-slate-600 hover:text-black hover:bg-slate-100'
            }`}
          >
            <Table className="w-4 h-4" />
            <span>2. Paste Excel / Sheets Table</span>
          </button>
          <button
            onClick={() => setActiveTab('generate')}
            className={`flex-1 py-2.5 px-4 text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'generate'
                ? 'bg-white text-black border-b-3 border-b-black shadow-xs'
                : 'text-slate-600 hover:text-black hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
            <span>3. Curriculum Templates</span>
          </button>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Metadata Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#F8FAFC] p-3.5 rounded-lg border-2 border-black shadow-[3px_3px_0px_0px_#000]">
            <div>
              <label className="text-[11px] font-black uppercase tracking-wider text-black block mb-1">
                Sentence Builder Title
              </label>
              <input
                type="text"
                value={builderTitle}
                onChange={(e) => setBuilderTitle(e.target.value)}
                placeholder="e.g. Sentence Builder 4: En el restaurante"
                className="w-full bg-white border-2 border-black rounded px-3 py-1.5 text-xs sm:text-sm font-black text-black shadow-[1px_1px_0px_0px_#000] focus:outline-hidden focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="text-[11px] font-black uppercase tracking-wider text-black block mb-1">
                Curriculum Unit / Topic
              </label>
              <input
                type="text"
                value={unitTitle}
                onChange={(e) => setUnitTitle(e.target.value)}
                placeholder="e.g. Year 8 Cycle 2: Food & Holidays"
                className="w-full bg-white border-2 border-black rounded px-3 py-1.5 text-xs sm:text-sm font-bold text-black shadow-[1px_1px_0px_0px_#000] focus:outline-hidden focus:ring-2 focus:ring-black"
              />
            </div>
            <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <div>
                <label className="text-[10px] font-bold text-slate-700 block">
                  Spanish Question Prompt (Optional)
                </label>
                <input
                  type="text"
                  value={questionSpanish}
                  onChange={(e) => setQuestionSpanish(e.target.value)}
                  placeholder="e.g. ¿Qué vas a tomar?"
                  className="w-full bg-white border border-black rounded px-2 py-1 text-xs font-bold text-black"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-700 block">
                  English Meaning
                </label>
                <input
                  type="text"
                  value={questionEnglish}
                  onChange={(e) => setQuestionEnglish(e.target.value)}
                  placeholder="e.g. What are you having?"
                  className="w-full bg-white border border-black rounded px-2 py-1 text-xs font-bold text-black"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-purple-900 block">
                  [Literal Breakdown]
                </label>
                <input
                  type="text"
                  value={questionLiteral}
                  onChange={(e) => setQuestionLiteral(e.target.value)}
                  placeholder="e.g. [What you go to take?]"
                  className="w-full bg-white border border-purple-800 rounded px-2 py-1 text-xs font-bold text-purple-900"
                />
              </div>
            </div>
          </div>

          {/* TAB 1: FILE UPLOAD */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div className="border-3 border-dashed border-black rounded-xl p-6 bg-[#FAF5FF] flex flex-col items-center justify-center text-center relative hover:bg-yellow-50 transition-colors">
                <input
                  type="file"
                  accept=".csv,.txt,.tsv,.json"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  title="Upload sentence builder file"
                />
                <div className="w-14 h-14 bg-amber-300 border-2 border-black rounded-lg flex items-center justify-center text-black mb-3 shadow-[3px_3px_0px_0px_#000]">
                  <Upload className="w-7 h-7" />
                </div>
                <div className="text-base font-black text-black">
                  {fileName ? `Loaded: ${fileName}` : 'Drop your Sentence Builder file here'}
                </div>
                <div className="text-xs font-bold text-slate-600 mt-1 max-w-md">
                  Supports CSV, TSV, or spreadsheet exports. Each column in your spreadsheet becomes an interactive column in the sentence builder.
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="px-3 py-1 bg-black text-white text-xs font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                    Browse Files
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadSampleCsv();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1 bg-white text-black text-xs font-black border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:bg-slate-100 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-black" />
                    <span>Download Sample CSV</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PASTE EXCEL / SHEETS */}
          {activeTab === 'paste' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-black">
                  Paste rows/columns from Excel, Word, or Google Sheets:
                </label>
                <button
                  onClick={() => {
                    setPastedText(sampleCsvContent);
                    parseTableText(sampleCsvContent);
                  }}
                  className="text-xs text-black font-black underline hover:text-amber-700 cursor-pointer"
                >
                  Load sample text
                </button>
              </div>
              <textarea
                rows={7}
                value={pastedText}
                onChange={(e) => {
                  setPastedText(e.target.value);
                  parseTableText(e.target.value);
                }}
                placeholder={`Col 1 (Time),Col 2 (Verbs),Col 3 (Companions),Col 4 (Reasons)\nEn mi tiempo libre (In my free time),juego al fútbol (I play football),con mis amigos,porque es divertido\nLos fines de semana,hago natación,con mi familia,ya que es genial`}
                className="w-full bg-white border-2 border-black rounded-lg p-3 text-xs font-mono text-black shadow-[3px_3px_0px_0px_#000] focus:outline-hidden focus:ring-2 focus:ring-black"
              />
              <div className="text-[11px] font-bold text-slate-700">
                Tip: Put English in parentheses <code className="bg-slate-200 px-1 font-mono">(English)</code> and literal meaning in brackets <code className="bg-slate-200 px-1 font-mono">[literal]</code>.
              </div>
            </div>
          )}

          {/* TAB 3: GENERATE FROM SPANISH CURRICULUM TEMPLATES */}
          {activeTab === 'generate' && (
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-wider text-black block">
                Choose a ready-to-teach Spanish Sentence Builder template:
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {QUICK_TEMPLATES.map((tpl, i) => (
                  <div
                    key={i}
                    onClick={() => handleSelectTemplate(tpl)}
                    className="bg-white border-2 border-black rounded-xl p-3.5 shadow-[3px_3px_0px_0px_#000] hover:-translate-y-1 hover:shadow-[5px_5px_0px_0px_#000] transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-yellow-300 text-black border border-black inline-block mb-1.5">
                        {tpl.unit}
                      </span>
                      <h4 className="font-black text-sm text-black mb-1">{tpl.title}</h4>
                      <p className="text-xs font-bold text-slate-700 italic">"{tpl.questionSpanish}"</p>
                      <div className="mt-2 text-[11px] font-semibold text-slate-600">
                        {tpl.columns.length} Columns • {tpl.columns.reduce((acc, c) => acc + c.items.length, 0)} Phrases
                      </div>
                    </div>
                    <button
                      type="button"
                      className="mt-3 w-full py-1.5 bg-black text-white text-xs font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px]"
                    >
                      Use Template
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PARSE ERROR NOTICE */}
          {parseError && (
            <div className="p-3 bg-rose-100 border-2 border-black text-black font-bold text-xs flex items-center gap-2 shadow-[2px_2px_0px_0px_#000]">
              <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
              <span>{parseError}</span>
            </div>
          )}

          {/* MATRIX PREVIEW SECTION */}
          {parsedColumns.length > 0 && (
            <div className="space-y-2 pt-2 border-t-2 border-black">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
                  <Layers className="w-4 h-4" />
                  Detected Columns Preview ({parsedColumns.length} Columns,{' '}
                  {parsedColumns.reduce((acc, c) => acc + c.items.length, 0)} Words)
                </span>
                <span className="text-xs font-black text-emerald-800 bg-emerald-200 border border-black px-2 py-0.5 shadow-[1px_1px_0px_0px_#000]">
                  Ready to Load
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                {parsedColumns.map((col, idx) => (
                  <div
                    key={col.id}
                    className="bg-[#F8FAFC] border-2 border-black rounded-lg p-2 text-xs shadow-[2px_2px_0px_0px_#000]"
                  >
                    <div className="font-black text-black border-b border-black pb-1 mb-1.5 flex items-center justify-between">
                      <span className="truncate">{col.title}</span>
                      <span className="w-4 h-4 rounded-none bg-black text-white text-[10px] flex items-center justify-center font-mono">
                        {idx + 1}
                      </span>
                    </div>
                    <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                      {col.items.map((it, itemIdx) => (
                        <div
                          key={it.id || itemIdx}
                          className="bg-white border border-black p-1 rounded-xs text-[11px]"
                        >
                          <div className="font-black text-black truncate">{it.spanish}</div>
                          {it.english && (
                            <div className="text-slate-600 truncate text-[10px]">{it.english}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-5 py-3 border-t-2 border-black bg-[#F8FAFC]">
          <span className="text-xs font-bold text-slate-700">
            {parsedColumns.length > 0
              ? `${parsedColumns.length} columns ready to model.`
              : 'Upload a file or choose a template to create.'}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border-2 border-black bg-white text-black text-xs font-black shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAndModel}
              disabled={parsedColumns.length === 0}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-lg border-2 border-black font-black text-xs sm:text-sm shadow-[3px_3px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer ${
                parsedColumns.length > 0
                  ? 'bg-yellow-400 hover:bg-yellow-300 text-black'
                  : 'bg-slate-200 text-slate-400 border-slate-400 shadow-none cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Save & Open Sentence Builder</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
