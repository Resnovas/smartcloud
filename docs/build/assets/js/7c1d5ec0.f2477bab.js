/** @format */

"use strict"
;(self.webpackChunkaction_masterminds =
	self.webpackChunkaction_masterminds || []).push([
	[5247],
	{
		3905: function (e, t, r) {
			r.d(t, {
				Zo: function () {
					return l
				},
				kt: function () {
					return m
				}
			})
			var n = r(7294)
			function i(e, t, r) {
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
			function o(e, t) {
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
						? o(Object(r), !0).forEach(function (t) {
								i(e, t, r[t])
						  })
						: Object.getOwnPropertyDescriptors
						? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
						: o(Object(r)).forEach(function (t) {
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
					i = (function (e, t) {
						if (null == e) return {}
						var r,
							n,
							i = {},
							o = Object.keys(e)
						for (n = 0; n < o.length; n++)
							(r = o[n]), t.indexOf(r) >= 0 || (i[r] = e[r])
						return i
					})(e, t)
				if (Object.getOwnPropertySymbols) {
					var o = Object.getOwnPropertySymbols(e)
					for (n = 0; n < o.length; n++)
						(r = o[n]),
							t.indexOf(r) >= 0 ||
								(Object.prototype.propertyIsEnumerable.call(e, r) &&
									(i[r] = e[r]))
				}
				return i
			}
			var u = n.createContext({}),
				c = function (e) {
					var t = n.useContext(u),
						r = t
					return e && (r = "function" == typeof e ? e(t) : s(s({}, t), e)), r
				},
				l = function (e) {
					var t = c(e.components)
					return n.createElement(u.Provider, { value: t }, e.children)
				},
				p = {
					inlineCode: "code",
					wrapper: function (e) {
						var t = e.children
						return n.createElement(n.Fragment, {}, t)
					}
				},
				d = n.forwardRef(function (e, t) {
					var r = e.components,
						i = e.mdxType,
						o = e.originalType,
						u = e.parentName,
						l = a(e, ["components", "mdxType", "originalType", "parentName"]),
						d = c(r),
						m = i,
						f = d["".concat(u, ".").concat(m)] || d[m] || p[m] || o
					return r
						? n.createElement(f, s(s({ ref: t }, l), {}, { components: r }))
						: n.createElement(f, s({ ref: t }, l))
				})
			function m(e, t) {
				var r = arguments,
					i = t && t.mdxType
				if ("string" == typeof e || i) {
					var o = r.length,
						s = new Array(o)
					s[0] = d
					var a = {}
					for (var u in t) hasOwnProperty.call(t, u) && (a[u] = t[u])
					;(a.originalType = e),
						(a.mdxType = "string" == typeof e ? e : i),
						(s[1] = a)
					for (var c = 2; c < o; c++) s[c] = r[c]
					return n.createElement.apply(null, s)
				}
				return n.createElement.apply(null, r)
			}
			d.displayName = "MDXCreateElement"
		},
		303: function (e, t, r) {
			r.r(t),
				r.d(t, {
					frontMatter: function () {
						return a
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
						return d
					}
				})
			var n = r(7462),
				i = r(3366),
				o = (r(7294), r(3905)),
				s = ["components"],
				a = { sidebar_position: 4 },
				u = "Security Disclosures",
				c = {
					unversionedId: "getting-started/contributing/security",
					id: "getting-started/contributing/security",
					isDocsHomePage: !1,
					title: "Security Disclosures",
					description:
						"In order to determine whether you are dealing with a security issue, ask yourself these two questions:",
					source: "@site/docs/getting-started/contributing/security.md",
					sourceDirName: "getting-started/contributing",
					slug: "/getting-started/contributing/security",
					permalink:
						"/action-masterminds/docs/getting-started/contributing/security",
					editUrl:
						"https://github.com/videndum/action-masterminds/edit/develop/docs/docs/getting-started/contributing/security.md",
					version: "current",
					sidebarPosition: 4,
					frontMatter: { sidebar_position: 4 },
					sidebar: "getting",
					previous: {
						title: "Code review process",
						permalink:
							"/action-masterminds/docs/getting-started/contributing/code-review-process"
					},
					next: {
						title: "Start Contributing",
						permalink:
							"/action-masterminds/docs/getting-started/contributing/Start Contributing/why-the-guidelines"
					}
				},
				l = [],
				p = { toc: l }
			function d(e) {
				var t = e.components,
					r = (0, i.Z)(e, s)
				return (0, o.kt)(
					"wrapper",
					(0, n.Z)({}, p, r, { components: t, mdxType: "MDXLayout" }),
					(0, o.kt)(
						"h1",
						{ id: "security-disclosures" },
						"Security Disclosures"
					),
					(0, o.kt)(
						"p",
						null,
						"In order to determine whether you are dealing with a security issue, ask yourself these two questions:"
					),
					(0, o.kt)(
						"ul",
						null,
						(0, o.kt)(
							"li",
							{ parentName: "ul" },
							"Can I access something that's not mine, or something I shouldn't have access to?"
						),
						(0, o.kt)(
							"li",
							{ parentName: "ul" },
							"Can I disable something for other people?"
						)
					),
					(0, o.kt)(
						"p",
						null,
						'If the answer to either of those two questions are "yes", then you\'re probably dealing with a security issue. Note that even if you answer "no" to both questions, you may still be dealing with a security issue, so if you\'re unsure, just email us.'
					)
				)
			}
			d.isMDXComponent = !0
		}
	}
])
