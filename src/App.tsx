/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { Music, ArrowDownToLine, Info, BookOpen, AlertCircle, Sparkles, Check, HelpCircle } from 'lucide-react';
import { Measure, Note, PlaybackState, TimeSignature } from './types';
import NotationCanvas from './components/NotationCanvas';
import Toolbar from './components/Toolbar';
import NoteEditorPanel from './components/NoteEditorPanel';
import PWAInstallGuide from './components/PWAInstallGuide';
import { SheetMusicPlayer, playNotePreview } from './utils/audio';
import { exportToMidi } from './utils/midi';
import { PRELOADED_MELODIES } from './utils/samples';

// Generate a random ID
function generateId() {
  return 'note-' + Math.random().toString(36).substring(2, 11);
}

// Initial arpeggio C major to greet the user with ready-to-play music
const INITIAL_MEASURES: Measure[] = [
  {
    id: 'm-init-1',
    timeSignature: '4/4',
    notes: [
      { id: 'n-init-1', step: 2, accidental: 'none', duration: 1, isRest: false, beatOffset: 0 }, // C4
      { id: 'n-init-2', step: 4, accidental: 'none', duration: 1, isRest: false, beatOffset: 1 }, // E4
      { id: 'n-init-3', step: 6, accidental: 'none', duration: 1, isRest: false, beatOffset: 2 }, // G4
      { id: 'n-init-4', step: 9, accidental: 'none', duration: 1, isRest: false, beatOffset: 3 }, // C5
    ],
  },
  {
    id: 'm-init-2',
    timeSignature: '4/4',
    notes: [
      { id: 'n-init-5', step: 11, accidental: 'none', duration: 2, isRest: false, beatOffset: 0 }, // E5 (Mínima)
      { id: 'n-init-6', step: 11, accidental: 'none', duration: 1, isRest: true, beatOffset: 2 }, // Pausa de Semínima
      { id: 'n-init-7', step: 9, accidental: 'none', duration: 1, isRest: false, beatOffset: 3 }, // C5
    ],
  },
  {
    id: 'm-init-3',
    timeSignature: '4/4',
    notes: [
      { id: 'n-init-8', step: 8, accidental: 'none', duration: 1, isRest: false, beatOffset: 0 }, // B4
      { id: 'n-init-9', step: 6, accidental: 'none', duration: 1, isRest: false, beatOffset: 1 }, // G4
      { id: 'n-init-10', step: 7, accidental: 'none', duration: 2, isRest: false, beatOffset: 2 }, // A4 (Mínima)
    ],
  },
  {
    id: 'm-init-4',
    timeSignature: '4/4',
    notes: [
      { id: 'n-init-11', step: 2, accidental: 'none', duration: 4, isRest: false, beatOffset: 0 }, // C4 (Semibreve)
    ],
  },
];

