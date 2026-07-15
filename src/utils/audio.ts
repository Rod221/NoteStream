/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { STAFF_PITCHES, Note, Measure, Accidental } from '../types';

// Convert pitch step and accidental to frequency
export function getFrequency(step: number, accidental: Accidental): number {
  const pitchInfo = STAFF_PITCHES.find((p) => p.step === step);
  if (!pitchInfo) return 440;

  let midi = pitchInfo.midiBase;
  if (accidental === 'sharp') midi += 1;
  if (accidental === 'flat') midi -= 1;

  // Standard MIDI to frequency formula
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// Lazy-loaded AudioContext
let audioCtx: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Play a single note immediately for preview
export function playNotePreview(step: number, accidental: Accidental, duration: number, isRest: boolean) {
  if (isRest) return;
  
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator(); // Add second oscillator for warmth
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    const freq = getFrequency(step, accidental);
    
    // Synth sound styling: Triangle + Sine mix for warm electric piano feel
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, ctx.currentTime); // Octave above

    // Low pass filter to make it softer and warmer
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, ctx.currentTime);

    // Envelope
    const now = ctx.currentTime;
    const noteSeconds = duration * (60 / 120); // standard tempo 120 bpm preview
    
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.15, now + 0.01); // Quick attack
    gainNode.gain.exponentialRampToValueAtTime(0.08, now + 0.12); // Decay to sustain level
    gainNode.gain.setValueAtTime(0.08, now + noteSeconds - 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + noteSeconds); // Release

    // Connect nodes
    osc.connect(filter);
    osc2.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Play
    osc.start(now);
    osc2.start(now);
    osc.stop(now + noteSeconds);
    osc2.stop(now + noteSeconds);
  } catch (error) {
    console.warn('Audio context preview error:', error);
  }
}

// Song playback controller
export class SheetMusicPlayer {
  private ctx: AudioContext | null = null;
  private schedulerTimerId: number | null = null;
  private nextNoteTime = 0.0; // when the next note is due
  private currentMeasureIndex = 0;
  private currentBeat = 0.0; // beat within current measure
  private bpm = 120;
  private measures: Measure[] = [];
  
  // Callback when a note is triggered or playhead moves
  private onPlayheadUpdate: (measureIndex: number, beat: number) => void;
  private onPlaybackEnded: () => void;
  
  // Keep track of active oscillators to stop them if needed
  private activeSources: { osc1: OscillatorNode; osc2: OscillatorNode; gain: GainNode; stopTime: number }[] = [];

  constructor(
    onPlayheadUpdate: (measureIndex: number, beat: number) => void,
    onPlaybackEnded: () => void
  ) {
    this.onPlayheadUpdate = onPlayheadUpdate;
    this.onPlaybackEnded = onPlaybackEnded;
  }

  public start(measures: Measure[], bpm: number, startMeasure = 0, startBeat = 0.0) {
    this.stop();
    this.measures = measures;
    this.bpm = bpm;
    this.currentMeasureIndex = startMeasure;
    this.currentBeat = startBeat;

    try {
      this.ctx = getAudioContext();
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      this.nextNoteTime = this.ctx.currentTime + 0.05;
      
      // Start scheduling loop
      const lookahead = 25.0; // how frequently to call scheduler (in ms)
      this.schedulerTimerId = window.setInterval(() => this.scheduler(), lookahead);
    } catch (e) {
      console.error('Failed to start audio playback', e);
    }
  }

  public stop() {
    if (this.schedulerTimerId !== null) {
      clearInterval(this.schedulerTimerId);
      this.schedulerTimerId = null;
    }
    
    // Stop all active notes immediately
    this.activeSources.forEach((source) => {
      try {
        source.osc1.stop();
        source.osc2.stop();
      } catch (e) {}
    });
    this.activeSources = [];
    this.ctx = null;
  }

  private scheduler() {
    if (!this.ctx) return;

    const scheduleAheadTime = 0.1; // how far ahead to schedule audio (seconds)
    
    // While there are notes to play before our lookahead window
    while (this.nextNoteTime < this.ctx.currentTime + scheduleAheadTime) {
      this.schedulePlayheadStep(this.nextNoteTime);
      this.advancePlayhead();
    }
  }

  private schedulePlayheadStep(time: number) {
    if (!this.ctx || this.currentMeasureIndex >= this.measures.length) {
      this.stop();
      this.onPlaybackEnded();
      return;
    }

    const measure = this.measures[this.currentMeasureIndex];
    const beatDurationSeconds = 60.0 / this.bpm;

    // Find notes in this measure that start exactly at this beat offset (with slight rounding tolerance)
    const notesToPlay = measure.notes.filter(
      (note) => Math.abs(note.beatOffset - this.currentBeat) < 0.01
    );

    notesToPlay.forEach((note) => {
      if (note.isRest) return; // Silent rest

      try {
        const osc1 = this.ctx!.createOscillator();
        const osc2 = this.ctx!.createOscillator();
        const gainNode = this.ctx!.createGain();
        const filter = this.ctx!.createBiquadFilter();

        const freq = getFrequency(note.step, note.accidental);
        
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(freq, time);

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(freq * 2, time);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, time);

        const durationSeconds = note.duration * beatDurationSeconds;
        
        gainNode.gain.setValueAtTime(0, time);
        gainNode.gain.linearRampToValueAtTime(0.12, time + 0.015); // Attack
        gainNode.gain.exponentialRampToValueAtTime(0.06, time + 0.12); // Decay/Sustain
        gainNode.gain.setValueAtTime(0.06, time + durationSeconds - 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + durationSeconds); // Release

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.ctx!.destination);

        osc1.start(time);
        osc2.start(time);
        osc1.stop(time + durationSeconds);
        osc2.stop(time + durationSeconds);

        this.activeSources.push({
          osc1,
          osc2,
          gain: gainNode,
          stopTime: time + durationSeconds,
        });
      } catch (err) {
        console.warn('Error scheduling note:', err);
      }
    });

    // Notify React component of visual playhead position
    // We schedule the visual callback to trigger at the exact playback time
    const delayMs = Math.max(0, (time - this.ctx.currentTime) * 1000);
    const mIdx = this.currentMeasureIndex;
    const bPos = this.currentBeat;
    
    setTimeout(() => {
      if (this.schedulerTimerId !== null) {
        this.onPlayheadUpdate(mIdx, bPos);
      }
    }, delayMs);

    // Clean up expired sources
    const now = this.ctx.currentTime;
    this.activeSources = this.activeSources.filter((source) => source.stopTime > now);
  }

  private advancePlayhead() {
    if (this.currentMeasureIndex >= this.measures.length) return;

    const measure = this.measures[this.currentMeasureIndex];
    const beatsPerMeasure = measure.timeSignature === '4/4' ? 4 : measure.timeSignature === '3/4' ? 3 : 2;
    
    // We advance the playhead by the smallest note resolution (sixteenth notes = 0.25 beats)
    const stepSize = 0.25; 
    const secondsPerBeat = 60.0 / this.bpm;
    
    this.currentBeat += stepSize;
    
    // Check if we reached the end of the current measure
    if (this.currentBeat >= beatsPerMeasure) {
      this.currentBeat = 0.0;
      this.currentMeasureIndex++;
    }

    // Set scheduling time for next step
    this.nextNoteTime += stepSize * secondsPerBeat;
  }
}
