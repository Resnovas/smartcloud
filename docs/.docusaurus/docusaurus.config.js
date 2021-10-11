/** @format */

export default {
	title: "Action Masterminds",
	tagline: "Superpowered Github Actions",
	url: "https://videndum.github.io",
	baseUrl: "/action-masterminds/",
	onBrokenLinks: "throw",
	onBrokenMarkdownLinks: "warn",
	favicon: "img/favicon.ico",
	organizationName: "videndum",
	projectName: "action-masterminds",
	trailingSlash: false,
	i18n: {
		defaultLocale: "en",
		locales: ["en", "fr", "es"],
		localeConfigs: {}
	},
	plugins: [
		"@docusaurus/theme-live-codeblock",
		[
			"docusaurus-plugin-typedoc",
			{
				id: "release-mastermind",
				out: "release-mastermind",
				entryPoints: ["../packages/release-mastermind/src/index.ts"],
				tsconfig: "../packages/release-mastermind/tsconfig.json",
				sidebar: {
					categoryLabel: "rm"
				},
				excludePrivate: true,
				readme: "none"
			}
		],
		[
			"@docusaurus/plugin-content-blog",
			{
				id: "changelog",
				routeBasePath: "changelog",
				path: "./changelog",
				editLocalizedFiles: true
			}
		]
	],
	themeConfig: {
		liveCodeBlock: {
			playgroundPosition: "bottom"
		},
		navbar: {
			title: "Action Masterminds",
			logo: {
				alt: "Action Masterminds",
				src: "img/logo.svg"
			},
			items: [
				{
					to: "docs/getting-started",
					activeBasePath: "docs/getting-started",
					label: "Get Started",
					position: "left"
				},
				{
					to: "docs/release-mastermind",
					activeBasePath: "docs/release-mastermind",
					label: "Config Docs",
					position: "left"
				},
				{
					to: "blog",
					label: "Blog",
					position: "left"
				},
				{
					to: "changelog",
					label: "Changelog",
					position: "left"
				},
				{
					href: "https://github.com/videndum/action-masterminds",
					label: "GitHub",
					position: "right"
				},
				{
					type: "localeDropdown",
					position: "left",
					dropdownItemsBefore: [],
					dropdownItemsAfter: []
				}
			],
			hideOnScroll: false
		},
		footer: {
			style: "dark",
			links: [
				{
					title: "Community",
					items: [
						{
							label: "Stack Overflow",
							href: "https://stackoverflow.com/questions/tagged/docusaurus"
						},
						{
							label: "Discord",
							href: "https://discordapp.com/invite/docusaurus"
						},
						{
							label: "Twitter",
							href: "https://twitter.com/docusaurus"
						}
					]
				},
				{
					title: "More",
					items: [
						{
							label: "Blog",
							to: "blog/"
						},
						{
							label: "GitHub",
							href: "https://github.com/facebook/docusaurus"
						}
					]
				}
			],
			copyright: "Copyright © 2021 Videndum Studios Ltd."
		},
		colorMode: {
			defaultMode: "light",
			disableSwitch: false,
			respectPrefersColorScheme: false,
			switchConfig: {
				darkIcon: "🌜",
				darkIconStyle: {},
				lightIcon: "🌞",
				lightIconStyle: {}
			}
		},
		docs: {
			versionPersistence: "localStorage"
		},
		metadatas: [],
		prism: {
			additionalLanguages: []
		},
		hideableSidebar: false
	},
	presets: [
		[
			"@docusaurus/preset-classic",
			{
				docs: {
					sidebarPath:
						"D:\\Jonathan\\Documents\\Repositories\\devspace\\Videndum\\projects\\action-masterminds\\docs\\sidebars.js",
					editUrl:
						"https://github.com/videndum/action-masterminds/edit/develop/docs/",
					editLocalizedFiles: true,
					remarkPlugins: []
				},
				blog: {
					showReadingTime: true,
					editUrl:
						"https://github.com/videndum/action-masterminds/edit/develop/docs/blog/",
					editLocalizedFiles: true
				}
			}
		]
	],
	baseUrlIssueBanner: true,
	onDuplicateRoutes: "warn",
	customFields: {},
	themes: [],
	titleDelimiter: "|",
	noIndex: false
}
