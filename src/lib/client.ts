import { resolveApiKey, resolveApiUrl } from "./config.js";

export interface ApiError {
	status: number;
	message: string;
	code?: string;
}

export class BuchidaApiError extends Error {
	status: number;
	code?: string;

	constructor(error: ApiError) {
		super(error.message);
		this.name = "BuchidaApiError";
		this.status = error.status;
		this.code = error.code;
	}
}

export interface RequestOptions {
	method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
	body?: unknown;
	apiKey?: string;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
	const { method = "GET", body, apiKey: explicitKey } = options;
	const apiKey = resolveApiKey(explicitKey);
	const baseUrl = resolveApiUrl();

	if (!apiKey) {
		throw new BuchidaApiError({
			status: 401,
			message: "No API key found. Run `buchida login` or set BUCHIDA_API_KEY environment variable.",
			code: "missing_api_key",
		});
	}

	const url = `${baseUrl}${path}`;
	const headers: Record<string, string> = {
		Authorization: `Bearer ${apiKey}`,
		"Content-Type": "application/json",
		"User-Agent": "buchida-cli/0.1.0",
	};

	const response = await fetch(url, {
		method,
		headers,
		body: body ? JSON.stringify(body) : undefined,
	});

	if (!response.ok) {
		let errorBody: { message?: string; code?: string } = {};
		try {
			errorBody = (await response.json()) as { message?: string; code?: string };
		} catch {
			// ignore parse errors
		}
		throw new BuchidaApiError({
			status: response.status,
			message: errorBody.message ?? `API request failed with status ${response.status}`,
			code: errorBody.code,
		});
	}

	if (response.status === 204) {
		return undefined as T;
	}

	return response.json() as Promise<T>;
}
