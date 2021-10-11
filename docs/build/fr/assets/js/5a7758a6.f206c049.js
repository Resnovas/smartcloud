/** @format */

"use strict"
;(self.webpackChunkaction_masterminds =
	self.webpackChunkaction_masterminds || []).push([
	[9943],
	{
		3905: function (e, n, r) {
			r.d(n, {
				Zo: function () {
					return u
				},
				kt: function () {
					return f
				}
			})
			var t = r(7294)
			function i(e, n, r) {
				return (
					n in e
						? Object.defineProperty(e, n, {
								value: r,
								enumerable: !0,
								configurable: !0,
								writable: !0
						  })
						: (e[n] = r),
					e
				)
			}
			function a(e, n) {
				var r = Object.keys(e)
				if (Object.getOwnPropertySymbols) {
					var t = Object.getOwnPropertySymbols(e)
					n &&
						(t = t.filter(function (n) {
							return Object.getOwnPropertyDescriptor(e, n).enumerable
						})),
						r.push.apply(r, t)
				}
				return r
			}
			function o(e) {
				for (var n = 1; n < arguments.length; n++) {
					var r = null != arguments[n] ? arguments[n] : {}
					n % 2
						? a(Object(r), !0).forEach(function (n) {
								i(e, n, r[n])
						  })
						: Object.getOwnPropertyDescriptors
						? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
						: a(Object(r)).forEach(function (n) {
								Object.defineProperty(
									e,
									n,
									Object.getOwnPropertyDescriptor(r, n)
								)
						  })
				}
				return e
			}
			function s(e, n) {
				if (null == e) return {}
				var r,
					t,
					i = (function (e, n) {
						if (null == e) return {}
						var r,
							t,
							i = {},
							a = Object.keys(e)
						for (t = 0; t < a.length; t++)
							(r = a[t]), n.indexOf(r) >= 0 || (i[r] = e[r])
						return i
					})(e, n)
				if (Object.getOwnPropertySymbols) {
					var a = Object.getOwnPropertySymbols(e)
					for (t = 0; t < a.length; t++)
						(r = a[t]),
							n.indexOf(r) >= 0 ||
								(Object.prototype.propertyIsEnumerable.call(e, r) &&
									(i[r] = e[r]))
				}
				return i
			}
			var l = t.createContext({}),
				c = function (e) {
					var n = t.useContext(l),
						r = n
					return e && (r = "function" == typeof e ? e(n) : o(o({}, n), e)), r
				},
				u = function (e) {
					var n = c(e.components)
					return t.createElement(l.Provider, { value: n }, e.children)
				},
				p = {
					inlineCode: "code",
					wrapper: function (e) {
						var n = e.children
						return t.createElement(t.Fragment, {}, n)
					}
				},
				d = t.forwardRef(function (e, n) {
					var r = e.components,
						i = e.mdxType,
						a = e.originalType,
						l = e.parentName,
						u = s(e, ["components", "mdxType", "originalType", "parentName"]),
						d = c(r),
						f = i,
						m = d["".concat(l, ".").concat(f)] || d[f] || p[f] || a
					return r
						? t.createElement(m, o(o({ ref: n }, u), {}, { components: r }))
						: t.createElement(m, o({ ref: n }, u))
				})
			function f(e, n) {
				var r = arguments,
					i = n && n.mdxType
				if ("string" == typeof e || i) {
					var a = r.length,
						o = new Array(a)
					o[0] = d
					var s = {}
					for (var l in n) hasOwnProperty.call(n, l) && (s[l] = n[l])
					;(s.originalType = e),
						(s.mdxType = "string" == typeof e ? e : i),
						(o[1] = s)
					for (var c = 2; c < a; c++) o[c] = r[c]
					return t.createElement.apply(null, o)
				}
				return t.createElement.apply(null, r)
			}
			d.displayName = "MDXCreateElement"
		},
		2969: function (e, n, r) {
			r.r(n),
				r.d(n, {
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
			var t = r(7462),
				i = r(3366),
				a = (r(7294), r(3905)),
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
						"/action-masterminds/fr/docs/release-mastermind/interfaces/Runners",
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
							"/action-masterminds/fr/docs/release-mastermind/interfaces/Repo"
					},
					next: {
						title: "ScheduleConditionConfig",
						permalink:
							"/action-masterminds/fr/docs/release-mastermind/interfaces/ScheduleConditionConfig"
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
					r = (0, i.Z)(e, o)
				return (0, a.kt)(
					"wrapper",
					(0, t.Z)({}, p, r, { components: n, mdxType: "MDXLayout" }),
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
									"/action-masterminds/fr/docs/release-mastermind/interfaces/Labels"
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
									"/action-masterminds/fr/docs/release-mastermind/interfaces/Config"
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
