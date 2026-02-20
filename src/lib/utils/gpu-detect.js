/**
 * gpu-detect.js — Détection du GPU et configuration qualité adaptative.
 *
 * Utilise detect-gpu (pmndrs) pour classifier le GPU en tier (0-3).
 * Chaque tier détermine la qualité du rendu Three.js :
 *   - Tier 0 : fallback 2D (pas de WebGL)
 *   - Tier 1 : 3D minimale (DPR 1, pas d'antialias)
 *   - Tier 2 : 3D complète (DPR adapté, pas d'effets)
 *   - Tier 3 : 3D + effets (antialias, shadows, post-processing)
 */

import { getGPUTier } from 'detect-gpu';

/** Configurations qualité par tier GPU */
const QUALITY_CONFIGS = {
  0: {
    mode: 'fallback-2d',
    dpr: 1,
    antialias: false,
    shadows: false,
    postProcessing: false,
    particles: false,
  },
  1: {
    mode: '3d-low',
    dpr: 1,
    antialias: false,
    shadows: false,
    postProcessing: false,
    particles: false,
  },
  2: {
    mode: '3d-medium',
    dpr: 1.5,
    antialias: false,
    shadows: false,
    postProcessing: false,
    particles: false,
  },
  3: {
    mode: '3d-high',
    dpr: 2,
    antialias: true,
    shadows: true,
    postProcessing: true,
    particles: true,
  },
};

/** Résultat mis en cache après la première détection */
let cachedResult = null;

/**
 * Détecte le tier GPU et retourne la configuration qualité adaptée.
 * Le DPR est borné selon le type d'appareil (mobile: max 1.5, desktop: max 2).
 *
 * @returns {Promise<{ tier: number, isMobile: boolean, gpu: string, config: object }>}
 */
export async function getQualityConfig() {
  if (cachedResult) return cachedResult;

  try {
    const gpuTier = await getGPUTier();
    const tier = gpuTier.tier ?? 1;
    const isMobile = gpuTier.isMobile ?? false;
    const config = { ...(QUALITY_CONFIGS[tier] ?? QUALITY_CONFIGS[1]) };

    // Borner le DPR selon l'appareil et le devicePixelRatio réel
    const maxDpr = isMobile ? 1.5 : 2;
    config.dpr = Math.min(config.dpr, window.devicePixelRatio, maxDpr);

    cachedResult = {
      tier,
      isMobile,
      gpu: gpuTier.gpu ?? 'unknown',
      config,
    };
  } catch {
    // En cas d'erreur, fallback sur tier 1 (3D minimale)
    cachedResult = {
      tier: 1,
      isMobile: /Mobi|Android/i.test(navigator.userAgent),
      gpu: 'detection-failed',
      config: { ...QUALITY_CONFIGS[1] },
    };
  }

  return cachedResult;
}
