/** @format */

module.exports = {
	root: true,
	parser: "@typescript-eslint/parser",
	plugins: ["@typescript-eslint", "import", "eslint-comments"],
	extends: [
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended",
		"plugin:import/recommended",
		"plugin:import/typescript",
		"plugin:eslint-comments/recommended",
		"prettier",
		"eslint-plugin-tsdoc"
	],
	rules: {
		"tsdoc/syntax": "warn"
	}
}
