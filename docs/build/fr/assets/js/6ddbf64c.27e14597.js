/** @format */

"use strict"
;(self.webpackChunkaction_masterminds =
	self.webpackChunkaction_masterminds || []).push([
	[1871],
	{
		3905: function (t, e, n) {
			n.d(e, {
				Zo: function () {
					return s
				},
				kt: function () {
					return f
				}
			})
			var r = n(7294)
			function i(t, e, n) {
				return (
					e in t
						? Object.defineProperty(t, e, {
								value: n,
								enumerable: !0,
								configurable: !0,
								writable: !0
						  })
						: (t[e] = n),
					t
				)
			}
			function a(t, e) {
				var n = Object.keys(t)
				if (Object.getOwnPropertySymbols) {
					var r = Object.getOwnPropertySymbols(t)
					e &&
						(r = r.filter(function (e) {
							return Object.getOwnPropertyDescriptor(t, e).enumerable
						})),
						n.push.apply(n, r)
				}
				return n
			}
			function o(t) {
				for (var e = 1; e < arguments.length; e++) {
					var n = null != arguments[e] ? arguments[e] : {}
					e % 2
						? a(Object(n), !0).forEach(function (e) {
								i(t, e, n[e])
						  })
						: Object.getOwnPropertyDescriptors
						? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n))
						: a(Object(n)).forEach(function (e) {
								Object.defineProperty(
									t,
									e,
									Object.getOwnPropertyDescriptor(n, e)
								)
						  })
				}
				return t
			}
			function c(t, e) {
				if (null == t) return {}
				var n,
					r,
					i = (function (t, e) {
						if (null == t) return {}
						var n,
							r,
							i = {},
							a = Object.keys(t)
						for (r = 0; r < a.length; r++)
							(n = a[r]), e.indexOf(n) >= 0 || (i[n] = t[n])
						return i
					})(t, e)
				if (Object.getOwnPropertySymbols) {
					var a = Object.getOwnPropertySymbols(t)
					for (r = 0; r < a.length; r++)
						(n = a[r]),
							e.indexOf(n) >= 0 ||
								(Object.prototype.propertyIsEnumerable.call(t, n) &&
									(i[n] = t[n]))
				}
				return i
			}
			var u = r.createContext({}),
				l = function (t) {
					var e = r.useContext(u),
						n = e
					return t && (n = "function" == typeof t ? t(e) : o(o({}, e), t)), n
				},
				s = function (t) {
					var e = l(t.components)
					return r.createElement(u.Provider, { value: e }, t.children)
				},
				p = {
					inlineCode: "code",
					wrapper: function (t) {
						var e = t.children
						return r.createElement(r.Fragment, {}, e)
					}
				},
				m = r.forwardRef(function (t, e) {
					var n = t.components,
						i = t.mdxType,
						a = t.originalType,
						u = t.parentName,
						s = c(t, ["components", "mdxType", "originalType", "parentName"]),
						m = l(n),
						f = i,
						b = m["".concat(u, ".").concat(f)] || m[f] || p[f] || a
					return n
						? r.createElement(b, o(o({ ref: e }, s), {}, { components: n }))
						: r.createElement(b, o({ ref: e }, s))
				})
			function f(t, e) {
				var n = arguments,
					i = e && e.mdxType
				if ("string" == typeof t || i) {
					var a = n.length,
						o = new Array(a)
					o[0] = m
					var c = {}
					for (var u in e) hasOwnProperty.call(e, u) && (c[u] = e[u])
					;(c.originalType = t),
						(c.mdxType = "string" == typeof t ? t : i),
						(o[1] = c)
					for (var l = 2; l < a; l++) o[l] = n[l]
					return r.createElement.apply(null, o)
				}
				return r.createElement.apply(null, n)
			}
			m.displayName = "MDXCreateElement"
		},
		9827: function (t, e, n) {
			n.r(e),
				n.d(e, {
					frontMatter: function () {
						return c
					},
					contentTitle: function () {
						return u
					},
					metadata: function () {
						return l
					},
					toc: function () {
						return s
					},
					default: function () {
						return m
					}
				})
			var r = n(7462),
				i = n(3366),
				a = (n(7294), n(3905)),
				o = ["components"],
				c = { sidebar_position: 2 },
				u = "Branch Names",
				l = {
					unversionedId:
						"getting-started/contributing/Start Contributing/branch",
					id: "getting-started/contributing/Start Contributing/branch",
					isDocsHomePage: !1,
					title: "Branch Names",
					description:
						"A branch will normally be created by the automatic system for each issue, if not please follow the branch name configuration defined as follows:",
					source:
						"@site/docs/getting-started/contributing/Start Contributing/branch.md",
					sourceDirName: "getting-started/contributing/Start Contributing",
					slug: "/getting-started/contributing/Start Contributing/branch",
					permalink:
						"/action-masterminds/fr/docs/getting-started/contributing/Start Contributing/branch",
					editUrl:
						"https://github.com/videndum/action-masterminds/edit/develop/docs/docs/getting-started/contributing/Start Contributing/branch.md",
					version: "current",
					sidebarPosition: 2,
					frontMatter: { sidebar_position: 2 },
					sidebar: "getting",
					previous: {
						title: "Internal Contributions Workflow",
						permalink:
							"/action-masterminds/fr/docs/getting-started/contributing/Start Contributing/internal"
					},
					next: {
						title: "Contribution Types",
						permalink:
							"/action-masterminds/fr/docs/getting-started/contributing/Start Contributing/types"
					}
				},
				s = [],
				p = { toc: s }
			function m(t) {
				var e = t.components,
					n = (0, i.Z)(t, o)
				return (0, a.kt)(
					"wrapper",
					(0, r.Z)({}, p, n, { components: e, mdxType: "MDXLayout" }),
					(0, a.kt)("h1", { id: "branch-names" }, "Branch Names"),
					(0, a.kt)(
						"p",
						null,
						"A branch will normally be created by the automatic system for each issue, if not please follow the branch name configuration defined as follows:"
					),
					(0, a.kt)(
						"ul",
						null,
						(0, a.kt)("li", { parentName: "ul" }, "Chore: chore/"),
						(0, a.kt)("li", { parentName: "ul" }, "Enhancement: enhance/"),
						(0, a.kt)("li", { parentName: "ul" }, "Feature: feat/"),
						(0, a.kt)("li", { parentName: "ul" }, "Documentation: docs/"),
						(0, a.kt)("li", { parentName: "ul" }, "Bug: fix/"),
						(0, a.kt)("li", { parentName: "ul" }, "Optimisation: opt/"),
						(0, a.kt)("li", { parentName: "ul" }, "Decrecated: dep/"),
						(0, a.kt)("li", { parentName: "ul" }, "Refactor: ref/"),
						(0, a.kt)("li", { parentName: "ul" }, "Style: style/"),
						(0, a.kt)("li", { parentName: "ul" }, "Style: style/")
					)
				)
			}
			m.isMDXComponent = !0
		}
	}
])
