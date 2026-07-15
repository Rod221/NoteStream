/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { Play, Pause, Square, Plus, Trash2, Download, Upload, Printer, FileMusic, Undo } from 'lucide-react';
import { Accidental, DURATION_OPTIONS, TimeSignature } from '../types';
import { PRELOADED_MELODIES } from '../utils/samples';

interface ToolbarProps {
  isPlaying: boolean;
  bpm: number;
  onBpmChange: (bpm: number) => void;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  
  onAddMeasure: (sig: TimeSignature) => void;
  onRemoveLastMeasure: () => void;
  onClearAll: () => void;
  
  selectedDuration: number;
  onDurationChange: (duration: number) => void;
  selectedAccidental: Accidental;
  onAccidentalChange: (accidental: Accidental) => void;
  isRestMode: boolean;
  onToggleRestMode: (isRest: boolean) => void;

  onLoadMelody: (melodyIndex: number) => void;
  onExportJson: () => void;
  onImportJson: (jsonString: string) => void;
  onExportMidi: () => void;
  onPrint: () => void;
}

export default function Toolbar({
  isPlaying,
  bpm,
  onBpmChange,
  onPlay,
  onPause,
  onStop,
  onAddMeasure,
  onRemoveLastMeasure,
  onClearAll,
  selectedDuration,
  onDurationChange,
  selectedAccidental,
  onAccidentalChange,
  isRestMode,
  onToggleRestMode,
  onLoadMelody,
  onExportJson,
  onImportJson,
  onExportMidi,
  onPrint,
}: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      onImportJson(content);
    };
    reader.readAsText(file);
    // reset input
    e.target.value = '';
  };

  return (
    <div className="bg-white text-gray-900 rounded-2xl p-4 md:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-200 space-y-6 select-none print:hidden">
      {/* SECTION 1: Playback & Score Management */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Playback Controls */}
        <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-xl border border-gray-150 w-fit">
          <button
            onClick={isPlaying ? onPause : onPlay}
            className={`p-3 rounded-xl cursor-pointer transition-all flex items-center justify-center ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
            }`}
            title={isPlaying ? 'Pausar' : 'Tocar partitura'}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
          </button>
          
          <button
            onClick={onStop}
            className="p-3 bg-white hover:bg-gray-100 text-gray-700 rounded-xl cursor-pointer transition-all flex items-center justify-center border border-gray-200 shadow-2xs"
            title="Parar reprodução"
          >
            <Square className="w-4 h-4 fill-current text-gray-500" />
          </button>

          <div className="h-6 w-[1px] bg-gray-200 mx-1" />

          {/* Tempo BPM */}
          <div className="flex items-center gap-2.5 px-1">
            <span className="font-mono text-xs font-bold text-gray-600 whitespace-nowrap min-w-[72px]">
              🚀 {bpm} BPM
            </span>
            <input
              type="range"
              min="40"
              max="240"
              value={bpm}
              onChange={(e) => onBpmChange(Number(e.target.value))}
              className="w-24 md:w-32 accent-blue-650 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Measure Controls & Preloads */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Load Sample Melody */}
          <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1.5 rounded-xl border border-gray-200/60">
            <span className="font-sans text-[11px] font-bold text-gray-500">Melodia:</span>
            <select
              onChange={(e) => {
                if (e.target.value !== '') {
                  onLoadMelody(Number(e.target.value));
                  e.target.value = ''; // Reset select
                }
              }}
              defaultValue=""
              className="bg-white text-gray-800 border border-gray-200 rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="" disabled>Carregar Exemplo...</option>
              {PRELOADED_MELODIES.map((m, idx) => (
                <option key={idx} value={idx}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div className="h-6 w-[1px] bg-gray-200 hidden sm:block mx-1" />

          {/* Add Measure Options */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onAddMeasure('4/4')}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-sans font-semibold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1"
              title="Adicionar compasso 4/4"
            >
              <Plus className="w-3.5 h-3.5" />
              Comp. 4/4
            </button>
            <button
              onClick={() => onAddMeasure('3/4')}
              className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-sans font-semibold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1 border border-gray-200"
              title="Adicionar compasso 3/4"
            >
              <Plus className="w-3.5 h-3.5" />
              Comp. 3/4
            </button>
          </div>

          {/* Remove Measure & Reset */}
          <button
            onClick={onRemoveLastMeasure}
            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl cursor-pointer transition-colors border border-gray-200"
            title="Remover último compasso"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            onClick={onClearAll}
            className="p-2 bg-red-50 hover:bg-red-100 hover:text-red-700 text-red-600 rounded-xl cursor-pointer border border-red-200/60 transition-colors flex items-center gap-1.5 px-3 py-2 text-xs font-semibold"
            title="Limpar partitura inteira"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Limpar Tudo
          </button>
        </div>
      </div>

      {/* SECTION 2: Creation Tool Configuration (Duration, Accidentals, Rest toggle) */}
      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Tool Mode Selection: Note vs Rest (Silence) */}
        <div className="space-y-2">
          <span className="block font-sans text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            1. Modo de Inserção
          </span>
          <div className="flex gap-1.5 bg-white p-1 rounded-xl border border-gray-200">
            <button
              onClick={() => onToggleRestMode(false)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-all ${
                !isRestMode
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <FileMusic className="w-4 h-4" />
              Nota (Som)
            </button>
            <button
              onClick={() => onToggleRestMode(true)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-all ${
                isRestMode
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Square className="w-4 h-4 rotate-45" />
              Pausa (Silêncio)
            </button>
          </div>
        </div>

        {/* Note Duration */}
        <div className="space-y-2 md:col-span-2">
          <span className="block font-sans text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            2. Selecionar Duração
          </span>
          <div className="flex flex-wrap gap-1 bg-white p-1 rounded-xl border border-gray-200">
            {DURATION_OPTIONS.map((opt) => {
              const isSelected = selectedDuration === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => onDurationChange(opt.value)}
                  className={`flex-1 min-w-[70px] py-2 text-center text-xs font-bold rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  title={opt.portugueseName}
                >
                  <span className="block text-[11px] truncate">{opt.label}</span>
                  <span className="block text-[9px] opacity-60 font-mono">
                    {opt.value === 4 ? '4 t.' : opt.value === 2 ? '2 t.' : opt.value === 1 ? '1 t.' : opt.value === 0.5 ? '1/2 t.' : '1/4 t.'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Accidentals (Only active if placing notes, not rests) */}
        {!isRestMode && (
          <div className="space-y-2 md:col-span-3 border-t border-gray-200/80 pt-3">
            <span className="block font-sans text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              3. Acidente (Tom)
            </span>
            <div className="flex max-w-md gap-1 bg-white p-1 rounded-xl border border-gray-200">
              {([
                { key: 'none', label: 'Nenhum Acidente (Natural)', char: '♮' },
                { key: 'sharp', label: 'Sustenido (♯)', char: '♯' },
                { key: 'flat', label: 'Bemol (♭)', char: '♭' },
              ] as const).map((item) => (
                <button
                  key={item.key}
                  onClick={() => onAccidentalChange(item.key)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                    selectedAccidental === item.key
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  title={item.label}
                >
                  <span className="text-sm mr-1 font-mono">{item.char}</span>
                  <span className="text-[11px]">{item.key === 'none' ? 'Natural' : item.key === 'sharp' ? 'Sustenido' : 'Bemol'}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: File Utilities (Export / Import / Print) */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-150 pt-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Download MIDI */}
          <button
            onClick={onExportMidi}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-full cursor-pointer transition-colors shadow-xs"
            title="Exportar arquivo MIDI padrão"
          >
            <Download className="w-3.5 h-3.5" />
            Baixar MIDI (.mid)
          </button>

          {/* Save JSON */}
          <button
            onClick={onExportJson}
            className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-full cursor-pointer transition-colors border border-gray-200"
            title="Salvar projeto no computador/celular"
          >
            <Download className="w-3.5 h-3.5" />
            Salvar Projeto (.json)
          </button>

          {/* Load JSON */}
          <button
            onClick={handleImportClick}
            className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-full cursor-pointer transition-colors border border-gray-200"
            title="Carregar arquivo de projeto .json"
          >
            <Upload className="w-3.5 h-3.5" />
            Abrir Projeto
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
        </div>

        {/* Print Score */}
        <button
          onClick={onPrint}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold rounded-full cursor-pointer transition-all"
          title="Imprimir partitura ou gerar PDF"
        >
          <Printer className="w-3.5 h-3.5" />
          Imprimir Partitura
        </button>
      </div>
    </div>
  );
}
