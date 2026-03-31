import type { Command } from "commander";
import { BINARY_NAME } from "../lib/constants.js";

const BASH_COMPLETION = `# buchida bash completion
_buchida_completions() {
	local cur prev commands
	COMPREPLY=()
	cur="\${COMP_WORDS[COMP_CWORD]}"
	prev="\${COMP_WORDS[COMP_CWORD-1]}"
	commands="login logout whoami send emails domains api-keys webhooks templates broadcasts metrics init dev completions"

	case "\${prev}" in
		emails)
			COMPREPLY=( $(compgen -W "list get" -- "\${cur}") )
			return 0
			;;
		domains)
			COMPREPLY=( $(compgen -W "list add verify" -- "\${cur}") )
			return 0
			;;
		api-keys)
			COMPREPLY=( $(compgen -W "list create delete" -- "\${cur}") )
			return 0
			;;
		webhooks)
			COMPREPLY=( $(compgen -W "list create delete" -- "\${cur}") )
			return 0
			;;
		templates)
			COMPREPLY=( $(compgen -W "list get" -- "\${cur}") )
			return 0
			;;
		broadcasts)
			COMPREPLY=( $(compgen -W "list create send" -- "\${cur}") )
			return 0
			;;
		completions)
			COMPREPLY=( $(compgen -W "bash zsh fish" -- "\${cur}") )
			return 0
			;;
	esac

	COMPREPLY=( $(compgen -W "\${commands}" -- "\${cur}") )
	return 0
}
complete -F _buchida_completions ${BINARY_NAME}
`;

const ZSH_COMPLETION = `#compdef ${BINARY_NAME}

_buchida() {
	local -a commands
	commands=(
		'login:Authenticate with buchida'
		'logout:Clear stored credentials'
		'whoami:Show current user info'
		'send:Send an email'
		'emails:Manage sent emails'
		'domains:Manage email domains'
		'api-keys:Manage API keys'
		'webhooks:Manage webhooks'
		'templates:Manage email templates'
		'broadcasts:Manage broadcast emails'
		'metrics:Show sending metrics'
		'init:Initialize buchida in project'
		'dev:Start local preview server'
		'completions:Generate shell completions'
	)

	_arguments -C \\
		'--json[Output as JSON]' \\
		'--api-key[API key to use]:key' \\
		'--version[Show version]' \\
		'--help[Show help]' \\
		'1:command:->command' \\
		'*::arg:->args'

	case $state in
		command)
			_describe 'command' commands
			;;
	esac
}

_buchida
`;

const FISH_COMPLETION = `# buchida fish completion
complete -c ${BINARY_NAME} -n "__fish_use_subcommand" -a "login" -d "Authenticate with buchida"
complete -c ${BINARY_NAME} -n "__fish_use_subcommand" -a "logout" -d "Clear stored credentials"
complete -c ${BINARY_NAME} -n "__fish_use_subcommand" -a "whoami" -d "Show current user info"
complete -c ${BINARY_NAME} -n "__fish_use_subcommand" -a "send" -d "Send an email"
complete -c ${BINARY_NAME} -n "__fish_use_subcommand" -a "emails" -d "Manage sent emails"
complete -c ${BINARY_NAME} -n "__fish_use_subcommand" -a "domains" -d "Manage email domains"
complete -c ${BINARY_NAME} -n "__fish_use_subcommand" -a "api-keys" -d "Manage API keys"
complete -c ${BINARY_NAME} -n "__fish_use_subcommand" -a "webhooks" -d "Manage webhooks"
complete -c ${BINARY_NAME} -n "__fish_use_subcommand" -a "templates" -d "Manage templates"
complete -c ${BINARY_NAME} -n "__fish_use_subcommand" -a "broadcasts" -d "Manage broadcasts"
complete -c ${BINARY_NAME} -n "__fish_use_subcommand" -a "metrics" -d "Show metrics"
complete -c ${BINARY_NAME} -n "__fish_use_subcommand" -a "init" -d "Initialize project"
complete -c ${BINARY_NAME} -n "__fish_use_subcommand" -a "dev" -d "Start preview server"
complete -c ${BINARY_NAME} -n "__fish_use_subcommand" -a "completions" -d "Shell completions"

complete -c ${BINARY_NAME} -n "__fish_seen_subcommand_from emails" -a "list get"
complete -c ${BINARY_NAME} -n "__fish_seen_subcommand_from domains" -a "list add verify"
complete -c ${BINARY_NAME} -n "__fish_seen_subcommand_from api-keys" -a "list create delete"
complete -c ${BINARY_NAME} -n "__fish_seen_subcommand_from webhooks" -a "list create delete"
complete -c ${BINARY_NAME} -n "__fish_seen_subcommand_from templates" -a "list get"
complete -c ${BINARY_NAME} -n "__fish_seen_subcommand_from broadcasts" -a "list create send"

complete -c ${BINARY_NAME} -l json -d "Output as JSON"
complete -c ${BINARY_NAME} -l api-key -d "API key to use" -r
`;

export function registerCompletionsCommand(program: Command): void {
	const completions = program
		.command("completions")
		.description("Generate shell completion scripts");

	completions
		.command("bash")
		.description("Generate bash completions")
		.action(() => {
			console.log(BASH_COMPLETION);
		});

	completions
		.command("zsh")
		.description("Generate zsh completions")
		.action(() => {
			console.log(ZSH_COMPLETION);
		});

	completions
		.command("fish")
		.description("Generate fish completions")
		.action(() => {
			console.log(FISH_COMPLETION);
		});
}
