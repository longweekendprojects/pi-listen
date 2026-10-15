import { describe, expect, test } from "bun:test";
import { buildDeepgramWsUrl, fluxModelForLanguage } from "../extensions/voice/deepgram";

const url = (language: string) => new URL(buildDeepgramWsUrl({ language } as any));

describe("Deepgram model routing", () => {
	test("English streams on Flux", () => {
		const u = url("en-US");
		expect(u.pathname).toBe("/v2/listen");
		expect(u.searchParams.get("model")).toBe("flux-general-en");
	});
	test("Flux multi languages pass a language hint", () => {
		const u = url("pt-BR");
		expect(u.searchParams.get("model")).toBe("flux-general-multi");
		expect(u.searchParams.get("language_hint")).toBe("pt");
	});
	test("Other languages use Nova-3, including Chinese", () => {
		for (const lang of ["zh", "zh-HK", "ko", "ar"]) {
			const u = url(lang);
			expect(u.pathname).toBe("/v1/listen");
			expect(u.searchParams.get("model")).toBe("nova-3");
		}
		expect(fluxModelForLanguage("ko")).toBeNull();
	});
});
