/**
 * generate-placeholder-audio.js — Génère des fichiers WAV placeholder par décennie.
 *
 * Chaque décennie a une signature sonore unique :
 * - 1960 : 220Hz sine wave (grave, atmosphère labo)
 * - 1970 : 330Hz square wave (terminal, hum électronique)
 * - 1980 : 440Hz + 554Hz alternés (8-bit chip-tune)
 * - 1990 : bruit blanc filtré (modem 56k)
 * - 2000 : 880Hz sine douce (minimaliste iPod)
 * - 2010 : 1046Hz ping court répété (notification)
 * - 2020 : sweep 200→2000Hz (IA futuriste)
 *
 * Usage : node tools/generate-placeholder-audio.js
 * Sortie : public/audio/ambiance-XXXX.wav (7 fichiers)
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '..', 'public', 'audio');

// Paramètres audio
const SAMPLE_RATE = 22050; // Qualité suffisante pour des placeholders
const DURATION = 5; // 5 secondes (boucle courte)
const NUM_SAMPLES = SAMPLE_RATE * DURATION;
const AMPLITUDE = 0.15; // Volume bas — ambiance subtile

/**
 * Écrit un fichier WAV 16-bit mono PCM.
 */
function writeWav(filepath, samples) {
  const numSamples = samples.length;
  const dataSize = numSamples * 2; // 16-bit = 2 octets par sample
  const fileSize = 44 + dataSize; // Header WAV = 44 octets

  const buffer = Buffer.alloc(fileSize);
  let offset = 0;

  // --- RIFF Header ---
  buffer.write('RIFF', offset); offset += 4;
  buffer.writeUInt32LE(fileSize - 8, offset); offset += 4;
  buffer.write('WAVE', offset); offset += 4;

  // --- fmt sub-chunk ---
  buffer.write('fmt ', offset); offset += 4;
  buffer.writeUInt32LE(16, offset); offset += 4; // Taille du sub-chunk
  buffer.writeUInt16LE(1, offset); offset += 2;  // PCM
  buffer.writeUInt16LE(1, offset); offset += 2;  // Mono
  buffer.writeUInt32LE(SAMPLE_RATE, offset); offset += 4;
  buffer.writeUInt32LE(SAMPLE_RATE * 2, offset); offset += 4; // Byte rate
  buffer.writeUInt16LE(2, offset); offset += 2;  // Block align
  buffer.writeUInt16LE(16, offset); offset += 2;  // Bits per sample

  // --- data sub-chunk ---
  buffer.write('data', offset); offset += 4;
  buffer.writeUInt32LE(dataSize, offset); offset += 4;

  // Écrire les samples (clamp à [-1, 1] puis conversion 16-bit)
  for (let i = 0; i < numSamples; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    const int16 = Math.round(clamped * 32767);
    buffer.writeInt16LE(int16, offset);
    offset += 2;
  }

  writeFileSync(filepath, buffer);
  const sizeKB = (fileSize / 1024).toFixed(1);
  console.log(`  ✓ ${filepath} (${sizeKB} KB)`);
}

// --- Générateurs par décennie ---

/** 1960 : Sine wave 220Hz — ton pur, atmosphère de laboratoire */
function generate1960() {
  const samples = new Float64Array(NUM_SAMPLES);
  for (let i = 0; i < NUM_SAMPLES; i++) {
    const t = i / SAMPLE_RATE;
    // Sine douce avec légère modulation d'amplitude (pulsation lente)
    const envelope = 0.7 + 0.3 * Math.sin(2 * Math.PI * 0.5 * t);
    samples[i] = AMPLITUDE * envelope * Math.sin(2 * Math.PI * 220 * t);
  }
  return samples;
}

/** 1970 : Square wave 330Hz — hum de terminal CRT */
function generate1970() {
  const samples = new Float64Array(NUM_SAMPLES);
  for (let i = 0; i < NUM_SAMPLES; i++) {
    const t = i / SAMPLE_RATE;
    // Square wave adoucie (pas de harmoniques brutes)
    const raw = Math.sin(2 * Math.PI * 330 * t);
    const square = raw > 0 ? 1 : -1;
    // Filtrage basique : moyenne mobile sur les 4 derniers samples
    samples[i] = AMPLITUDE * 0.6 * square;
    if (i >= 3) {
      samples[i] = (samples[i] + samples[i - 1] + samples[i - 2] + samples[i - 3]) / 4;
    }
  }
  return samples;
}

/** 1980 : Deux fréquences alternées — chip-tune 8-bit */
function generate1980() {
  const samples = new Float64Array(NUM_SAMPLES);
  const switchInterval = SAMPLE_RATE / 4; // Alterne toutes les 250ms
  for (let i = 0; i < NUM_SAMPLES; i++) {
    const t = i / SAMPLE_RATE;
    const useHigh = Math.floor(i / switchInterval) % 2 === 0;
    const freq = useHigh ? 554.37 : 440; // Do# et La
    // Square wave pour le son 8-bit
    const val = Math.sin(2 * Math.PI * freq * t) > 0 ? 1 : -1;
    samples[i] = AMPLITUDE * 0.5 * val;
  }
  return samples;
}

