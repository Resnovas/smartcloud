/** @format */

"use strict"
;(self.webpackChunkaction_masterminds =
	self.webpackChunkaction_masterminds || []).push([
	[81],
	{
		3905: function (e, n, t) {
			t.d(n, {
				Zo: function () {
					return p
				},
				kt: function () {
					return f
				}
			})
			var r = t(7294)
			function a(e, n, t) {
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
			function i(e, n) {
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
						? i(Object(t), !0).forEach(function (n) {
								a(e, n, t[n])
						  })
						: Object.getOwnPropertyDescriptors
						? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t))
						: i(Object(t)).forEach(function (n) {
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
					a = (function (e, n) {
						if (null == e) return {}
						var t,
							r,
							a = {},
							i = Object.keys(e)
						for (r = 0; r < i.length; r++)
							(t = i[r]), n.indexOf(t) >= 0 || (a[t] = e[t])
						return a
					})(e, n)
				if (Object.getOwnPropertySymbols) {
					var i = Object.getOwnPropertySymbols(e)
					for (r = 0; r < i.length; r++)
						(t = i[r]),
							n.indexOf(t) >= 0 ||
								(Object.prototype.propertyIsEnumerable.call(e, t) &&
									(a[t] = e[t]))
				}
				return a
			}
			var l = r.createContext({}),
				d = function (e) {
					var n = r.useContext(l),
						t = n
					return e && (t = "function" == typeof e ? e(n) : o(o({}, n), e)), t
				},
				p = function (e) {
					var n = d(e.components)
					return r.createElement(l.Provider, { value: n }, e.children)
				},
				c = {
					inlineCode: "code",
					wrapper: function (e) {
						var n = e.children
						return r.createElement(r.Fragment, {}, n)
					}
				},
				m = r.forwardRef(function (e, n) {
					var t = e.components,
						a = e.mdxType,
						i = e.originalType,
						l = e.parentName,
						p = s(e, ["components", "mdxType", "originalType", "parentName"]),
						m = d(t),
						f = a,
						u = m["".concat(l, ".").concat(f)] || m[f] || c[f] || i
					return t
						? r.createElement(u, o(o({ ref: n }, p), {}, { components: t }))
						: r.createElement(u, o({ ref: n }, p))
				})
			function f(e, n) {
				var t = arguments,
					a = n && n.mdxType
				if ("string" == typeof e || a) {
					var i = t.length,
						o = new Array(i)
					o[0] = m
					var s = {}
					for (var l in n) hasOwnProperty.call(n, l) && (s[l] = n[l])
					;(s.originalType = e),
						(s.mdxType = "string" == typeof e ? e : a),
						(o[1] = s)
					for (var d = 2; d < i; d++) o[d] = t[d]
					return r.createElement.apply(null, o)
				}
				return r.createElement.apply(null, t)
			}
			m.displayName = "MDXCreateElement"
		},
		9018: function (e, n, t) {
			t.r(n),
				t.d(n, {
					frontMatter: function () {
						return s
					},
					contentTitle: function () {
						return l
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
			var r = t(7462),
				a = t(3366),
				i = (t(7294), t(3905)),
				o = ["components"],
				s = {
					id: "PullRequestConfig",
					title: "Interface: PullRequestConfig",
					sidebar_label: "PullRequestConfig",
					sidebar_position: 0,
					custom_edit_url: null
				},
				l = void 0,
				d = {
					unversionedId: "release-mastermind/interfaces/PullRequestConfig",
					id: "release-mastermind/interfaces/PullRequestConfig",
					isDocsHomePage: !1,
					title: "Interface: PullRequestConfig",
					description: "The Pull Request configuration",
					source:
						"@site/docs/release-mastermind/interfaces/PullRequestConfig.md",
					sourceDirName: "release-mastermind/interfaces",
					slug: "/release-mastermind/interfaces/PullRequestConfig",
					permalink:
						"/action-masterminds/fr/docs/release-mastermind/interfaces/PullRequestConfig",
					editUrl: null,
					version: "current",
					sidebarPosition: 0,
					frontMatter: {
						id: "PullRequestConfig",
						title: "Interface: PullRequestConfig",
						sidebar_label: "PullRequestConfig",
						sidebar_position: 0,
						custom_edit_url: null
					},
					sidebar: "release",
					previous: {
						title: "ProjectConfig",
						permalink:
							"/action-masterminds/fr/docs/release-mastermind/interfaces/ProjectConfig"
					},
					next: {
						title: "Repo",
						permalink:
							"/action-masterminds/fr/docs/release-mastermind/interfaces/Repo"
					}
				},
				p = [
					{ value: "Hierarchy", id: "hierarchy", children: [] },
					{
						value: "Properties",
						id: "properties",
						children: [
							{ value: "assignProject", id: "assignproject", children: [] },
							{
								value: "automaticApprove",
								id: "automaticapprove",
								children: []
							},
							{
								value: "enforceConventions",
								id: "enforceconventions",
								children: []
							},
							{ value: "labels", id: "labels", children: [] },
							{ value: "manageRelease", id: "managerelease", children: [] },
							{ value: "ref", id: "ref", children: [] },
							{ value: "stale", id: "stale", children: [] },
							{ value: "syncRemote", id: "syncremote", children: [] }
						]
					}
				],
				c = { toc: p }
			function m(e) {
				var n = e.components,
					t = (0, a.Z)(e, o)
				return (0, i.kt)(
					"wrapper",
					(0, r.Z)({}, c, t, { components: n, mdxType: "MDXLayout" }),
					(0, i.kt)("p", null, "The Pull Request configuration"),
					(0, i.kt)("h2", { id: "hierarchy" }, "Hierarchy"),
					(0, i.kt)(
						"ul",
						null,
						(0, i.kt)(
							"li",
							{ parentName: "ul" },
							(0, i.kt)(
								"p",
								{ parentName: "li" },
								(0, i.kt)(
									"a",
									{
										parentName: "p",
										href:
											"/action-masterminds/fr/docs/release-mastermind/interfaces/SharedConfig"
									},
									(0, i.kt)("inlineCode", { parentName: "a" }, "SharedConfig")
								)
							),
							(0, i.kt)(
								"p",
								{ parentName: "li" },
								"\u21b3 ",
								(0, i.kt)(
									"strong",
									{ parentName: "p" },
									(0, i.kt)(
										"inlineCode",
										{ parentName: "strong" },
										"PullRequestConfig"
									)
								)
							)
						)
					),
					(0, i.kt)("h2", { id: "properties" }, "Properties"),
					(0, i.kt)("h3", { id: "assignproject" }, "assignProject"),
					(0, i.kt)(
						"p",
						null,
						"\u2022 ",
						(0, i.kt)("inlineCode", { parentName: "p" }, "Optional"),
						" ",
						(0, i.kt)("strong", { parentName: "p" }, "assignProject"),
						": ",
						(0, i.kt)("inlineCode", { parentName: "p" }, "AssignProject"),
						"[]"
					),
					(0, i.kt)("p", null, " The project assignment configuration."),
					(0, i.kt)("h4", { id: "defined-in" }, "Defined in"),
					(0, i.kt)(
						"p",
						null,
						(0, i.kt)(
							"a",
							{
								parentName: "p",
								href:
									"https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/contexts/pullRequests.ts#L24"
							},
							"contexts/pullRequests.ts:24"
						)
					),
					(0, i.kt)("hr", null),
					(0, i.kt)("h3", { id: "automaticapprove" }, "automaticApprove"),
					(0, i.kt)(
						"p",
						null,
						"\u2022 ",
						(0, i.kt)("inlineCode", { parentName: "p" }, "Optional"),
						" ",
						(0, i.kt)("strong", { parentName: "p" }, "automaticApprove"),
						": ",
						(0, i.kt)("inlineCode", { parentName: "p" }, "AutomaticApprove")
					),
					(0, i.kt)("p", null, "The automatic approval configuration"),
					(0, i.kt)("h4", { id: "defined-in-1" }, "Defined in"),
					(0, i.kt)(
						"p",
						null,
						(0, i.kt)(
							"a",
							{
								parentName: "p",
								href:
									"https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/contexts/pullRequests.ts#L28"
							},
							"contexts/pullRequests.ts:28"
						)
					),
					(0, i.kt)("hr", null),
					(0, i.kt)("h3", { id: "enforceconventions" }, "enforceConventions"),
					(0, i.kt)(
						"p",
						null,
						"\u2022 ",
						(0, i.kt)("inlineCode", { parentName: "p" }, "Optional"),
						" ",
						(0, i.kt)("strong", { parentName: "p" }, "enforceConventions"),
						": ",
						(0, i.kt)("inlineCode", { parentName: "p" }, "EnforceConventions")
					),
					(0, i.kt)(
						"pre",
						null,
						(0, i.kt)(
							"code",
							{ parentName: "pre" },
							"The enforceConventions configuration\n"
						)
					),
					(0, i.kt)("h4", { id: "inherited-from" }, "Inherited from"),
					(0, i.kt)(
						"p",
						null,
						(0, i.kt)(
							"a",
							{
								parentName: "p",
								href:
									"/action-masterminds/fr/docs/release-mastermind/interfaces/SharedConfig"
							},
							"SharedConfig"
						),
						".",
						(0, i.kt)(
							"a",
							{
								parentName: "p",
								href:
									"/action-masterminds/fr/docs/release-mastermind/interfaces/SharedConfig#enforceconventions"
							},
							"enforceConventions"
						)
					),
					(0, i.kt)("h4", { id: "defined-in-2" }, "Defined in"),
					(0, i.kt)(
						"p",
						null,
						(0, i.kt)(
							"a",
							{
								parentName: "p",
								href:
									"https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/action.ts#L119"
							},
							"action.ts:119"
						)
					),
					(0, i.kt)("hr", null),
					(0, i.kt)("h3", { id: "labels" }, "labels"),
					(0, i.kt)(
						"p",
						null,
						"\u2022 ",
						(0, i.kt)("inlineCode", { parentName: "p" }, "Optional"),
						" ",
						(0, i.kt)("strong", { parentName: "p" }, "labels"),
						": ",
						(0, i.kt)("inlineCode", { parentName: "p" }, "Object")
					),
					(0, i.kt)("p", null, "The labels to be applied"),
					(0, i.kt)("h4", { id: "index-signature" }, "Index signature"),
					(0, i.kt)(
						"p",
						null,
						"\u25aa ",
						"[key: ",
						(0, i.kt)("inlineCode", { parentName: "p" }, "string"),
						"]",
						": ",
						(0, i.kt)(
							"a",
							{
								parentName: "p",
								href:
									"/action-masterminds/fr/docs/release-mastermind/interfaces/IssueConditionConfig"
							},
							(0, i.kt)(
								"inlineCode",
								{ parentName: "a" },
								"IssueConditionConfig"
							)
						),
						" ",
						"|",
						" ",
						(0, i.kt)(
							"a",
							{
								parentName: "p",
								href:
									"/action-masterminds/fr/docs/release-mastermind/interfaces/ProjectConditionConfig"
							},
							(0, i.kt)(
								"inlineCode",
								{ parentName: "a" },
								"ProjectConditionConfig"
							)
						),
						" ",
						"|",
						" ",
						(0, i.kt)(
							"a",
							{
								parentName: "p",
								href:
									"/action-masterminds/fr/docs/release-mastermind/interfaces/PRConditionConfig"
							},
							(0, i.kt)("inlineCode", { parentName: "a" }, "PRConditionConfig")
						),
						" ",
						"|",
						" ",
						(0, i.kt)(
							"a",
							{
								parentName: "p",
								href:
									"/action-masterminds/fr/docs/release-mastermind/interfaces/ScheduleConditionConfig"
							},
							(0, i.kt)(
								"inlineCode",
								{ parentName: "a" },
								"ScheduleConditionConfig"
							)
						),
						" ",
						"|",
						" ",
						(0, i.kt)(
							"a",
							{
								parentName: "p",
								href:
									"/action-masterminds/fr/docs/release-mastermind/interfaces/SharedConditions"
							},
							(0, i.kt)("inlineCode", { parentName: "a" }, "SharedConditions")
						)
					),
					(0, i.kt)("h4", { id: "inherited-from-1" }, "Inherited from"),
					(0, i.kt)(
						"p",
						null,
						(0, i.kt)(
							"a",
							{
								parentName: "p",
								href:
									"/action-masterminds/fr/docs/release-mastermind/interfaces/SharedConfig"
							},
							"SharedConfig"
						),
						".",
						(0, i.kt)(
							"a",
							{
								parentName: "p",
								href:
									"/action-masterminds/fr/docs/release-mastermind/interfaces/SharedConfig#labels"
							},
							"labels"
						)
					),
					(0, i.kt)("h4", { id: "defined-in-3" }, "Defined in"),
					(0, i.kt)(
						"p",
						null,
						(0, i.kt)(
							"a",
							{
								parentName: "p",
								href:
									"https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/action.ts#L127"
							},
							"action.ts:127"
						)
					),
					(0, i.kt)("hr", null),
					(0, i.kt)("h3", { id: "managerelease" }, "manageRelease"),
					(0, i.kt)(
						"p",
						null,
						"\u2022 ",
						(0, i.kt)("inlineCode", { parentName: "p" }, "Optional"),
						" ",
						(0, i.kt)("strong", { parentName: "p" }, "manageRelease"),
						": ",
						(0, i.kt)("inlineCode", { parentName: "p" }, "Release")
					),
					(0, i.kt)("p", null, "The release management configuration."),
					(0, i.kt)("h4", { id: "defined-in-4" }, "Defined in"),
					(0, i.kt)(
						"p",
						null,
						(0, i.kt)(
							"a",
							{
								parentName: "p",
								href:
									"https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/contexts/pullRequests.ts#L32"
							},
							"contexts/pullRequests.ts:32"
						)
					),
					(0, i.kt)("hr", null),
					(0, i.kt)("h3", { id: "ref" }, "ref"),
					(0, i.kt)(
						"p",
						null,
						"\u2022 ",
						(0, i.kt)("inlineCode", { parentName: "p" }, "Optional"),
						" ",
						(0, i.kt)("strong", { parentName: "p" }, "ref"),
						": ",
						(0, i.kt)("inlineCode", { parentName: "p" }, "string")
					),
					(0, i.kt)("p", null, "The reference used internally"),
					(0, i.kt)("h4", { id: "inherited-from-2" }, "Inherited from"),
					(0, i.kt)(
						"p",
						null,
						(0, i.kt)(
							"a",
							{
								parentName: "p",
								href:
									"/action-masterminds/fr/docs/release-mastermind/interfaces/SharedConfig"
							},
							"SharedConfig"
						),
						".",
						(0, i.kt)(
							"a",
							{
								parentName: "p",
								href:
									"/action-masterminds/fr/docs/release-mastermind/interfaces/SharedConfig#ref"
							},
							"ref"
						)
					),
					(0, i.kt)("h4", { id: "defined-in-5" }, "Defined in"),
					(0, i.kt)(
						"p",
						null,
						(0, i.kt)(
							"a",
							{
								parentName: "p",
								href:
									"https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/action.ts#L115"
							},
							"action.ts:115"
						)
					),
					(0, i.kt)("hr", null),
					(0, i.kt)("h3", { id: "stale" }, "stale"),
					(0, i.kt)(
						"p",
						null,
						"\u2022 ",
						(0, i.kt)("inlineCode", { parentName: "p" }, "Optional"),
						" ",
						(0, i.kt)("strong", { parentName: "p" }, "stale"),
						": ",
						(0, i.kt)("inlineCode", { parentName: "p" }, "Stale")
					),
					(0, i.kt)(
						"pre",
						null,
						(0, i.kt)(
							"code",
							{ parentName: "pre" },
							"The stale configuration\n"
						)
					),
					(0, i.kt)("h4", { id: "inherited-from-3" }, "Inherited from"),
					(0, i.kt)(
						"p",
						null,
						(0, i.kt)(
							"a",
							{
								parentName: "p",
								href:
									"/action-masterminds/fr/docs/release-mastermind/interfaces/SharedConfig"
							},
							"SharedConfig"
						),
						".",
						(0, i.kt)(
							"a",
							{
								parentName: "p",
								href:
									"/action-masterminds/fr/docs/release-mastermind/interfaces/SharedConfig#stale"
							},
							"stale"
						)
					),
					(0, i.kt)("h4", { id: "defined-in-6" }, "Defined in"),
					(0, i.kt)(
						"p",
						null,
						(0, i.kt)(
							"a",
							{
								parentName: "p",
								href:
									"https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/action.ts#L123"
							},
							"action.ts:123"
						)
					),
					(0, i.kt)("hr", null),
					(0, i.kt)("h3", { id: "syncremote" }, "syncRemote"),
					(0, i.kt)(
						"p",
						null,
						"\u2022 ",
						(0, i.kt)("inlineCode", { parentName: "p" }, "Optional"),
						" ",
						(0, i.kt)("strong", { parentName: "p" }, "syncRemote"),
						": ",
						(0, i.kt)("inlineCode", { parentName: "p" }, "SyncRemote"),
						"[]"
					),
					(0, i.kt)("p", null, "Syncronise remote repository configuration."),
					(0, i.kt)("h4", { id: "defined-in-7" }, "Defined in"),
					(0, i.kt)(
						"p",
						null,
						(0, i.kt)(
							"a",
							{
								parentName: "p",
								href:
									"https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/contexts/pullRequests.ts#L36"
							},
							"contexts/pullRequests.ts:36"
						)
					)
				)
			}
			m.isMDXComponent = !0
		}
	}
])
