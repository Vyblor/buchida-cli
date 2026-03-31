import { createServer } from "node:http";
import type { Command } from "commander";
import { withErrorHandler } from "../lib/errors.js";
import { printInfo, printSuccess } from "../lib/output.js";

interface DevOptions {
	port?: string;
}

const PREVIEW_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>buchida — Email Preview</title>
	<style>
		* { margin: 0; padding: 0; box-sizing: border-box; }
		body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0a0a0a; color: #fafafa; }
		header { padding: 1rem 2rem; border-bottom: 1px solid #222; display: flex; align-items: center; gap: 1rem; }
		header h1 { font-size: 1.2rem; font-weight: 600; }
		header span { color: #666; font-size: 0.85rem; }
		main { max-width: 800px; margin: 2rem auto; padding: 0 2rem; }
		.card { background: #111; border: 1px solid #222; border-radius: 8px; padding: 2rem; margin-bottom: 1.5rem; }
		.card h2 { font-size: 1rem; margin-bottom: 1rem; color: #aaa; }
		.card p { color: #666; line-height: 1.6; }
		code { background: #1a1a1a; padding: 0.15rem 0.4rem; border-radius: 4px; font-size: 0.9em; }
		.status { display: inline-block; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.8rem; background: #1a3a1a; color: #4ade80; }
	</style>
</head>
<body>
	<header>
		<h1>buchida</h1>
		<span>Email Preview Server</span>
		<span class="status">Running</span>
	</header>
	<main>
		<div class="card">
			<h2>Email Preview</h2>
			<p>Send emails to this server to preview them here.</p>
			<p style="margin-top: 1rem;">
				<code>buchida send --to preview@localhost:3333 --subject "Test" --html "&lt;h1&gt;Hello&lt;/h1&gt;"</code>
			</p>
		</div>
		<div class="card">
			<h2>Getting Started</h2>
			<p>This preview server captures emails sent through the buchida CLI and displays them for local development.</p>
		</div>
	</main>
</body>
</html>`;

export function registerDevCommand(program: Command): void {
	program
		.command("dev")
		.description("Start local email preview server")
		.option("--port <port>", "Port to listen on", "3333")
		.action(
			withErrorHandler(async (options: DevOptions) => {
				const port = Number.parseInt(options.port ?? "3333", 10);

				const server = createServer((req, res) => {
					if (req.method === "GET") {
						res.writeHead(200, { "Content-Type": "text/html" });
						res.end(PREVIEW_HTML);
						return;
					}

					if (req.method === "POST" && req.url === "/v1/emails") {
						let body = "";
						req.on("data", (chunk) => {
							body += chunk;
						});
						req.on("end", () => {
							try {
								const email = JSON.parse(body);
								console.log("\n\x1b[36m── New Email ──\x1b[0m");
								console.log(`  From:    ${email.from ?? "—"}`);
								console.log(
									`  To:      ${Array.isArray(email.to) ? email.to.join(", ") : (email.to ?? "—")}`,
								);
								console.log(`  Subject: ${email.subject ?? "—"}`);
								console.log(`  Body:    ${(email.text ?? email.html ?? "").slice(0, 100)}`);

								res.writeHead(200, { "Content-Type": "application/json" });
								res.end(
									JSON.stringify({
										id: `dev_${Date.now()}`,
										status: "previewed",
									}),
								);
							} catch {
								res.writeHead(400, { "Content-Type": "application/json" });
								res.end(JSON.stringify({ error: "Invalid JSON" }));
							}
						});
						return;
					}

					res.writeHead(404);
					res.end("Not found");
				});

				server.listen(port, () => {
					printSuccess(`Preview server running on http://localhost:${port}`);
					printInfo("Press Ctrl+C to stop");
				});
			}),
		);
}
