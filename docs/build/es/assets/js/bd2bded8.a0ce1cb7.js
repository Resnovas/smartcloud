/** @format */

"use strict"
;(self.webpackChunkaction_masterminds =
	self.webpackChunkaction_masterminds || []).push([
	[8269],
	{
		3905: function (e, n, t) {
			t.d(n, {
				Zo: function () {
					return m
				},
				kt: function () {
					return u
				}
			})
			var i = t(7294)
			function r(e, n, t) {
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
					var i = Object.getOwnPropertySymbols(e)
					n &&
						(i = i.filter(function (n) {
							return Object.getOwnPropertyDescriptor(e, n).enumerable
						})),
						t.push.apply(t, i)
				}
				return t
			}
			function o(e) {
				for (var n = 1; n < arguments.length; n++) {
					var t = null != arguments[n] ? arguments[n] : {}
					n % 2
						? a(Object(t), !0).forEach(function (n) {
								r(e, n, t[n])
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
					i,
					r = (function (e, n) {
						if (null == e) return {}
						var t,
							i,
							r = {},
							a = Object.keys(e)
						for (i = 0; i < a.length; i++)
							(t = a[i]), n.indexOf(t) >= 0 || (r[t] = e[t])
						return r
					})(e, n)
				if (Object.getOwnPropertySymbols) {
					var a = Object.getOwnPropertySymbols(e)
					for (i = 0; i < a.length; i++)
						(t = a[i]),
							n.indexOf(t) >= 0 ||
								(Object.prototype.propertyIsEnumerable.call(e, t) &&
									(r[t] = e[t]))
				}
				return r
			}
			var d = i.createContext({}),
				l = function (e) {
					var n = i.useContext(d),
						t = n
					return e && (t = "function" == typeof e ? e(n) : o(o({}, n), e)), t
				},
				m = function (e) {
					var n = l(e.components)
					return i.createElement(d.Provider, { value: n }, e.children)
				},
				p = {
					inlineCode: "code",
					wrapper: function (e) {
						var n = e.children
						return i.createElement(i.Fragment, {}, n)
					}
				},
				c = i.forwardRef(function (e, n) {
					var t = e.components,
						r = e.mdxType,
						a = e.originalType,
						d = e.parentName,
						m = s(e, ["components", "mdxType", "originalType", "parentName"]),
						c = l(t),
						u = r,
						f = c["".concat(d, ".").concat(u)] || c[u] || p[u] || a
					return t
						? i.createElement(f, o(o({ ref: n }, m), {}, { components: t }))
						: i.createElement(f, o({ ref: n }, m))
				})
			function u(e, n) {
				var t = arguments,
					r = n && n.mdxType
				if ("string" == typeof e || r) {
					var a = t.length,
						o = new Array(a)
					o[0] = c
					var s = {}
					for (var d in n) hasOwnProperty.call(n, d) && (s[d] = n[d])
					;(s.originalType = e),
						(s.mdxType = "string" == typeof e ? e : r),
						(o[1] = s)
					for (var l = 2; l < a; l++) o[l] = t[l]
					return i.createElement.apply(null, o)
				}
				return i.createElement.apply(null, t)
			}
			c.displayName = "MDXCreateElement"
		},
		6944: function (e, n, t) {
			t.r(n),
				t.d(n, {
					frontMatter: function () {
						return s
					},
					contentTitle: function () {
						return d
					},
					metadata: function () {
						return l
					},
					toc: function () {
						return m
					},
					default: function () {
						return c
					}
				})
			var i = t(7462),
				r = t(3366),
				a = (t(7294), t(3905)),
				o = ["components"],
				s = {
					id: "modules",
					title: "@videndum/release-mastermind",
					sidebar_label: "Exports",
					sidebar_position: 0.5,
					custom_edit_url: null
				},
				d = void 0,
				l = {
					unversionedId: "release-mastermind/modules",
					id: "release-mastermind/modules",
					isDocsHomePage: !1,
					title: "@videndum/release-mastermind",
					description: "Interfaces",
					source: "@site/docs/release-mastermind/modules.md",
					sourceDirName: "release-mastermind",
					slug: "/release-mastermind/modules",
					permalink: "/action-masterminds/es/docs/release-mastermind/modules",
					editUrl: null,
					version: "current",
					sidebarPosition: 0.5,
					frontMatter: {
						id: "modules",
						title: "@videndum/release-mastermind",
						sidebar_label: "Exports",
						sidebar_position: 0.5,
						custom_edit_url: null
					},
					sidebar: "release",
					previous: {
						title: "Readme",
						permalink: "/action-masterminds/es/docs/release-mastermind"
					},
					next: {
						title: "ApiProps",
						permalink:
							"/action-masterminds/es/docs/release-mastermind/interfaces/ApiProps"
					}
				},
				m = [
					{ value: "Interfaces", id: "interfaces", children: [] },
					{
						value: "Type aliases",
						id: "type-aliases",
						children: [
							{ value: "Event", id: "event", children: [] },
							{ value: "IssueCondition", id: "issuecondition", children: [] },
							{ value: "PRCondition", id: "prcondition", children: [] },
							{
								value: "ProjectCondition",
								id: "projectcondition",
								children: []
							},
							{
								value: "ScheduleCondition",
								id: "schedulecondition",
								children: []
							},
							{ value: "ScheduleConfig", id: "scheduleconfig", children: [] },
							{ value: "Tags", id: "tags", children: [] },
							{ value: "VersionSource", id: "versionsource", children: [] },
							{ value: "VersionType", id: "versiontype", children: [] },
							{ value: "functionality", id: "functionality", children: [] },
							{ value: "packages", id: "packages", children: [] }
						]
					}
				],
				p = { toc: m }
			function c(e) {
				var n = e.components,
					t = (0, r.Z)(e, o)
				return (0, a.kt)(
					"wrapper",
					(0, i.Z)({}, p, t, { components: n, mdxType: "MDXLayout" }),
					(0, a.kt)("h2", { id: "interfaces" }, "Interfaces"),
					(0, a.kt)(
						"ul",
						null,
						(0, a.kt)(
							"li",
							{ parentName: "ul" },
							(0, a.kt)(
								"a",
								{
									parentName: "li",
									href:
										"/action-masterminds/es/docs/release-mastermind/interfaces/ApiProps"
								},
								"ApiProps"
							)
						),
						(0, a.kt)(
							"li",
							{ parentName: "ul" },
							(0, a.kt)(
								"a",
								{
									parentName: "li",
									href:
										"/action-masterminds/es/docs/release-mastermind/interfaces/Config"
								},
								"Config"
							)
						),
						(0, a.kt)(
							"li",
							{ parentName: "ul" },
							(0, a.kt)(
								"a",
								{
									parentName: "li",
									href:
										"/action-masterminds/es/docs/release-mastermind/interfaces/IssueConditionConfig"
								},
								"IssueConditionConfig"
							)
						),
						(0, a.kt)(
							"li",
							{ parentName: "ul" },
							(0, a.kt)(
								"a",
								{
									parentName: "li",
									href:
										"/action-masterminds/es/docs/release-mastermind/interfaces/IssueConfig"
								},
								"IssueConfig"
							)
						),
						(0, a.kt)(
							"li",
							{ parentName: "ul" },
							(0, a.kt)(
								"a",
								{
									parentName: "li",
									href:
										"/action-masterminds/es/docs/release-mastermind/interfaces/Label"
								},
								"Label"
							)
						),
						(0, a.kt)(
							"li",
							{ parentName: "ul" },
							(0, a.kt)(
								"a",
								{
									parentName: "li",
									href:
										"/action-masterminds/es/docs/release-mastermind/interfaces/Labels"
								},
								"Labels"
							)
						),
						(0, a.kt)(
							"li",
							{ parentName: "ul" },
							(0, a.kt)(
								"a",
								{
									parentName: "li",
									href:
										"/action-masterminds/es/docs/release-mastermind/interfaces/Options"
								},
								"Options"
							)
						),
						(0, a.kt)(
							"li",
							{ parentName: "ul" },
							(0, a.kt)(
								"a",
								{
									parentName: "li",
									href:
										"/action-masterminds/es/docs/release-mastermind/interfaces/PRConditionConfig"
								},
								"PRConditionConfig"
							)
						),
						(0, a.kt)(
							"li",
							{ parentName: "ul" },
							(0, a.kt)(
								"a",
								{
									parentName: "li",
									href:
										"/action-masterminds/es/docs/release-mastermind/interfaces/ProjectConditionConfig"
								},
								"ProjectConditionConfig"
							)
						),
						(0, a.kt)(
							"li",
							{ parentName: "ul" },
							(0, a.kt)(
								"a",
								{
									parentName: "li",
									href:
										"/action-masterminds/es/docs/release-mastermind/interfaces/ProjectConfig"
								},
								"ProjectConfig"
							)
						),
						(0, a.kt)(
							"li",
							{ parentName: "ul" },
							(0, a.kt)(
								"a",
								{
									parentName: "li",
									href:
										"/action-masterminds/es/docs/release-mastermind/interfaces/PullRequestConfig"
								},
								"PullRequestConfig"
							)
						),
						(0, a.kt)(
							"li",
							{ parentName: "ul" },
							(0, a.kt)(
								"a",
								{
									parentName: "li",
									href:
										"/action-masterminds/es/docs/release-mastermind/interfaces/Repo"
								},
								"Repo"
							)
						),
						(0, a.kt)(
							"li",
							{ parentName: "ul" },
							(0, a.kt)(
								"a",
								{
									parentName: "li",
									href:
										"/action-masterminds/es/docs/release-mastermind/interfaces/Runners"
								},
								"Runners"
							)
						),
						(0, a.kt)(
							"li",
							{ parentName: "ul" },
							(0, a.kt)(
								"a",
								{
									parentName: "li",
									href:
										"/action-masterminds/es/docs/release-mastermind/interfaces/ScheduleConditionConfig"
								},
								"ScheduleConditionConfig"
							)
						),
						(0, a.kt)(
							"li",
							{ parentName: "ul" },
							(0, a.kt)(
								"a",
								{
									parentName: "li",
									href:
										"/action-masterminds/es/docs/release-mastermind/interfaces/SharedConditions"
								},
								"SharedConditions"
							)
						),
						(0, a.kt)(
							"li",
							{ parentName: "ul" },
							(0, a.kt)(
								"a",
								{
									parentName: "li",
									href:
										"/action-masterminds/es/docs/release-mastermind/interfaces/SharedConfig"
								},
								"SharedConfig"
							)
						),
						(0, a.kt)(
							"li",
							{ parentName: "ul" },
							(0, a.kt)(
								"a",
								{
									parentName: "li",
									href:
										"/action-masterminds/es/docs/release-mastermind/interfaces/SharedConventionConditions"
								},
								"SharedConventionConditions"
							)
						)
					),
					(0, a.kt)("h2", { id: "type-aliases" }, "Type aliases"),
					(0, a.kt)("h3", { id: "event" }, "Event"),
					(0, a.kt)(
						"p",
						null,
						"\u01ac ",
						(0, a.kt)("strong", { parentName: "p" }, "Event"),
						": ",
						(0, a.kt)("inlineCode", { parentName: "p" }, '"REQUEST_CHANGES"'),
						" ",
						"|",
						" ",
						(0, a.kt)("inlineCode", { parentName: "p" }, '"APPROVE"'),
						" ",
						"|",
						" ",
						(0, a.kt)("inlineCode", { parentName: "p" }, '"COMMENT"')
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
									"https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/utils/index.ts#L215"
							},
							"utils/index.ts:215"
						)
					),
					(0, a.kt)("hr", null),
					(0, a.kt)("h3", { id: "issuecondition" }, "IssueCondition"),
					(0, a.kt)(
						"p",
						null,
						"\u01ac ",
						(0, a.kt)("strong", { parentName: "p" }, "IssueCondition"),
						": ",
						(0, a.kt)("inlineCode", { parentName: "p" }, "Condition")
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
									"https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/conditions/issue/index.ts#L6"
							},
							"conditions/issue/index.ts:6"
						)
					),
					(0, a.kt)("hr", null),
					(0, a.kt)("h3", { id: "prcondition" }, "PRCondition"),
					(0, a.kt)(
						"p",
						null,
						"\u01ac ",
						(0, a.kt)("strong", { parentName: "p" }, "PRCondition"),
						": ",
						(0, a.kt)("inlineCode", { parentName: "p" }, "Condition"),
						" ",
						"|",
						" ",
						(0, a.kt)(
							"inlineCode",
							{ parentName: "p" },
							"ConditionBranchMatches"
						),
						" ",
						"|",
						" ",
						(0, a.kt)("inlineCode", { parentName: "p" }, "ConditionFilesMatch"),
						" ",
						"|",
						" ",
						(0, a.kt)("inlineCode", { parentName: "p" }, "ConditionIsDraft"),
						" ",
						"|",
						" ",
						(0, a.kt)(
							"inlineCode",
							{ parentName: "p" },
							"ConditionChangesSize"
						),
						" ",
						"|",
						" ",
						(0, a.kt)(
							"inlineCode",
							{ parentName: "p" },
							"ConditionPendingReview"
						),
						" ",
						"|",
						" ",
						(0, a.kt)(
							"inlineCode",
							{ parentName: "p" },
							"ConditionRequestedChanges"
						),
						" ",
						"|",
						" ",
						(0, a.kt)("inlineCode", { parentName: "p" }, "ConditionisApproved")
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
									"https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/conditions/pr/index.ts#L13"
							},
							"conditions/pr/index.ts:13"
						)
					),
					(0, a.kt)("hr", null),
					(0, a.kt)("h3", { id: "projectcondition" }, "ProjectCondition"),
					(0, a.kt)(
						"p",
						null,
						"\u01ac ",
						(0, a.kt)("strong", { parentName: "p" }, "ProjectCondition"),
						": ",
						(0, a.kt)("inlineCode", { parentName: "p" }, "Condition"),
						" ",
						"|",
						" ",
						(0, a.kt)("inlineCode", { parentName: "p" }, "ConditiononColumn")
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
									"https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/conditions/project/index.ts#L7"
							},
							"conditions/project/index.ts:7"
						)
					),
					(0, a.kt)("hr", null),
					(0, a.kt)("h3", { id: "schedulecondition" }, "ScheduleCondition"),
					(0, a.kt)(
						"p",
						null,
						"\u01ac ",
						(0, a.kt)("strong", { parentName: "p" }, "ScheduleCondition"),
						": ",
						(0, a.kt)("inlineCode", { parentName: "p" }, "Condition")
					),
					(0, a.kt)("h4", { id: "defined-in-4" }, "Defined in"),
					(0, a.kt)("p", null, "conditions/schedule/index.ts:6"),
					(0, a.kt)("hr", null),
					(0, a.kt)("h3", { id: "scheduleconfig" }, "ScheduleConfig"),
					(0, a.kt)(
						"p",
						null,
						"\u01ac ",
						(0, a.kt)("strong", { parentName: "p" }, "ScheduleConfig"),
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
					(0, a.kt)("p", null, "The schedule configuration"),
					(0, a.kt)("h4", { id: "defined-in-5" }, "Defined in"),
					(0, a.kt)("p", null, "contexts/schedule.ts:15"),
					(0, a.kt)("hr", null),
					(0, a.kt)("h3", { id: "tags" }, "Tags"),
					(0, a.kt)(
						"p",
						null,
						"\u01ac ",
						(0, a.kt)("strong", { parentName: "p" }, "Tags"),
						": ",
						(0, a.kt)("inlineCode", { parentName: "p" }, "string"),
						"[]"
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
									"https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/utils/index.ts#L216"
							},
							"utils/index.ts:216"
						)
					),
					(0, a.kt)("hr", null),
					(0, a.kt)("h3", { id: "versionsource" }, "VersionSource"),
					(0, a.kt)(
						"p",
						null,
						"\u01ac ",
						(0, a.kt)("strong", { parentName: "p" }, "VersionSource"),
						": ",
						(0, a.kt)("inlineCode", { parentName: "p" }, '"node"'),
						" ",
						"|",
						" ",
						(0, a.kt)("inlineCode", { parentName: "p" }, '"milestones"'),
						" ",
						"|",
						" ",
						(0, a.kt)("inlineCode", { parentName: "p" }, "string")
					),
					(0, a.kt)(
						"p",
						null,
						"The version source.\nNode: A node project, our package will use the package.json to determine the version.\nMilestones: Utilises the Github Milestone API to determine the version.\nString: A string to use as the version."
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
									"https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/action.ts#L174"
							},
							"action.ts:174"
						)
					),
					(0, a.kt)("hr", null),
					(0, a.kt)("h3", { id: "versiontype" }, "VersionType"),
					(0, a.kt)(
						"p",
						null,
						"\u01ac ",
						(0, a.kt)("strong", { parentName: "p" }, "VersionType"),
						": ",
						(0, a.kt)("inlineCode", { parentName: "p" }, '"SemVer"')
					),
					(0, a.kt)(
						"p",
						null,
						"The version number type. This is used to determine how versioning is handled. SemVer is the default."
					),
					(0, a.kt)("h4", { id: "defined-in-8" }, "Defined in"),
					(0, a.kt)(
						"p",
						null,
						(0, a.kt)(
							"a",
							{
								parentName: "p",
								href:
									"https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/action.ts#L179"
							},
							"action.ts:179"
						)
					),
					(0, a.kt)("hr", null),
					(0, a.kt)("h3", { id: "functionality" }, "functionality"),
					(0, a.kt)(
						"p",
						null,
						"\u01ac ",
						(0, a.kt)("strong", { parentName: "p" }, "functionality"),
						": ",
						(0, a.kt)("inlineCode", { parentName: "p" }, '"release"'),
						" ",
						"|",
						" ",
						(0, a.kt)("inlineCode", { parentName: "p" }, '"convention"'),
						" ",
						"|",
						" ",
						(0, a.kt)("inlineCode", { parentName: "p" }, '"label"')
					),
					(0, a.kt)("h4", { id: "defined-in-9" }, "Defined in"),
					(0, a.kt)(
						"p",
						null,
						(0, a.kt)(
							"a",
							{
								parentName: "p",
								href:
									"https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/utils/index.ts#L208"
							},
							"utils/index.ts:208"
						)
					),
					(0, a.kt)("hr", null),
					(0, a.kt)("h3", { id: "packages" }, "packages"),
					(0, a.kt)(
						"p",
						null,
						"\u01ac ",
						(0, a.kt)("strong", { parentName: "p" }, "packages"),
						": ",
						(0, a.kt)(
							"inlineCode",
							{ parentName: "p" },
							'"@videndum/release-mastermind"'
						),
						" ",
						"|",
						" ",
						(0, a.kt)(
							"inlineCode",
							{ parentName: "p" },
							'"@videndum/label-mastermind"'
						),
						" ",
						"|",
						" ",
						(0, a.kt)(
							"inlineCode",
							{ parentName: "p" },
							'"@videndum/convention-mastermind"'
						),
						" ",
						"|",
						" ",
						(0, a.kt)("inlineCode", { parentName: "p" }, "undefined")
					),
					(0, a.kt)("h4", { id: "defined-in-10" }, "Defined in"),
					(0, a.kt)(
						"p",
						null,
						(0, a.kt)(
							"a",
							{
								parentName: "p",
								href:
									"https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/utils/index.ts#L209"
							},
							"utils/index.ts:209"
						)
					)
				)
			}
			c.isMDXComponent = !0
		}
	}
])
