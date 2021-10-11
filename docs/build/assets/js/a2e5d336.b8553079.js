/** @format */

"use strict"
;(self.webpackChunkaction_masterminds =
	self.webpackChunkaction_masterminds || []).push([
	[1605],
	{
		3905: function (e, n, t) {
			t.d(n, {
				Zo: function () {
					return l
				},
				kt: function () {
					return p
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
			function c(e) {
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
			function a(e, n) {
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
			var s = r.createContext({}),
				d = function (e) {
					var n = r.useContext(s),
						t = n
					return e && (t = "function" == typeof e ? e(n) : c(c({}, n), e)), t
				},
				l = function (e) {
					var n = d(e.components)
					return r.createElement(s.Provider, { value: n }, e.children)
				},
				u = {
					inlineCode: "code",
					wrapper: function (e) {
						var n = e.children
						return r.createElement(r.Fragment, {}, n)
					}
				},
				f = r.forwardRef(function (e, n) {
					var t = e.components,
						i = e.mdxType,
						o = e.originalType,
						s = e.parentName,
						l = a(e, ["components", "mdxType", "originalType", "parentName"]),
						f = d(t),
						p = i,
						m = f["".concat(s, ".").concat(p)] || f[p] || u[p] || o
					return t
						? r.createElement(m, c(c({ ref: n }, l), {}, { components: t }))
						: r.createElement(m, c({ ref: n }, l))
				})
			function p(e, n) {
				var t = arguments,
					i = n && n.mdxType
				if ("string" == typeof e || i) {
					var o = t.length,
						c = new Array(o)
					c[0] = f
					var a = {}
					for (var s in n) hasOwnProperty.call(n, s) && (a[s] = n[s])
					;(a.originalType = e),
						(a.mdxType = "string" == typeof e ? e : i),
						(c[1] = a)
					for (var d = 2; d < o; d++) c[d] = t[d]
					return r.createElement.apply(null, c)
				}
				return r.createElement.apply(null, t)
			}
			f.displayName = "MDXCreateElement"
		},
		1729: function (e, n, t) {
			t.r(n),
				t.d(n, {
					frontMatter: function () {
						return a
					},
					contentTitle: function () {
						return s
					},
					metadata: function () {
						return d
					},
					toc: function () {
						return l
					},
					default: function () {
						return f
					}
				})
			var r = t(7462),
				i = t(3366),
				o = (t(7294), t(3905)),
				c = ["components"],
				a = {
					id: "ProjectConditionConfig",
					title: "Interface: ProjectConditionConfig",
					sidebar_label: "ProjectConditionConfig",
					sidebar_position: 0,
					custom_edit_url: null
				},
				s = void 0,
				d = {
					unversionedId: "release-mastermind/interfaces/ProjectConditionConfig",
					id: "release-mastermind/interfaces/ProjectConditionConfig",
					isDocsHomePage: !1,
					title: "Interface: ProjectConditionConfig",
					description: "The Project condition configuration",
					source:
						"@site/docs/release-mastermind/interfaces/ProjectConditionConfig.md",
					sourceDirName: "release-mastermind/interfaces",
					slug: "/release-mastermind/interfaces/ProjectConditionConfig",
					permalink:
						"/action-masterminds/docs/release-mastermind/interfaces/ProjectConditionConfig",
					editUrl: null,
					version: "current",
					sidebarPosition: 0,
					frontMatter: {
						id: "ProjectConditionConfig",
						title: "Interface: ProjectConditionConfig",
						sidebar_label: "ProjectConditionConfig",
						sidebar_position: 0,
						custom_edit_url: null
					},
					sidebar: "release",
					previous: {
						title: "PRConditionConfig",
						permalink:
							"/action-masterminds/docs/release-mastermind/interfaces/PRConditionConfig"
					},
					next: {
						title: "ProjectConfig",
						permalink:
							"/action-masterminds/docs/release-mastermind/interfaces/ProjectConfig"
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
			function f(e) {
				var n = e.components,
					t = (0, i.Z)(e, c)
				return (0, o.kt)(
					"wrapper",
					(0, r.Z)({}, u, t, { components: n, mdxType: "MDXLayout" }),
					(0, o.kt)("p", null, "The Project condition configuration"),
					(0, o.kt)("h2", { id: "properties" }, "Properties"),
					(0, o.kt)("h3", { id: "conditions" }, "conditions"),
					(0, o.kt)(
						"p",
						null,
						"\u2022 ",
						(0, o.kt)("strong", { parentName: "p" }, "conditions"),
						": ",
						(0, o.kt)(
							"a",
							{
								parentName: "p",
								href:
									"/action-masterminds/docs/release-mastermind/modules#projectcondition"
							},
							(0, o.kt)("inlineCode", { parentName: "a" }, "ProjectCondition")
						),
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
									"https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/conditions/index.ts#L264"
							},
							"conditions/index.ts:264"
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
									"https://github.com/Videndum/Convential-PR-Releases/blob/377fcdd/src/conditions/index.ts#L260"
							},
							"conditions/index.ts:260"
						)
					)
				)
			}
			f.isMDXComponent = !0
		}
	}
])
