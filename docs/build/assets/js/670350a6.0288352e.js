/** @format */

"use strict"
;(self.webpackChunkaction_masterminds =
	self.webpackChunkaction_masterminds || []).push([
	[7535],
	{
		3905: function (e, t, r) {
			r.d(t, {
				Zo: function () {
					return p
				},
				kt: function () {
					return g
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
			function c(e) {
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
			function s(e, t) {
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
			var a = n.createContext({}),
				u = function (e) {
					var t = n.useContext(a),
						r = t
					return e && (r = "function" == typeof e ? e(t) : c(c({}, t), e)), r
				},
				p = function (e) {
					var t = u(e.components)
					return n.createElement(a.Provider, { value: t }, e.children)
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
						a = e.parentName,
						p = s(e, ["components", "mdxType", "originalType", "parentName"]),
						l = u(r),
						g = o,
						f = l["".concat(a, ".").concat(g)] || l[g] || d[g] || i
					return r
						? n.createElement(f, c(c({ ref: t }, p), {}, { components: r }))
						: n.createElement(f, c({ ref: t }, p))
				})
			function g(e, t) {
				var r = arguments,
					o = t && t.mdxType
				if ("string" == typeof e || o) {
					var i = r.length,
						c = new Array(i)
					c[0] = l
					var s = {}
					for (var a in t) hasOwnProperty.call(t, a) && (s[a] = t[a])
					;(s.originalType = e),
						(s.mdxType = "string" == typeof e ? e : o),
						(c[1] = s)
					for (var u = 2; u < i; u++) c[u] = r[u]
					return n.createElement.apply(null, c)
				}
				return n.createElement.apply(null, r)
			}
			l.displayName = "MDXCreateElement"
		},
		7117: function (e, t, r) {
			r.r(t),
				r.d(t, {
					frontMatter: function () {
						return s
					},
					contentTitle: function () {
						return a
					},
					metadata: function () {
						return u
					},
					toc: function () {
						return p
					},
					default: function () {
						return l
					}
				})
			var n = r(7462),
				o = r(3366),
				i = (r(7294), r(3905)),
				c = ["components"],
				s = { sidebar_position: 4 },
				a = "Code review process",
				u = {
					unversionedId: "getting-started/contributing/code-review-process",
					id: "getting-started/contributing/code-review-process",
					isDocsHomePage: !1,
					title: "Code review process",
					description: "[Coming soon - Please stand by]",
					source:
						"@site/docs/getting-started/contributing/code-review-process.md",
					sourceDirName: "getting-started/contributing",
					slug: "/getting-started/contributing/code-review-process",
					permalink:
						"/action-masterminds/docs/getting-started/contributing/code-review-process",
					editUrl:
						"https://github.com/videndum/action-masterminds/edit/develop/docs/docs/getting-started/contributing/code-review-process.md",
					version: "current",
					sidebarPosition: 4,
					frontMatter: { sidebar_position: 4 },
					sidebar: "getting",
					previous: {
						title: "Running Locally & Developing",
						permalink:
							"/action-masterminds/docs/getting-started/contributing/runningLocally"
					},
					next: {
						title: "Security Disclosures",
						permalink:
							"/action-masterminds/docs/getting-started/contributing/security"
					}
				},
				p = [],
				d = { toc: p }
			function l(e) {
				var t = e.components,
					r = (0, o.Z)(e, c)
				return (0, i.kt)(
					"wrapper",
					(0, n.Z)({}, d, r, { components: t, mdxType: "MDXLayout" }),
					(0, i.kt)("h1", { id: "code-review-process" }, "Code review process"),
					(0, i.kt)("p", null, "[Coming soon - Please stand by]")
				)
			}
			l.isMDXComponent = !0
		}
	}
])
