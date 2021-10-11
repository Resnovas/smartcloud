/** @format */

"use strict"
;(self.webpackChunkaction_masterminds =
	self.webpackChunkaction_masterminds || []).push([
	[5305],
	{
		3905: function (t, e, n) {
			n.d(e, {
				Zo: function () {
					return s
				},
				kt: function () {
					return m
				}
			})
			var r = n(7294)
			function o(t, e, n) {
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
			function i(t, e) {
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
			function a(t) {
				for (var e = 1; e < arguments.length; e++) {
					var n = null != arguments[e] ? arguments[e] : {}
					e % 2
						? i(Object(n), !0).forEach(function (e) {
								o(t, e, n[e])
						  })
						: Object.getOwnPropertyDescriptors
						? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n))
						: i(Object(n)).forEach(function (e) {
								Object.defineProperty(
									t,
									e,
									Object.getOwnPropertyDescriptor(n, e)
								)
						  })
				}
				return t
			}
			function u(t, e) {
				if (null == t) return {}
				var n,
					r,
					o = (function (t, e) {
						if (null == t) return {}
						var n,
							r,
							o = {},
							i = Object.keys(t)
						for (r = 0; r < i.length; r++)
							(n = i[r]), e.indexOf(n) >= 0 || (o[n] = t[n])
						return o
					})(t, e)
				if (Object.getOwnPropertySymbols) {
					var i = Object.getOwnPropertySymbols(t)
					for (r = 0; r < i.length; r++)
						(n = i[r]),
							e.indexOf(n) >= 0 ||
								(Object.prototype.propertyIsEnumerable.call(t, n) &&
									(o[n] = t[n]))
				}
				return o
			}
			var l = r.createContext({}),
				c = function (t) {
					var e = r.useContext(l),
						n = e
					return t && (n = "function" == typeof t ? t(e) : a(a({}, e), t)), n
				},
				s = function (t) {
					var e = c(t.components)
					return r.createElement(l.Provider, { value: e }, t.children)
				},
				p = {
					inlineCode: "code",
					wrapper: function (t) {
						var e = t.children
						return r.createElement(r.Fragment, {}, e)
					}
				},
				d = r.forwardRef(function (t, e) {
					var n = t.components,
						o = t.mdxType,
						i = t.originalType,
						l = t.parentName,
						s = u(t, ["components", "mdxType", "originalType", "parentName"]),
						d = c(n),
						m = o,
						f = d["".concat(l, ".").concat(m)] || d[m] || p[m] || i
					return n
						? r.createElement(f, a(a({ ref: e }, s), {}, { components: n }))
						: r.createElement(f, a({ ref: e }, s))
				})
			function m(t, e) {
				var n = arguments,
					o = e && e.mdxType
				if ("string" == typeof t || o) {
					var i = n.length,
						a = new Array(i)
					a[0] = d
					var u = {}
					for (var l in e) hasOwnProperty.call(e, l) && (u[l] = e[l])
					;(u.originalType = t),
						(u.mdxType = "string" == typeof t ? t : o),
						(a[1] = u)
					for (var c = 2; c < i; c++) a[c] = n[c]
					return r.createElement.apply(null, a)
				}
				return r.createElement.apply(null, n)
			}
			d.displayName = "MDXCreateElement"
		},
		7357: function (t, e, n) {
			n.r(e),
				n.d(e, {
					frontMatter: function () {
						return u
					},
					contentTitle: function () {
						return l
					},
					metadata: function () {
						return c
					},
					toc: function () {
						return s
					},
					default: function () {
						return d
					}
				})
			var r = n(7462),
				o = n(3366),
				i = (n(7294), n(3905)),
				a = ["components"],
				u = { sidebar_position: 1 },
				l = "Internal Contributions Workflow",
				c = {
					unversionedId:
						"getting-started/contributing/Start Contributing/internal",
					id: "getting-started/contributing/Start Contributing/internal",
					isDocsHomePage: !1,
					title: "Internal Contributions Workflow",
					description:
						"For all contributions you are required to do the following",
					source:
						"@site/docs/getting-started/contributing/Start Contributing/internal.md",
					sourceDirName: "getting-started/contributing/Start Contributing",
					slug: "/getting-started/contributing/Start Contributing/internal",
					permalink:
						"/action-masterminds/docs/getting-started/contributing/Start Contributing/internal",
					editUrl:
						"https://github.com/videndum/action-masterminds/edit/develop/docs/docs/getting-started/contributing/Start Contributing/internal.md",
					version: "current",
					sidebarPosition: 1,
					frontMatter: { sidebar_position: 1 },
					sidebar: "getting",
					previous: {
						title: "External Contributions Workflow",
						permalink:
							"/action-masterminds/docs/getting-started/contributing/Start Contributing/external"
					},
					next: {
						title: "Branch Names",
						permalink:
							"/action-masterminds/docs/getting-started/contributing/Start Contributing/branch"
					}
				},
				s = [],
				p = { toc: s }
			function d(t) {
				var e = t.components,
					n = (0, o.Z)(t, a)
				return (0, i.kt)(
					"wrapper",
					(0, r.Z)({}, p, n, { components: e, mdxType: "MDXLayout" }),
					(0, i.kt)(
						"h1",
						{ id: "internal-contributions-workflow" },
						"Internal Contributions Workflow"
					),
					(0, i.kt)(
						"p",
						null,
						"For all contributions you are required to do the following"
					),
					(0, i.kt)(
						"ol",
						null,
						(0, i.kt)(
							"li",
							{ parentName: "ol" },
							"Create an issue for the feature / issue / improvement"
						),
						(0, i.kt)(
							"li",
							{ parentName: "ol" },
							"Create your own branch of the latest development code (Normally automatically done by our bot)"
						),
						(0, i.kt)(
							"li",
							{ parentName: "ol" },
							"Do the changes in your branch"
						),
						(0, i.kt)(
							"li",
							{ parentName: "ol" },
							"If you like the change and think the project could use it:",
							(0, i.kt)(
								"ul",
								{ parentName: "li" },
								(0, i.kt)(
									"li",
									{ parentName: "ul" },
									"Be sure you have followed the code style for the project."
								),
								(0, i.kt)(
									"li",
									{ parentName: "ul" },
									"Be sure to have commented the code so others can follow."
								),
								(0, i.kt)(
									"li",
									{ parentName: "ul" },
									"Be sure to have checked your using the latest API changes within your code."
								),
								(0, i.kt)(
									"li",
									{ parentName: "ul" },
									"Be sure to have named your pull request according to our documentation."
								),
								(0, i.kt)(
									"li",
									{ parentName: "ul" },
									"Be sure to have included your information within the Pull Request."
								)
							)
						),
						(0, i.kt)("li", { parentName: "ol" }, "Send a Pull Request."),
						(0, i.kt)(
							"li",
							{ parentName: "ol" },
							"Await confirmation & Make any changes that Maintainers request."
						)
					)
				)
			}
			d.isMDXComponent = !0
		}
	}
])
