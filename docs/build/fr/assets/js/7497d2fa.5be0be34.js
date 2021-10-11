/** @format */

"use strict"
;(self.webpackChunkaction_masterminds =
	self.webpackChunkaction_masterminds || []).push([
	[9552],
	{
		3905: function (e, t, n) {
			n.d(t, {
				Zo: function () {
					return p
				},
				kt: function () {
					return d
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
			function s(e, t) {
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
			var c = r.createContext({}),
				u = function (e) {
					var t = r.useContext(c),
						n = t
					return e && (n = "function" == typeof e ? e(t) : o(o({}, t), e)), n
				},
				p = function (e) {
					var t = u(e.components)
					return r.createElement(c.Provider, { value: t }, e.children)
				},
				l = {
					inlineCode: "code",
					wrapper: function (e) {
						var t = e.children
						return r.createElement(r.Fragment, {}, t)
					}
				},
				g = r.forwardRef(function (e, t) {
					var n = e.components,
						a = e.mdxType,
						i = e.originalType,
						c = e.parentName,
						p = s(e, ["components", "mdxType", "originalType", "parentName"]),
						g = u(n),
						d = a,
						f = g["".concat(c, ".").concat(d)] || g[d] || l[d] || i
					return n
						? r.createElement(f, o(o({ ref: t }, p), {}, { components: n }))
						: r.createElement(f, o({ ref: t }, p))
				})
			function d(e, t) {
				var n = arguments,
					a = t && t.mdxType
				if ("string" == typeof e || a) {
					var i = n.length,
						o = new Array(i)
					o[0] = g
					var s = {}
					for (var c in t) hasOwnProperty.call(t, c) && (s[c] = t[c])
					;(s.originalType = e),
						(s.mdxType = "string" == typeof e ? e : a),
						(o[1] = s)
					for (var u = 2; u < i; u++) o[u] = n[u]
					return r.createElement.apply(null, o)
				}
				return r.createElement.apply(null, n)
			}
			g.displayName = "MDXCreateElement"
		},
		3586: function (e, t, n) {
			n.r(t),
				n.d(t, {
					frontMatter: function () {
						return s
					},
					contentTitle: function () {
						return c
					},
					metadata: function () {
						return u
					},
					toc: function () {
						return p
					},
					default: function () {
						return g
					}
				})
			var r = n(7462),
				a = n(3366),
				i = (n(7294), n(3905)),
				o = ["components"],
				s = {
					id: "regex",
					title: "Using Regex patterns",
					sidebar_label: "Using Regex"
				},
				c = void 0,
				u = {
					unversionedId: "getting-started/features/regex",
					id: "getting-started/features/regex",
					isDocsHomePage: !1,
					title: "Using Regex patterns",
					description:
						"Many conditions use regular expressions (usually with a pattern parameter).",
					source: "@site/docs/getting-started/features/regex.md",
					sourceDirName: "getting-started/features",
					slug: "/getting-started/features/regex",
					permalink:
						"/action-masterminds/fr/docs/getting-started/features/regex",
					editUrl:
						"https://github.com/videndum/action-masterminds/edit/develop/docs/docs/getting-started/features/regex.md",
					version: "current",
					frontMatter: {
						id: "regex",
						title: "Using Regex patterns",
						sidebar_label: "Using Regex"
					},
					sidebar: "getting",
					previous: {
						title: "Backlog",
						permalink: "/action-masterminds/fr/docs/getting-started/backlog"
					},
					next: {
						title: "Code of Conduct",
						permalink:
							"/action-masterminds/fr/docs/getting-started/contributing/CODE_OF_CONDUCT"
					}
				},
				p = [],
				l = { toc: p }
			function g(e) {
				var t = e.components,
					n = (0, a.Z)(e, o)
				return (0, i.kt)(
					"wrapper",
					(0, r.Z)({}, l, n, { components: t, mdxType: "MDXLayout" }),
					(0, i.kt)(
						"p",
						null,
						"Many conditions use regular expressions (usually with a ",
						(0, i.kt)("inlineCode", { parentName: "p" }, "pattern"),
						" parameter).\nSince these regular expressions are passed in through JSON strings, there are\nsome things to pay attention to."
					),
					(0, i.kt)(
						"p",
						null,
						"Special characters must be double escaped: ",
						(0, i.kt)("inlineCode", { parentName: "p" }, 'pattern: "\\\\W+$"'),
						" is equivalent to the Regex: ",
						(0, i.kt)("inlineCode", { parentName: "p" }, "/\\W+$/"),
						"."
					),
					(0, i.kt)(
						"p",
						null,
						"If you want to use flags, use the following format: ",
						(0, i.kt)("inlineCode", { parentName: "p" }, 'pattern: "/^wip:/i"'),
						" is equivalent to the Regex: ",
						(0, i.kt)("inlineCode", { parentName: "p" }, "/^wip:/i"),
						"."
					)
				)
			}
			g.isMDXComponent = !0
		}
	}
])
