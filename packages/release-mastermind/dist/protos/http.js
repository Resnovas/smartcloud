/** @format */

require("./sourcemap-register.js")
;(() => {
	var __webpack_modules__ = {
		776: (e) => {
			"use strict"
			e.exports = asPromise
			function asPromise(e, t) {
				var r = new Array(arguments.length - 1),
					i = 0,
					n = 2,
					o = true
				while (n < arguments.length) r[i++] = arguments[n++]
				return new Promise(function executor(n, s) {
					r[i] = function callback(e) {
						if (o) {
							o = false
							if (e) s(e)
							else {
								var t = new Array(arguments.length - 1),
									r = 0
								while (r < t.length) t[r++] = arguments[r]
								n.apply(null, t)
							}
						}
					}
					try {
						e.apply(t || null, r)
					} catch (e) {
						if (o) {
							o = false
							s(e)
						}
					}
				})
			}
		},
		869: (e, t) => {
			"use strict"
			var r = t
			r.length = function length(e) {
				var t = e.length
				if (!t) return 0
				var r = 0
				while (--t % 4 > 1 && e.charAt(t) === "=") ++r
				return Math.ceil(e.length * 3) / 4 - r
			}
			var i = new Array(64)
			var n = new Array(123)
			for (var o = 0; o < 64; )
				n[
					(i[o] =
						o < 26 ? o + 65 : o < 52 ? o + 71 : o < 62 ? o - 4 : (o - 59) | 43)
				] = o++
			r.encode = function encode(e, t, r) {
				var n = null,
					o = []
				var s = 0,
					u = 0,
					a
				while (t < r) {
					var l = e[t++]
					switch (u) {
						case 0:
							o[s++] = i[l >> 2]
							a = (l & 3) << 4
							u = 1
							break
						case 1:
							o[s++] = i[a | (l >> 4)]
							a = (l & 15) << 2
							u = 2
							break
						case 2:
							o[s++] = i[a | (l >> 6)]
							o[s++] = i[l & 63]
							u = 0
							break
					}
					if (s > 8191) {
						;(n || (n = [])).push(String.fromCharCode.apply(String, o))
						s = 0
					}
				}
				if (u) {
					o[s++] = i[a]
					o[s++] = 61
					if (u === 1) o[s++] = 61
				}
				if (n) {
					if (s) n.push(String.fromCharCode.apply(String, o.slice(0, s)))
					return n.join("")
				}
				return String.fromCharCode.apply(String, o.slice(0, s))
			}
			var s = "invalid encoding"
			r.decode = function decode(e, t, r) {
				var i = r
				var o = 0,
					u
				for (var a = 0; a < e.length; ) {
					var l = e.charCodeAt(a++)
					if (l === 61 && o > 1) break
					if ((l = n[l]) === undefined) throw Error(s)
					switch (o) {
						case 0:
							u = l
							o = 1
							break
						case 1:
							t[r++] = (u << 2) | ((l & 48) >> 4)
							u = l
							o = 2
							break
						case 2:
							t[r++] = ((u & 15) << 4) | ((l & 60) >> 2)
							u = l
							o = 3
							break
						case 3:
							t[r++] = ((u & 3) << 6) | l
							o = 0
							break
					}
				}
				if (o === 1) throw Error(s)
				return r - i
			}
			r.test = function test(e) {
				return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
					e
				)
			}
		},
		536: (e) => {
			"use strict"
			e.exports = EventEmitter
			function EventEmitter() {
				this._listeners = {}
			}
			EventEmitter.prototype.on = function on(e, t, r) {
				;(this._listeners[e] || (this._listeners[e] = [])).push({
					fn: t,
					ctx: r || this
				})
				return this
			}
			EventEmitter.prototype.off = function off(e, t) {
				if (e === undefined) this._listeners = {}
				else {
					if (t === undefined) this._listeners[e] = []
					else {
						var r = this._listeners[e]
						for (var i = 0; i < r.length; )
							if (r[i].fn === t) r.splice(i, 1)
							else ++i
					}
				}
				return this
			}
			EventEmitter.prototype.emit = function emit(e) {
				var t = this._listeners[e]
				if (t) {
					var r = [],
						i = 1
					for (; i < arguments.length; ) r.push(arguments[i++])
					for (i = 0; i < t.length; ) t[i].fn.apply(t[i++].ctx, r)
				}
				return this
			}
		},
		611: (e) => {
			"use strict"
			e.exports = factory(factory)
			function factory(e) {
				if (typeof Float32Array !== "undefined")
					(function () {
						var t = new Float32Array([-0]),
							r = new Uint8Array(t.buffer),
							i = r[3] === 128
						function writeFloat_f32_cpy(e, i, n) {
							t[0] = e
							i[n] = r[0]
							i[n + 1] = r[1]
							i[n + 2] = r[2]
							i[n + 3] = r[3]
						}
						function writeFloat_f32_rev(e, i, n) {
							t[0] = e
							i[n] = r[3]
							i[n + 1] = r[2]
							i[n + 2] = r[1]
							i[n + 3] = r[0]
						}
						e.writeFloatLE = i ? writeFloat_f32_cpy : writeFloat_f32_rev
						e.writeFloatBE = i ? writeFloat_f32_rev : writeFloat_f32_cpy
						function readFloat_f32_cpy(e, i) {
							r[0] = e[i]
							r[1] = e[i + 1]
							r[2] = e[i + 2]
							r[3] = e[i + 3]
							return t[0]
						}
						function readFloat_f32_rev(e, i) {
							r[3] = e[i]
							r[2] = e[i + 1]
							r[1] = e[i + 2]
							r[0] = e[i + 3]
							return t[0]
						}
						e.readFloatLE = i ? readFloat_f32_cpy : readFloat_f32_rev
						e.readFloatBE = i ? readFloat_f32_rev : readFloat_f32_cpy
					})()
				else
					(function () {
						function writeFloat_ieee754(e, t, r, i) {
							var n = t < 0 ? 1 : 0
							if (n) t = -t
							if (t === 0) e(1 / t > 0 ? 0 : 2147483648, r, i)
							else if (isNaN(t)) e(2143289344, r, i)
							else if (t > 34028234663852886e22)
								e(((n << 31) | 2139095040) >>> 0, r, i)
							else if (t < 11754943508222875e-54)
								e(
									((n << 31) | Math.round(t / 1401298464324817e-60)) >>> 0,
									r,
									i
								)
							else {
								var o = Math.floor(Math.log(t) / Math.LN2),
									s = Math.round(t * Math.pow(2, -o) * 8388608) & 8388607
								e(((n << 31) | ((o + 127) << 23) | s) >>> 0, r, i)
							}
						}
						e.writeFloatLE = writeFloat_ieee754.bind(null, writeUintLE)
						e.writeFloatBE = writeFloat_ieee754.bind(null, writeUintBE)
						function readFloat_ieee754(e, t, r) {
							var i = e(t, r),
								n = (i >> 31) * 2 + 1,
								o = (i >>> 23) & 255,
								s = i & 8388607
							return o === 255
								? s
									? NaN
									: n * Infinity
								: o === 0
								? n * 1401298464324817e-60 * s
								: n * Math.pow(2, o - 150) * (s + 8388608)
						}
						e.readFloatLE = readFloat_ieee754.bind(null, readUintLE)
						e.readFloatBE = readFloat_ieee754.bind(null, readUintBE)
					})()
				if (typeof Float64Array !== "undefined")
					(function () {
						var t = new Float64Array([-0]),
							r = new Uint8Array(t.buffer),
							i = r[7] === 128
						function writeDouble_f64_cpy(e, i, n) {
							t[0] = e
							i[n] = r[0]
							i[n + 1] = r[1]
							i[n + 2] = r[2]
							i[n + 3] = r[3]
							i[n + 4] = r[4]
							i[n + 5] = r[5]
							i[n + 6] = r[6]
							i[n + 7] = r[7]
						}
						function writeDouble_f64_rev(e, i, n) {
							t[0] = e
							i[n] = r[7]
							i[n + 1] = r[6]
							i[n + 2] = r[5]
							i[n + 3] = r[4]
							i[n + 4] = r[3]
							i[n + 5] = r[2]
							i[n + 6] = r[1]
							i[n + 7] = r[0]
						}
						e.writeDoubleLE = i ? writeDouble_f64_cpy : writeDouble_f64_rev
						e.writeDoubleBE = i ? writeDouble_f64_rev : writeDouble_f64_cpy
						function readDouble_f64_cpy(e, i) {
							r[0] = e[i]
							r[1] = e[i + 1]
							r[2] = e[i + 2]
							r[3] = e[i + 3]
							r[4] = e[i + 4]
							r[5] = e[i + 5]
							r[6] = e[i + 6]
							r[7] = e[i + 7]
							return t[0]
						}
						function readDouble_f64_rev(e, i) {
							r[7] = e[i]
							r[6] = e[i + 1]
							r[5] = e[i + 2]
							r[4] = e[i + 3]
							r[3] = e[i + 4]
							r[2] = e[i + 5]
							r[1] = e[i + 6]
							r[0] = e[i + 7]
							return t[0]
						}
						e.readDoubleLE = i ? readDouble_f64_cpy : readDouble_f64_rev
						e.readDoubleBE = i ? readDouble_f64_rev : readDouble_f64_cpy
					})()
				else
					(function () {
						function writeDouble_ieee754(e, t, r, i, n, o) {
							var s = i < 0 ? 1 : 0
							if (s) i = -i
							if (i === 0) {
								e(0, n, o + t)
								e(1 / i > 0 ? 0 : 2147483648, n, o + r)
							} else if (isNaN(i)) {
								e(0, n, o + t)
								e(2146959360, n, o + r)
							} else if (i > 17976931348623157e292) {
								e(0, n, o + t)
								e(((s << 31) | 2146435072) >>> 0, n, o + r)
							} else {
								var u
								if (i < 22250738585072014e-324) {
									u = i / 5e-324
									e(u >>> 0, n, o + t)
									e(((s << 31) | (u / 4294967296)) >>> 0, n, o + r)
								} else {
									var a = Math.floor(Math.log(i) / Math.LN2)
									if (a === 1024) a = 1023
									u = i * Math.pow(2, -a)
									e((u * 4503599627370496) >>> 0, n, o + t)
									e(
										((s << 31) |
											((a + 1023) << 20) |
											((u * 1048576) & 1048575)) >>>
											0,
										n,
										o + r
									)
								}
							}
						}
						e.writeDoubleLE = writeDouble_ieee754.bind(null, writeUintLE, 0, 4)
						e.writeDoubleBE = writeDouble_ieee754.bind(null, writeUintBE, 4, 0)
						function readDouble_ieee754(e, t, r, i, n) {
							var o = e(i, n + t),
								s = e(i, n + r)
							var u = (s >> 31) * 2 + 1,
								a = (s >>> 20) & 2047,
								l = 4294967296 * (s & 1048575) + o
							return a === 2047
								? l
									? NaN
									: u * Infinity
								: a === 0
								? u * 5e-324 * l
								: u * Math.pow(2, a - 1075) * (l + 4503599627370496)
						}
						e.readDoubleLE = readDouble_ieee754.bind(null, readUintLE, 0, 4)
						e.readDoubleBE = readDouble_ieee754.bind(null, readUintBE, 4, 0)
					})()
				return e
			}
			function writeUintLE(e, t, r) {
				t[r] = e & 255
				t[r + 1] = (e >>> 8) & 255
				t[r + 2] = (e >>> 16) & 255
				t[r + 3] = e >>> 24
			}
			function writeUintBE(e, t, r) {
				t[r] = e >>> 24
				t[r + 1] = (e >>> 16) & 255
				t[r + 2] = (e >>> 8) & 255
				t[r + 3] = e & 255
			}
			function readUintLE(e, t) {
				return (
					(e[t] | (e[t + 1] << 8) | (e[t + 2] << 16) | (e[t + 3] << 24)) >>> 0
				)
			}
			function readUintBE(e, t) {
				return (
					((e[t] << 24) | (e[t + 1] << 16) | (e[t + 2] << 8) | e[t + 3]) >>> 0
				)
			}
		},
		379: (module) => {
			"use strict"
			module.exports = inquire
			function inquire(moduleName) {
				try {
					var mod = eval("quire".replace(/^/, "re"))(moduleName)
					if (mod && (mod.length || Object.keys(mod).length)) return mod
				} catch (e) {}
				return null
			}
		},
		41: (e) => {
			"use strict"
			e.exports = pool
			function pool(e, t, r) {
				var i = r || 8192
				var n = i >>> 1
				var o = null
				var s = i
				return function pool_alloc(r) {
					if (r < 1 || r > n) return e(r)
					if (s + r > i) {
						o = e(i)
						s = 0
					}
					var u = t.call(o, s, (s += r))
					if (s & 7) s = (s | 7) + 1
					return u
				}
			}
		},
		112: (e, t) => {
			"use strict"
			var r = t
			r.length = function utf8_length(e) {
				var t = 0,
					r = 0
				for (var i = 0; i < e.length; ++i) {
					r = e.charCodeAt(i)
					if (r < 128) t += 1
					else if (r < 2048) t += 2
					else if (
						(r & 64512) === 55296 &&
						(e.charCodeAt(i + 1) & 64512) === 56320
					) {
						++i
						t += 4
					} else t += 3
				}
				return t
			}
			r.read = function utf8_read(e, t, r) {
				var i = r - t
				if (i < 1) return ""
				var n = null,
					o = [],
					s = 0,
					u
				while (t < r) {
					u = e[t++]
					if (u < 128) o[s++] = u
					else if (u > 191 && u < 224) o[s++] = ((u & 31) << 6) | (e[t++] & 63)
					else if (u > 239 && u < 365) {
						u =
							(((u & 7) << 18) |
								((e[t++] & 63) << 12) |
								((e[t++] & 63) << 6) |
								(e[t++] & 63)) -
							65536
						o[s++] = 55296 + (u >> 10)
						o[s++] = 56320 + (u & 1023)
					} else
						o[s++] = ((u & 15) << 12) | ((e[t++] & 63) << 6) | (e[t++] & 63)
					if (s > 8191) {
						;(n || (n = [])).push(String.fromCharCode.apply(String, o))
						s = 0
					}
				}
				if (n) {
					if (s) n.push(String.fromCharCode.apply(String, o.slice(0, s)))
					return n.join("")
				}
				return String.fromCharCode.apply(String, o.slice(0, s))
			}
			r.write = function utf8_write(e, t, r) {
				var i = r,
					n,
					o
				for (var s = 0; s < e.length; ++s) {
					n = e.charCodeAt(s)
					if (n < 128) {
						t[r++] = n
					} else if (n < 2048) {
						t[r++] = (n >> 6) | 192
						t[r++] = (n & 63) | 128
					} else if (
						(n & 64512) === 55296 &&
						((o = e.charCodeAt(s + 1)) & 64512) === 56320
					) {
						n = 65536 + ((n & 1023) << 10) + (o & 1023)
						++s
						t[r++] = (n >> 18) | 240
						t[r++] = ((n >> 12) & 63) | 128
						t[r++] = ((n >> 6) & 63) | 128
						t[r++] = (n & 63) | 128
					} else {
						t[r++] = (n >> 12) | 224
						t[r++] = ((n >> 6) & 63) | 128
						t[r++] = (n & 63) | 128
					}
				}
				return r - i
			}
		},
		677: function (e, t, r) {
			e = r.nmd(e)
			;(function (t, i) {
				if (typeof define === "function" && define.amd)
					define(["protobufjs/minimal"], i)
				else if (true && e && e.exports) e.exports = i(r(281))
			})(this, function (e) {
				"use strict"
				var t = e.Reader,
					r = e.Writer,
					i = e.util
				var n = e.roots["default"] || (e.roots["default"] = {})
				n.google = (function () {
					var o = {}
					o.api = (function () {
						var o = {}
						o.Http = (function () {
							function Http(e) {
								this.rules = []
								if (e)
									for (var t = Object.keys(e), r = 0; r < t.length; ++r)
										if (e[t[r]] != null) this[t[r]] = e[t[r]]
							}
							Http.prototype.rules = i.emptyArray
							Http.prototype.fully_decode_reserved_expansion = false
							Http.create = function create(e) {
								return new Http(e)
							}
							Http.encode = function encode(e, t) {
								if (!t) t = r.create()
								if (e.rules != null && e.rules.length)
									for (var i = 0; i < e.rules.length; ++i)
										n.google.api.HttpRule.encode(
											e.rules[i],
											t.uint32(10).fork()
										).ldelim()
								if (
									e.fully_decode_reserved_expansion != null &&
									Object.hasOwnProperty.call(
										e,
										"fully_decode_reserved_expansion"
									)
								)
									t.uint32(16).bool(e.fully_decode_reserved_expansion)
								return t
							}
							Http.encodeDelimited = function encodeDelimited(e, t) {
								return this.encode(e, t).ldelim()
							}
							Http.decode = function decode(e, r) {
								if (!(e instanceof t)) e = t.create(e)
								var i = r === undefined ? e.len : e.pos + r,
									o = new n.google.api.Http()
								while (e.pos < i) {
									var s = e.uint32()
									switch (s >>> 3) {
										case 1:
											if (!(o.rules && o.rules.length)) o.rules = []
											o.rules.push(n.google.api.HttpRule.decode(e, e.uint32()))
											break
										case 2:
											o.fully_decode_reserved_expansion = e.bool()
											break
										default:
											e.skipType(s & 7)
											break
									}
								}
								return o
							}
							Http.decodeDelimited = function decodeDelimited(e) {
								if (!(e instanceof t)) e = new t(e)
								return this.decode(e, e.uint32())
							}
							Http.verify = function verify(e) {
								if (typeof e !== "object" || e === null)
									return "object expected"
								if (e.rules != null && e.hasOwnProperty("rules")) {
									if (!Array.isArray(e.rules)) return "rules: array expected"
									for (var t = 0; t < e.rules.length; ++t) {
										var r = n.google.api.HttpRule.verify(e.rules[t])
										if (r) return "rules." + r
									}
								}
								if (
									e.fully_decode_reserved_expansion != null &&
									e.hasOwnProperty("fully_decode_reserved_expansion")
								)
									if (typeof e.fully_decode_reserved_expansion !== "boolean")
										return "fully_decode_reserved_expansion: boolean expected"
								return null
							}
							Http.fromObject = function fromObject(e) {
								if (e instanceof n.google.api.Http) return e
								var t = new n.google.api.Http()
								if (e.rules) {
									if (!Array.isArray(e.rules))
										throw TypeError(".google.api.Http.rules: array expected")
									t.rules = []
									for (var r = 0; r < e.rules.length; ++r) {
										if (typeof e.rules[r] !== "object")
											throw TypeError(".google.api.Http.rules: object expected")
										t.rules[r] = n.google.api.HttpRule.fromObject(e.rules[r])
									}
								}
								if (e.fully_decode_reserved_expansion != null)
									t.fully_decode_reserved_expansion = Boolean(
										e.fully_decode_reserved_expansion
									)
								return t
							}
							Http.toObject = function toObject(e, t) {
								if (!t) t = {}
								var r = {}
								if (t.arrays || t.defaults) r.rules = []
								if (t.defaults) r.fully_decode_reserved_expansion = false
								if (e.rules && e.rules.length) {
									r.rules = []
									for (var i = 0; i < e.rules.length; ++i)
										r.rules[i] = n.google.api.HttpRule.toObject(e.rules[i], t)
								}
								if (
									e.fully_decode_reserved_expansion != null &&
									e.hasOwnProperty("fully_decode_reserved_expansion")
								)
									r.fully_decode_reserved_expansion =
										e.fully_decode_reserved_expansion
								return r
							}
							Http.prototype.toJSON = function toJSON() {
								return this.constructor.toObject(this, e.util.toJSONOptions)
							}
							return Http
						})()
						o.HttpRule = (function () {
							function HttpRule(e) {
								this.additional_bindings = []
								if (e)
									for (var t = Object.keys(e), r = 0; r < t.length; ++r)
										if (e[t[r]] != null) this[t[r]] = e[t[r]]
							}
							HttpRule.prototype.selector = ""
							HttpRule.prototype.get = ""
							HttpRule.prototype.put = ""
							HttpRule.prototype.post = ""
							HttpRule.prototype["delete"] = ""
							HttpRule.prototype.patch = ""
							HttpRule.prototype.custom = null
							HttpRule.prototype.body = ""
							HttpRule.prototype.response_body = ""
							HttpRule.prototype.additional_bindings = i.emptyArray
							var o
							Object.defineProperty(HttpRule.prototype, "pattern", {
								get: i.oneOfGetter(
									(o = ["get", "put", "post", "delete", "patch", "custom"])
								),
								set: i.oneOfSetter(o)
							})
							HttpRule.create = function create(e) {
								return new HttpRule(e)
							}
							HttpRule.encode = function encode(e, t) {
								if (!t) t = r.create()
								if (
									e.selector != null &&
									Object.hasOwnProperty.call(e, "selector")
								)
									t.uint32(10).string(e.selector)
								if (e.get != null && Object.hasOwnProperty.call(e, "get"))
									t.uint32(18).string(e.get)
								if (e.put != null && Object.hasOwnProperty.call(e, "put"))
									t.uint32(26).string(e.put)
								if (e.post != null && Object.hasOwnProperty.call(e, "post"))
									t.uint32(34).string(e.post)
								if (
									e["delete"] != null &&
									Object.hasOwnProperty.call(e, "delete")
								)
									t.uint32(42).string(e["delete"])
								if (e.patch != null && Object.hasOwnProperty.call(e, "patch"))
									t.uint32(50).string(e.patch)
								if (e.body != null && Object.hasOwnProperty.call(e, "body"))
									t.uint32(58).string(e.body)
								if (e.custom != null && Object.hasOwnProperty.call(e, "custom"))
									n.google.api.CustomHttpPattern.encode(
										e.custom,
										t.uint32(66).fork()
									).ldelim()
								if (
									e.additional_bindings != null &&
									e.additional_bindings.length
								)
									for (var i = 0; i < e.additional_bindings.length; ++i)
										n.google.api.HttpRule.encode(
											e.additional_bindings[i],
											t.uint32(90).fork()
										).ldelim()
								if (
									e.response_body != null &&
									Object.hasOwnProperty.call(e, "response_body")
								)
									t.uint32(98).string(e.response_body)
								return t
							}
							HttpRule.encodeDelimited = function encodeDelimited(e, t) {
								return this.encode(e, t).ldelim()
							}
							HttpRule.decode = function decode(e, r) {
								if (!(e instanceof t)) e = t.create(e)
								var i = r === undefined ? e.len : e.pos + r,
									o = new n.google.api.HttpRule()
								while (e.pos < i) {
									var s = e.uint32()
									switch (s >>> 3) {
										case 1:
											o.selector = e.string()
											break
										case 2:
											o.get = e.string()
											break
										case 3:
											o.put = e.string()
											break
										case 4:
											o.post = e.string()
											break
										case 5:
											o["delete"] = e.string()
											break
										case 6:
											o.patch = e.string()
											break
										case 8:
											o.custom = n.google.api.CustomHttpPattern.decode(
												e,
												e.uint32()
											)
											break
										case 7:
											o.body = e.string()
											break
										case 12:
											o.response_body = e.string()
											break
										case 11:
											if (
												!(o.additional_bindings && o.additional_bindings.length)
											)
												o.additional_bindings = []
											o.additional_bindings.push(
												n.google.api.HttpRule.decode(e, e.uint32())
											)
											break
										default:
											e.skipType(s & 7)
											break
									}
								}
								return o
							}
							HttpRule.decodeDelimited = function decodeDelimited(e) {
								if (!(e instanceof t)) e = new t(e)
								return this.decode(e, e.uint32())
							}
							HttpRule.verify = function verify(e) {
								if (typeof e !== "object" || e === null)
									return "object expected"
								var t = {}
								if (e.selector != null && e.hasOwnProperty("selector"))
									if (!i.isString(e.selector))
										return "selector: string expected"
								if (e.get != null && e.hasOwnProperty("get")) {
									t.pattern = 1
									if (!i.isString(e.get)) return "get: string expected"
								}
								if (e.put != null && e.hasOwnProperty("put")) {
									if (t.pattern === 1) return "pattern: multiple values"
									t.pattern = 1
									if (!i.isString(e.put)) return "put: string expected"
								}
								if (e.post != null && e.hasOwnProperty("post")) {
									if (t.pattern === 1) return "pattern: multiple values"
									t.pattern = 1
									if (!i.isString(e.post)) return "post: string expected"
								}
								if (e["delete"] != null && e.hasOwnProperty("delete")) {
									if (t.pattern === 1) return "pattern: multiple values"
									t.pattern = 1
									if (!i.isString(e["delete"])) return "delete: string expected"
								}
								if (e.patch != null && e.hasOwnProperty("patch")) {
									if (t.pattern === 1) return "pattern: multiple values"
									t.pattern = 1
									if (!i.isString(e.patch)) return "patch: string expected"
								}
								if (e.custom != null && e.hasOwnProperty("custom")) {
									if (t.pattern === 1) return "pattern: multiple values"
									t.pattern = 1
									{
										var r = n.google.api.CustomHttpPattern.verify(e.custom)
										if (r) return "custom." + r
									}
								}
								if (e.body != null && e.hasOwnProperty("body"))
									if (!i.isString(e.body)) return "body: string expected"
								if (
									e.response_body != null &&
									e.hasOwnProperty("response_body")
								)
									if (!i.isString(e.response_body))
										return "response_body: string expected"
								if (
									e.additional_bindings != null &&
									e.hasOwnProperty("additional_bindings")
								) {
									if (!Array.isArray(e.additional_bindings))
										return "additional_bindings: array expected"
									for (var o = 0; o < e.additional_bindings.length; ++o) {
										var r = n.google.api.HttpRule.verify(
											e.additional_bindings[o]
										)
										if (r) return "additional_bindings." + r
									}
								}
								return null
							}
							HttpRule.fromObject = function fromObject(e) {
								if (e instanceof n.google.api.HttpRule) return e
								var t = new n.google.api.HttpRule()
								if (e.selector != null) t.selector = String(e.selector)
								if (e.get != null) t.get = String(e.get)
								if (e.put != null) t.put = String(e.put)
								if (e.post != null) t.post = String(e.post)
								if (e["delete"] != null) t["delete"] = String(e["delete"])
								if (e.patch != null) t.patch = String(e.patch)
								if (e.custom != null) {
									if (typeof e.custom !== "object")
										throw TypeError(
											".google.api.HttpRule.custom: object expected"
										)
									t.custom = n.google.api.CustomHttpPattern.fromObject(e.custom)
								}
								if (e.body != null) t.body = String(e.body)
								if (e.response_body != null)
									t.response_body = String(e.response_body)
								if (e.additional_bindings) {
									if (!Array.isArray(e.additional_bindings))
										throw TypeError(
											".google.api.HttpRule.additional_bindings: array expected"
										)
									t.additional_bindings = []
									for (var r = 0; r < e.additional_bindings.length; ++r) {
										if (typeof e.additional_bindings[r] !== "object")
											throw TypeError(
												".google.api.HttpRule.additional_bindings: object expected"
											)
										t.additional_bindings[r] = n.google.api.HttpRule.fromObject(
											e.additional_bindings[r]
										)
									}
								}
								return t
							}
							HttpRule.toObject = function toObject(e, t) {
								if (!t) t = {}
								var r = {}
								if (t.arrays || t.defaults) r.additional_bindings = []
								if (t.defaults) {
									r.selector = ""
									r.body = ""
									r.response_body = ""
								}
								if (e.selector != null && e.hasOwnProperty("selector"))
									r.selector = e.selector
								if (e.get != null && e.hasOwnProperty("get")) {
									r.get = e.get
									if (t.oneofs) r.pattern = "get"
								}
								if (e.put != null && e.hasOwnProperty("put")) {
									r.put = e.put
									if (t.oneofs) r.pattern = "put"
								}
								if (e.post != null && e.hasOwnProperty("post")) {
									r.post = e.post
									if (t.oneofs) r.pattern = "post"
								}
								if (e["delete"] != null && e.hasOwnProperty("delete")) {
									r["delete"] = e["delete"]
									if (t.oneofs) r.pattern = "delete"
								}
								if (e.patch != null && e.hasOwnProperty("patch")) {
									r.patch = e.patch
									if (t.oneofs) r.pattern = "patch"
								}
								if (e.body != null && e.hasOwnProperty("body")) r.body = e.body
								if (e.custom != null && e.hasOwnProperty("custom")) {
									r.custom = n.google.api.CustomHttpPattern.toObject(
										e.custom,
										t
									)
									if (t.oneofs) r.pattern = "custom"
								}
								if (e.additional_bindings && e.additional_bindings.length) {
									r.additional_bindings = []
									for (var i = 0; i < e.additional_bindings.length; ++i)
										r.additional_bindings[i] = n.google.api.HttpRule.toObject(
											e.additional_bindings[i],
											t
										)
								}
								if (
									e.response_body != null &&
									e.hasOwnProperty("response_body")
								)
									r.response_body = e.response_body
								return r
							}
							HttpRule.prototype.toJSON = function toJSON() {
								return this.constructor.toObject(this, e.util.toJSONOptions)
							}
							return HttpRule
						})()
						o.CustomHttpPattern = (function () {
							function CustomHttpPattern(e) {
								if (e)
									for (var t = Object.keys(e), r = 0; r < t.length; ++r)
										if (e[t[r]] != null) this[t[r]] = e[t[r]]
							}
							CustomHttpPattern.prototype.kind = ""
							CustomHttpPattern.prototype.path = ""
							CustomHttpPattern.create = function create(e) {
								return new CustomHttpPattern(e)
							}
							CustomHttpPattern.encode = function encode(e, t) {
								if (!t) t = r.create()
								if (e.kind != null && Object.hasOwnProperty.call(e, "kind"))
									t.uint32(10).string(e.kind)
								if (e.path != null && Object.hasOwnProperty.call(e, "path"))
									t.uint32(18).string(e.path)
								return t
							}
							CustomHttpPattern.encodeDelimited = function encodeDelimited(
								e,
								t
							) {
								return this.encode(e, t).ldelim()
							}
							CustomHttpPattern.decode = function decode(e, r) {
								if (!(e instanceof t)) e = t.create(e)
								var i = r === undefined ? e.len : e.pos + r,
									o = new n.google.api.CustomHttpPattern()
								while (e.pos < i) {
									var s = e.uint32()
									switch (s >>> 3) {
										case 1:
											o.kind = e.string()
											break
										case 2:
											o.path = e.string()
											break
										default:
											e.skipType(s & 7)
											break
									}
								}
								return o
							}
							CustomHttpPattern.decodeDelimited = function decodeDelimited(e) {
								if (!(e instanceof t)) e = new t(e)
								return this.decode(e, e.uint32())
							}
							CustomHttpPattern.verify = function verify(e) {
								if (typeof e !== "object" || e === null)
									return "object expected"
								if (e.kind != null && e.hasOwnProperty("kind"))
									if (!i.isString(e.kind)) return "kind: string expected"
								if (e.path != null && e.hasOwnProperty("path"))
									if (!i.isString(e.path)) return "path: string expected"
								return null
							}
							CustomHttpPattern.fromObject = function fromObject(e) {
								if (e instanceof n.google.api.CustomHttpPattern) return e
								var t = new n.google.api.CustomHttpPattern()
								if (e.kind != null) t.kind = String(e.kind)
								if (e.path != null) t.path = String(e.path)
								return t
							}
							CustomHttpPattern.toObject = function toObject(e, t) {
								if (!t) t = {}
								var r = {}
								if (t.defaults) {
									r.kind = ""
									r.path = ""
								}
								if (e.kind != null && e.hasOwnProperty("kind")) r.kind = e.kind
								if (e.path != null && e.hasOwnProperty("path")) r.path = e.path
								return r
							}
							CustomHttpPattern.prototype.toJSON = function toJSON() {
								return this.constructor.toObject(this, e.util.toJSONOptions)
							}
							return CustomHttpPattern
						})()
						return o
					})()
					return o
				})()
				return n
			})
		},
		281: (e, t, r) => {
			"use strict"
			e.exports = r(774)
		},
		774: (e, t, r) => {
			"use strict"
			var i = t
			i.build = "minimal"
			i.Writer = r(400)
			i.BufferWriter = r(47)
			i.Reader = r(993)
			i.BufferReader = r(544)
			i.util = r(123)
			i.rpc = r(749)
			i.roots = r(210)
			i.configure = configure
			function configure() {
				i.util._configure()
				i.Writer._configure(i.BufferWriter)
				i.Reader._configure(i.BufferReader)
			}
			configure()
		},
		993: (e, t, r) => {
			"use strict"
			e.exports = Reader
			var i = r(123)
			var n
			var o = i.LongBits,
				s = i.utf8
			function indexOutOfRange(e, t) {
				return RangeError(
					"index out of range: " + e.pos + " + " + (t || 1) + " > " + e.len
				)
			}
			function Reader(e) {
				this.buf = e
				this.pos = 0
				this.len = e.length
			}
			var u =
				typeof Uint8Array !== "undefined"
					? function create_typed_array(e) {
							if (e instanceof Uint8Array || Array.isArray(e))
								return new Reader(e)
							throw Error("illegal buffer")
					  }
					: function create_array(e) {
							if (Array.isArray(e)) return new Reader(e)
							throw Error("illegal buffer")
					  }
			var a = function create() {
				return i.Buffer
					? function create_buffer_setup(e) {
							return (Reader.create = function create_buffer(e) {
								return i.Buffer.isBuffer(e) ? new n(e) : u(e)
							})(e)
					  }
					: u
			}
			Reader.create = a()
			Reader.prototype._slice =
				i.Array.prototype.subarray || i.Array.prototype.slice
			Reader.prototype.uint32 = (function read_uint32_setup() {
				var e = 4294967295
				return function read_uint32() {
					e = (this.buf[this.pos] & 127) >>> 0
					if (this.buf[this.pos++] < 128) return e
					e = (e | ((this.buf[this.pos] & 127) << 7)) >>> 0
					if (this.buf[this.pos++] < 128) return e
					e = (e | ((this.buf[this.pos] & 127) << 14)) >>> 0
					if (this.buf[this.pos++] < 128) return e
					e = (e | ((this.buf[this.pos] & 127) << 21)) >>> 0
					if (this.buf[this.pos++] < 128) return e
					e = (e | ((this.buf[this.pos] & 15) << 28)) >>> 0
					if (this.buf[this.pos++] < 128) return e
					if ((this.pos += 5) > this.len) {
						this.pos = this.len
						throw indexOutOfRange(this, 10)
					}
					return e
				}
			})()
			Reader.prototype.int32 = function read_int32() {
				return this.uint32() | 0
			}
			Reader.prototype.sint32 = function read_sint32() {
				var e = this.uint32()
				return ((e >>> 1) ^ -(e & 1)) | 0
			}
			function readLongVarint() {
				var e = new o(0, 0)
				var t = 0
				if (this.len - this.pos > 4) {
					for (; t < 4; ++t) {
						e.lo = (e.lo | ((this.buf[this.pos] & 127) << (t * 7))) >>> 0
						if (this.buf[this.pos++] < 128) return e
					}
					e.lo = (e.lo | ((this.buf[this.pos] & 127) << 28)) >>> 0
					e.hi = (e.hi | ((this.buf[this.pos] & 127) >> 4)) >>> 0
					if (this.buf[this.pos++] < 128) return e
					t = 0
				} else {
					for (; t < 3; ++t) {
						if (this.pos >= this.len) throw indexOutOfRange(this)
						e.lo = (e.lo | ((this.buf[this.pos] & 127) << (t * 7))) >>> 0
						if (this.buf[this.pos++] < 128) return e
					}
					e.lo = (e.lo | ((this.buf[this.pos++] & 127) << (t * 7))) >>> 0
					return e
				}
				if (this.len - this.pos > 4) {
					for (; t < 5; ++t) {
						e.hi = (e.hi | ((this.buf[this.pos] & 127) << (t * 7 + 3))) >>> 0
						if (this.buf[this.pos++] < 128) return e
					}
				} else {
					for (; t < 5; ++t) {
						if (this.pos >= this.len) throw indexOutOfRange(this)
						e.hi = (e.hi | ((this.buf[this.pos] & 127) << (t * 7 + 3))) >>> 0
						if (this.buf[this.pos++] < 128) return e
					}
				}
				throw Error("invalid varint encoding")
			}
			Reader.prototype.bool = function read_bool() {
				return this.uint32() !== 0
			}
			function readFixed32_end(e, t) {
				return (
					(e[t - 4] | (e[t - 3] << 8) | (e[t - 2] << 16) | (e[t - 1] << 24)) >>>
					0
				)
			}
			Reader.prototype.fixed32 = function read_fixed32() {
				if (this.pos + 4 > this.len) throw indexOutOfRange(this, 4)
				return readFixed32_end(this.buf, (this.pos += 4))
			}
			Reader.prototype.sfixed32 = function read_sfixed32() {
				if (this.pos + 4 > this.len) throw indexOutOfRange(this, 4)
				return readFixed32_end(this.buf, (this.pos += 4)) | 0
			}
			function readFixed64() {
				if (this.pos + 8 > this.len) throw indexOutOfRange(this, 8)
				return new o(
					readFixed32_end(this.buf, (this.pos += 4)),
					readFixed32_end(this.buf, (this.pos += 4))
				)
			}
			Reader.prototype.float = function read_float() {
				if (this.pos + 4 > this.len) throw indexOutOfRange(this, 4)
				var e = i.float.readFloatLE(this.buf, this.pos)
				this.pos += 4
				return e
			}
			Reader.prototype.double = function read_double() {
				if (this.pos + 8 > this.len) throw indexOutOfRange(this, 4)
				var e = i.float.readDoubleLE(this.buf, this.pos)
				this.pos += 8
				return e
			}
			Reader.prototype.bytes = function read_bytes() {
				var e = this.uint32(),
					t = this.pos,
					r = this.pos + e
				if (r > this.len) throw indexOutOfRange(this, e)
				this.pos += e
				if (Array.isArray(this.buf)) return this.buf.slice(t, r)
				return t === r
					? new this.buf.constructor(0)
					: this._slice.call(this.buf, t, r)
			}
			Reader.prototype.string = function read_string() {
				var e = this.bytes()
				return s.read(e, 0, e.length)
			}
			Reader.prototype.skip = function skip(e) {
				if (typeof e === "number") {
					if (this.pos + e > this.len) throw indexOutOfRange(this, e)
					this.pos += e
				} else {
					do {
						if (this.pos >= this.len) throw indexOutOfRange(this)
					} while (this.buf[this.pos++] & 128)
				}
				return this
			}
			Reader.prototype.skipType = function (e) {
				switch (e) {
					case 0:
						this.skip()
						break
					case 1:
						this.skip(8)
						break
					case 2:
						this.skip(this.uint32())
						break
					case 3:
						while ((e = this.uint32() & 7) !== 4) {
							this.skipType(e)
						}
						break
					case 5:
						this.skip(4)
						break
					default:
						throw Error("invalid wire type " + e + " at offset " + this.pos)
				}
				return this
			}
			Reader._configure = function (e) {
				n = e
				Reader.create = a()
				n._configure()
				var t = i.Long ? "toLong" : "toNumber"
				i.merge(Reader.prototype, {
					int64: function read_int64() {
						return readLongVarint.call(this)[t](false)
					},
					uint64: function read_uint64() {
						return readLongVarint.call(this)[t](true)
					},
					sint64: function read_sint64() {
						return readLongVarint.call(this).zzDecode()[t](false)
					},
					fixed64: function read_fixed64() {
						return readFixed64.call(this)[t](true)
					},
					sfixed64: function read_sfixed64() {
						return readFixed64.call(this)[t](false)
					}
				})
			}
		},
		544: (e, t, r) => {
			"use strict"
			e.exports = BufferReader
			var i = r(993)
			;(BufferReader.prototype = Object.create(i.prototype)).constructor =
				BufferReader
			var n = r(123)
			function BufferReader(e) {
				i.call(this, e)
			}
			BufferReader._configure = function () {
				if (n.Buffer) BufferReader.prototype._slice = n.Buffer.prototype.slice
			}
			BufferReader.prototype.string = function read_string_buffer() {
				var e = this.uint32()
				return this.buf.utf8Slice
					? this.buf.utf8Slice(
							this.pos,
							(this.pos = Math.min(this.pos + e, this.len))
					  )
					: this.buf.toString(
							"utf-8",
							this.pos,
							(this.pos = Math.min(this.pos + e, this.len))
					  )
			}
			BufferReader._configure()
		},
		210: (e) => {
			"use strict"
			e.exports = {}
		},
		749: (e, t, r) => {
			"use strict"
			var i = t
			i.Service = r(968)
		},
		968: (e, t, r) => {
			"use strict"
			e.exports = Service
			var i = r(123)
			;(Service.prototype = Object.create(
				i.EventEmitter.prototype
			)).constructor = Service
			function Service(e, t, r) {
				if (typeof e !== "function")
					throw TypeError("rpcImpl must be a function")
				i.EventEmitter.call(this)
				this.rpcImpl = e
				this.requestDelimited = Boolean(t)
				this.responseDelimited = Boolean(r)
			}
			Service.prototype.rpcCall = function rpcCall(e, t, r, n, o) {
				if (!n) throw TypeError("request must be specified")
				var s = this
				if (!o) return i.asPromise(rpcCall, s, e, t, r, n)
				if (!s.rpcImpl) {
					setTimeout(function () {
						o(Error("already ended"))
					}, 0)
					return undefined
				}
				try {
					return s.rpcImpl(
						e,
						t[s.requestDelimited ? "encodeDelimited" : "encode"](n).finish(),
						function rpcCallback(t, i) {
							if (t) {
								s.emit("error", t, e)
								return o(t)
							}
							if (i === null) {
								s.end(true)
								return undefined
							}
							if (!(i instanceof r)) {
								try {
									i = r[s.responseDelimited ? "decodeDelimited" : "decode"](i)
								} catch (t) {
									s.emit("error", t, e)
									return o(t)
								}
							}
							s.emit("data", i, e)
							return o(null, i)
						}
					)
				} catch (t) {
					s.emit("error", t, e)
					setTimeout(function () {
						o(t)
					}, 0)
					return undefined
				}
			}
			Service.prototype.end = function end(e) {
				if (this.rpcImpl) {
					if (!e) this.rpcImpl(null, null, null)
					this.rpcImpl = null
					this.emit("end").off()
				}
				return this
			}
		},
		361: (e, t, r) => {
			"use strict"
			e.exports = LongBits
			var i = r(123)
			function LongBits(e, t) {
				this.lo = e >>> 0
				this.hi = t >>> 0
			}
			var n = (LongBits.zero = new LongBits(0, 0))
			n.toNumber = function () {
				return 0
			}
			n.zzEncode = n.zzDecode = function () {
				return this
			}
			n.length = function () {
				return 1
			}
			var o = (LongBits.zeroHash = "\0\0\0\0\0\0\0\0")
			LongBits.fromNumber = function fromNumber(e) {
				if (e === 0) return n
				var t = e < 0
				if (t) e = -e
				var r = e >>> 0,
					i = ((e - r) / 4294967296) >>> 0
				if (t) {
					i = ~i >>> 0
					r = ~r >>> 0
					if (++r > 4294967295) {
						r = 0
						if (++i > 4294967295) i = 0
					}
				}
				return new LongBits(r, i)
			}
			LongBits.from = function from(e) {
				if (typeof e === "number") return LongBits.fromNumber(e)
				if (i.isString(e)) {
					if (i.Long) e = i.Long.fromString(e)
					else return LongBits.fromNumber(parseInt(e, 10))
				}
				return e.low || e.high ? new LongBits(e.low >>> 0, e.high >>> 0) : n
			}
			LongBits.prototype.toNumber = function toNumber(e) {
				if (!e && this.hi >>> 31) {
					var t = (~this.lo + 1) >>> 0,
						r = ~this.hi >>> 0
					if (!t) r = (r + 1) >>> 0
					return -(t + r * 4294967296)
				}
				return this.lo + this.hi * 4294967296
			}
			LongBits.prototype.toLong = function toLong(e) {
				return i.Long
					? new i.Long(this.lo | 0, this.hi | 0, Boolean(e))
					: { low: this.lo | 0, high: this.hi | 0, unsigned: Boolean(e) }
			}
			var s = String.prototype.charCodeAt
			LongBits.fromHash = function fromHash(e) {
				if (e === o) return n
				return new LongBits(
					(s.call(e, 0) |
						(s.call(e, 1) << 8) |
						(s.call(e, 2) << 16) |
						(s.call(e, 3) << 24)) >>>
						0,
					(s.call(e, 4) |
						(s.call(e, 5) << 8) |
						(s.call(e, 6) << 16) |
						(s.call(e, 7) << 24)) >>>
						0
				)
			}
			LongBits.prototype.toHash = function toHash() {
				return String.fromCharCode(
					this.lo & 255,
					(this.lo >>> 8) & 255,
					(this.lo >>> 16) & 255,
					this.lo >>> 24,
					this.hi & 255,
					(this.hi >>> 8) & 255,
					(this.hi >>> 16) & 255,
					this.hi >>> 24
				)
			}
			LongBits.prototype.zzEncode = function zzEncode() {
				var e = this.hi >> 31
				this.hi = (((this.hi << 1) | (this.lo >>> 31)) ^ e) >>> 0
				this.lo = ((this.lo << 1) ^ e) >>> 0
				return this
			}
			LongBits.prototype.zzDecode = function zzDecode() {
				var e = -(this.lo & 1)
				this.lo = (((this.lo >>> 1) | (this.hi << 31)) ^ e) >>> 0
				this.hi = ((this.hi >>> 1) ^ e) >>> 0
				return this
			}
			LongBits.prototype.length = function length() {
				var e = this.lo,
					t = ((this.lo >>> 28) | (this.hi << 4)) >>> 0,
					r = this.hi >>> 24
				return r === 0
					? t === 0
						? e < 16384
							? e < 128
								? 1
								: 2
							: e < 2097152
							? 3
							: 4
						: t < 16384
						? t < 128
							? 5
							: 6
						: t < 2097152
						? 7
						: 8
					: r < 128
					? 9
					: 10
			}
		},
		123: function (e, t, r) {
			"use strict"
			var i = t
			i.asPromise = r(776)
			i.base64 = r(869)
			i.EventEmitter = r(536)
			i.float = r(611)
			i.inquire = r(379)
			i.utf8 = r(112)
			i.pool = r(41)
			i.LongBits = r(361)
			i.isNode = Boolean(
				typeof global !== "undefined" &&
					global &&
					global.process &&
					global.process.versions &&
					global.process.versions.node
			)
			i.global =
				(i.isNode && global) ||
				(typeof window !== "undefined" && window) ||
				(typeof self !== "undefined" && self) ||
				this
			i.emptyArray = Object.freeze ? Object.freeze([]) : []
			i.emptyObject = Object.freeze ? Object.freeze({}) : {}
			i.isInteger =
				Number.isInteger ||
				function isInteger(e) {
					return typeof e === "number" && isFinite(e) && Math.floor(e) === e
				}
			i.isString = function isString(e) {
				return typeof e === "string" || e instanceof String
			}
			i.isObject = function isObject(e) {
				return e && typeof e === "object"
			}
			i.isset = i.isSet = function isSet(e, t) {
				var r = e[t]
				if (r != null && e.hasOwnProperty(t))
					return (
						typeof r !== "object" ||
						(Array.isArray(r) ? r.length : Object.keys(r).length) > 0
					)
				return false
			}
			i.Buffer = (function () {
				try {
					var e = i.inquire("buffer").Buffer
					return e.prototype.utf8Write ? e : null
				} catch (e) {
					return null
				}
			})()
			i._Buffer_from = null
			i._Buffer_allocUnsafe = null
			i.newBuffer = function newBuffer(e) {
				return typeof e === "number"
					? i.Buffer
						? i._Buffer_allocUnsafe(e)
						: new i.Array(e)
					: i.Buffer
					? i._Buffer_from(e)
					: typeof Uint8Array === "undefined"
					? e
					: new Uint8Array(e)
			}
			i.Array = typeof Uint8Array !== "undefined" ? Uint8Array : Array
			i.Long =
				(i.global.dcodeIO && i.global.dcodeIO.Long) ||
				i.global.Long ||
				i.inquire("long")
			i.key2Re = /^true|false|0|1$/
			i.key32Re = /^-?(?:0|[1-9][0-9]*)$/
			i.key64Re = /^(?:[\\x00-\\xff]{8}|-?(?:0|[1-9][0-9]*))$/
			i.longToHash = function longToHash(e) {
				return e ? i.LongBits.from(e).toHash() : i.LongBits.zeroHash
			}
			i.longFromHash = function longFromHash(e, t) {
				var r = i.LongBits.fromHash(e)
				if (i.Long) return i.Long.fromBits(r.lo, r.hi, t)
				return r.toNumber(Boolean(t))
			}
			function merge(e, t, r) {
				for (var i = Object.keys(t), n = 0; n < i.length; ++n)
					if (e[i[n]] === undefined || !r) e[i[n]] = t[i[n]]
				return e
			}
			i.merge = merge
			i.lcFirst = function lcFirst(e) {
				return e.charAt(0).toLowerCase() + e.substring(1)
			}
			function newError(e) {
				function CustomError(e, t) {
					if (!(this instanceof CustomError)) return new CustomError(e, t)
					Object.defineProperty(this, "message", {
						get: function () {
							return e
						}
					})
					if (Error.captureStackTrace)
						Error.captureStackTrace(this, CustomError)
					else
						Object.defineProperty(this, "stack", {
							value: new Error().stack || ""
						})
					if (t) merge(this, t)
				}
				;(CustomError.prototype = Object.create(Error.prototype)).constructor =
					CustomError
				Object.defineProperty(CustomError.prototype, "name", {
					get: function () {
						return e
					}
				})
				CustomError.prototype.toString = function toString() {
					return this.name + ": " + this.message
				}
				return CustomError
			}
			i.newError = newError
			i.ProtocolError = newError("ProtocolError")
			i.oneOfGetter = function getOneOf(e) {
				var t = {}
				for (var r = 0; r < e.length; ++r) t[e[r]] = 1
				return function () {
					for (var e = Object.keys(this), r = e.length - 1; r > -1; --r)
						if (
							t[e[r]] === 1 &&
							this[e[r]] !== undefined &&
							this[e[r]] !== null
						)
							return e[r]
				}
			}
			i.oneOfSetter = function setOneOf(e) {
				return function (t) {
					for (var r = 0; r < e.length; ++r) if (e[r] !== t) delete this[e[r]]
				}
			}
			i.toJSONOptions = {
				longs: String,
				enums: String,
				bytes: String,
				json: true
			}
			i._configure = function () {
				var e = i.Buffer
				if (!e) {
					i._Buffer_from = i._Buffer_allocUnsafe = null
					return
				}
				i._Buffer_from =
					(e.from !== Uint8Array.from && e.from) ||
					function Buffer_from(t, r) {
						return new e(t, r)
					}
				i._Buffer_allocUnsafe =
					e.allocUnsafe ||
					function Buffer_allocUnsafe(t) {
						return new e(t)
					}
			}
		},
		400: (e, t, r) => {
			"use strict"
			e.exports = Writer
			var i = r(123)
			var n
			var o = i.LongBits,
				s = i.base64,
				u = i.utf8
			function Op(e, t, r) {
				this.fn = e
				this.len = t
				this.next = undefined
				this.val = r
			}
			function noop() {}
			function State(e) {
				this.head = e.head
				this.tail = e.tail
				this.len = e.len
				this.next = e.states
			}
			function Writer() {
				this.len = 0
				this.head = new Op(noop, 0, 0)
				this.tail = this.head
				this.states = null
			}
			var a = function create() {
				return i.Buffer
					? function create_buffer_setup() {
							return (Writer.create = function create_buffer() {
								return new n()
							})()
					  }
					: function create_array() {
							return new Writer()
					  }
			}
			Writer.create = a()
			Writer.alloc = function alloc(e) {
				return new i.Array(e)
			}
			if (i.Array !== Array)
				Writer.alloc = i.pool(Writer.alloc, i.Array.prototype.subarray)
			Writer.prototype._push = function push(e, t, r) {
				this.tail = this.tail.next = new Op(e, t, r)
				this.len += t
				return this
			}
			function writeByte(e, t, r) {
				t[r] = e & 255
			}
			function writeVarint32(e, t, r) {
				while (e > 127) {
					t[r++] = (e & 127) | 128
					e >>>= 7
				}
				t[r] = e
			}
			function VarintOp(e, t) {
				this.len = e
				this.next = undefined
				this.val = t
			}
			VarintOp.prototype = Object.create(Op.prototype)
			VarintOp.prototype.fn = writeVarint32
			Writer.prototype.uint32 = function write_uint32(e) {
				this.len += (this.tail = this.tail.next =
					new VarintOp(
						(e = e >>> 0) < 128
							? 1
							: e < 16384
							? 2
							: e < 2097152
							? 3
							: e < 268435456
							? 4
							: 5,
						e
					)).len
				return this
			}
			Writer.prototype.int32 = function write_int32(e) {
				return e < 0
					? this._push(writeVarint64, 10, o.fromNumber(e))
					: this.uint32(e)
			}
			Writer.prototype.sint32 = function write_sint32(e) {
				return this.uint32(((e << 1) ^ (e >> 31)) >>> 0)
			}
			function writeVarint64(e, t, r) {
				while (e.hi) {
					t[r++] = (e.lo & 127) | 128
					e.lo = ((e.lo >>> 7) | (e.hi << 25)) >>> 0
					e.hi >>>= 7
				}
				while (e.lo > 127) {
					t[r++] = (e.lo & 127) | 128
					e.lo = e.lo >>> 7
				}
				t[r++] = e.lo
			}
			Writer.prototype.uint64 = function write_uint64(e) {
				var t = o.from(e)
				return this._push(writeVarint64, t.length(), t)
			}
			Writer.prototype.int64 = Writer.prototype.uint64
			Writer.prototype.sint64 = function write_sint64(e) {
				var t = o.from(e).zzEncode()
				return this._push(writeVarint64, t.length(), t)
			}
			Writer.prototype.bool = function write_bool(e) {
				return this._push(writeByte, 1, e ? 1 : 0)
			}
			function writeFixed32(e, t, r) {
				t[r] = e & 255
				t[r + 1] = (e >>> 8) & 255
				t[r + 2] = (e >>> 16) & 255
				t[r + 3] = e >>> 24
			}
			Writer.prototype.fixed32 = function write_fixed32(e) {
				return this._push(writeFixed32, 4, e >>> 0)
			}
			Writer.prototype.sfixed32 = Writer.prototype.fixed32
			Writer.prototype.fixed64 = function write_fixed64(e) {
				var t = o.from(e)
				return this._push(writeFixed32, 4, t.lo)._push(writeFixed32, 4, t.hi)
			}
			Writer.prototype.sfixed64 = Writer.prototype.fixed64
			Writer.prototype.float = function write_float(e) {
				return this._push(i.float.writeFloatLE, 4, e)
			}
			Writer.prototype.double = function write_double(e) {
				return this._push(i.float.writeDoubleLE, 8, e)
			}
			var l = i.Array.prototype.set
				? function writeBytes_set(e, t, r) {
						t.set(e, r)
				  }
				: function writeBytes_for(e, t, r) {
						for (var i = 0; i < e.length; ++i) t[r + i] = e[i]
				  }
			Writer.prototype.bytes = function write_bytes(e) {
				var t = e.length >>> 0
				if (!t) return this._push(writeByte, 1, 0)
				if (i.isString(e)) {
					var r = Writer.alloc((t = s.length(e)))
					s.decode(e, r, 0)
					e = r
				}
				return this.uint32(t)._push(l, t, e)
			}
			Writer.prototype.string = function write_string(e) {
				var t = u.length(e)
				return t
					? this.uint32(t)._push(u.write, t, e)
					: this._push(writeByte, 1, 0)
			}
			Writer.prototype.fork = function fork() {
				this.states = new State(this)
				this.head = this.tail = new Op(noop, 0, 0)
				this.len = 0
				return this
			}
			Writer.prototype.reset = function reset() {
				if (this.states) {
					this.head = this.states.head
					this.tail = this.states.tail
					this.len = this.states.len
					this.states = this.states.next
				} else {
					this.head = this.tail = new Op(noop, 0, 0)
					this.len = 0
				}
				return this
			}
			Writer.prototype.ldelim = function ldelim() {
				var e = this.head,
					t = this.tail,
					r = this.len
				this.reset().uint32(r)
				if (r) {
					this.tail.next = e.next
					this.tail = t
					this.len += r
				}
				return this
			}
			Writer.prototype.finish = function finish() {
				var e = this.head.next,
					t = this.constructor.alloc(this.len),
					r = 0
				while (e) {
					e.fn(e.val, t, r)
					r += e.len
					e = e.next
				}
				return t
			}
			Writer._configure = function (e) {
				n = e
				Writer.create = a()
				n._configure()
			}
		},
		47: (e, t, r) => {
			"use strict"
			e.exports = BufferWriter
			var i = r(400)
			;(BufferWriter.prototype = Object.create(i.prototype)).constructor =
				BufferWriter
			var n = r(123)
			function BufferWriter() {
				i.call(this)
			}
			BufferWriter._configure = function () {
				BufferWriter.alloc = n._Buffer_allocUnsafe
				BufferWriter.writeBytesBuffer =
					n.Buffer &&
					n.Buffer.prototype instanceof Uint8Array &&
					n.Buffer.prototype.set.name === "set"
						? function writeBytesBuffer_set(e, t, r) {
								t.set(e, r)
						  }
						: function writeBytesBuffer_copy(e, t, r) {
								if (e.copy) e.copy(t, r, 0, e.length)
								else for (var i = 0; i < e.length; ) t[r++] = e[i++]
						  }
			}
			BufferWriter.prototype.bytes = function write_bytes_buffer(e) {
				if (n.isString(e)) e = n._Buffer_from(e, "base64")
				var t = e.length >>> 0
				this.uint32(t)
				if (t) this._push(BufferWriter.writeBytesBuffer, t, e)
				return this
			}
			function writeStringBuffer(e, t, r) {
				if (e.length < 40) n.utf8.write(e, t, r)
				else if (t.utf8Write) t.utf8Write(e, r)
				else t.write(e, r)
			}
			BufferWriter.prototype.string = function write_string_buffer(e) {
				var t = n.Buffer.byteLength(e)
				this.uint32(t)
				if (t) this._push(writeStringBuffer, t, e)
				return this
			}
			BufferWriter._configure()
		}
	}
	var __webpack_module_cache__ = {}
	function __nccwpck_require__(e) {
		var t = __webpack_module_cache__[e]
		if (t !== undefined) {
			return t.exports
		}
		var r = (__webpack_module_cache__[e] = {
			id: e,
			loaded: false,
			exports: {}
		})
		var i = true
		try {
			__webpack_modules__[e].call(r.exports, r, r.exports, __nccwpck_require__)
			i = false
		} finally {
			if (i) delete __webpack_module_cache__[e]
		}
		r.loaded = true
		return r.exports
	}
	;(() => {
		__nccwpck_require__.nmd = (e) => {
			e.paths = []
			if (!e.children) e.children = []
			return e
		}
	})()
	if (typeof __nccwpck_require__ !== "undefined")
		__nccwpck_require__.ab = __dirname + "/"
	var __webpack_exports__ = __nccwpck_require__(677)
	module.exports = __webpack_exports__
})()
//# sourceMappingURL=protos/http.js.map
