import pkg from "../../package.json" with { type: "json" };
import { resolveApiKey, resolveApiUrl } from "./config.js";

export interface ApiError {
	status: number;
	message: string;
	code?: string;
	hint?: string;
}

export class BuchidaApiError extends Error {
	status: number;
	code?: string;
	hint?: string;

	constructor(error: ApiError) {
		super(error.message);
		this.name = "BuchidaApiError";
		this.status = error.status;
		this.code = error.code;
		this.hint = error.hint;
	}
}

/**
 * Map domain-related API error codes to actionable CLI hints.
 * Returns a hint string if the code is recognized, undefined otherwise.
 */
export function getDomainErrorHint(code: string | undefined): string | undefined {
	if (code === "domain_not_registered") {
		return "Run `buchida domains list` to see your verified domains, or add one at https://buchida.com/dashboard/domains";
	}
	if (code === "domain_not_verified") {
		return "Complete DNS verification at https://buchida.com/dashboard/domains";
	}
	return undefined;
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
		"User-Agent": `buchida-cli/${pkg.version}`,
	};

	const response = await fetch(url, {
		method,
		headers,
		body: body ? JSON.stringify(body) : undefined,
	});

	if (!response.ok) {
		let errorBody: {
			message?: string;
			code?: string;
			error?: { message?: string; code?: string };
		} = {};
		try {
			errorBody = (await response.json()) as {
				message?: string;
				code?: string;
				error?: { message?: string; code?: string };
			};
		} catch {
			// ignore parse errors
		}
		// Support both flat { message, code } and nested { error: { message, code } } shapes
		const code = errorBody.code ?? errorBody.error?.code;
		const message =
			errorBody.message ??
			errorBody.error?.message ??
			`API request failed with status ${response.status}`;
		const hint = getDomainErrorHint(code);
		throw new BuchidaApiError({ status: response.status, message, code, hint });
	}

	if (response.status === 204) {
		return undefined as T;
	}

	return response.json() as Promise<T>;
}
