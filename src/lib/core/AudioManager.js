/**
 * AudioManager.js — Gestionnaire audio singleton.
 *
 * Gère les ambiances sonores par décennie avec Howler.js.
 * - Chargement lazy des fichiers audio (MP3 128kbps)
 * - Crossfade 500ms entre décennies au scroll
 * - Mute/unmute avec persistance en sessionStorage
 * - Écoute les événements decade:enter / audio:unlocked / audio:toggle
 *
 * L'expérience fonctionne sans son — l'audio est un bonus immersif.
 */

import { Howl, Howler } from 'howler';
import { DECADES } from '../config/decades.js';

/** Durée du crossfade en ms */
const CROSSFADE_DURATION = 500;

/** Clé sessionStorage pour l'état mute */
const STORAGE_KEY = 'alfred-audio-muted';

/** Volume par défaut des ambiances */
const DEFAULT_VOLUME = 0.4;

class AudioManager {
  constructor() {
    /** @type {Map<string, Howl>} Sons chargés par décennie */
    this._sounds = new Map();

    /** @type {string|null} Décennie actuellement en lecture */
    this._currentDecade = null;

    /** @type {boolean} Audio débloqué par interaction utilisateur ? */
    this._unlocked = false;

    /** @type {boolean} Son coupé ? */
    this._muted = this._loadMuteState();

    /** @type {boolean} Initialisé ? */
    this._initialized = false;

    // Construire la map des chemins audio depuis la config des décennies
    /** @type {Map<string, string>} Chemins audio par ID décennie */
    this._audioPaths = new Map();
    for (const decade of DECADES) {
      if (decade.audio) {
        this._audioPaths.set(decade.id, decade.audio);
      }
    }
  }

  /**
   * Initialise l'AudioManager : écoute les événements globaux.
   * Appelé une fois dans init.js.
   */
  init() {
    if (this._initialized) return;
    this._initialized = true;

    // Écouter le déblocage audio (CTA intro)
    window.addEventListener('audio:unlocked', () => {
      this._unlocked = true;
      // Si une décennie est déjà active, lancer la lecture
      if (this._currentDecade) {
        this._playDecade(this._currentDecade);
      }
    });

    // Écouter les changements de décennie
    window.addEventListener('decade:enter', (e) => {
      const { id } = e.detail;
      this._switchToDecade(id);
    });

    // Écouter le toggle mute depuis le bouton UI
    window.addEventListener('audio:toggle', () => {
      this.toggle();
    });

    // Appliquer l'état mute global via Howler
    Howler.mute(this._muted);
  }

  /**
   * Déblocage audio — appelé quand l'utilisateur interagit (CTA).
   * Résume l'AudioContext si Howler en a créé un.
   */
  unlock() {
    this._unlocked = true;

    // Howler gère son propre AudioContext, mais on le résume au cas où
    if (Howler.ctx && Howler.ctx.state === 'suspended') {
      Howler.ctx.resume();
    }
  }

  /**
   * Bascule mute/unmute.
   * @returns {boolean} Le nouvel état muted
   */
  toggle() {
    this._muted = !this._muted;
    Howler.mute(this._muted);
    this._saveMuteState();

    // Notifier l'UI du changement d'état
    window.dispatchEvent(
      new CustomEvent('audio:statechange', {
        detail: { muted: this._muted },
      })
    );

    return this._muted;
  }

  /**
   * @returns {boolean} L'audio est-il coupé ?
   */
  get muted() {
    return this._muted;
  }

  /**
   * Libère toutes les ressources audio.
   */
  dispose() {
    for (const [, sound] of this._sounds) {
      sound.unload();
    }
    this._sounds.clear();
    this._currentDecade = null;
    this._initialized = false;
  }

  // --- Méthodes privées ---

  /**
   * Passe à la décennie spécifiée avec crossfade.
   * @param {string} decadeId — ID de la décennie cible
   */
  _switchToDecade(decadeId) {
    // Même décennie → rien à faire
    if (this._currentDecade === decadeId) return;

    const previousDecade = this._currentDecade;
    this._currentDecade = decadeId;

    // Fade out la décennie précédente
    if (previousDecade) {
      this._fadeOutDecade(previousDecade);
    }

    // Lancer la nouvelle décennie (si audio débloqué)
    if (this._unlocked) {
      this._playDecade(decadeId);
    }
  }

  /**
   * Charge et lance la lecture de l'ambiance d'une décennie.
   * @param {string} decadeId — ID de la décennie
   */
  _playDecade(decadeId) {
    const sound = this._getOrLoadSound(decadeId);
    if (!sound) return;

    // Si déjà en lecture, ne pas relancer
    if (sound.playing()) return;

    // Démarrer avec volume à 0 puis fade in
    sound.volume(0);
    sound.play();
    sound.fade(0, DEFAULT_VOLUME, CROSSFADE_DURATION);
  }

  /**
   * Fade out puis stop l'ambiance d'une décennie.
   * @param {string} decadeId — ID de la décennie
   */
  _fadeOutDecade(decadeId) {
    const sound = this._sounds.get(decadeId);
    if (!sound || !sound.playing()) return;

    sound.fade(DEFAULT_VOLUME, 0, CROSSFADE_DURATION);

    // Arrêter le son après le fade out
    sound.once('fade', () => {
      sound.stop();
    });
  }

  /**
   * Récupère ou charge le Howl d'une décennie (lazy loading).
   * @param {string} decadeId — ID de la décennie
   * @returns {Howl|null} Instance Howl ou null si pas de chemin audio
   */
  _getOrLoadSound(decadeId) {
    // Déjà chargé ?
    if (this._sounds.has(decadeId)) {
      return this._sounds.get(decadeId);
    }

    // Chemin audio disponible ?
    const audioPath = this._audioPaths.get(decadeId);
    if (!audioPath) return null;

    // Créer et stocker le Howl (lazy loading)
    const sound = new Howl({
      src: [audioPath],
      loop: true,
      volume: DEFAULT_VOLUME,
      html5: true, // Streaming, pas de téléchargement complet avant lecture
      preload: true,
    });

    this._sounds.set(decadeId, sound);
    return sound;
  }

  /**
   * Charge l'état mute depuis sessionStorage.
   * @returns {boolean} true si muted, false par défaut
   */
  _loadMuteState() {
    try {
      return sessionStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      // sessionStorage non disponible (navigation privée, etc.)
      return false;
    }
  }

  /**
   * Sauvegarde l'état mute dans sessionStorage.
   */
  _saveMuteState() {
    try {
      sessionStorage.setItem(STORAGE_KEY, String(this._muted));
    } catch {
      // Silencieux si sessionStorage non disponible
    }
  }
}

/** Singleton exporté */
export const audioManager = new AudioManager();
