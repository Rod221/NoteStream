/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Accidental = 'none' | 'sharp' | 'flat' | 'natural';

export interface Note {
  id: string;
  step: number; // 0 (A3) to 16 (C6) - index on treble clef staff
  accidental: Accidental;
  duration: number; // 4 = whole, 2 = half, 1 = quarter, 0.5 = eighth, 0.25 = sixteenth
  isRest: boolean; // if true, this note represents a silence
  beatOffset: number; // starting beat in the measure (0 to 3.75 for 4/4)
}

export type TimeSignature = '4/4' | '3/4' | '2/4';

export interface Measure {
  id: string;
  notes: Note[];
  timeSignature: TimeSignature;
}

export interface PitchInfo {
  step: number;
  name: string; // "C", "D", etc.
  solfege: string; // "Dó", "Ré", etc.
  octave: number;
  midiBase: number;
  frequencyBase: number;
  hasStaffLine: boolean; // true if it falls on one of the 5 staff lines
  ledgerLine: 'none' | 'below' | 'above' | 'middle-c';
}

export interface PlaybackState {
  isPlaying: boolean;
  bpm: number;
  currentMeasureIndex: number;
  currentBeat: number; // current beat offset being played in active measure
}

// Map steps on staff to frequencies and metadata
export const STAFF_PITCHES: PitchInfo[] = [
  { step: 0, name: 'A', solfege: 'Lá', octave: 3, midiBase: 57, frequencyBase: 220.00, hasStaffLine: false, ledgerLine: 'below' },
  { step: 1, name: 'B', solfege: 'Si', octave: 3, midiBase: 59, frequencyBase: 246.94, hasStaffLine: false, ledgerLine: 'below' },
  { step: 2, name: 'C', solfege: 'Dó', octave: 4, midiBase: 60, frequencyBase: 261.63, hasStaffLine: false, ledgerLine: 'middle-c' }, // Middle C
  { step: 3, name: 'D', solfege: 'Ré', octave: 4, midiBase: 62, frequencyBase: 293.66, hasStaffLine: false, ledgerLine: 'none' }, // Hangs below staff
  { step: 4, name: 'E', solfege: 'Mi', octave: 4, midiBase: 64, frequencyBase: 329.63, hasStaffLine: true, ledgerLine: 'none' }, // Line 1
  { step: 5, name: 'F', solfege: 'Fá', octave: 4, midiBase: 65, frequencyBase: 349.23, hasStaffLine: false, ledgerLine: 'none' }, // Space 1
  { step: 6, name: 'G', solfege: 'Sol', octave: 4, midiBase: 67, frequencyBase: 392.00, hasStaffLine: true, ledgerLine: 'none' }, // Line 2
  { step: 7, name: 'A', solfege: 'Lá', octave: 4, midiBase: 69, frequencyBase: 440.00, hasStaffLine: false, ledgerLine: 'none' }, // Space 2
  { step: 8, name: 'B', solfege: 'Si', octave: 4, midiBase: 71, frequencyBase: 493.88, hasStaffLine: true, ledgerLine: 'none' }, // Line 3
  { step: 9, name: 'C', solfege: 'Dó', octave: 5, midiBase: 72, frequencyBase: 523.25, hasStaffLine: false, ledgerLine: 'none' }, // Space 3
  { step: 10, name: 'D', solfege: 'Ré', octave: 5, midiBase: 74, frequencyBase: 587.33, hasStaffLine: true, ledgerLine: 'none' }, // Line 4
  { step: 11, name: 'E', solfege: 'Mi', octave: 5, midiBase: 76, frequencyBase: 659.25, hasStaffLine: false, ledgerLine: 'none' }, // Space 4
  { step: 12, name: 'F', solfege: 'Fá', octave: 5, midiBase: 77, frequencyBase: 698.46, hasStaffLine: true, ledgerLine: 'none' }, // Line 5
  { step: 13, name: 'G', solfege: 'Sol', octave: 5, midiBase: 79, frequencyBase: 783.99, hasStaffLine: false, ledgerLine: 'none' }, // Sits above staff
  { step: 14, name: 'A', solfege: 'Lá', octave: 5, midiBase: 81, frequencyBase: 880.00, hasStaffLine: false, ledgerLine: 'above' }, // Ledger line 1 above
  { step: 15, name: 'B', solfege: 'Si', octave: 5, midiBase: 83, frequencyBase: 987.77, hasStaffLine: false, ledgerLine: 'above' }, // Space above ledger 1
  { step: 16, name: 'C', solfege: 'Dó', octave: 6, midiBase: 84, frequencyBase: 1046.50, hasStaffLine: false, ledgerLine: 'above' }, // Ledger line 2 above
];

export interface NoteDurationOption {
  value: number;
  label: string;
  portugueseName: string;
  iconName: string; // representation name
}

export const DURATION_OPTIONS: NoteDurationOption[] = [
  { value: 4, label: 'Semibreve', portugueseName: 'Semibreve (4 t.)', iconName: 'whole' },
  { value: 2, label: 'Mínima', portugueseName: 'Mínima (2 t.)', iconName: 'half' },
  { value: 1, label: 'Semínima', portugueseName: 'Semínima (1 t.)', iconName: 'quarter' },
  { value: 0.5, label: 'Colcheia', portugueseName: 'Colcheia (1/2 t.)', iconName: 'eighth' },
  { value: 0.25, label: 'Semicolcheia', portugueseName: 'Semicolcheia (1/4 t.)', iconName: 'sixteenth' },
];
