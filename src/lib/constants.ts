export const DEFAULT_API_URL = "https://api.buchida.com";
export const CONFIG_DIR = ".buchida";
export const CONFIG_FILE = "config.json";
export const PACKAGE_NAME = "buchida-cli";
export const BINARY_NAME = "buchida";

export const API_KEY_ENV = "BUCHIDA_API_KEY";
export const API_URL_ENV = "BUCHIDA_API_URL";

export const API_KEY_PREFIX = {
	live: "bc_live_",
	test: "bc_test_",
	cli: "bc_cli_",
} as const;
