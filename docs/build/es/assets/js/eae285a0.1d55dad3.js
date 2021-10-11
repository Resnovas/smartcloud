/** @format */

"use strict"
;(self.webpackChunkaction_masterminds =
	self.webpackChunkaction_masterminds || []).push([
	[8778],
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
			var p = n.createContext({}),
				c = function (e) {
					var t = n.useContext(p),
						r = t
					return e && (r = "function" == typeof e ? e(t) : a(a({}, t), e)), r
				},
				l = function (e) {
					var t = c(e.components)
					return n.createElement(p.Provider, { value: t }, e.children)
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
						p = e.parentName,
						l = s(e, ["components", "mdxType", "originalType", "parentName"]),
						d = c(r),
						m = i,
						f = d["".concat(p, ".").concat(m)] || d[m] || u[m] || o
					return r
						? n.createElement(f, a(a({ ref: t }, l), {}, { components: r }))
						: n.createElement(f, a({ ref: t }, l))
				})
			function m(e, t) {
				var r = arguments,
					i = t && t.mdxType
				if ("string" == typeof e || i) {
					var o = r.length,
						a = new Array(o)
					a[0] = d
					var s = {}
					for (var p in t) hasOwnProperty.call(t, p) && (s[p] = t[p])
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
		6269: function (e, t, r) {
			r.r(t),
				r.d(t, {
					frontMatter: function () {
						return s
					},
					contentTitle: function () {
						return p
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
				a = ["components"],
				s = {
					id: "ApiProps",
					title: "Interface: ApiProps",
					sidebar_label: "ApiProps",
					sidebar_position: 0,
					custom_edit_url: null
				},
				p = void 0,
				c = {
					unversionedId: "release-mastermind/interfaces/ApiProps",
					id: "release-mastermind/interfaces/ApiProps",
					isDocsHomePage: !1,
					title: "Interface: ApiProps",
					description: "Properties",
					source: "@site/docs/release-mastermind/interfaces/ApiProps.md",
					sourceDirName: "release-mastermind/interfaces",
					slug: "/release-mastermind/interfaces/ApiProps",
					permalink:
						"/action-masterminds/es/docs/release-mastermind/interfaces/ApiProps",
					editUrl: null,
					version: "current",
					sidebarPosition: 0,
					frontMatter: {
						id: "ApiProps",
						title: "Interface: ApiProps",
						sidebar_label: "ApiProps",
						sidebar_position: 0,
						custom_edit_url: null
					},
					sidebar: "release",
					previous: {
						title: "Exports",
						permalink: "/action-masterminds/es/docs/release-mastermind/modules"
					},
					next: {
						title: "Config",
						permalink:
							"/action-masterminds/es/docs/release-mastermind/interfaces/Config"
					}
				},
				l = [
					{
						value: "Properties",
						id: "properties",
						children: [
							{ value: "client", id: "client", children: [] },
							{ value: "repo", id: "repo", children: [] }
						]
					}
				],
				u = { toc: l }
			function d(e) {
				var t = e.components,
					r = (0, i.Z)(e, a)
				return (0, o.kt)(
					"wrapper",
					(0, n.Z)({}, u, r, { components: t, mdxType: "MDXLayout" }),
					(0, o.kt)("h2", { id: "properties" }, "Properties"),
					(0, o.kt)("h3", { id: "client" }, "client"),
					(0, o.kt)(
						"p",
						null,
						"\u2022 ",
						(0, o.kt)("strong", { parentName: "p" }, "client"),
						": ",
						(0, o.kt)("inlineCode", { parentName: "p" }, "GitHub")
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
									"https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/utils/index.ts#L204"
							},
							"utils/index.ts:204"
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
						(0, o.kt)(
							"a",
							{
								parentName: "p",
								href:
									"/action-masterminds/es/docs/release-mastermind/interfaces/Repo"
							},
							(0, o.kt)("inlineCode", { parentName: "a" }, "Repo")
						)
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
									"https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/utils/index.ts#L205"
							},
							"utils/index.ts:205"
						)
					)
				)
			}
			d.isMDXComponent = !0
		}
	}
])
