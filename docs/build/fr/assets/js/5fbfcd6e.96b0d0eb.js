/** @format */

"use strict"
;(self.webpackChunkaction_masterminds =
	self.webpackChunkaction_masterminds || []).push([
	[8651],
	{
		3905: function (t, e, r) {
			r.d(e, {
				Zo: function () {
					return p
				},
				kt: function () {
					return d
				}
			})
			var n = r(7294)
			function o(t, e, r) {
				return (
					e in t
						? Object.defineProperty(t, e, {
								value: r,
								enumerable: !0,
								configurable: !0,
								writable: !0
						  })
						: (t[e] = r),
					t
				)
			}
			function i(t, e) {
				var r = Object.keys(t)
				if (Object.getOwnPropertySymbols) {
					var n = Object.getOwnPropertySymbols(t)
					e &&
						(n = n.filter(function (e) {
							return Object.getOwnPropertyDescriptor(t, e).enumerable
						})),
						r.push.apply(r, n)
				}
				return r
			}
			function c(t) {
				for (var e = 1; e < arguments.length; e++) {
					var r = null != arguments[e] ? arguments[e] : {}
					e % 2
						? i(Object(r), !0).forEach(function (e) {
								o(t, e, r[e])
						  })
						: Object.getOwnPropertyDescriptors
						? Object.defineProperties(t, Object.getOwnPropertyDescriptors(r))
						: i(Object(r)).forEach(function (e) {
								Object.defineProperty(
									t,
									e,
									Object.getOwnPropertyDescriptor(r, e)
								)
						  })
				}
				return t
			}
			function a(t, e) {
				if (null == t) return {}
				var r,
					n,
					o = (function (t, e) {
						if (null == t) return {}
						var r,
							n,
							o = {},
							i = Object.keys(t)
						for (n = 0; n < i.length; n++)
							(r = i[n]), e.indexOf(r) >= 0 || (o[r] = t[r])
						return o
					})(t, e)
				if (Object.getOwnPropertySymbols) {
					var i = Object.getOwnPropertySymbols(t)
					for (n = 0; n < i.length; n++)
						(r = i[n]),
							e.indexOf(r) >= 0 ||
								(Object.prototype.propertyIsEnumerable.call(t, r) &&
									(o[r] = t[r]))
				}
				return o
			}
			var u = n.createContext({}),
				s = function (t) {
					var e = n.useContext(u),
						r = e
					return t && (r = "function" == typeof t ? t(e) : c(c({}, e), t)), r
				},
				p = function (t) {
					var e = s(t.components)
					return n.createElement(u.Provider, { value: e }, t.children)
				},
				l = {
					inlineCode: "code",
					wrapper: function (t) {
						var e = t.children
						return n.createElement(n.Fragment, {}, e)
					}
				},
				f = n.forwardRef(function (t, e) {
					var r = t.components,
						o = t.mdxType,
						i = t.originalType,
						u = t.parentName,
						p = a(t, ["components", "mdxType", "originalType", "parentName"]),
						f = s(r),
						d = o,
						m = f["".concat(u, ".").concat(d)] || f[d] || l[d] || i
					return r
						? n.createElement(m, c(c({ ref: e }, p), {}, { components: r }))
						: n.createElement(m, c({ ref: e }, p))
				})
			function d(t, e) {
				var r = arguments,
					o = e && e.mdxType
				if ("string" == typeof t || o) {
					var i = r.length,
						c = new Array(i)
					c[0] = f
					var a = {}
					for (var u in e) hasOwnProperty.call(e, u) && (a[u] = e[u])
					;(a.originalType = t),
						(a.mdxType = "string" == typeof t ? t : o),
						(c[1] = a)
					for (var s = 2; s < i; s++) c[s] = r[s]
					return n.createElement.apply(null, c)
				}
				return n.createElement.apply(null, r)
			}
			f.displayName = "MDXCreateElement"
		},
		3166: function (t, e, r) {
			r.r(e),
				r.d(e, {
					frontMatter: function () {
						return a
					},
					contentTitle: function () {
						return u
					},
					metadata: function () {
						return s
					},
					toc: function () {
						return p
					},
					default: function () {
						return f
					}
				})
			var n = r(7462),
				o = r(3366),
				i = (r(7294), r(3905)),
				c = ["components"],
				a = {},
				u = "Contributors",
				s = {
					unversionedId: "getting-started/contributors",
					id: "getting-started/contributors",
					isDocsHomePage: !1,
					title: "Contributors",
					description: "",
					source: "@site/docs/getting-started/contributors.md",
					sourceDirName: "getting-started",
					slug: "/getting-started/contributors",
					permalink: "/action-masterminds/fr/docs/getting-started/contributors",
					editUrl:
						"https://github.com/videndum/action-masterminds/edit/develop/docs/docs/getting-started/contributors.md",
					version: "current",
					frontMatter: {},
					sidebar: "getting",
					previous: {
						title:
							"Support \ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc67\u200d\ud83d\udc66",
						permalink: "/action-masterminds/fr/docs/getting-started/support"
					}
				},
				p = [],
				l = { toc: p }
			function f(t) {
				var e = t.components,
					r = (0, o.Z)(t, c)
				return (0, i.kt)(
					"wrapper",
					(0, n.Z)({}, l, r, { components: e, mdxType: "MDXLayout" }),
					(0, i.kt)("h1", { id: "contributors" }, "Contributors")
				)
			}
			f.isMDXComponent = !0
		}
	}
])
