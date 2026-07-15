/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Measure, Note, STAFF_PITCHES, PitchInfo, Accidental } from '../types';
import { getFrequency } from '../utils/audio';

interface NotationCanvasProps {
  measures: Measure[];
  selectedNoteId: string | null;
  onSelectNote: (noteId: string | null) => void;
  onAddNote: (measureIndex: number, note: Omit<Note, 'id'>) => void;
  activeMeasureIndex: number;
  activeBeat: number;
  isPlaying: boolean;
  selectedDuration: number;
  selectedAccidental: Accidental;
  isRestMode: boolean;
}

const LINE_SPACING = 12;
const STAFF_CENTER_Y = 90; // Step 8 (B4) is at Y=90

// Convert step index (0 to 16) to Y coordinate in the SVG
export function stepToY(step: number): number {
  return STAFF_CENTER_Y - (step - 8) * (LINE_SPACING / 2);
}

// Convert Y coordinate in SVG to nearest step index (0 to 16)
export function yToStep(y: number): number {
  const step = Math.round(8 - (y - STAFF_CENTER_Y) / (LINE_SPACING / 2));
  return Math.max(0, Math.min(16, step));
}

export default function NotationCanvas({
  measures,
  selectedNoteId,
  onSelectNote,
  onAddNote,
  activeMeasureIndex,
  activeBeat,
  isPlaying,
  selectedDuration,
  selectedAccidental,
  isRestMode,
}: NotationCanvasProps) {
  const [hoverState, setHoverState] = useState<{
    measureIndex: number;
    step: number;
    beatOffset: number;
    x: number;
    y: number;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to active playing measure
  useEffect(() => {
    if (isPlaying && activeMeasureIndex >= 0 && containerRef.current) {
      const activeMeasureElement = containerRef.current.children[activeMeasureIndex] as HTMLElement;
      if (activeMeasureElement) {
        const container = containerRef.current;
        const leftPos = activeMeasureElement.offsetLeft;
        const width = activeMeasureElement.offsetWidth;
        const containerWidth = container.clientWidth;

        // Keep active measure visible
        if (leftPos + width > container.scrollLeft + containerWidth || leftPos < container.scrollLeft) {
          container.scrollTo({
            left: leftPos - containerWidth / 2 + width / 2,
            behavior: 'smooth',
          });
        }
      }
    }
  }, [activeMeasureIndex, isPlaying]);

  const handleMouseMove = (
    e: React.MouseEvent<SVGSVGElement>,
    measureIndex: number,
    timeSignature: '4/4' | '3/4' | '2/4'
  ) => {
    if (isPlaying) return;

    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Beats per measure calculation
    const beats = timeSignature === '4/4' ? 4 : timeSignature === '3/4' ? 3 : 2;

    // Spacing configuration
    const isFirstMeasure = measureIndex === 0;
    const leftMargin = isFirstMeasure ? 85 : 35; // Accommodate treble clef
    const rightMargin = 20;
    const usableWidth = 280 - leftMargin - rightMargin;

    // Calculate beat offset based on mouse X
    let beatOffset = ((x - leftMargin) / usableWidth) * beats;
    
    // Snap to sixteenth note resolution (0.25 beat)
    beatOffset = Math.round(beatOffset * 4) / 4;
    beatOffset = Math.max(0, Math.min(beats - selectedDuration, beatOffset));

    // Convert mouse Y to nearest staff step
    const step = yToStep(y);

    // X coordinate of the snapped note
    const snappedX = leftMargin + (beatOffset / beats) * usableWidth;
    const snappedY = stepToY(step);

    setHoverState({
      measureIndex,
      step,
      beatOffset,
      x: snappedX,
      y: snappedY,
    });
  };

  const handleMouseLeave = () => {
    setHoverState(null);
  };

  const handleSvgClick = (
    e: React.MouseEvent<SVGSVGElement>,
    measureIndex: number,
    timeSignature: '4/4' | '3/4' | '2/4'
  ) => {
    if (isPlaying) return;
    if (!hoverState) return;

    // If clicking close to an existing note, select it instead of adding
    const measure = measures[measureIndex];
    const clickBeat = hoverState.beatOffset;
    
    // Let's check if there is an existing note close to this beat offset (within 0.15 tolerance)
    const existingNote = measure.notes.find(
      (n) => Math.abs(n.beatOffset - clickBeat) < 0.15
    );

    if (existingNote) {
      onSelectNote(existingNote.id);
      return;
    }

    // Add note
    onAddNote(measureIndex, {
      step: hoverState.step,
      accidental: selectedAccidental,
      duration: selectedDuration,
      isRest: isRestMode,
      beatOffset: hoverState.beatOffset,
    });
  };

  // Render accidentals (Sharp, Flat, Natural)
  const renderAccidentalIcon = (acc: Accidental, x: number, y: number, color = 'currentColor') => {
    if (acc === 'none') return null;

    if (acc === 'sharp') {
      return (
        <g stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round">
          {/* Vertical lines */}
          <line x1={x - 4} y1={y - 8} x2={x - 4} y2={y + 8} />
          <line x1={x} y1={y - 6} x2={x} y2={y + 10} />
          {/* Slanted lines */}
          <line x1={x - 8} y1={y - 2} x2={x + 4} y2={y - 4} strokeWidth="2" />
          <line x1={x - 8} y1={y + 4} x2={x + 4} y2={y + 2} strokeWidth="2" />
        </g>
      );
    }

    if (acc === 'flat') {
      return (
        <path
          d={`M ${x - 4} ${y - 12} L ${x - 4} ${y + 4} C ${x - 4} ${y + 4}, ${x} ${y + 1}, ${x} ${y - 3} C ${x} ${y - 7}, ${x - 4} ${y - 5}, ${x - 4} ${y - 4}`}
          stroke={color}
          strokeWidth="1.8"
          fill="none"
          strokeLinejoin="round"
        />
      );
    }

    if (acc === 'natural') {
      return (
        <g stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round">
          <path d={`M ${x - 4} ${y - 9} L ${x - 4} ${y + 5}`} />
          <path d={`M ${x} ${y - 5} L ${x} ${y + 9}`} />
          <path d={`M ${x - 4} ${y - 2} L ${x} ${y - 4} L ${x} ${y + 3} L ${x - 4} ${y + 5} Z`} fill="none" />
        </g>
      );
    }

    return null;
  };

  // Render ledger lines for notes above/below the main 5 staff lines
  const renderLedgerLines = (step: number, x: number) => {
    const lines = [];
    const width = 24;

    if (step <= 2) {
      // Below staff ledger lines (even steps: Middle C is 2, A3 is 0)
      for (let s = 2; s >= step; s -= 2) {
        if (s === 2 || s === 0) {
          lines.push(
            <line
              key={`ledger-below-${s}`}
              x1={x - width / 2}
              y1={stepToY(s)}
              x2={x + width / 2}
              y2={stepToY(s)}
              stroke="currentColor"
              strokeWidth="1.5"
            />
          );
        }
      }
    } else if (step >= 14) {
      // Above staff ledger lines (even steps: A5 is 14, C6 is 16)
      for (let s = 14; s <= step; s += 2) {
        if (s === 14 || s === 16) {
          lines.push(
            <line
              key={`ledger-above-${s}`}
              x1={x - width / 2}
              y1={stepToY(s)}
              x2={x + width / 2}
              y2={stepToY(s)}
              stroke="currentColor"
              strokeWidth="1.5"
            />
          );
        }
      }
    }

    return lines;
  };

  // Render standard musical Note or Rest
  const renderNoteElement = (note: Note, x: number, y: number, isSelected: boolean) => {
    const color = isSelected ? '#f97316' : 'currentColor'; // Orange for selection
    const stemLength = 38;
    const isStemUp = note.step < 8;

    // 1. Rests (Silences)
    if (note.isRest) {
      if (note.duration === 4) {
        // Semibreve Rest: sits hanging below the 4th line (D5 line = Y=78)
        return (
          <g key={note.id} className="cursor-pointer">
            <rect x={x - 7} y={78} width={14} height={7} fill={color} />
          </g>
        );
      } else if (note.duration === 2) {
        // Mínima Rest: sits on top of the 3rd line (B4 line = Y=90)
        return (
          <g key={note.id} className="cursor-pointer">
            <rect x={x - 7} y={83} width={14} height={7} fill={color} />
          </g>
        );
      } else if (note.duration === 1) {
        // Semínima Rest: Squiggly line
        return (
          <path
            key={note.id}
            d={`M ${x - 4} 70 L ${x + 2} 76 L ${x - 4} 84 C ${x + 1} 88, ${x + 3} 92, ${x - 1} 96 C ${x - 3} 98, ${x - 4} 95, ${x - 2} 94`}
            stroke={color}
            strokeWidth="2.2"
            fill="none"
            strokeLinecap="round"
            className="cursor-pointer"
          />
        );
      } else if (note.duration === 0.5) {
        // Colcheia Rest: Hook slash
        return (
          <g key={note.id} className="cursor-pointer" stroke={color} strokeWidth="1.8" fill="none">
            <path d={`M ${x + 2} 78 L ${x - 4} 94`} />
            <circle cx={x - 5} cy={82} r="2.5" fill={color} stroke="none" />
            <path d={`M ${x - 5} 82 C ${x - 2} 82, ${x + 1} 80, ${x + 1} 84`} />
          </g>
        );
      } else {
        // Semicolcheia Rest: Double hook slash
        return (
          <g key={note.id} className="cursor-pointer" stroke={color} strokeWidth="1.8" fill="none">
            <path d={`M ${x + 3} 76 L ${x - 5} 96`} />
            {/* Top Hook */}
            <circle cx={x - 5} cy={80} r="2.2" fill={color} stroke="none" />
            <path d={`M ${x - 5} 80 C ${x - 2} 80, ${x + 1} 78, ${x + 1} 82`} />
            {/* Bottom Hook */}
            <circle cx={x - 7} cy={88} r="2.2" fill={color} stroke="none" />
            <path d={`M ${x - 7} 88 C ${x - 4} 88, ${x - 1} 86, ${x - 1} 90`} />
          </g>
        );
      }
    }

    // 2. Playable Notes
    const elements: React.ReactNode[] = [];

    // Accidentals offset to the left
    if (note.accidental !== 'none') {
      elements.push(
        <g key={`acc-${note.id}`}>
          {renderAccidentalIcon(note.accidental, x - 15, y, color)}
        </g>
      );
    }

    // Ledger lines
    elements.push(<g key={`ledg-${note.id}`}>{renderLedgerLines(note.step, x)}</g>);

    // Selected state indicator ring
    if (isSelected) {
      elements.push(
        <ellipse
          key={`glow-${note.id}`}
          cx={x}
          cy={y}
          rx={10}
          ry={8}
          fill="none"
          stroke="#fed7aa"
          strokeWidth="3"
          className="animate-pulse"
        />
      );
    }

    // Note Head: Ellipse rotated by -20 degrees
    const isFilled = note.duration <= 1; // Filled for 1, 0.5, 0.25 (Quarter, Eighth, Sixteenth)
    elements.push(
      <ellipse
        key={`head-${note.id}`}
        cx={0}
        cy={0}
        rx={6.5}
        ry={4.5}
        fill={isFilled ? color : 'none'}
        stroke={color}
        strokeWidth={isFilled ? '0' : '2'}
        transform={`translate(${x}, ${y}) rotate(-20)`}
        className="cursor-pointer transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          onSelectNote(note.id);
        }}
      />
    );

    // Stems (only for half, quarter, eighth, sixteenth)
    if (note.duration < 4) {
      const stemX = isStemUp ? x + 6 : x - 6;
      const stemY1 = y;
      const stemY2 = isStemUp ? y - stemLength : y + stemLength;

      elements.push(
        <line
          key={`stem-${note.id}`}
          x1={stemX}
          y1={stemY1}
          x2={stemX}
          y2={stemY2}
          stroke={color}
          strokeWidth="1.5"
          className="cursor-pointer"
        />
      );

      // Flags for Colcheias (eighth) and Semicolcheias (sixteenth)
      if (note.duration === 0.5) {
        // Eighth note flag
        const flagD = isStemUp
          ? `M ${stemX} ${stemY2} C ${stemX + 8} ${stemY2 + 10}, ${stemX + 10} ${stemY2 + 20}, ${stemX + 6} ${stemY2 + 25} C ${stemX + 8} ${stemY2 + 20}, ${stemX + 7} ${stemY2 + 10}, ${stemX} ${stemY2 + 6}`
          : `M ${stemX} ${stemY2} C ${stemX + 8} ${stemY2 - 10}, ${stemX + 10} ${stemY2 - 20}, ${stemX + 6} ${stemY2 - 25} C ${stemX + 8} ${stemY2 - 20}, ${stemX + 7} ${stemY2 - 10}, ${stemX} ${stemY2 - 6}`;

        elements.push(
          <path
            key={`flag-${note.id}`}
            d={flagD}
            fill={color}
            stroke="none"
            className="cursor-pointer"
          />
        );
      } else if (note.duration === 0.25) {
        // Sixteenth note flag (double flag)
        const flagD1 = isStemUp
          ? `M ${stemX} ${stemY2} C ${stemX + 8} ${stemY2 + 8}, ${stemX + 10} ${stemY2 + 16}, ${stemX + 6} ${stemY2 + 20} C ${stemX + 8} ${stemY2 + 16}, ${stemX + 7} ${stemY2 + 8}, ${stemX} ${stemY2 + 5}`
          : `M ${stemX} ${stemY2} C ${stemX + 8} ${stemY2 - 8}, ${stemX + 10} ${stemY2 - 16}, ${stemX + 6} ${stemY2 - 20} C ${stemX + 8} ${stemY2 - 16}, ${stemX + 7} ${stemY2 - 8}, ${stemX} ${stemY2 - 5}`;

        const offset = isStemUp ? 6 : -6;
        const flagD2 = isStemUp
          ? `M ${stemX} ${stemY2 + offset} C ${stemX + 8} ${stemY2 + offset + 8}, ${stemX + 10} ${stemY2 + offset + 16}, ${stemX + 6} ${stemY2 + offset + 20} C ${stemX + 8} ${stemY2 + offset + 16}, ${stemX + 7} ${stemY2 + offset + 8}, ${stemX} ${stemY2 + offset + 5}`
          : `M ${stemX} ${stemY2 + offset} C ${stemX + 8} ${stemY2 + offset - 8}, ${stemX + 10} ${stemY2 + offset - 16}, ${stemX + 6} ${stemY2 + offset - 20} C ${stemX + 8} ${stemY2 + offset - 16}, ${stemX + 7} ${stemY2 + offset - 8}, ${stemX} ${stemY2 + offset - 5}`;

        elements.push(
          <path
            key={`flag1-${note.id}`}
            d={flagD1}
            fill={color}
            stroke="none"
            className="cursor-pointer"
          />,
          <path
            key={`flag2-${note.id}`}
            d={flagD2}
            fill={color}
            stroke="none"
            className="cursor-pointer"
          />
        );
      }
    }

    return <g key={note.id}>{elements}</g>;
  };

  return (
    <div className="relative w-full">
      {/* Scrollable Notation Area */}
      <div
        ref={containerRef}
        className="flex overflow-x-auto py-8 px-4 gap-0 border border-gray-200 rounded-2xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] select-none scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent"
        id="sheet-music-scroll-container"
      >
        {measures.map((measure, mIndex) => {
          const isFirstMeasure = mIndex === 0;
          const leftMargin = isFirstMeasure ? 85 : 35;
          const rightMargin = 20;
          const usableWidth = 280 - leftMargin - rightMargin;
          const beats = measure.timeSignature === '4/4' ? 4 : measure.timeSignature === '3/4' ? 3 : 2;

          // Playback Line indicator
          const isCurrentPlayMeasure = activeMeasureIndex === mIndex;
          const playheadX = leftMargin + (activeBeat / beats) * usableWidth;

          return (
            <svg
              key={measure.id}
              width={280}
              height={180}
              className={`flex-shrink-0 relative overflow-visible ${
                isPlaying ? '' : 'hover:bg-slate-50/50'
              } transition-colors border-r border-gray-300`}
              onMouseMove={(e) => handleMouseMove(e, mIndex, measure.timeSignature)}
              onMouseLeave={handleMouseLeave}
              onClick={(e) => handleSvgClick(e, mIndex, measure.timeSignature)}
              style={{
                background: isCurrentPlayMeasure && isPlaying ? '#f0fdf4' : 'transparent',
              }}
            >
              {/* Measure Number */}
              <text
                x={12}
                y={22}
                className="font-mono text-xs font-bold text-gray-400 select-none"
              >
                {mIndex + 1}
              </text>

              {/* Clef and Time Signature on the First Measure */}
              {isFirstMeasure && (
                <g>
                  {/* Treble Clef Clave de Sol Icon Path */}
                  <path
                    d="M18,124 C23,124 29,120 31,114 C33,108 26,104 22,104 C17,104 13,108 13,113 C13,121 21,128 31,128 C45,128 52,112 49,95 C46,78 35,58 31,38 C28,24 29,12 34,12 C39,12 39,26 36,38 C32,54 26,86 28,106 C29,119 36,138 29,141 C27,142 24,141 23,138 C21,133 26,128 27,122 C28,116 23,112 19,114 C17,115 17,117 18,124 Z"
                    fill="currentColor"
                    className="text-gray-900"
                    transform="translate(10, -5) scale(1.15)"
                  />
                  {/* Time Signature */}
                  <text
                    x={55}
                    y={82}
                    className="font-sans font-bold text-2xl text-gray-900 leading-none select-none"
                    textAnchor="middle"
                  >
                    {beats}
                  </text>
                  <text
                    x={55}
                    y={106}
                    className="font-sans font-bold text-2xl text-gray-900 leading-none select-none"
                    textAnchor="middle"
                  >
                    4
                  </text>
                </g>
              )}

              {/* Staff lines (5 standard lines: E4, G4, B4, D5, F5) */}
              {[4, 6, 8, 10, 12].map((step) => {
                const y = stepToY(step);
                return (
                  <line
                    key={`staff-line-${step}`}
                    x1={0}
                    y1={y}
                    x2={280}
                    y2={y}
                    stroke="#cbd5e1"
                    strokeWidth="1.2"
                  />
                );
              })}

              {/* Vertical Subdivision Grid lines (helps alignment) */}
              {!isPlaying &&
                Array.from({ length: beats }).map((_, bIdx) => {
                  const gridX = leftMargin + (bIdx / beats) * usableWidth;
                  return (
                    <line
                      key={`grid-line-${bIdx}`}
                      x1={gridX}
                      y1={42}
                      x2={gridX}
                      y2={138}
                      stroke="#f1f5f9"
                      strokeWidth="1"
                      strokeDasharray="2,4"
                    />
                  );
                })}

              {/* Render Hover Ghost note/rest */}
              {hoverState && hoverState.measureIndex === mIndex && (
                <g className="opacity-40 text-blue-500 pointer-events-none">
                  {/* Ledger lines helper */}
                  {renderLedgerLines(hoverState.step, hoverState.x)}
                  
                  {/* Hover snap line */}
                  <line
                    x1={hoverState.x}
                    y1={30}
                    x2={hoverState.x}
                    y2={150}
                    stroke="#3b82f6"
                    strokeWidth="0.8"
                    strokeDasharray="1,2"
                  />

                  {/* Pitch guide line */}
                  <line
                    x1={0}
                    y1={hoverState.y}
                    x2={280}
                    y2={hoverState.y}
                    stroke="#3b82f6"
                    strokeWidth="0.8"
                    strokeDasharray="2,2"
                  />

                  {/* Ghost Note Shape */}
                  {renderNoteElement(
                    {
                      id: 'ghost',
                      step: hoverState.step,
                      accidental: selectedAccidental,
                      duration: selectedDuration,
                      isRest: isRestMode,
                      beatOffset: hoverState.beatOffset,
                    },
                    hoverState.x,
                    hoverState.y,
                    false
                  )}
                </g>
              )}

              {/* Render placed Notes & Rests */}
              {measure.notes.map((note) => {
                const noteX = leftMargin + (note.beatOffset / beats) * usableWidth;
                const noteY = stepToY(note.step);
                const isSelected = selectedNoteId === note.id;

                return (
                  <g key={note.id}>
                    {renderNoteElement(note, noteX, noteY, isSelected)}
                  </g>
                );
              })}

              {/* Visual Playback Playhead */}
              {isCurrentPlayMeasure && isPlaying && (
                <g className="pointer-events-none">
                  <line
                    x1={playheadX}
                    y1={30}
                    x2={playheadX}
                    y2={150}
                    stroke="#22c55e"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    className="shadow-md"
                  />
                  <polygon
                    points={`${playheadX - 5},25 ${playheadX + 5},25 ${playheadX},30`}
                    fill="#22c55e"
                  />
                </g>
              )}
            </svg>
          );
        })}
      </div>

      {/* Floating Cursor/Pitch Tooltip Informing Note Name (Extremely educational & user-friendly) */}
      {hoverState && !isPlaying && (
        <div
          className="absolute pointer-events-none bg-white text-gray-950 text-xs px-2.5 py-1.5 rounded-full shadow-lg border border-gray-200/80 font-mono font-medium z-30 transition-all duration-75 flex gap-1.5 items-center"
          style={{
            left: `${Math.min(
              window.innerWidth - 120,
              Math.max(10, hoverState.measureIndex * 280 + hoverState.x - 30)
            )}px`,
            top: `${hoverState.y - 32}px`,
          }}
        >
          <span className="text-blue-600 font-bold">
            {STAFF_PITCHES.find((p) => p.step === hoverState.step)?.solfege}
            {selectedAccidental === 'sharp' ? '♯' : selectedAccidental === 'flat' ? '♭' : ''}
          </span>
          <span className="opacity-30 text-gray-400">|</span>
          <span className="text-gray-500">Comp. {hoverState.measureIndex + 1}</span>
          <span className="opacity-30 text-gray-400">|</span>
          <span className="text-amber-600 font-bold">T: {hoverState.beatOffset.toFixed(2)}</span>
        </div>
      )}
    </div>
  );
}
