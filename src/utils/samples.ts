/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Measure, Note } from '../types';

export interface PreloadedMelody {
  name: string;
  bpm: number;
  measures: Measure[];
}

export const PRELOADED_MELODIES: PreloadedMelody[] = [
  {
    name: 'Brilha Brilha Estrelinha ⭐️',
    bpm: 100,
    measures: [
      {
        id: 'star-m1',
        timeSignature: '4/4',
        notes: [
          { id: 'star-n1', step: 2, accidental: 'none', duration: 1, isRest: false, beatOffset: 0 }, // C4
          { id: 'star-n2', step: 2, accidental: 'none', duration: 1, isRest: false, beatOffset: 1 }, // C4
          { id: 'star-n3', step: 6, accidental: 'none', duration: 1, isRest: false, beatOffset: 2 }, // G4
          { id: 'star-n4', step: 6, accidental: 'none', duration: 1, isRest: false, beatOffset: 3 }, // G4
        ],
      },
      {
        id: 'star-m2',
        timeSignature: '4/4',
        notes: [
          { id: 'star-n5', step: 7, accidental: 'none', duration: 1, isRest: false, beatOffset: 0 }, // A4
          { id: 'star-n6', step: 7, accidental: 'none', duration: 1, isRest: false, beatOffset: 1 }, // A4
          { id: 'star-n7', step: 6, accidental: 'none', duration: 2, isRest: false, beatOffset: 2 }, // G4 (Mínima)
        ],
      },
      {
        id: 'star-m3',
        timeSignature: '4/4',
        notes: [
          { id: 'star-n8', step: 5, accidental: 'none', duration: 1, isRest: false, beatOffset: 0 }, // F4
          { id: 'star-n9', step: 5, accidental: 'none', duration: 1, isRest: false, beatOffset: 1 }, // F4
          { id: 'star-n10', step: 4, accidental: 'none', duration: 1, isRest: false, beatOffset: 2 }, // E4
          { id: 'star-n11', step: 4, accidental: 'none', duration: 1, isRest: false, beatOffset: 3 }, // E4
        ],
      },
      {
        id: 'star-m4',
        timeSignature: '4/4',
        notes: [
          { id: 'star-n12', step: 3, accidental: 'none', duration: 1, isRest: false, beatOffset: 0 }, // D4
          { id: 'star-n13', step: 3, accidental: 'none', duration: 1, isRest: false, beatOffset: 1 }, // D4
          { id: 'star-n14', step: 2, accidental: 'none', duration: 2, isRest: false, beatOffset: 2 }, // C4 (Mínima)
        ],
      },
      {
        id: 'star-m5',
        timeSignature: '4/4',
        notes: [
          { id: 'star-n15', step: 6, accidental: 'none', duration: 1, isRest: false, beatOffset: 0 }, // G4
          { id: 'star-n16', step: 6, accidental: 'none', duration: 1, isRest: false, beatOffset: 1 }, // G4
          { id: 'star-n17', step: 5, accidental: 'none', duration: 1, isRest: false, beatOffset: 2 }, // F4
          { id: 'star-n18', step: 5, accidental: 'none', duration: 1, isRest: false, beatOffset: 3 }, // F4
        ],
      },
      {
        id: 'star-m6',
        timeSignature: '4/4',
        notes: [
          { id: 'star-n19', step: 4, accidental: 'none', duration: 1, isRest: false, beatOffset: 0 }, // E4
          { id: 'star-n20', step: 4, accidental: 'none', duration: 1, isRest: false, beatOffset: 1 }, // E4
          { id: 'star-n21', step: 3, accidental: 'none', duration: 2, isRest: false, beatOffset: 2 }, // D4 (Mínima)
        ],
      },
    ],
  },
  {
    name: 'Ode à Alegria (Beethoven) 🎼',
    bpm: 120,
    measures: [
      {
        id: 'ode-m1',
        timeSignature: '4/4',
        notes: [
          { id: 'ode-n1', step: 11, accidental: 'none', duration: 1, isRest: false, beatOffset: 0 }, // E5
          { id: 'ode-n2', step: 11, accidental: 'none', duration: 1, isRest: false, beatOffset: 1 }, // E5
          { id: 'ode-n3', step: 12, accidental: 'none', duration: 1, isRest: false, beatOffset: 2 }, // F5
          { id: 'ode-n4', step: 13, accidental: 'none', duration: 1, isRest: false, beatOffset: 3 }, // G5
        ],
      },
      {
        id: 'ode-m2',
        timeSignature: '4/4',
        notes: [
          { id: 'ode-n5', step: 13, accidental: 'none', duration: 1, isRest: false, beatOffset: 0 }, // G5
          { id: 'ode-n6', step: 12, accidental: 'none', duration: 1, isRest: false, beatOffset: 1 }, // F5
          { id: 'ode-n7', step: 11, accidental: 'none', duration: 1, isRest: false, beatOffset: 2 }, // E5
          { id: 'ode-n8', step: 10, accidental: 'none', duration: 1, isRest: false, beatOffset: 3 }, // D5
        ],
      },
      {
        id: 'ode-m3',
        timeSignature: '4/4',
        notes: [
          { id: 'ode-n9', step: 9, accidental: 'none', duration: 1, isRest: false, beatOffset: 0 }, // C5
          { id: 'ode-n10', step: 9, accidental: 'none', duration: 1, isRest: false, beatOffset: 1 }, // C5
          { id: 'ode-n11', step: 10, accidental: 'none', duration: 1, isRest: false, beatOffset: 2 }, // D5
          { id: 'ode-n12', step: 11, accidental: 'none', duration: 1, isRest: false, beatOffset: 3 }, // E5
        ],
      },
      {
        id: 'ode-m4',
        timeSignature: '4/4',
        notes: [
          { id: 'ode-n13', step: 11, accidental: 'none', duration: 1.5, isRest: false, beatOffset: 0 }, // E5 (pontuada)
          { id: 'ode-n14', step: 10, accidental: 'none', duration: 0.5, isRest: false, beatOffset: 1.5 }, // D5
          { id: 'ode-n15', step: 10, accidental: 'none', duration: 2, isRest: false, beatOffset: 2 }, // D5 (Mínima)
        ],
      },
      {
        id: 'ode-m5',
        timeSignature: '4/4',
        notes: [
          { id: 'ode-n16', step: 11, accidental: 'none', duration: 1, isRest: false, beatOffset: 0 }, // E5
          { id: 'ode-n17', step: 11, accidental: 'none', duration: 1, isRest: false, beatOffset: 1 }, // E5
          { id: 'ode-n18', step: 12, accidental: 'none', duration: 1, isRest: false, beatOffset: 2 }, // F5
          { id: 'ode-n19', step: 13, accidental: 'none', duration: 1, isRest: false, beatOffset: 3 }, // G5
        ],
      },
      {
        id: 'ode-m6',
        timeSignature: '4/4',
        notes: [
          { id: 'ode-n20', step: 13, accidental: 'none', duration: 1, isRest: false, beatOffset: 0 }, // G5
          { id: 'ode-n21', step: 12, accidental: 'none', duration: 1, isRest: false, beatOffset: 1 }, // F5
          { id: 'ode-n22', step: 11, accidental: 'none', duration: 1, isRest: false, beatOffset: 2 }, // E5
          { id: 'ode-n23', step: 10, accidental: 'none', duration: 1, isRest: false, beatOffset: 3 }, // D5
        ],
      },
      {
        id: 'ode-m7',
        timeSignature: '4/4',
        notes: [
          { id: 'ode-n24', step: 9, accidental: 'none', duration: 1, isRest: false, beatOffset: 0 }, // C5
          { id: 'ode-n25', step: 9, accidental: 'none', duration: 1, isRest: false, beatOffset: 1 }, // C5
          { id: 'ode-n26', step: 10, accidental: 'none', duration: 1, isRest: false, beatOffset: 2 }, // D5
          { id: 'ode-n27', step: 11, accidental: 'none', duration: 1, isRest: false, beatOffset: 3 }, // E5
        ],
      },
      {
        id: 'ode-m8',
        timeSignature: '4/4',
        notes: [
          { id: 'ode-n28', step: 10, accidental: 'none', duration: 1.5, isRest: false, beatOffset: 0 }, // D5 (pontuada)
          { id: 'ode-n29', step: 9, accidental: 'none', duration: 0.5, isRest: false, beatOffset: 1.5 }, // C5
          { id: 'ode-n30', step: 9, accidental: 'none', duration: 2, isRest: false, beatOffset: 2 }, // C5 (Mínima)
        ],
      },
    ],
  },
];
