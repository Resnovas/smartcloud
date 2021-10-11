/** @format */

"use strict"
;(self.webpackChunkaction_masterminds =
	self.webpackChunkaction_masterminds || []).push([
	[8861],
	{
		3905: function (e, t, n) {
			n.d(t, {
				Zo: function () {
					return d
				},
				kt: function () {
					return f
				}
			})
			var i = n(7294)
			function r(e, t, n) {
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
			function o(e, t) {
				var n = Object.keys(e)
				if (Object.getOwnPropertySymbols) {
					var i = Object.getOwnPropertySymbols(e)
					t &&
						(i = i.filter(function (t) {
							return Object.getOwnPropertyDescriptor(e, t).enumerable
						})),
						n.push.apply(n, i)
				}
				return n
			}
			function a(e) {
				for (var t = 1; t < arguments.length; t++) {
					var n = null != arguments[t] ? arguments[t] : {}
					t % 2
						? o(Object(n), !0).forEach(function (t) {
								r(e, t, n[t])
						  })
						: Object.getOwnPropertyDescriptors
						? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
						: o(Object(n)).forEach(function (t) {
								Object.defineProperty(
									e,
									t,
									Object.getOwnPropertyDescriptor(n, t)
								)
						  })
				}
				return e
			}
			function l(e, t) {
				if (null == e) return {}
				var n,
					i,
					r = (function (e, t) {
						if (null == e) return {}
						var n,
							i,
							r = {},
							o = Object.keys(e)
						for (i = 0; i < o.length; i++)
							(n = o[i]), t.indexOf(n) >= 0 || (r[n] = e[n])
						return r
					})(e, t)
				if (Object.getOwnPropertySymbols) {
					var o = Object.getOwnPropertySymbols(e)
					for (i = 0; i < o.length; i++)
						(n = o[i]),
							t.indexOf(n) >= 0 ||
								(Object.prototype.propertyIsEnumerable.call(e, n) &&
									(r[n] = e[n]))
				}
				return r
			}
			var s = i.createContext({}),
				p = function (e) {
					var t = i.useContext(s),
						n = t
					return e && (n = "function" == typeof e ? e(t) : a(a({}, t), e)), n
				},
				d = function (e) {
					var t = p(e.components)
					return i.createElement(s.Provider, { value: t }, e.children)
				},
				c = {
					inlineCode: "code",
					wrapper: function (e) {
						var t = e.children
						return i.createElement(i.Fragment, {}, t)
					}
				},
				u = i.forwardRef(function (e, t) {
					var n = e.components,
						r = e.mdxType,
						o = e.originalType,
						s = e.parentName,
						d = l(e, ["components", "mdxType", "originalType", "parentName"]),
						u = p(n),
						f = r,
						m = u["".concat(s, ".").concat(f)] || u[f] || c[f] || o
					return n
						? i.createElement(m, a(a({ ref: t }, d), {}, { components: n }))
						: i.createElement(m, a({ ref: t }, d))
				})
			function f(e, t) {
				var n = arguments,
					r = t && t.mdxType
				if ("string" == typeof e || r) {
					var o = n.length,
						a = new Array(o)
					a[0] = u
					var l = {}
					for (var s in t) hasOwnProperty.call(t, s) && (l[s] = t[s])
					;(l.originalType = e),
						(l.mdxType = "string" == typeof e ? e : r),
						(a[1] = l)
					for (var p = 2; p < o; p++) a[p] = n[p]
					return i.createElement.apply(null, a)
				}
				return i.createElement.apply(null, n)
			}
			u.displayName = "MDXCreateElement"
		},
		7845: function (e, t, n) {
			n.r(t),
				n.d(t, {
					frontMatter: function () {
						return l
					},
					contentTitle: function () {
						return s
					},
					metadata: function () {
						return p
					},
					toc: function () {
						return d
					},
					default: function () {
						return u
					}
				})
			var i = n(7462),
				r = n(3366),
				o = (n(7294), n(3905)),
				a = ["components"],
				l = {
					id: "Options",
					title: "Interface: Options",
					sidebar_label: "Options",
					sidebar_position: 0,
					custom_edit_url: null
				},
				s = void 0,
				p = {
					unversionedId: "release-mastermind/interfaces/Options",
					id: "release-mastermind/interfaces/Options",
					isDocsHomePage: !1,
					title: "Interface: Options",
					description:
						"The application options used within Github Actions workflows",
					source: "@site/docs/release-mastermind/interfaces/Options.md",
					sourceDirName: "release-mastermind/interfaces",
					slug: "/release-mastermind/interfaces/Options",
					permalink:
						"/action-masterminds/es/docs/release-mastermind/interfaces/Options",
					editUrl: null,
					version: "current",
					sidebarPosition: 0,
					frontMatter: {
						id: "Options",
						title: "Interface: Options",
						sidebar_label: "Options",
						sidebar_position: 0,
						custom_edit_url: null
					},
					sidebar: "release",
					previous: {
						title: "Labels",
						permalink:
							"/action-masterminds/es/docs/release-mastermind/interfaces/Labels"
					},
					next: {
						title: "PRConditionConfig",
						permalink:
							"/action-masterminds/es/docs/release-mastermind/interfaces/PRConditionConfig"
					}
				},
				d = [
					{
						value: "Properties",
						id: "properties",
						children: [
							{ value: "configJSON", id: "configjson", children: [] },
							{ value: "configPath", id: "configpath", children: [] },
							{ value: "dryRun", id: "dryrun", children: [] },
							{ value: "fillEmpty", id: "fillempty", children: [] },
							{ value: "repo", id: "repo", children: [] },
							{ value: "showLogs", id: "showlogs", children: [] },
							{ value: "skipDelete", id: "skipdelete", children: [] }
						]
					}
				],
				c = { toc: d }
			function u(e) {
				var t = e.components,
					n = (0, r.Z)(e, a)
				return (0, o.kt)(
					"wrapper",
					(0, i.Z)({}, c, n, { components: t, mdxType: "MDXLayout" }),
					(0, o.kt)(
						"p",
						null,
						"The application options used within Github Actions workflows"
					),
					(0, o.kt)("h2", { id: "properties" }, "Properties"),
					(0, o.kt)("h3", { id: "configjson" }, "configJSON"),
					(0, o.kt)(
						"p",
						null,
						"\u2022 ",
						(0, o.kt)("strong", { parentName: "p" }, "configJSON"),
						": ",
						(0, o.kt)(
							"a",
							{
								parentName: "p",
								href:
									"/action-masterminds/es/docs/release-mastermind/interfaces/Runners"
							},
							(0, o.kt)("inlineCode", { parentName: "a" }, "Runners")
						)
					),
					(0, o.kt)("p", null, "The json configuration object"),
					(0, o.kt)("h4", { id: "defined-in" }, "Defined in"),
					(0, o.kt)(
						"p",
						null,
						(0, o.kt)(
							"a",
							{
								parentName: "p",
								href:
									"https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/index.ts#L139"
							},
							"index.ts:139"
						)
					),
					(0, o.kt)("hr", null),
					(0, o.kt)("h3", { id: "configpath" }, "configPath"),
					(0, o.kt)(
						"p",
						null,
						"\u2022 ",
						(0, o.kt)("strong", { parentName: "p" }, "configPath"),
						": ",
						(0, o.kt)("inlineCode", { parentName: "p" }, "string")
					),
					(0, o.kt)("p", null, "The path to find the config"),
					(0, o.kt)("h4", { id: "defined-in-1" }, "Defined in"),
					(0, o.kt)(
						"p",
						null,
						(0, o.kt)(
							"a",
							{
								parentName: "p",
								href:
									"https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/index.ts#L135"
							},
							"index.ts:135"
						)
					),
					(0, o.kt)("hr", null),
					(0, o.kt)("h3", { id: "dryrun" }, "dryRun"),
					(0, o.kt)(
						"p",
						null,
						"\u2022 ",
						(0, o.kt)("strong", { parentName: "p" }, "dryRun"),
						": ",
						(0, o.kt)("inlineCode", { parentName: "p" }, "boolean")
					),
					(0, o.kt)("p", null, "should dry run?"),
					(0, o.kt)("h4", { id: "defined-in-2" }, "Defined in"),
					(0, o.kt)(
						"p",
						null,
						(0, o.kt)(
							"a",
							{
								parentName: "p",
								href:
									"https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/index.ts#L147"
							},
							"index.ts:147"
						)
					),
					(0, o.kt)("hr", null),
					(0, o.kt)("h3", { id: "fillempty" }, "fillEmpty"),
					(0, o.kt)(
						"p",
						null,
						"\u2022 ",
						(0, o.kt)("strong", { parentName: "p" }, "fillEmpty"),
						": ",
						(0, o.kt)("inlineCode", { parentName: "p" }, "boolean")
					),
					(0, o.kt)("p", null, "Should fill empty values?"),
					(0, o.kt)("h4", { id: "defined-in-3" }, "Defined in"),
					(0, o.kt)(
						"p",
						null,
						(0, o.kt)(
							"a",
							{
								parentName: "p",
								href:
									"https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/index.ts#L151"
							},
							"index.ts:151"
						)
					),
					(0, o.kt)("hr", null),
					(0, o.kt)("h3", { id: "repo" }, "repo"),
					(0, o.kt)(
						"p",
						null,
						"\u2022 ",
						(0, o.kt)("inlineCode", { parentName: "p" }, "Optional"),
						" ",
						(0, o.kt)("strong", { parentName: "p" }, "repo"),
						": ",
						(0, o.kt)(
							"a",
							{
								parentName: "p",
								href:
									"/action-masterminds/es/docs/release-mastermind/interfaces/Repo"
							},
							(0, o.kt)("inlineCode", { parentName: "a" }, "Repo")
						)
					),
					(0, o.kt)("p", null, "The repo to use"),
					(0, o.kt)("h4", { id: "defined-in-4" }, "Defined in"),
					(0, o.kt)(
						"p",
						null,
						(0, o.kt)(
							"a",
							{
								parentName: "p",
								href:
									"https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/index.ts#L159"
							},
							"index.ts:159"
						)
					),
					(0, o.kt)("hr", null),
					(0, o.kt)("h3", { id: "showlogs" }, "showLogs"),
					(0, o.kt)(
						"p",
						null,
						"\u2022 ",
						(0, o.kt)("strong", { parentName: "p" }, "showLogs"),
						": ",
						(0, o.kt)("inlineCode", { parentName: "p" }, "boolean")
					),
					(0, o.kt)("p", null, "Should show logs?"),
					(0, o.kt)("h4", { id: "defined-in-5" }, "Defined in"),
					(0, o.kt)(
						"p",
						null,
						(0, o.kt)(
							"a",
							{
								parentName: "p",
								href:
									"https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/index.ts#L143"
							},
							"index.ts:143"
						)
					),
					(0, o.kt)("hr", null),
					(0, o.kt)("h3", { id: "skipdelete" }, "skipDelete"),
					(0, o.kt)(
						"p",
						null,
						"\u2022 ",
						(0, o.kt)("strong", { parentName: "p" }, "skipDelete"),
						": ",
						(0, o.kt)("inlineCode", { parentName: "p" }, "boolean")
					),
					(0, o.kt)("p", null, "Should skip delete of labels"),
					(0, o.kt)("h4", { id: "defined-in-6" }, "Defined in"),
					(0, o.kt)(
						"p",
						null,
						(0, o.kt)(
							"a",
							{
								parentName: "p",
								href:
									"https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/index.ts#L155"
							},
							"index.ts:155"
						)
					)
				)
			}
			u.isMDXComponent = !0
		}
	}
])
