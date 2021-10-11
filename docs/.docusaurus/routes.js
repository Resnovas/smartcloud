/** @format */

import ComponentCreator from "@docusaurus/ComponentCreator"

export default [
	{
		path: "/action-masterminds/",
		component: ComponentCreator("/action-masterminds/", "ff1"),
		exact: true
	},
	{
		path: "/action-masterminds/__docusaurus/debug",
		component: ComponentCreator(
			"/action-masterminds/__docusaurus/debug",
			"4d5"
		),
		exact: true
	},
	{
		path: "/action-masterminds/__docusaurus/debug/config",
		component: ComponentCreator(
			"/action-masterminds/__docusaurus/debug/config",
			"b42"
		),
		exact: true
	},
	{
		path: "/action-masterminds/__docusaurus/debug/content",
		component: ComponentCreator(
			"/action-masterminds/__docusaurus/debug/content",
			"832"
		),
		exact: true
	},
	{
		path: "/action-masterminds/__docusaurus/debug/globalData",
		component: ComponentCreator(
			"/action-masterminds/__docusaurus/debug/globalData",
			"99f"
		),
		exact: true
	},
	{
		path: "/action-masterminds/__docusaurus/debug/metadata",
		component: ComponentCreator(
			"/action-masterminds/__docusaurus/debug/metadata",
			"383"
		),
		exact: true
	},
	{
		path: "/action-masterminds/__docusaurus/debug/registry",
		component: ComponentCreator(
			"/action-masterminds/__docusaurus/debug/registry",
			"4d0"
		),
		exact: true
	},
	{
		path: "/action-masterminds/__docusaurus/debug/routes",
		component: ComponentCreator(
			"/action-masterminds/__docusaurus/debug/routes",
			"6ad"
		),
		exact: true
	},
	{
		path: "/action-masterminds/blog",
		component: ComponentCreator("/action-masterminds/blog", "f4d"),
		exact: true
	},
	{
		path: "/action-masterminds/blog/2020/04/14/blog-plugin",
		component: ComponentCreator(
			"/action-masterminds/blog/2020/04/14/blog-plugin",
			"f54"
		),
		exact: true
	},
	{
		path: "/action-masterminds/blog/2020/04/14/large-blog-post",
		component: ComponentCreator(
			"/action-masterminds/blog/2020/04/14/large-blog-post",
			"cf0"
		),
		exact: true
	},
	{
		path: "/action-masterminds/blog/hello-world",
		component: ComponentCreator("/action-masterminds/blog/hello-world", "142"),
		exact: true
	},
	{
		path: "/action-masterminds/blog/hola",
		component: ComponentCreator("/action-masterminds/blog/hola", "0ea"),
		exact: true
	},
	{
		path: "/action-masterminds/blog/tags",
		component: ComponentCreator("/action-masterminds/blog/tags", "07b"),
		exact: true
	},
	{
		path: "/action-masterminds/blog/tags/blog",
		component: ComponentCreator("/action-masterminds/blog/tags/blog", "a5b"),
		exact: true
	},
	{
		path: "/action-masterminds/blog/tags/docusaurus",
		component: ComponentCreator(
			"/action-masterminds/blog/tags/docusaurus",
			"46c"
		),
		exact: true
	},
	{
		path: "/action-masterminds/blog/tags/facebook",
		component: ComponentCreator(
			"/action-masterminds/blog/tags/facebook",
			"291"
		),
		exact: true
	},
	{
		path: "/action-masterminds/blog/tags/hello",
		component: ComponentCreator("/action-masterminds/blog/tags/hello", "df4"),
		exact: true
	},
	{
		path: "/action-masterminds/blog/tags/hola",
		component: ComponentCreator("/action-masterminds/blog/tags/hola", "4da"),
		exact: true
	},
	{
		path: "/action-masterminds/blog/welcome",
		component: ComponentCreator("/action-masterminds/blog/welcome", "7ef"),
		exact: true
	},
	{
		path: "/action-masterminds/changelog",
		component: ComponentCreator("/action-masterminds/changelog", "fbd"),
		exact: true
	},
	{
		path: "/action-masterminds/changelog/hola",
		component: ComponentCreator("/action-masterminds/changelog/hola", "457"),
		exact: true
	},
	{
		path: "/action-masterminds/changelog/tags",
		component: ComponentCreator("/action-masterminds/changelog/tags", "f40"),
		exact: true
	},
	{
		path: "/action-masterminds/changelog/tags/docusaurus",
		component: ComponentCreator(
			"/action-masterminds/changelog/tags/docusaurus",
			"856"
		),
		exact: true
	},
	{
		path: "/action-masterminds/changelog/tags/hola",
		component: ComponentCreator(
			"/action-masterminds/changelog/tags/hola",
			"3be"
		),
		exact: true
	},
	{
		path: "/action-masterminds/markdown-page",
		component: ComponentCreator("/action-masterminds/markdown-page", "54a"),
		exact: true
	},
	{
		path: "/action-masterminds/docs",
		component: ComponentCreator("/action-masterminds/docs", "c0d"),
		routes: [
			{
				path: "/action-masterminds/docs/getting-started",
				component: ComponentCreator(
					"/action-masterminds/docs/getting-started",
					"1c1"
				),
				exact: true,
				sidebar: "getting"
			},
			{
				path: "/action-masterminds/docs/getting-started/backlog",
				component: ComponentCreator(
					"/action-masterminds/docs/getting-started/backlog",
					"5bc"
				),
				exact: true,
				sidebar: "getting"
			},
			{
				path:
					"/action-masterminds/docs/getting-started/contributing/CODE_OF_CONDUCT",
				component: ComponentCreator(
					"/action-masterminds/docs/getting-started/contributing/CODE_OF_CONDUCT",
					"c9b"
				),
				exact: true,
				sidebar: "getting"
			},
			{
				path:
					"/action-masterminds/docs/getting-started/contributing/code-review-process",
				component: ComponentCreator(
					"/action-masterminds/docs/getting-started/contributing/code-review-process",
					"842"
				),
				exact: true,
				sidebar: "getting"
			},
			{
				path: "/action-masterminds/docs/getting-started/contributing/gpgkey",
				component: ComponentCreator(
					"/action-masterminds/docs/getting-started/contributing/gpgkey",
					"195"
				),
				exact: true,
				sidebar: "getting"
			},
			{
				path:
					"/action-masterminds/docs/getting-started/contributing/runningLocally",
				component: ComponentCreator(
					"/action-masterminds/docs/getting-started/contributing/runningLocally",
					"7c9"
				),
				exact: true,
				sidebar: "getting"
			},
			{
				path: "/action-masterminds/docs/getting-started/contributing/security",
				component: ComponentCreator(
					"/action-masterminds/docs/getting-started/contributing/security",
					"8c0"
				),
				exact: true,
				sidebar: "getting"
			},
			{
				path:
					"/action-masterminds/docs/getting-started/contributing/Start Contributing/branch",
				component: ComponentCreator(
					"/action-masterminds/docs/getting-started/contributing/Start Contributing/branch",
					"f30"
				),
				exact: true,
				sidebar: "getting"
			},
			{
				path:
					"/action-masterminds/docs/getting-started/contributing/Start Contributing/external",
				component: ComponentCreator(
					"/action-masterminds/docs/getting-started/contributing/Start Contributing/external",
					"a1a"
				),
				exact: true,
				sidebar: "getting"
			},
			{
				path:
					"/action-masterminds/docs/getting-started/contributing/Start Contributing/first",
				component: ComponentCreator(
					"/action-masterminds/docs/getting-started/contributing/Start Contributing/first",
					"1ed"
				),
				exact: true,
				sidebar: "getting"
			},
			{
				path:
					"/action-masterminds/docs/getting-started/contributing/Start Contributing/internal",
				component: ComponentCreator(
					"/action-masterminds/docs/getting-started/contributing/Start Contributing/internal",
					"b09"
				),
				exact: true,
				sidebar: "getting"
			},
			{
				path:
					"/action-masterminds/docs/getting-started/contributing/Start Contributing/labels",
				component: ComponentCreator(
					"/action-masterminds/docs/getting-started/contributing/Start Contributing/labels",
					"0ce"
				),
				exact: true,
				sidebar: "getting"
			},
			{
				path:
					"/action-masterminds/docs/getting-started/contributing/Start Contributing/types",
				component: ComponentCreator(
					"/action-masterminds/docs/getting-started/contributing/Start Contributing/types",
					"9ae"
				),
				exact: true,
				sidebar: "getting"
			},
			{
				path:
					"/action-masterminds/docs/getting-started/contributing/Start Contributing/why-the-guidelines",
				component: ComponentCreator(
					"/action-masterminds/docs/getting-started/contributing/Start Contributing/why-the-guidelines",
					"906"
				),
				exact: true,
				sidebar: "getting"
			},
			{
				path: "/action-masterminds/docs/getting-started/contributors",
				component: ComponentCreator(
					"/action-masterminds/docs/getting-started/contributors",
					"cd4"
				),
				exact: true,
				sidebar: "getting"
			},
			{
				path: "/action-masterminds/docs/getting-started/features/regex",
				component: ComponentCreator(
					"/action-masterminds/docs/getting-started/features/regex",
					"909"
				),
				exact: true,
				sidebar: "getting"
			},
			{
				path: "/action-masterminds/docs/getting-started/setup",
				component: ComponentCreator(
					"/action-masterminds/docs/getting-started/setup",
					"45d"
				),
				exact: true,
				sidebar: "getting"
			},
			{
				path: "/action-masterminds/docs/getting-started/support",
				component: ComponentCreator(
					"/action-masterminds/docs/getting-started/support",
					"309"
				),
				exact: true,
				sidebar: "getting"
			},
			{
				path: "/action-masterminds/docs/release-mastermind",
				component: ComponentCreator(
					"/action-masterminds/docs/release-mastermind",
					"810"
				),
				exact: true,
				sidebar: "release"
			},
			{
				path: "/action-masterminds/docs/release-mastermind/interfaces/ApiProps",
				component: ComponentCreator(
					"/action-masterminds/docs/release-mastermind/interfaces/ApiProps",
					"00a"
				),
				exact: true,
				sidebar: "release"
			},
			{
				path: "/action-masterminds/docs/release-mastermind/interfaces/Config",
				component: ComponentCreator(
					"/action-masterminds/docs/release-mastermind/interfaces/Config",
					"1fc"
				),
				exact: true,
				sidebar: "release"
			},
			{
				path:
					"/action-masterminds/docs/release-mastermind/interfaces/IssueConditionConfig",
				component: ComponentCreator(
					"/action-masterminds/docs/release-mastermind/interfaces/IssueConditionConfig",
					"f08"
				),
				exact: true,
				sidebar: "release"
			},
			{
				path:
					"/action-masterminds/docs/release-mastermind/interfaces/IssueConfig",
				component: ComponentCreator(
					"/action-masterminds/docs/release-mastermind/interfaces/IssueConfig",
					"cd6"
				),
				exact: true,
				sidebar: "release"
			},
			{
				path: "/action-masterminds/docs/release-mastermind/interfaces/Label",
				component: ComponentCreator(
					"/action-masterminds/docs/release-mastermind/interfaces/Label",
					"b3b"
				),
				exact: true,
				sidebar: "release"
			},
			{
				path: "/action-masterminds/docs/release-mastermind/interfaces/Labels",
				component: ComponentCreator(
					"/action-masterminds/docs/release-mastermind/interfaces/Labels",
					"4d7"
				),
				exact: true,
				sidebar: "release"
			},
			{
				path: "/action-masterminds/docs/release-mastermind/interfaces/Options",
				component: ComponentCreator(
					"/action-masterminds/docs/release-mastermind/interfaces/Options",
					"2cf"
				),
				exact: true,
				sidebar: "release"
			},
			{
				path:
					"/action-masterminds/docs/release-mastermind/interfaces/PRConditionConfig",
				component: ComponentCreator(
					"/action-masterminds/docs/release-mastermind/interfaces/PRConditionConfig",
					"da3"
				),
				exact: true,
				sidebar: "release"
			},
			{
				path:
					"/action-masterminds/docs/release-mastermind/interfaces/ProjectConditionConfig",
				component: ComponentCreator(
					"/action-masterminds/docs/release-mastermind/interfaces/ProjectConditionConfig",
					"d84"
				),
				exact: true,
				sidebar: "release"
			},
			{
				path:
					"/action-masterminds/docs/release-mastermind/interfaces/ProjectConfig",
				component: ComponentCreator(
					"/action-masterminds/docs/release-mastermind/interfaces/ProjectConfig",
					"52b"
				),
				exact: true,
				sidebar: "release"
			},
			{
				path:
					"/action-masterminds/docs/release-mastermind/interfaces/PullRequestConfig",
				component: ComponentCreator(
					"/action-masterminds/docs/release-mastermind/interfaces/PullRequestConfig",
					"6a1"
				),
				exact: true,
				sidebar: "release"
			},
			{
				path: "/action-masterminds/docs/release-mastermind/interfaces/Repo",
				component: ComponentCreator(
					"/action-masterminds/docs/release-mastermind/interfaces/Repo",
					"4ff"
				),
				exact: true,
				sidebar: "release"
			},
			{
				path: "/action-masterminds/docs/release-mastermind/interfaces/Runners",
				component: ComponentCreator(
					"/action-masterminds/docs/release-mastermind/interfaces/Runners",
					"7c8"
				),
				exact: true,
				sidebar: "release"
			},
			{
				path:
					"/action-masterminds/docs/release-mastermind/interfaces/ScheduleConditionConfig",
				component: ComponentCreator(
					"/action-masterminds/docs/release-mastermind/interfaces/ScheduleConditionConfig",
					"c6b"
				),
				exact: true,
				sidebar: "release"
			},
			{
				path:
					"/action-masterminds/docs/release-mastermind/interfaces/SharedConditions",
				component: ComponentCreator(
					"/action-masterminds/docs/release-mastermind/interfaces/SharedConditions",
					"893"
				),
				exact: true,
				sidebar: "release"
			},
			{
				path:
					"/action-masterminds/docs/release-mastermind/interfaces/SharedConfig",
				component: ComponentCreator(
					"/action-masterminds/docs/release-mastermind/interfaces/SharedConfig",
					"9d8"
				),
				exact: true,
				sidebar: "release"
			},
			{
				path:
					"/action-masterminds/docs/release-mastermind/interfaces/SharedConventionConditions",
				component: ComponentCreator(
					"/action-masterminds/docs/release-mastermind/interfaces/SharedConventionConditions",
					"f90"
				),
				exact: true,
				sidebar: "release"
			},
			{
				path: "/action-masterminds/docs/release-mastermind/modules",
				component: ComponentCreator(
					"/action-masterminds/docs/release-mastermind/modules",
					"a9c"
				),
				exact: true,
				sidebar: "release"
			}
		]
	},
	{
		path: "*",
		component: ComponentCreator("*")
	}
]
