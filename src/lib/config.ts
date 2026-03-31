import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { API_KEY_ENV, API_URL_ENV, CONFIG_DIR, CONFIG_FILE, DEFAULT_API_URL } from "./constants.js";

export interface BuchidaConfig {
	apiKey?: string;
	apiUrl?: string;
	teamId?: string;
	lastUpdateCheck?: number;
}

function getConfigDir(): string {
	return join(homedir(), CONFIG_DIR);
}

function getConfigPath(): string {
	return join(getConfigDir(), CONFIG_FILE);
}

export function loadConfig(): BuchidaConfig {
	const configPath = getConfigPath();
	if (!existsSync(configPath)) {
		return {};
	}
	try {
		const raw = readFileSync(configPath, "utf-8");
		return JSON.parse(raw) as BuchidaConfig;
	} catch {
		return {};
	}
}

export function saveConfig(config: BuchidaConfig): void {
	const dir = getConfigDir();
	if (!existsSync(dir)) {
		mkdirSync(dir, { recursive: true });
	}
	writeFileSync(getConfigPath(), JSON.stringify(config, null, "\t"), "utf-8");
}

export function clearConfig(): void {
	const configPath = getConfigPath();
	if (existsSync(configPath)) {
		writeFileSync(configPath, "{}", "utf-8");
	}
}

/**
 * Resolve API key with precedence:
 * 1. --api-key flag (explicit)
 * 2. NSEND_API_KEY env var
 * 3. Config file (~/.buchida/config.json)
 */
export function resolveApiKey(flagValue?: string): string | undefined {
	if (flagValue) return flagValue;
	const envKey = process.env[API_KEY_ENV];
	if (envKey) return envKey;
	const config = loadConfig();
	return config.apiKey;
}

/**
 * Resolve API base URL with precedence:
 * 1. BUCHIDA_API_URL env var
 * 2. Config file
 * 3. Default (https://api.buchida.com)
 */
export function resolveApiUrl(): string {
	const envUrl = process.env[API_URL_ENV];
	if (envUrl) return envUrl;
	const config = loadConfig();
	return config.apiUrl ?? DEFAULT_API_URL;
}
