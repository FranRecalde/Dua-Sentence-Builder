import React, { useState } from 'react';
import { 
  Volume2, 
  Plus, 
  ArrowLeftRight, 
  Eye, 
  Trash2, 
  GripVertical, 
  GripHorizontal,
  Edit2, 
  Check, 
  PlusCircle,
  Columns2,
  Square
} from 'lucide-react';
import { SentenceBuilder, TeacherPreferences, WordItem, BuilderColumn } from '../types';
import { getScaffoldedText } from '../utils/scaffolding';
import { speakSpanish } from '../utils/speech';

interface SentenceBuilderBoardProps {
  builder: SentenceBuilder;
  preferences: TeacherPreferences;
  isEditMode: boolean;
  onUpdateBuilder: (builder: SentenceBuilder) => void;
  onAddWord: (word: WordItem, columnId?: string) => void;
}

export const SentenceBuilderBoard: React.FC<SentenceBuilderBoardProps> = ({
  builder,
  preferences,
  isEditMode,
  onUpdateBuilder,
  onAddWord,
}) => {
  const [revealedWordIds, setRevealedWordIds] = useState<Record<string, boolean>>({});
  const [speakingWordId, setSpeakingWordId] = useState<string | null>(null);

  // Edit Mode state
  const [addingWordColId, setAddingWordColId] = useState<string | null>(null);
  const [newWordSpanish, setNewWordSpanish] = useState('');
  const [newWordEnglish, setNewWordEnglish] = useState('');

  const [editingWord, setEditingWord] = useState<{ colId: string; item: WordItem } | null>(null);
  const [editSpanish, setEditSpanish] = useState('');
  const [editEnglish, setEditEnglish] = useState('');

  // Reordering Words Drag & Drop state in Edit Mode
  const [draggedWordInfo, setDraggedWordInfo] = useState<{
    sourceColId: string;
    item: WordItem;
    sourceIndex: number;
  } | null>(null);
  const [dragOverInfo, setDragOverInfo] = useState<{
    targetColId: string;
    targetIndex: number;
  } | null>(null);

  // Reordering Columns Drag & Drop state in Edit Mode
  const [draggedColumnIndex, setDraggedColumnIndex] = useState<number | null>(null);
  const [dragOverColumnIndex, setDragOverColumnIndex] = useState<number | null>(null);

  const togglePeekWord = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRevealedWordIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSpeakAndAdd = (item: WordItem, columnId?: string, isExplicitAdd = false) => {
    if (isEditMode) return; // In edit mode, clicks don't trigger spoken add to prevent accidental clicks

    setSpeakingWordId(item.id);
    speakSpanish(item.spanish, {
      rate: preferences.audioSpeed,
      onEnd: () => setSpeakingWordId(null),
      onError: () => setSpeakingWordId(null),
    });

    if (isExplicitAdd || preferences.autoPronounceOnTap) {
      onAddWord(item, columnId);
    }
  };

  // Presentation Mode word drag to sentence line
  const handlePresentationDragStart = (e: React.DragEvent, item: WordItem, columnId?: string) => {
    if (isEditMode) return;
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({
        wordItem: item,
        columnId: columnId,
      })
    );
    e.dataTransfer.effectAllowed = 'copy';
  };

  // Edit Mode Drag & Drop (reorder / move words across columns)
  const handleEditDragStart = (
    e: React.DragEvent,
    item: WordItem,
    sourceColId: string,
    sourceIndex: number
  ) => {
    e.stopPropagation();
    setDraggedWordInfo({ sourceColId, item, sourceIndex });
    e.dataTransfer.setData('text/plain', item.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleEditDragOverRow = (
    e: React.DragEvent,
    targetColId: string,
    targetIndex: number
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedWordInfo) return;
    setDragOverInfo({ targetColId, targetIndex });
  };

  const handleEditDropOnRow = (
    e: React.DragEvent,
    targetColId: string,
    targetIndex: number
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedWordInfo) return;

    const { sourceColId, sourceIndex, item } = draggedWordInfo;

    const updatedColumns = builder.columns.map((col) => ({
      ...col,
      items: [...col.items],
    }));

    const sourceCol = updatedColumns.find((c) => c.id === sourceColId);
    const targetCol = updatedColumns.find((c) => c.id === targetColId);

    if (!sourceCol || !targetCol) return;

    // Remove from source
    sourceCol.items.splice(sourceIndex, 1);

    // Insert into target
    let adjustedTargetIndex = targetIndex;
    if (sourceColId === targetColId && sourceIndex < targetIndex) {
      adjustedTargetIndex = Math.max(0, targetIndex - 1);
    }
    targetCol.items.splice(adjustedTargetIndex, 0, item);

    onUpdateBuilder({
      ...builder,
      columns: updatedColumns,
    });

    setDraggedWordInfo(null);
    setDragOverInfo(null);
  };

  const handleEditDropOnColumnBottom = (e: React.DragEvent, targetColId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedWordInfo) return;

    const { sourceColId, sourceIndex, item } = draggedWordInfo;

    const updatedColumns = builder.columns.map((col) => ({
      ...col,
      items: [...col.items],
    }));

    const sourceCol = updatedColumns.find((c) => c.id === sourceColId);
    const targetCol = updatedColumns.find((c) => c.id === targetColId);

    if (!sourceCol || !targetCol) return;

    sourceCol.items.splice(sourceIndex, 1);
    targetCol.items.push(item);

    onUpdateBuilder({
      ...builder,
      columns: updatedColumns,
    });

    setDraggedWordInfo(null);
    setDragOverInfo(null);
  };

  // Column Reordering (Drag & Drop in Edit Mode)
  const handleColumnDragStart = (e: React.DragEvent, colIndex: number) => {
    if (!isEditMode) return;
    setDraggedColumnIndex(colIndex);
    e.dataTransfer.setData('text/column-reorder', String(colIndex));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleColumnDragOver = (e: React.DragEvent, colIndex: number) => {
    if (!isEditMode || draggedColumnIndex === null) return;
    e.preventDefault();
    e.stopPropagation();
    if (dragOverColumnIndex !== colIndex) {
      setDragOverColumnIndex(colIndex);
    }
  };

  const handleColumnDrop = (e: React.DragEvent, targetColIndex: number) => {
    if (!isEditMode || draggedColumnIndex === null) return;
    e.preventDefault();
    e.stopPropagation();

    if (draggedColumnIndex === targetColIndex) {
      setDraggedColumnIndex(null);
      setDragOverColumnIndex(null);
      return;
    }

    const updatedColumns = [...builder.columns];
    const [movedCol] = updatedColumns.splice(draggedColumnIndex, 1);
    updatedColumns.splice(targetColIndex, 0, movedCol);

    onUpdateBuilder({
      ...builder,
      columns: updatedColumns,
    });

    setDraggedColumnIndex(null);
    setDragOverColumnIndex(null);
  };

  // Toggle Column Doubling (Split into 2 sub-columns)
  const handleToggleDoubleColumn = (colId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedColumns = builder.columns.map((col) => {
      if (col.id === colId) {
        return {
          ...col,
          isDoubled: !col.isDoubled,
        };
      }
      return col;
    });

    onUpdateBuilder({
      ...builder,
      columns: updatedColumns,
    });
  };

  // Add Word to Column
  const handleOpenAddWord = (colId: string) => {
    setAddingWordColId(colId);
    setNewWordSpanish('');
    setNewWordEnglish('');
    setEditingWord(null);
  };

  const handleCancelAddWord = () => {
    setAddingWordColId(null);
    setNewWordSpanish('');
    setNewWordEnglish('');
  };

  const handleSaveNewWord = (colId: string) => {
    if (!newWordSpanish.trim()) return;

    const newItem: WordItem = {
      id: `w-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      spanish: newWordSpanish.trim(),
      english: newWordEnglish.trim(),
    };

    const updatedColumns = builder.columns.map((col) => {
      if (col.id === colId) {
        return {
          ...col,
          items: [...col.items, newItem],
        };
      }
      return col;
    });

    onUpdateBuilder({
      ...builder,
      columns: updatedColumns,
    });

    setNewWordSpanish('');
    setNewWordEnglish('');
    setAddingWordColId(null);
  };

  // Delete Word from Column
  const handleDeleteWord = (colId: string, itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedColumns = builder.columns.map((col) => {
      if (col.id === colId) {
        return {
          ...col,
          items: col.items.filter((i) => i.id !== itemId),
        };
      }
      return col;
    });

    onUpdateBuilder({
      ...builder,
      columns: updatedColumns,
    });
  };

  // Edit Word Inline
  const handleStartEditWord = (colId: string, item: WordItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingWord({ colId, item });
    setEditSpanish(item.spanish);
    setEditEnglish(item.english || '');
    setAddingWordColId(null);
  };

  const handleSaveEditWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWord || !editSpanish.trim()) return;

    const updatedColumns = builder.columns.map((col) => {
      if (col.id === editingWord.colId) {
        return {
          ...col,
          items: col.items.map((i) =>
            i.id === editingWord.item.id
              ? { ...i, spanish: editSpanish.trim(), english: editEnglish.trim() }
              : i
          ),
        };
      }
      return col;
    });

    onUpdateBuilder({
      ...builder,
      columns: updatedColumns,
    });

    setEditingWord(null);
  };

  // Add Column
  const handleAddColumn = () => {
    const colorThemes: BuilderColumn['colorTheme'][] = [
      'blue',
      'amber',
      'emerald',
      'cyan',
      'purple',
      'rose',
      'indigo',
      'slate',
    ];
    const nextTheme = colorThemes[builder.columns.length % colorThemes.length];

    const newColumn: BuilderColumn = {
      id: `col-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: `Column ${builder.columns.length + 1}`,
      colorTheme: nextTheme,
      items: [],
      isDoubled: false,
    };

    onUpdateBuilder({
      ...builder,
      columns: [...builder.columns, newColumn],
    });
  };

  // Delete Column
  const handleDeleteColumn = (colId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (builder.columns.length <= 1) {
      alert('A Sentence Builder requires at least one column.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this column and all its words?')) {
      const updatedColumns = builder.columns.filter((c) => c.id !== colId);
      onUpdateBuilder({
        ...builder,
        columns: updatedColumns,
      });
    }
  };

  // Color schemes matching Language Gym / Conti aesthetic
  const getPanelColorClasses = (index: number) => {
    switch (index % 4) {
      case 0:
        return {
          bg: 'bg-white',
          border: 'border-[#D1D5DB]',
          dashed: 'border-[#E2E4E8]',
          hover: 'hover:bg-slate-100/70',
          badge: 'bg-slate-100 text-slate-700',
        };
      case 1:
        return {
          bg: 'bg-[#FFF4E5]',
          border: 'border-[#F6D2A2]',
          dashed: 'border-[#F3CFA0]',
          hover: 'hover:bg-[#FFE8CC]/80',
          badge: 'bg-[#FFE8CC] text-amber-900',
        };
      case 2:
        return {
          bg: 'bg-[#FEFDE8]',
          border: 'border-[#EBEBA5]',
          dashed: 'border-[#E5E49F]',
          hover: 'hover:bg-[#FCFBB8]/80',
          badge: 'bg-[#FCFBB8] text-yellow-900',
        };
      case 3:
      default:
        return {
          bg: 'bg-[#EEF9E8]',
          border: 'border-[#C6E7B6]',
          dashed: 'border-[#B8DFA4]',
          hover: 'hover:bg-[#DCF2D2]/80',
          badge: 'bg-[#DCF2D2] text-emerald-900',
        };
    }
  };

  // Render an individual word item row
  const renderWordRow = (
    item: WordItem,
    colId: string,
    rowIndex: number,
    customHover?: string
  ) => {
    const isRevealed = revealedWordIds[item.id];
    const displayedSpanish = isRevealed
      ? item.spanish
      : getScaffoldedText(item.spanish, preferences.scaffolding);
    const isSpeaking = speakingWordId === item.id;
    const isEditingThis = editingWord?.item.id === item.id;
    const isBeingDragged = draggedWordInfo?.item.id === item.id;
    const isDragOverThis =
      dragOverInfo?.targetColId === colId && dragOverInfo?.targetIndex === rowIndex;

    // Inline Edit Form for this word
    if (isEditMode && isEditingThis) {
      return (
        <form
          key={item.id}
          onSubmit={handleSaveEditWord}
          className="p-2 bg-white rounded-md border-2 border-indigo-400 shadow-sm flex flex-col gap-1.5 my-1"
        >
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={editSpanish}
              onChange={(e) => setEditSpanish(e.target.value)}
              placeholder="Target Word/Phrase"
              className="flex-1 px-2 py-1 text-xs border border-slate-300 rounded font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
              autoFocus
            />
            <input
              type="text"
              value={editEnglish}
              onChange={(e) => setEditEnglish(e.target.value)}
              placeholder="Translation (blue)"
              className="flex-1 px-2 py-1 text-xs border border-slate-300 rounded text-blue-600 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={() => setEditingWord(null)}
              className="px-2 py-0.5 text-[11px] font-medium text-slate-600 hover:bg-slate-100 rounded cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-2.5 py-0.5 text-[11px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded cursor-pointer flex items-center gap-1"
            >
              <Check className="w-3 h-3" />
              Save
            </button>
          </div>
        </form>
      );
    }

    return (
      <div
        key={item.id}
        draggable={true}
        onDragStart={(e) => {
          if (isEditMode) {
            handleEditDragStart(e, item, colId, rowIndex);
          } else {
            handlePresentationDragStart(e, item, colId);
          }
        }}
        onDragOver={(e) => {
          if (isEditMode) {
            handleEditDragOverRow(e, colId, rowIndex);
          }
        }}
        onDrop={(e) => {
          if (isEditMode) {
            handleEditDropOnRow(e, colId, rowIndex);
          }
        }}
        onClick={() => handleSpeakAndAdd(item, colId, false)}
        className={`group flex items-center justify-between py-1.5 px-2 rounded transition-all select-none ${
          customHover || 'hover:bg-black/5'
        } ${isSpeaking ? 'bg-amber-200/80' : ''} ${
          isBeingDragged ? 'opacity-30 border border-dashed border-indigo-400' : ''
        } ${
          isDragOverThis ? 'border-t-2 border-indigo-600 bg-indigo-50/70' : ''
        } ${isEditMode ? 'cursor-grab active:cursor-grabbing hover:bg-white/80' : 'cursor-pointer'}`}
        title={
          isEditMode
            ? 'Drag to reorder row or move to another column'
            : 'Click to listen or drag to sentence line'
        }
      >
        <div className="flex items-baseline gap-1.5 flex-wrap min-w-0 break-words flex-1 pr-1">
          {/* Edit Mode: Drag Grip Handle */}
          {isEditMode && (
            <div className="text-slate-400 group-hover:text-indigo-600 cursor-grab shrink-0 -ml-0.5 self-center">
              <GripVertical className="w-3.5 h-3.5" />
            </div>
          )}

          {/* Target language word */}
          <span className="font-semibold text-slate-900 text-sm sm:text-base tracking-tight leading-snug break-words">
            {displayedSpanish}
          </span>

          {/* Scaffolding peek button */}
          {!isEditMode && preferences.scaffolding !== 'full' && (
            <button
              onClick={(e) => togglePeekWord(item.id, e)}
              className="text-slate-500 hover:text-black p-0.5 rounded cursor-pointer self-center"
              title={isRevealed ? 'Hide letters' : 'Peek letters'}
            >
              <Eye className="w-3 h-3" />
            </button>
          )}

          {/* English translation in light blue parentheses: (translation) */}
          {preferences.showEnglish && item.english && (
            <span className="text-blue-500 font-normal text-xs sm:text-sm leading-snug break-words">
              ({item.english})
            </span>
          )}
        </div>

        {/* Action Controls */}
        {isEditMode ? (
          /* Edit Mode Controls: Edit Pencil + Delete Trash */
          <div className="flex items-center gap-1 shrink-0 ml-1">
            <button
              onClick={(e) => handleStartEditWord(colId, item, e)}
              className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-indigo-50 cursor-pointer transition-colors"
              title="Edit word & translation"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => handleDeleteWord(colId, item.id, e)}
              className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 cursor-pointer transition-colors"
              title="Delete word"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          /* Presentation Mode Controls: Pronounce + Quick Add */
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSpeakAndAdd(item, colId, false);
              }}
              className="p-1 text-slate-500 hover:text-black rounded hover:bg-black/10 cursor-pointer"
              title="Pronounce"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSpeakAndAdd(item, colId, true);
              }}
              className="p-1 text-emerald-700 hover:text-emerald-900 rounded hover:bg-emerald-100 cursor-pointer"
              title="Add to sentence line"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col min-h-0 flex-1 select-none">
      {/* Edit Mode Notice Bar */}
      {isEditMode && (
        <div className="mb-2 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center justify-between text-xs text-indigo-900 font-medium shadow-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold bg-indigo-600 text-white px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider">
              Edit Mode
            </span>
            <span>
              Drag column handles <GripHorizontal className="w-3.5 h-3.5 inline -mt-0.5 text-indigo-700" /> to reorder columns. Use <Columns2 className="w-3.5 h-3.5 inline -mt-0.5 text-indigo-700" /> to double-up long lists.
            </span>
          </div>
          <button
            onClick={handleAddColumn}
            className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded cursor-pointer shadow-xs transition-colors shrink-0"
            title="Add a new column to the right"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Column</span>
          </button>
        </div>
      )}

      {/* Container for All Column Panels - Auto-sizing to longest word, strictly in ONE horizontal row */}
      <div className="flex flex-row flex-nowrap items-start gap-2.5 sm:gap-3 w-full flex-1 overflow-x-auto pb-2">
        {builder.columns.map((col, colIndex) => {
          const theme = getPanelColorClasses(colIndex);
          const isAddingToThisCol = addingWordColId === col.id;
          const isDoubled = !!col.isDoubled;
          const isColumnDragging = draggedColumnIndex === colIndex;
          const isColumnDragOver = dragOverColumnIndex === colIndex && draggedColumnIndex !== colIndex;

          // If doubled, split items into left and right sub-columns
          const midpoint = Math.ceil(col.items.length / 2);
          const leftItems = isDoubled ? col.items.slice(0, midpoint) : col.items;
          const rightItems = isDoubled ? col.items.slice(midpoint) : [];

          return (
            <div
              key={col.id}
              onDragOver={(e) => {
                if (isEditMode && draggedColumnIndex !== null) {
                  handleColumnDragOver(e, colIndex);
                } else {
                  e.preventDefault();
                }
              }}
              onDrop={(e) => {
                if (isEditMode && draggedColumnIndex !== null) {
                  handleColumnDrop(e, colIndex);
                } else if (isEditMode && draggedWordInfo !== null) {
                  handleEditDropOnColumnBottom(e, col.id);
                }
              }}
              className={`rounded-lg border ${theme.border} ${theme.bg} shadow-xs p-2 sm:p-2.5 flex flex-col justify-between transition-all ${
                isDoubled
                  ? 'flex-[2] min-w-[260px] max-w-[580px]'
                  : 'flex-auto min-w-[130px] max-w-[340px]'
              } ${isColumnDragging ? 'opacity-30 border-2 border-dashed border-indigo-500' : ''} ${
                isColumnDragOver ? 'ring-2 ring-indigo-500 border-indigo-500 scale-[1.01]' : ''
              }`}
            >
              {/* Column Top Area in Edit Mode: Reorder Grip, Doubling Toggle & Delete Column */}
              {isEditMode && (
                <div 
                  draggable={true}
                  onDragStart={(e) => handleColumnDragStart(e, colIndex)}
                  className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-black/10 cursor-grab active:cursor-grabbing hover:bg-black/5 px-1 py-0.5 rounded transition-colors"
                  title="Drag this handle horizontally to reorder columns"
                >
                  <div className="flex items-center gap-1.5 text-slate-500 hover:text-indigo-700">
                    <GripHorizontal className="w-4 h-4 text-slate-400" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      Col {colIndex + 1} ({col.items.length})
                    </span>
                  </div>

                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    {/* Double-up / Single toggle button */}
                    <button
                      onClick={(e) => handleToggleDoubleColumn(col.id, e)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 border transition-colors cursor-pointer ${
                        isDoubled
                          ? 'bg-indigo-600 text-white border-indigo-700'
                          : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100 hover:text-black'
                      }`}
                      title={
                        isDoubled
                          ? 'Doubled column active: click to switch to single column'
                          : 'Double-up column into 2 side-by-side sub-columns'
                      }
                    >
                      <Columns2 className="w-3 h-3" />
                      <span>{isDoubled ? '2 Sub-Cols' : 'Double Up'}</span>
                    </button>

                    {/* Delete Column Button */}
                    <button
                      onClick={(e) => handleDeleteColumn(col.id, e)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 cursor-pointer transition-colors"
                      title="Delete this entire column"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Words Container: Standard single list OR Side-by-Side 2 Sub-Columns */}
              {isDoubled ? (
                /* Doubled Column Layout: 2 side-by-side sub-columns within the same box */
                <div className="flex flex-row items-stretch gap-2 flex-1 min-w-0">
                  {/* Left Sub-Column */}
                  <div className="flex-1 flex flex-col divide-y divide-dashed divide-black/10 min-w-0">
                    {leftItems.map((item, rowIdx) => (
                      <div key={item.id}>
                        {renderWordRow(item, col.id, rowIdx, theme.hover)}
                      </div>
                    ))}
                  </div>

                  {/* Vertical dashed separator */}
                  <div className="w-px border-r border-dashed border-black/15 self-stretch my-1 shrink-0" />

                  {/* Right Sub-Column */}
                  <div className="flex-1 flex flex-col divide-y divide-dashed divide-black/10 min-w-0">
                    {rightItems.map((item, rowIdx) => (
                      <div key={item.id}>
                        {renderWordRow(item, col.id, midpoint + rowIdx, theme.hover)}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Single Column Layout */
                <div className="flex flex-col flex-1 divide-y divide-dashed divide-black/10">
                  {col.items.map((item, rowIdx) => (
                    <div key={item.id}>
                      {renderWordRow(item, col.id, rowIdx, theme.hover)}
                    </div>
                  ))}

                  {col.items.length === 0 && !isAddingToThisCol && (
                    <div className="py-6 text-center text-xs text-slate-400 italic">
                      (No words in this column yet)
                    </div>
                  )}
                </div>
              )}

              {/* Edit Mode: Inline "+ Add word" Form / Button */}
              {isEditMode && (
                <div className="mt-2 pt-2 border-t border-dashed border-black/10">
                  {isAddingToThisCol ? (
                    <div className="p-2 bg-white rounded-md border border-indigo-300 shadow-sm flex flex-col gap-1.5">
                      <span className="text-[11px] font-bold text-indigo-900">
                        Add New Word to Col {colIndex + 1}
                      </span>
                      <input
                        type="text"
                        value={newWordSpanish}
                        onChange={(e) => setNewWordSpanish(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSaveNewWord(col.id);
                          }
                        }}
                        placeholder="Target Word (e.g. Vivo con)"
                        className="px-2 py-1 text-xs border border-slate-300 rounded font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
                        autoFocus
                      />
                      <input
                        type="text"
                        value={newWordEnglish}
                        onChange={(e) => setNewWordEnglish(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSaveNewWord(col.id);
                          }
                        }}
                        placeholder="English Translation (e.g. I live with)"
                        className="px-2 py-1 text-xs border border-slate-300 rounded text-blue-600 focus:outline-none focus:border-blue-500"
                      />
                      <div className="flex items-center justify-end gap-1.5 pt-0.5">
                        <button
                          type="button"
                          onClick={handleCancelAddWord}
                          className="px-2 py-0.5 text-[11px] font-medium text-slate-600 hover:bg-slate-100 rounded cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveNewWord(col.id)}
                          className="px-2.5 py-0.5 text-[11px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded cursor-pointer flex items-center gap-1 shadow-xs"
                        >
                          <Plus className="w-3 h-3" />
                          Add Word
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleOpenAddWord(col.id)}
                      className="w-full py-1 px-2 border border-dashed border-slate-400 hover:border-indigo-500 text-slate-600 hover:text-indigo-700 hover:bg-white/80 rounded text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      title="Add a new word to this column"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add word / row</span>
                    </button>
                  )}
                </div>
              )}

              {/* Bottom Subtle Indicator Icon (Presentation Mode) */}
              {!isEditMode && (
                <div className="pt-1.5 shrink-0 flex justify-end items-center gap-1 text-slate-400 select-none opacity-50">
                  <span className="font-mono text-[10px]">|||</span>
                  <ArrowLeftRight className="w-2.5 h-2.5" />
                </div>
              )}
            </div>
          );
        })}

        {/* Edit Mode: Add Column Action Card */}
        {isEditMode && (
          <div 
            className="shrink-0 w-32 self-stretch min-h-[160px] border-2 border-dashed border-indigo-300 hover:border-indigo-500 bg-indigo-50/40 hover:bg-indigo-50/80 rounded-lg flex flex-col items-center justify-center gap-2 p-3 text-center transition-colors cursor-pointer"
            onClick={handleAddColumn}
          >
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-indigo-900">
              Add New Column
            </span>
          </div>
        )}
      </div>

      {/* Alphabet / Spelling Strip: Clean inline text letters */}
      {builder.alphabet && builder.alphabet.length > 0 && (
        <div className="mt-2 shrink-0 flex items-center gap-1.5 flex-wrap text-xs py-1 px-2.5 bg-white/90 border border-slate-300 rounded-md shadow-xs">
          <span className="font-bold text-slate-700 text-xs mr-1">Spelling:</span>
          {builder.alphabet.map((item) => (
            <button
              key={item.letter}
              onClick={() =>
                handleSpeakAndAdd(
                  { id: `alpha-${item.letter}`, spanish: item.letter, english: item.sound },
                  'alphabet',
                  true
                )
              }
              className="hover:bg-amber-100 hover:text-black px-1 py-0.5 rounded cursor-pointer transition-colors text-slate-900 font-medium"
              title={`${item.letter}: ${item.sound}`}
            >
              <span className="font-bold">{item.letter}</span>
              <span className="text-[10px] text-blue-500 ml-0.5">({item.sound})</span>
            </button>
          ))}
        </div>
      )}

      {/* Extras Strip: Clean inline row of phrases */}
      {builder.extras && builder.extras.length > 0 && (
        <div className="mt-1.5 shrink-0 flex items-center gap-2 flex-wrap text-xs py-1 px-2.5 bg-white/80 border border-slate-300 rounded-md shadow-xs">
          <span className="font-bold text-slate-700 text-xs">Extras:</span>
          {builder.extras.map((extra) => (
            <button
              key={extra.id}
              onClick={() => handleSpeakAndAdd(extra, 'extras', true)}
              className="hover:bg-amber-100 hover:text-black px-1.5 py-0.5 rounded cursor-pointer transition-colors text-slate-900 font-medium flex items-center gap-1"
              title={`Click to add "${extra.spanish}" to line`}
            >
              <span className="font-semibold">
                {getScaffoldedText(extra.spanish, preferences.scaffolding)}
              </span>
              {preferences.showEnglish && (
                <span className="text-blue-500 text-[11px]">({extra.english})</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
