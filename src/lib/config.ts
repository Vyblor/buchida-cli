import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { API_KEY_ENV, API_URL_ENV, CONFIG_DIR, CONFIG_FILE, DEFAULT_API_URL } from "./constants.js";

export interface ProfileConfig {
	apiKey?: string;
	apiUrl?: string;
	teamId?: string;
}

export interface BuchidaConfig {
	apiKey?: string;
	apiUrl?: string;
	teamId?: string;
	lastUpdateCheck?: number;
	activeProfile?: string;
	profiles?: Record<string, ProfileConfig>;
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
 * Get the active profile's config merged with the base config.
 * If an active profile is set, its values override the base config.
 */
export function getActiveProfileConfig(): BuchidaConfig {
	const config = loadConfig();
	if (!config.activeProfile || !config.profiles?.[config.activeProfile]) {
		return config;
	}
	const profile = config.profiles[config.activeProfile];
	return {
		...config,
		apiKey: profile.apiKey ?? config.apiKey,
		apiUrl: profile.apiUrl ?? config.apiUrl,
		teamId: profile.teamId ?? config.teamId,
	};
}

/**
 * Save a named profile.
 */
export function saveProfile(name: string, profile: ProfileConfig): void {
	const config = loadConfig();
	if (!config.profiles) {
		config.profiles = {};
	}
	config.profiles[name] = profile;
	saveConfig(config);
}

/**
 * Switch the active profile.
 * Returns true if the profile exists and was activated.
 */
export function switchProfile(name: string): boolean {
	const config = loadConfig();
	if (!config.profiles?.[name]) {
		return false;
	}
	config.activeProfile = name;
	saveConfig(config);
	return true;
}

/**
 * List all available profiles with their active status.
 */
export function listProfiles(): { name: string; active: boolean; apiKey?: string; apiUrl?: string }[] {
	const config = loadConfig();
	const profiles = config.profiles ?? {};
	return Object.entries(profiles).map(([name, profile]) => ({
		name,
		active: config.activeProfile === name,
		apiKey: profile.apiKey,
		apiUrl: profile.apiUrl,
	}));
}

/**
 * Remove a named profile.
 * Returns true if the profile existed and was removed.
 */
export function removeProfile(name: string): boolean {
	const config = loadConfig();
	if (!config.profiles?.[name]) {
		return false;
	}
	delete config.profiles[name];
	if (config.activeProfile === name) {
		config.activeProfile = undefined;
	}
	saveConfig(config);
	return true;
}

/**
 * Resolve API key with precedence:
 * 1. --api-key flag (explicit)
 * 2. NSEND_API_KEY env var
 * 3. Active profile from config
 * 4. Config file (~/.buchida/config.json)
 */
export function resolveApiKey(flagValue?: string): string | undefined {
	if (flagValue) return flagValue;
	const envKey = process.env[API_KEY_ENV];
	if (envKey) return envKey;
	const config = getActiveProfileConfig();
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
