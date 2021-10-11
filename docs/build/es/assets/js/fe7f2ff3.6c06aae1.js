/** @format */

"use strict"
;(self.webpackChunkaction_masterminds =
	self.webpackChunkaction_masterminds || []).push([
	[294],
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
			var i = n(7294)
			function r(e, t, n) {
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
			function a(e, t) {
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
			function o(e) {
				for (var t = 1; t < arguments.length; t++) {
					var n = null != arguments[t] ? arguments[t] : {}
					t % 2
						? a(Object(n), !0).forEach(function (t) {
								r(e, t, n[t])
						  })
						: Object.getOwnPropertyDescriptors
						? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
						: a(Object(n)).forEach(function (t) {
								Object.defineProperty(
									e,
									t,
									Object.getOwnPropertyDescriptor(n, t)
								)
						  })
				}
				return e
			}
			function p(e, t) {
				if (null == e) return {}
				var n,
					i,
					r = (function (e, t) {
						if (null == e) return {}
						var n,
							i,
							r = {},
							a = Object.keys(e)
						for (i = 0; i < a.length; i++)
							(n = a[i]), t.indexOf(n) >= 0 || (r[n] = e[n])
						return r
					})(e, t)
				if (Object.getOwnPropertySymbols) {
					var a = Object.getOwnPropertySymbols(e)
					for (i = 0; i < a.length; i++)
						(n = a[i]),
							t.indexOf(n) >= 0 ||
								(Object.prototype.propertyIsEnumerable.call(e, n) &&
									(r[n] = e[n]))
				}
				return r
			}
			var s = i.createContext({}),
				l = function (e) {
					var t = i.useContext(s),
						n = t
					return e && (n = "function" == typeof e ? e(t) : o(o({}, t), e)), n
				},
				u = function (e) {
					var t = l(e.components)
					return i.createElement(s.Provider, { value: t }, e.children)
				},
				g = {
					inlineCode: "code",
					wrapper: function (e) {
						var t = e.children
						return i.createElement(i.Fragment, {}, t)
					}
				},
				c = i.forwardRef(function (e, t) {
					var n = e.components,
						r = e.mdxType,
						a = e.originalType,
						s = e.parentName,
						u = p(e, ["components", "mdxType", "originalType", "parentName"]),
						c = l(n),
						m = r,
						d = c["".concat(s, ".").concat(m)] || c[m] || g[m] || a
					return n
						? i.createElement(d, o(o({ ref: t }, u), {}, { components: n }))
						: i.createElement(d, o({ ref: t }, u))
				})
			function m(e, t) {
				var n = arguments,
					r = t && t.mdxType
				if ("string" == typeof e || r) {
					var a = n.length,
						o = new Array(a)
					o[0] = c
					var p = {}
					for (var s in t) hasOwnProperty.call(t, s) && (p[s] = t[s])
					;(p.originalType = e),
						(p.mdxType = "string" == typeof e ? e : r),
						(o[1] = p)
					for (var l = 2; l < a; l++) o[l] = n[l]
					return i.createElement.apply(null, o)
				}
				return i.createElement.apply(null, n)
			}
			c.displayName = "MDXCreateElement"
		},
		3175: function (e, t, n) {
			n.r(t),
				n.d(t, {
					frontMatter: function () {
						return p
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
						return c
					}
				})
			var i = n(7462),
				r = n(3366),
				a = (n(7294), n(3905)),
				o = ["components"],
				p = { sidebar_position: 3 },
				s = "Signing Git with GPG using Keybase",
				l = {
					unversionedId: "getting-started/contributing/gpgkey",
					id: "getting-started/contributing/gpgkey",
					isDocsHomePage: !1,
					title: "Signing Git with GPG using Keybase",
					description:
						"This tutorial was originally writen by Stephen Rees-Carter",
					source: "@site/docs/getting-started/contributing/gpgkey.md",
					sourceDirName: "getting-started/contributing",
					slug: "/getting-started/contributing/gpgkey",
					permalink:
						"/action-masterminds/es/docs/getting-started/contributing/gpgkey",
					editUrl:
						"https://github.com/videndum/action-masterminds/edit/develop/docs/docs/getting-started/contributing/gpgkey.md",
					version: "current",
					sidebarPosition: 3,
					frontMatter: { sidebar_position: 3 },
					sidebar: "getting",
					previous: {
						title: "Code of Conduct",
						permalink:
							"/action-masterminds/es/docs/getting-started/contributing/CODE_OF_CONDUCT"
					},
					next: {
						title: "Running Locally & Developing",
						permalink:
							"/action-masterminds/es/docs/getting-started/contributing/runningLocally"
					}
				},
				u = [
					{ value: "Prerequisities", id: "prerequisities", children: [] },
					{
						value: "Update the GPG Key",
						id: "update-the-gpg-key",
						children: []
					}
				],
				g = { toc: u }
			function c(e) {
				var t = e.components,
					n = (0, r.Z)(e, o)
				return (0, a.kt)(
					"wrapper",
					(0, i.Z)({}, g, n, { components: t, mdxType: "MDXLayout" }),
					(0, a.kt)(
						"h1",
						{ id: "signing-git-with-gpg-using-keybase" },
						"Signing Git with GPG using Keybase"
					),
					(0, a.kt)(
						"p",
						null,
						"This tutorial was originally writen by ",
						(0, a.kt)(
							"a",
							{
								parentName: "p",
								href:
									"https://stephenreescarter.net/signing-git-commits-with-a-keybase-gpg-key/"
							},
							"Stephen Rees-Carter"
						)
					),
					(0, a.kt)(
						"p",
						null,
						"We suggest using this method of GPG key setup to reduce the amount of keys you need to maintain when working on your devices, however it's not perfect for everyone. This tutorial assumes that you are working from a private machine."
					),
					(0, a.kt)("h2", { id: "prerequisities" }, "Prerequisities"),
					(0, a.kt)(
						"ul",
						null,
						(0, a.kt)(
							"li",
							{ parentName: "ul" },
							(0, a.kt)(
								"a",
								{ parentName: "li", href: "https://keybase.io/inv/8353caa6be" },
								"Keybase"
							),
							" installed"
						),
						(0, a.kt)(
							"li",
							{ parentName: "ul" },
							"GPG Key configured within Keybase"
						),
						(0, a.kt)(
							"li",
							{ parentName: "ul" },
							"GPG installed on your device (",
							(0, a.kt)(
								"a",
								{ parentName: "li", href: "https://www.gpg4win.org/" },
								"Windows"
							),
							" | ",
							(0, a.kt)(
								"a",
								{ parentName: "li", href: "https://gnupg.org/download/" },
								"Linux"
							),
							" | ",
							(0, a.kt)(
								"a",
								{ parentName: "li", href: "https://gpgtools.org/" },
								"macOS"
							),
							")"
						)
					),
					(0, a.kt)("h2", { id: "update-the-gpg-key" }, "Update the GPG Key"),
					(0, a.kt)(
						"ol",
						null,
						(0, a.kt)(
							"li",
							{ parentName: "ol" },
							(0, a.kt)(
								"p",
								{ parentName: "li" },
								"First, export your public and private keys from Keybase using the ",
								(0, a.kt)("inlineCode", { parentName: "p" }, "keybase pgp"),
								" command:"
							),
							(0, a.kt)(
								"pre",
								{ parentName: "li" },
								(0, a.kt)(
									"code",
									{ parentName: "pre", className: "language-shell" },
									"keybase pgp export --outfile keybase-public.key\nkeybase pgp export --secret --outfile keybase-private.key\n"
								)
							),
							(0, a.kt)(
								"p",
								{ parentName: "li" },
								"During the export process, Keybase will ask for your account password and prompt to set a new password for the private key file."
							)
						),
						(0, a.kt)(
							"li",
							{ parentName: "ol" },
							(0, a.kt)(
								"p",
								{ parentName: "li" },
								"Next, you need to import the keys into GPG using the ",
								(0, a.kt)("inlineCode", { parentName: "p" }, "gpg"),
								" command:"
							),
							(0, a.kt)(
								"pre",
								{ parentName: "li" },
								(0, a.kt)(
									"code",
									{ parentName: "pre", className: "language-shell" },
									"gpg --allow-secret-key-import --import keybase-private.key\ngpg --import keybase-public.key\n"
								)
							),
							(0, a.kt)(
								"p",
								{ parentName: "li" },
								"The import process will ask for the password you just assigned to your private key, for obvious reasons."
							)
						),
						(0, a.kt)(
							"li",
							{ parentName: "ol" },
							(0, a.kt)(
								"p",
								{ parentName: "li" },
								"Now that you\u2019ve imported the key into GPG, you need to modify the key to include your email address. This is done by invoking the ",
								(0, a.kt)("inlineCode", { parentName: "p" }, "gpg --edit-key"),
								" command, with a unique identifier for your key. I found using the ",
								(0, a.kt)(
									"inlineCode",
									{ parentName: "p" },
									"<username>@keybase.io"
								),
								" address worked nicely."
							),
							(0, a.kt)(
								"pre",
								{ parentName: "li" },
								(0, a.kt)(
									"code",
									{ parentName: "pre", className: "language-shell" },
									"gpg --edit-key <username>@keybase.io\n"
								)
							),
							(0, a.kt)(
								"p",
								{ parentName: "li" },
								"This command will get you into the ",
								(0, a.kt)("inlineCode", { parentName: "p" }, "gpg>"),
								" prompt, and from there you need to run the ",
								(0, a.kt)("inlineCode", { parentName: "p" }, "adduid"),
								" command. It will prompt for your ",
								(0, a.kt)("inlineCode", { parentName: "p" }, "Real name"),
								" and ",
								(0, a.kt)("inlineCode", { parentName: "p" }, "Email address"),
								" (feel free to leave ",
								(0, a.kt)("inlineCode", { parentName: "p" }, "Comment"),
								" empty). Once you\u2019ve provided your name and email, confirm using the ",
								(0, a.kt)("inlineCode", { parentName: "p" }, "O"),
								" and then ",
								(0, a.kt)("inlineCode", { parentName: "p" }, "save"),
								" to close the ",
								(0, a.kt)("inlineCode", { parentName: "p" }, "gpg>"),
								" prompt."
							)
						),
						(0, a.kt)(
							"li",
							{ parentName: "ol" },
							(0, a.kt)(
								"p",
								{ parentName: "li" },
								"Using ",
								(0, a.kt)(
									"inlineCode",
									{ parentName: "p" },
									"gpg --edit-key <key>"
								),
								" and selecting the ",
								(0, a.kt)("inlineCode", { parentName: "p" }, "trust"),
								" option. I suggest using trust level ",
								(0, a.kt)(
									"inlineCode",
									{ parentName: "p" },
									"5 = I trust ultimately"
								),
								", since it is your own key. After applying the change, use ",
								(0, a.kt)("inlineCode", { parentName: "p" }, "save"),
								" to close the prompt."
							)
						),
						(0, a.kt)(
							"li",
							{ parentName: "ol" },
							(0, a.kt)(
								"p",
								{ parentName: "li" },
								"Once that\u2019s done, you can push your updated key back into Keybase."
							),
							(0, a.kt)(
								"pre",
								{ parentName: "li" },
								(0, a.kt)(
									"code",
									{ parentName: "pre", className: "language-shell" },
									"keybase pgp update\n"
								)
							)
						),
						(0, a.kt)(
							"li",
							{ parentName: "ol" },
							(0, a.kt)(
								"p",
								{ parentName: "li" },
								"Add key to ",
								(0, a.kt)(
									"a",
									{ parentName: "p", href: "https://github.com" },
									"Github"
								),
								" (",
								(0, a.kt)(
									"a",
									{
										parentName: "p",
										href:
											"https://docs.github.com/en/free-pro-team@latest/github/authenticating-to-github/adding-a-new-gpg-key-to-your-github-account"
									},
									"follow this tutorial"
								),
								")"
							)
						),
						(0, a.kt)(
							"li",
							{ parentName: "ol" },
							(0, a.kt)(
								"p",
								{ parentName: "li" },
								"Setup git signing on commits\nUse the ",
								(0, a.kt)(
									"inlineCode",
									{ parentName: "p" },
									"git config user.signingkey"
								),
								" option to specify the Key ID for git to use. You can get this from the GitHub GPG keys page if you\u2019re unsure what it is. You can also require Git to sign all commits with the ",
								(0, a.kt)("inlineCode", { parentName: "p" }, "commit.gpgsign"),
								" option."
							),
							(0, a.kt)(
								"pre",
								{ parentName: "li" },
								(0, a.kt)(
									"code",
									{ parentName: "pre", className: "language-shell" },
									"git config --global user.signingkey <Key ID>\ngit config --global commit.gpgsign true\n"
								)
							)
						)
					)
				)
			}
			c.isMDXComponent = !0
		}
	}
])
