/** @format */

"use strict"
;(self.webpackChunkaction_masterminds =
	self.webpackChunkaction_masterminds || []).push([
	[2811],
	{
		3905: function (e, t, n) {
			n.d(t, {
				Zo: function () {
					return l
				},
				kt: function () {
					return d
				}
			})
			var r = n(7294)
			function i(e, t, n) {
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
			function o(e, t) {
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
						? o(Object(n), !0).forEach(function (t) {
								i(e, t, n[t])
						  })
						: Object.getOwnPropertyDescriptors
						? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
						: o(Object(n)).forEach(function (t) {
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
					i = (function (e, t) {
						if (null == e) return {}
						var n,
							r,
							i = {},
							o = Object.keys(e)
						for (r = 0; r < o.length; r++)
							(n = o[r]), t.indexOf(n) >= 0 || (i[n] = e[n])
						return i
					})(e, t)
				if (Object.getOwnPropertySymbols) {
					var o = Object.getOwnPropertySymbols(e)
					for (r = 0; r < o.length; r++)
						(n = o[r]),
							t.indexOf(n) >= 0 ||
								(Object.prototype.propertyIsEnumerable.call(e, n) &&
									(i[n] = e[n]))
				}
				return i
			}
			var u = r.createContext({}),
				c = function (e) {
					var t = r.useContext(u),
						n = t
					return e && (n = "function" == typeof e ? e(t) : a(a({}, t), e)), n
				},
				l = function (e) {
					var t = c(e.components)
					return r.createElement(u.Provider, { value: t }, e.children)
				},
				p = {
					inlineCode: "code",
					wrapper: function (e) {
						var t = e.children
						return r.createElement(r.Fragment, {}, t)
					}
				},
				g = r.forwardRef(function (e, t) {
					var n = e.components,
						i = e.mdxType,
						o = e.originalType,
						u = e.parentName,
						l = s(e, ["components", "mdxType", "originalType", "parentName"]),
						g = c(n),
						d = i,
						m = g["".concat(u, ".").concat(d)] || g[d] || p[d] || o
					return n
						? r.createElement(m, a(a({ ref: t }, l), {}, { components: n }))
						: r.createElement(m, a({ ref: t }, l))
				})
			function d(e, t) {
				var n = arguments,
					i = t && t.mdxType
				if ("string" == typeof e || i) {
					var o = n.length,
						a = new Array(o)
					a[0] = g
					var s = {}
					for (var u in t) hasOwnProperty.call(t, u) && (s[u] = t[u])
					;(s.originalType = e),
						(s.mdxType = "string" == typeof e ? e : i),
						(a[1] = s)
					for (var c = 2; c < o; c++) a[c] = n[c]
					return r.createElement.apply(null, a)
				}
				return r.createElement.apply(null, n)
			}
			g.displayName = "MDXCreateElement"
		},
		6910: function (e, t, n) {
			n.r(t),
				n.d(t, {
					frontMatter: function () {
						return s
					},
					contentTitle: function () {
						return u
					},
					metadata: function () {
						return c
					},
					toc: function () {
						return l
					},
					default: function () {
						return g
					}
				})
			var r = n(7462),
				i = n(3366),
				o = (n(7294), n(3905)),
				a = ["components"],
				s = {
					title: "Contributing",
					sidebar_label: "Start Contributing",
					sidebar_position: 0
				},
				u = "Why the guidelines",
				c = {
					unversionedId:
						"getting-started/contributing/Start Contributing/why-the-guidelines",
					id:
						"getting-started/contributing/Start Contributing/why-the-guidelines",
					isDocsHomePage: !1,
					title: "Contributing",
					description:
						"First off, thank you for considering contributing to this project.",
					source:
						"@site/docs/getting-started/contributing/Start Contributing/why-the-guidelines.md",
					sourceDirName: "getting-started/contributing/Start Contributing",
					slug:
						"/getting-started/contributing/Start Contributing/why-the-guidelines",
					permalink:
						"/action-masterminds/es/docs/getting-started/contributing/Start Contributing/why-the-guidelines",
					editUrl:
						"https://github.com/videndum/action-masterminds/edit/develop/docs/docs/getting-started/contributing/Start Contributing/why-the-guidelines.md",
					version: "current",
					sidebarPosition: 0,
					frontMatter: {
						title: "Contributing",
						sidebar_label: "Start Contributing",
						sidebar_position: 0
					},
					sidebar: "getting",
					previous: {
						title: "Security Disclosures",
						permalink:
							"/action-masterminds/es/docs/getting-started/contributing/security"
					},
					next: {
						title: "External Contributions Workflow",
						permalink:
							"/action-masterminds/es/docs/getting-started/contributing/Start Contributing/external"
					}
				},
				l = [
					{
						value: "Contributor License Agreement",
						id: "contributor-license-agreement",
						children: []
					},
					{ value: "Responsibilities", id: "responsibilities", children: [] }
				],
				p = { toc: l }
			function g(e) {
				var t = e.components,
					n = (0, i.Z)(e, a)
				return (0, o.kt)(
					"wrapper",
					(0, r.Z)({}, p, n, { components: t, mdxType: "MDXLayout" }),
					(0, o.kt)("h1", { id: "why-the-guidelines" }, "Why the guidelines"),
					(0, o.kt)(
						"p",
						null,
						"First off, thank you for considering contributing to this project."
					),
					(0, o.kt)(
						"p",
						null,
						"Following these guidelines helps to communicate that you respect the time of the developers managing and creating this project. In return, they should reciprocate that respect in addressing your issue, assessing changes, and helping you finalize your pull requests. We created these guidelines to ensure that everyone has the same information when working on the project."
					),
					(0, o.kt)(
						"ul",
						null,
						(0, o.kt)(
							"li",
							{ parentName: "ul" },
							"Please don't use the issue tracker for support questions."
						),
						(0, o.kt)(
							"li",
							{ parentName: "ul" },
							"Please check whether the FAQ can help with your issue."
						),
						(0, o.kt)(
							"li",
							{ parentName: "ul" },
							"Please check the closed tickets & pull requests before opening an new one."
						)
					),
					(0, o.kt)(
						"h2",
						{ id: "contributor-license-agreement" },
						"Contributor License Agreement"
					),
					(0, o.kt)(
						"p",
						null,
						"We have a Contributor License Agreement which can be found at ",
						(0, o.kt)(
							"a",
							{
								parentName: "p",
								href:
									"/action-masterminds/es/docs/getting-started/contributing/CODE_OF_CONDUCT"
							},
							(0, o.kt)(
								"inlineCode",
								{ parentName: "a" },
								"{root}/docs/getting-started/contributing/agreement.md"
							)
						),
						". It is required for ",
						(0, o.kt)(
							"a",
							{ parentName: "p", href: "./types" },
							"Standard Contributions"
						),
						" and ",
						(0, o.kt)(
							"a",
							{ parentName: "p", href: "./types" },
							"Major Contributions"
						),
						"."
					),
					(0, o.kt)("h2", { id: "responsibilities" }, "Responsibilities"),
					(0, o.kt)(
						"ul",
						null,
						(0, o.kt)(
							"li",
							{ parentName: "ul" },
							"Ensure cross-platform compatibility for every change that's accepted."
						),
						(0, o.kt)(
							"li",
							{ parentName: "ul" },
							"Ensure that code meets all ",
							(0, o.kt)(
								"a",
								{ parentName: "li", href: "types" },
								"requirements"
							)
						),
						(0, o.kt)(
							"li",
							{ parentName: "ul" },
							"Create issues for any major changes and enhancements that you wish to make. Discuss things transparently and get community feedback."
						),
						(0, o.kt)(
							"li",
							{ parentName: "ul" },
							"Ensure each contribution is created on its own branch to ensure we can follow ",
							(0, o.kt)(
								"a",
								{ parentName: "li", href: "http://semver.org/" },
								"Semantic Versioning"
							)
						),
						(0, o.kt)(
							"li",
							{ parentName: "ul" },
							"Be welcoming to newcomers and encourage diverse new contributors from all backgrounds"
						)
					)
				)
			}
			g.isMDXComponent = !0
		}
	}
])
