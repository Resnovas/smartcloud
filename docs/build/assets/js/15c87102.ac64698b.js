/** @format */

"use strict"
;(self.webpackChunkaction_masterminds =
	self.webpackChunkaction_masterminds || []).push([
	[5239],
	{
		3905: function (e, t, n) {
			n.d(t, {
				Zo: function () {
					return u
				},
				kt: function () {
					return m
				}
			})
			var r = n(7294)
			function i(e, t, n) {
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
			function o(e, t) {
				var n = Object.keys(e)
				if (Object.getOwnPropertySymbols) {
					var r = Object.getOwnPropertySymbols(e)
					t &&
						(r = r.filter(function (t) {
							return Object.getOwnPropertyDescriptor(e, t).enumerable
						})),
						n.push.apply(n, r)
				}
				return n
			}
			function a(e) {
				for (var t = 1; t < arguments.length; t++) {
					var n = null != arguments[t] ? arguments[t] : {}
					t % 2
						? o(Object(n), !0).forEach(function (t) {
								i(e, t, n[t])
						  })
						: Object.getOwnPropertyDescriptors
						? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
						: o(Object(n)).forEach(function (t) {
								Object.defineProperty(
									e,
									t,
									Object.getOwnPropertyDescriptor(n, t)
								)
						  })
				}
				return e
			}
			function c(e, t) {
				if (null == e) return {}
				var n,
					r,
					i = (function (e, t) {
						if (null == e) return {}
						var n,
							r,
							i = {},
							o = Object.keys(e)
						for (r = 0; r < o.length; r++)
							(n = o[r]), t.indexOf(n) >= 0 || (i[n] = e[n])
						return i
					})(e, t)
				if (Object.getOwnPropertySymbols) {
					var o = Object.getOwnPropertySymbols(e)
					for (r = 0; r < o.length; r++)
						(n = o[r]),
							t.indexOf(n) >= 0 ||
								(Object.prototype.propertyIsEnumerable.call(e, n) &&
									(i[n] = e[n]))
				}
				return i
			}
			var s = r.createContext({}),
				l = function (e) {
					var t = r.useContext(s),
						n = t
					return e && (n = "function" == typeof e ? e(t) : a(a({}, t), e)), n
				},
				u = function (e) {
					var t = l(e.components)
					return r.createElement(s.Provider, { value: t }, e.children)
				},
				p = {
					inlineCode: "code",
					wrapper: function (e) {
						var t = e.children
						return r.createElement(r.Fragment, {}, t)
					}
				},
				d = r.forwardRef(function (e, t) {
					var n = e.components,
						i = e.mdxType,
						o = e.originalType,
						s = e.parentName,
						u = c(e, ["components", "mdxType", "originalType", "parentName"]),
						d = l(n),
						m = i,
						f = d["".concat(s, ".").concat(m)] || d[m] || p[m] || o
					return n
						? r.createElement(f, a(a({ ref: t }, u), {}, { components: n }))
						: r.createElement(f, a({ ref: t }, u))
				})
			function m(e, t) {
				var n = arguments,
					i = t && t.mdxType
				if ("string" == typeof e || i) {
					var o = n.length,
						a = new Array(o)
					a[0] = d
					var c = {}
					for (var s in t) hasOwnProperty.call(t, s) && (c[s] = t[s])
					;(c.originalType = e),
						(c.mdxType = "string" == typeof e ? e : i),
						(a[1] = c)
					for (var l = 2; l < o; l++) a[l] = n[l]
					return r.createElement.apply(null, a)
				}
				return r.createElement.apply(null, n)
			}
			d.displayName = "MDXCreateElement"
		},
		4637: function (e, t, n) {
			n.r(t),
				n.d(t, {
					frontMatter: function () {
						return c
					},
					contentTitle: function () {
						return s
					},
					metadata: function () {
						return l
					},
					toc: function () {
						return u
					},
					default: function () {
						return d
					}
				})
			var r = n(7462),
				i = n(3366),
				o = (n(7294), n(3905)),
				a = ["components"],
				c = {
					title: "Code of Conduct",
					sidebar_label: "Code of Conduct",
					sidebar_position: 1
				},
				s = void 0,
				l = {
					unversionedId: "getting-started/contributing/CODE_OF_CONDUCT",
					id: "getting-started/contributing/CODE_OF_CONDUCT",
					isDocsHomePage: !1,
					title: "Code of Conduct",
					description: "Our Pledge",
					source: "@site/docs/getting-started/contributing/CODE_OF_CONDUCT.md",
					sourceDirName: "getting-started/contributing",
					slug: "/getting-started/contributing/CODE_OF_CONDUCT",
					permalink:
						"/action-masterminds/docs/getting-started/contributing/CODE_OF_CONDUCT",
					editUrl:
						"https://github.com/videndum/action-masterminds/edit/develop/docs/docs/getting-started/contributing/CODE_OF_CONDUCT.md",
					version: "current",
					sidebarPosition: 1,
					frontMatter: {
						title: "Code of Conduct",
						sidebar_label: "Code of Conduct",
						sidebar_position: 1
					},
					sidebar: "getting",
					previous: {
						title: "Using Regex",
						permalink: "/action-masterminds/docs/getting-started/features/regex"
					},
					next: {
						title: "Signing Git with GPG using Keybase",
						permalink:
							"/action-masterminds/docs/getting-started/contributing/gpgkey"
					}
				},
				u = [
					{ value: "Our Pledge", id: "our-pledge", children: [] },
					{ value: "Our Standards", id: "our-standards", children: [] },
					{
						value: "Our Responsibilities",
						id: "our-responsibilities",
						children: []
					},
					{ value: "Scope", id: "scope", children: [] },
					{ value: "Enforcement", id: "enforcement", children: [] },
					{ value: "Attribution", id: "attribution", children: [] }
				],
				p = { toc: u }
			function d(e) {
				var t = e.components,
					n = (0, i.Z)(e, a)
				return (0, o.kt)(
					"wrapper",
					(0, r.Z)({}, p, n, { components: t, mdxType: "MDXLayout" }),
					(0, o.kt)("h2", { id: "our-pledge" }, "Our Pledge"),
					(0, o.kt)(
						"p",
						null,
						"In the interest of fostering an open and welcoming environment, we as\ncontributors and maintainers pledge to making participation in our project and\nour community a harassment-free experience for everyone, regardless of age, body\nsize, disability, ethnicity, sex characteristics, gender identity and expression,\nlevel of experience, education, socio-economic status, nationality, personal\nappearance, race, religion, or sexual identity and orientation."
					),
					(0, o.kt)("h2", { id: "our-standards" }, "Our Standards"),
					(0, o.kt)(
						"p",
						null,
						"Examples of behaviour that contributes to creating a positive environment\ninclude:"
					),
					(0, o.kt)(
						"ul",
						null,
						(0, o.kt)(
							"li",
							{ parentName: "ul" },
							"Using welcoming and inclusive language"
						),
						(0, o.kt)(
							"li",
							{ parentName: "ul" },
							"Being respectful of differing viewpoints and experiences"
						),
						(0, o.kt)(
							"li",
							{ parentName: "ul" },
							"Gracefully accepting constructive criticism"
						),
						(0, o.kt)(
							"li",
							{ parentName: "ul" },
							"Focusing on what is best for the community"
						),
						(0, o.kt)(
							"li",
							{ parentName: "ul" },
							"Showing empathy towards other community members"
						)
					),
					(0, o.kt)(
						"p",
						null,
						"Examples of unacceptable behaviour by participants include:"
					),
					(0, o.kt)(
						"ul",
						null,
						(0, o.kt)(
							"li",
							{ parentName: "ul" },
							"The use of sexualized language or imagery and unwelcome sexual attention or\nadvances"
						),
						(0, o.kt)(
							"li",
							{ parentName: "ul" },
							"Trolling, insulting/derogatory comments, and personal or political attacks"
						),
						(0, o.kt)(
							"li",
							{ parentName: "ul" },
							"Public or private harassment"
						),
						(0, o.kt)(
							"li",
							{ parentName: "ul" },
							"Publishing others' private information, such as a physical or electronic\naddress, without explicit permission"
						),
						(0, o.kt)(
							"li",
							{ parentName: "ul" },
							"Other conduct which could reasonably be considered inappropriate in a\nprofessional setting"
						)
					),
					(0, o.kt)(
						"h2",
						{ id: "our-responsibilities" },
						"Our Responsibilities"
					),
					(0, o.kt)(
						"p",
						null,
						"Project maintainers are responsible for clarifying the standards of acceptable\nbehaviour and are expected to take appropriate and fair corrective action in\nresponse to any instances of unacceptable behaviour."
					),
					(0, o.kt)(
						"p",
						null,
						"Project maintainers have the right and responsibility to remove, edit, or\nreject comments, commits, code, wiki edits, issues, and other contributions\nthat are not aligned to this Code of Conduct, or to ban temporarily or\npermanently any contributor for other behaviours that they deem inappropriate,\nthreatening, offensive, or harmful."
					),
					(0, o.kt)("h2", { id: "scope" }, "Scope"),
					(0, o.kt)(
						"p",
						null,
						"This Code of Conduct applies both within project spaces and in public spaces\nwhen an individual is representing the project or its community. Examples of\nrepresenting a project or community include using an official project e-mail\naddress, posting via an official social media account, or acting as an appointed\nrepresentative at an online or offline event. Representation of a project may be\nfurther defined and clarified by project maintainers."
					),
					(0, o.kt)("h2", { id: "enforcement" }, "Enforcement"),
					(0, o.kt)(
						"p",
						null,
						"Instances of abusive, harassing, or otherwise unacceptable behaviour may be\nreported by contacting the project team at ",
						(0, o.kt)(
							"a",
							{ parentName: "p", href: "mailto:hello@smartcloud.gg." },
							"hello@smartcloud.gg."
						),
						" All\ncomplaints will be reviewed and investigated and will result in a response that\nis deemed necessary and appropriate to the circumstances. The project team is\nobligated to maintain confidentiality with regard to the reporter of an incident.\nFurther details of specific enforcement policies may be posted separately."
					),
					(0, o.kt)(
						"p",
						null,
						"Project maintainers who do not follow or enforce the Code of Conduct in good\nfaith may face temporary or permanent repercussions as determined by other\nmembers of the project's leadership."
					),
					(0, o.kt)("h2", { id: "attribution" }, "Attribution"),
					(0, o.kt)(
						"p",
						null,
						"This Code of Conduct is adapted from the ",
						(0, o.kt)(
							"a",
							{ parentName: "p", href: "https://www.contributor-covenant.org" },
							"Contributor Covenant"
						),
						", version 1.4,\navailable at ",
						(0, o.kt)(
							"a",
							{
								parentName: "p",
								href:
									"https://www.contributor-covenant.org/version/1/4/code-of-conduct.html"
							},
							"https://www.contributor-covenant.org/version/1/4/code-of-conduct.html"
						)
					),
					(0, o.kt)(
						"p",
						null,
						"For answers to common questions about this code of conduct, see\n",
						(0, o.kt)(
							"a",
							{
								parentName: "p",
								href: "https://www.contributor-covenant.org/faq"
							},
							"https://www.contributor-covenant.org/faq"
						)
					)
				)
			}
			d.isMDXComponent = !0
		}
	}
])
