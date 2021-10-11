/** @format */

"use strict"
;(self.webpackChunkaction_masterminds =
	self.webpackChunkaction_masterminds || []).push([
	[2871],
	{
		3905: function (e, n, t) {
			t.d(n, {
				Zo: function () {
					return d
				},
				kt: function () {
					return f
				}
			})
			var r = t(7294)
			function i(e, n, t) {
				return (
					n in e
						? Object.defineProperty(e, n, {
								value: t,
								enumerable: !0,
								configurable: !0,
								writable: !0
						  })
						: (e[n] = t),
					e
				)
			}
			function a(e, n) {
				var t = Object.keys(e)
				if (Object.getOwnPropertySymbols) {
					var r = Object.getOwnPropertySymbols(e)
					n &&
						(r = r.filter(function (n) {
							return Object.getOwnPropertyDescriptor(e, n).enumerable
						})),
						t.push.apply(t, r)
				}
				return t
			}
			function o(e) {
				for (var n = 1; n < arguments.length; n++) {
					var t = null != arguments[n] ? arguments[n] : {}
					n % 2
						? a(Object(t), !0).forEach(function (n) {
								i(e, n, t[n])
						  })
						: Object.getOwnPropertyDescriptors
						? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t))
						: a(Object(t)).forEach(function (n) {
								Object.defineProperty(
									e,
									n,
									Object.getOwnPropertyDescriptor(t, n)
								)
						  })
				}
				return e
			}
			function s(e, n) {
				if (null == e) return {}
				var t,
					r,
					i = (function (e, n) {
						if (null == e) return {}
						var t,
							r,
							i = {},
							a = Object.keys(e)
						for (r = 0; r < a.length; r++)
							(t = a[r]), n.indexOf(t) >= 0 || (i[t] = e[t])
						return i
					})(e, n)
				if (Object.getOwnPropertySymbols) {
					var a = Object.getOwnPropertySymbols(e)
					for (r = 0; r < a.length; r++)
						(t = a[r]),
							n.indexOf(t) >= 0 ||
								(Object.prototype.propertyIsEnumerable.call(e, t) &&
									(i[t] = e[t]))
				}
				return i
			}
			var l = r.createContext({}),
				c = function (e) {
					var n = r.useContext(l),
						t = n
					return e && (t = "function" == typeof e ? e(n) : o(o({}, n), e)), t
				},
				d = function (e) {
					var n = c(e.components)
					return r.createElement(l.Provider, { value: n }, e.children)
				},
				p = {
					inlineCode: "code",
					wrapper: function (e) {
						var n = e.children
						return r.createElement(r.Fragment, {}, n)
					}
				},
				m = r.forwardRef(function (e, n) {
					var t = e.components,
						i = e.mdxType,
						a = e.originalType,
						l = e.parentName,
						d = s(e, ["components", "mdxType", "originalType", "parentName"]),
						m = c(t),
						f = i,
						u = m["".concat(l, ".").concat(f)] || m[f] || p[f] || a
					return t
						? r.createElement(u, o(o({ ref: n }, d), {}, { components: t }))
						: r.createElement(u, o({ ref: n }, d))
				})
			function f(e, n) {
				var t = arguments,
					i = n && n.mdxType
				if ("string" == typeof e || i) {
					var a = t.length,
						o = new Array(a)
					o[0] = m
					var s = {}
					for (var l in n) hasOwnProperty.call(n, l) && (s[l] = n[l])
					;(s.originalType = e),
						(s.mdxType = "string" == typeof e ? e : i),
						(o[1] = s)
					for (var c = 2; c < a; c++) o[c] = t[c]
					return r.createElement.apply(null, o)
				}
				return r.createElement.apply(null, t)
			}
			m.displayName = "MDXCreateElement"
		},
		4148: function (e, n, t) {
			t.r(n),
				t.d(n, {
					frontMatter: function () {
						return s
					},
					contentTitle: function () {
						return l
					},
					metadata: function () {
						return c
					},
					toc: function () {
						return d
					},
					default: function () {
						return m
					}
				})
			var r = t(7462),
				i = t(3366),
				a = (t(7294), t(3905)),
				o = ["components"],
				s = {
					id: "ProjectConfig",
					title: "Interface: ProjectConfig",
					sidebar_label: "ProjectConfig",
					sidebar_position: 0,
					custom_edit_url: null
				},
				l = void 0,
				c = {
					unversionedId: "release-mastermind/interfaces/ProjectConfig",
					id: "release-mastermind/interfaces/ProjectConfig",
					isDocsHomePage: !1,
					title: "Interface: ProjectConfig",
					description: "The project configuration",
					source: "@site/docs/release-mastermind/interfaces/ProjectConfig.md",
					sourceDirName: "release-mastermind/interfaces",
					slug: "/release-mastermind/interfaces/ProjectConfig",
					permalink:
						"/action-masterminds/docs/release-mastermind/interfaces/ProjectConfig",
					editUrl: null,
					version: "current",
					sidebarPosition: 0,
					frontMatter: {
						id: "ProjectConfig",
						title: "Interface: ProjectConfig",
						sidebar_label: "ProjectConfig",
						sidebar_position: 0,
						custom_edit_url: null
					},
					sidebar: "release",
					previous: {
						title: "ProjectConditionConfig",
						permalink:
							"/action-masterminds/docs/release-mastermind/interfaces/ProjectConditionConfig"
					},
					next: {
						title: "PullRequestConfig",
						permalink:
							"/action-masterminds/docs/release-mastermind/interfaces/PullRequestConfig"
					}
				},
				d = [
					{ value: "Hierarchy", id: "hierarchy", children: [] },
					{
						value: "Properties",
						id: "properties",
						children: [
							{ value: "assignMilestone", id: "assignmilestone", children: [] },
							{
								value: "enforceConventions",
								id: "enforceconventions",
								children: []
							},
							{ value: "labels", id: "labels", children: [] },
							{ value: "openBranch", id: "openbranch", children: [] },
							{ value: "ref", id: "ref", children: [] },
							{ value: "stale", id: "stale", children: [] },
							{ value: "syncRemote", id: "syncremote", children: [] }
						]
					}
				],
				p = { toc: d }
			function m(e) {
				var n = e.components,
					t = (0, i.Z)(e, o)
				return (0, a.kt)(
					"wrapper",
					(0, r.Z)({}, p, t, { components: n, mdxType: "MDXLayout" }),
					(0, a.kt)("p", null, "The project configuration"),
					(0, a.kt)("h2", { id: "hierarchy" }, "Hierarchy"),
					(0, a.kt)(
						"ul",
						null,
						(0, a.kt)(
							"li",
							{ parentName: "ul" },
							(0, a.kt)(
								"p",
								{ parentName: "li" },
								(0, a.kt)(
									"a",
									{
										parentName: "p",
										href:
											"/action-masterminds/docs/release-mastermind/interfaces/SharedConfig"
									},
									(0, a.kt)("inlineCode", { parentName: "a" }, "SharedConfig")
								)
							),
							(0, a.kt)(
								"p",
								{ parentName: "li" },
								"\u21b3 ",
								(0, a.kt)(
									"strong",
									{ parentName: "p" },
									(0, a.kt)(
										"inlineCode",
										{ parentName: "strong" },
										"ProjectConfig"
									)
								)
							)
						)
					),
					(0, a.kt)("h2", { id: "properties" }, "Properties"),
					(0, a.kt)("h3", { id: "assignmilestone" }, "assignMilestone"),
					(0, a.kt)(
						"p",
						null,
						"\u2022 ",
						(0, a.kt)("inlineCode", { parentName: "p" }, "Optional"),
						" ",
						(0, a.kt)("strong", { parentName: "p" }, "assignMilestone"),
						": ",
						(0, a.kt)("inlineCode", { parentName: "p" }, "Object")
					),
					(0, a.kt)("p", null, "Assign to milestone configuration"),
					(0, a.kt)("h4", { id: "index-signature" }, "Index signature"),
					(0, a.kt)(
						"p",
						null,
						"\u25aa ",
						"[milestone: ",
						(0, a.kt)("inlineCode", { parentName: "p" }, "string"),
						"]",
						": ",
						(0, a.kt)("inlineCode", { parentName: "p" }, "Milestones")
					),
					(0, a.kt)("h4", { id: "defined-in" }, "Defined in"),
					(0, a.kt)(
						"p",
						null,
						(0, a.kt)(
							"a",
							{
								parentName: "p",
								href:
									"https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/contexts/projects.ts#L30"
							},
							"contexts/projects.ts:30"
						)
					),
					(0, a.kt)("hr", null),
					(0, a.kt)("h3", { id: "enforceconventions" }, "enforceConventions"),
					(0, a.kt)(
						"p",
						null,
						"\u2022 ",
						(0, a.kt)("inlineCode", { parentName: "p" }, "Optional"),
						" ",
						(0, a.kt)("strong", { parentName: "p" }, "enforceConventions"),
						": ",
						(0, a.kt)("inlineCode", { parentName: "p" }, "EnforceConventions")
					),
					(0, a.kt)(
						"pre",
						null,
						(0, a.kt)(
							"code",
							{ parentName: "pre" },
							"The enforceConventions configuration\n"
						)
					),
					(0, a.kt)("h4", { id: "inherited-from" }, "Inherited from"),
					(0, a.kt)(
						"p",
						null,
						(0, a.kt)(
							"a",
							{
								parentName: "p",
								href:
									"/action-masterminds/docs/release-mastermind/interfaces/SharedConfig"
							},
							"SharedConfig"
						),
						".",
						(0, a.kt)(
							"a",
							{
								parentName: "p",
								href:
									"/action-masterminds/docs/release-mastermind/interfaces/SharedConfig#enforceconventions"
							},
							"enforceConventions"
						)
					),
					(0, a.kt)("h4", { id: "defined-in-1" }, "Defined in"),
					(0, a.kt)(
						"p",
						null,
						(0, a.kt)(
							"a",
							{
								parentName: "p",
								href:
									"https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/action.ts#L119"
							},
							"action.ts:119"
						)
					),
					(0, a.kt)("hr", null),
					(0, a.kt)("h3", { id: "labels" }, "labels"),
					(0, a.kt)(
						"p",
						null,
						"\u2022 ",
						(0, a.kt)("inlineCode", { parentName: "p" }, "Optional"),
						" ",
						(0, a.kt)("strong", { parentName: "p" }, "labels"),
						": ",
						(0, a.kt)("inlineCode", { parentName: "p" }, "Object")
					),
					(0, a.kt)("p", null, "The labels to be applied"),
					(0, a.kt)("h4", { id: "index-signature-1" }, "Index signature"),
					(0, a.kt)(
						"p",
						null,
						"\u25aa ",
						"[key: ",
						(0, a.kt)("inlineCode", { parentName: "p" }, "string"),
						"]",
						": ",
						(0, a.kt)(
							"a",
							{
								parentName: "p",
								href:
									"/action-masterminds/docs/release-mastermind/interfaces/IssueConditionConfig"
							},
							(0, a.kt)(
								"inlineCode",
								{ parentName: "a" },
								"IssueConditionConfig"
							)
						),
						" ",
						"|",
						" ",
						(0, a.kt)(
							"a",
							{
								parentName: "p",
								href:
									"/action-masterminds/docs/release-mastermind/interfaces/ProjectConditionConfig"
							},
							(0, a.kt)(
								"inlineCode",
								{ parentName: "a" },
								"ProjectConditionConfig"
							)
						),
						" ",
						"|",
						" ",
						(0, a.kt)(
							"a",
							{
								parentName: "p",
								href:
									"/action-masterminds/docs/release-mastermind/interfaces/PRConditionConfig"
							},
							(0, a.kt)("inlineCode", { parentName: "a" }, "PRConditionConfig")
						),
						" ",
						"|",
						" ",
						(0, a.kt)(
							"a",
							{
								parentName: "p",
								href:
									"/action-masterminds/docs/release-mastermind/interfaces/ScheduleConditionConfig"
							},
							(0, a.kt)(
								"inlineCode",
								{ parentName: "a" },
								"ScheduleConditionConfig"
							)
						),
						" ",
						"|",
						" ",
						(0, a.kt)(
							"a",
							{
								parentName: "p",
								href:
									"/action-masterminds/docs/release-mastermind/interfaces/SharedConditions"
							},
							(0, a.kt)("inlineCode", { parentName: "a" }, "SharedConditions")
						)
					),
					(0, a.kt)("h4", { id: "inherited-from-1" }, "Inherited from"),
					(0, a.kt)(
						"p",
						null,
						(0, a.kt)(
							"a",
							{
								parentName: "p",
								href:
									"/action-masterminds/docs/release-mastermind/interfaces/SharedConfig"
							},
							"SharedConfig"
						),
						".",
						(0, a.kt)(
							"a",
							{
								parentName: "p",
								href:
									"/action-masterminds/docs/release-mastermind/interfaces/SharedConfig#labels"
							},
							"labels"
						)
					),
					(0, a.kt)("h4", { id: "defined-in-2" }, "Defined in"),
					(0, a.kt)(
						"p",
						null,
						(0, a.kt)(
							"a",
							{
								parentName: "p",
								href:
									"https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/action.ts#L127"
							},
							"action.ts:127"
						)
					),
					(0, a.kt)("hr", null),
					(0, a.kt)("h3", { id: "openbranch" }, "openBranch"),
					(0, a.kt)(
						"p",
						null,
						"\u2022 ",
						(0, a.kt)("inlineCode", { parentName: "p" }, "Optional"),
						" ",
						(0, a.kt)("strong", { parentName: "p" }, "openBranch"),
						": ",
						(0, a.kt)("inlineCode", { parentName: "p" }, "ProjectCreateBranch")
					),
					(0, a.kt)("p", null, "Open branch configuration"),
					(0, a.kt)("h4", { id: "defined-in-3" }, "Defined in"),
					(0, a.kt)(
						"p",
						null,
						(0, a.kt)(
							"a",
							{
								parentName: "p",
								href:
									"https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/contexts/projects.ts#L26"
							},
							"contexts/projects.ts:26"
						)
					),
					(0, a.kt)("hr", null),
					(0, a.kt)("h3", { id: "ref" }, "ref"),
					(0, a.kt)(
						"p",
						null,
						"\u2022 ",
						(0, a.kt)("inlineCode", { parentName: "p" }, "Optional"),
						" ",
						(0, a.kt)("strong", { parentName: "p" }, "ref"),
						": ",
						(0, a.kt)("inlineCode", { parentName: "p" }, "string")
					),
					(0, a.kt)("p", null, "The reference used internally"),
					(0, a.kt)("h4", { id: "inherited-from-2" }, "Inherited from"),
					(0, a.kt)(
						"p",
						null,
						(0, a.kt)(
							"a",
							{
								parentName: "p",
								href:
									"/action-masterminds/docs/release-mastermind/interfaces/SharedConfig"
							},
							"SharedConfig"
						),
						".",
						(0, a.kt)(
							"a",
							{
								parentName: "p",
								href:
									"/action-masterminds/docs/release-mastermind/interfaces/SharedConfig#ref"
							},
							"ref"
						)
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
									"https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/action.ts#L115"
							},
							"action.ts:115"
						)
					),
					(0, a.kt)("hr", null),
					(0, a.kt)("h3", { id: "stale" }, "stale"),
					(0, a.kt)(
						"p",
						null,
						"\u2022 ",
						(0, a.kt)("inlineCode", { parentName: "p" }, "Optional"),
						" ",
						(0, a.kt)("strong", { parentName: "p" }, "stale"),
						": ",
						(0, a.kt)("inlineCode", { parentName: "p" }, "Stale")
					),
					(0, a.kt)(
						"pre",
						null,
						(0, a.kt)(
							"code",
							{ parentName: "pre" },
							"The stale configuration\n"
						)
					),
					(0, a.kt)("h4", { id: "inherited-from-3" }, "Inherited from"),
					(0, a.kt)(
						"p",
						null,
						(0, a.kt)(
							"a",
							{
								parentName: "p",
								href:
									"/action-masterminds/docs/release-mastermind/interfaces/SharedConfig"
							},
							"SharedConfig"
						),
						".",
						(0, a.kt)(
							"a",
							{
								parentName: "p",
								href:
									"/action-masterminds/docs/release-mastermind/interfaces/SharedConfig#stale"
							},
							"stale"
						)
					),
					(0, a.kt)("h4", { id: "defined-in-5" }, "Defined in"),
					(0, a.kt)(
						"p",
						null,
						(0, a.kt)(
							"a",
							{
								parentName: "p",
								href:
									"https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/action.ts#L123"
							},
							"action.ts:123"
						)
					),
					(0, a.kt)("hr", null),
					(0, a.kt)("h3", { id: "syncremote" }, "syncRemote"),
					(0, a.kt)(
						"p",
						null,
						"\u2022 ",
						(0, a.kt)("inlineCode", { parentName: "p" }, "Optional"),
						" ",
						(0, a.kt)("strong", { parentName: "p" }, "syncRemote"),
						": ",
						(0, a.kt)("inlineCode", { parentName: "p" }, "ExProjects"),
						"[]"
					),
					(0, a.kt)("p", null, "Syncronise remote repository configuration."),
					(0, a.kt)("h4", { id: "defined-in-6" }, "Defined in"),
					(0, a.kt)(
						"p",
						null,
						(0, a.kt)(
							"a",
							{
								parentName: "p",
								href:
									"https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/contexts/projects.ts#L22"
							},
							"contexts/projects.ts:22"
						)
					)
				)
			}
			m.isMDXComponent = !0
		}
	}
])
