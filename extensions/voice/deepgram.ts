/**
 * Deepgram API helpers — URL building and constants.
 * Extracted for testability.
 */

import type { VoiceConfig } from "./config";
import { modelForLanguage } from "./onboarding";

export const DEEPGRAM_WS_URL = "wss://api.deepgram.com/v1/listen";
export const SAMPLE_RATE = 16000;
export const CHANNELS = 1;
export const ENCODING = "linear16";

export const DEEPGRAM_FLUX_WS_URL = "wss://api.deepgram.com/v2/listen";
/** Languages covered by flux-general-multi (Deepgram docs, 2026). */
export const FLUX_MULTI_LANGUAGES = ["es", "fr", "de", "hi", "ru", "pt", "ja", "it", "nl"];

/** Flux model for a language, or null when only Nova-3 covers it. */
export function fluxModelForLanguage(language: string): string | null {
	const base = language.toLowerCase().split("-")[0];
	if (base === "en") return "flux-general-en";
	return FLUX_MULTI_LANGUAGES.includes(base) ? "flux-general-multi" : null;
}

export function buildDeepgramWsUrl(config: VoiceConfig): string {
	const language = config.language || "en";
	const flux = fluxModelForLanguage(language);
	if (flux) {
		const params = new URLSearchParams({ model: flux, encoding: ENCODING, sample_rate: String(SAMPLE_RATE) });
		if (flux === "flux-general-multi") params.set("language_hint", language.split("-")[0]);
		return `${DEEPGRAM_FLUX_WS_URL}?${params.toString()}`;
	}
	const model = modelForLanguage(language);
	const params = new URLSearchParams({
		encoding: ENCODING,
		sample_rate: String(SAMPLE_RATE),
		channels: String(CHANNELS),
		endpointing: "200",
		utterance_end_ms: "1000",
		language,
		model,
		smart_format: "true",
		interim_results: "true",
	});
	return `${DEEPGRAM_WS_URL}?${params.toString()}`;
}

export function resolveDeepgramApiKey(config: VoiceConfig): string | null {
	return process.env.DEEPGRAM_API_KEY || config.deepgramApiKey || null;
}
