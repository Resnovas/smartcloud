/**
 * @format
 * @type {import('@docusaurus/types').DocusaurusConfig}
 */

const remarkContributors = import("remark-git-contributors")

module.exports = {
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
		locales: ["en", "fr", "es"]
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
		// [
		//   'docusaurus-plugin-typedoc',
		//   {
		//     id: 'label-mastermind',
		//     out: "label-mastermind",
		//     entryPoints: ['../packages/label-mastermind/src/index.ts'],
		//     tsconfig: '../packages/label-mastermind/tsconfig.json',
		//     sidebar: {
		//       "categoryLabel": "lm"
		//     }
		//   },
		// ],
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
				{ to: "blog", label: "Blog", position: "left" },
				{ to: "changelog", label: "Changelog", position: "left" },
				{
					href: "https://github.com/videndum/action-masterminds",
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
			copyright: `Copyright © ${new Date().getFullYear()} Videndum Studios Ltd.`
		}
	},

	presets: [
		[
			"@docusaurus/preset-classic",
			{
				docs: {
					sidebarPath: require.resolve("./sidebars.js"),
					editUrl:
						"https://github.com/videndum/action-masterminds/edit/develop/docs/",
					editLocalizedFiles: true,
					remarkPlugins: [
						// [
						//   remarkContributors,
						//   {
						//     "contributors": [
						//       {
						//       "name": "Sara",
						//       "email": "sara@example.com",
						//       "github": "sara"
						//       }
						//     ]
						//   }
						// ],
					]
				},
				blog: {
					showReadingTime: true,
					editUrl:
						"https://github.com/videndum/action-masterminds/edit/develop/docs/blog/",
					editLocalizedFiles: true
				}
			}
		]
	]
}
