/** @format */

"use strict"
;(self.webpackChunkaction_masterminds =
	self.webpackChunkaction_masterminds || []).push([
	[6329],
	{
		3905: function (e, t, n) {
			n.d(t, {
				Zo: function () {
					return u
				},
				kt: function () {
					return p
				}
			})
			var o = n(7294)
			function r(e, t, n) {
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
					var o = Object.getOwnPropertySymbols(e)
					t &&
						(o = o.filter(function (t) {
							return Object.getOwnPropertyDescriptor(e, t).enumerable
						})),
						n.push.apply(n, o)
				}
				return n
			}
			function a(e) {
				for (var t = 1; t < arguments.length; t++) {
					var n = null != arguments[t] ? arguments[t] : {}
					t % 2
						? i(Object(n), !0).forEach(function (t) {
								r(e, t, n[t])
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
			function s(e, t) {
				if (null == e) return {}
				var n,
					o,
					r = (function (e, t) {
						if (null == e) return {}
						var n,
							o,
							r = {},
							i = Object.keys(e)
						for (o = 0; o < i.length; o++)
							(n = i[o]), t.indexOf(n) >= 0 || (r[n] = e[n])
						return r
					})(e, t)
				if (Object.getOwnPropertySymbols) {
					var i = Object.getOwnPropertySymbols(e)
					for (o = 0; o < i.length; o++)
						(n = i[o]),
							t.indexOf(n) >= 0 ||
								(Object.prototype.propertyIsEnumerable.call(e, n) &&
									(r[n] = e[n]))
				}
				return r
			}
			var l = o.createContext({}),
				c = function (e) {
					var t = o.useContext(l),
						n = t
					return e && (n = "function" == typeof e ? e(t) : a(a({}, t), e)), n
				},
				u = function (e) {
					var t = c(e.components)
					return o.createElement(l.Provider, { value: t }, e.children)
				},
				d = {
					inlineCode: "code",
					wrapper: function (e) {
						var t = e.children
						return o.createElement(o.Fragment, {}, t)
					}
				},
				m = o.forwardRef(function (e, t) {
					var n = e.components,
						r = e.mdxType,
						i = e.originalType,
						l = e.parentName,
						u = s(e, ["components", "mdxType", "originalType", "parentName"]),
						m = c(n),
						p = r,
						f = m["".concat(l, ".").concat(p)] || m[p] || d[p] || i
					return n
						? o.createElement(f, a(a({ ref: t }, u), {}, { components: n }))
						: o.createElement(f, a({ ref: t }, u))
				})
			function p(e, t) {
				var n = arguments,
					r = t && t.mdxType
				if ("string" == typeof e || r) {
					var i = n.length,
						a = new Array(i)
					a[0] = m
					var s = {}
					for (var l in t) hasOwnProperty.call(t, l) && (s[l] = t[l])
					;(s.originalType = e),
						(s.mdxType = "string" == typeof e ? e : r),
						(a[1] = s)
					for (var c = 2; c < i; c++) a[c] = n[c]
					return o.createElement.apply(null, a)
				}
				return o.createElement.apply(null, n)
			}
			m.displayName = "MDXCreateElement"
		},
		3539: function (e, t, n) {
			n.r(t),
				n.d(t, {
					frontMatter: function () {
						return s
					},
					contentTitle: function () {
						return l
					},
					metadata: function () {
						return c
					},
					toc: function () {
						return u
					},
					default: function () {
						return m
					}
				})
			var o = n(7462),
				r = n(3366),
				i = (n(7294), n(3905)),
				a = ["components"],
				s = {
					id: "intro",
					title: "Getting Started",
					sidebar_label: "Intro",
					slug: "/getting-started"
				},
				l = void 0,
				c = {
					unversionedId: "getting-started/intro",
					id: "getting-started/intro",
					isDocsHomePage: !1,
					title: "Getting Started",
					description:
						"Welcome to the Github Action Mastermind collection. This is the mono-repository for Videndum's collection of superpowered actions. This collection is built to work together as an universal tool for Github Project management. For simplicity, our main tool - Release Mastermind - incorporates all our other tools within one simple action, which can be used in all your workflows to manage all your common tasks.",
					source: "@site/docs/getting-started/index.md",
					sourceDirName: "getting-started",
					slug: "/getting-started",
					permalink: "/action-masterminds/es/docs/getting-started",
					editUrl:
						"https://github.com/videndum/action-masterminds/edit/develop/docs/docs/getting-started/index.md",
					version: "current",
					frontMatter: {
						id: "intro",
						title: "Getting Started",
						sidebar_label: "Intro",
						slug: "/getting-started"
					},
					sidebar: "getting",
					next: {
						title: "Manual setup",
						permalink: "/action-masterminds/es/docs/getting-started/setup"
					}
				},
				u = [],
				d = { toc: u }
			function m(e) {
				var t = e.components,
					n = (0, r.Z)(e, a)
				return (0, i.kt)(
					"wrapper",
					(0, o.Z)({}, d, n, { components: t, mdxType: "MDXLayout" }),
					(0, i.kt)(
						"p",
						null,
						"Welcome to the Github Action Mastermind collection. This is the mono-repository for Videndum's collection of superpowered actions. This collection is built to work together as an universal tool for Github Project management. For simplicity, our main tool - Release Mastermind - incorporates all our other tools within one simple action, which can be used in all your workflows to manage all your common tasks."
					),
					(0, i.kt)(
						"p",
						null,
						"We designed this tool because the community tools either didn't have the features we wanted, or are not maintained. We wanted to create a single action which could do everything, or nothing, dependent on the configuration. This tool does exactly that, you choose how much or how little you want it to do..."
					),
					(0, i.kt)(
						"p",
						null,
						"Need reasons to consider using Release Manager?"
					),
					(0, i.kt)(
						"ul",
						null,
						(0, i.kt)(
							"li",
							{ parentName: "ul" },
							"Everything is configured from either JSON or YAML files found within your ",
							(0, i.kt)("inlineCode", { parentName: "li" }, ".github"),
							" folder for the repository. One file = no clutter."
						),
						(0, i.kt)(
							"li",
							{ parentName: "ul" },
							"Automates all common tasks within a single action - Reduce the size of your workflow files"
						),
						(0, i.kt)(
							"li",
							{ parentName: "ul" },
							"Actively maintained - This project is actively maintained as it's the backbone of all our projects"
						),
						(0, i.kt)(
							"li",
							{ parentName: "ul" },
							"Works on any repository - No complex permission setups, simply use a Personal Access Token with access to the repository or the default ",
							(0, i.kt)("inlineCode", { parentName: "li" }, "GITHUB_TOKEN")
						)
					)
				)
			}
			m.isMDXComponent = !0
		}
	}
])
