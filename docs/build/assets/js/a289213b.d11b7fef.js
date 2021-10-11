/** @format */

"use strict"
;(self.webpackChunkaction_masterminds =
	self.webpackChunkaction_masterminds || []).push([
	[7002],
	{
		3905: function (e, t, n) {
			n.d(t, {
				Zo: function () {
					return p
				},
				kt: function () {
					return m
				}
			})
			var r = n(7294)
			function a(e, t, n) {
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
			function i(e, t) {
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
						? i(Object(n), !0).forEach(function (t) {
								a(e, t, n[t])
						  })
						: Object.getOwnPropertyDescriptors
						? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
						: i(Object(n)).forEach(function (t) {
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
					a = (function (e, t) {
						if (null == e) return {}
						var n,
							r,
							a = {},
							i = Object.keys(e)
						for (r = 0; r < i.length; r++)
							(n = i[r]), t.indexOf(n) >= 0 || (a[n] = e[n])
						return a
					})(e, t)
				if (Object.getOwnPropertySymbols) {
					var i = Object.getOwnPropertySymbols(e)
					for (r = 0; r < i.length; r++)
						(n = i[r]),
							t.indexOf(n) >= 0 ||
								(Object.prototype.propertyIsEnumerable.call(e, n) &&
									(a[n] = e[n]))
				}
				return a
			}
			var s = r.createContext({}),
				c = function (e) {
					var t = r.useContext(s),
						n = t
					return e && (n = "function" == typeof e ? e(t) : o(o({}, t), e)), n
				},
				p = function (e) {
					var t = c(e.components)
					return r.createElement(s.Provider, { value: t }, e.children)
				},
				u = {
					inlineCode: "code",
					wrapper: function (e) {
						var t = e.children
						return r.createElement(r.Fragment, {}, t)
					}
				},
				d = r.forwardRef(function (e, t) {
					var n = e.components,
						a = e.mdxType,
						i = e.originalType,
						s = e.parentName,
						p = l(e, ["components", "mdxType", "originalType", "parentName"]),
						d = c(n),
						m = a,
						f = d["".concat(s, ".").concat(m)] || d[m] || u[m] || i
					return n
						? r.createElement(f, o(o({ ref: t }, p), {}, { components: n }))
						: r.createElement(f, o({ ref: t }, p))
				})
			function m(e, t) {
				var n = arguments,
					a = t && t.mdxType
				if ("string" == typeof e || a) {
					var i = n.length,
						o = new Array(i)
					o[0] = d
					var l = {}
					for (var s in t) hasOwnProperty.call(t, s) && (l[s] = t[s])
					;(l.originalType = e),
						(l.mdxType = "string" == typeof e ? e : a),
						(o[1] = l)
					for (var c = 2; c < i; c++) o[c] = n[c]
					return r.createElement.apply(null, o)
				}
				return r.createElement.apply(null, n)
			}
			d.displayName = "MDXCreateElement"
		},
		3833: function (e, t, n) {
			n.r(t),
				n.d(t, {
					frontMatter: function () {
						return l
					},
					contentTitle: function () {
						return s
					},
					metadata: function () {
						return c
					},
					toc: function () {
						return p
					},
					default: function () {
						return d
					}
				})
			var r = n(7462),
				a = n(3366),
				i = (n(7294), n(3905)),
				o = ["components"],
				l = {
					id: "Label",
					title: "Interface: Label",
					sidebar_label: "Label",
					sidebar_position: 0,
					custom_edit_url: null
				},
				s = void 0,
				c = {
					unversionedId: "release-mastermind/interfaces/Label",
					id: "release-mastermind/interfaces/Label",
					isDocsHomePage: !1,
					title: "Interface: Label",
					description: "The labels configuration.",
					source: "@site/docs/release-mastermind/interfaces/Label.md",
					sourceDirName: "release-mastermind/interfaces",
					slug: "/release-mastermind/interfaces/Label",
					permalink:
						"/action-masterminds/docs/release-mastermind/interfaces/Label",
					editUrl: null,
					version: "current",
					sidebarPosition: 0,
					frontMatter: {
						id: "Label",
						title: "Interface: Label",
						sidebar_label: "Label",
						sidebar_position: 0,
						custom_edit_url: null
					},
					sidebar: "release",
					previous: {
						title: "IssueConfig",
						permalink:
							"/action-masterminds/docs/release-mastermind/interfaces/IssueConfig"
					},
					next: {
						title: "Labels",
						permalink:
							"/action-masterminds/docs/release-mastermind/interfaces/Labels"
					}
				},
				p = [
					{
						value: "Properties",
						id: "properties",
						children: [
							{ value: "color", id: "color", children: [] },
							{ value: "description", id: "description", children: [] },
							{ value: "name", id: "name", children: [] }
						]
					}
				],
				u = { toc: p }
			function d(e) {
				var t = e.components,
					n = (0, a.Z)(e, o)
				return (0, i.kt)(
					"wrapper",
					(0, r.Z)({}, u, n, { components: t, mdxType: "MDXLayout" }),
					(0, i.kt)("p", null, "The labels configuration."),
					(0, i.kt)(
						"p",
						null,
						(0, i.kt)(
							"strong",
							{ parentName: "p" },
							(0, i.kt)("inlineCode", { parentName: "strong" }, "param")
						),
						" The name as appears on github"
					),
					(0, i.kt)(
						"p",
						null,
						(0, i.kt)(
							"strong",
							{ parentName: "p" },
							(0, i.kt)("inlineCode", { parentName: "strong" }, "param")
						),
						" A description of the label"
					),
					(0, i.kt)(
						"p",
						null,
						(0, i.kt)(
							"strong",
							{ parentName: "p" },
							(0, i.kt)("inlineCode", { parentName: "strong" }, "param")
						),
						" The color of the label"
					),
					(0, i.kt)("h2", { id: "properties" }, "Properties"),
					(0, i.kt)("h3", { id: "color" }, "color"),
					(0, i.kt)(
						"p",
						null,
						"\u2022 ",
						(0, i.kt)("strong", { parentName: "p" }, "color"),
						": ",
						(0, i.kt)("inlineCode", { parentName: "p" }, "string")
					),
					(0, i.kt)("p", null, "The color of the label"),
					(0, i.kt)("h4", { id: "defined-in" }, "Defined in"),
					(0, i.kt)(
						"p",
						null,
						(0, i.kt)(
							"a",
							{
								parentName: "p",
								href:
									"https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/action.ts#L155"
							},
							"action.ts:155"
						)
					),
					(0, i.kt)("hr", null),
					(0, i.kt)("h3", { id: "description" }, "description"),
					(0, i.kt)(
						"p",
						null,
						"\u2022 ",
						(0, i.kt)("strong", { parentName: "p" }, "description"),
						": ",
						(0, i.kt)("inlineCode", { parentName: "p" }, "string")
					),
					(0, i.kt)("p", null, "A description of the label"),
					(0, i.kt)("h4", { id: "defined-in-1" }, "Defined in"),
					(0, i.kt)(
						"p",
						null,
						(0, i.kt)(
							"a",
							{
								parentName: "p",
								href:
									"https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/action.ts#L151"
							},
							"action.ts:151"
						)
					),
					(0, i.kt)("hr", null),
					(0, i.kt)("h3", { id: "name" }, "name"),
					(0, i.kt)(
						"p",
						null,
						"\u2022 ",
						(0, i.kt)("strong", { parentName: "p" }, "name"),
						": ",
						(0, i.kt)("inlineCode", { parentName: "p" }, "string")
					),
					(0, i.kt)("p", null, "The name as appears on github"),
					(0, i.kt)("h4", { id: "defined-in-2" }, "Defined in"),
					(0, i.kt)(
						"p",
						null,
						(0, i.kt)(
							"a",
							{
								parentName: "p",
								href:
									"https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/action.ts#L147"
							},
							"action.ts:147"
						)
					)
				)
			}
			d.isMDXComponent = !0
		}
	}
])
