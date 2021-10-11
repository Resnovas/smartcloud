/** @format */

"use strict"
;(self.webpackChunkaction_masterminds =
	self.webpackChunkaction_masterminds || []).push([
	[9269],
	{
		3905: function (e, t, n) {
			n.d(t, {
				Zo: function () {
					return p
				},
				kt: function () {
					return f
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
			function a(e, t) {
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
			function i(e) {
				for (var t = 1; t < arguments.length; t++) {
					var n = null != arguments[t] ? arguments[t] : {}
					t % 2
						? a(Object(n), !0).forEach(function (t) {
								o(e, t, n[t])
						  })
						: Object.getOwnPropertyDescriptors
						? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
						: a(Object(n)).forEach(function (t) {
								Object.defineProperty(
									e,
									t,
									Object.getOwnPropertyDescriptor(n, t)
								)
						  })
				}
				return e
			}
			function u(e, t) {
				if (null == e) return {}
				var n,
					r,
					o = (function (e, t) {
						if (null == e) return {}
						var n,
							r,
							o = {},
							a = Object.keys(e)
						for (r = 0; r < a.length; r++)
							(n = a[r]), t.indexOf(n) >= 0 || (o[n] = e[n])
						return o
					})(e, t)
				if (Object.getOwnPropertySymbols) {
					var a = Object.getOwnPropertySymbols(e)
					for (r = 0; r < a.length; r++)
						(n = a[r]),
							t.indexOf(n) >= 0 ||
								(Object.prototype.propertyIsEnumerable.call(e, n) &&
									(o[n] = e[n]))
				}
				return o
			}
			var c = r.createContext({}),
				l = function (e) {
					var t = r.useContext(c),
						n = t
					return e && (n = "function" == typeof e ? e(t) : i(i({}, t), e)), n
				},
				p = function (e) {
					var t = l(e.components)
					return r.createElement(c.Provider, { value: t }, e.children)
				},
				s = {
					inlineCode: "code",
					wrapper: function (e) {
						var t = e.children
						return r.createElement(r.Fragment, {}, t)
					}
				},
				m = r.forwardRef(function (e, t) {
					var n = e.components,
						o = e.mdxType,
						a = e.originalType,
						c = e.parentName,
						p = u(e, ["components", "mdxType", "originalType", "parentName"]),
						m = l(n),
						f = o,
						g = m["".concat(c, ".").concat(f)] || m[f] || s[f] || a
					return n
						? r.createElement(g, i(i({ ref: t }, p), {}, { components: n }))
						: r.createElement(g, i({ ref: t }, p))
				})
			function f(e, t) {
				var n = arguments,
					o = t && t.mdxType
				if ("string" == typeof e || o) {
					var a = n.length,
						i = new Array(a)
					i[0] = m
					var u = {}
					for (var c in t) hasOwnProperty.call(t, c) && (u[c] = t[c])
					;(u.originalType = e),
						(u.mdxType = "string" == typeof e ? e : o),
						(i[1] = u)
					for (var l = 2; l < a; l++) i[l] = n[l]
					return r.createElement.apply(null, i)
				}
				return r.createElement.apply(null, n)
			}
			m.displayName = "MDXCreateElement"
		},
		3392: function (e, t, n) {
			n.r(t),
				n.d(t, {
					frontMatter: function () {
						return u
					},
					contentTitle: function () {
						return c
					},
					metadata: function () {
						return l
					},
					toc: function () {
						return p
					},
					default: function () {
						return m
					}
				})
			var r = n(7462),
				o = n(3366),
				a = (n(7294), n(3905)),
				i = ["components"],
				u = {
					title: "Blog Plugin",
					author: "Fanny Vieira",
					authorTitle: "Maintainer of Docusaurus",
					authorURL: "https://github.com/fanny",
					authorImageURL: "https://github.com/fanny.png",
					authorTwitter: "fannyvieiira",
					tags: ["blog", "docusaurus"]
				},
				c = void 0,
				l = {
					permalink: "/action-masterminds/blog/2020/04/14/blog-plugin",
					editUrl:
						"https://github.com/videndum/action-masterminds/edit/develop/docs/blog/blog/2020-04-14-blog-plugin.md",
					source: "@site/blog/2020-04-14-blog-plugin.md",
					title: "Blog Plugin",
					description: "You can use our blog plugin to do your posts",
					date: "2020-04-14T00:00:00.000Z",
					formattedDate: "April 14, 2020",
					tags: [
						{ label: "blog", permalink: "/action-masterminds/blog/tags/blog" },
						{
							label: "docusaurus",
							permalink: "/action-masterminds/blog/tags/docusaurus"
						}
					],
					readingTime: 0.145,
					truncated: !0,
					nextItem: {
						title: "A large blog post",
						permalink: "/action-masterminds/blog/2020/04/14/large-blog-post"
					}
				},
				p = [],
				s = { toc: p }
			function m(e) {
				var t = e.components,
					n = (0, o.Z)(e, i)
				return (0, a.kt)(
					"wrapper",
					(0, r.Z)({}, s, n, { components: t, mdxType: "MDXLayout" }),
					(0, a.kt)("p", null, "You can use our blog plugin to do your posts"),
					(0, a.kt)(
						"p",
						null,
						"If you want add your own component, you can use the ",
						(0, a.kt)("inlineCode", { parentName: "p" }, "swizzle"),
						" command. Check more at our ",
						(0, a.kt)(
							"a",
							{
								parentName: "p",
								href:
									"https://docusaurus.io/docs/using-themes#swizzling-theme-components"
							},
							"doc"
						)
					)
				)
			}
			m.isMDXComponent = !0
		}
	}
])
