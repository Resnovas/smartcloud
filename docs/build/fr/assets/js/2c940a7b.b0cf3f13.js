/** @format */

"use strict"
;(self.webpackChunkaction_masterminds =
	self.webpackChunkaction_masterminds || []).push([
	[1195],
	{
		3905: function (t, e, n) {
			n.d(e, {
				Zo: function () {
					return l
				},
				kt: function () {
					return m
				}
			})
			var r = n(7294)
			function i(t, e, n) {
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
			function o(t, e) {
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
						? o(Object(n), !0).forEach(function (e) {
								i(t, e, n[e])
						  })
						: Object.getOwnPropertyDescriptors
						? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n))
						: o(Object(n)).forEach(function (e) {
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
					i = (function (t, e) {
						if (null == t) return {}
						var n,
							r,
							i = {},
							o = Object.keys(t)
						for (r = 0; r < o.length; r++)
							(n = o[r]), e.indexOf(n) >= 0 || (i[n] = t[n])
						return i
					})(t, e)
				if (Object.getOwnPropertySymbols) {
					var o = Object.getOwnPropertySymbols(t)
					for (r = 0; r < o.length; r++)
						(n = o[r]),
							e.indexOf(n) >= 0 ||
								(Object.prototype.propertyIsEnumerable.call(t, n) &&
									(i[n] = t[n]))
				}
				return i
			}
			var s = r.createContext({}),
				c = function (t) {
					var e = r.useContext(s),
						n = e
					return t && (n = "function" == typeof t ? t(e) : a(a({}, e), t)), n
				},
				l = function (t) {
					var e = c(t.components)
					return r.createElement(s.Provider, { value: e }, t.children)
				},
				d = {
					inlineCode: "code",
					wrapper: function (t) {
						var e = t.children
						return r.createElement(r.Fragment, {}, e)
					}
				},
				g = r.forwardRef(function (t, e) {
					var n = t.components,
						i = t.mdxType,
						o = t.originalType,
						s = t.parentName,
						l = u(t, ["components", "mdxType", "originalType", "parentName"]),
						g = c(n),
						m = i,
						p = g["".concat(s, ".").concat(m)] || g[m] || d[m] || o
					return n
						? r.createElement(p, a(a({ ref: e }, l), {}, { components: n }))
						: r.createElement(p, a({ ref: e }, l))
				})
			function m(t, e) {
				var n = arguments,
					i = e && e.mdxType
				if ("string" == typeof t || i) {
					var o = n.length,
						a = new Array(o)
					a[0] = g
					var u = {}
					for (var s in e) hasOwnProperty.call(e, s) && (u[s] = e[s])
					;(u.originalType = t),
						(u.mdxType = "string" == typeof t ? t : i),
						(a[1] = u)
					for (var c = 2; c < o; c++) a[c] = n[c]
					return r.createElement.apply(null, a)
				}
				return r.createElement.apply(null, n)
			}
			g.displayName = "MDXCreateElement"
		},
		8335: function (t, e, n) {
			n.r(e),
				n.d(e, {
					frontMatter: function () {
						return u
					},
					contentTitle: function () {
						return s
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
				u = { sidebar_position: 2 },
				s = "Contribution Types",
				c = {
					unversionedId:
						"getting-started/contributing/Start Contributing/types",
					id: "getting-started/contributing/Start Contributing/types",
					isDocsHomePage: !1,
					title: "Contribution Types",
					description: "Minor Contributions",
					source:
						"@site/docs/getting-started/contributing/Start Contributing/types.md",
					sourceDirName: "getting-started/contributing/Start Contributing",
					slug: "/getting-started/contributing/Start Contributing/types",
					permalink:
						"/action-masterminds/fr/docs/getting-started/contributing/Start Contributing/types",
					editUrl:
						"https://github.com/videndum/action-masterminds/edit/develop/docs/docs/getting-started/contributing/Start Contributing/types.md",
					version: "current",
					sidebarPosition: 2,
					frontMatter: { sidebar_position: 2 },
					sidebar: "getting",
					previous: {
						title: "Branch Names",
						permalink:
							"/action-masterminds/fr/docs/getting-started/contributing/Start Contributing/branch"
					},
					next: {
						title: "Your First Contribution",
						permalink:
							"/action-masterminds/fr/docs/getting-started/contributing/Start Contributing/first"
					}
				},
				l = [
					{
						value: "Minor Contributions",
						id: "minor-contributions",
						children: []
					},
					{
						value: "Standard Contributions",
						id: "standard-contributions",
						children: []
					},
					{
						value: "Major Contributions",
						id: "major-contributions",
						children: []
					}
				],
				d = { toc: l }
			function g(t) {
				var e = t.components,
					n = (0, i.Z)(t, a)
				return (0, o.kt)(
					"wrapper",
					(0, r.Z)({}, d, n, { components: e, mdxType: "MDXLayout" }),
					(0, o.kt)("h1", { id: "contribution-types" }, "Contribution Types"),
					(0, o.kt)("h2", { id: "minor-contributions" }, "Minor Contributions"),
					(0, o.kt)(
						"p",
						null,
						"Small contributions such as fixing spelling errors, where the content is small enough to not be considered intellectual property, can be submitted by a contributor as a minor patch, without a CLA."
					),
					(0, o.kt)(
						"p",
						null,
						"As a rule of thumb, changes are obvious fixes if they do not introduce any new functionality or creative thinking. As long as the change does not affect functionality, some likely examples include the following:"
					),
					(0, o.kt)(
						"ul",
						null,
						(0, o.kt)("li", { parentName: "ul" }, "Spelling / grammar fixes"),
						(0, o.kt)(
							"li",
							{ parentName: "ul" },
							"Typo correction, white space and formatting changes"
						),
						(0, o.kt)("li", { parentName: "ul" }, "Comment clean up"),
						(0, o.kt)(
							"li",
							{ parentName: "ul" },
							"Bug fixes that change default return values or error codes stored in constants"
						),
						(0, o.kt)(
							"li",
							{ parentName: "ul" },
							"Adding logging messages or debugging output"
						),
						(0, o.kt)(
							"li",
							{ parentName: "ul" },
							"Changes to \ufffdmetadata\ufffd files like Gemfile, .gitignore, build scripts, etc."
						),
						(0, o.kt)(
							"li",
							{ parentName: "ul" },
							"Moving source files from one directory or package to another"
						)
					),
					(0, o.kt)(
						"h2",
						{ id: "standard-contributions" },
						"Standard Contributions"
					),
					(0, o.kt)(
						"p",
						null,
						"Standard contributions are contributions which are too large to be considered a minor contribution however, only address one feature or function. This can include, but is not limited to, tutorials, wiki pages, new features (e.g. small integrations) and feature enhancements. Our automation systems will automatically do all the hard work of labeling, assigning and reviewing your contribution."
					),
					(0, o.kt)(
						"p",
						null,
						"You our required to sign the CLA and agree to it's terms. This will be automatically handled by our automation when you create a pull request, and once signed you will be able to submit without resigning."
					),
					(0, o.kt)("h2", { id: "major-contributions" }, "Major Contributions"),
					(0, o.kt)(
						"p",
						null,
						"Major contributions are contributions which add, modify or remove multiple features or modules. We can not emphasise enough how much the community helps us every time they submit one of these."
					),
					(0, o.kt)(
						"p",
						null,
						"You our required to sign the CLA and agree to it's terms. This will be automatically handled by our automation when you create a pull request, and once signed you will be able to submit without resigning."
					)
				)
			}
			g.isMDXComponent = !0
		}
	}
])
