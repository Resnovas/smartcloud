/**
 * @format
 * @type {import('@docusaurus/types').DocusaurusConfig}
 */

module.exports = {
	title: "Smartcloud",
	tagline: "The most advanced github action, with functionality overflowing and declaritive configuration to streamline your entire github workflow!",
	url: "https://resnovas.github.io",
	baseUrl: "/smartcloud/",
	onBrokenLinks: "throw",
	onBrokenMarkdownLinks: "warn",
	favicon: "img/favicon.ico",
	organizationName: "resnovas",
	projectName: "smartcloud",
	trailingSlash: false,
	plugins: [
		"@docusaurus/theme-live-codeblock",
		[
			"docusaurus-plugin-typedoc",
			{
				id: "smartcloud",
				out: "smartcloud",
				entryPoints: ["../src/index.ts"],
				tsconfig: "../tsconfig.json",
				sidebar: {
					categoryLabel: "rm"
				},
				readme: "none",
				searchInComments: true,
				excludeExternals: true,
				internalModule: "internal",
				plugin: [
					"typedoc-plugin-missing-exports"
				]
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
			title: "Smartcloud",
			logo: {
				alt: "Smartcloud",
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
					to: "docs/smartcloud",
					activeBasePath: "docs/smartcloud",
					label: "Config Docs",
					position: "left"
				},
				// { to: "blog", label: "Blog", position: "left" },
				{ to: "changelog", label: "Changelog", position: "left" },
				{
					href: "https://github.com/resnovas/smartcloud",
					label: "GitHub",
					position: "right"
				},
				{
					type: "localeDropdown",
					position: "left"
				}
			]
		},
		footer: {
			style: "dark",
			// links: [
			// 	{
			// 		title: "Community",
			// 		items: [
			// 			{
			// 				label: "Stack Overflow",
			// 				href: "https://stackoverflow.com/questions/tagged/docusaurus"
			// 			},
			// 			{
			// 				label: "Discord",
			// 				href: "https://discordapp.com/invite/docusaurus"
			// 			},
			// 			{
			// 				label: "Twitter",
			// 				href: "https://twitter.com/docusaurus"
			// 			}
			// 		]
			// 	},
			// 	{
			// 		title: "More",
			// 		items: [
			// 			{
			// 				label: "Changelog",
			// 				to: "changelog/"
			// 			},
			// 			{
			// 				label: "GitHub",
			// 				href: "https://github.com/facebook/docusaurus"
			// 			}
			// 		]
			// 	}
			// ],
			copyright: `Copyright © ${new Date().getFullYear()} Resnovas.`
		}
	},

	presets: [
		[
			"@docusaurus/preset-classic",
			{
				docs: {
					sidebarPath: require.resolve("./sidebars.js"),
					editUrl:
						"https://github.com/resnovas/smartcloud/edit/develop/docs/",
					editLocalizedFiles: true,
				},
				blog: {
					showReadingTime: true,
					editUrl:
						"https://github.com/resnovas/smartcloud/edit/develop/docs/blog/",
					editLocalizedFiles: true
				}
			}
		]
	]
}
