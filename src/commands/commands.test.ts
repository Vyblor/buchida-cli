import { Command } from "commander";
import { describe, expect, it } from "vitest";
import { registerApiKeysCommand } from "./api-keys.js";
import { registerAuthCommands } from "./auth.js";
import { registerBroadcastsCommand } from "./broadcasts.js";
import { registerCompletionsCommand } from "./completions.js";
import { registerDevCommand } from "./dev.js";
import { registerDomainsCommand } from "./domains.js";
import { registerEmailsCommand } from "./emails.js";
import { registerInitCommand } from "./init.js";
import { registerMetricsCommand } from "./metrics.js";
import { registerSendCommand } from "./send.js";
import { registerTemplatesCommand } from "./templates.js";
import { registerWebhooksCommand } from "./webhooks.js";

function createProgram(): Command {
	const program = new Command();
	program.exitOverride(); // Prevent process.exit in tests
	return program;
}

describe("command registration", () => {
	it("registers auth commands (login, logout, whoami)", () => {
		const program = createProgram();
		registerAuthCommands(program);
		const commands = program.commands.map((c) => c.name());
		expect(commands).toContain("login");
		expect(commands).toContain("logout");
		expect(commands).toContain("whoami");
	});

	it("registers send command", () => {
		const program = createProgram();
		registerSendCommand(program);
		expect(program.commands.map((c) => c.name())).toContain("send");
	});

	it("registers emails command with subcommands", () => {
		const program = createProgram();
		registerEmailsCommand(program);
		const emails = program.commands.find((c) => c.name() === "emails");
		expect(emails).toBeDefined();
		const subs = emails?.commands.map((c) => c.name());
		expect(subs).toContain("list");
		expect(subs).toContain("get");
	});

	it("registers domains command with subcommands", () => {
		const program = createProgram();
		registerDomainsCommand(program);
		const domains = program.commands.find((c) => c.name() === "domains");
		expect(domains).toBeDefined();
		const subs = domains?.commands.map((c) => c.name());
		expect(subs).toContain("list");
		expect(subs).toContain("add");
		expect(subs).toContain("verify");
	});

	it("registers api-keys command with subcommands", () => {
		const program = createProgram();
		registerApiKeysCommand(program);
		const keys = program.commands.find((c) => c.name() === "api-keys");
		expect(keys).toBeDefined();
		const subs = keys?.commands.map((c) => c.name());
		expect(subs).toContain("list");
		expect(subs).toContain("create");
		expect(subs).toContain("delete");
	});

	it("registers webhooks command with subcommands", () => {
		const program = createProgram();
		registerWebhooksCommand(program);
		const webhooks = program.commands.find((c) => c.name() === "webhooks");
		expect(webhooks).toBeDefined();
		const subs = webhooks?.commands.map((c) => c.name());
		expect(subs).toContain("list");
		expect(subs).toContain("create");
		expect(subs).toContain("delete");
	});

	it("registers templates command with subcommands", () => {
		const program = createProgram();
		registerTemplatesCommand(program);
		const templates = program.commands.find((c) => c.name() === "templates");
		expect(templates).toBeDefined();
		const subs = templates?.commands.map((c) => c.name());
		expect(subs).toContain("list");
		expect(subs).toContain("get");
	});

	it("registers broadcasts command with subcommands", () => {
		const program = createProgram();
		registerBroadcastsCommand(program);
		const broadcasts = program.commands.find((c) => c.name() === "broadcasts");
		expect(broadcasts).toBeDefined();
		const subs = broadcasts?.commands.map((c) => c.name());
		expect(subs).toContain("list");
		expect(subs).toContain("create");
		expect(subs).toContain("send");
	});

	it("registers metrics command", () => {
		const program = createProgram();
		registerMetricsCommand(program);
		expect(program.commands.map((c) => c.name())).toContain("metrics");
	});

	it("registers init command", () => {
		const program = createProgram();
		registerInitCommand(program);
		expect(program.commands.map((c) => c.name())).toContain("init");
	});

	it("registers dev command", () => {
		const program = createProgram();
		registerDevCommand(program);
		expect(program.commands.map((c) => c.name())).toContain("dev");
	});

	it("registers completions command with shell subcommands", () => {
		const program = createProgram();
		registerCompletionsCommand(program);
		const completions = program.commands.find((c) => c.name() === "completions");
		expect(completions).toBeDefined();
		const subs = completions?.commands.map((c) => c.name());
		expect(subs).toContain("bash");
		expect(subs).toContain("zsh");
		expect(subs).toContain("fish");
	});
});

describe("command options", () => {
	it("send command has required options", () => {
		const program = createProgram();
		registerSendCommand(program);
		const send = program.commands.find((c) => c.name() === "send");
		expect(send).toBeDefined();
		const optionNames = send?.options.map((o) => o.long);
		expect(optionNames).toContain("--from");
		expect(optionNames).toContain("--to");
		expect(optionNames).toContain("--subject");
		expect(optionNames).toContain("--html");
		expect(optionNames).toContain("--text");
		expect(optionNames).toContain("--json");
		expect(optionNames).toContain("--api-key");
	});

	it("all list commands have --json flag", () => {
		const program = createProgram();
		registerEmailsCommand(program);
		registerDomainsCommand(program);
		registerApiKeysCommand(program);

		for (const parent of program.commands) {
			const list = parent.commands.find((c) => c.name() === "list");
			if (list) {
				const optionNames = list.options.map((o) => o.long);
				expect(optionNames).toContain("--json");
			}
		}
	});
});