export default function App() {
  const [measures, setMeasures] = useState<Measure[]>(INITIAL_MEASURES);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number>(1); // Quarter/Semínima
  const [selectedAccidental, setSelectedAccidental] = useState<'none' | 'sharp' | 'flat' | 'natural'>('none');
  const [isRestMode, setIsRestMode] = useState<boolean>(false);
  const [bpm, setBpm] = useState<number>(110);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeMeasureIndex, setActiveMeasureIndex] = useState<number>(0);
  const [activeBeat, setActiveBeat] = useState<number>(0);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(true);
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>({
    type: 'info',
    text: 'Melodia inicial de C-Major carregada! Clique em Play (▶) acima para ouvir o som quente do sintetizador.',
  });

  const playerRef = useRef<SheetMusicPlayer | null>(null);

  // Initialize the audio scheduler on mount
  useEffect(() => {
    playerRef.current = new SheetMusicPlayer(
      (measureIndex, beat) => {
        setActiveMeasureIndex(measureIndex);
        setActiveBeat(beat);
      },
      () => {
        setIsPlaying(false);
        setActiveMeasureIndex(0);
        setActiveBeat(0);
      }
    );

    return () => {
      playerRef.current?.stop();
    };
  }, []);

  // Sync player parameters when they change during active playback
  useEffect(() => {
    if (isPlaying && playerRef.current) {
      playerRef.current.start(measures, bpm, activeMeasureIndex, activeBeat);
    }
  }, [bpm, measures]);

  const handlePlay = () => {
    if (!playerRef.current) return;
    setIsPlaying(true);
    playerRef.current.start(measures, bpm, activeMeasureIndex, activeBeat);
  };

  const handlePause = () => {
    setIsPlaying(false);
    playerRef.current?.stop();
  };

  const handleStop = () => {
    setIsPlaying(false);
    playerRef.current?.stop();
    setActiveMeasureIndex(0);
    setActiveBeat(0);
  };

  const handleAddMeasure = (timeSignature: TimeSignature) => {
    const newMeasure: Measure = {
      id: 'm-' + Math.random().toString(36).substring(2, 11),
      timeSignature,
      notes: [],
    };
    setMeasures((prev) => [...prev, newMeasure]);
    triggerAlert('success', `Adicionado novo compasso ${timeSignature}!`);
  };

  const handleRemoveLastMeasure = () => {
    if (measures.length <= 1) {
      triggerAlert('error', 'A partitura precisa ter pelo menos um compasso!');
      return;
    }
    handleStop();
    setMeasures((prev) => prev.slice(0, -1));
    setSelectedNoteId(null);
    triggerAlert('info', 'Último compasso removido.');
  };

  const handleClearAll = () => {
    handleStop();
    setMeasures([
      {
        id: 'm-empty',
        timeSignature: '4/4',
        notes: [],
      },
    ]);
    setSelectedNoteId(null);
    triggerAlert('info', 'Partitura redefinida para um compasso vazio.');
  };

  const handleAddNote = (measureIndex: number, noteData: Omit<Note, 'id'>) => {
    const beatsPerMeasure = measures[measureIndex].timeSignature === '4/4' ? 4 : measures[measureIndex].timeSignature === '3/4' ? 3 : 2;
    
    // Safety check: ensure note duration fits in the measure starting from the clicked offset
    const finalDuration = Math.min(noteData.duration, beatsPerMeasure - noteData.beatOffset);
    
    if (finalDuration <= 0) {
      triggerAlert('error', 'Não há espaço suficiente neste compasso para esta duração!');
      return;
    }

    const newNote: Note = {
      ...noteData,
      duration: finalDuration,
      id: generateId(),
    };

    setMeasures((prev) => {
      return prev.map((measure, mIdx) => {
        if (mIdx !== measureIndex) return measure;

        // Filter out existing notes that overlap with the new note's starting beat offset
        const filteredNotes = measure.notes.filter(
          (n) => Math.abs(n.beatOffset - newNote.beatOffset) >= 0.15
        );

        // Add the new note and sort them chronologically
        const updatedNotes = [...filteredNotes, newNote].sort((a, b) => a.beatOffset - b.beatOffset);

        return {
          ...measure,
          notes: updatedNotes,
        };
      });
    });

    // Acoustic audio response on placement
    if (!newNote.isRest) {
      playNotePreview(newNote.step, newNote.accidental, newNote.duration, newNote.isRest);
    }
  };

  const handleUpdateNote = (updatedNote: Note) => {
    setMeasures((prev) => {
      return prev.map((measure) => {
        return {
          ...measure,
          notes: measure.notes.map((note) => (note.id === updatedNote.id ? updatedNote : note)),
        };
      });
    });
  };

  const handleDeleteNote = (noteId: string) => {
    setMeasures((prev) => {
      return prev.map((measure) => {
        return {
          ...measure,
          notes: measure.notes.filter((note) => note.id !== noteId),
        };
      });
    });
    setSelectedNoteId(null);
    triggerAlert('info', 'Nota excluída.');
  };

  const handleLoadMelody = (index: number) => {
    handleStop();
    const melody = PRELOADED_MELODIES[index];
    if (melody) {
      setMeasures(JSON.parse(JSON.stringify(melody.measures))); // deep clone
      setBpm(melody.bpm);
      setSelectedNoteId(null);
      triggerAlert('success', `Carregada melodia "${melody.name}"!`);
    }
  };

  const handleExportJson = () => {
    const dataStr = JSON.stringify({ bpm, measures }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'minha_partitura.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerAlert('success', 'Projeto exportado com sucesso como JSON!');
  };

  const handleImportJson = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && Array.isArray(parsed.measures)) {
        handleStop();
        setMeasures(parsed.measures);
        if (typeof parsed.bpm === 'number') {
          setBpm(parsed.bpm);
        }
        setSelectedNoteId(null);
        triggerAlert('success', 'Partitura importada com sucesso!');
      } else {
        triggerAlert('error', 'Formato de arquivo JSON inválido.');
      }
    } catch (e) {
      triggerAlert('error', 'Falha ao analisar o arquivo JSON.');
    }
  };

  const handleExportMidi = () => {
    try {
      const blob = exportToMidi(measures, bpm);
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'minha_partitura.mid';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      triggerAlert('success', 'Música baixada com sucesso como arquivo MIDI padrão!');
    } catch (e) {
      triggerAlert('error', 'Erro ao gerar o arquivo MIDI.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const triggerAlert = (type: 'success' | 'error' | 'info', text: string) => {
    setAlertMessage({ type, text });
  };

  // Find the selected note and its parent measure index for the editor panel
  let selectedNote: Note | null = null;
  let selectedNoteMeasureIndex = -1;

  if (selectedNoteId) {
    for (let mIdx = 0; mIdx < measures.length; mIdx++) {
      const found = measures[mIdx].notes.find((n) => n.id === selectedNoteId);
      if (found) {
        selectedNote = found;
        selectedNoteMeasureIndex = mIdx;
        break;
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F4F6] text-gray-900 pb-12 transition-all">
      {/* HEADER BAR */}
      <header className="w-full bg-white text-gray-900 py-4 px-6 md:px-12 flex flex-col md:flex-row md:items-center justify-between border-b border-gray-200 shadow-xs gap-4 print:hidden shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-xs">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-sans font-bold text-lg md:text-xl tracking-tight text-gray-900 flex items-center gap-2">
              NoteStream
              <span className="text-[9px] bg-blue-50 text-blue-600 font-mono px-2 py-0.5 rounded-full border border-blue-100 font-bold uppercase tracking-wider">PWA LEVE</span>
            </h1>
            <p className="font-sans text-xs text-gray-500 mt-0.5">
              Notação musical simplificada • Crie, publique e exporte em tempo real.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Status badge */}
          <div className="hidden sm:flex items-center bg-gray-100 rounded-full px-3 py-1.5 gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] text-gray-600 font-mono uppercase tracking-wider font-bold">Sync Active</span>
          </div>

          <a
            href="#install-section"
            className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold cursor-pointer border border-gray-200/60 transition-colors"
          >
            <ArrowDownToLine className="w-3.5 h-3.5 text-blue-600" />
            Instalar App
          </a>
          <button
            onClick={() => setShowOnboarding(!showOnboarding)}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full cursor-pointer text-gray-600 transition-colors border border-gray-200/60"
            title="Ajuda / Como Usar"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6 md:py-8 space-y-6">
        
        {/* GLOBAL ALERT BAR */}
        {alertMessage && (
          <div
            className={`flex items-start justify-between gap-3 p-4 rounded-2xl border transition-all animate-in fade-in duration-300 print:hidden ${
              alertMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : alertMessage.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-blue-50 border-blue-200 text-blue-800'
            }`}
          >
            <div className="flex gap-2.5">
              <Info className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                alertMessage.type === 'success'
                  ? 'text-emerald-600'
                  : alertMessage.type === 'error'
                  ? 'text-rose-600'
                  : 'text-blue-600'
              }`} />
              <span className="font-sans text-xs md:text-sm font-medium">{alertMessage.text}</span>
            </div>
            <button
              onClick={() => setAlertMessage(null)}
              className="text-xs font-bold underline opacity-60 hover:opacity-100 cursor-pointer"
            >
              Fechar
            </button>
          </div>
        )}

        {/* PRINTABLE WATERMARK / TITLE (Only visible on paper) */}
        <div className="hidden print:block mb-6">
          <h1 className="font-sans font-bold text-3xl tracking-tight text-black">
            Minha Composição Musical
          </h1>
          <p className="font-sans text-sm text-slate-600 mt-1">
            Editor de Partituras Leve | bpm: {bpm} | Compilado em {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>

        {/* ONBOARDING QUICK GUIDE */}
        {showOnboarding && (
          <div className="bg-white border border-gray-200 rounded-2xl p-5 md:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] relative print:hidden">
            <button
              onClick={() => setShowOnboarding(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 font-bold text-xs p-1 cursor-pointer"
            >
              Ocultar Guia ×
            </button>
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl mt-0.5">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <h3 className="font-sans font-bold text-gray-900 text-sm md:text-base flex items-center gap-1.5">
                  Guia Rápido de Uso <Sparkles className="w-4 h-4 text-blue-600 fill-blue-50" />
                </h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 font-sans text-xs text-gray-600 leading-relaxed list-disc list-inside">
                  <li>
                    <strong className="text-gray-900">Adicionar notas:</strong> Clique ou toque em qualquer lugar do pentagrama. Uma linha azul e um balão guiam você sobre o nome da nota (ex: Dó 4).
                  </li>
                  <li>
                    <strong className="text-gray-900">Editar notas:</strong> Toque em qualquer nota colocada para abrir o painel de edição (altere tom, duração, acidente ou apague).
                  </li>
                  <li>
                    <strong className="text-gray-900">Modo de Pausa:</strong> Ative o modo <strong className="text-blue-600">Pausa</strong> na barra para colocar silêncios na pauta.
                  </li>
                  <li>
                    <strong className="text-gray-900">Organização:</strong> Adicione mais compassos usando os botões de compasso 4/4 ou 3/4.
                  </li>
                  <li>
                    <strong className="text-gray-900">Exportação:</strong> Baixe o arquivo <strong className="text-blue-600">MIDI (.mid)</strong> real para carregar no seu teclado ou editor externo!
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* NOTATION CANVAS WRAPPER */}
        <section className="space-y-3">
          <div className="flex items-center justify-between print:hidden">
            <h2 className="font-sans font-bold text-gray-900 text-xs md:text-sm uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-600 rounded-full" />
              Pauta Musical (Pentagrama)
            </h2>
            <span className="text-xs text-gray-400 font-mono italic">
              Arraste para os lados se faltar espaço (scroll lateral)
            </span>
          </div>

          <NotationCanvas
            measures={measures}
            selectedNoteId={selectedNoteId}
            onSelectNote={setSelectedNoteId}
            onAddNote={handleAddNote}
            activeMeasureIndex={activeMeasureIndex}
            activeBeat={activeBeat}
            isPlaying={isPlaying}
            selectedDuration={selectedDuration}
            selectedAccidental={selectedAccidental}
            isRestMode={isRestMode}
          />
        </section>

        {/* FLOATING/TACTILE SELECTED NOTE EDITOR */}
        <NoteEditorPanel
          selectedNote={selectedNote}
          measureIndex={selectedNoteMeasureIndex}
          onUpdateNote={handleUpdateNote}
          onDeleteNote={handleDeleteNote}
          onDeselect={() => setSelectedNoteId(null)}
        />

        {/* CORE TOOLBAR */}
        <section className="print:hidden">
          <Toolbar
            isPlaying={isPlaying}
            bpm={bpm}
            onBpmChange={setBpm}
            onPlay={handlePlay}
            onPause={handlePause}
            onStop={handleStop}
            onAddMeasure={handleAddMeasure}
            onRemoveLastMeasure={handleRemoveLastMeasure}
            onClearAll={handleClearAll}
            selectedDuration={selectedDuration}
            onDurationChange={setSelectedDuration}
            selectedAccidental={selectedAccidental}
            onAccidentalChange={setSelectedAccidental}
            isRestMode={isRestMode}
            onToggleRestMode={setIsRestMode}
            onLoadMelody={handleLoadMelody}
            onExportJson={handleExportJson}
            onImportJson={handleImportJson}
            onExportMidi={handleExportMidi}
            onPrint={handlePrint}
          />
        </section>

        {/* PWA INSTALL CARD */}
        <section id="install-section" className="print:hidden">
          <PWAInstallGuide />
        </section>
      </main>

      {/* FOOTER */}
      <footer className="w-full text-center py-6 mt-12 border-t border-gray-200/80 text-xs text-gray-400 font-sans print:hidden">
        <p>© 2026 NoteStream. Todos os direitos reservados.</p>
        <p className="mt-1 opacity-70">
          Feito em HTML5 Web Audio & React 19. Funciona offline e responde perfeitamente em telas touch.
        </p>
      </footer>
    </div>
  );
}
