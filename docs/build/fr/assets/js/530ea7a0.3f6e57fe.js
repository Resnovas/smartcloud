/** @format */

"use strict"
;(self.webpackChunkaction_masterminds =
	self.webpackChunkaction_masterminds || []).push([
	[459],
	{
		3905: function (e, t, n) {
			n.d(t, {
				Zo: function () {
					return l
				},
				kt: function () {
					return m
				}
			})
			var r = n(7294)
			function o(e, t, n) {
				return (
					t in e
						? Object.defineProperty(e, t, {
								value: n,
								enumerable: !0,
								configurable: !0,
								writable: !0
						  })
						: (e[t] = n),
					e
				)
			}
			function a(e, t) {
				var n = Object.keys(e)
				if (Object.getOwnPropertySymbols) {
					var r = Object.getOwnPropertySymbols(e)
					t &&
						(r = r.filter(function (t) {
							return Object.getOwnPropertyDescriptor(e, t).enumerable
						})),
						n.push.apply(n, r)
				}
				return n
			}
			function i(e) {
				for (var t = 1; t < arguments.length; t++) {
					var n = null != arguments[t] ? arguments[t] : {}
					t % 2
						? a(Object(n), !0).forEach(function (t) {
								o(e, t, n[t])
						  })
						: Object.getOwnPropertyDescriptors
						? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
						: a(Object(n)).forEach(function (t) {
								Object.defineProperty(
									e,
									t,
									Object.getOwnPropertyDescriptor(n, t)
								)
						  })
				}
				return e
			}
			function s(e, t) {
				if (null == e) return {}
				var n,
					r,
					o = (function (e, t) {
						if (null == e) return {}
						var n,
							r,
							o = {},
							a = Object.keys(e)
						for (r = 0; r < a.length; r++)
							(n = a[r]), t.indexOf(n) >= 0 || (o[n] = e[n])
						return o
					})(e, t)
				if (Object.getOwnPropertySymbols) {
					var a = Object.getOwnPropertySymbols(e)
					for (r = 0; r < a.length; r++)
						(n = a[r]),
							t.indexOf(n) >= 0 ||
								(Object.prototype.propertyIsEnumerable.call(e, n) &&
									(o[n] = e[n]))
				}
				return o
			}
			var c = r.createContext({}),
				u = function (e) {
					var t = r.useContext(c),
						n = t
					return e && (n = "function" == typeof e ? e(t) : i(i({}, t), e)), n
				},
				l = function (e) {
					var t = u(e.components)
					return r.createElement(c.Provider, { value: t }, e.children)
				},
				p = {
					inlineCode: "code",
					wrapper: function (e) {
						var t = e.children
						return r.createElement(r.Fragment, {}, t)
					}
				},
				d = r.forwardRef(function (e, t) {
					var n = e.components,
						o = e.mdxType,
						a = e.originalType,
						c = e.parentName,
						l = s(e, ["components", "mdxType", "originalType", "parentName"]),
						d = u(n),
						m = o,
						f = d["".concat(c, ".").concat(m)] || d[m] || p[m] || a
					return n
						? r.createElement(f, i(i({ ref: t }, l), {}, { components: n }))
						: r.createElement(f, i({ ref: t }, l))
				})
			function m(e, t) {
				var n = arguments,
					o = t && t.mdxType
				if ("string" == typeof e || o) {
					var a = n.length,
						i = new Array(a)
					i[0] = d
					var s = {}
					for (var c in t) hasOwnProperty.call(t, c) && (s[c] = t[c])
					;(s.originalType = e),
						(s.mdxType = "string" == typeof e ? e : o),
						(i[1] = s)
					for (var u = 2; u < a; u++) i[u] = n[u]
					return r.createElement.apply(null, i)
				}
				return r.createElement.apply(null, n)
			}
			d.displayName = "MDXCreateElement"
		},
		4768: function (e, t, n) {
			n.r(t),
				n.d(t, {
					frontMatter: function () {
						return s
					},
					contentTitle: function () {
						return c
					},
					metadata: function () {
						return u
					},
					toc: function () {
						return l
					},
					default: function () {
						return d
					}
				})
			var r = n(7462),
				o = n(3366),
				a = (n(7294), n(3905)),
				i = ["components"],
				s = {},
				c = "Manual setup",
				u = {
					unversionedId: "getting-started/setup",
					id: "getting-started/setup",
					isDocsHomePage: !1,
					title: "Manual setup",
					description:
						"Create a new Github Actions workflow at .github/workflows/action.yml which uses our action:",
					source: "@site/docs/getting-started/setup.md",
					sourceDirName: "getting-started",
					slug: "/getting-started/setup",
					permalink: "/action-masterminds/fr/docs/getting-started/setup",
					editUrl:
						"https://github.com/videndum/action-masterminds/edit/develop/docs/docs/getting-started/setup.md",
					version: "current",
					frontMatter: {},
					sidebar: "getting",
					previous: {
						title: "Intro",
						permalink: "/action-masterminds/fr/docs/getting-started"
					},
					next: {
						title: "Backlog",
						permalink: "/action-masterminds/fr/docs/getting-started/backlog"
					}
				},
				l = [
					{ value: "How to configure?", id: "how-to-configure", children: [] }
				],
				p = { toc: l }
			function d(e) {
				var t = e.components,
					n = (0, o.Z)(e, i)
				return (0, a.kt)(
					"wrapper",
					(0, r.Z)({}, p, n, { components: t, mdxType: "MDXLayout" }),
					(0, a.kt)("h1", { id: "manual-setup" }, "Manual setup"),
					(0, a.kt)(
						"p",
						null,
						"Create a new Github Actions workflow at ",
						(0, a.kt)(
							"inlineCode",
							{ parentName: "p" },
							".github/workflows/action.yml"
						),
						" which uses our action:"
					),
					(0, a.kt)(
						"p",
						null,
						(0, a.kt)(
							"em",
							{ parentName: "p" },
							"Note: ",
							(0, a.kt)("inlineCode", { parentName: "em" }, "actions/checkout"),
							" must be run first so that the release action can find your config file."
						)
					),
					(0, a.kt)(
						"pre",
						null,
						(0, a.kt)(
							"code",
							{ parentName: "pre", className: "language-yaml" },
							'name: Project Management\non:\n  issues:\n    types: [opened, edited, closed, reopened]\n  pull_request_target:\n    types: [opened, edited, closed, reopened, synchronize]\n  project_card:\n    types: [created, moved, deleted]\n  schedule: [cron: "0 * * * *"]\n\njobs:\n  release-mastermind:\n    name: Release Mastermind\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v2.3.4\n      - name: Release Mastermind\n        uses: Videndum/release-mastermind@0.0.0-alpha.7\n        with:\n          GITHUB_TOKEN: "${{ secrets.BOT_TOKEN }}"\n          config: .github/allconfigs.json\n'
						)
					),
					(0, a.kt)(
						"p",
						null,
						"Now create the config file at ",
						(0, a.kt)("inlineCode", { parentName: "p" }, ".github/config.json"),
						":"
					),
					(0, a.kt)(
						"pre",
						null,
						(0, a.kt)(
							"code",
							{ parentName: "pre", className: "language-json" },
							'{\n  "labels": {\n    "example": {\n      "name": "example",\n      "colour": "#00ff00",\n      "description": "Example label"\n    }\n  },\n  "issue": {\n    "example": {\n      "requires": 2,\n      "conditions": [\n        {\n          "type": "titleMatches",\n          "pattern": "example"\n        },\n        {\n          "type": "isOpen"\n        }\n      ]\n    }\n  },\n  "pr": {\n    "example": {\n      "requires": 1,\n      "conditions": [\n        {\n          "type": "isDraft",\n          "value": false\n        }\n      ]\n    }\n  },\n  "skip_labeling": true,\n  "delete_labels": true\n}\n'
						)
					),
					(0, a.kt)(
						"p",
						null,
						"Be sure that Github Actions is enabled for in your repository's settings."
					),
					(0, a.kt)("h2", { id: "how-to-configure" }, "How to configure?"),
					(0, a.kt)(
						"p",
						null,
						"We are working on a couple of automated ways to configure this action, and will be releasing them shortly (Fall 2021). In the mean time you can checkout our extensive documentation found on our ",
						(0, a.kt)(
							"a",
							{
								parentName: "p",
								href: "https://videndum.github.io/action-masterminds"
							},
							"website"
						),
						" and ",
						(0, a.kt)(
							"a",
							{
								parentName: "p",
								href: "../release-mastermind/interfaces/Config"
							},
							"our configuration page"
						)
					)
				)
			}
			d.isMDXComponent = !0
		}
	}
])
