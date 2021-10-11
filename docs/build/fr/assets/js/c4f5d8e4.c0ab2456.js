/** @format */

"use strict"
;(self.webpackChunkaction_masterminds =
	self.webpackChunkaction_masterminds || []).push([
	[4195],
	{
		6252: function (e, t, a) {
			a.r(t),
				a.d(t, {
					default: function () {
						return g
					}
				})
			var n = a(7462),
				r = a(7294),
				l = a(6010),
				s = a(261),
				u = a(6742),
				c = a(2263),
				o = a(4996),
				i = {
					heroBanner: "heroBanner_3P7f",
					buttons: "buttons_1r9m",
					hero: "hero_2alu",
					section: "section_1DfF",
					features: "features_3azU",
					featureImage: "featureImage_ZtzX"
				},
				m = [
					{
						title: "Easy to Use",
						imageUrl: "img/undraw_docusaurus_mountain.svg",
						description: r.createElement(
							r.Fragment,
							null,
							"Docusaurus was designed from the ground up to be easily installed and used to get your website up and running quickly."
						)
					},
					{
						title: "Focus on What Matters",
						imageUrl: "img/undraw_docusaurus_tree.svg",
						description: r.createElement(
							r.Fragment,
							null,
							"Docusaurus lets you focus on your docs, and we'll do the chores. Go ahead and move your docs into the ",
							r.createElement("code", null, "docs"),
							" directory."
						)
					},
					{
						title: "Powered by React",
						imageUrl: "img/undraw_docusaurus_react.svg",
						description: r.createElement(
							r.Fragment,
							null,
							"Extend or customize your website layout by reusing React. Docusaurus can be extended while reusing the same header and footer."
						)
					}
				]
			function d(e) {
				var t = e.imageUrl,
					a = e.title,
					n = e.description,
					s = (0, o.Z)(t)
				return r.createElement(
					"div",
					{ className: (0, l.Z)("col col--4", i.feature) },
					s &&
						r.createElement(
							"div",
							{ className: "text--center" },
							r.createElement("img", {
								className: i.featureImage,
								src: s,
								alt: a
							})
						),
					r.createElement("h3", null, a),
					r.createElement("p", null, n)
				)
			}
			function g() {
				var e = (0, c.Z)().siteConfig,
					t = void 0 === e ? {} : e
				return r.createElement(
					s.Z,
					{
						title: "Hello from " + t.title,
						description: "Description will go into a meta tag in <head />"
					},
					r.createElement(
						"div",
						{ className: i.hero },
						r.createElement(
							"header",
							null,
							r.createElement("h1", null, t.title),
							r.createElement("p", null, t.tagline),
							r.createElement(
								"div",
								{ className: i.buttons },
								r.createElement(
									u.Z,
									{ to: (0, o.Z)("docs/getting-started") },
									"Get Started"
								)
							)
						),
						r.createElement(
							"main",
							null,
							m &&
								m.length > 0 &&
								r.createElement(
									"section",
									{ className: i.section },
									r.createElement(
										"div",
										{ className: i.features },
										m.map(function (e, t) {
											return r.createElement(d, (0, n.Z)({ key: t }, e))
										})
									)
								)
						)
					)
				)
			}
		}
	}
])
