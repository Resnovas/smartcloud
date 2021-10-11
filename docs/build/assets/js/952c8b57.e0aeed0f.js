/** @format */

"use strict"
;(self.webpackChunkaction_masterminds =
	self.webpackChunkaction_masterminds || []).push([
	[6632],
	{
		3905: function (e, t, n) {
			n.d(t, {
				Zo: function () {
					return c
				},
				kt: function () {
					return m
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
			function s(e) {
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
			function a(e, t) {
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
			var u = r.createContext({}),
				p = function (e) {
					var t = r.useContext(u),
						n = t
					return e && (n = "function" == typeof e ? e(t) : s(s({}, t), e)), n
				},
				c = function (e) {
					var t = p(e.components)
					return r.createElement(u.Provider, { value: t }, e.children)
				},
				d = {
					inlineCode: "code",
					wrapper: function (e) {
						var t = e.children
						return r.createElement(r.Fragment, {}, t)
					}
				},
				l = r.forwardRef(function (e, t) {
					var n = e.components,
						o = e.mdxType,
						i = e.originalType,
						u = e.parentName,
						c = a(e, ["components", "mdxType", "originalType", "parentName"]),
						l = p(n),
						m = o,
						g = l["".concat(u, ".").concat(m)] || l[m] || d[m] || i
					return n
						? r.createElement(g, s(s({ ref: t }, c), {}, { components: n }))
						: r.createElement(g, s({ ref: t }, c))
				})
			function m(e, t) {
				var n = arguments,
					o = t && t.mdxType
				if ("string" == typeof e || o) {
					var i = n.length,
						s = new Array(i)
					s[0] = l
					var a = {}
					for (var u in t) hasOwnProperty.call(t, u) && (a[u] = t[u])
					;(a.originalType = e),
						(a.mdxType = "string" == typeof e ? e : o),
						(s[1] = a)
					for (var p = 2; p < i; p++) s[p] = n[p]
					return r.createElement.apply(null, s)
				}
				return r.createElement.apply(null, n)
			}
			l.displayName = "MDXCreateElement"
		},
		3525: function (e, t, n) {
			n.r(t),
				n.d(t, {
					frontMatter: function () {
						return a
					},
					contentTitle: function () {
						return u
					},
					metadata: function () {
						return p
					},
					toc: function () {
						return c
					},
					default: function () {
						return l
					}
				})
			var r = n(7462),
				o = n(3366),
				i = (n(7294), n(3905)),
				s = ["components"],
				a = {},
				u =
					"Support \ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc67\u200d\ud83d\udc66",
				p = {
					unversionedId: "getting-started/support",
					id: "getting-started/support",
					isDocsHomePage: !1,
					title:
						"Support \ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc67\u200d\ud83d\udc66",
					description:
						"For Features Requests, Q&A, Show & Tell and Discussions please use our discussions page \ud83d\ude91.",
					source: "@site/docs/getting-started/support.md",
					sourceDirName: "getting-started",
					slug: "/getting-started/support",
					permalink: "/action-masterminds/docs/getting-started/support",
					editUrl:
						"https://github.com/videndum/action-masterminds/edit/develop/docs/docs/getting-started/support.md",
					version: "current",
					frontMatter: {},
					sidebar: "getting",
					previous: {
						title: "Understanding Labels",
						permalink:
							"/action-masterminds/docs/getting-started/contributing/Start Contributing/labels"
					},
					next: {
						title: "Contributors",
						permalink: "/action-masterminds/docs/getting-started/contributors"
					}
				},
				c = [
					{
						value: "Why not GitHub Issues?",
						id: "why-not-github-issues",
						children: []
					}
				],
				d = { toc: c }
			function l(e) {
				var t = e.components,
					n = (0, o.Z)(e, s)
				return (0, i.kt)(
					"wrapper",
					(0, r.Z)({}, d, n, { components: t, mdxType: "MDXLayout" }),
					(0, i.kt)(
						"h1",
						{ id: "support-" },
						"Support \ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc67\u200d\ud83d\udc66"
					),
					(0, i.kt)(
						"p",
						null,
						"For ",
						(0, i.kt)("strong", { parentName: "p" }, "Features Requests"),
						", ",
						(0, i.kt)("strong", { parentName: "p" }, "Q&A"),
						", ",
						(0, i.kt)("strong", { parentName: "p" }, "Show & Tell"),
						" and ",
						(0, i.kt)("strong", { parentName: "p" }, "Discussions"),
						" please use ",
						(0, i.kt)(
							"strong",
							{ parentName: "p" },
							(0, i.kt)(
								"a",
								{
									parentName: "strong",
									href:
										"https://github.com/Videndum/action-masterminds/discussions"
								},
								"our discussions page"
							)
						),
						" \ud83d\ude91."
					),
					(0, i.kt)(
						"p",
						null,
						"We have a ",
						(0, i.kt)("strong", { parentName: "p" }, "FAQ"),
						" category in our ",
						(0, i.kt)(
							"strong",
							{ parentName: "p" },
							(0, i.kt)(
								"a",
								{
									parentName: "strong",
									href:
										"https://github.com/Videndum/action-masterminds/discussions"
								},
								"discussions page"
							)
						),
						" where you can get quick answers, help with debugging weird issues, and general help."
					),
					(0, i.kt)(
						"p",
						null,
						"Our extensive ",
						(0, i.kt)("strong", { parentName: "p" }, "documentation"),
						" can be found at ",
						(0, i.kt)(
							"strong",
							{ parentName: "p" },
							(0, i.kt)(
								"a",
								{
									parentName: "strong",
									href:
										"https://github.com/Videndum/action-masterminds/blob/develop/README.md"
								},
								"here"
							)
						),
						"."
					),
					(0, i.kt)(
						"h2",
						{ id: "why-not-github-issues" },
						"Why not GitHub Issues?"
					),
					(0, i.kt)(
						"p",
						null,
						"GitHub is our office, it's the place where our development and contributor teams do their work. We use the issue list to keep track of bugs and the features that we are working on. We do this openly for transparency, to reduce replication by contributors and increase productivity."
					),
					(0, i.kt)(
						"p",
						null,
						"With the discussion page, you can leverage the knowledge of our wider community to get help with any problems you are having. Please keep in mind that this project is open-source, support is provided by the goodwill of our wonderful community members."
					)
				)
			}
			l.isMDXComponent = !0
		}
	}
])
