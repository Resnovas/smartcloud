/** @format */

"use strict"
;(self.webpackChunkaction_masterminds =
	self.webpackChunkaction_masterminds || []).push([
	[9641],
	{
		3905: function (e, t, n) {
			n.d(t, {
				Zo: function () {
					return p
				},
				kt: function () {
					return u
				}
			})
			var r = n(7294)
			function i(e, t, n) {
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
			function o(e) {
				for (var t = 1; t < arguments.length; t++) {
					var n = null != arguments[t] ? arguments[t] : {}
					t % 2
						? a(Object(n), !0).forEach(function (t) {
								i(e, t, n[t])
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
			function l(e, t) {
				if (null == e) return {}
				var n,
					r,
					i = (function (e, t) {
						if (null == e) return {}
						var n,
							r,
							i = {},
							a = Object.keys(e)
						for (r = 0; r < a.length; r++)
							(n = a[r]), t.indexOf(n) >= 0 || (i[n] = e[n])
						return i
					})(e, t)
				if (Object.getOwnPropertySymbols) {
					var a = Object.getOwnPropertySymbols(e)
					for (r = 0; r < a.length; r++)
						(n = a[r]),
							t.indexOf(n) >= 0 ||
								(Object.prototype.propertyIsEnumerable.call(e, n) &&
									(i[n] = e[n]))
				}
				return i
			}
			var s = r.createContext({}),
				d = function (e) {
					var t = r.useContext(s),
						n = t
					return e && (n = "function" == typeof e ? e(t) : o(o({}, t), e)), n
				},
				p = function (e) {
					var t = d(e.components)
					return r.createElement(s.Provider, { value: t }, e.children)
				},
				c = {
					inlineCode: "code",
					wrapper: function (e) {
						var t = e.children
						return r.createElement(r.Fragment, {}, t)
					}
				},
				m = r.forwardRef(function (e, t) {
					var n = e.components,
						i = e.mdxType,
						a = e.originalType,
						s = e.parentName,
						p = l(e, ["components", "mdxType", "originalType", "parentName"]),
						m = d(n),
						u = i,
						f = m["".concat(s, ".").concat(u)] || m[u] || c[u] || a
					return n
						? r.createElement(f, o(o({ ref: t }, p), {}, { components: n }))
						: r.createElement(f, o({ ref: t }, p))
				})
			function u(e, t) {
				var n = arguments,
					i = t && t.mdxType
				if ("string" == typeof e || i) {
					var a = n.length,
						o = new Array(a)
					o[0] = m
					var l = {}
					for (var s in t) hasOwnProperty.call(t, s) && (l[s] = t[s])
					;(l.originalType = e),
						(l.mdxType = "string" == typeof e ? e : i),
						(o[1] = l)
					for (var d = 2; d < a; d++) o[d] = n[d]
					return r.createElement.apply(null, o)
				}
				return r.createElement.apply(null, n)
			}
			m.displayName = "MDXCreateElement"
		},
		7304: function (e, t, n) {
			n.r(t),
				n.d(t, {
					frontMatter: function () {
						return l
					},
					contentTitle: function () {
						return s
					},
					metadata: function () {
						return d
					},
					toc: function () {
						return p
					},
					default: function () {
						return m
					}
				})
			var r = n(7462),
				i = n(3366),
				a = (n(7294), n(3905)),
				o = ["components"],
				l = {
					id: "Config",
					title: "Interface: Config",
					sidebar_label: "Config",
					sidebar_position: 0,
					custom_edit_url: null
				},
				s = void 0,
				d = {
					unversionedId: "release-mastermind/interfaces/Config",
					id: "release-mastermind/interfaces/Config",
					isDocsHomePage: !1,
					title: "Interface: Config",
					description: "Properties",
					source: "@site/docs/release-mastermind/interfaces/Config.md",
					sourceDirName: "release-mastermind/interfaces",
					slug: "/release-mastermind/interfaces/Config",
					permalink:
						"/action-masterminds/es/docs/release-mastermind/interfaces/Config",
					editUrl: null,
					version: "current",
					sidebarPosition: 0,
					frontMatter: {
						id: "Config",
						title: "Interface: Config",
						sidebar_label: "Config",
						sidebar_position: 0,
						custom_edit_url: null
					},
					sidebar: "release",
					previous: {
						title: "ApiProps",
						permalink:
							"/action-masterminds/es/docs/release-mastermind/interfaces/ApiProps"
					},
					next: {
						title: "IssueConditionConfig",
						permalink:
							"/action-masterminds/es/docs/release-mastermind/interfaces/IssueConditionConfig"
					}
				},
				p = [
					{
						value: "Properties",
						id: "properties",
						children: [
							{ value: "issue", id: "issue", children: [] },
							{ value: "pr", id: "pr", children: [] },
							{ value: "project", id: "project", children: [] },
							{ value: "retryLimit", id: "retrylimit", children: [] },
							{ value: "root", id: "root", children: [] },
							{ value: "schedule", id: "schedule", children: [] },
							{ value: "sharedConfig", id: "sharedconfig", children: [] },
							{ value: "versioning", id: "versioning", children: [] }
						]
					}
				],
				c = { toc: p }
			function m(e) {
				var t = e.components,
					n = (0, i.Z)(e, o)
				return (0, a.kt)(
					"wrapper",
					(0, r.Z)({}, c, n, { components: t, mdxType: "MDXLayout" }),
					(0, a.kt)("h2", { id: "properties" }, "Properties"),
					(0, a.kt)("h3", { id: "issue" }, "issue"),
					(0, a.kt)(
						"p",
						null,
						"\u2022 ",
						(0, a.kt)("inlineCode", { parentName: "p" }, "Optional"),
						" ",
						(0, a.kt)("strong", { parentName: "p" }, "issue"),
						": ",
						(0, a.kt)(
							"a",
							{
								parentName: "p",
								href:
									"/action-masterminds/es/docs/release-mastermind/interfaces/IssueConfig"
							},
							(0, a.kt)("inlineCode", { parentName: "a" }, "IssueConfig")
						)
					),
					(0, a.kt)("p", null, "The issue configurations."),
					(0, a.kt)("h4", { id: "defined-in" }, "Defined in"),
					(0, a.kt)(
						"p",
						null,
						(0, a.kt)(
							"a",
							{
								parentName: "p",
								href:
									"https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/action.ts#L87"
							},
							"action.ts:87"
						)
					),
					(0, a.kt)("hr", null),
					(0, a.kt)("h3", { id: "pr" }, "pr"),
					(0, a.kt)(
						"p",
						null,
						"\u2022 ",
						(0, a.kt)("inlineCode", { parentName: "p" }, "Optional"),
						" ",
						(0, a.kt)("strong", { parentName: "p" }, "pr"),
						": ",
						(0, a.kt)(
							"a",
							{
								parentName: "p",
								href:
									"/action-masterminds/es/docs/release-mastermind/interfaces/PullRequestConfig"
							},
							(0, a.kt)("inlineCode", { parentName: "a" }, "PullRequestConfig")
						)
					),
					(0, a.kt)("p", null, "The pull request configurations."),
					(0, a.kt)("h4", { id: "defined-in-1" }, "Defined in"),
					(0, a.kt)(
						"p",
						null,
						(0, a.kt)(
							"a",
							{
								parentName: "p",
								href:
									"https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/action.ts#L83"
							},
							"action.ts:83"
						)
					),
					(0, a.kt)("hr", null),
					(0, a.kt)("h3", { id: "project" }, "project"),
					(0, a.kt)(
						"p",
						null,
						"\u2022 ",
						(0, a.kt)("inlineCode", { parentName: "p" }, "Optional"),
						" ",
						(0, a.kt)("strong", { parentName: "p" }, "project"),
						": ",
						(0, a.kt)(
							"a",
							{
								parentName: "p",
								href:
									"/action-masterminds/es/docs/release-mastermind/interfaces/ProjectConfig"
							},
							(0, a.kt)("inlineCode", { parentName: "a" }, "ProjectConfig")
						)
					),
					(0, a.kt)("p", null, "The project configurations."),
					(0, a.kt)("h4", { id: "defined-in-2" }, "Defined in"),
					(0, a.kt)(
						"p",
						null,
						(0, a.kt)(
							"a",
							{
								parentName: "p",
								href:
									"https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/action.ts#L91"
							},
							"action.ts:91"
						)
					),
					(0, a.kt)("hr", null),
					(0, a.kt)("h3", { id: "retrylimit" }, "retryLimit"),
					(0, a.kt)(
						"p",
						null,
						"\u2022 ",
						(0, a.kt)("inlineCode", { parentName: "p" }, "Optional"),
						" ",
						(0, a.kt)("strong", { parentName: "p" }, "retryLimit"),
						": ",
						(0, a.kt)("inlineCode", { parentName: "p" }, "number")
					),
					(0, a.kt)("p", null, "Maximum number of attempts before stopping."),
					(0, a.kt)(
						"p",
						null,
						(0, a.kt)(
							"strong",
							{ parentName: "p" },
							(0, a.kt)("inlineCode", { parentName: "strong" }, "default")
						),
						" 3"
					),
					(0, a.kt)("h4", { id: "defined-in-3" }, "Defined in"),
					(0, a.kt)(
						"p",
						null,
						(0, a.kt)(
							"a",
							{
								parentName: "p",
								href:
									"https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/action.ts#L68"
							},
							"action.ts:68"
						)
					),
					(0, a.kt)("hr", null),
					(0, a.kt)("h3", { id: "root" }, "root"),
					(0, a.kt)(
						"p",
						null,
						"\u2022 ",
						(0, a.kt)("inlineCode", { parentName: "p" }, "Optional"),
						" ",
						(0, a.kt)("strong", { parentName: "p" }, "root"),
						": ",
						(0, a.kt)("inlineCode", { parentName: "p" }, "string")
					),
					(0, a.kt)(
						"p",
						null,
						"The root branch used to check configuration settings against."
					),
					(0, a.kt)("h4", { id: "defined-in-4" }, "Defined in"),
					(0, a.kt)(
						"p",
						null,
						(0, a.kt)(
							"a",
							{
								parentName: "p",
								href:
									"https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/action.ts#L46"
							},
							"action.ts:46"
						)
					),
					(0, a.kt)("hr", null),
					(0, a.kt)("h3", { id: "schedule" }, "schedule"),
					(0, a.kt)(
						"p",
						null,
						"\u2022 ",
						(0, a.kt)("inlineCode", { parentName: "p" }, "Optional"),
						" ",
						(0, a.kt)("strong", { parentName: "p" }, "schedule"),
						": ",
						(0, a.kt)(
							"a",
							{
								parentName: "p",
								href:
									"/action-masterminds/es/docs/release-mastermind/interfaces/SharedConfig"
							},
							(0, a.kt)("inlineCode", { parentName: "a" }, "SharedConfig")
						)
					),
					(0, a.kt)("p", null, "The schedule configurations."),
					(0, a.kt)("h4", { id: "defined-in-5" }, "Defined in"),
					(0, a.kt)(
						"p",
						null,
						(0, a.kt)(
							"a",
							{
								parentName: "p",
								href:
									"https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/action.ts#L95"
							},
							"action.ts:95"
						)
					),
					(0, a.kt)("hr", null),
					(0, a.kt)("h3", { id: "sharedconfig" }, "sharedConfig"),
					(0, a.kt)(
						"p",
						null,
						"\u2022 ",
						(0, a.kt)("inlineCode", { parentName: "p" }, "Optional"),
						" ",
						(0, a.kt)("strong", { parentName: "p" }, "sharedConfig"),
						": ",
						(0, a.kt)(
							"a",
							{
								parentName: "p",
								href:
									"/action-masterminds/es/docs/release-mastermind/interfaces/SharedConfig"
							},
							(0, a.kt)("inlineCode", { parentName: "a" }, "SharedConfig")
						)
					),
					(0, a.kt)(
						"p",
						null,
						"Shared configurations, merged with the PR, Issue, Project and Schedule configurations."
					),
					(0, a.kt)("h4", { id: "defined-in-6" }, "Defined in"),
					(0, a.kt)(
						"p",
						null,
						(0, a.kt)(
							"a",
							{
								parentName: "p",
								href:
									"https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/action.ts#L79"
							},
							"action.ts:79"
						)
					),
					(0, a.kt)("hr", null),
					(0, a.kt)("h3", { id: "versioning" }, "versioning"),
					(0, a.kt)(
						"p",
						null,
						"\u2022 ",
						(0, a.kt)("inlineCode", { parentName: "p" }, "Optional"),
						" ",
						(0, a.kt)("strong", { parentName: "p" }, "versioning"),
						": ",
						(0, a.kt)("inlineCode", { parentName: "p" }, "Object")
					),
					(0, a.kt)(
						"p",
						null,
						"Versioning configuration used for release management."
					),
					(0, a.kt)("h4", { id: "type-declaration" }, "Type declaration"),
					(0, a.kt)(
						"table",
						null,
						(0, a.kt)(
							"thead",
							{ parentName: "table" },
							(0, a.kt)(
								"tr",
								{ parentName: "thead" },
								(0, a.kt)("th", { parentName: "tr", align: "left" }, "Name"),
								(0, a.kt)("th", { parentName: "tr", align: "left" }, "Type"),
								(0, a.kt)(
									"th",
									{ parentName: "tr", align: "left" },
									"Description"
								)
							)
						),
						(0, a.kt)(
							"tbody",
							{ parentName: "table" },
							(0, a.kt)(
								"tr",
								{ parentName: "tbody" },
								(0, a.kt)(
									"td",
									{ parentName: "tr", align: "left" },
									(0, a.kt)(
										"inlineCode",
										{ parentName: "td" },
										"prereleaseName?"
									)
								),
								(0, a.kt)(
									"td",
									{ parentName: "tr", align: "left" },
									(0, a.kt)("inlineCode", { parentName: "td" }, "string")
								),
								(0, a.kt)(
									"td",
									{ parentName: "tr", align: "left" },
									"If version is a pre-release, this is the version name to use."
								)
							),
							(0, a.kt)(
								"tr",
								{ parentName: "tbody" },
								(0, a.kt)(
									"td",
									{ parentName: "tr", align: "left" },
									(0, a.kt)("inlineCode", { parentName: "td" }, "source")
								),
								(0, a.kt)(
									"td",
									{ parentName: "tr", align: "left" },
									(0, a.kt)("inlineCode", { parentName: "td" }, "string")
								),
								(0, a.kt)(
									"td",
									{ parentName: "tr", align: "left" },
									"Version source used to determine the version."
								)
							),
							(0, a.kt)(
								"tr",
								{ parentName: "tbody" },
								(0, a.kt)(
									"td",
									{ parentName: "tr", align: "left" },
									(0, a.kt)("inlineCode", { parentName: "td" }, "type?")
								),
								(0, a.kt)(
									"td",
									{ parentName: "tr", align: "left" },
									(0, a.kt)("inlineCode", { parentName: "td" }, '"SemVer"')
								),
								(0, a.kt)(
									"td",
									{ parentName: "tr", align: "left" },
									"Version Type to change how versioning is handled."
								)
							)
						)
					),
					(0, a.kt)("h4", { id: "defined-in-7" }, "Defined in"),
					(0, a.kt)(
						"p",
						null,
						(0, a.kt)(
							"a",
							{
								parentName: "p",
								href:
									"https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/action.ts#L50"
							},
							"action.ts:50"
						)
					)
				)
			}
			m.isMDXComponent = !0
		}
	}
])
