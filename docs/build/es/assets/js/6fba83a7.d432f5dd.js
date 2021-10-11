/** @format */

"use strict"
;(self.webpackChunkaction_masterminds =
	self.webpackChunkaction_masterminds || []).push([
	[1782],
	{
		3905: function (e, t, n) {
			n.d(t, {
				Zo: function () {
					return u
				},
				kt: function () {
					return c
				}
			})
			var i = n(7294)
			function a(e, t, n) {
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
			function r(e, t) {
				var n = Object.keys(e)
				if (Object.getOwnPropertySymbols) {
					var i = Object.getOwnPropertySymbols(e)
					t &&
						(i = i.filter(function (t) {
							return Object.getOwnPropertyDescriptor(e, t).enumerable
						})),
						n.push.apply(n, i)
				}
				return n
			}
			function l(e) {
				for (var t = 1; t < arguments.length; t++) {
					var n = null != arguments[t] ? arguments[t] : {}
					t % 2
						? r(Object(n), !0).forEach(function (t) {
								a(e, t, n[t])
						  })
						: Object.getOwnPropertyDescriptors
						? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
						: r(Object(n)).forEach(function (t) {
								Object.defineProperty(
									e,
									t,
									Object.getOwnPropertyDescriptor(n, t)
								)
						  })
				}
				return e
			}
			function o(e, t) {
				if (null == e) return {}
				var n,
					i,
					a = (function (e, t) {
						if (null == e) return {}
						var n,
							i,
							a = {},
							r = Object.keys(e)
						for (i = 0; i < r.length; i++)
							(n = r[i]), t.indexOf(n) >= 0 || (a[n] = e[n])
						return a
					})(e, t)
				if (Object.getOwnPropertySymbols) {
					var r = Object.getOwnPropertySymbols(e)
					for (i = 0; i < r.length; i++)
						(n = r[i]),
							t.indexOf(n) >= 0 ||
								(Object.prototype.propertyIsEnumerable.call(e, n) &&
									(a[n] = e[n]))
				}
				return a
			}
			var s = i.createContext({}),
				p = function (e) {
					var t = i.useContext(s),
						n = t
					return e && (n = "function" == typeof e ? e(t) : l(l({}, t), e)), n
				},
				u = function (e) {
					var t = p(e.components)
					return i.createElement(s.Provider, { value: t }, e.children)
				},
				m = {
					inlineCode: "code",
					wrapper: function (e) {
						var t = e.children
						return i.createElement(i.Fragment, {}, t)
					}
				},
				d = i.forwardRef(function (e, t) {
					var n = e.components,
						a = e.mdxType,
						r = e.originalType,
						s = e.parentName,
						u = o(e, ["components", "mdxType", "originalType", "parentName"]),
						d = p(n),
						c = a,
						k = d["".concat(s, ".").concat(c)] || d[c] || m[c] || r
					return n
						? i.createElement(k, l(l({ ref: t }, u), {}, { components: n }))
						: i.createElement(k, l({ ref: t }, u))
				})
			function c(e, t) {
				var n = arguments,
					a = t && t.mdxType
				if ("string" == typeof e || a) {
					var r = n.length,
						l = new Array(r)
					l[0] = d
					var o = {}
					for (var s in t) hasOwnProperty.call(t, s) && (o[s] = t[s])
					;(o.originalType = e),
						(o.mdxType = "string" == typeof e ? e : a),
						(l[1] = o)
					for (var p = 2; p < r; p++) l[p] = n[p]
					return i.createElement.apply(null, l)
				}
				return i.createElement.apply(null, n)
			}
			d.displayName = "MDXCreateElement"
		},
		1852: function (e, t, n) {
			n.r(t),
				n.d(t, {
					frontMatter: function () {
						return o
					},
					contentTitle: function () {
						return s
					},
					metadata: function () {
						return p
					},
					toc: function () {
						return u
					},
					default: function () {
						return d
					}
				})
			var i = n(7462),
				a = n(3366),
				r = (n(7294), n(3905)),
				l = ["components"],
				o = { sidebar_position: 3 },
				s = "Understanding Labels",
				p = {
					unversionedId:
						"getting-started/contributing/Start Contributing/labels",
					id: "getting-started/contributing/Start Contributing/labels",
					isDocsHomePage: !1,
					title: "Understanding Labels",
					description: "- Statuses",
					source:
						"@site/docs/getting-started/contributing/Start Contributing/labels.md",
					sourceDirName: "getting-started/contributing/Start Contributing",
					slug: "/getting-started/contributing/Start Contributing/labels",
					permalink:
						"/action-masterminds/es/docs/getting-started/contributing/Start Contributing/labels",
					editUrl:
						"https://github.com/videndum/action-masterminds/edit/develop/docs/docs/getting-started/contributing/Start Contributing/labels.md",
					version: "current",
					sidebarPosition: 3,
					frontMatter: { sidebar_position: 3 },
					sidebar: "getting",
					previous: {
						title: "Your First Contribution",
						permalink:
							"/action-masterminds/es/docs/getting-started/contributing/Start Contributing/first"
					},
					next: {
						title:
							"Support \ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc67\u200d\ud83d\udc66",
						permalink: "/action-masterminds/es/docs/getting-started/support"
					}
				},
				u = [],
				m = { toc: u }
			function d(e) {
				var t = e.components,
					n = (0, a.Z)(e, l)
				return (0, r.kt)(
					"wrapper",
					(0, i.Z)({}, m, n, { components: t, mdxType: "MDXLayout" }),
					(0, r.kt)(
						"h1",
						{ id: "understanding-labels" },
						"Understanding Labels"
					),
					(0, r.kt)(
						"ul",
						null,
						(0, r.kt)(
							"li",
							{ parentName: "ul" },
							(0, r.kt)(
								"p",
								{ parentName: "li" },
								(0, r.kt)("strong", { parentName: "p" }, "Statuses")
							),
							(0, r.kt)(
								"ul",
								{ parentName: "li" },
								(0, r.kt)(
									"li",
									{ parentName: "ul" },
									(0, r.kt)("inlineCode", { parentName: "li" }, "Abandoned"),
									" - This issue / pull request has been abandon"
								),
								(0, r.kt)(
									"li",
									{ parentName: "ul" },
									(0, r.kt)("inlineCode", { parentName: "li" }, "Available"),
									" - This issue is available for either Developers or Community contributors to develop"
								),
								(0, r.kt)(
									"li",
									{ parentName: "ul" },
									(0, r.kt)("inlineCode", { parentName: "li" }, "Blocked"),
									" - Another issue is blocking the development of this issue"
								),
								(0, r.kt)(
									"li",
									{ parentName: "ul" },
									(0, r.kt)("inlineCode", { parentName: "li" }, "Completed"),
									" - Development has finished and been merged for this issue"
								),
								(0, r.kt)(
									"li",
									{ parentName: "ul" },
									(0, r.kt)("inlineCode", { parentName: "li" }, "In Progress"),
									" - Development is underway for this issue"
								),
								(0, r.kt)(
									"li",
									{ parentName: "ul" },
									(0, r.kt)("inlineCode", { parentName: "li" }, "On Hold"),
									" - The developers have decided to hold the development of this request"
								),
								(0, r.kt)(
									"li",
									{ parentName: "ul" },
									(0, r.kt)("inlineCode", { parentName: "li" }, "Pending"),
									" - The developers have approved development of this request."
								),
								(0, r.kt)(
									"li",
									{ parentName: "ul" },
									(0, r.kt)(
										"inlineCode",
										{ parentName: "li" },
										"Review Needed"
									),
									" - This pull request is waiting on review"
								),
								(0, r.kt)(
									"li",
									{ parentName: "ul" },
									(0, r.kt)(
										"inlineCode",
										{ parentName: "li" },
										"Revision Needed"
									),
									" - This pull request has been reviewed and requires revision"
								),
								(0, r.kt)(
									"li",
									{ parentName: "ul" },
									(0, r.kt)(
										"inlineCode",
										{ parentName: "li" },
										"Do not develop"
									),
									" - This wont be worked on by DevOPS or Community contributor"
								),
								(0, r.kt)(
									"li",
									{ parentName: "ul" },
									(0, r.kt)("inlineCode", { parentName: "li" }, "Stale"),
									" - This issue has been automatically marked as stale because it has not had recent activite"
								)
							)
						),
						(0, r.kt)(
							"li",
							{ parentName: "ul" },
							(0, r.kt)(
								"p",
								{ parentName: "li" },
								(0, r.kt)("strong", { parentName: "p" }, "Types")
							),
							(0, r.kt)(
								"ul",
								{ parentName: "li" },
								(0, r.kt)(
									"li",
									{ parentName: "ul" },
									(0, r.kt)("inlineCode", { parentName: "li" }, "Chore"),
									" - Changes to the build process or auxiliary tools and libraries such as documentation generation"
								),
								(0, r.kt)(
									"li",
									{ parentName: "ul" },
									(0, r.kt)("inlineCode", { parentName: "li" }, "Bug"),
									" - A possible bug"
								),
								(0, r.kt)(
									"li",
									{ parentName: "ul" },
									(0, r.kt)("inlineCode", { parentName: "li" }, "Maintenance"),
									" - Changes to maintain the project"
								),
								(0, r.kt)(
									"li",
									{ parentName: "ul" },
									(0, r.kt)("inlineCode", { parentName: "li" }, "Discussion"),
									" - A conversation about something"
								),
								(0, r.kt)(
									"li",
									{ parentName: "ul" },
									(0, r.kt)(
										"inlineCode",
										{ parentName: "li" },
										"Documentation"
									),
									" - Changes to the documentation"
								),
								(0, r.kt)(
									"li",
									{ parentName: "ul" },
									(0, r.kt)("inlineCode", { parentName: "li" }, "Feature"),
									" - A new feature"
								),
								(0, r.kt)(
									"li",
									{ parentName: "ul" },
									(0, r.kt)("inlineCode", { parentName: "li" }, "Enhancement"),
									" - Improving a feature"
								),
								(0, r.kt)(
									"li",
									{ parentName: "ul" },
									(0, r.kt)("inlineCode", { parentName: "li" }, "Question"),
									" - Question about this project"
								),
								(0, r.kt)(
									"li",
									{ parentName: "ul" },
									(0, r.kt)("inlineCode", { parentName: "li" }, "Fix"),
									" - A bug fix"
								),
								(0, r.kt)(
									"li",
									{ parentName: "ul" },
									(0, r.kt)("inlineCode", { parentName: "li" }, "Optimisation"),
									" - A code change that improves performance"
								),
								(0, r.kt)(
									"li",
									{ parentName: "ul" },
									(0, r.kt)("inlineCode", { parentName: "li" }, "Refactor"),
									" - A code change that neither fixes a bug nor adds a feature"
								),
								(0, r.kt)(
									"li",
									{ parentName: "ul" },
									(0, r.kt)("inlineCode", { parentName: "li" }, "Revert"),
									" - Removes & Discards a previous change as error"
								),
								(0, r.kt)(
									"li",
									{ parentName: "ul" },
									(0, r.kt)("inlineCode", { parentName: "li" }, "Decrecated"),
									" - Removes previous functionality which is no longer needed"
								),
								(0, r.kt)(
									"li",
									{ parentName: "ul" },
									(0, r.kt)("inlineCode", { parentName: "li" }, "Removal"),
									" - Removes previous functionality which is no longer needed"
								),
								(0, r.kt)(
									"li",
									{ parentName: "ul" },
									(0, r.kt)("inlineCode", { parentName: "li" }, "Style"),
									" - Changes that do not affect the meaning of the code (white-space formatting missing semi-colons etc)"
								)
							)
						),
						(0, r.kt)(
							"li",
							{ parentName: "ul" },
							(0, r.kt)(
								"p",
								{ parentName: "li" },
								(0, r.kt)("strong", { parentName: "p" }, "DevOps")
							),
							(0, r.kt)(
								"ul",
								{ parentName: "li" },
								(0, r.kt)(
									"li",
									{ parentName: "ul" },
									(0, r.kt)("inlineCode", { parentName: "li" }, "Accepted"),
									" - DevOPS are planning"
								),
								(0, r.kt)(
									"li",
									{ parentName: "ul" },
									(0, r.kt)("inlineCode", { parentName: "li" }, "Completed"),
									" - DevOPS have complete"
								),
								(0, r.kt)(
									"li",
									{ parentName: "ul" },
									(0, r.kt)("inlineCode", { parentName: "li" }, "Deploying"),
									" - DevOPS are deploying to latest"
								),
								(0, r.kt)(
									"li",
									{ parentName: "ul" },
									(0, r.kt)("inlineCode", { parentName: "li" }, "Developing"),
									" - DevOPS are Developing"
								),
								(0, r.kt)(
									"li",
									{ parentName: "ul" },
									(0, r.kt)("inlineCode", { parentName: "li" }, "Rejected"),
									" - DevOPS wont continue"
								),
								(0, r.kt)(
									"li",
									{ parentName: "ul" },
									(0, r.kt)("inlineCode", { parentName: "li" }, "Reviewing"),
									" - DevOPS awaiting review"
								),
								(0, r.kt)(
									"li",
									{ parentName: "ul" },
									(0, r.kt)("inlineCode", { parentName: "li" }, "Staging"),
									" - DevOPS deployed to Staging"
								),
								(0, r.kt)(
									"li",
									{ parentName: "ul" },
									(0, r.kt)("inlineCode", { parentName: "li" }, "Testing"),
									" - DevOPS deployed to Testing"
								)
							)
						),
						(0, r.kt)(
							"li",
							{ parentName: "ul" },
							(0, r.kt)(
								"p",
								{ parentName: "li" },
								(0, r.kt)("strong", { parentName: "p" }, "ComOps")
							),
							(0, r.kt)(
								"ul",
								{ parentName: "li" },
								(0, r.kt)(
									"li",
									{ parentName: "ul" },
									(0, r.kt)("inlineCode", { parentName: "li" }, "Accepted"),
									" - A community contributor is planning to work on this issue"
								),
								(0, r.kt)(
									"li",
									{ parentName: "ul" },
									(0, r.kt)("inlineCode", { parentName: "li" }, "Completed"),
									" - The contributor has completed this issue and handed over to the developers to stage & deploy"
								),
								(0, r.kt)(
									"li",
									{ parentName: "ul" },
									(0, r.kt)("inlineCode", { parentName: "li" }, "Developing"),
									" - The contributor is developing this issue"
								),
								(0, r.kt)(
									"li",
									{ parentName: "ul" },
									(0, r.kt)(
										"inlineCode",
										{ parentName: "li" },
										"Awaiting Review"
									),
									" - The contributor is awaiting review"
								),
								(0, r.kt)(
									"li",
									{ parentName: "ul" },
									(0, r.kt)("inlineCode", { parentName: "li" }, "Testing"),
									" - The contributor is awaiting testing results"
								)
							)
						),
						(0, r.kt)(
							"li",
							{ parentName: "ul" },
							(0, r.kt)(
								"p",
								{ parentName: "li" },
								(0, r.kt)("strong", { parentName: "p" }, "Bugs")
							),
							(0, r.kt)(
								"ul",
								{ parentName: "li" },
								(0, r.kt)(
									"li",
									{ parentName: "ul" },
									(0, r.kt)("inlineCode", { parentName: "li" }, "Low"),
									" - This bug isn't a high priority for the next release"
								),
								(0, r.kt)(
									"li",
									{ parentName: "ul" },
									(0, r.kt)("inlineCode", { parentName: "li" }, "Medium"),
									" - This bug affects more than 10% of users and should be patched before the next major release"
								),
								(0, r.kt)(
									"li",
									{ parentName: "ul" },
									(0, r.kt)("inlineCode", { parentName: "li" }, "High"),
									" - This bug affects more than 25% of users and should be patched before the next minor release"
								),
								(0, r.kt)(
									"li",
									{ parentName: "ul" },
									(0, r.kt)("inlineCode", { parentName: "li" }, "Critical"),
									" - This bug affects more than 50% of users and should be patched before any new features are added"
								),
								(0, r.kt)(
									"li",
									{ parentName: "ul" },
									(0, r.kt)("inlineCode", { parentName: "li" }, "Confirmed"),
									" - This bug has been confirmed"
								),
								(0, r.kt)(
									"li",
									{ parentName: "ul" },
									(0, r.kt)("inlineCode", { parentName: "li" }, "New"),
									" - This bug is new"
								),
								(0, r.kt)(
									"li",
									{ parentName: "ul" },
									(0, r.kt)("inlineCode", { parentName: "li" }, "Fixed"),
									" - This bug has been fixed"
								)
							)
						),
						(0, r.kt)(
							"li",
							{ parentName: "ul" },
							(0, r.kt)(
								"p",
								{ parentName: "li" },
								(0, r.kt)("strong", { parentName: "p" }, "Content types")
							),
							(0, r.kt)(
								"ul",
								{ parentName: "li" },
								(0, r.kt)(
									"li",
									{ parentName: "ul" },
									(0, r.kt)("inlineCode", { parentName: "li" }, "Dependences"),
									" - Changes that affect the dependences"
								),
								(0, r.kt)(
									"li",
									{ parentName: "ul" },
									(0, r.kt)(
										"inlineCode",
										{ parentName: "li" },
										"Workflow & CI"
									),
									" - Changes that affect the workflow & CI"
								),
								(0, r.kt)(
									"li",
									{ parentName: "ul" },
									(0, r.kt)("inlineCode", { parentName: "li" }, "UI / UX"),
									" - Changes that affect the UI / UX"
								),
								(0, r.kt)(
									"li",
									{ parentName: "ul" },
									(0, r.kt)("inlineCode", { parentName: "li" }, "Backend"),
									" - Changes that affect the backend"
								),
								(0, r.kt)(
									"li",
									{ parentName: "ul" },
									(0, r.kt)("inlineCode", { parentName: "li" }, "Frontend"),
									" - Changes that affect the fronted"
								)
							)
						),
						(0, r.kt)(
							"li",
							{ parentName: "ul" },
							(0, r.kt)(
								"p",
								{ parentName: "li" },
								(0, r.kt)("strong", { parentName: "p" }, "Miscellaneous")
							),
							(0, r.kt)(
								"ul",
								{ parentName: "li" },
								(0, r.kt)(
									"li",
									{ parentName: "ul" },
									(0, r.kt)("inlineCode", { parentName: "li" }, "security fix"),
									" - A Security Fix"
								),
								(0, r.kt)(
									"li",
									{ parentName: "ul" },
									(0, r.kt)(
										"inlineCode",
										{ parentName: "li" },
										"security vulnerability"
									),
									" - A Security vulnerability"
								),
								(0, r.kt)(
									"li",
									{ parentName: "ul" },
									(0, r.kt)("inlineCode", { parentName: "li" }, "Duplicate"),
									" - A Duplicate of another issue/pull"
								),
								(0, r.kt)(
									"li",
									{ parentName: "ul" },
									(0, r.kt)("inlineCode", { parentName: "li" }, "Help wanted"),
									" - Help is needed to continue"
								),
								(0, r.kt)(
									"li",
									{ parentName: "ul" },
									(0, r.kt)("inlineCode", { parentName: "li" }, "Needs rebase"),
									" - This request needs to be rebased"
								),
								(0, r.kt)(
									"li",
									{ parentName: "ul" },
									(0, r.kt)(
										"inlineCode",
										{ parentName: "li" },
										"Work in progress"
									),
									" - This pull request is a wip"
								),
								(0, r.kt)(
									"li",
									{ parentName: "ul" },
									(0, r.kt)(
										"inlineCode",
										{ parentName: "li" },
										"Sponsor Request \u2764\ufe0f"
									),
									" - This request has come from a sponsor"
								),
								(0, r.kt)(
									"li",
									{ parentName: "ul" },
									(0, r.kt)(
										"inlineCode",
										{ parentName: "li" },
										"More information needed"
									),
									" - Requires more information before it can continue"
								),
								(0, r.kt)(
									"li",
									{ parentName: "ul" },
									(0, r.kt)("inlineCode", { parentName: "li" }, "First Timers"),
									" - A Good issue for first time github users"
								),
								(0, r.kt)(
									"li",
									{ parentName: "ul" },
									(0, r.kt)(
										"inlineCode",
										{ parentName: "li" },
										"skip-changelog"
									),
									" - Skip the changelog"
								),
								(0, r.kt)(
									"li",
									{ parentName: "ul" },
									(0, r.kt)("inlineCode", { parentName: "li" }, "automerge"),
									" - Automatically Merge this request"
								),
								(0, r.kt)(
									"li",
									{ parentName: "ul" },
									(0, r.kt)(
										"inlineCode",
										{ parentName: "li" },
										"good first issue"
									),
									" - What it says on the tin. This helps new people find stuff to work on, because ",
									(0, r.kt)(
										"a",
										{
											parentName: "li",
											href:
												"https://help.github.com/articles/helping-new-contributors-find-your-project-with-labels/"
										},
										"GitHub actively promotes it"
									),
									" and ",
									(0, r.kt)(
										"a",
										{
											parentName: "li",
											href:
												"https://help.github.com/articles/about-labels/#using-default-labels"
										},
										"initializes new repositories with that label"
									),
									"."
								)
							)
						)
					)
				)
			}
			d.isMDXComponent = !0
		}
	}
])
