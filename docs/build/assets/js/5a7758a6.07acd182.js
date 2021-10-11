/** @format */

"use strict"
;(self.webpackChunkaction_masterminds =
	self.webpackChunkaction_masterminds || []).push([
	[9943],
	{
		3905: function (e, n, t) {
			t.d(n, {
				Zo: function () {
					return u
				},
				kt: function () {
					return m
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
				u = function (e) {
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
				d = r.forwardRef(function (e, n) {
					var t = e.components,
						i = e.mdxType,
						a = e.originalType,
						l = e.parentName,
						u = s(e, ["components", "mdxType", "originalType", "parentName"]),
						d = c(t),
						m = i,
						f = d["".concat(l, ".").concat(m)] || d[m] || p[m] || a
					return t
						? r.createElement(f, o(o({ ref: n }, u), {}, { components: t }))
						: r.createElement(f, o({ ref: n }, u))
				})
			function m(e, n) {
				var t = arguments,
					i = n && n.mdxType
				if ("string" == typeof e || i) {
					var a = t.length,
						o = new Array(a)
					o[0] = d
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
			d.displayName = "MDXCreateElement"
		},
		2969: function (e, n, t) {
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
						return u
					},
					default: function () {
						return d
					}
				})
			var r = t(7462),
				i = t(3366),
				a = (t(7294), t(3905)),
				o = ["components"],
				s = {
					id: "Runners",
					title: "Interface: Runners",
					sidebar_label: "Runners",
					sidebar_position: 0,
					custom_edit_url: null
				},
				l = void 0,
				c = {
					unversionedId: "release-mastermind/interfaces/Runners",
					id: "release-mastermind/interfaces/Runners",
					isDocsHomePage: !1,
					title: "Interface: Runners",
					description: "Properties",
					source: "@site/docs/release-mastermind/interfaces/Runners.md",
					sourceDirName: "release-mastermind/interfaces",
					slug: "/release-mastermind/interfaces/Runners",
					permalink:
						"/action-masterminds/docs/release-mastermind/interfaces/Runners",
					editUrl: null,
					version: "current",
					sidebarPosition: 0,
					frontMatter: {
						id: "Runners",
						title: "Interface: Runners",
						sidebar_label: "Runners",
						sidebar_position: 0,
						custom_edit_url: null
					},
					sidebar: "release",
					previous: {
						title: "Repo",
						permalink:
							"/action-masterminds/docs/release-mastermind/interfaces/Repo"
					},
					next: {
						title: "ScheduleConditionConfig",
						permalink:
							"/action-masterminds/docs/release-mastermind/interfaces/ScheduleConditionConfig"
					}
				},
				u = [
					{
						value: "Properties",
						id: "properties",
						children: [
							{ value: "labels", id: "labels", children: [] },
							{ value: "runners", id: "runners", children: [] }
						]
					}
				],
				p = { toc: u }
			function d(e) {
				var n = e.components,
					t = (0, i.Z)(e, o)
				return (0, a.kt)(
					"wrapper",
					(0, r.Z)({}, p, t, { components: n, mdxType: "MDXLayout" }),
					(0, a.kt)("h2", { id: "properties" }, "Properties"),
					(0, a.kt)("h3", { id: "labels" }, "labels"),
					(0, a.kt)(
						"p",
						null,
						"\u2022 ",
						(0, a.kt)("inlineCode", { parentName: "p" }, "Optional"),
						" ",
						(0, a.kt)("strong", { parentName: "p" }, "labels"),
						": ",
						(0, a.kt)(
							"a",
							{
								parentName: "p",
								href:
									"/action-masterminds/docs/release-mastermind/interfaces/Labels"
							},
							(0, a.kt)("inlineCode", { parentName: "a" }, "Labels")
						)
					),
					(0, a.kt)("p", null, "The labels configuration."),
					(0, a.kt)("h4", { id: "defined-in" }, "Defined in"),
					(0, a.kt)(
						"p",
						null,
						(0, a.kt)(
							"a",
							{
								parentName: "p",
								href:
									"https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/action.ts#L35"
							},
							"action.ts:35"
						)
					),
					(0, a.kt)("hr", null),
					(0, a.kt)("h3", { id: "runners" }, "runners"),
					(0, a.kt)(
						"p",
						null,
						"\u2022 ",
						(0, a.kt)("strong", { parentName: "p" }, "runners"),
						": ",
						(0, a.kt)(
							"a",
							{
								parentName: "p",
								href:
									"/action-masterminds/docs/release-mastermind/interfaces/Config"
							},
							(0, a.kt)("inlineCode", { parentName: "a" }, "Config")
						),
						"[]"
					),
					(0, a.kt)("p", null, "The runners configuration."),
					(0, a.kt)("h4", { id: "defined-in-1" }, "Defined in"),
					(0, a.kt)(
						"p",
						null,
						(0, a.kt)(
							"a",
							{
								parentName: "p",
								href:
									"https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/action.ts#L39"
							},
							"action.ts:39"
						)
					)
				)
			}
			d.isMDXComponent = !0
		}
	}
])
