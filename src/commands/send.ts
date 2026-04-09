import type { Command } from "commander";
import { apiRequest } from "../lib/client.js";
import { withErrorHandler } from "../lib/errors.js";
import { isTTY, printJson, printSuccess } from "../lib/output.js";

interface SendOptions {
	from?: string;
	to?: string;
	subject?: string;
	html?: string;
	text?: string;
	replyTo?: string;
	json?: boolean;
	apiKey?: string;
}

interface SendResponse {
	data: {
		id: string;
		from: string;
		to: string[];
	};
	id?: string; // backward compat
	from?: string;
	to?: string[];
	subject: string;
	status: string;
}

export function registerSendCommand(program: Command): void {
	program
		.command("send")
		.description("Send an email")
		.option("--from <address>", "Sender email address")
		.option("--to <address>", "Recipient email address (comma-separated for multiple)")
		.option("--subject <subject>", "Email subject line")
		.option("--html <html>", "HTML body")
		.option("--text <text>", "Plain text body")
		.option("--reply-to <address>", "Reply-to address")
		.option("--json", "Output as JSON")
		.option("--api-key <key>", "API key to use")
		.action(
			withErrorHandler(async (options: SendOptions) => {
				let { from, to, subject, html, text } = options;

				// Interactive mode if missing required fields and TTY
				if ((!from || !to || !subject || (!html && !text)) && isTTY()) {
					const clack = await import("@clack/prompts");

					clack.intro("buchida send");

					if (!from) {
						const result = await clack.text({
							message: "From address:",
							placeholder: "you@yourdomain.com",
							validate: (v) => (!v.includes("@") ? "Must be a valid email" : undefined),
						});
						if (clack.isCancel(result)) {
							clack.cancel("Send cancelled.");
							process.exit(0);
						}
						from = result as string;
					}

					if (!to) {
						const result = await clack.text({
							message: "To address:",
							placeholder: "recipient@example.com",
							validate: (v) => (!v.includes("@") ? "Must be a valid email" : undefined),
						});
						if (clack.isCancel(result)) {
							clack.cancel("Send cancelled.");
							process.exit(0);
						}
						to = result as string;
					}

					if (!subject) {
						const result = await clack.text({
							message: "Subject:",
							placeholder: "Hello from buchida",
						});
						if (clack.isCancel(result)) {
							clack.cancel("Send cancelled.");
							process.exit(0);
						}
						subject = result as string;
					}

					if (!html && !text) {
						const bodyType = await clack.select({
							message: "Body type:",
							options: [
								{ value: "text", label: "Plain text" },
								{ value: "html", label: "HTML" },
							],
						});
						if (clack.isCancel(bodyType)) {
							clack.cancel("Send cancelled.");
							process.exit(0);
						}

						const body = await clack.text({
							message: bodyType === "html" ? "HTML body:" : "Text body:",
							placeholder: "Your message here...",
						});
						if (clack.isCancel(body)) {
							clack.cancel("Send cancelled.");
							process.exit(0);
						}

						if (bodyType === "html") {
							html = body as string;
						} else {
							text = body as string;
						}
					}
				}

				// Validate required fields
				if (!from || !to || !subject) {
					throw new Error(
						"Missing required fields. Provide --from, --to, and --subject, or run interactively.",
					);
				}
				if (!html && !text) {
					throw new Error("Provide --html or --text body content.");
				}

				const toAddresses = to.split(",").map((a) => a.trim());

				const result = await apiRequest<SendResponse>("/v1/emails", {
					method: "POST",
					apiKey: options.apiKey,
					body: {
						from,
						to: toAddresses,
						subject,
						html,
						text,
						reply_to: options.replyTo,
					},
				});

				if (options.json) {
					printJson(result);
				} else {
					printSuccess(`Email sent! ID: ${result.data?.id ?? result.id}`);
				}
			}),
		);
}
