/** @format */

"use strict"
;(self.webpackChunkaction_masterminds =
	self.webpackChunkaction_masterminds || []).push([
	[627],
	{
		3905: function (e, t, n) {
			n.d(t, {
				Zo: function () {
					return p
				},
				kt: function () {
					return g
				}
			})
			var r = n(7294)
			function o(e, t, n) {
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
			function a(e) {
				for (var t = 1; t < arguments.length; t++) {
					var n = null != arguments[t] ? arguments[t] : {}
					t % 2
						? i(Object(n), !0).forEach(function (t) {
								o(e, t, n[t])
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
			function c(e, t) {
				if (null == e) return {}
				var n,
					r,
					o = (function (e, t) {
						if (null == e) return {}
						var n,
							r,
							o = {},
							i = Object.keys(e)
						for (r = 0; r < i.length; r++)
							(n = i[r]), t.indexOf(n) >= 0 || (o[n] = e[n])
						return o
					})(e, t)
				if (Object.getOwnPropertySymbols) {
					var i = Object.getOwnPropertySymbols(e)
					for (r = 0; r < i.length; r++)
						(n = i[r]),
							t.indexOf(n) >= 0 ||
								(Object.prototype.propertyIsEnumerable.call(e, n) &&
									(o[n] = e[n]))
				}
				return o
			}
			var s = r.createContext({}),
				u = function (e) {
					var t = r.useContext(s),
						n = t
					return e && (n = "function" == typeof e ? e(t) : a(a({}, t), e)), n
				},
				p = function (e) {
					var t = u(e.components)
					return r.createElement(s.Provider, { value: t }, e.children)
				},
				l = {
					inlineCode: "code",
					wrapper: function (e) {
						var t = e.children
						return r.createElement(r.Fragment, {}, t)
					}
				},
				d = r.forwardRef(function (e, t) {
					var n = e.components,
						o = e.mdxType,
						i = e.originalType,
						s = e.parentName,
						p = c(e, ["components", "mdxType", "originalType", "parentName"]),
						d = u(n),
						g = o,
						m = d["".concat(s, ".").concat(g)] || d[g] || l[g] || i
					return n
						? r.createElement(m, a(a({ ref: t }, p), {}, { components: n }))
						: r.createElement(m, a({ ref: t }, p))
				})
			function g(e, t) {
				var n = arguments,
					o = t && t.mdxType
				if ("string" == typeof e || o) {
					var i = n.length,
						a = new Array(i)
					a[0] = d
					var c = {}
					for (var s in t) hasOwnProperty.call(t, s) && (c[s] = t[s])
					;(c.originalType = e),
						(c.mdxType = "string" == typeof e ? e : o),
						(a[1] = c)
					for (var u = 2; u < i; u++) a[u] = n[u]
					return r.createElement.apply(null, a)
				}
				return r.createElement.apply(null, n)
			}
			d.displayName = "MDXCreateElement"
		},
		3192: function (e, t, n) {
			n.r(t),
				n.d(t, {
					frontMatter: function () {
						return c
					},
					contentTitle: function () {
						return s
					},
					metadata: function () {
						return u
					},
					toc: function () {
						return p
					},
					default: function () {
						return d
					}
				})
			var r = n(7462),
				o = n(3366),
				i = (n(7294), n(3905)),
				a = ["components"],
				c = {},
				s = "Backlog",
				u = {
					unversionedId: "getting-started/backlog",
					id: "getting-started/backlog",
					isDocsHomePage: !1,
					title: "Backlog",
					description:
						"Thank you for taking an interst in contributing. We have created development containers (.devcontainer) to allow you to jump straight in with coding. We even went through the hassle of setting up step by step guides using CodeTour. Everything is configured and ready to go, all you need to do is use one of the supported platforms: VSCode | Github Codespaces",
					source: "@site/docs/getting-started/backlog.md",
					sourceDirName: "getting-started",
					slug: "/getting-started/backlog",
					permalink: "/action-masterminds/docs/getting-started/backlog",
					editUrl:
						"https://github.com/videndum/action-masterminds/edit/develop/docs/docs/getting-started/backlog.md",
					version: "current",
					frontMatter: {},
					sidebar: "getting",
					previous: {
						title: "Manual setup",
						permalink: "/action-masterminds/docs/getting-started/setup"
					},
					next: {
						title: "Using Regex",
						permalink: "/action-masterminds/docs/getting-started/features/regex"
					}
				},
				p = [],
				l = { toc: p }
			function d(e) {
				var t = e.components,
					n = (0, o.Z)(e, a)
				return (0, i.kt)(
					"wrapper",
					(0, r.Z)({}, l, n, { components: t, mdxType: "MDXLayout" }),
					(0, i.kt)("h1", { id: "backlog" }, "Backlog"),
					(0, i.kt)(
						"p",
						null,
						"Thank you for taking an interst in contributing. We have created development containers (",
						(0, i.kt)("inlineCode", { parentName: "p" }, ".devcontainer"),
						") to allow you to jump straight in with coding. We even went through the hassle of setting up step by step guides using ",
						(0, i.kt)(
							"a",
							{
								parentName: "p",
								href: "https://github.com/vsls-contrib/codetour"
							},
							"CodeTour"
						),
						". Everything is configured and ready to go, all you need to do is use one of the supported platforms: ",
						(0, i.kt)(
							"a",
							{
								parentName: "p",
								href:
									"https://code.visualstudio.com/docs/remote/remote-overview"
							},
							"VSCode"
						),
						" | ",
						(0, i.kt)(
							"a",
							{
								parentName: "p",
								href: "https://github.com/features/codespaces"
							},
							"Github Codespaces"
						)
					),
					(0, i.kt)(
						"p",
						null,
						"For more information on how to contribute, please read the contributing guidelines."
					),
					(0, i.kt)(
						"p",
						null,
						"Our backlog can be found on ",
						(0, i.kt)(
							"a",
							{
								parentName: "p",
								href:
									"https://github.com/Videndum/action-masterminds/projects/1"
							},
							"Github"
						)
					)
				)
			}
			d.isMDXComponent = !0
		}
	}
])
