/** @format */

"use strict"
;(self.webpackChunkaction_masterminds =
	self.webpackChunkaction_masterminds || []).push([
	[329],
	{
		3905: function (e, n, t) {
			t.d(n, {
				Zo: function () {
					return p
				},
				kt: function () {
					return g
				}
			})
			var i = t(7294)
			function r(e, n, t) {
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
					var i = Object.getOwnPropertySymbols(e)
					n &&
						(i = i.filter(function (n) {
							return Object.getOwnPropertyDescriptor(e, n).enumerable
						})),
						t.push.apply(t, i)
				}
				return t
			}
			function a(e) {
				for (var n = 1; n < arguments.length; n++) {
					var t = null != arguments[n] ? arguments[n] : {}
					n % 2
						? o(Object(t), !0).forEach(function (n) {
								r(e, n, t[n])
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
			function l(e, n) {
				if (null == e) return {}
				var t,
					i,
					r = (function (e, n) {
						if (null == e) return {}
						var t,
							i,
							r = {},
							o = Object.keys(e)
						for (i = 0; i < o.length; i++)
							(t = o[i]), n.indexOf(t) >= 0 || (r[t] = e[t])
						return r
					})(e, n)
				if (Object.getOwnPropertySymbols) {
					var o = Object.getOwnPropertySymbols(e)
					for (i = 0; i < o.length; i++)
						(t = o[i]),
							n.indexOf(t) >= 0 ||
								(Object.prototype.propertyIsEnumerable.call(e, t) &&
									(r[t] = e[t]))
				}
				return r
			}
			var c = i.createContext({}),
				u = function (e) {
					var n = i.useContext(c),
						t = n
					return e && (t = "function" == typeof e ? e(n) : a(a({}, n), e)), t
				},
				p = function (e) {
					var n = u(e.components)
					return i.createElement(c.Provider, { value: n }, e.children)
				},
				s = {
					inlineCode: "code",
					wrapper: function (e) {
						var n = e.children
						return i.createElement(i.Fragment, {}, n)
					}
				},
				d = i.forwardRef(function (e, n) {
					var t = e.components,
						r = e.mdxType,
						o = e.originalType,
						c = e.parentName,
						p = l(e, ["components", "mdxType", "originalType", "parentName"]),
						d = u(t),
						g = r,
						m = d["".concat(c, ".").concat(g)] || d[g] || s[g] || o
					return t
						? i.createElement(m, a(a({ ref: n }, p), {}, { components: t }))
						: i.createElement(m, a({ ref: n }, p))
				})
			function g(e, n) {
				var t = arguments,
					r = n && n.mdxType
				if ("string" == typeof e || r) {
					var o = t.length,
						a = new Array(o)
					a[0] = d
					var l = {}
					for (var c in n) hasOwnProperty.call(n, c) && (l[c] = n[c])
					;(l.originalType = e),
						(l.mdxType = "string" == typeof e ? e : r),
						(a[1] = l)
					for (var u = 2; u < o; u++) a[u] = t[u]
					return i.createElement.apply(null, a)
				}
				return i.createElement.apply(null, t)
			}
			d.displayName = "MDXCreateElement"
		},
		4983: function (e, n, t) {
			t.r(n),
				t.d(n, {
					frontMatter: function () {
						return l
					},
					contentTitle: function () {
						return c
					},
					metadata: function () {
						return u
					},
					toc: function () {
						return p
					},
					default: function () {
						return d
					}
				})
			var i = t(7462),
				r = t(3366),
				o = (t(7294), t(3905)),
				a = ["components"],
				l = { sidebar_position: 3 },
				c = "Running Locally & Developing",
				u = {
					unversionedId: "getting-started/contributing/runningLocally",
					id: "getting-started/contributing/runningLocally",
					isDocsHomePage: !1,
					title: "Running Locally & Developing",
					description:
						"Setting up local running is simple, however we MUST warn that building / packaging while using local scripts can cause your GITHUB_TOKEN to be included within the package. To avoid this happening. you MUST follow the steps correctly. We will not be held responsible for any leeked personal tokens.",
					source: "@site/docs/getting-started/contributing/runningLocally.md",
					sourceDirName: "getting-started/contributing",
					slug: "/getting-started/contributing/runningLocally",
					permalink:
						"/action-masterminds/docs/getting-started/contributing/runningLocally",
					editUrl:
						"https://github.com/videndum/action-masterminds/edit/develop/docs/docs/getting-started/contributing/runningLocally.md",
					version: "current",
					sidebarPosition: 3,
					frontMatter: { sidebar_position: 3 },
					sidebar: "getting",
					previous: {
						title: "Signing Git with GPG using Keybase",
						permalink:
							"/action-masterminds/docs/getting-started/contributing/gpgkey"
					},
					next: {
						title: "Code review process",
						permalink:
							"/action-masterminds/docs/getting-started/contributing/code-review-process"
					}
				},
				p = [
					{ value: "Prerequisities", id: "prerequisities", children: [] },
					{ value: "Developing", id: "developing", children: [] },
					{ value: "Running locally", id: "running-locally", children: [] }
				],
				s = { toc: p }
			function d(e) {
				var n = e.components,
					t = (0, r.Z)(e, a)
				return (0, o.kt)(
					"wrapper",
					(0, i.Z)({}, s, t, { components: n, mdxType: "MDXLayout" }),
					(0, o.kt)(
						"h1",
						{ id: "running-locally--developing" },
						"Running Locally & Developing"
					),
					(0, o.kt)(
						"p",
						null,
						"Setting up local running is simple, however we ",
						(0, o.kt)("strong", { parentName: "p" }, "MUST"),
						" warn that building / packaging while using local scripts can cause your GITHUB_TOKEN to be included within the package. To avoid this happening. you ",
						(0, o.kt)("strong", { parentName: "p" }, "MUST"),
						" follow the steps correctly. We will not be held responsible for any leeked personal tokens."
					),
					(0, o.kt)("h2", { id: "prerequisities" }, "Prerequisities"),
					(0, o.kt)(
						"ol",
						null,
						(0, o.kt)(
							"li",
							{ parentName: "ol" },
							"Setup a secret on your repository named: ",
							(0, o.kt)(
								"inlineCode",
								{ parentName: "li" },
								"ACTIONS_STEP_DEBUG"
							),
							" value: ",
							(0, o.kt)("inlineCode", { parentName: "li" }, "true")
						),
						(0, o.kt)(
							"li",
							{ parentName: "ol" },
							"Ensure the action has run once after you created this secret"
						)
					),
					(0, o.kt)("h2", { id: "developing" }, "Developing"),
					(0, o.kt)(
						"ol",
						{ start: 3 },
						(0, o.kt)(
							"li",
							{ parentName: "ol" },
							"Fork & Clone the ",
							(0, o.kt)(
								"a",
								{
									parentName: "li",
									href: "https://github.com/Videndum/action-masterminds"
								},
								"development repository"
							)
						),
						(0, o.kt)(
							"li",
							{ parentName: "ol" },
							"Continue from step 4 of ",
							(0, o.kt)("inlineCode", { parentName: "li" }, "Running Locally"),
							" then return to step 5 & 6."
						),
						(0, o.kt)(
							"li",
							{ parentName: "ol" },
							"Make changes, then rebuild using ",
							(0, o.kt)("inlineCode", { parentName: "li" }, "npm run dev:run"),
							" or ",
							(0, o.kt)("inlineCode", { parentName: "li" }, "yarn dev:run")
						),
						(0, o.kt)(
							"li",
							{ parentName: "ol" },
							"If uploading changes to Github",
							(0, o.kt)(
								"ul",
								{ parentName: "li" },
								(0, o.kt)(
									"li",
									{ parentName: "ul" },
									"Delete ",
									(0, o.kt)(
										"inlineCode",
										{ parentName: "li" },
										"./context.json"
									),
									", ",
									(0, o.kt)("inlineCode", { parentName: "li" }, "./config"),
									", ",
									(0, o.kt)("inlineCode", { parentName: "li" }, "./lib"),
									", ",
									(0, o.kt)("inlineCode", { parentName: "li" }, "./dist"),
									"."
								),
								(0, o.kt)(
									"li",
									{ parentName: "ul" },
									"Run ",
									(0, o.kt)("inlineCode", { parentName: "li" }, "yarn dev:all"),
									"."
								),
								(0, o.kt)("li", { parentName: "ul" }, "Commit & push.")
							)
						)
					),
					(0, o.kt)("h2", { id: "running-locally" }, "Running locally"),
					(0, o.kt)(
						"ol",
						{ start: 3 },
						(0, o.kt)(
							"li",
							{ parentName: "ol" },
							"Fork & Clone this repository"
						),
						(0, o.kt)(
							"li",
							{ parentName: "ol" },
							"Run ",
							(0, o.kt)("inlineCode", { parentName: "li" }, "yarn install"),
							" or ",
							(0, o.kt)("inlineCode", { parentName: "li" }, "npm install")
						),
						(0, o.kt)(
							"li",
							{ parentName: "ol" },
							"From the action logs find ",
							(0, o.kt)(
								"inlineCode",
								{ parentName: "li" },
								"Context for local running"
							),
							" copy the output into a file named ",
							(0, o.kt)("inlineCode", { parentName: "li" }, "./context.json"),
							" at the root of the project."
						),
						(0, o.kt)(
							"li",
							{ parentName: "ol" },
							"Modify the ",
							(0, o.kt)(
								"inlineCode",
								{ parentName: "li" },
								"./config.sample.json"
							),
							" to contain your ",
							(0, o.kt)("inlineCode", { parentName: "li" }, "GITHUB_TOKEN"),
							" and rename to ",
							(0, o.kt)("inlineCode", { parentName: "li" }, "./config.json")
						),
						(0, o.kt)(
							"li",
							{ parentName: "ol" },
							"Run the script using ",
							(0, o.kt)("inlineCode", { parentName: "li" }, "yarn dev:run"),
							" or ",
							(0, o.kt)("inlineCode", { parentName: "li" }, "npm run dev:run")
						)
					)
				)
			}
			d.isMDXComponent = !0
		}
	}
])
