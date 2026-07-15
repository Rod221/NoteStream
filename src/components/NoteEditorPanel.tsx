/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Note, STAFF_PITCHES, DURATION_OPTIONS, Accidental } from '../types';
import { ArrowUp, ArrowDown, Music, Trash2, Volume2, X, Sparkles } from 'lucide-react';
import { playNotePreview } from '../utils/audio';

interface NoteEditorPanelProps {
  selectedNote: Note | null;
  measureIndex: number;
  onUpdateNote: (updatedNote: Note) => void;
  onDeleteNote: (noteId: string) => void;
  onDeselect: () => void;
}

export default function NoteEditorPanel({
  selectedNote,
  measureIndex,
  onUpdateNote,
  onDeleteNote,
  onDeselect,
}: NoteEditorPanelProps) {
  if (!selectedNote) return null;

  const currentPitchInfo = STAFF_PITCHES.find((p) => p.step === selectedNote.step);

  const handlePitchChange = (direction: 'up' | 'down') => {
    const nextStep = direction === 'up' ? selectedNote.step + 1 : selectedNote.step - 1;
    if (nextStep >= 0 && nextStep <= 16) {
      const updated = { ...selectedNote, step: nextStep };
      onUpdateNote(updated);
      playNotePreview(updated.step, updated.accidental, updated.duration, updated.isRest);
    }
  };

  const handleAccidentalChange = (acc: Accidental) => {
    const updated = { ...selectedNote, accidental: acc };
    onUpdateNote(updated);
    playNotePreview(updated.step, updated.accidental, updated.duration, updated.isRest);
  };

  const handleDurationChange = (dur: number) => {
    const updated = { ...selectedNote, duration: dur };
    onUpdateNote(updated);
    playNotePreview(updated.step, updated.accidental, updated.duration, updated.isRest);
  };

  const handleToggleRest = () => {
    const updated = { ...selectedNote, isRest: !selectedNote.isRest };
    onUpdateNote(updated);
    if (!updated.isRest) {
      playNotePreview(updated.step, updated.accidental, updated.duration, updated.isRest);
    }
  };

  const handlePlayPreview = () => {
    playNotePreview(
      selectedNote.step,
      selectedNote.accidental,
      selectedNote.duration,
      selectedNote.isRest
    );
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 md:absolute md:bottom-6 md:left-1/2 md:-translate-x-1/2 bg-white text-gray-900 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] p-4 md:p-5 border border-gray-200 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200 max-w-xl md:w-[500px]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-ping" />
          <span className="font-sans font-bold text-xs uppercase tracking-widest text-blue-600">
            Nota Selecionada (Comp. {measureIndex + 1})
          </span>
        </div>
        <button
          onClick={onDeselect}
          className="text-gray-400 hover:text-gray-900 p-1 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Controls Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Left Side: Pitch and Basic Operations */}
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-gray-50 p-2.5 rounded-xl border border-gray-200/80">
            <div className="flex flex-col">
              <span className="font-sans text-[10px] text-gray-400 font-bold uppercase tracking-wider">Tom / Pitch</span>
              <span className="font-sans font-bold text-base text-gray-900">
                {selectedNote.isRest
                  ? 'Pausa'
                  : `${currentPitchInfo?.solfege || ''}${currentPitchInfo?.octave || ''}`}
                {!selectedNote.isRest && selectedNote.accidental === 'sharp' && ' ♯'}
                {!selectedNote.isRest && selectedNote.accidental === 'flat' && ' ♭'}
              </span>
            </div>
            
            <div className="flex gap-1.5">
              <button
                disabled={selectedNote.isRest}
                onClick={handlePlayPreview}
                className="p-1.5 bg-white hover:bg-gray-100 disabled:opacity-30 text-gray-750 rounded-lg cursor-pointer transition-colors border border-gray-200 shadow-3xs"
                title="Tocar som"
              >
                <Volume2 className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={handleToggleRest}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg cursor-pointer transition-colors ${
                  selectedNote.isRest
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-2xs'
                    : 'bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 shadow-3xs'
                }`}
              >
                {selectedNote.isRest ? 'Ativar Nota' : 'Tornar Pausa'}
              </button>
            </div>
          </div>

          {/* Transposition Buttons */}
          <div className="flex gap-2">
            <button
              disabled={selectedNote.isRest || selectedNote.step >= 16}
              onClick={() => handlePitchChange('up')}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white hover:bg-gray-50 active:bg-gray-100 disabled:opacity-20 text-gray-700 font-sans font-semibold text-xs rounded-xl cursor-pointer transition-all border border-gray-200 shadow-3xs"
            >
              <ArrowUp className="w-3.5 h-3.5 text-gray-500" />
              Subir Tom
            </button>
            <button
              disabled={selectedNote.isRest || selectedNote.step <= 0}
              onClick={() => handlePitchChange('down')}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white hover:bg-gray-50 active:bg-gray-100 disabled:opacity-20 text-gray-700 font-sans font-semibold text-xs rounded-xl cursor-pointer transition-all border border-gray-200 shadow-3xs"
            >
              <ArrowDown className="w-3.5 h-3.5 text-gray-500" />
              Descer Tom
            </button>
          </div>
        </div>

        {/* Right Side: Accidentals & Duration */}
        <div className="space-y-3">
          {/* Accidentals */}
          {!selectedNote.isRest && (
            <div>
              <span className="block font-sans text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1.5">
                Acidente
              </span>
              <div className="flex gap-1 bg-gray-100 p-1 rounded-lg border border-gray-200/80">
                {(['none', 'sharp', 'flat', 'natural'] as Accidental[]).map((acc) => {
                  const labels: Record<string, string> = {
                    none: '♮',
                    sharp: '♯',
                    flat: '♭',
                    natural: '♮',
                  };
                  const names: Record<string, string> = {
                    none: 'Nenhum',
                    sharp: 'Sust.',
                    flat: 'Bemol',
                    natural: 'Nat.',
                  };

                  return (
                    <button
                      key={acc}
                      onClick={() => handleAccidentalChange(acc)}
                      className={`flex-1 py-1 text-xs font-bold rounded-md cursor-pointer transition-colors ${
                        selectedNote.accidental === acc
                          ? 'bg-blue-600 text-white shadow-3xs'
                          : 'text-gray-500 hover:bg-white hover:text-gray-900'
                      }`}
                      title={names[acc]}
                    >
                      {labels[acc]}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Duration Selector */}
          <div>
            <span className="block font-sans text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1.5">
              Duração da Nota
            </span>
            <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-lg border border-gray-200/80">
              {DURATION_OPTIONS.map((opt) => {
                const isSelected = selectedNote.duration === opt.value;
                const abbreviations: Record<string, string> = {
                  Semibreve: '1/1',
                  Mínima: '1/2',
                  Semínima: '1/4',
                  Colcheia: '1/8',
                  Semicolcheia: '1/16',
                };

                return (
                  <button
                    key={opt.value}
                    onClick={() => handleDurationChange(opt.value)}
                    className={`flex-1 min-w-[50px] py-1 text-[10px] font-bold rounded-md cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-3xs'
                        : 'text-gray-500 hover:bg-white hover:text-gray-900'
                    }`}
                    title={opt.portugueseName}
                  >
                    {abbreviations[opt.label] || opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Action Buttons */}
      <div className="flex gap-2 border-t border-gray-100 mt-4 pt-3 justify-between items-center">
        <button
          onClick={() => onDeleteNote(selectedNote.id)}
          className="flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-xl cursor-pointer border border-red-200/60 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Excluir Nota
        </button>

        <button
          onClick={onDeselect}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl cursor-pointer transition-colors shadow-xs"
        >
          Confirmar Edição
        </button>
      </div>
    </div>
  );
}
