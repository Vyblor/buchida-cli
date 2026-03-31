import { BuchidaApiError } from "./client.js";
import { printError } from "./output.js";

/**
 * Wrap a command handler with consistent error handling.
 */
// biome-ignore lint/suspicious/noExplicitAny: Commander passes varied argument types
export function withErrorHandler<T extends (...args: any[]) => Promise<void>>(fn: T): T {
	// biome-ignore lint/suspicious/noExplicitAny: Commander passes varied argument types
	return (async (...args: any[]) => {
		try {
			await fn(...args);
		} catch (err) {
			const json =
				args.length > 0 &&
				typeof args[args.length - 1] === "object" &&
				args[args.length - 1] !== null &&
				"json" in (args[args.length - 1] as Record<string, unknown>);

			const useJson = json && (args[args.length - 1] as Record<string, boolean>).json === true;

			if (err instanceof BuchidaApiError) {
				if (useJson) {
					console.error(
						JSON.stringify({
							error: err.message,
							status: err.status,
							code: err.code,
						}),
					);
				} else {
					printError(err.message);
					if (err.status === 401) {
						console.error("  Run `buchida login` or set NSEND_API_KEY to authenticate.");
					}
				}
				process.exit(1);
			}

			if (err instanceof Error) {
				printError(err.message, useJson ?? false);
			} else {
				printError("An unexpected error occurred", useJson ?? false);
			}
			process.exit(1);
		}
	}) as T;
}
