import type { Command } from "commander";

/**
 * Options declared on both the root program and its subcommands (e.g. `--json`, `--api-key`)
 * are consumed by the root parser wherever they appear on the command line, so the
 * subcommand's own copy stays undefined. Before running any action, copy the root
 * value onto the executing command so `buchida emails list --json` and
 * `buchida --json emails list` behave identically.
 */
export const GLOBAL_OPTION_KEYS = ["json", "apiKey"] as const;

export function applyGlobalOptions(program: Command): void {
	program.hook("preAction", (_thisCommand, actionCommand) => {
		const globals = program.opts();
		for (const key of GLOBAL_OPTION_KEYS) {
			const value = globals[key];
			if (value !== undefined && actionCommand.getOptionValue(key) === undefined) {
				actionCommand.setOptionValue(key, value);
			}
		}
	});
}
