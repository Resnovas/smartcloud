/** @format */

"use strict"
;(self.webpackChunkaction_masterminds =
	self.webpackChunkaction_masterminds || []).push([
	[8587],
	{
		3905: function (e, t, r) {
			r.d(t, {
				Zo: function () {
					return c
				},
				kt: function () {
					return g
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
			var u = n.createContext({}),
				l = function (e) {
					var t = n.useContext(u),
						r = t
					return e && (r = "function" == typeof e ? e(t) : a(a({}, t), e)), r
				},
				c = function (e) {
					var t = l(e.components)
					return n.createElement(u.Provider, { value: t }, e.children)
				},
				p = {
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
						u = e.parentName,
						c = s(e, ["components", "mdxType", "originalType", "parentName"]),
						d = l(r),
						g = i,
						f = d["".concat(u, ".").concat(g)] || d[g] || p[g] || o
					return r
						? n.createElement(f, a(a({ ref: t }, c), {}, { components: r }))
						: n.createElement(f, a({ ref: t }, c))
				})
			function g(e, t) {
				var r = arguments,
					i = t && t.mdxType
				if ("string" == typeof e || i) {
					var o = r.length,
						a = new Array(o)
					a[0] = d
					var s = {}
					for (var u in t) hasOwnProperty.call(t, u) && (s[u] = t[u])
					;(s.originalType = e),
						(s.mdxType = "string" == typeof e ? e : i),
						(a[1] = s)
					for (var l = 2; l < o; l++) a[l] = r[l]
					return n.createElement.apply(null, a)
				}
				return n.createElement.apply(null, r)
			}
			d.displayName = "MDXCreateElement"
		},
		9862: function (e, t, r) {
			r.r(t),
				r.d(t, {
					frontMatter: function () {
						return s
					},
					contentTitle: function () {
						return u
					},
					metadata: function () {
						return l
					},
					toc: function () {
						return c
					},
					default: function () {
						return d
					}
				})
			var n = r(7462),
				i = r(3366),
				o = (r(7294), r(3905)),
				a = ["components"],
				s = { sidebar_position: 3 },
				u = "Your First Contribution",
				l = {
					unversionedId:
						"getting-started/contributing/Start Contributing/first",
					id: "getting-started/contributing/Start Contributing/first",
					isDocsHomePage: !1,
					title: "Your First Contribution",
					description:
						"Unsure where to begin contributing? You can start by looking through these beginner and help-wanted issues:",
					source:
						"@site/docs/getting-started/contributing/Start Contributing/first.md",
					sourceDirName: "getting-started/contributing/Start Contributing",
					slug: "/getting-started/contributing/Start Contributing/first",
					permalink:
						"/action-masterminds/es/docs/getting-started/contributing/Start Contributing/first",
					editUrl:
						"https://github.com/videndum/action-masterminds/edit/develop/docs/docs/getting-started/contributing/Start Contributing/first.md",
					version: "current",
					sidebarPosition: 3,
					frontMatter: { sidebar_position: 3 },
					sidebar: "getting",
					previous: {
						title: "Contribution Types",
						permalink:
							"/action-masterminds/es/docs/getting-started/contributing/Start Contributing/types"
					},
					next: {
						title: "Understanding Labels",
						permalink:
							"/action-masterminds/es/docs/getting-started/contributing/Start Contributing/labels"
					}
				},
				c = [
					{
						value: "Titling your request",
						id: "titling-your-request",
						children: []
					},
					{ value: "Prefixes", id: "prefixes", children: [] }
				],
				p = { toc: c }
			function d(e) {
				var t = e.components,
					r = (0, i.Z)(e, a)
				return (0, o.kt)(
					"wrapper",
					(0, n.Z)({}, p, r, { components: t, mdxType: "MDXLayout" }),
					(0, o.kt)(
						"h1",
						{ id: "your-first-contribution" },
						"Your First Contribution"
					),
					(0, o.kt)(
						"p",
						null,
						"Unsure where to begin contributing? You can start by looking through these beginner and help-wanted issues:"
					),
					(0, o.kt)(
						"ul",
						null,
						(0, o.kt)(
							"li",
							{ parentName: "ul" },
							"First Timers - issues specific for first time github users, designed and created to guide you through contributing."
						),
						(0, o.kt)(
							"li",
							{ parentName: "ul" },
							"Beginner issues - issues which should only require a few lines of code, and a test or two."
						),
						(0, o.kt)(
							"li",
							{ parentName: "ul" },
							"Help wanted - issues which should be a bit more involved than beginner issues."
						)
					),
					(0, o.kt)("h1", { id: "your-first-project" }, "Your first project"),
					(0, o.kt)(
						"p",
						null,
						"Working on your first Pull Request? You can learn how from this ",
						(0, o.kt)("em", { parentName: "p" }, "free"),
						" series, ",
						(0, o.kt)(
							"a",
							{
								parentName: "p",
								href:
									"https://egghead.io/series/how-to-contribute-to-an-open-source-project-on-github"
							},
							"How to Contribute to an Open Source Project on GitHub"
						)
					),
					(0, o.kt)(
						"p",
						null,
						"At this point, you're ready to make your changes! Feel free to ask for help; everyone is a beginner at first!"
					),
					(0, o.kt)(
						"p",
						null,
						"If a maintainer asks you to \"rebase\" your PR, they're saying that a lot of code has changed, and that you need to update your branch so it's easier to merge. Note that we do provide an automatic command for this which can be attempted through commenting ",
						(0, o.kt)("inlineCode", { parentName: "p" }, "/rebase"),
						"."
					),
					(0, o.kt)(
						"h1",
						{ id: "creating-a-merge-request" },
						"Creating a merge request"
					),
					(0, o.kt)(
						"p",
						null,
						"When you believe you have completed your contribution, you will need to make an pull request. This should be simple for most users, and we have provided some templates for you to get started, however if you choose to create your pull request from scratch, please ensure the following steps are followed."
					),
					(0, o.kt)(
						"h2",
						{ id: "titling-your-request" },
						"Titling your request"
					),
					(0, o.kt)(
						"p",
						null,
						"We use ",
						(0, o.kt)(
							"a",
							{
								parentName: "p",
								href: "https://www.conventionalcommits.org/en/v1.0.0/"
							},
							"conventional commits"
						),
						" format when creating pull requests, this is so we can squash all pull requests when merging and automatically create our changelog and releases. To ensure that this convention is completed, our automation will fail if the title does not follow this standard."
					),
					(0, o.kt)("h2", { id: "prefixes" }, "Prefixes"),
					(0, o.kt)(
						"p",
						null,
						"If you are still working on your pull request, please ensure that you prefix it with ",
						(0, o.kt)("inlineCode", { parentName: "p" }, "WIP:"),
						" to ensure that the pull isn't accidently merged before it's ready."
					)
				)
			}
			d.isMDXComponent = !0
		}
	}
])
