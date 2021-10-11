/** @format */

"use strict"
;(self.webpackChunkaction_masterminds =
	self.webpackChunkaction_masterminds || []).push([
	[7036],
	{
		3905: function (e, n, t) {
			t.d(n, {
				Zo: function () {
					return l
				},
				kt: function () {
					return f
				}
			})
			var r = t(7294)
			function i(e, n, t) {
				return (
					n in e
						? Object.defineProperty(e, n, {
								value: t,
								enumerable: !0,
								configurable: !0,
								writable: !0
						  })
						: (e[n] = t),
					e
				)
			}
			function o(e, n) {
				var t = Object.keys(e)
				if (Object.getOwnPropertySymbols) {
					var r = Object.getOwnPropertySymbols(e)
					n &&
						(r = r.filter(function (n) {
							return Object.getOwnPropertyDescriptor(e, n).enumerable
						})),
						t.push.apply(t, r)
				}
				return t
			}
			function a(e) {
				for (var n = 1; n < arguments.length; n++) {
					var t = null != arguments[n] ? arguments[n] : {}
					n % 2
						? o(Object(t), !0).forEach(function (n) {
								i(e, n, t[n])
						  })
						: Object.getOwnPropertyDescriptors
						? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t))
						: o(Object(t)).forEach(function (n) {
								Object.defineProperty(
									e,
									n,
									Object.getOwnPropertyDescriptor(t, n)
								)
						  })
				}
				return e
			}
			function s(e, n) {
				if (null == e) return {}
				var t,
					r,
					i = (function (e, n) {
						if (null == e) return {}
						var t,
							r,
							i = {},
							o = Object.keys(e)
						for (r = 0; r < o.length; r++)
							(t = o[r]), n.indexOf(t) >= 0 || (i[t] = e[t])
						return i
					})(e, n)
				if (Object.getOwnPropertySymbols) {
					var o = Object.getOwnPropertySymbols(e)
					for (r = 0; r < o.length; r++)
						(t = o[r]),
							n.indexOf(t) >= 0 ||
								(Object.prototype.propertyIsEnumerable.call(e, t) &&
									(i[t] = e[t]))
				}
				return i
			}
			var c = r.createContext({}),
				d = function (e) {
					var n = r.useContext(c),
						t = n
					return e && (t = "function" == typeof e ? e(n) : a(a({}, n), e)), t
				},
				l = function (e) {
					var n = d(e.components)
					return r.createElement(c.Provider, { value: n }, e.children)
				},
				u = {
					inlineCode: "code",
					wrapper: function (e) {
						var n = e.children
						return r.createElement(r.Fragment, {}, n)
					}
				},
				p = r.forwardRef(function (e, n) {
					var t = e.components,
						i = e.mdxType,
						o = e.originalType,
						c = e.parentName,
						l = s(e, ["components", "mdxType", "originalType", "parentName"]),
						p = d(t),
						f = i,
						m = p["".concat(c, ".").concat(f)] || p[f] || u[f] || o
					return t
						? r.createElement(m, a(a({ ref: n }, l), {}, { components: t }))
						: r.createElement(m, a({ ref: n }, l))
				})
			function f(e, n) {
				var t = arguments,
					i = n && n.mdxType
				if ("string" == typeof e || i) {
					var o = t.length,
						a = new Array(o)
					a[0] = p
					var s = {}
					for (var c in n) hasOwnProperty.call(n, c) && (s[c] = n[c])
					;(s.originalType = e),
						(s.mdxType = "string" == typeof e ? e : i),
						(a[1] = s)
					for (var d = 2; d < o; d++) a[d] = t[d]
					return r.createElement.apply(null, a)
				}
				return r.createElement.apply(null, t)
			}
			p.displayName = "MDXCreateElement"
		},
		8059: function (e, n, t) {
			t.r(n),
				t.d(n, {
					frontMatter: function () {
						return s
					},
					contentTitle: function () {
						return c
					},
					metadata: function () {
						return d
					},
					toc: function () {
						return l
					},
					default: function () {
						return p
					}
				})
			var r = t(7462),
				i = t(3366),
				o = (t(7294), t(3905)),
				a = ["components"],
				s = {
					id: "SharedConventionConditions",
					title: "Interface: SharedConventionConditions",
					sidebar_label: "SharedConventionConditions",
					sidebar_position: 0,
					custom_edit_url: null
				},
				c = void 0,
				d = {
					unversionedId:
						"release-mastermind/interfaces/SharedConventionConditions",
					id: "release-mastermind/interfaces/SharedConventionConditions",
					isDocsHomePage: !1,
					title: "Interface: SharedConventionConditions",
					description: "Conventions to use",
					source:
						"@site/docs/release-mastermind/interfaces/SharedConventionConditions.md",
					sourceDirName: "release-mastermind/interfaces",
					slug: "/release-mastermind/interfaces/SharedConventionConditions",
					permalink:
						"/action-masterminds/fr/docs/release-mastermind/interfaces/SharedConventionConditions",
					editUrl: null,
					version: "current",
					sidebarPosition: 0,
					frontMatter: {
						id: "SharedConventionConditions",
						title: "Interface: SharedConventionConditions",
						sidebar_label: "SharedConventionConditions",
						sidebar_position: 0,
						custom_edit_url: null
					},
					sidebar: "release",
					previous: {
						title: "SharedConfig",
						permalink:
							"/action-masterminds/fr/docs/release-mastermind/interfaces/SharedConfig"
					}
				},
				l = [
					{
						value: "Properties",
						id: "properties",
						children: [
							{ value: "conditions", id: "conditions", children: [] },
							{ value: "requires", id: "requires", children: [] }
						]
					}
				],
				u = { toc: l }
			function p(e) {
				var n = e.components,
					t = (0, i.Z)(e, a)
				return (0, o.kt)(
					"wrapper",
					(0, r.Z)({}, u, t, { components: n, mdxType: "MDXLayout" }),
					(0, o.kt)("p", null, "Conventions to use"),
					(0, o.kt)("h2", { id: "properties" }, "Properties"),
					(0, o.kt)("h3", { id: "conditions" }, "conditions"),
					(0, o.kt)(
						"p",
						null,
						"\u2022 ",
						(0, o.kt)("strong", { parentName: "p" }, "conditions"),
						": ",
						(0, o.kt)("inlineCode", { parentName: "p" }, "string"),
						" ",
						"|",
						" ",
						(0, o.kt)("inlineCode", { parentName: "p" }, "Condition"),
						"[]"
					),
					(0, o.kt)(
						"p",
						null,
						'The conditions required for this to succeed. You can use the "semanticTitle" to automatically apply thses conditions'
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
									"https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/conditions/index.ts#L222"
							},
							"conditions/index.ts:222"
						)
					),
					(0, o.kt)("hr", null),
					(0, o.kt)("h3", { id: "requires" }, "requires"),
					(0, o.kt)(
						"p",
						null,
						"\u2022 ",
						(0, o.kt)("strong", { parentName: "p" }, "requires"),
						": ",
						(0, o.kt)("inlineCode", { parentName: "p" }, "number")
					),
					(0, o.kt)(
						"p",
						null,
						"The number of requires needed for this to succeed"
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
									"https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/conditions/index.ts#L218"
							},
							"conditions/index.ts:218"
						)
					)
				)
			}
			p.isMDXComponent = !0
		}
	}
])
