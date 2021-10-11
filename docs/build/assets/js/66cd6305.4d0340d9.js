/** @format */

"use strict"
;(self.webpackChunkaction_masterminds =
	self.webpackChunkaction_masterminds || []).push([
	[2821],
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
			var d = r.createContext({}),
				c = function (e) {
					var n = r.useContext(d),
						t = n
					return e && (t = "function" == typeof e ? e(n) : a(a({}, n), e)), t
				},
				l = function (e) {
					var n = c(e.components)
					return r.createElement(d.Provider, { value: n }, e.children)
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
						d = e.parentName,
						l = s(e, ["components", "mdxType", "originalType", "parentName"]),
						p = c(t),
						f = i,
						m = p["".concat(d, ".").concat(f)] || p[f] || u[f] || o
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
					for (var d in n) hasOwnProperty.call(n, d) && (s[d] = n[d])
					;(s.originalType = e),
						(s.mdxType = "string" == typeof e ? e : i),
						(a[1] = s)
					for (var c = 2; c < o; c++) a[c] = t[c]
					return r.createElement.apply(null, a)
				}
				return r.createElement.apply(null, t)
			}
			p.displayName = "MDXCreateElement"
		},
		6257: function (e, n, t) {
			t.r(n),
				t.d(n, {
					frontMatter: function () {
						return s
					},
					contentTitle: function () {
						return d
					},
					metadata: function () {
						return c
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
					id: "SharedConditions",
					title: "Interface: SharedConditions",
					sidebar_label: "SharedConditions",
					sidebar_position: 0,
					custom_edit_url: null
				},
				d = void 0,
				c = {
					unversionedId: "release-mastermind/interfaces/SharedConditions",
					id: "release-mastermind/interfaces/SharedConditions",
					isDocsHomePage: !1,
					title: "Interface: SharedConditions",
					description: "Shared conditions used by all types of events.",
					source:
						"@site/docs/release-mastermind/interfaces/SharedConditions.md",
					sourceDirName: "release-mastermind/interfaces",
					slug: "/release-mastermind/interfaces/SharedConditions",
					permalink:
						"/action-masterminds/docs/release-mastermind/interfaces/SharedConditions",
					editUrl: null,
					version: "current",
					sidebarPosition: 0,
					frontMatter: {
						id: "SharedConditions",
						title: "Interface: SharedConditions",
						sidebar_label: "SharedConditions",
						sidebar_position: 0,
						custom_edit_url: null
					},
					sidebar: "release",
					previous: {
						title: "ScheduleConditionConfig",
						permalink:
							"/action-masterminds/docs/release-mastermind/interfaces/ScheduleConditionConfig"
					},
					next: {
						title: "SharedConfig",
						permalink:
							"/action-masterminds/docs/release-mastermind/interfaces/SharedConfig"
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
					(0, o.kt)(
						"p",
						null,
						"Shared conditions used by all types of events."
					),
					(0, o.kt)("h2", { id: "properties" }, "Properties"),
					(0, o.kt)("h3", { id: "conditions" }, "conditions"),
					(0, o.kt)(
						"p",
						null,
						"\u2022 ",
						(0, o.kt)("strong", { parentName: "p" }, "conditions"),
						": ",
						(0, o.kt)("inlineCode", { parentName: "p" }, "Condition"),
						"[]"
					),
					(0, o.kt)("p", null, "The conditions required for this to succeed"),
					(0, o.kt)("h4", { id: "defined-in" }, "Defined in"),
					(0, o.kt)(
						"p",
						null,
						(0, o.kt)(
							"a",
							{
								parentName: "p",
								href:
									"https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/conditions/index.ts#L208"
							},
							"conditions/index.ts:208"
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
									"https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/conditions/index.ts#L204"
							},
							"conditions/index.ts:204"
						)
					)
				)
			}
			p.isMDXComponent = !0
		}
	}
])
