/** @format */

"use strict"
;(self.webpackChunkaction_masterminds =
	self.webpackChunkaction_masterminds || []).push([
	[5585],
	{
		3905: function (e, t, r) {
			r.d(t, {
				Zo: function () {
					return p
				},
				kt: function () {
					return f
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
			function a(e) {
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
			function s(e, t) {
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
			var l = n.createContext({}),
				c = function (e) {
					var t = n.useContext(l),
						r = t
					return e && (r = "function" == typeof e ? e(t) : a(a({}, t), e)), r
				},
				p = function (e) {
					var t = c(e.components)
					return n.createElement(l.Provider, { value: t }, e.children)
				},
				u = {
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
						l = e.parentName,
						p = s(e, ["components", "mdxType", "originalType", "parentName"]),
						d = c(r),
						f = i,
						m = d["".concat(l, ".").concat(f)] || d[f] || u[f] || o
					return r
						? n.createElement(m, a(a({ ref: t }, p), {}, { components: r }))
						: n.createElement(m, a({ ref: t }, p))
				})
			function f(e, t) {
				var r = arguments,
					i = t && t.mdxType
				if ("string" == typeof e || i) {
					var o = r.length,
						a = new Array(o)
					a[0] = d
					var s = {}
					for (var l in t) hasOwnProperty.call(t, l) && (s[l] = t[l])
					;(s.originalType = e),
						(s.mdxType = "string" == typeof e ? e : i),
						(a[1] = s)
					for (var c = 2; c < o; c++) a[c] = r[c]
					return n.createElement.apply(null, a)
				}
				return n.createElement.apply(null, r)
			}
			d.displayName = "MDXCreateElement"
		},
		6481: function (e, t, r) {
			r.r(t),
				r.d(t, {
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
						return p
					},
					default: function () {
						return d
					}
				})
			var n = r(7462),
				i = r(3366),
				o = (r(7294), r(3905)),
				a = ["components"],
				s = {
					id: "Repo",
					title: "Interface: Repo",
					sidebar_label: "Repo",
					sidebar_position: 0,
					custom_edit_url: null
				},
				l = void 0,
				c = {
					unversionedId: "release-mastermind/interfaces/Repo",
					id: "release-mastermind/interfaces/Repo",
					isDocsHomePage: !1,
					title: "Interface: Repo",
					description: "Properties",
					source: "@site/docs/release-mastermind/interfaces/Repo.md",
					sourceDirName: "release-mastermind/interfaces",
					slug: "/release-mastermind/interfaces/Repo",
					permalink:
						"/action-masterminds/fr/docs/release-mastermind/interfaces/Repo",
					editUrl: null,
					version: "current",
					sidebarPosition: 0,
					frontMatter: {
						id: "Repo",
						title: "Interface: Repo",
						sidebar_label: "Repo",
						sidebar_position: 0,
						custom_edit_url: null
					},
					sidebar: "release",
					previous: {
						title: "PullRequestConfig",
						permalink:
							"/action-masterminds/fr/docs/release-mastermind/interfaces/PullRequestConfig"
					},
					next: {
						title: "Runners",
						permalink:
							"/action-masterminds/fr/docs/release-mastermind/interfaces/Runners"
					}
				},
				p = [
					{
						value: "Properties",
						id: "properties",
						children: [
							{ value: "owner", id: "owner", children: [] },
							{ value: "repo", id: "repo", children: [] }
						]
					}
				],
				u = { toc: p }
			function d(e) {
				var t = e.components,
					r = (0, i.Z)(e, a)
				return (0, o.kt)(
					"wrapper",
					(0, n.Z)({}, u, r, { components: t, mdxType: "MDXLayout" }),
					(0, o.kt)("h2", { id: "properties" }, "Properties"),
					(0, o.kt)("h3", { id: "owner" }, "owner"),
					(0, o.kt)(
						"p",
						null,
						"\u2022 ",
						(0, o.kt)("strong", { parentName: "p" }, "owner"),
						": ",
						(0, o.kt)("inlineCode", { parentName: "p" }, "string")
					),
					(0, o.kt)("h4", { id: "defined-in" }, "Defined in"),
					(0, o.kt)(
						"p",
						null,
						(0, o.kt)(
							"a",
							{
								parentName: "p",
								href:
									"https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/utils/index.ts#L200"
							},
							"utils/index.ts:200"
						)
					),
					(0, o.kt)("hr", null),
					(0, o.kt)("h3", { id: "repo" }, "repo"),
					(0, o.kt)(
						"p",
						null,
						"\u2022 ",
						(0, o.kt)("strong", { parentName: "p" }, "repo"),
						": ",
						(0, o.kt)("inlineCode", { parentName: "p" }, "string")
					),
					(0, o.kt)("h4", { id: "defined-in-1" }, "Defined in"),
					(0, o.kt)(
						"p",
						null,
						(0, o.kt)(
							"a",
							{
								parentName: "p",
								href:
									"https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/utils/index.ts#L201"
							},
							"utils/index.ts:201"
						)
					)
				)
			}
			d.isMDXComponent = !0
		}
	}
])
