/** @format */

"use strict"
;(self.webpackChunkaction_masterminds =
	self.webpackChunkaction_masterminds || []).push([
	[8197],
	{
		3905: function (e, n, t) {
			t.d(n, {
				Zo: function () {
					return d
				},
				kt: function () {
					return p
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
			function o(e, n) {
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
			function s(e) {
				for (var n = 1; n < arguments.length; n++) {
					var t = null != arguments[n] ? arguments[n] : {}
					n % 2
						? o(Object(t), !0).forEach(function (n) {
								i(e, n, t[n])
						  })
						: Object.getOwnPropertyDescriptors
						? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t))
						: o(Object(t)).forEach(function (n) {
								Object.defineProperty(
									e,
									n,
									Object.getOwnPropertyDescriptor(t, n)
								)
						  })
				}
				return e
			}
			function a(e, n) {
				if (null == e) return {}
				var t,
					r,
					i = (function (e, n) {
						if (null == e) return {}
						var t,
							r,
							i = {},
							o = Object.keys(e)
						for (r = 0; r < o.length; r++)
							(t = o[r]), n.indexOf(t) >= 0 || (i[t] = e[t])
						return i
					})(e, n)
				if (Object.getOwnPropertySymbols) {
					var o = Object.getOwnPropertySymbols(e)
					for (r = 0; r < o.length; r++)
						(t = o[r]),
							n.indexOf(t) >= 0 ||
								(Object.prototype.propertyIsEnumerable.call(e, t) &&
									(i[t] = e[t]))
				}
				return i
			}
			var c = r.createContext({}),
				u = function (e) {
					var n = r.useContext(c),
						t = n
					return e && (t = "function" == typeof e ? e(n) : s(s({}, n), e)), t
				},
				d = function (e) {
					var n = u(e.components)
					return r.createElement(c.Provider, { value: n }, e.children)
				},
				l = {
					inlineCode: "code",
					wrapper: function (e) {
						var n = e.children
						return r.createElement(r.Fragment, {}, n)
					}
				},
				f = r.forwardRef(function (e, n) {
					var t = e.components,
						i = e.mdxType,
						o = e.originalType,
						c = e.parentName,
						d = a(e, ["components", "mdxType", "originalType", "parentName"]),
						f = u(t),
						p = i,
						m = f["".concat(c, ".").concat(p)] || f[p] || l[p] || o
					return t
						? r.createElement(m, s(s({ ref: n }, d), {}, { components: t }))
						: r.createElement(m, s({ ref: n }, d))
				})
			function p(e, n) {
				var t = arguments,
					i = n && n.mdxType
				if ("string" == typeof e || i) {
					var o = t.length,
						s = new Array(o)
					s[0] = f
					var a = {}
					for (var c in n) hasOwnProperty.call(n, c) && (a[c] = n[c])
					;(a.originalType = e),
						(a.mdxType = "string" == typeof e ? e : i),
						(s[1] = a)
					for (var u = 2; u < o; u++) s[u] = t[u]
					return r.createElement.apply(null, s)
				}
				return r.createElement.apply(null, t)
			}
			f.displayName = "MDXCreateElement"
		},
		427: function (e, n, t) {
			t.r(n),
				t.d(n, {
					frontMatter: function () {
						return a
					},
					contentTitle: function () {
						return c
					},
					metadata: function () {
						return u
					},
					toc: function () {
						return d
					},
					default: function () {
						return f
					}
				})
			var r = t(7462),
				i = t(3366),
				o = (t(7294), t(3905)),
				s = ["components"],
				a = {
					id: "IssueConditionConfig",
					title: "Interface: IssueConditionConfig",
					sidebar_label: "IssueConditionConfig",
					sidebar_position: 0,
					custom_edit_url: null
				},
				c = void 0,
				u = {
					unversionedId: "release-mastermind/interfaces/IssueConditionConfig",
					id: "release-mastermind/interfaces/IssueConditionConfig",
					isDocsHomePage: !1,
					title: "Interface: IssueConditionConfig",
					description: "The Issue condition configuration",
					source:
						"@site/docs/release-mastermind/interfaces/IssueConditionConfig.md",
					sourceDirName: "release-mastermind/interfaces",
					slug: "/release-mastermind/interfaces/IssueConditionConfig",
					permalink:
						"/action-masterminds/docs/release-mastermind/interfaces/IssueConditionConfig",
					editUrl: null,
					version: "current",
					sidebarPosition: 0,
					frontMatter: {
						id: "IssueConditionConfig",
						title: "Interface: IssueConditionConfig",
						sidebar_label: "IssueConditionConfig",
						sidebar_position: 0,
						custom_edit_url: null
					},
					sidebar: "release",
					previous: {
						title: "Config",
						permalink:
							"/action-masterminds/docs/release-mastermind/interfaces/Config"
					},
					next: {
						title: "IssueConfig",
						permalink:
							"/action-masterminds/docs/release-mastermind/interfaces/IssueConfig"
					}
				},
				d = [
					{
						value: "Properties",
						id: "properties",
						children: [
							{ value: "conditions", id: "conditions", children: [] },
							{ value: "requires", id: "requires", children: [] }
						]
					}
				],
				l = { toc: d }
			function f(e) {
				var n = e.components,
					t = (0, i.Z)(e, s)
				return (0, o.kt)(
					"wrapper",
					(0, r.Z)({}, l, t, { components: n, mdxType: "MDXLayout" }),
					(0, o.kt)("p", null, "The Issue condition configuration"),
					(0, o.kt)("h2", { id: "properties" }, "Properties"),
					(0, o.kt)("h3", { id: "conditions" }, "conditions"),
					(0, o.kt)(
						"p",
						null,
						"\u2022 ",
						(0, o.kt)("strong", { parentName: "p" }, "conditions"),
						": ",
						(0, o.kt)("inlineCode", { parentName: "p" }, "Condition"),
						"[]"
					),
					(0, o.kt)("p", null, "The conditions required for this to succeed"),
					(0, o.kt)("h4", { id: "defined-in" }, "Defined in"),
					(0, o.kt)(
						"p",
						null,
						(0, o.kt)(
							"a",
							{
								parentName: "p",
								href:
									"https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/conditions/index.ts#L250"
							},
							"conditions/index.ts:250"
						)
					),
					(0, o.kt)("hr", null),
					(0, o.kt)("h3", { id: "requires" }, "requires"),
					(0, o.kt)(
						"p",
						null,
						"\u2022 ",
						(0, o.kt)("strong", { parentName: "p" }, "requires"),
						": ",
						(0, o.kt)("inlineCode", { parentName: "p" }, "number")
					),
					(0, o.kt)(
						"p",
						null,
						"The number of requires needed for this to succeed"
					),
					(0, o.kt)("h4", { id: "defined-in-1" }, "Defined in"),
					(0, o.kt)(
						"p",
						null,
						(0, o.kt)(
							"a",
							{
								parentName: "p",
								href:
									"https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/conditions/index.ts#L246"
							},
							"conditions/index.ts:246"
						)
					)
				)
			}
			f.isMDXComponent = !0
		}
	}
])
