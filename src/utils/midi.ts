/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Measure, STAFF_PITCHES, Accidental } from '../types';

// Convert pitch step and accidental to MIDI note number
function getMidiNumber(step: number, accidental: Accidental): number {
  const pitchInfo = STAFF_PITCHES.find((p) => p.step === step);
  if (!pitchInfo) return 60; // default middle C

  let midi = pitchInfo.midiBase;
  if (accidental === 'sharp') midi += 1;
  if (accidental === 'flat') midi -= 1;
  return midi;
}

// Convert a number to variable-length quantity (VLQ) bytes used in MIDI
function toVLQ(n: number): number[] {
  const bytes: number[] = [];
  let val = Math.max(0, Math.round(n));
  
  bytes.unshift(val & 0x7f);
  while (val > 0x7f) {
    val = val >> 7;
    bytes.unshift((val & 0x7f) | 0x80);
  }
  return bytes;
}

// Helper to convert 32-bit int to 4 bytes (Big Endian)
function to32BitBytes(n: number): number[] {
  return [
    (n >> 24) & 0xff,
    (n >> 16) & 0xff,
    (n >> 8) & 0xff,
    n & 0xff,
  ];
}

// Helper to convert 16-bit int to 2 bytes (Big Endian)
function to16BitBytes(n: number): number[] {
  return [
    (n >> 8) & 0xff,
    n & 0xff,
  ];
}

interface MidiEvent {
  absoluteBeat: number;
  type: 'note-on' | 'note-off';
  pitch: number;
}

export function exportToMidi(measures: Measure[], bpm: number): Blob {
  const ticksPerBeat = 480; // Standard resolution (TPQN)
  
  // 1. Collect all events with absolute positions in terms of total beats
  const rawEvents: MidiEvent[] = [];
  let absoluteMeasureStartBeat = 0;

  measures.forEach((measure) => {
    const beatsPerMeasure = measure.timeSignature === '4/4' ? 4 : measure.timeSignature === '3/4' ? 3 : 2;

    measure.notes.forEach((note) => {
      if (note.isRest) return; // skip rests in MIDI output

      const pitch = getMidiNumber(note.step, note.accidental);
      const startBeat = absoluteMeasureStartBeat + note.beatOffset;
      const endBeat = startBeat + note.duration;

      rawEvents.push({
        absoluteBeat: startBeat,
        type: 'note-on',
        pitch: pitch,
      });

      rawEvents.push({
        absoluteBeat: endBeat,
        type: 'note-off',
        pitch: pitch,
      });
    });

    absoluteMeasureStartBeat += beatsPerMeasure;
  });

  // 2. Sort events by absolute beat position. 
  // If the positions are equal, process 'note-off' before 'note-on' to avoid sticking notes.
  rawEvents.sort((a, b) => {
    if (Math.abs(a.absoluteBeat - b.absoluteBeat) < 0.001) {
      if (a.type === 'note-off' && b.type === 'note-on') return -1;
      if (a.type === 'note-on' && b.type === 'note-off') return 1;
      return 0;
    }
    return a.absoluteBeat - b.absoluteBeat;
  });

  // 3. Compile MIDI Track Events
  const trackBytes: number[] = [];

  // Set Tempo Event: FF 51 03 tttttt (microseconds per beat)
  // Microseconds per quarter note = 60,000,000 / BPM
  const microsecondsPerBeat = Math.round(60000000 / bpm);
  trackBytes.push(...[0, 0xff, 0x51, 0x03]); // Delta-time 0, Meta-event type FF 51 (Tempo), length 03
  trackBytes.push((microsecondsPerBeat >> 16) & 0xff);
  trackBytes.push((microsecondsPerBeat >> 8) & 0xff);
  trackBytes.push(microsecondsPerBeat & 0xff);

  // Set Time Signature Event: FF 58 04 nn dd cc bb
  // nn = numerator (e.g. 4), dd = denominator power of 2 (e.g. 2 for 4/4 because 2^2 = 4), cc = clocks per click (24), bb = 32nd notes per 24 clocks (8)
  // Default to first measure signature
  const firstSig = measures[0]?.timeSignature || '4/4';
  const num = firstSig === '4/4' ? 4 : firstSig === '3/4' ? 3 : 2;
  const den = 2; // always 4 (2^2)
  trackBytes.push(...[0, 0xff, 0x58, 0x04, num, den, 24, 8]); // Delta-time 0, Time Signature

  // Track notes playback
  let previousBeat = 0;

  rawEvents.forEach((event) => {
    const deltaBeats = event.absoluteBeat - previousBeat;
    const deltaTicks = Math.round(deltaBeats * ticksPerBeat);
    previousBeat = event.absoluteBeat;

    // Add variable-length delta time
    trackBytes.push(...toVLQ(deltaTicks));

    if (event.type === 'note-on') {
      // Note On: 0x90 + pitch + velocity (96)
      trackBytes.push(0x90, event.pitch, 0x60);
    } else {
      // Note Off: 0x80 + pitch + velocity (0)
      trackBytes.push(0x80, event.pitch, 0x00);
    }
  });

  // End of Track Meta Event: FF 2F 00 (preceded by delta-time 0)
  trackBytes.push(...[0, 0xff, 0x2f, 0x00]);

  // 4. Construct Header Chunk
  const headerBytes: number[] = [];
  // 'MThd' ASCII
  headerBytes.push(0x4d, 0x54, 0x68, 0x64);
  // Header length: 6 bytes (00 00 00 06)
  headerBytes.push(...to32BitBytes(6));
  // Format: 0 (single multi-channel track)
  headerBytes.push(...to16BitBytes(0));
  // Number of tracks: 1
  headerBytes.push(...to16BitBytes(1));
  // Division (ticks per quarter note)
  headerBytes.push(...to16BitBytes(ticksPerBeat));

  // 5. Construct Track Chunk
  const finalTrackBytes: number[] = [];
  // 'MTrk' ASCII
  finalTrackBytes.push(0x4d, 0x54, 0x72, 0x6b);
  // Length of track events
  finalTrackBytes.push(...to32BitBytes(trackBytes.length));
  // Concat track bytes
  finalTrackBytes.push(...trackBytes);

  // Combine into final byte array
  const fileBytes = new Uint8Array([...headerBytes, ...finalTrackBytes]);
  return new Blob([fileBytes], { type: 'audio/midi' });
}
