/** @format */

"use strict"
;(self.webpackChunkaction_masterminds =
	self.webpackChunkaction_masterminds || []).push([
	[6632],
	{
		3905: function (e, t, r) {
			r.d(t, {
				Zo: function () {
					return c
				},
				kt: function () {
					return m
				}
			})
			var n = r(7294)
			function o(e, t, r) {
				return (
					t in e
						? Object.defineProperty(e, t, {
								value: r,
								enumerable: !0,
								configurable: !0,
								writable: !0
						  })
						: (e[t] = r),
					e
				)
			}
			function i(e, t) {
				var r = Object.keys(e)
				if (Object.getOwnPropertySymbols) {
					var n = Object.getOwnPropertySymbols(e)
					t &&
						(n = n.filter(function (t) {
							return Object.getOwnPropertyDescriptor(e, t).enumerable
						})),
						r.push.apply(r, n)
				}
				return r
			}
			function s(e) {
				for (var t = 1; t < arguments.length; t++) {
					var r = null != arguments[t] ? arguments[t] : {}
					t % 2
						? i(Object(r), !0).forEach(function (t) {
								o(e, t, r[t])
						  })
						: Object.getOwnPropertyDescriptors
						? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
						: i(Object(r)).forEach(function (t) {
								Object.defineProperty(
									e,
									t,
									Object.getOwnPropertyDescriptor(r, t)
								)
						  })
				}
				return e
			}
			function a(e, t) {
				if (null == e) return {}
				var r,
					n,
					o = (function (e, t) {
						if (null == e) return {}
						var r,
							n,
							o = {},
							i = Object.keys(e)
						for (n = 0; n < i.length; n++)
							(r = i[n]), t.indexOf(r) >= 0 || (o[r] = e[r])
						return o
					})(e, t)
				if (Object.getOwnPropertySymbols) {
					var i = Object.getOwnPropertySymbols(e)
					for (n = 0; n < i.length; n++)
						(r = i[n]),
							t.indexOf(r) >= 0 ||
								(Object.prototype.propertyIsEnumerable.call(e, r) &&
									(o[r] = e[r]))
				}
				return o
			}
			var u = n.createContext({}),
				p = function (e) {
					var t = n.useContext(u),
						r = t
					return e && (r = "function" == typeof e ? e(t) : s(s({}, t), e)), r
				},
				c = function (e) {
					var t = p(e.components)
					return n.createElement(u.Provider, { value: t }, e.children)
				},
				d = {
					inlineCode: "code",
					wrapper: function (e) {
						var t = e.children
						return n.createElement(n.Fragment, {}, t)
					}
				},
				l = n.forwardRef(function (e, t) {
					var r = e.components,
						o = e.mdxType,
						i = e.originalType,
						u = e.parentName,
						c = a(e, ["components", "mdxType", "originalType", "parentName"]),
						l = p(r),
						m = o,
						g = l["".concat(u, ".").concat(m)] || l[m] || d[m] || i
					return r
						? n.createElement(g, s(s({ ref: t }, c), {}, { components: r }))
						: n.createElement(g, s({ ref: t }, c))
				})
			function m(e, t) {
				var r = arguments,
					o = t && t.mdxType
				if ("string" == typeof e || o) {
					var i = r.length,
						s = new Array(i)
					s[0] = l
					var a = {}
					for (var u in t) hasOwnProperty.call(t, u) && (a[u] = t[u])
					;(a.originalType = e),
						(a.mdxType = "string" == typeof e ? e : o),
						(s[1] = a)
					for (var p = 2; p < i; p++) s[p] = r[p]
					return n.createElement.apply(null, s)
				}
				return n.createElement.apply(null, r)
			}
			l.displayName = "MDXCreateElement"
		},
		3525: function (e, t, r) {
			r.r(t),
				r.d(t, {
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
			var n = r(7462),
				o = r(3366),
				i = (r(7294), r(3905)),
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
					permalink: "/action-masterminds/fr/docs/getting-started/support",
					editUrl:
						"https://github.com/videndum/action-masterminds/edit/develop/docs/docs/getting-started/support.md",
					version: "current",
					frontMatter: {},
					sidebar: "getting",
					previous: {
						title: "Understanding Labels",
						permalink:
							"/action-masterminds/fr/docs/getting-started/contributing/Start Contributing/labels"
					},
					next: {
						title: "Contributors",
						permalink:
							"/action-masterminds/fr/docs/getting-started/contributors"
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
					r = (0, o.Z)(e, s)
				return (0, i.kt)(
					"wrapper",
					(0, n.Z)({}, d, r, { components: t, mdxType: "MDXLayout" }),
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