/** 1990 : Bruit blanc filtré — simulation modem 56k */
function generate1990() {
  const samples = new Float64Array(NUM_SAMPLES);
  // Bruit blanc avec filtre passe-bas simple (moyennage)
  const filterSize = 8;
  const rawNoise = new Float64Array(NUM_SAMPLES);
  for (let i = 0; i < NUM_SAMPLES; i++) {
    rawNoise[i] = (Math.random() * 2 - 1) * AMPLITUDE;
  }
  // Filtre passe-bas (moving average)
  for (let i = 0; i < NUM_SAMPLES; i++) {
    let sum = 0;
    const start = Math.max(0, i - filterSize);
    for (let j = start; j <= i; j++) {
      sum += rawNoise[j];
    }
    samples[i] = sum / (i - start + 1);

    // Modulation de volume pour simuler le handshake modem
    const t = i / SAMPLE_RATE;
    const modemEnvelope = 0.5 + 0.5 * Math.sin(2 * Math.PI * 2 * t);
    samples[i] *= modemEnvelope;
  }
  return samples;
}

/** 2000 : Sine 880Hz douce — minimalisme iPod */
function generate2000() {
  const samples = new Float64Array(NUM_SAMPLES);
  for (let i = 0; i < NUM_SAMPLES; i++) {
    const t = i / SAMPLE_RATE;
    // Sine pure, très douce, avec fade in/out naturel
    const envelope = Math.sin(Math.PI * t / DURATION); // Envelope en cloche
    samples[i] = AMPLITUDE * 0.5 * envelope * Math.sin(2 * Math.PI * 880 * t);
  }
  return samples;
}

/** 2010 : Ping 1046Hz court répété — notification iPhone */
function generate2010() {
  const samples = new Float64Array(NUM_SAMPLES);
  const pingDuration = 0.15; // 150ms par ping
  const pingInterval = 1.5; // Toutes les 1.5 secondes
  for (let i = 0; i < NUM_SAMPLES; i++) {
    const t = i / SAMPLE_RATE;
    const timeInCycle = t % pingInterval;
    if (timeInCycle < pingDuration) {
      // Ping actif — sine avec decay exponentiel
      const decay = Math.exp(-timeInCycle * 20);
      samples[i] = AMPLITUDE * decay * Math.sin(2 * Math.PI * 1046.5 * t);
    } else {
      samples[i] = 0;
    }
  }
  return samples;
}

/** 2020 : Sweep 200→2000Hz — ambiance IA futuriste */
function generate2020() {
  const samples = new Float64Array(NUM_SAMPLES);
  for (let i = 0; i < NUM_SAMPLES; i++) {
    const t = i / SAMPLE_RATE;
    // Fréquence qui monte linéairement de 200 à 2000 Hz sur la durée
    const progress = t / DURATION;
    const freq = 200 + (2000 - 200) * progress;
    // Phase intégrée pour un sweep propre
    const phase = 2 * Math.PI * (200 * t + 0.5 * (2000 - 200) * t * t / DURATION);
    // Légère modulation pour un effet « neural »
    const modulation = 1 + 0.3 * Math.sin(2 * Math.PI * 3 * t);
    samples[i] = AMPLITUDE * 0.7 * modulation * Math.sin(phase);
  }
  return samples;
}

// --- Main ---
console.log('Génération des fichiers audio placeholder...\n');
mkdirSync(OUTPUT_DIR, { recursive: true });

const decades = [
  { id: '1960', generator: generate1960, description: '220Hz sine (labo)' },
  { id: '1970', generator: generate1970, description: '330Hz square (terminal)' },
  { id: '1980', generator: generate1980, description: '440/554Hz alternés (8-bit)' },
  { id: '1990', generator: generate1990, description: 'bruit blanc filtré (modem)' },
  { id: '2000', generator: generate2000, description: '880Hz sine douce (iPod)' },
  { id: '2010', generator: generate2010, description: '1046Hz ping (notification)' },
  { id: '2020', generator: generate2020, description: 'sweep 200→2000Hz (IA)' },
];

for (const { id, generator, description } of decades) {
  console.log(`  ${id}: ${description}`);
  const samples = generator();
  const filepath = join(OUTPUT_DIR, `ambiance-${id}.wav`);
  writeWav(filepath, samples);
}

console.log('\n✓ 7 fichiers WAV générés dans public/audio/');
console.log('  Format : 16-bit PCM, 22050 Hz, mono, ~5 secondes');
console.log('  Taille : ~215 KB chacun');
