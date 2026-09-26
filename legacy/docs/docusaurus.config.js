/*
 * Project: smartcloud
 * File: docusaurus.config.js
 * Path: \docusaurus.config.js
 * Created Date: Tuesday, October 25th, 2022
 * Author: Jonathan Stevens (Email: jonathan@resnovas.com, Github: https://github.com/TGTGamer)
 * -----
 * Contributing: Please read through our contributing guidelines. Included are directions for opening
 * issues, coding standards, and notes on development. These can be found at https://github.com/resnovas/smartcloud/CONTRIBUTING.md
 * 
 * Code of Conduct: This project abides by the Contributor Covenant, version 2.0. Please interact in ways that contribute to an open,
 * welcoming, diverse, inclusive, and healthy community. Our Code of Conduct can be found at https://github.com/resnovas/smartcloud/CODE_OF_CONDUCT.md
 * -----
 * Copyright (c) 2023 Resnovas - All Rights Reserved
 * LICENSE: GNU General Public License v3.0 or later (GPL-3.0+)
 * -----
 * This program has been provided under confidence of the copyright holder and is 
 * licensed for copying, distribution and modification under the terms of
 * the GNU General Public License v3.0 or later (GPL-3.0+) published as the License,
 * or (at your option) any later version of this license.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License v3.0 or later for more details.
 * 
 * You should have received a copy of the GNU General Public License v3.0 or later
 * along with this program. If not, please write to: jonathan@resnovas.com,
 * or see https://www.gnu.org/licenses/gpl-3.0-standalone.html
 * 
 * DELETING THIS NOTICE AUTOMATICALLY VOIDS YOUR LICENSE - PLEASE SEE THE LICENSE FILE FOR DETAILS
 * -----
 * Last Modified: 14-04-2023
 * By: Jonathan Stevens (Email: jonathan@resnovas.com, Github: https://github.com/TGTGamer)
 * Current Version: <<projectversion>>
 * HISTORY:
 * Date      	By	Comments
 * ----------	---	---------------------------------------------------------
 */

/**
 * @format
 * @type {import('@docusaurus/types').DocusaurusConfig}
 */

module.exports = {
  title: "Smartcloud",
  tagline:
    "The most advanced github action, with functionality overflowing and declaritive configuration to streamline your entire github workflow!",
  url: process.env.VERCEL_URL ? "https://"+process.env.VERCEL_URL : "https://resnovas.github.io",
  baseUrl: process.env.VERCEL_URL ? "/" : "/smartcloud/",
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
          categoryLabel: "rm",
        },
        readme: "none",
        searchInComments: true,
        excludeExternals: true,
        plugin: ["typedoc-plugin-missing-exports"],
      },
    ],
    [
      "@docusaurus/plugin-content-blog",
      {
        id: "changelog",
        routeBasePath: "changelog",
        path: "./changelog",
      },
    ],
  ],
  themeConfig: {
    liveCodeBlock: {
      playgroundPosition: "bottom",
    },
    navbar: {
      title: "Smartcloud",
      logo: {
        alt: "Smartcloud",
        src: "img/logo.svg",
      },
      items: [
        {
          to: "docs/getting-started",
          activeBasePath: "docs/getting-started",
          label: "Get Started",
          position: "left",
        },
        {
          to: "docs/smartcloud",
          activeBasePath: "docs/smartcloud",
          label: "Config Docs",
          position: "left",
        },
        { to: "changelog", label: "Changelog", position: "left" },
        {
          href: "https://github.com/resnovas/smartcloud",
          label: "GitHub",
          position: "right",
        },
      ],
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
      copyright: `Copyright © ${new Date().getFullYear()} Resnovas.`,
    },
  },

  presets: [
    [
      "@docusaurus/preset-classic",
      {
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          editUrl: "https://github.com/resnovas/smartcloud/edit/develop/docs/",
        },
        blog: {
          showReadingTime: true,
          editUrl:
            "https://github.com/resnovas/smartcloud/edit/develop/docs/blog/",
        },
      },
    ],
  ],
};
