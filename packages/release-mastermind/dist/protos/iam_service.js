/** @format */

require("./sourcemap-register.js")
;(() => {
	var __webpack_modules__ = {
		776: (e) => {
			"use strict"
			e.exports = asPromise
			function asPromise(e, t) {
				var r = new Array(arguments.length - 1),
					o = 0,
					n = 2,
					i = true
				while (n < arguments.length) r[o++] = arguments[n++]
				return new Promise(function executor(n, a) {
					r[o] = function callback(e) {
						if (i) {
							i = false
							if (e) a(e)
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
						if (i) {
							i = false
							a(e)
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
			var o = new Array(64)
			var n = new Array(123)
			for (var i = 0; i < 64; )
				n[
					(o[i] =
						i < 26 ? i + 65 : i < 52 ? i + 71 : i < 62 ? i - 4 : (i - 59) | 43)
				] = i++
			r.encode = function encode(e, t, r) {
				var n = null,
					i = []
				var a = 0,
					s = 0,
					l
				while (t < r) {
					var p = e[t++]
					switch (s) {
						case 0:
							i[a++] = o[p >> 2]
							l = (p & 3) << 4
							s = 1
							break
						case 1:
							i[a++] = o[l | (p >> 4)]
							l = (p & 15) << 2
							s = 2
							break
						case 2:
							i[a++] = o[l | (p >> 6)]
							i[a++] = o[p & 63]
							s = 0
							break
					}
					if (a > 8191) {
						;(n || (n = [])).push(String.fromCharCode.apply(String, i))
						a = 0
					}
				}
				if (s) {
					i[a++] = o[l]
					i[a++] = 61
					if (s === 1) i[a++] = 61
				}
				if (n) {
					if (a) n.push(String.fromCharCode.apply(String, i.slice(0, a)))
					return n.join("")
				}
				return String.fromCharCode.apply(String, i.slice(0, a))
			}
			var a = "invalid encoding"
			r.decode = function decode(e, t, r) {
				var o = r
				var i = 0,
					s
				for (var l = 0; l < e.length; ) {
					var p = e.charCodeAt(l++)
					if (p === 61 && i > 1) break
					if ((p = n[p]) === undefined) throw Error(a)
					switch (i) {
						case 0:
							s = p
							i = 1
							break
						case 1:
							t[r++] = (s << 2) | ((p & 48) >> 4)
							s = p
							i = 2
							break
						case 2:
							t[r++] = ((s & 15) << 4) | ((p & 60) >> 2)
							s = p
							i = 3
							break
						case 3:
							t[r++] = ((s & 3) << 6) | p
							i = 0
							break
					}
				}
				if (i === 1) throw Error(a)
				return r - o
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
						for (var o = 0; o < r.length; )
							if (r[o].fn === t) r.splice(o, 1)
							else ++o
					}
				}
				return this
			}
			EventEmitter.prototype.emit = function emit(e) {
				var t = this._listeners[e]
				if (t) {
					var r = [],
						o = 1
					for (; o < arguments.length; ) r.push(arguments[o++])
					for (o = 0; o < t.length; ) t[o].fn.apply(t[o++].ctx, r)
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
							o = r[3] === 128
						function writeFloat_f32_cpy(e, o, n) {
							t[0] = e
							o[n] = r[0]
							o[n + 1] = r[1]
							o[n + 2] = r[2]
							o[n + 3] = r[3]
						}
						function writeFloat_f32_rev(e, o, n) {
							t[0] = e
							o[n] = r[3]
							o[n + 1] = r[2]
							o[n + 2] = r[1]
							o[n + 3] = r[0]
						}
						e.writeFloatLE = o ? writeFloat_f32_cpy : writeFloat_f32_rev
						e.writeFloatBE = o ? writeFloat_f32_rev : writeFloat_f32_cpy
						function readFloat_f32_cpy(e, o) {
							r[0] = e[o]
							r[1] = e[o + 1]
							r[2] = e[o + 2]
							r[3] = e[o + 3]
							return t[0]
						}
						function readFloat_f32_rev(e, o) {
							r[3] = e[o]
							r[2] = e[o + 1]
							r[1] = e[o + 2]
							r[0] = e[o + 3]
							return t[0]
						}
						e.readFloatLE = o ? readFloat_f32_cpy : readFloat_f32_rev
						e.readFloatBE = o ? readFloat_f32_rev : readFloat_f32_cpy
					})()
				else
					(function () {
						function writeFloat_ieee754(e, t, r, o) {
							var n = t < 0 ? 1 : 0
							if (n) t = -t
							if (t === 0) e(1 / t > 0 ? 0 : 2147483648, r, o)
							else if (isNaN(t)) e(2143289344, r, o)
							else if (t > 34028234663852886e22)
								e(((n << 31) | 2139095040) >>> 0, r, o)
							else if (t < 11754943508222875e-54)
								e(
									((n << 31) | Math.round(t / 1401298464324817e-60)) >>> 0,
									r,
									o
								)
							else {
								var i = Math.floor(Math.log(t) / Math.LN2),
									a = Math.round(t * Math.pow(2, -i) * 8388608) & 8388607
								e(((n << 31) | ((i + 127) << 23) | a) >>> 0, r, o)
							}
						}
						e.writeFloatLE = writeFloat_ieee754.bind(null, writeUintLE)
						e.writeFloatBE = writeFloat_ieee754.bind(null, writeUintBE)
						function readFloat_ieee754(e, t, r) {
							var o = e(t, r),
								n = (o >> 31) * 2 + 1,
								i = (o >>> 23) & 255,
								a = o & 8388607
							return i === 255
								? a
									? NaN
									: n * Infinity
								: i === 0
								? n * 1401298464324817e-60 * a
								: n * Math.pow(2, i - 150) * (a + 8388608)
						}
						e.readFloatLE = readFloat_ieee754.bind(null, readUintLE)
						e.readFloatBE = readFloat_ieee754.bind(null, readUintBE)
					})()
				if (typeof Float64Array !== "undefined")
					(function () {
						var t = new Float64Array([-0]),
							r = new Uint8Array(t.buffer),
							o = r[7] === 128
						function writeDouble_f64_cpy(e, o, n) {
							t[0] = e
							o[n] = r[0]
							o[n + 1] = r[1]
							o[n + 2] = r[2]
							o[n + 3] = r[3]
							o[n + 4] = r[4]
							o[n + 5] = r[5]
							o[n + 6] = r[6]
							o[n + 7] = r[7]
						}
						function writeDouble_f64_rev(e, o, n) {
							t[0] = e
							o[n] = r[7]
							o[n + 1] = r[6]
							o[n + 2] = r[5]
							o[n + 3] = r[4]
							o[n + 4] = r[3]
							o[n + 5] = r[2]
							o[n + 6] = r[1]
							o[n + 7] = r[0]
						}
						e.writeDoubleLE = o ? writeDouble_f64_cpy : writeDouble_f64_rev
						e.writeDoubleBE = o ? writeDouble_f64_rev : writeDouble_f64_cpy
						function readDouble_f64_cpy(e, o) {
							r[0] = e[o]
							r[1] = e[o + 1]
							r[2] = e[o + 2]
							r[3] = e[o + 3]
							r[4] = e[o + 4]
							r[5] = e[o + 5]
							r[6] = e[o + 6]
							r[7] = e[o + 7]
							return t[0]
						}
						function readDouble_f64_rev(e, o) {
							r[7] = e[o]
							r[6] = e[o + 1]
							r[5] = e[o + 2]
							r[4] = e[o + 3]
							r[3] = e[o + 4]
							r[2] = e[o + 5]
							r[1] = e[o + 6]
							r[0] = e[o + 7]
							return t[0]
						}
						e.readDoubleLE = o ? readDouble_f64_cpy : readDouble_f64_rev
						e.readDoubleBE = o ? readDouble_f64_rev : readDouble_f64_cpy
					})()
				else
					(function () {
						function writeDouble_ieee754(e, t, r, o, n, i) {
							var a = o < 0 ? 1 : 0
							if (a) o = -o
							if (o === 0) {
								e(0, n, i + t)
								e(1 / o > 0 ? 0 : 2147483648, n, i + r)
							} else if (isNaN(o)) {
								e(0, n, i + t)
								e(2146959360, n, i + r)
							} else if (o > 17976931348623157e292) {
								e(0, n, i + t)
								e(((a << 31) | 2146435072) >>> 0, n, i + r)
							} else {
								var s
								if (o < 22250738585072014e-324) {
									s = o / 5e-324
									e(s >>> 0, n, i + t)
									e(((a << 31) | (s / 4294967296)) >>> 0, n, i + r)
								} else {
									var l = Math.floor(Math.log(o) / Math.LN2)
									if (l === 1024) l = 1023
									s = o * Math.pow(2, -l)
									e((s * 4503599627370496) >>> 0, n, i + t)
									e(
										((a << 31) |
											((l + 1023) << 20) |
											((s * 1048576) & 1048575)) >>>
											0,
										n,
										i + r
									)
								}
							}
						}
						e.writeDoubleLE = writeDouble_ieee754.bind(null, writeUintLE, 0, 4)
						e.writeDoubleBE = writeDouble_ieee754.bind(null, writeUintBE, 4, 0)
						function readDouble_ieee754(e, t, r, o, n) {
							var i = e(o, n + t),
								a = e(o, n + r)
							var s = (a >> 31) * 2 + 1,
								l = (a >>> 20) & 2047,
								p = 4294967296 * (a & 1048575) + i
							return l === 2047
								? p
									? NaN
									: s * Infinity
								: l === 0
								? s * 5e-324 * p
								: s * Math.pow(2, l - 1075) * (p + 4503599627370496)
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
				var o = r || 8192
				var n = o >>> 1
				var i = null
				var a = o
				return function pool_alloc(r) {
					if (r < 1 || r > n) return e(r)
					if (a + r > o) {
						i = e(o)
						a = 0
					}
					var s = t.call(i, a, (a += r))
					if (a & 7) a = (a | 7) + 1
					return s
				}
			}
		},
		112: (e, t) => {
			"use strict"
			var r = t
			r.length = function utf8_length(e) {
				var t = 0,
					r = 0
				for (var o = 0; o < e.length; ++o) {
					r = e.charCodeAt(o)
					if (r < 128) t += 1
					else if (r < 2048) t += 2
					else if (
						(r & 64512) === 55296 &&
						(e.charCodeAt(o + 1) & 64512) === 56320
					) {
						++o
						t += 4
					} else t += 3
				}
				return t
			}
			r.read = function utf8_read(e, t, r) {
				var o = r - t
				if (o < 1) return ""
				var n = null,
					i = [],
					a = 0,
					s
				while (t < r) {
					s = e[t++]
					if (s < 128) i[a++] = s
					else if (s > 191 && s < 224) i[a++] = ((s & 31) << 6) | (e[t++] & 63)
					else if (s > 239 && s < 365) {
						s =
							(((s & 7) << 18) |
								((e[t++] & 63) << 12) |
								((e[t++] & 63) << 6) |
								(e[t++] & 63)) -
							65536
						i[a++] = 55296 + (s >> 10)
						i[a++] = 56320 + (s & 1023)
					} else
						i[a++] = ((s & 15) << 12) | ((e[t++] & 63) << 6) | (e[t++] & 63)
					if (a > 8191) {
						;(n || (n = [])).push(String.fromCharCode.apply(String, i))
						a = 0
					}
				}
				if (n) {
					if (a) n.push(String.fromCharCode.apply(String, i.slice(0, a)))
					return n.join("")
				}
				return String.fromCharCode.apply(String, i.slice(0, a))
			}
			r.write = function utf8_write(e, t, r) {
				var o = r,
					n,
					i
				for (var a = 0; a < e.length; ++a) {
					n = e.charCodeAt(a)
					if (n < 128) {
						t[r++] = n
					} else if (n < 2048) {
						t[r++] = (n >> 6) | 192
						t[r++] = (n & 63) | 128
					} else if (
						(n & 64512) === 55296 &&
						((i = e.charCodeAt(a + 1)) & 64512) === 56320
					) {
						n = 65536 + ((n & 1023) << 10) + (i & 1023)
						++a
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
				return r - o
			}
		},
		408: function (e, t, r) {
			e = r.nmd(e)
			;(function (t, o) {
				if (typeof define === "function" && define.amd)
					define(["protobufjs/minimal"], o)
				else if (true && e && e.exports) e.exports = o(r(281))
			})(this, function (e) {
				"use strict"
				var t = e.Reader,
					r = e.Writer,
					o = e.util
				var n = e.roots.iam_protos || (e.roots.iam_protos = {})
				n.google = (function () {
					var i = {}
					i.iam = (function () {
						var i = {}
						i.v1 = (function () {
							var i = {}
							i.IAMPolicy = (function () {
								function IAMPolicy(t, r, o) {
									e.rpc.Service.call(this, t, r, o)
								}
								;(IAMPolicy.prototype = Object.create(
									e.rpc.Service.prototype
								)).constructor = IAMPolicy
								IAMPolicy.create = function create(e, t, r) {
									return new this(e, t, r)
								}
								Object.defineProperty(
									(IAMPolicy.prototype.setIamPolicy = function setIamPolicy(
										e,
										t
									) {
										return this.rpcCall(
											setIamPolicy,
											n.google.iam.v1.SetIamPolicyRequest,
											n.google.iam.v1.Policy,
											e,
											t
										)
									}),
									"name",
									{ value: "SetIamPolicy" }
								)
								Object.defineProperty(
									(IAMPolicy.prototype.getIamPolicy = function getIamPolicy(
										e,
										t
									) {
										return this.rpcCall(
											getIamPolicy,
											n.google.iam.v1.GetIamPolicyRequest,
											n.google.iam.v1.Policy,
											e,
											t
										)
									}),
									"name",
									{ value: "GetIamPolicy" }
								)
								Object.defineProperty(
									(IAMPolicy.prototype.testIamPermissions =
										function testIamPermissions(e, t) {
											return this.rpcCall(
												testIamPermissions,
												n.google.iam.v1.TestIamPermissionsRequest,
												n.google.iam.v1.TestIamPermissionsResponse,
												e,
												t
											)
										}),
									"name",
									{ value: "TestIamPermissions" }
								)
								return IAMPolicy
							})()
							i.SetIamPolicyRequest = (function () {
								function SetIamPolicyRequest(e) {
									if (e)
										for (var t = Object.keys(e), r = 0; r < t.length; ++r)
											if (e[t[r]] != null) this[t[r]] = e[t[r]]
								}
								SetIamPolicyRequest.prototype.resource = ""
								SetIamPolicyRequest.prototype.policy = null
								SetIamPolicyRequest.create = function create(e) {
									return new SetIamPolicyRequest(e)
								}
								SetIamPolicyRequest.encode = function encode(e, t) {
									if (!t) t = r.create()
									if (
										e.resource != null &&
										Object.hasOwnProperty.call(e, "resource")
									)
										t.uint32(10).string(e.resource)
									if (
										e.policy != null &&
										Object.hasOwnProperty.call(e, "policy")
									)
										n.google.iam.v1.Policy.encode(
											e.policy,
											t.uint32(18).fork()
										).ldelim()
									return t
								}
								SetIamPolicyRequest.encodeDelimited = function encodeDelimited(
									e,
									t
								) {
									return this.encode(e, t).ldelim()
								}
								SetIamPolicyRequest.decode = function decode(e, r) {
									if (!(e instanceof t)) e = t.create(e)
									var o = r === undefined ? e.len : e.pos + r,
										i = new n.google.iam.v1.SetIamPolicyRequest()
									while (e.pos < o) {
										var a = e.uint32()
										switch (a >>> 3) {
											case 1:
												i.resource = e.string()
												break
											case 2:
												i.policy = n.google.iam.v1.Policy.decode(e, e.uint32())
												break
											default:
												e.skipType(a & 7)
												break
										}
									}
									return i
								}
								SetIamPolicyRequest.decodeDelimited = function decodeDelimited(
									e
								) {
									if (!(e instanceof t)) e = new t(e)
									return this.decode(e, e.uint32())
								}
								SetIamPolicyRequest.verify = function verify(e) {
									if (typeof e !== "object" || e === null)
										return "object expected"
									if (e.resource != null && e.hasOwnProperty("resource"))
										if (!o.isString(e.resource))
											return "resource: string expected"
									if (e.policy != null && e.hasOwnProperty("policy")) {
										var t = n.google.iam.v1.Policy.verify(e.policy)
										if (t) return "policy." + t
									}
									return null
								}
								SetIamPolicyRequest.fromObject = function fromObject(e) {
									if (e instanceof n.google.iam.v1.SetIamPolicyRequest) return e
									var t = new n.google.iam.v1.SetIamPolicyRequest()
									if (e.resource != null) t.resource = String(e.resource)
									if (e.policy != null) {
										if (typeof e.policy !== "object")
											throw TypeError(
												".google.iam.v1.SetIamPolicyRequest.policy: object expected"
											)
										t.policy = n.google.iam.v1.Policy.fromObject(e.policy)
									}
									return t
								}
								SetIamPolicyRequest.toObject = function toObject(e, t) {
									if (!t) t = {}
									var r = {}
									if (t.defaults) {
										r.resource = ""
										r.policy = null
									}
									if (e.resource != null && e.hasOwnProperty("resource"))
										r.resource = e.resource
									if (e.policy != null && e.hasOwnProperty("policy"))
										r.policy = n.google.iam.v1.Policy.toObject(e.policy, t)
									return r
								}
								SetIamPolicyRequest.prototype.toJSON = function toJSON() {
									return this.constructor.toObject(this, e.util.toJSONOptions)
								}
								return SetIamPolicyRequest
							})()
							i.GetIamPolicyRequest = (function () {
								function GetIamPolicyRequest(e) {
									if (e)
										for (var t = Object.keys(e), r = 0; r < t.length; ++r)
											if (e[t[r]] != null) this[t[r]] = e[t[r]]
								}
								GetIamPolicyRequest.prototype.resource = ""
								GetIamPolicyRequest.prototype.options = null
								GetIamPolicyRequest.create = function create(e) {
									return new GetIamPolicyRequest(e)
								}
								GetIamPolicyRequest.encode = function encode(e, t) {
									if (!t) t = r.create()
									if (
										e.resource != null &&
										Object.hasOwnProperty.call(e, "resource")
									)
										t.uint32(10).string(e.resource)
									if (
										e.options != null &&
										Object.hasOwnProperty.call(e, "options")
									)
										n.google.iam.v1.GetPolicyOptions.encode(
											e.options,
											t.uint32(18).fork()
										).ldelim()
									return t
								}
								GetIamPolicyRequest.encodeDelimited = function encodeDelimited(
									e,
									t
								) {
									return this.encode(e, t).ldelim()
								}
								GetIamPolicyRequest.decode = function decode(e, r) {
									if (!(e instanceof t)) e = t.create(e)
									var o = r === undefined ? e.len : e.pos + r,
										i = new n.google.iam.v1.GetIamPolicyRequest()
									while (e.pos < o) {
										var a = e.uint32()
										switch (a >>> 3) {
											case 1:
												i.resource = e.string()
												break
											case 2:
												i.options = n.google.iam.v1.GetPolicyOptions.decode(
													e,
													e.uint32()
												)
												break
											default:
												e.skipType(a & 7)
												break
										}
									}
									return i
								}
								GetIamPolicyRequest.decodeDelimited = function decodeDelimited(
									e
								) {
									if (!(e instanceof t)) e = new t(e)
									return this.decode(e, e.uint32())
								}
								GetIamPolicyRequest.verify = function verify(e) {
									if (typeof e !== "object" || e === null)
										return "object expected"
									if (e.resource != null && e.hasOwnProperty("resource"))
										if (!o.isString(e.resource))
											return "resource: string expected"
									if (e.options != null && e.hasOwnProperty("options")) {
										var t = n.google.iam.v1.GetPolicyOptions.verify(e.options)
										if (t) return "options." + t
									}
									return null
								}
								GetIamPolicyRequest.fromObject = function fromObject(e) {
									if (e instanceof n.google.iam.v1.GetIamPolicyRequest) return e
									var t = new n.google.iam.v1.GetIamPolicyRequest()
									if (e.resource != null) t.resource = String(e.resource)
									if (e.options != null) {
										if (typeof e.options !== "object")
											throw TypeError(
												".google.iam.v1.GetIamPolicyRequest.options: object expected"
											)
										t.options = n.google.iam.v1.GetPolicyOptions.fromObject(
											e.options
										)
									}
									return t
								}
								GetIamPolicyRequest.toObject = function toObject(e, t) {
									if (!t) t = {}
									var r = {}
									if (t.defaults) {
										r.resource = ""
										r.options = null
									}
									if (e.resource != null && e.hasOwnProperty("resource"))
										r.resource = e.resource
									if (e.options != null && e.hasOwnProperty("options"))
										r.options = n.google.iam.v1.GetPolicyOptions.toObject(
											e.options,
											t
										)
									return r
								}
								GetIamPolicyRequest.prototype.toJSON = function toJSON() {
									return this.constructor.toObject(this, e.util.toJSONOptions)
								}
								return GetIamPolicyRequest
							})()
							i.TestIamPermissionsRequest = (function () {
								function TestIamPermissionsRequest(e) {
									this.permissions = []
									if (e)
										for (var t = Object.keys(e), r = 0; r < t.length; ++r)
											if (e[t[r]] != null) this[t[r]] = e[t[r]]
								}
								TestIamPermissionsRequest.prototype.resource = ""
								TestIamPermissionsRequest.prototype.permissions = o.emptyArray
								TestIamPermissionsRequest.create = function create(e) {
									return new TestIamPermissionsRequest(e)
								}
								TestIamPermissionsRequest.encode = function encode(e, t) {
									if (!t) t = r.create()
									if (
										e.resource != null &&
										Object.hasOwnProperty.call(e, "resource")
									)
										t.uint32(10).string(e.resource)
									if (e.permissions != null && e.permissions.length)
										for (var o = 0; o < e.permissions.length; ++o)
											t.uint32(18).string(e.permissions[o])
									return t
								}
								TestIamPermissionsRequest.encodeDelimited =
									function encodeDelimited(e, t) {
										return this.encode(e, t).ldelim()
									}
								TestIamPermissionsRequest.decode = function decode(e, r) {
									if (!(e instanceof t)) e = t.create(e)
									var o = r === undefined ? e.len : e.pos + r,
										i = new n.google.iam.v1.TestIamPermissionsRequest()
									while (e.pos < o) {
										var a = e.uint32()
										switch (a >>> 3) {
											case 1:
												i.resource = e.string()
												break
											case 2:
												if (!(i.permissions && i.permissions.length))
													i.permissions = []
												i.permissions.push(e.string())
												break
											default:
												e.skipType(a & 7)
												break
										}
									}
									return i
								}
								TestIamPermissionsRequest.decodeDelimited =
									function decodeDelimited(e) {
										if (!(e instanceof t)) e = new t(e)
										return this.decode(e, e.uint32())
									}
								TestIamPermissionsRequest.verify = function verify(e) {
									if (typeof e !== "object" || e === null)
										return "object expected"
									if (e.resource != null && e.hasOwnProperty("resource"))
										if (!o.isString(e.resource))
											return "resource: string expected"
									if (
										e.permissions != null &&
										e.hasOwnProperty("permissions")
									) {
										if (!Array.isArray(e.permissions))
											return "permissions: array expected"
										for (var t = 0; t < e.permissions.length; ++t)
											if (!o.isString(e.permissions[t]))
												return "permissions: string[] expected"
									}
									return null
								}
								TestIamPermissionsRequest.fromObject = function fromObject(e) {
									if (e instanceof n.google.iam.v1.TestIamPermissionsRequest)
										return e
									var t = new n.google.iam.v1.TestIamPermissionsRequest()
									if (e.resource != null) t.resource = String(e.resource)
									if (e.permissions) {
										if (!Array.isArray(e.permissions))
											throw TypeError(
												".google.iam.v1.TestIamPermissionsRequest.permissions: array expected"
											)
										t.permissions = []
										for (var r = 0; r < e.permissions.length; ++r)
											t.permissions[r] = String(e.permissions[r])
									}
									return t
								}
								TestIamPermissionsRequest.toObject = function toObject(e, t) {
									if (!t) t = {}
									var r = {}
									if (t.arrays || t.defaults) r.permissions = []
									if (t.defaults) r.resource = ""
									if (e.resource != null && e.hasOwnProperty("resource"))
										r.resource = e.resource
									if (e.permissions && e.permissions.length) {
										r.permissions = []
										for (var o = 0; o < e.permissions.length; ++o)
											r.permissions[o] = e.permissions[o]
									}
									return r
								}
								TestIamPermissionsRequest.prototype.toJSON = function toJSON() {
									return this.constructor.toObject(this, e.util.toJSONOptions)
								}
								return TestIamPermissionsRequest
							})()
							i.TestIamPermissionsResponse = (function () {
								function TestIamPermissionsResponse(e) {
									this.permissions = []
									if (e)
										for (var t = Object.keys(e), r = 0; r < t.length; ++r)
											if (e[t[r]] != null) this[t[r]] = e[t[r]]
								}
								TestIamPermissionsResponse.prototype.permissions = o.emptyArray
								TestIamPermissionsResponse.create = function create(e) {
									return new TestIamPermissionsResponse(e)
								}
								TestIamPermissionsResponse.encode = function encode(e, t) {
									if (!t) t = r.create()
									if (e.permissions != null && e.permissions.length)
										for (var o = 0; o < e.permissions.length; ++o)
											t.uint32(10).string(e.permissions[o])
									return t
								}
								TestIamPermissionsResponse.encodeDelimited =
									function encodeDelimited(e, t) {
										return this.encode(e, t).ldelim()
									}
								TestIamPermissionsResponse.decode = function decode(e, r) {
									if (!(e instanceof t)) e = t.create(e)
									var o = r === undefined ? e.len : e.pos + r,
										i = new n.google.iam.v1.TestIamPermissionsResponse()
									while (e.pos < o) {
										var a = e.uint32()
										switch (a >>> 3) {
											case 1:
												if (!(i.permissions && i.permissions.length))
													i.permissions = []
												i.permissions.push(e.string())
												break
											default:
												e.skipType(a & 7)
												break
										}
									}
									return i
								}
								TestIamPermissionsResponse.decodeDelimited =
									function decodeDelimited(e) {
										if (!(e instanceof t)) e = new t(e)
										return this.decode(e, e.uint32())
									}
								TestIamPermissionsResponse.verify = function verify(e) {
									if (typeof e !== "object" || e === null)
										return "object expected"
									if (
										e.permissions != null &&
										e.hasOwnProperty("permissions")
									) {
										if (!Array.isArray(e.permissions))
											return "permissions: array expected"
										for (var t = 0; t < e.permissions.length; ++t)
											if (!o.isString(e.permissions[t]))
												return "permissions: string[] expected"
									}
									return null
								}
								TestIamPermissionsResponse.fromObject = function fromObject(e) {
									if (e instanceof n.google.iam.v1.TestIamPermissionsResponse)
										return e
									var t = new n.google.iam.v1.TestIamPermissionsResponse()
									if (e.permissions) {
										if (!Array.isArray(e.permissions))
											throw TypeError(
												".google.iam.v1.TestIamPermissionsResponse.permissions: array expected"
											)
										t.permissions = []
										for (var r = 0; r < e.permissions.length; ++r)
											t.permissions[r] = String(e.permissions[r])
									}
									return t
								}
								TestIamPermissionsResponse.toObject = function toObject(e, t) {
									if (!t) t = {}
									var r = {}
									if (t.arrays || t.defaults) r.permissions = []
									if (e.permissions && e.permissions.length) {
										r.permissions = []
										for (var o = 0; o < e.permissions.length; ++o)
											r.permissions[o] = e.permissions[o]
									}
									return r
								}
								TestIamPermissionsResponse.prototype.toJSON =
									function toJSON() {
										return this.constructor.toObject(this, e.util.toJSONOptions)
									}
								return TestIamPermissionsResponse
							})()
							i.GetPolicyOptions = (function () {
								function GetPolicyOptions(e) {
									if (e)
										for (var t = Object.keys(e), r = 0; r < t.length; ++r)
											if (e[t[r]] != null) this[t[r]] = e[t[r]]
								}
								GetPolicyOptions.prototype.requestedPolicyVersion = 0
								GetPolicyOptions.create = function create(e) {
									return new GetPolicyOptions(e)
								}
								GetPolicyOptions.encode = function encode(e, t) {
									if (!t) t = r.create()
									if (
										e.requestedPolicyVersion != null &&
										Object.hasOwnProperty.call(e, "requestedPolicyVersion")
									)
										t.uint32(8).int32(e.requestedPolicyVersion)
									return t
								}
								GetPolicyOptions.encodeDelimited = function encodeDelimited(
									e,
									t
								) {
									return this.encode(e, t).ldelim()
								}
								GetPolicyOptions.decode = function decode(e, r) {
									if (!(e instanceof t)) e = t.create(e)
									var o = r === undefined ? e.len : e.pos + r,
										i = new n.google.iam.v1.GetPolicyOptions()
									while (e.pos < o) {
										var a = e.uint32()
										switch (a >>> 3) {
											case 1:
												i.requestedPolicyVersion = e.int32()
												break
											default:
												e.skipType(a & 7)
												break
										}
									}
									return i
								}
								GetPolicyOptions.decodeDelimited = function decodeDelimited(e) {
									if (!(e instanceof t)) e = new t(e)
									return this.decode(e, e.uint32())
								}
								GetPolicyOptions.verify = function verify(e) {
									if (typeof e !== "object" || e === null)
										return "object expected"
									if (
										e.requestedPolicyVersion != null &&
										e.hasOwnProperty("requestedPolicyVersion")
									)
										if (!o.isInteger(e.requestedPolicyVersion))
											return "requestedPolicyVersion: integer expected"
									return null
								}
								GetPolicyOptions.fromObject = function fromObject(e) {
									if (e instanceof n.google.iam.v1.GetPolicyOptions) return e
									var t = new n.google.iam.v1.GetPolicyOptions()
									if (e.requestedPolicyVersion != null)
										t.requestedPolicyVersion = e.requestedPolicyVersion | 0
									return t
								}
								GetPolicyOptions.toObject = function toObject(e, t) {
									if (!t) t = {}
									var r = {}
									if (t.defaults) r.requestedPolicyVersion = 0
									if (
										e.requestedPolicyVersion != null &&
										e.hasOwnProperty("requestedPolicyVersion")
									)
										r.requestedPolicyVersion = e.requestedPolicyVersion
									return r
								}
								GetPolicyOptions.prototype.toJSON = function toJSON() {
									return this.constructor.toObject(this, e.util.toJSONOptions)
								}
								return GetPolicyOptions
							})()
							i.Policy = (function () {
								function Policy(e) {
									this.bindings = []
									if (e)
										for (var t = Object.keys(e), r = 0; r < t.length; ++r)
											if (e[t[r]] != null) this[t[r]] = e[t[r]]
								}
								Policy.prototype.version = 0
								Policy.prototype.bindings = o.emptyArray
								Policy.prototype.etag = o.newBuffer([])
								Policy.create = function create(e) {
									return new Policy(e)
								}
								Policy.encode = function encode(e, t) {
									if (!t) t = r.create()
									if (
										e.version != null &&
										Object.hasOwnProperty.call(e, "version")
									)
										t.uint32(8).int32(e.version)
									if (e.etag != null && Object.hasOwnProperty.call(e, "etag"))
										t.uint32(26).bytes(e.etag)
									if (e.bindings != null && e.bindings.length)
										for (var o = 0; o < e.bindings.length; ++o)
											n.google.iam.v1.Binding.encode(
												e.bindings[o],
												t.uint32(34).fork()
											).ldelim()
									return t
								}
								Policy.encodeDelimited = function encodeDelimited(e, t) {
									return this.encode(e, t).ldelim()
								}
								Policy.decode = function decode(e, r) {
									if (!(e instanceof t)) e = t.create(e)
									var o = r === undefined ? e.len : e.pos + r,
										i = new n.google.iam.v1.Policy()
									while (e.pos < o) {
										var a = e.uint32()
										switch (a >>> 3) {
											case 1:
												i.version = e.int32()
												break
											case 4:
												if (!(i.bindings && i.bindings.length)) i.bindings = []
												i.bindings.push(
													n.google.iam.v1.Binding.decode(e, e.uint32())
												)
												break
											case 3:
												i.etag = e.bytes()
												break
											default:
												e.skipType(a & 7)
												break
										}
									}
									return i
								}
								Policy.decodeDelimited = function decodeDelimited(e) {
									if (!(e instanceof t)) e = new t(e)
									return this.decode(e, e.uint32())
								}
								Policy.verify = function verify(e) {
									if (typeof e !== "object" || e === null)
										return "object expected"
									if (e.version != null && e.hasOwnProperty("version"))
										if (!o.isInteger(e.version))
											return "version: integer expected"
									if (e.bindings != null && e.hasOwnProperty("bindings")) {
										if (!Array.isArray(e.bindings))
											return "bindings: array expected"
										for (var t = 0; t < e.bindings.length; ++t) {
											var r = n.google.iam.v1.Binding.verify(e.bindings[t])
											if (r) return "bindings." + r
										}
									}
									if (e.etag != null && e.hasOwnProperty("etag"))
										if (
											!(
												(e.etag && typeof e.etag.length === "number") ||
												o.isString(e.etag)
											)
										)
											return "etag: buffer expected"
									return null
								}
								Policy.fromObject = function fromObject(e) {
									if (e instanceof n.google.iam.v1.Policy) return e
									var t = new n.google.iam.v1.Policy()
									if (e.version != null) t.version = e.version | 0
									if (e.bindings) {
										if (!Array.isArray(e.bindings))
											throw TypeError(
												".google.iam.v1.Policy.bindings: array expected"
											)
										t.bindings = []
										for (var r = 0; r < e.bindings.length; ++r) {
											if (typeof e.bindings[r] !== "object")
												throw TypeError(
													".google.iam.v1.Policy.bindings: object expected"
												)
											t.bindings[r] = n.google.iam.v1.Binding.fromObject(
												e.bindings[r]
											)
										}
									}
									if (e.etag != null)
										if (typeof e.etag === "string")
											o.base64.decode(
												e.etag,
												(t.etag = o.newBuffer(o.base64.length(e.etag))),
												0
											)
										else if (e.etag.length) t.etag = e.etag
									return t
								}
								Policy.toObject = function toObject(e, t) {
									if (!t) t = {}
									var r = {}
									if (t.arrays || t.defaults) r.bindings = []
									if (t.defaults) {
										r.version = 0
										if (t.bytes === String) r.etag = ""
										else {
											r.etag = []
											if (t.bytes !== Array) r.etag = o.newBuffer(r.etag)
										}
									}
									if (e.version != null && e.hasOwnProperty("version"))
										r.version = e.version
									if (e.etag != null && e.hasOwnProperty("etag"))
										r.etag =
											t.bytes === String
												? o.base64.encode(e.etag, 0, e.etag.length)
												: t.bytes === Array
												? Array.prototype.slice.call(e.etag)
												: e.etag
									if (e.bindings && e.bindings.length) {
										r.bindings = []
										for (var i = 0; i < e.bindings.length; ++i)
											r.bindings[i] = n.google.iam.v1.Binding.toObject(
												e.bindings[i],
												t
											)
									}
									return r
								}
								Policy.prototype.toJSON = function toJSON() {
									return this.constructor.toObject(this, e.util.toJSONOptions)
								}
								return Policy
							})()
							i.Binding = (function () {
								function Binding(e) {
									this.members = []
									if (e)
										for (var t = Object.keys(e), r = 0; r < t.length; ++r)
											if (e[t[r]] != null) this[t[r]] = e[t[r]]
								}
								Binding.prototype.role = ""
								Binding.prototype.members = o.emptyArray
								Binding.prototype.condition = null
								Binding.create = function create(e) {
									return new Binding(e)
								}
								Binding.encode = function encode(e, t) {
									if (!t) t = r.create()
									if (e.role != null && Object.hasOwnProperty.call(e, "role"))
										t.uint32(10).string(e.role)
									if (e.members != null && e.members.length)
										for (var o = 0; o < e.members.length; ++o)
											t.uint32(18).string(e.members[o])
									if (
										e.condition != null &&
										Object.hasOwnProperty.call(e, "condition")
									)
										n.google.type.Expr.encode(
											e.condition,
											t.uint32(26).fork()
										).ldelim()
									return t
								}
								Binding.encodeDelimited = function encodeDelimited(e, t) {
									return this.encode(e, t).ldelim()
								}
								Binding.decode = function decode(e, r) {
									if (!(e instanceof t)) e = t.create(e)
									var o = r === undefined ? e.len : e.pos + r,
										i = new n.google.iam.v1.Binding()
									while (e.pos < o) {
										var a = e.uint32()
										switch (a >>> 3) {
											case 1:
												i.role = e.string()
												break
											case 2:
												if (!(i.members && i.members.length)) i.members = []
												i.members.push(e.string())
												break
											case 3:
												i.condition = n.google.type.Expr.decode(e, e.uint32())
												break
											default:
												e.skipType(a & 7)
												break
										}
									}
									return i
								}
								Binding.decodeDelimited = function decodeDelimited(e) {
									if (!(e instanceof t)) e = new t(e)
									return this.decode(e, e.uint32())
								}
								Binding.verify = function verify(e) {
									if (typeof e !== "object" || e === null)
										return "object expected"
									if (e.role != null && e.hasOwnProperty("role"))
										if (!o.isString(e.role)) return "role: string expected"
									if (e.members != null && e.hasOwnProperty("members")) {
										if (!Array.isArray(e.members))
											return "members: array expected"
										for (var t = 0; t < e.members.length; ++t)
											if (!o.isString(e.members[t]))
												return "members: string[] expected"
									}
									if (e.condition != null && e.hasOwnProperty("condition")) {
										var r = n.google.type.Expr.verify(e.condition)
										if (r) return "condition." + r
									}
									return null
								}
								Binding.fromObject = function fromObject(e) {
									if (e instanceof n.google.iam.v1.Binding) return e
									var t = new n.google.iam.v1.Binding()
									if (e.role != null) t.role = String(e.role)
									if (e.members) {
										if (!Array.isArray(e.members))
											throw TypeError(
												".google.iam.v1.Binding.members: array expected"
											)
										t.members = []
										for (var r = 0; r < e.members.length; ++r)
											t.members[r] = String(e.members[r])
									}
									if (e.condition != null) {
										if (typeof e.condition !== "object")
											throw TypeError(
												".google.iam.v1.Binding.condition: object expected"
											)
										t.condition = n.google.type.Expr.fromObject(e.condition)
									}
									return t
								}
								Binding.toObject = function toObject(e, t) {
									if (!t) t = {}
									var r = {}
									if (t.arrays || t.defaults) r.members = []
									if (t.defaults) {
										r.role = ""
										r.condition = null
									}
									if (e.role != null && e.hasOwnProperty("role"))
										r.role = e.role
									if (e.members && e.members.length) {
										r.members = []
										for (var o = 0; o < e.members.length; ++o)
											r.members[o] = e.members[o]
									}
									if (e.condition != null && e.hasOwnProperty("condition"))
										r.condition = n.google.type.Expr.toObject(e.condition, t)
									return r
								}
								Binding.prototype.toJSON = function toJSON() {
									return this.constructor.toObject(this, e.util.toJSONOptions)
								}
								return Binding
							})()
							i.PolicyDelta = (function () {
								function PolicyDelta(e) {
									this.bindingDeltas = []
									this.auditConfigDeltas = []
									if (e)
										for (var t = Object.keys(e), r = 0; r < t.length; ++r)
											if (e[t[r]] != null) this[t[r]] = e[t[r]]
								}
								PolicyDelta.prototype.bindingDeltas = o.emptyArray
								PolicyDelta.prototype.auditConfigDeltas = o.emptyArray
								PolicyDelta.create = function create(e) {
									return new PolicyDelta(e)
								}
								PolicyDelta.encode = function encode(e, t) {
									if (!t) t = r.create()
									if (e.bindingDeltas != null && e.bindingDeltas.length)
										for (var o = 0; o < e.bindingDeltas.length; ++o)
											n.google.iam.v1.BindingDelta.encode(
												e.bindingDeltas[o],
												t.uint32(10).fork()
											).ldelim()
									if (e.auditConfigDeltas != null && e.auditConfigDeltas.length)
										for (var o = 0; o < e.auditConfigDeltas.length; ++o)
											n.google.iam.v1.AuditConfigDelta.encode(
												e.auditConfigDeltas[o],
												t.uint32(18).fork()
											).ldelim()
									return t
								}
								PolicyDelta.encodeDelimited = function encodeDelimited(e, t) {
									return this.encode(e, t).ldelim()
								}
								PolicyDelta.decode = function decode(e, r) {
									if (!(e instanceof t)) e = t.create(e)
									var o = r === undefined ? e.len : e.pos + r,
										i = new n.google.iam.v1.PolicyDelta()
									while (e.pos < o) {
										var a = e.uint32()
										switch (a >>> 3) {
											case 1:
												if (!(i.bindingDeltas && i.bindingDeltas.length))
													i.bindingDeltas = []
												i.bindingDeltas.push(
													n.google.iam.v1.BindingDelta.decode(e, e.uint32())
												)
												break
											case 2:
												if (
													!(i.auditConfigDeltas && i.auditConfigDeltas.length)
												)
													i.auditConfigDeltas = []
												i.auditConfigDeltas.push(
													n.google.iam.v1.AuditConfigDelta.decode(e, e.uint32())
												)
												break
											default:
												e.skipType(a & 7)
												break
										}
									}
									return i
								}
								PolicyDelta.decodeDelimited = function decodeDelimited(e) {
									if (!(e instanceof t)) e = new t(e)
									return this.decode(e, e.uint32())
								}
								PolicyDelta.verify = function verify(e) {
									if (typeof e !== "object" || e === null)
										return "object expected"
									if (
										e.bindingDeltas != null &&
										e.hasOwnProperty("bindingDeltas")
									) {
										if (!Array.isArray(e.bindingDeltas))
											return "bindingDeltas: array expected"
										for (var t = 0; t < e.bindingDeltas.length; ++t) {
											var r = n.google.iam.v1.BindingDelta.verify(
												e.bindingDeltas[t]
											)
											if (r) return "bindingDeltas." + r
										}
									}
									if (
										e.auditConfigDeltas != null &&
										e.hasOwnProperty("auditConfigDeltas")
									) {
										if (!Array.isArray(e.auditConfigDeltas))
											return "auditConfigDeltas: array expected"
										for (var t = 0; t < e.auditConfigDeltas.length; ++t) {
											var r = n.google.iam.v1.AuditConfigDelta.verify(
												e.auditConfigDeltas[t]
											)
											if (r) return "auditConfigDeltas." + r
										}
									}
									return null
								}
								PolicyDelta.fromObject = function fromObject(e) {
									if (e instanceof n.google.iam.v1.PolicyDelta) return e
									var t = new n.google.iam.v1.PolicyDelta()
									if (e.bindingDeltas) {
										if (!Array.isArray(e.bindingDeltas))
											throw TypeError(
												".google.iam.v1.PolicyDelta.bindingDeltas: array expected"
											)
										t.bindingDeltas = []
										for (var r = 0; r < e.bindingDeltas.length; ++r) {
											if (typeof e.bindingDeltas[r] !== "object")
												throw TypeError(
													".google.iam.v1.PolicyDelta.bindingDeltas: object expected"
												)
											t.bindingDeltas[r] =
												n.google.iam.v1.BindingDelta.fromObject(
													e.bindingDeltas[r]
												)
										}
									}
									if (e.auditConfigDeltas) {
										if (!Array.isArray(e.auditConfigDeltas))
											throw TypeError(
												".google.iam.v1.PolicyDelta.auditConfigDeltas: array expected"
											)
										t.auditConfigDeltas = []
										for (var r = 0; r < e.auditConfigDeltas.length; ++r) {
											if (typeof e.auditConfigDeltas[r] !== "object")
												throw TypeError(
													".google.iam.v1.PolicyDelta.auditConfigDeltas: object expected"
												)
											t.auditConfigDeltas[r] =
												n.google.iam.v1.AuditConfigDelta.fromObject(
													e.auditConfigDeltas[r]
												)
										}
									}
									return t
								}
								PolicyDelta.toObject = function toObject(e, t) {
									if (!t) t = {}
									var r = {}
									if (t.arrays || t.defaults) {
										r.bindingDeltas = []
										r.auditConfigDeltas = []
									}
									if (e.bindingDeltas && e.bindingDeltas.length) {
										r.bindingDeltas = []
										for (var o = 0; o < e.bindingDeltas.length; ++o)
											r.bindingDeltas[o] =
												n.google.iam.v1.BindingDelta.toObject(
													e.bindingDeltas[o],
													t
												)
									}
									if (e.auditConfigDeltas && e.auditConfigDeltas.length) {
										r.auditConfigDeltas = []
										for (var o = 0; o < e.auditConfigDeltas.length; ++o)
											r.auditConfigDeltas[o] =
												n.google.iam.v1.AuditConfigDelta.toObject(
													e.auditConfigDeltas[o],
													t
												)
									}
									return r
								}
								PolicyDelta.prototype.toJSON = function toJSON() {
									return this.constructor.toObject(this, e.util.toJSONOptions)
								}
								return PolicyDelta
							})()
							i.BindingDelta = (function () {
								function BindingDelta(e) {
									if (e)
										for (var t = Object.keys(e), r = 0; r < t.length; ++r)
											if (e[t[r]] != null) this[t[r]] = e[t[r]]
								}
								BindingDelta.prototype.action = 0
								BindingDelta.prototype.role = ""
								BindingDelta.prototype.member = ""
								BindingDelta.prototype.condition = null
								BindingDelta.create = function create(e) {
									return new BindingDelta(e)
								}
								BindingDelta.encode = function encode(e, t) {
									if (!t) t = r.create()
									if (
										e.action != null &&
										Object.hasOwnProperty.call(e, "action")
									)
										t.uint32(8).int32(e.action)
									if (e.role != null && Object.hasOwnProperty.call(e, "role"))
										t.uint32(18).string(e.role)
									if (
										e.member != null &&
										Object.hasOwnProperty.call(e, "member")
									)
										t.uint32(26).string(e.member)
									if (
										e.condition != null &&
										Object.hasOwnProperty.call(e, "condition")
									)
										n.google.type.Expr.encode(
											e.condition,
											t.uint32(34).fork()
										).ldelim()
									return t
								}
								BindingDelta.encodeDelimited = function encodeDelimited(e, t) {
									return this.encode(e, t).ldelim()
								}
								BindingDelta.decode = function decode(e, r) {
									if (!(e instanceof t)) e = t.create(e)
									var o = r === undefined ? e.len : e.pos + r,
										i = new n.google.iam.v1.BindingDelta()
									while (e.pos < o) {
										var a = e.uint32()
										switch (a >>> 3) {
											case 1:
												i.action = e.int32()
												break
											case 2:
												i.role = e.string()
												break
											case 3:
												i.member = e.string()
												break
											case 4:
												i.condition = n.google.type.Expr.decode(e, e.uint32())
												break
											default:
												e.skipType(a & 7)
												break
										}
									}
									return i
								}
								BindingDelta.decodeDelimited = function decodeDelimited(e) {
									if (!(e instanceof t)) e = new t(e)
									return this.decode(e, e.uint32())
								}
								BindingDelta.verify = function verify(e) {
									if (typeof e !== "object" || e === null)
										return "object expected"
									if (e.action != null && e.hasOwnProperty("action"))
										switch (e.action) {
											default:
												return "action: enum value expected"
											case 0:
											case 1:
											case 2:
												break
										}
									if (e.role != null && e.hasOwnProperty("role"))
										if (!o.isString(e.role)) return "role: string expected"
									if (e.member != null && e.hasOwnProperty("member"))
										if (!o.isString(e.member)) return "member: string expected"
									if (e.condition != null && e.hasOwnProperty("condition")) {
										var t = n.google.type.Expr.verify(e.condition)
										if (t) return "condition." + t
									}
									return null
								}
								BindingDelta.fromObject = function fromObject(e) {
									if (e instanceof n.google.iam.v1.BindingDelta) return e
									var t = new n.google.iam.v1.BindingDelta()
									switch (e.action) {
										case "ACTION_UNSPECIFIED":
										case 0:
											t.action = 0
											break
										case "ADD":
										case 1:
											t.action = 1
											break
										case "REMOVE":
										case 2:
											t.action = 2
											break
									}
									if (e.role != null) t.role = String(e.role)
									if (e.member != null) t.member = String(e.member)
									if (e.condition != null) {
										if (typeof e.condition !== "object")
											throw TypeError(
												".google.iam.v1.BindingDelta.condition: object expected"
											)
										t.condition = n.google.type.Expr.fromObject(e.condition)
									}
									return t
								}
								BindingDelta.toObject = function toObject(e, t) {
									if (!t) t = {}
									var r = {}
									if (t.defaults) {
										r.action = t.enums === String ? "ACTION_UNSPECIFIED" : 0
										r.role = ""
										r.member = ""
										r.condition = null
									}
									if (e.action != null && e.hasOwnProperty("action"))
										r.action =
											t.enums === String
												? n.google.iam.v1.BindingDelta.Action[e.action]
												: e.action
									if (e.role != null && e.hasOwnProperty("role"))
										r.role = e.role
									if (e.member != null && e.hasOwnProperty("member"))
										r.member = e.member
									if (e.condition != null && e.hasOwnProperty("condition"))
										r.condition = n.google.type.Expr.toObject(e.condition, t)
									return r
								}
								BindingDelta.prototype.toJSON = function toJSON() {
									return this.constructor.toObject(this, e.util.toJSONOptions)
								}
								BindingDelta.Action = (function () {
									var e = {},
										t = Object.create(e)
									t[(e[0] = "ACTION_UNSPECIFIED")] = 0
									t[(e[1] = "ADD")] = 1
									t[(e[2] = "REMOVE")] = 2
									return t
								})()
								return BindingDelta
							})()
							i.AuditConfigDelta = (function () {
								function AuditConfigDelta(e) {
									if (e)
										for (var t = Object.keys(e), r = 0; r < t.length; ++r)
											if (e[t[r]] != null) this[t[r]] = e[t[r]]
								}
								AuditConfigDelta.prototype.action = 0
								AuditConfigDelta.prototype.service = ""
								AuditConfigDelta.prototype.exemptedMember = ""
								AuditConfigDelta.prototype.logType = ""
								AuditConfigDelta.create = function create(e) {
									return new AuditConfigDelta(e)
								}
								AuditConfigDelta.encode = function encode(e, t) {
									if (!t) t = r.create()
									if (
										e.action != null &&
										Object.hasOwnProperty.call(e, "action")
									)
										t.uint32(8).int32(e.action)
									if (
										e.service != null &&
										Object.hasOwnProperty.call(e, "service")
									)
										t.uint32(18).string(e.service)
									if (
										e.exemptedMember != null &&
										Object.hasOwnProperty.call(e, "exemptedMember")
									)
										t.uint32(26).string(e.exemptedMember)
									if (
										e.logType != null &&
										Object.hasOwnProperty.call(e, "logType")
									)
										t.uint32(34).string(e.logType)
									return t
								}
								AuditConfigDelta.encodeDelimited = function encodeDelimited(
									e,
									t
								) {
									return this.encode(e, t).ldelim()
								}
								AuditConfigDelta.decode = function decode(e, r) {
									if (!(e instanceof t)) e = t.create(e)
									var o = r === undefined ? e.len : e.pos + r,
										i = new n.google.iam.v1.AuditConfigDelta()
									while (e.pos < o) {
										var a = e.uint32()
										switch (a >>> 3) {
											case 1:
												i.action = e.int32()
												break
											case 2:
												i.service = e.string()
												break
											case 3:
												i.exemptedMember = e.string()
												break
											case 4:
												i.logType = e.string()
												break
											default:
												e.skipType(a & 7)
												break
										}
									}
									return i
								}
								AuditConfigDelta.decodeDelimited = function decodeDelimited(e) {
									if (!(e instanceof t)) e = new t(e)
									return this.decode(e, e.uint32())
								}
								AuditConfigDelta.verify = function verify(e) {
									if (typeof e !== "object" || e === null)
										return "object expected"
									if (e.action != null && e.hasOwnProperty("action"))
										switch (e.action) {
											default:
												return "action: enum value expected"
											case 0:
											case 1:
											case 2:
												break
										}
									if (e.service != null && e.hasOwnProperty("service"))
										if (!o.isString(e.service))
											return "service: string expected"
									if (
										e.exemptedMember != null &&
										e.hasOwnProperty("exemptedMember")
									)
										if (!o.isString(e.exemptedMember))
											return "exemptedMember: string expected"
									if (e.logType != null && e.hasOwnProperty("logType"))
										if (!o.isString(e.logType))
											return "logType: string expected"
									return null
								}
								AuditConfigDelta.fromObject = function fromObject(e) {
									if (e instanceof n.google.iam.v1.AuditConfigDelta) return e
									var t = new n.google.iam.v1.AuditConfigDelta()
									switch (e.action) {
										case "ACTION_UNSPECIFIED":
										case 0:
											t.action = 0
											break
										case "ADD":
										case 1:
											t.action = 1
											break
										case "REMOVE":
										case 2:
											t.action = 2
											break
									}
									if (e.service != null) t.service = String(e.service)
									if (e.exemptedMember != null)
										t.exemptedMember = String(e.exemptedMember)
									if (e.logType != null) t.logType = String(e.logType)
									return t
								}
								AuditConfigDelta.toObject = function toObject(e, t) {
									if (!t) t = {}
									var r = {}
									if (t.defaults) {
										r.action = t.enums === String ? "ACTION_UNSPECIFIED" : 0
										r.service = ""
										r.exemptedMember = ""
										r.logType = ""
									}
									if (e.action != null && e.hasOwnProperty("action"))
										r.action =
											t.enums === String
												? n.google.iam.v1.AuditConfigDelta.Action[e.action]
												: e.action
									if (e.service != null && e.hasOwnProperty("service"))
										r.service = e.service
									if (
										e.exemptedMember != null &&
										e.hasOwnProperty("exemptedMember")
									)
										r.exemptedMember = e.exemptedMember
									if (e.logType != null && e.hasOwnProperty("logType"))
										r.logType = e.logType
									return r
								}
								AuditConfigDelta.prototype.toJSON = function toJSON() {
									return this.constructor.toObject(this, e.util.toJSONOptions)
								}
								AuditConfigDelta.Action = (function () {
									var e = {},
										t = Object.create(e)
									t[(e[0] = "ACTION_UNSPECIFIED")] = 0
									t[(e[1] = "ADD")] = 1
									t[(e[2] = "REMOVE")] = 2
									return t
								})()
								return AuditConfigDelta
							})()
							i.logging = (function () {
								var o = {}
								o.AuditData = (function () {
									function AuditData(e) {
										if (e)
											for (var t = Object.keys(e), r = 0; r < t.length; ++r)
												if (e[t[r]] != null) this[t[r]] = e[t[r]]
									}
									AuditData.prototype.policyDelta = null
									AuditData.create = function create(e) {
										return new AuditData(e)
									}
									AuditData.encode = function encode(e, t) {
										if (!t) t = r.create()
										if (
											e.policyDelta != null &&
											Object.hasOwnProperty.call(e, "policyDelta")
										)
											n.google.iam.v1.PolicyDelta.encode(
												e.policyDelta,
												t.uint32(18).fork()
											).ldelim()
										return t
									}
									AuditData.encodeDelimited = function encodeDelimited(e, t) {
										return this.encode(e, t).ldelim()
									}
									AuditData.decode = function decode(e, r) {
										if (!(e instanceof t)) e = t.create(e)
										var o = r === undefined ? e.len : e.pos + r,
											i = new n.google.iam.v1.logging.AuditData()
										while (e.pos < o) {
											var a = e.uint32()
											switch (a >>> 3) {
												case 2:
													i.policyDelta = n.google.iam.v1.PolicyDelta.decode(
														e,
														e.uint32()
													)
													break
												default:
													e.skipType(a & 7)
													break
											}
										}
										return i
									}
									AuditData.decodeDelimited = function decodeDelimited(e) {
										if (!(e instanceof t)) e = new t(e)
										return this.decode(e, e.uint32())
									}
									AuditData.verify = function verify(e) {
										if (typeof e !== "object" || e === null)
											return "object expected"
										if (
											e.policyDelta != null &&
											e.hasOwnProperty("policyDelta")
										) {
											var t = n.google.iam.v1.PolicyDelta.verify(e.policyDelta)
											if (t) return "policyDelta." + t
										}
										return null
									}
									AuditData.fromObject = function fromObject(e) {
										if (e instanceof n.google.iam.v1.logging.AuditData) return e
										var t = new n.google.iam.v1.logging.AuditData()
										if (e.policyDelta != null) {
											if (typeof e.policyDelta !== "object")
												throw TypeError(
													".google.iam.v1.logging.AuditData.policyDelta: object expected"
												)
											t.policyDelta = n.google.iam.v1.PolicyDelta.fromObject(
												e.policyDelta
											)
										}
										return t
									}
									AuditData.toObject = function toObject(e, t) {
										if (!t) t = {}
										var r = {}
										if (t.defaults) r.policyDelta = null
										if (
											e.policyDelta != null &&
											e.hasOwnProperty("policyDelta")
										)
											r.policyDelta = n.google.iam.v1.PolicyDelta.toObject(
												e.policyDelta,
												t
											)
										return r
									}
									AuditData.prototype.toJSON = function toJSON() {
										return this.constructor.toObject(this, e.util.toJSONOptions)
									}
									return AuditData
								})()
								return o
							})()
							return i
						})()
						return i
					})()
					i.api = (function () {
						var i = {}
						i.Http = (function () {
							function Http(e) {
								this.rules = []
								if (e)
									for (var t = Object.keys(e), r = 0; r < t.length; ++r)
										if (e[t[r]] != null) this[t[r]] = e[t[r]]
							}
							Http.prototype.rules = o.emptyArray
							Http.prototype.fullyDecodeReservedExpansion = false
							Http.create = function create(e) {
								return new Http(e)
							}
							Http.encode = function encode(e, t) {
								if (!t) t = r.create()
								if (e.rules != null && e.rules.length)
									for (var o = 0; o < e.rules.length; ++o)
										n.google.api.HttpRule.encode(
											e.rules[o],
											t.uint32(10).fork()
										).ldelim()
								if (
									e.fullyDecodeReservedExpansion != null &&
									Object.hasOwnProperty.call(e, "fullyDecodeReservedExpansion")
								)
									t.uint32(16).bool(e.fullyDecodeReservedExpansion)
								return t
							}
							Http.encodeDelimited = function encodeDelimited(e, t) {
								return this.encode(e, t).ldelim()
							}
							Http.decode = function decode(e, r) {
								if (!(e instanceof t)) e = t.create(e)
								var o = r === undefined ? e.len : e.pos + r,
									i = new n.google.api.Http()
								while (e.pos < o) {
									var a = e.uint32()
									switch (a >>> 3) {
										case 1:
											if (!(i.rules && i.rules.length)) i.rules = []
											i.rules.push(n.google.api.HttpRule.decode(e, e.uint32()))
											break
										case 2:
											i.fullyDecodeReservedExpansion = e.bool()
											break
										default:
											e.skipType(a & 7)
											break
									}
								}
								return i
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
									e.fullyDecodeReservedExpansion != null &&
									e.hasOwnProperty("fullyDecodeReservedExpansion")
								)
									if (typeof e.fullyDecodeReservedExpansion !== "boolean")
										return "fullyDecodeReservedExpansion: boolean expected"
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
								if (e.fullyDecodeReservedExpansion != null)
									t.fullyDecodeReservedExpansion = Boolean(
										e.fullyDecodeReservedExpansion
									)
								return t
							}
							Http.toObject = function toObject(e, t) {
								if (!t) t = {}
								var r = {}
								if (t.arrays || t.defaults) r.rules = []
								if (t.defaults) r.fullyDecodeReservedExpansion = false
								if (e.rules && e.rules.length) {
									r.rules = []
									for (var o = 0; o < e.rules.length; ++o)
										r.rules[o] = n.google.api.HttpRule.toObject(e.rules[o], t)
								}
								if (
									e.fullyDecodeReservedExpansion != null &&
									e.hasOwnProperty("fullyDecodeReservedExpansion")
								)
									r.fullyDecodeReservedExpansion =
										e.fullyDecodeReservedExpansion
								return r
							}
							Http.prototype.toJSON = function toJSON() {
								return this.constructor.toObject(this, e.util.toJSONOptions)
							}
							return Http
						})()
						i.HttpRule = (function () {
							function HttpRule(e) {
								this.additionalBindings = []
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
							HttpRule.prototype.responseBody = ""
							HttpRule.prototype.additionalBindings = o.emptyArray
							var i
							Object.defineProperty(HttpRule.prototype, "pattern", {
								get: o.oneOfGetter(
									(i = ["get", "put", "post", "delete", "patch", "custom"])
								),
								set: o.oneOfSetter(i)
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
								if (e.additionalBindings != null && e.additionalBindings.length)
									for (var o = 0; o < e.additionalBindings.length; ++o)
										n.google.api.HttpRule.encode(
											e.additionalBindings[o],
											t.uint32(90).fork()
										).ldelim()
								if (
									e.responseBody != null &&
									Object.hasOwnProperty.call(e, "responseBody")
								)
									t.uint32(98).string(e.responseBody)
								return t
							}
							HttpRule.encodeDelimited = function encodeDelimited(e, t) {
								return this.encode(e, t).ldelim()
							}
							HttpRule.decode = function decode(e, r) {
								if (!(e instanceof t)) e = t.create(e)
								var o = r === undefined ? e.len : e.pos + r,
									i = new n.google.api.HttpRule()
								while (e.pos < o) {
									var a = e.uint32()
									switch (a >>> 3) {
										case 1:
											i.selector = e.string()
											break
										case 2:
											i.get = e.string()
											break
										case 3:
											i.put = e.string()
											break
										case 4:
											i.post = e.string()
											break
										case 5:
											i["delete"] = e.string()
											break
										case 6:
											i.patch = e.string()
											break
										case 8:
											i.custom = n.google.api.CustomHttpPattern.decode(
												e,
												e.uint32()
											)
											break
										case 7:
											i.body = e.string()
											break
										case 12:
											i.responseBody = e.string()
											break
										case 11:
											if (
												!(i.additionalBindings && i.additionalBindings.length)
											)
												i.additionalBindings = []
											i.additionalBindings.push(
												n.google.api.HttpRule.decode(e, e.uint32())
											)
											break
										default:
											e.skipType(a & 7)
											break
									}
								}
								return i
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
									if (!o.isString(e.selector))
										return "selector: string expected"
								if (e.get != null && e.hasOwnProperty("get")) {
									t.pattern = 1
									if (!o.isString(e.get)) return "get: string expected"
								}
								if (e.put != null && e.hasOwnProperty("put")) {
									if (t.pattern === 1) return "pattern: multiple values"
									t.pattern = 1
									if (!o.isString(e.put)) return "put: string expected"
								}
								if (e.post != null && e.hasOwnProperty("post")) {
									if (t.pattern === 1) return "pattern: multiple values"
									t.pattern = 1
									if (!o.isString(e.post)) return "post: string expected"
								}
								if (e["delete"] != null && e.hasOwnProperty("delete")) {
									if (t.pattern === 1) return "pattern: multiple values"
									t.pattern = 1
									if (!o.isString(e["delete"])) return "delete: string expected"
								}
								if (e.patch != null && e.hasOwnProperty("patch")) {
									if (t.pattern === 1) return "pattern: multiple values"
									t.pattern = 1
									if (!o.isString(e.patch)) return "patch: string expected"
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
									if (!o.isString(e.body)) return "body: string expected"
								if (e.responseBody != null && e.hasOwnProperty("responseBody"))
									if (!o.isString(e.responseBody))
										return "responseBody: string expected"
								if (
									e.additionalBindings != null &&
									e.hasOwnProperty("additionalBindings")
								) {
									if (!Array.isArray(e.additionalBindings))
										return "additionalBindings: array expected"
									for (var i = 0; i < e.additionalBindings.length; ++i) {
										var r = n.google.api.HttpRule.verify(
											e.additionalBindings[i]
										)
										if (r) return "additionalBindings." + r
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
								if (e.responseBody != null)
									t.responseBody = String(e.responseBody)
								if (e.additionalBindings) {
									if (!Array.isArray(e.additionalBindings))
										throw TypeError(
											".google.api.HttpRule.additionalBindings: array expected"
										)
									t.additionalBindings = []
									for (var r = 0; r < e.additionalBindings.length; ++r) {
										if (typeof e.additionalBindings[r] !== "object")
											throw TypeError(
												".google.api.HttpRule.additionalBindings: object expected"
											)
										t.additionalBindings[r] = n.google.api.HttpRule.fromObject(
											e.additionalBindings[r]
										)
									}
								}
								return t
							}
							HttpRule.toObject = function toObject(e, t) {
								if (!t) t = {}
								var r = {}
								if (t.arrays || t.defaults) r.additionalBindings = []
								if (t.defaults) {
									r.selector = ""
									r.body = ""
									r.responseBody = ""
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
								if (e.additionalBindings && e.additionalBindings.length) {
									r.additionalBindings = []
									for (var o = 0; o < e.additionalBindings.length; ++o)
										r.additionalBindings[o] = n.google.api.HttpRule.toObject(
											e.additionalBindings[o],
											t
										)
								}
								if (e.responseBody != null && e.hasOwnProperty("responseBody"))
									r.responseBody = e.responseBody
								return r
							}
							HttpRule.prototype.toJSON = function toJSON() {
								return this.constructor.toObject(this, e.util.toJSONOptions)
							}
							return HttpRule
						})()
						i.CustomHttpPattern = (function () {
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
								var o = r === undefined ? e.len : e.pos + r,
									i = new n.google.api.CustomHttpPattern()
								while (e.pos < o) {
									var a = e.uint32()
									switch (a >>> 3) {
										case 1:
											i.kind = e.string()
											break
										case 2:
											i.path = e.string()
											break
										default:
											e.skipType(a & 7)
											break
									}
								}
								return i
							}
							CustomHttpPattern.decodeDelimited = function decodeDelimited(e) {
								if (!(e instanceof t)) e = new t(e)
								return this.decode(e, e.uint32())
							}
							CustomHttpPattern.verify = function verify(e) {
								if (typeof e !== "object" || e === null)
									return "object expected"
								if (e.kind != null && e.hasOwnProperty("kind"))
									if (!o.isString(e.kind)) return "kind: string expected"
								if (e.path != null && e.hasOwnProperty("path"))
									if (!o.isString(e.path)) return "path: string expected"
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
						i.FieldBehavior = (function () {
							var e = {},
								t = Object.create(e)
							t[(e[0] = "FIELD_BEHAVIOR_UNSPECIFIED")] = 0
							t[(e[1] = "OPTIONAL")] = 1
							t[(e[2] = "REQUIRED")] = 2
							t[(e[3] = "OUTPUT_ONLY")] = 3
							t[(e[4] = "INPUT_ONLY")] = 4
							t[(e[5] = "IMMUTABLE")] = 5
							return t
						})()
						i.ResourceDescriptor = (function () {
							function ResourceDescriptor(e) {
								this.pattern = []
								if (e)
									for (var t = Object.keys(e), r = 0; r < t.length; ++r)
										if (e[t[r]] != null) this[t[r]] = e[t[r]]
							}
							ResourceDescriptor.prototype.type = ""
							ResourceDescriptor.prototype.pattern = o.emptyArray
							ResourceDescriptor.prototype.nameField = ""
							ResourceDescriptor.prototype.history = 0
							ResourceDescriptor.prototype.plural = ""
							ResourceDescriptor.prototype.singular = ""
							ResourceDescriptor.create = function create(e) {
								return new ResourceDescriptor(e)
							}
							ResourceDescriptor.encode = function encode(e, t) {
								if (!t) t = r.create()
								if (e.type != null && Object.hasOwnProperty.call(e, "type"))
									t.uint32(10).string(e.type)
								if (e.pattern != null && e.pattern.length)
									for (var o = 0; o < e.pattern.length; ++o)
										t.uint32(18).string(e.pattern[o])
								if (
									e.nameField != null &&
									Object.hasOwnProperty.call(e, "nameField")
								)
									t.uint32(26).string(e.nameField)
								if (
									e.history != null &&
									Object.hasOwnProperty.call(e, "history")
								)
									t.uint32(32).int32(e.history)
								if (e.plural != null && Object.hasOwnProperty.call(e, "plural"))
									t.uint32(42).string(e.plural)
								if (
									e.singular != null &&
									Object.hasOwnProperty.call(e, "singular")
								)
									t.uint32(50).string(e.singular)
								return t
							}
							ResourceDescriptor.encodeDelimited = function encodeDelimited(
								e,
								t
							) {
								return this.encode(e, t).ldelim()
							}
							ResourceDescriptor.decode = function decode(e, r) {
								if (!(e instanceof t)) e = t.create(e)
								var o = r === undefined ? e.len : e.pos + r,
									i = new n.google.api.ResourceDescriptor()
								while (e.pos < o) {
									var a = e.uint32()
									switch (a >>> 3) {
										case 1:
											i.type = e.string()
											break
										case 2:
											if (!(i.pattern && i.pattern.length)) i.pattern = []
											i.pattern.push(e.string())
											break
										case 3:
											i.nameField = e.string()
											break
										case 4:
											i.history = e.int32()
											break
										case 5:
											i.plural = e.string()
											break
										case 6:
											i.singular = e.string()
											break
										default:
											e.skipType(a & 7)
											break
									}
								}
								return i
							}
							ResourceDescriptor.decodeDelimited = function decodeDelimited(e) {
								if (!(e instanceof t)) e = new t(e)
								return this.decode(e, e.uint32())
							}
							ResourceDescriptor.verify = function verify(e) {
								if (typeof e !== "object" || e === null)
									return "object expected"
								if (e.type != null && e.hasOwnProperty("type"))
									if (!o.isString(e.type)) return "type: string expected"
								if (e.pattern != null && e.hasOwnProperty("pattern")) {
									if (!Array.isArray(e.pattern))
										return "pattern: array expected"
									for (var t = 0; t < e.pattern.length; ++t)
										if (!o.isString(e.pattern[t]))
											return "pattern: string[] expected"
								}
								if (e.nameField != null && e.hasOwnProperty("nameField"))
									if (!o.isString(e.nameField))
										return "nameField: string expected"
								if (e.history != null && e.hasOwnProperty("history"))
									switch (e.history) {
										default:
											return "history: enum value expected"
										case 0:
										case 1:
										case 2:
											break
									}
								if (e.plural != null && e.hasOwnProperty("plural"))
									if (!o.isString(e.plural)) return "plural: string expected"
								if (e.singular != null && e.hasOwnProperty("singular"))
									if (!o.isString(e.singular))
										return "singular: string expected"
								return null
							}
							ResourceDescriptor.fromObject = function fromObject(e) {
								if (e instanceof n.google.api.ResourceDescriptor) return e
								var t = new n.google.api.ResourceDescriptor()
								if (e.type != null) t.type = String(e.type)
								if (e.pattern) {
									if (!Array.isArray(e.pattern))
										throw TypeError(
											".google.api.ResourceDescriptor.pattern: array expected"
										)
									t.pattern = []
									for (var r = 0; r < e.pattern.length; ++r)
										t.pattern[r] = String(e.pattern[r])
								}
								if (e.nameField != null) t.nameField = String(e.nameField)
								switch (e.history) {
									case "HISTORY_UNSPECIFIED":
									case 0:
										t.history = 0
										break
									case "ORIGINALLY_SINGLE_PATTERN":
									case 1:
										t.history = 1
										break
									case "FUTURE_MULTI_PATTERN":
									case 2:
										t.history = 2
										break
								}
								if (e.plural != null) t.plural = String(e.plural)
								if (e.singular != null) t.singular = String(e.singular)
								return t
							}
							ResourceDescriptor.toObject = function toObject(e, t) {
								if (!t) t = {}
								var r = {}
								if (t.arrays || t.defaults) r.pattern = []
								if (t.defaults) {
									r.type = ""
									r.nameField = ""
									r.history = t.enums === String ? "HISTORY_UNSPECIFIED" : 0
									r.plural = ""
									r.singular = ""
								}
								if (e.type != null && e.hasOwnProperty("type")) r.type = e.type
								if (e.pattern && e.pattern.length) {
									r.pattern = []
									for (var o = 0; o < e.pattern.length; ++o)
										r.pattern[o] = e.pattern[o]
								}
								if (e.nameField != null && e.hasOwnProperty("nameField"))
									r.nameField = e.nameField
								if (e.history != null && e.hasOwnProperty("history"))
									r.history =
										t.enums === String
											? n.google.api.ResourceDescriptor.History[e.history]
											: e.history
								if (e.plural != null && e.hasOwnProperty("plural"))
									r.plural = e.plural
								if (e.singular != null && e.hasOwnProperty("singular"))
									r.singular = e.singular
								return r
							}
							ResourceDescriptor.prototype.toJSON = function toJSON() {
								return this.constructor.toObject(this, e.util.toJSONOptions)
							}
							ResourceDescriptor.History = (function () {
								var e = {},
									t = Object.create(e)
								t[(e[0] = "HISTORY_UNSPECIFIED")] = 0
								t[(e[1] = "ORIGINALLY_SINGLE_PATTERN")] = 1
								t[(e[2] = "FUTURE_MULTI_PATTERN")] = 2
								return t
							})()
							return ResourceDescriptor
						})()
						i.ResourceReference = (function () {
							function ResourceReference(e) {
								if (e)
									for (var t = Object.keys(e), r = 0; r < t.length; ++r)
										if (e[t[r]] != null) this[t[r]] = e[t[r]]
							}
							ResourceReference.prototype.type = ""
							ResourceReference.prototype.childType = ""
							ResourceReference.create = function create(e) {
								return new ResourceReference(e)
							}
							ResourceReference.encode = function encode(e, t) {
								if (!t) t = r.create()
								if (e.type != null && Object.hasOwnProperty.call(e, "type"))
									t.uint32(10).string(e.type)
								if (
									e.childType != null &&
									Object.hasOwnProperty.call(e, "childType")
								)
									t.uint32(18).string(e.childType)
								return t
							}
							ResourceReference.encodeDelimited = function encodeDelimited(
								e,
								t
							) {
								return this.encode(e, t).ldelim()
							}
							ResourceReference.decode = function decode(e, r) {
								if (!(e instanceof t)) e = t.create(e)
								var o = r === undefined ? e.len : e.pos + r,
									i = new n.google.api.ResourceReference()
								while (e.pos < o) {
									var a = e.uint32()
									switch (a >>> 3) {
										case 1:
											i.type = e.string()
											break
										case 2:
											i.childType = e.string()
											break
										default:
											e.skipType(a & 7)
											break
									}
								}
								return i
							}
							ResourceReference.decodeDelimited = function decodeDelimited(e) {
								if (!(e instanceof t)) e = new t(e)
								return this.decode(e, e.uint32())
							}
							ResourceReference.verify = function verify(e) {
								if (typeof e !== "object" || e === null)
									return "object expected"
								if (e.type != null && e.hasOwnProperty("type"))
									if (!o.isString(e.type)) return "type: string expected"
								if (e.childType != null && e.hasOwnProperty("childType"))
									if (!o.isString(e.childType))
										return "childType: string expected"
								return null
							}
							ResourceReference.fromObject = function fromObject(e) {
								if (e instanceof n.google.api.ResourceReference) return e
								var t = new n.google.api.ResourceReference()
								if (e.type != null) t.type = String(e.type)
								if (e.childType != null) t.childType = String(e.childType)
								return t
							}
							ResourceReference.toObject = function toObject(e, t) {
								if (!t) t = {}
								var r = {}
								if (t.defaults) {
									r.type = ""
									r.childType = ""
								}
								if (e.type != null && e.hasOwnProperty("type")) r.type = e.type
								if (e.childType != null && e.hasOwnProperty("childType"))
									r.childType = e.childType
								return r
							}
							ResourceReference.prototype.toJSON = function toJSON() {
								return this.constructor.toObject(this, e.util.toJSONOptions)
							}
							return ResourceReference
						})()
						return i
					})()
					i.protobuf = (function () {
						var i = {}
						i.FileDescriptorSet = (function () {
							function FileDescriptorSet(e) {
								this.file = []
								if (e)
									for (var t = Object.keys(e), r = 0; r < t.length; ++r)
										if (e[t[r]] != null) this[t[r]] = e[t[r]]
							}
							FileDescriptorSet.prototype.file = o.emptyArray
							FileDescriptorSet.create = function create(e) {
								return new FileDescriptorSet(e)
							}
							FileDescriptorSet.encode = function encode(e, t) {
								if (!t) t = r.create()
								if (e.file != null && e.file.length)
									for (var o = 0; o < e.file.length; ++o)
										n.google.protobuf.FileDescriptorProto.encode(
											e.file[o],
											t.uint32(10).fork()
										).ldelim()
								return t
							}
							FileDescriptorSet.encodeDelimited = function encodeDelimited(
								e,
								t
							) {
								return this.encode(e, t).ldelim()
							}
							FileDescriptorSet.decode = function decode(e, r) {
								if (!(e instanceof t)) e = t.create(e)
								var o = r === undefined ? e.len : e.pos + r,
									i = new n.google.protobuf.FileDescriptorSet()
								while (e.pos < o) {
									var a = e.uint32()
									switch (a >>> 3) {
										case 1:
											if (!(i.file && i.file.length)) i.file = []
											i.file.push(
												n.google.protobuf.FileDescriptorProto.decode(
													e,
													e.uint32()
												)
											)
											break
										default:
											e.skipType(a & 7)
											break
									}
								}
								return i
							}
							FileDescriptorSet.decodeDelimited = function decodeDelimited(e) {
								if (!(e instanceof t)) e = new t(e)
								return this.decode(e, e.uint32())
							}
							FileDescriptorSet.verify = function verify(e) {
								if (typeof e !== "object" || e === null)
									return "object expected"
								if (e.file != null && e.hasOwnProperty("file")) {
									if (!Array.isArray(e.file)) return "file: array expected"
									for (var t = 0; t < e.file.length; ++t) {
										var r = n.google.protobuf.FileDescriptorProto.verify(
											e.file[t]
										)
										if (r) return "file." + r
									}
								}
								return null
							}
							FileDescriptorSet.fromObject = function fromObject(e) {
								if (e instanceof n.google.protobuf.FileDescriptorSet) return e
								var t = new n.google.protobuf.FileDescriptorSet()
								if (e.file) {
									if (!Array.isArray(e.file))
										throw TypeError(
											".google.protobuf.FileDescriptorSet.file: array expected"
										)
									t.file = []
									for (var r = 0; r < e.file.length; ++r) {
										if (typeof e.file[r] !== "object")
											throw TypeError(
												".google.protobuf.FileDescriptorSet.file: object expected"
											)
										t.file[r] =
											n.google.protobuf.FileDescriptorProto.fromObject(
												e.file[r]
											)
									}
								}
								return t
							}
							FileDescriptorSet.toObject = function toObject(e, t) {
								if (!t) t = {}
								var r = {}
								if (t.arrays || t.defaults) r.file = []
								if (e.file && e.file.length) {
									r.file = []
									for (var o = 0; o < e.file.length; ++o)
										r.file[o] = n.google.protobuf.FileDescriptorProto.toObject(
											e.file[o],
											t
										)
								}
								return r
							}
							FileDescriptorSet.prototype.toJSON = function toJSON() {
								return this.constructor.toObject(this, e.util.toJSONOptions)
							}
							return FileDescriptorSet
						})()
						i.FileDescriptorProto = (function () {
							function FileDescriptorProto(e) {
								this.dependency = []
								this.publicDependency = []
								this.weakDependency = []
								this.messageType = []
								this.enumType = []
								this.service = []
								this.extension = []
								if (e)
									for (var t = Object.keys(e), r = 0; r < t.length; ++r)
										if (e[t[r]] != null) this[t[r]] = e[t[r]]
							}
							FileDescriptorProto.prototype.name = ""
							FileDescriptorProto.prototype["package"] = ""
							FileDescriptorProto.prototype.dependency = o.emptyArray
							FileDescriptorProto.prototype.publicDependency = o.emptyArray
							FileDescriptorProto.prototype.weakDependency = o.emptyArray
							FileDescriptorProto.prototype.messageType = o.emptyArray
							FileDescriptorProto.prototype.enumType = o.emptyArray
							FileDescriptorProto.prototype.service = o.emptyArray
							FileDescriptorProto.prototype.extension = o.emptyArray
							FileDescriptorProto.prototype.options = null
							FileDescriptorProto.prototype.sourceCodeInfo = null
							FileDescriptorProto.prototype.syntax = ""
							FileDescriptorProto.create = function create(e) {
								return new FileDescriptorProto(e)
							}
							FileDescriptorProto.encode = function encode(e, t) {
								if (!t) t = r.create()
								if (e.name != null && Object.hasOwnProperty.call(e, "name"))
									t.uint32(10).string(e.name)
								if (
									e["package"] != null &&
									Object.hasOwnProperty.call(e, "package")
								)
									t.uint32(18).string(e["package"])
								if (e.dependency != null && e.dependency.length)
									for (var o = 0; o < e.dependency.length; ++o)
										t.uint32(26).string(e.dependency[o])
								if (e.messageType != null && e.messageType.length)
									for (var o = 0; o < e.messageType.length; ++o)
										n.google.protobuf.DescriptorProto.encode(
											e.messageType[o],
											t.uint32(34).fork()
										).ldelim()
								if (e.enumType != null && e.enumType.length)
									for (var o = 0; o < e.enumType.length; ++o)
										n.google.protobuf.EnumDescriptorProto.encode(
											e.enumType[o],
											t.uint32(42).fork()
										).ldelim()
								if (e.service != null && e.service.length)
									for (var o = 0; o < e.service.length; ++o)
										n.google.protobuf.ServiceDescriptorProto.encode(
											e.service[o],
											t.uint32(50).fork()
										).ldelim()
								if (e.extension != null && e.extension.length)
									for (var o = 0; o < e.extension.length; ++o)
										n.google.protobuf.FieldDescriptorProto.encode(
											e.extension[o],
											t.uint32(58).fork()
										).ldelim()
								if (
									e.options != null &&
									Object.hasOwnProperty.call(e, "options")
								)
									n.google.protobuf.FileOptions.encode(
										e.options,
										t.uint32(66).fork()
									).ldelim()
								if (
									e.sourceCodeInfo != null &&
									Object.hasOwnProperty.call(e, "sourceCodeInfo")
								)
									n.google.protobuf.SourceCodeInfo.encode(
										e.sourceCodeInfo,
										t.uint32(74).fork()
									).ldelim()
								if (e.publicDependency != null && e.publicDependency.length)
									for (var o = 0; o < e.publicDependency.length; ++o)
										t.uint32(80).int32(e.publicDependency[o])
								if (e.weakDependency != null && e.weakDependency.length)
									for (var o = 0; o < e.weakDependency.length; ++o)
										t.uint32(88).int32(e.weakDependency[o])
								if (e.syntax != null && Object.hasOwnProperty.call(e, "syntax"))
									t.uint32(98).string(e.syntax)
								return t
							}
							FileDescriptorProto.encodeDelimited = function encodeDelimited(
								e,
								t
							) {
								return this.encode(e, t).ldelim()
							}
							FileDescriptorProto.decode = function decode(e, r) {
								if (!(e instanceof t)) e = t.create(e)
								var o = r === undefined ? e.len : e.pos + r,
									i = new n.google.protobuf.FileDescriptorProto()
								while (e.pos < o) {
									var a = e.uint32()
									switch (a >>> 3) {
										case 1:
											i.name = e.string()
											break
										case 2:
											i["package"] = e.string()
											break
										case 3:
											if (!(i.dependency && i.dependency.length))
												i.dependency = []
											i.dependency.push(e.string())
											break
										case 10:
											if (!(i.publicDependency && i.publicDependency.length))
												i.publicDependency = []
											if ((a & 7) === 2) {
												var s = e.uint32() + e.pos
												while (e.pos < s) i.publicDependency.push(e.int32())
											} else i.publicDependency.push(e.int32())
											break
										case 11:
											if (!(i.weakDependency && i.weakDependency.length))
												i.weakDependency = []
											if ((a & 7) === 2) {
												var s = e.uint32() + e.pos
												while (e.pos < s) i.weakDependency.push(e.int32())
											} else i.weakDependency.push(e.int32())
											break
										case 4:
											if (!(i.messageType && i.messageType.length))
												i.messageType = []
											i.messageType.push(
												n.google.protobuf.DescriptorProto.decode(e, e.uint32())
											)
											break
										case 5:
											if (!(i.enumType && i.enumType.length)) i.enumType = []
											i.enumType.push(
												n.google.protobuf.EnumDescriptorProto.decode(
													e,
													e.uint32()
												)
											)
											break
										case 6:
											if (!(i.service && i.service.length)) i.service = []
											i.service.push(
												n.google.protobuf.ServiceDescriptorProto.decode(
													e,
													e.uint32()
												)
											)
											break
										case 7:
											if (!(i.extension && i.extension.length)) i.extension = []
											i.extension.push(
												n.google.protobuf.FieldDescriptorProto.decode(
													e,
													e.uint32()
												)
											)
											break
										case 8:
											i.options = n.google.protobuf.FileOptions.decode(
												e,
												e.uint32()
											)
											break
										case 9:
											i.sourceCodeInfo =
												n.google.protobuf.SourceCodeInfo.decode(e, e.uint32())
											break
										case 12:
											i.syntax = e.string()
											break
										default:
											e.skipType(a & 7)
											break
									}
								}
								return i
							}
							FileDescriptorProto.decodeDelimited = function decodeDelimited(
								e
							) {
								if (!(e instanceof t)) e = new t(e)
								return this.decode(e, e.uint32())
							}
							FileDescriptorProto.verify = function verify(e) {
								if (typeof e !== "object" || e === null)
									return "object expected"
								if (e.name != null && e.hasOwnProperty("name"))
									if (!o.isString(e.name)) return "name: string expected"
								if (e["package"] != null && e.hasOwnProperty("package"))
									if (!o.isString(e["package"]))
										return "package: string expected"
								if (e.dependency != null && e.hasOwnProperty("dependency")) {
									if (!Array.isArray(e.dependency))
										return "dependency: array expected"
									for (var t = 0; t < e.dependency.length; ++t)
										if (!o.isString(e.dependency[t]))
											return "dependency: string[] expected"
								}
								if (
									e.publicDependency != null &&
									e.hasOwnProperty("publicDependency")
								) {
									if (!Array.isArray(e.publicDependency))
										return "publicDependency: array expected"
									for (var t = 0; t < e.publicDependency.length; ++t)
										if (!o.isInteger(e.publicDependency[t]))
											return "publicDependency: integer[] expected"
								}
								if (
									e.weakDependency != null &&
									e.hasOwnProperty("weakDependency")
								) {
									if (!Array.isArray(e.weakDependency))
										return "weakDependency: array expected"
									for (var t = 0; t < e.weakDependency.length; ++t)
										if (!o.isInteger(e.weakDependency[t]))
											return "weakDependency: integer[] expected"
								}
								if (e.messageType != null && e.hasOwnProperty("messageType")) {
									if (!Array.isArray(e.messageType))
										return "messageType: array expected"
									for (var t = 0; t < e.messageType.length; ++t) {
										var r = n.google.protobuf.DescriptorProto.verify(
											e.messageType[t]
										)
										if (r) return "messageType." + r
									}
								}
								if (e.enumType != null && e.hasOwnProperty("enumType")) {
									if (!Array.isArray(e.enumType))
										return "enumType: array expected"
									for (var t = 0; t < e.enumType.length; ++t) {
										var r = n.google.protobuf.EnumDescriptorProto.verify(
											e.enumType[t]
										)
										if (r) return "enumType." + r
									}
								}
								if (e.service != null && e.hasOwnProperty("service")) {
									if (!Array.isArray(e.service))
										return "service: array expected"
									for (var t = 0; t < e.service.length; ++t) {
										var r = n.google.protobuf.ServiceDescriptorProto.verify(
											e.service[t]
										)
										if (r) return "service." + r
									}
								}
								if (e.extension != null && e.hasOwnProperty("extension")) {
									if (!Array.isArray(e.extension))
										return "extension: array expected"
									for (var t = 0; t < e.extension.length; ++t) {
										var r = n.google.protobuf.FieldDescriptorProto.verify(
											e.extension[t]
										)
										if (r) return "extension." + r
									}
								}
								if (e.options != null && e.hasOwnProperty("options")) {
									var r = n.google.protobuf.FileOptions.verify(e.options)
									if (r) return "options." + r
								}
								if (
									e.sourceCodeInfo != null &&
									e.hasOwnProperty("sourceCodeInfo")
								) {
									var r = n.google.protobuf.SourceCodeInfo.verify(
										e.sourceCodeInfo
									)
									if (r) return "sourceCodeInfo." + r
								}
								if (e.syntax != null && e.hasOwnProperty("syntax"))
									if (!o.isString(e.syntax)) return "syntax: string expected"
								return null
							}
							FileDescriptorProto.fromObject = function fromObject(e) {
								if (e instanceof n.google.protobuf.FileDescriptorProto) return e
								var t = new n.google.protobuf.FileDescriptorProto()
								if (e.name != null) t.name = String(e.name)
								if (e["package"] != null) t["package"] = String(e["package"])
								if (e.dependency) {
									if (!Array.isArray(e.dependency))
										throw TypeError(
											".google.protobuf.FileDescriptorProto.dependency: array expected"
										)
									t.dependency = []
									for (var r = 0; r < e.dependency.length; ++r)
										t.dependency[r] = String(e.dependency[r])
								}
								if (e.publicDependency) {
									if (!Array.isArray(e.publicDependency))
										throw TypeError(
											".google.protobuf.FileDescriptorProto.publicDependency: array expected"
										)
									t.publicDependency = []
									for (var r = 0; r < e.publicDependency.length; ++r)
										t.publicDependency[r] = e.publicDependency[r] | 0
								}
								if (e.weakDependency) {
									if (!Array.isArray(e.weakDependency))
										throw TypeError(
											".google.protobuf.FileDescriptorProto.weakDependency: array expected"
										)
									t.weakDependency = []
									for (var r = 0; r < e.weakDependency.length; ++r)
										t.weakDependency[r] = e.weakDependency[r] | 0
								}
								if (e.messageType) {
									if (!Array.isArray(e.messageType))
										throw TypeError(
											".google.protobuf.FileDescriptorProto.messageType: array expected"
										)
									t.messageType = []
									for (var r = 0; r < e.messageType.length; ++r) {
										if (typeof e.messageType[r] !== "object")
											throw TypeError(
												".google.protobuf.FileDescriptorProto.messageType: object expected"
											)
										t.messageType[r] =
											n.google.protobuf.DescriptorProto.fromObject(
												e.messageType[r]
											)
									}
								}
								if (e.enumType) {
									if (!Array.isArray(e.enumType))
										throw TypeError(
											".google.protobuf.FileDescriptorProto.enumType: array expected"
										)
									t.enumType = []
									for (var r = 0; r < e.enumType.length; ++r) {
										if (typeof e.enumType[r] !== "object")
											throw TypeError(
												".google.protobuf.FileDescriptorProto.enumType: object expected"
											)
										t.enumType[r] =
											n.google.protobuf.EnumDescriptorProto.fromObject(
												e.enumType[r]
											)
									}
								}
								if (e.service) {
									if (!Array.isArray(e.service))
										throw TypeError(
											".google.protobuf.FileDescriptorProto.service: array expected"
										)
									t.service = []
									for (var r = 0; r < e.service.length; ++r) {
										if (typeof e.service[r] !== "object")
											throw TypeError(
												".google.protobuf.FileDescriptorProto.service: object expected"
											)
										t.service[r] =
											n.google.protobuf.ServiceDescriptorProto.fromObject(
												e.service[r]
											)
									}
								}
								if (e.extension) {
									if (!Array.isArray(e.extension))
										throw TypeError(
											".google.protobuf.FileDescriptorProto.extension: array expected"
										)
									t.extension = []
									for (var r = 0; r < e.extension.length; ++r) {
										if (typeof e.extension[r] !== "object")
											throw TypeError(
												".google.protobuf.FileDescriptorProto.extension: object expected"
											)
										t.extension[r] =
											n.google.protobuf.FieldDescriptorProto.fromObject(
												e.extension[r]
											)
									}
								}
								if (e.options != null) {
									if (typeof e.options !== "object")
										throw TypeError(
											".google.protobuf.FileDescriptorProto.options: object expected"
										)
									t.options = n.google.protobuf.FileOptions.fromObject(
										e.options
									)
								}
								if (e.sourceCodeInfo != null) {
									if (typeof e.sourceCodeInfo !== "object")
										throw TypeError(
											".google.protobuf.FileDescriptorProto.sourceCodeInfo: object expected"
										)
									t.sourceCodeInfo =
										n.google.protobuf.SourceCodeInfo.fromObject(
											e.sourceCodeInfo
										)
								}
								if (e.syntax != null) t.syntax = String(e.syntax)
								return t
							}
							FileDescriptorProto.toObject = function toObject(e, t) {
								if (!t) t = {}
								var r = {}
								if (t.arrays || t.defaults) {
									r.dependency = []
									r.messageType = []
									r.enumType = []
									r.service = []
									r.extension = []
									r.publicDependency = []
									r.weakDependency = []
								}
								if (t.defaults) {
									r.name = ""
									r["package"] = ""
									r.options = null
									r.sourceCodeInfo = null
									r.syntax = ""
								}
								if (e.name != null && e.hasOwnProperty("name")) r.name = e.name
								if (e["package"] != null && e.hasOwnProperty("package"))
									r["package"] = e["package"]
								if (e.dependency && e.dependency.length) {
									r.dependency = []
									for (var o = 0; o < e.dependency.length; ++o)
										r.dependency[o] = e.dependency[o]
								}
								if (e.messageType && e.messageType.length) {
									r.messageType = []
									for (var o = 0; o < e.messageType.length; ++o)
										r.messageType[o] =
											n.google.protobuf.DescriptorProto.toObject(
												e.messageType[o],
												t
											)
								}
								if (e.enumType && e.enumType.length) {
									r.enumType = []
									for (var o = 0; o < e.enumType.length; ++o)
										r.enumType[o] =
											n.google.protobuf.EnumDescriptorProto.toObject(
												e.enumType[o],
												t
											)
								}
								if (e.service && e.service.length) {
									r.service = []
									for (var o = 0; o < e.service.length; ++o)
										r.service[o] =
											n.google.protobuf.ServiceDescriptorProto.toObject(
												e.service[o],
												t
											)
								}
								if (e.extension && e.extension.length) {
									r.extension = []
									for (var o = 0; o < e.extension.length; ++o)
										r.extension[o] =
											n.google.protobuf.FieldDescriptorProto.toObject(
												e.extension[o],
												t
											)
								}
								if (e.options != null && e.hasOwnProperty("options"))
									r.options = n.google.protobuf.FileOptions.toObject(
										e.options,
										t
									)
								if (
									e.sourceCodeInfo != null &&
									e.hasOwnProperty("sourceCodeInfo")
								)
									r.sourceCodeInfo = n.google.protobuf.SourceCodeInfo.toObject(
										e.sourceCodeInfo,
										t
									)
								if (e.publicDependency && e.publicDependency.length) {
									r.publicDependency = []
									for (var o = 0; o < e.publicDependency.length; ++o)
										r.publicDependency[o] = e.publicDependency[o]
								}
								if (e.weakDependency && e.weakDependency.length) {
									r.weakDependency = []
									for (var o = 0; o < e.weakDependency.length; ++o)
										r.weakDependency[o] = e.weakDependency[o]
								}
								if (e.syntax != null && e.hasOwnProperty("syntax"))
									r.syntax = e.syntax
								return r
							}
							FileDescriptorProto.prototype.toJSON = function toJSON() {
								return this.constructor.toObject(this, e.util.toJSONOptions)
							}
							return FileDescriptorProto
						})()
						i.DescriptorProto = (function () {
							function DescriptorProto(e) {
								this.field = []
								this.extension = []
								this.nestedType = []
								this.enumType = []
								this.extensionRange = []
								this.oneofDecl = []
								this.reservedRange = []
								this.reservedName = []
								if (e)
									for (var t = Object.keys(e), r = 0; r < t.length; ++r)
										if (e[t[r]] != null) this[t[r]] = e[t[r]]
							}
							DescriptorProto.prototype.name = ""
							DescriptorProto.prototype.field = o.emptyArray
							DescriptorProto.prototype.extension = o.emptyArray
							DescriptorProto.prototype.nestedType = o.emptyArray
							DescriptorProto.prototype.enumType = o.emptyArray
							DescriptorProto.prototype.extensionRange = o.emptyArray
							DescriptorProto.prototype.oneofDecl = o.emptyArray
							DescriptorProto.prototype.options = null
							DescriptorProto.prototype.reservedRange = o.emptyArray
							DescriptorProto.prototype.reservedName = o.emptyArray
							DescriptorProto.create = function create(e) {
								return new DescriptorProto(e)
							}
							DescriptorProto.encode = function encode(e, t) {
								if (!t) t = r.create()
								if (e.name != null && Object.hasOwnProperty.call(e, "name"))
									t.uint32(10).string(e.name)
								if (e.field != null && e.field.length)
									for (var o = 0; o < e.field.length; ++o)
										n.google.protobuf.FieldDescriptorProto.encode(
											e.field[o],
											t.uint32(18).fork()
										).ldelim()
								if (e.nestedType != null && e.nestedType.length)
									for (var o = 0; o < e.nestedType.length; ++o)
										n.google.protobuf.DescriptorProto.encode(
											e.nestedType[o],
											t.uint32(26).fork()
										).ldelim()
								if (e.enumType != null && e.enumType.length)
									for (var o = 0; o < e.enumType.length; ++o)
										n.google.protobuf.EnumDescriptorProto.encode(
											e.enumType[o],
											t.uint32(34).fork()
										).ldelim()
								if (e.extensionRange != null && e.extensionRange.length)
									for (var o = 0; o < e.extensionRange.length; ++o)
										n.google.protobuf.DescriptorProto.ExtensionRange.encode(
											e.extensionRange[o],
											t.uint32(42).fork()
										).ldelim()
								if (e.extension != null && e.extension.length)
									for (var o = 0; o < e.extension.length; ++o)
										n.google.protobuf.FieldDescriptorProto.encode(
											e.extension[o],
											t.uint32(50).fork()
										).ldelim()
								if (
									e.options != null &&
									Object.hasOwnProperty.call(e, "options")
								)
									n.google.protobuf.MessageOptions.encode(
										e.options,
										t.uint32(58).fork()
									).ldelim()
								if (e.oneofDecl != null && e.oneofDecl.length)
									for (var o = 0; o < e.oneofDecl.length; ++o)
										n.google.protobuf.OneofDescriptorProto.encode(
											e.oneofDecl[o],
											t.uint32(66).fork()
										).ldelim()
								if (e.reservedRange != null && e.reservedRange.length)
									for (var o = 0; o < e.reservedRange.length; ++o)
										n.google.protobuf.DescriptorProto.ReservedRange.encode(
											e.reservedRange[o],
											t.uint32(74).fork()
										).ldelim()
								if (e.reservedName != null && e.reservedName.length)
									for (var o = 0; o < e.reservedName.length; ++o)
										t.uint32(82).string(e.reservedName[o])
								return t
							}
							DescriptorProto.encodeDelimited = function encodeDelimited(e, t) {
								return this.encode(e, t).ldelim()
							}
							DescriptorProto.decode = function decode(e, r) {
								if (!(e instanceof t)) e = t.create(e)
								var o = r === undefined ? e.len : e.pos + r,
									i = new n.google.protobuf.DescriptorProto()
								while (e.pos < o) {
									var a = e.uint32()
									switch (a >>> 3) {
										case 1:
											i.name = e.string()
											break
										case 2:
											if (!(i.field && i.field.length)) i.field = []
											i.field.push(
												n.google.protobuf.FieldDescriptorProto.decode(
													e,
													e.uint32()
												)
											)
											break
										case 6:
											if (!(i.extension && i.extension.length)) i.extension = []
											i.extension.push(
												n.google.protobuf.FieldDescriptorProto.decode(
													e,
													e.uint32()
												)
											)
											break
										case 3:
											if (!(i.nestedType && i.nestedType.length))
												i.nestedType = []
											i.nestedType.push(
												n.google.protobuf.DescriptorProto.decode(e, e.uint32())
											)
											break
										case 4:
											if (!(i.enumType && i.enumType.length)) i.enumType = []
											i.enumType.push(
												n.google.protobuf.EnumDescriptorProto.decode(
													e,
													e.uint32()
												)
											)
											break
										case 5:
											if (!(i.extensionRange && i.extensionRange.length))
												i.extensionRange = []
											i.extensionRange.push(
												n.google.protobuf.DescriptorProto.ExtensionRange.decode(
													e,
													e.uint32()
												)
											)
											break
										case 8:
											if (!(i.oneofDecl && i.oneofDecl.length)) i.oneofDecl = []
											i.oneofDecl.push(
												n.google.protobuf.OneofDescriptorProto.decode(
													e,
													e.uint32()
												)
											)
											break
										case 7:
											i.options = n.google.protobuf.MessageOptions.decode(
												e,
												e.uint32()
											)
											break
										case 9:
											if (!(i.reservedRange && i.reservedRange.length))
												i.reservedRange = []
											i.reservedRange.push(
												n.google.protobuf.DescriptorProto.ReservedRange.decode(
													e,
													e.uint32()
												)
											)
											break
										case 10:
											if (!(i.reservedName && i.reservedName.length))
												i.reservedName = []
											i.reservedName.push(e.string())
											break
										default:
											e.skipType(a & 7)
											break
									}
								}
								return i
							}
							DescriptorProto.decodeDelimited = function decodeDelimited(e) {
								if (!(e instanceof t)) e = new t(e)
								return this.decode(e, e.uint32())
							}
							DescriptorProto.verify = function verify(e) {
								if (typeof e !== "object" || e === null)
									return "object expected"
								if (e.name != null && e.hasOwnProperty("name"))
									if (!o.isString(e.name)) return "name: string expected"
								if (e.field != null && e.hasOwnProperty("field")) {
									if (!Array.isArray(e.field)) return "field: array expected"
									for (var t = 0; t < e.field.length; ++t) {
										var r = n.google.protobuf.FieldDescriptorProto.verify(
											e.field[t]
										)
										if (r) return "field." + r
									}
								}
								if (e.extension != null && e.hasOwnProperty("extension")) {
									if (!Array.isArray(e.extension))
										return "extension: array expected"
									for (var t = 0; t < e.extension.length; ++t) {
										var r = n.google.protobuf.FieldDescriptorProto.verify(
											e.extension[t]
										)
										if (r) return "extension." + r
									}
								}
								if (e.nestedType != null && e.hasOwnProperty("nestedType")) {
									if (!Array.isArray(e.nestedType))
										return "nestedType: array expected"
									for (var t = 0; t < e.nestedType.length; ++t) {
										var r = n.google.protobuf.DescriptorProto.verify(
											e.nestedType[t]
										)
										if (r) return "nestedType." + r
									}
								}
								if (e.enumType != null && e.hasOwnProperty("enumType")) {
									if (!Array.isArray(e.enumType))
										return "enumType: array expected"
									for (var t = 0; t < e.enumType.length; ++t) {
										var r = n.google.protobuf.EnumDescriptorProto.verify(
											e.enumType[t]
										)
										if (r) return "enumType." + r
									}
								}
								if (
									e.extensionRange != null &&
									e.hasOwnProperty("extensionRange")
								) {
									if (!Array.isArray(e.extensionRange))
										return "extensionRange: array expected"
									for (var t = 0; t < e.extensionRange.length; ++t) {
										var r =
											n.google.protobuf.DescriptorProto.ExtensionRange.verify(
												e.extensionRange[t]
											)
										if (r) return "extensionRange." + r
									}
								}
								if (e.oneofDecl != null && e.hasOwnProperty("oneofDecl")) {
									if (!Array.isArray(e.oneofDecl))
										return "oneofDecl: array expected"
									for (var t = 0; t < e.oneofDecl.length; ++t) {
										var r = n.google.protobuf.OneofDescriptorProto.verify(
											e.oneofDecl[t]
										)
										if (r) return "oneofDecl." + r
									}
								}
								if (e.options != null && e.hasOwnProperty("options")) {
									var r = n.google.protobuf.MessageOptions.verify(e.options)
									if (r) return "options." + r
								}
								if (
									e.reservedRange != null &&
									e.hasOwnProperty("reservedRange")
								) {
									if (!Array.isArray(e.reservedRange))
										return "reservedRange: array expected"
									for (var t = 0; t < e.reservedRange.length; ++t) {
										var r =
											n.google.protobuf.DescriptorProto.ReservedRange.verify(
												e.reservedRange[t]
											)
										if (r) return "reservedRange." + r
									}
								}
								if (
									e.reservedName != null &&
									e.hasOwnProperty("reservedName")
								) {
									if (!Array.isArray(e.reservedName))
										return "reservedName: array expected"
									for (var t = 0; t < e.reservedName.length; ++t)
										if (!o.isString(e.reservedName[t]))
											return "reservedName: string[] expected"
								}
								return null
							}
							DescriptorProto.fromObject = function fromObject(e) {
								if (e instanceof n.google.protobuf.DescriptorProto) return e
								var t = new n.google.protobuf.DescriptorProto()
								if (e.name != null) t.name = String(e.name)
								if (e.field) {
									if (!Array.isArray(e.field))
										throw TypeError(
											".google.protobuf.DescriptorProto.field: array expected"
										)
									t.field = []
									for (var r = 0; r < e.field.length; ++r) {
										if (typeof e.field[r] !== "object")
											throw TypeError(
												".google.protobuf.DescriptorProto.field: object expected"
											)
										t.field[r] =
											n.google.protobuf.FieldDescriptorProto.fromObject(
												e.field[r]
											)
									}
								}
								if (e.extension) {
									if (!Array.isArray(e.extension))
										throw TypeError(
											".google.protobuf.DescriptorProto.extension: array expected"
										)
									t.extension = []
									for (var r = 0; r < e.extension.length; ++r) {
										if (typeof e.extension[r] !== "object")
											throw TypeError(
												".google.protobuf.DescriptorProto.extension: object expected"
											)
										t.extension[r] =
											n.google.protobuf.FieldDescriptorProto.fromObject(
												e.extension[r]
											)
									}
								}
								if (e.nestedType) {
									if (!Array.isArray(e.nestedType))
										throw TypeError(
											".google.protobuf.DescriptorProto.nestedType: array expected"
										)
									t.nestedType = []
									for (var r = 0; r < e.nestedType.length; ++r) {
										if (typeof e.nestedType[r] !== "object")
											throw TypeError(
												".google.protobuf.DescriptorProto.nestedType: object expected"
											)
										t.nestedType[r] =
											n.google.protobuf.DescriptorProto.fromObject(
												e.nestedType[r]
											)
									}
								}
								if (e.enumType) {
									if (!Array.isArray(e.enumType))
										throw TypeError(
											".google.protobuf.DescriptorProto.enumType: array expected"
										)
									t.enumType = []
									for (var r = 0; r < e.enumType.length; ++r) {
										if (typeof e.enumType[r] !== "object")
											throw TypeError(
												".google.protobuf.DescriptorProto.enumType: object expected"
											)
										t.enumType[r] =
											n.google.protobuf.EnumDescriptorProto.fromObject(
												e.enumType[r]
											)
									}
								}
								if (e.extensionRange) {
									if (!Array.isArray(e.extensionRange))
										throw TypeError(
											".google.protobuf.DescriptorProto.extensionRange: array expected"
										)
									t.extensionRange = []
									for (var r = 0; r < e.extensionRange.length; ++r) {
										if (typeof e.extensionRange[r] !== "object")
											throw TypeError(
												".google.protobuf.DescriptorProto.extensionRange: object expected"
											)
										t.extensionRange[r] =
											n.google.protobuf.DescriptorProto.ExtensionRange.fromObject(
												e.extensionRange[r]
											)
									}
								}
								if (e.oneofDecl) {
									if (!Array.isArray(e.oneofDecl))
										throw TypeError(
											".google.protobuf.DescriptorProto.oneofDecl: array expected"
										)
									t.oneofDecl = []
									for (var r = 0; r < e.oneofDecl.length; ++r) {
										if (typeof e.oneofDecl[r] !== "object")
											throw TypeError(
												".google.protobuf.DescriptorProto.oneofDecl: object expected"
											)
										t.oneofDecl[r] =
											n.google.protobuf.OneofDescriptorProto.fromObject(
												e.oneofDecl[r]
											)
									}
								}
								if (e.options != null) {
									if (typeof e.options !== "object")
										throw TypeError(
											".google.protobuf.DescriptorProto.options: object expected"
										)
									t.options = n.google.protobuf.MessageOptions.fromObject(
										e.options
									)
								}
								if (e.reservedRange) {
									if (!Array.isArray(e.reservedRange))
										throw TypeError(
											".google.protobuf.DescriptorProto.reservedRange: array expected"
										)
									t.reservedRange = []
									for (var r = 0; r < e.reservedRange.length; ++r) {
										if (typeof e.reservedRange[r] !== "object")
											throw TypeError(
												".google.protobuf.DescriptorProto.reservedRange: object expected"
											)
										t.reservedRange[r] =
											n.google.protobuf.DescriptorProto.ReservedRange.fromObject(
												e.reservedRange[r]
											)
									}
								}
								if (e.reservedName) {
									if (!Array.isArray(e.reservedName))
										throw TypeError(
											".google.protobuf.DescriptorProto.reservedName: array expected"
										)
									t.reservedName = []
									for (var r = 0; r < e.reservedName.length; ++r)
										t.reservedName[r] = String(e.reservedName[r])
								}
								return t
							}
							DescriptorProto.toObject = function toObject(e, t) {
								if (!t) t = {}
								var r = {}
								if (t.arrays || t.defaults) {
									r.field = []
									r.nestedType = []
									r.enumType = []
									r.extensionRange = []
									r.extension = []
									r.oneofDecl = []
									r.reservedRange = []
									r.reservedName = []
								}
								if (t.defaults) {
									r.name = ""
									r.options = null
								}
								if (e.name != null && e.hasOwnProperty("name")) r.name = e.name
								if (e.field && e.field.length) {
									r.field = []
									for (var o = 0; o < e.field.length; ++o)
										r.field[o] =
											n.google.protobuf.FieldDescriptorProto.toObject(
												e.field[o],
												t
											)
								}
								if (e.nestedType && e.nestedType.length) {
									r.nestedType = []
									for (var o = 0; o < e.nestedType.length; ++o)
										r.nestedType[o] =
											n.google.protobuf.DescriptorProto.toObject(
												e.nestedType[o],
												t
											)
								}
								if (e.enumType && e.enumType.length) {
									r.enumType = []
									for (var o = 0; o < e.enumType.length; ++o)
										r.enumType[o] =
											n.google.protobuf.EnumDescriptorProto.toObject(
												e.enumType[o],
												t
											)
								}
								if (e.extensionRange && e.extensionRange.length) {
									r.extensionRange = []
									for (var o = 0; o < e.extensionRange.length; ++o)
										r.extensionRange[o] =
											n.google.protobuf.DescriptorProto.ExtensionRange.toObject(
												e.extensionRange[o],
												t
											)
								}
								if (e.extension && e.extension.length) {
									r.extension = []
									for (var o = 0; o < e.extension.length; ++o)
										r.extension[o] =
											n.google.protobuf.FieldDescriptorProto.toObject(
												e.extension[o],
												t
											)
								}
								if (e.options != null && e.hasOwnProperty("options"))
									r.options = n.google.protobuf.MessageOptions.toObject(
										e.options,
										t
									)
								if (e.oneofDecl && e.oneofDecl.length) {
									r.oneofDecl = []
									for (var o = 0; o < e.oneofDecl.length; ++o)
										r.oneofDecl[o] =
											n.google.protobuf.OneofDescriptorProto.toObject(
												e.oneofDecl[o],
												t
											)
								}
								if (e.reservedRange && e.reservedRange.length) {
									r.reservedRange = []
									for (var o = 0; o < e.reservedRange.length; ++o)
										r.reservedRange[o] =
											n.google.protobuf.DescriptorProto.ReservedRange.toObject(
												e.reservedRange[o],
												t
											)
								}
								if (e.reservedName && e.reservedName.length) {
									r.reservedName = []
									for (var o = 0; o < e.reservedName.length; ++o)
										r.reservedName[o] = e.reservedName[o]
								}
								return r
							}
							DescriptorProto.prototype.toJSON = function toJSON() {
								return this.constructor.toObject(this, e.util.toJSONOptions)
							}
							DescriptorProto.ExtensionRange = (function () {
								function ExtensionRange(e) {
									if (e)
										for (var t = Object.keys(e), r = 0; r < t.length; ++r)
											if (e[t[r]] != null) this[t[r]] = e[t[r]]
								}
								ExtensionRange.prototype.start = 0
								ExtensionRange.prototype.end = 0
								ExtensionRange.prototype.options = null
								ExtensionRange.create = function create(e) {
									return new ExtensionRange(e)
								}
								ExtensionRange.encode = function encode(e, t) {
									if (!t) t = r.create()
									if (e.start != null && Object.hasOwnProperty.call(e, "start"))
										t.uint32(8).int32(e.start)
									if (e.end != null && Object.hasOwnProperty.call(e, "end"))
										t.uint32(16).int32(e.end)
									if (
										e.options != null &&
										Object.hasOwnProperty.call(e, "options")
									)
										n.google.protobuf.ExtensionRangeOptions.encode(
											e.options,
											t.uint32(26).fork()
										).ldelim()
									return t
								}
								ExtensionRange.encodeDelimited = function encodeDelimited(
									e,
									t
								) {
									return this.encode(e, t).ldelim()
								}
								ExtensionRange.decode = function decode(e, r) {
									if (!(e instanceof t)) e = t.create(e)
									var o = r === undefined ? e.len : e.pos + r,
										i = new n.google.protobuf.DescriptorProto.ExtensionRange()
									while (e.pos < o) {
										var a = e.uint32()
										switch (a >>> 3) {
											case 1:
												i.start = e.int32()
												break
											case 2:
												i.end = e.int32()
												break
											case 3:
												i.options =
													n.google.protobuf.ExtensionRangeOptions.decode(
														e,
														e.uint32()
													)
												break
											default:
												e.skipType(a & 7)
												break
										}
									}
									return i
								}
								ExtensionRange.decodeDelimited = function decodeDelimited(e) {
									if (!(e instanceof t)) e = new t(e)
									return this.decode(e, e.uint32())
								}
								ExtensionRange.verify = function verify(e) {
									if (typeof e !== "object" || e === null)
										return "object expected"
									if (e.start != null && e.hasOwnProperty("start"))
										if (!o.isInteger(e.start)) return "start: integer expected"
									if (e.end != null && e.hasOwnProperty("end"))
										if (!o.isInteger(e.end)) return "end: integer expected"
									if (e.options != null && e.hasOwnProperty("options")) {
										var t = n.google.protobuf.ExtensionRangeOptions.verify(
											e.options
										)
										if (t) return "options." + t
									}
									return null
								}
								ExtensionRange.fromObject = function fromObject(e) {
									if (
										e instanceof
										n.google.protobuf.DescriptorProto.ExtensionRange
									)
										return e
									var t = new n.google.protobuf.DescriptorProto.ExtensionRange()
									if (e.start != null) t.start = e.start | 0
									if (e.end != null) t.end = e.end | 0
									if (e.options != null) {
										if (typeof e.options !== "object")
											throw TypeError(
												".google.protobuf.DescriptorProto.ExtensionRange.options: object expected"
											)
										t.options =
											n.google.protobuf.ExtensionRangeOptions.fromObject(
												e.options
											)
									}
									return t
								}
								ExtensionRange.toObject = function toObject(e, t) {
									if (!t) t = {}
									var r = {}
									if (t.defaults) {
										r.start = 0
										r.end = 0
										r.options = null
									}
									if (e.start != null && e.hasOwnProperty("start"))
										r.start = e.start
									if (e.end != null && e.hasOwnProperty("end")) r.end = e.end
									if (e.options != null && e.hasOwnProperty("options"))
										r.options =
											n.google.protobuf.ExtensionRangeOptions.toObject(
												e.options,
												t
											)
									return r
								}
								ExtensionRange.prototype.toJSON = function toJSON() {
									return this.constructor.toObject(this, e.util.toJSONOptions)
								}
								return ExtensionRange
							})()
							DescriptorProto.ReservedRange = (function () {
								function ReservedRange(e) {
									if (e)
										for (var t = Object.keys(e), r = 0; r < t.length; ++r)
											if (e[t[r]] != null) this[t[r]] = e[t[r]]
								}
								ReservedRange.prototype.start = 0
								ReservedRange.prototype.end = 0
								ReservedRange.create = function create(e) {
									return new ReservedRange(e)
								}
								ReservedRange.encode = function encode(e, t) {
									if (!t) t = r.create()
									if (e.start != null && Object.hasOwnProperty.call(e, "start"))
										t.uint32(8).int32(e.start)
									if (e.end != null && Object.hasOwnProperty.call(e, "end"))
										t.uint32(16).int32(e.end)
									return t
								}
								ReservedRange.encodeDelimited = function encodeDelimited(e, t) {
									return this.encode(e, t).ldelim()
								}
								ReservedRange.decode = function decode(e, r) {
									if (!(e instanceof t)) e = t.create(e)
									var o = r === undefined ? e.len : e.pos + r,
										i = new n.google.protobuf.DescriptorProto.ReservedRange()
									while (e.pos < o) {
										var a = e.uint32()
										switch (a >>> 3) {
											case 1:
												i.start = e.int32()
												break
											case 2:
												i.end = e.int32()
												break
											default:
												e.skipType(a & 7)
												break
										}
									}
									return i
								}
								ReservedRange.decodeDelimited = function decodeDelimited(e) {
									if (!(e instanceof t)) e = new t(e)
									return this.decode(e, e.uint32())
								}
								ReservedRange.verify = function verify(e) {
									if (typeof e !== "object" || e === null)
										return "object expected"
									if (e.start != null && e.hasOwnProperty("start"))
										if (!o.isInteger(e.start)) return "start: integer expected"
									if (e.end != null && e.hasOwnProperty("end"))
										if (!o.isInteger(e.end)) return "end: integer expected"
									return null
								}
								ReservedRange.fromObject = function fromObject(e) {
									if (
										e instanceof n.google.protobuf.DescriptorProto.ReservedRange
									)
										return e
									var t = new n.google.protobuf.DescriptorProto.ReservedRange()
									if (e.start != null) t.start = e.start | 0
									if (e.end != null) t.end = e.end | 0
									return t
								}
								ReservedRange.toObject = function toObject(e, t) {
									if (!t) t = {}
									var r = {}
									if (t.defaults) {
										r.start = 0
										r.end = 0
									}
									if (e.start != null && e.hasOwnProperty("start"))
										r.start = e.start
									if (e.end != null && e.hasOwnProperty("end")) r.end = e.end
									return r
								}
								ReservedRange.prototype.toJSON = function toJSON() {
									return this.constructor.toObject(this, e.util.toJSONOptions)
								}
								return ReservedRange
							})()
							return DescriptorProto
						})()
						i.ExtensionRangeOptions = (function () {
							function ExtensionRangeOptions(e) {
								this.uninterpretedOption = []
								if (e)
									for (var t = Object.keys(e), r = 0; r < t.length; ++r)
										if (e[t[r]] != null) this[t[r]] = e[t[r]]
							}
							ExtensionRangeOptions.prototype.uninterpretedOption = o.emptyArray
							ExtensionRangeOptions.create = function create(e) {
								return new ExtensionRangeOptions(e)
							}
							ExtensionRangeOptions.encode = function encode(e, t) {
								if (!t) t = r.create()
								if (
									e.uninterpretedOption != null &&
									e.uninterpretedOption.length
								)
									for (var o = 0; o < e.uninterpretedOption.length; ++o)
										n.google.protobuf.UninterpretedOption.encode(
											e.uninterpretedOption[o],
											t.uint32(7994).fork()
										).ldelim()
								return t
							}
							ExtensionRangeOptions.encodeDelimited = function encodeDelimited(
								e,
								t
							) {
								return this.encode(e, t).ldelim()
							}
							ExtensionRangeOptions.decode = function decode(e, r) {
								if (!(e instanceof t)) e = t.create(e)
								var o = r === undefined ? e.len : e.pos + r,
									i = new n.google.protobuf.ExtensionRangeOptions()
								while (e.pos < o) {
									var a = e.uint32()
									switch (a >>> 3) {
										case 999:
											if (
												!(i.uninterpretedOption && i.uninterpretedOption.length)
											)
												i.uninterpretedOption = []
											i.uninterpretedOption.push(
												n.google.protobuf.UninterpretedOption.decode(
													e,
													e.uint32()
												)
											)
											break
										default:
											e.skipType(a & 7)
											break
									}
								}
								return i
							}
							ExtensionRangeOptions.decodeDelimited = function decodeDelimited(
								e
							) {
								if (!(e instanceof t)) e = new t(e)
								return this.decode(e, e.uint32())
							}
							ExtensionRangeOptions.verify = function verify(e) {
								if (typeof e !== "object" || e === null)
									return "object expected"
								if (
									e.uninterpretedOption != null &&
									e.hasOwnProperty("uninterpretedOption")
								) {
									if (!Array.isArray(e.uninterpretedOption))
										return "uninterpretedOption: array expected"
									for (var t = 0; t < e.uninterpretedOption.length; ++t) {
										var r = n.google.protobuf.UninterpretedOption.verify(
											e.uninterpretedOption[t]
										)
										if (r) return "uninterpretedOption." + r
									}
								}
								return null
							}
							ExtensionRangeOptions.fromObject = function fromObject(e) {
								if (e instanceof n.google.protobuf.ExtensionRangeOptions)
									return e
								var t = new n.google.protobuf.ExtensionRangeOptions()
								if (e.uninterpretedOption) {
									if (!Array.isArray(e.uninterpretedOption))
										throw TypeError(
											".google.protobuf.ExtensionRangeOptions.uninterpretedOption: array expected"
										)
									t.uninterpretedOption = []
									for (var r = 0; r < e.uninterpretedOption.length; ++r) {
										if (typeof e.uninterpretedOption[r] !== "object")
											throw TypeError(
												".google.protobuf.ExtensionRangeOptions.uninterpretedOption: object expected"
											)
										t.uninterpretedOption[r] =
											n.google.protobuf.UninterpretedOption.fromObject(
												e.uninterpretedOption[r]
											)
									}
								}
								return t
							}
							ExtensionRangeOptions.toObject = function toObject(e, t) {
								if (!t) t = {}
								var r = {}
								if (t.arrays || t.defaults) r.uninterpretedOption = []
								if (e.uninterpretedOption && e.uninterpretedOption.length) {
									r.uninterpretedOption = []
									for (var o = 0; o < e.uninterpretedOption.length; ++o)
										r.uninterpretedOption[o] =
											n.google.protobuf.UninterpretedOption.toObject(
												e.uninterpretedOption[o],
												t
											)
								}
								return r
							}
							ExtensionRangeOptions.prototype.toJSON = function toJSON() {
								return this.constructor.toObject(this, e.util.toJSONOptions)
							}
							return ExtensionRangeOptions
						})()
						i.FieldDescriptorProto = (function () {
							function FieldDescriptorProto(e) {
								if (e)
									for (var t = Object.keys(e), r = 0; r < t.length; ++r)
										if (e[t[r]] != null) this[t[r]] = e[t[r]]
							}
							FieldDescriptorProto.prototype.name = ""
							FieldDescriptorProto.prototype.number = 0
							FieldDescriptorProto.prototype.label = 1
							FieldDescriptorProto.prototype.type = 1
							FieldDescriptorProto.prototype.typeName = ""
							FieldDescriptorProto.prototype.extendee = ""
							FieldDescriptorProto.prototype.defaultValue = ""
							FieldDescriptorProto.prototype.oneofIndex = 0
							FieldDescriptorProto.prototype.jsonName = ""
							FieldDescriptorProto.prototype.options = null
							FieldDescriptorProto.prototype.proto3Optional = false
							FieldDescriptorProto.create = function create(e) {
								return new FieldDescriptorProto(e)
							}
							FieldDescriptorProto.encode = function encode(e, t) {
								if (!t) t = r.create()
								if (e.name != null && Object.hasOwnProperty.call(e, "name"))
									t.uint32(10).string(e.name)
								if (
									e.extendee != null &&
									Object.hasOwnProperty.call(e, "extendee")
								)
									t.uint32(18).string(e.extendee)
								if (e.number != null && Object.hasOwnProperty.call(e, "number"))
									t.uint32(24).int32(e.number)
								if (e.label != null && Object.hasOwnProperty.call(e, "label"))
									t.uint32(32).int32(e.label)
								if (e.type != null && Object.hasOwnProperty.call(e, "type"))
									t.uint32(40).int32(e.type)
								if (
									e.typeName != null &&
									Object.hasOwnProperty.call(e, "typeName")
								)
									t.uint32(50).string(e.typeName)
								if (
									e.defaultValue != null &&
									Object.hasOwnProperty.call(e, "defaultValue")
								)
									t.uint32(58).string(e.defaultValue)
								if (
									e.options != null &&
									Object.hasOwnProperty.call(e, "options")
								)
									n.google.protobuf.FieldOptions.encode(
										e.options,
										t.uint32(66).fork()
									).ldelim()
								if (
									e.oneofIndex != null &&
									Object.hasOwnProperty.call(e, "oneofIndex")
								)
									t.uint32(72).int32(e.oneofIndex)
								if (
									e.jsonName != null &&
									Object.hasOwnProperty.call(e, "jsonName")
								)
									t.uint32(82).string(e.jsonName)
								if (
									e.proto3Optional != null &&
									Object.hasOwnProperty.call(e, "proto3Optional")
								)
									t.uint32(136).bool(e.proto3Optional)
								return t
							}
							FieldDescriptorProto.encodeDelimited = function encodeDelimited(
								e,
								t
							) {
								return this.encode(e, t).ldelim()
							}
							FieldDescriptorProto.decode = function decode(e, r) {
								if (!(e instanceof t)) e = t.create(e)
								var o = r === undefined ? e.len : e.pos + r,
									i = new n.google.protobuf.FieldDescriptorProto()
								while (e.pos < o) {
									var a = e.uint32()
									switch (a >>> 3) {
										case 1:
											i.name = e.string()
											break
										case 3:
											i.number = e.int32()
											break
										case 4:
											i.label = e.int32()
											break
										case 5:
											i.type = e.int32()
											break
										case 6:
											i.typeName = e.string()
											break
										case 2:
											i.extendee = e.string()
											break
										case 7:
											i.defaultValue = e.string()
											break
										case 9:
											i.oneofIndex = e.int32()
											break
										case 10:
											i.jsonName = e.string()
											break
										case 8:
											i.options = n.google.protobuf.FieldOptions.decode(
												e,
												e.uint32()
											)
											break
										case 17:
											i.proto3Optional = e.bool()
											break
										default:
											e.skipType(a & 7)
											break
									}
								}
								return i
							}
							FieldDescriptorProto.decodeDelimited = function decodeDelimited(
								e
							) {
								if (!(e instanceof t)) e = new t(e)
								return this.decode(e, e.uint32())
							}
							FieldDescriptorProto.verify = function verify(e) {
								if (typeof e !== "object" || e === null)
									return "object expected"
								if (e.name != null && e.hasOwnProperty("name"))
									if (!o.isString(e.name)) return "name: string expected"
								if (e.number != null && e.hasOwnProperty("number"))
									if (!o.isInteger(e.number)) return "number: integer expected"
								if (e.label != null && e.hasOwnProperty("label"))
									switch (e.label) {
										default:
											return "label: enum value expected"
										case 1:
										case 2:
										case 3:
											break
									}
								if (e.type != null && e.hasOwnProperty("type"))
									switch (e.type) {
										default:
											return "type: enum value expected"
										case 1:
										case 2:
										case 3:
										case 4:
										case 5:
										case 6:
										case 7:
										case 8:
										case 9:
										case 10:
										case 11:
										case 12:
										case 13:
										case 14:
										case 15:
										case 16:
										case 17:
										case 18:
											break
									}
								if (e.typeName != null && e.hasOwnProperty("typeName"))
									if (!o.isString(e.typeName))
										return "typeName: string expected"
								if (e.extendee != null && e.hasOwnProperty("extendee"))
									if (!o.isString(e.extendee))
										return "extendee: string expected"
								if (e.defaultValue != null && e.hasOwnProperty("defaultValue"))
									if (!o.isString(e.defaultValue))
										return "defaultValue: string expected"
								if (e.oneofIndex != null && e.hasOwnProperty("oneofIndex"))
									if (!o.isInteger(e.oneofIndex))
										return "oneofIndex: integer expected"
								if (e.jsonName != null && e.hasOwnProperty("jsonName"))
									if (!o.isString(e.jsonName))
										return "jsonName: string expected"
								if (e.options != null && e.hasOwnProperty("options")) {
									var t = n.google.protobuf.FieldOptions.verify(e.options)
									if (t) return "options." + t
								}
								if (
									e.proto3Optional != null &&
									e.hasOwnProperty("proto3Optional")
								)
									if (typeof e.proto3Optional !== "boolean")
										return "proto3Optional: boolean expected"
								return null
							}
							FieldDescriptorProto.fromObject = function fromObject(e) {
								if (e instanceof n.google.protobuf.FieldDescriptorProto)
									return e
								var t = new n.google.protobuf.FieldDescriptorProto()
								if (e.name != null) t.name = String(e.name)
								if (e.number != null) t.number = e.number | 0
								switch (e.label) {
									case "LABEL_OPTIONAL":
									case 1:
										t.label = 1
										break
									case "LABEL_REQUIRED":
									case 2:
										t.label = 2
										break
									case "LABEL_REPEATED":
									case 3:
										t.label = 3
										break
								}
								switch (e.type) {
									case "TYPE_DOUBLE":
									case 1:
										t.type = 1
										break
									case "TYPE_FLOAT":
									case 2:
										t.type = 2
										break
									case "TYPE_INT64":
									case 3:
										t.type = 3
										break
									case "TYPE_UINT64":
									case 4:
										t.type = 4
										break
									case "TYPE_INT32":
									case 5:
										t.type = 5
										break
									case "TYPE_FIXED64":
									case 6:
										t.type = 6
										break
									case "TYPE_FIXED32":
									case 7:
										t.type = 7
										break
									case "TYPE_BOOL":
									case 8:
										t.type = 8
										break
									case "TYPE_STRING":
									case 9:
										t.type = 9
										break
									case "TYPE_GROUP":
									case 10:
										t.type = 10
										break
									case "TYPE_MESSAGE":
									case 11:
										t.type = 11
										break
									case "TYPE_BYTES":
									case 12:
										t.type = 12
										break
									case "TYPE_UINT32":
									case 13:
										t.type = 13
										break
									case "TYPE_ENUM":
									case 14:
										t.type = 14
										break
									case "TYPE_SFIXED32":
									case 15:
										t.type = 15
										break
									case "TYPE_SFIXED64":
									case 16:
										t.type = 16
										break
									case "TYPE_SINT32":
									case 17:
										t.type = 17
										break
									case "TYPE_SINT64":
									case 18:
										t.type = 18
										break
								}
								if (e.typeName != null) t.typeName = String(e.typeName)
								if (e.extendee != null) t.extendee = String(e.extendee)
								if (e.defaultValue != null)
									t.defaultValue = String(e.defaultValue)
								if (e.oneofIndex != null) t.oneofIndex = e.oneofIndex | 0
								if (e.jsonName != null) t.jsonName = String(e.jsonName)
								if (e.options != null) {
									if (typeof e.options !== "object")
										throw TypeError(
											".google.protobuf.FieldDescriptorProto.options: object expected"
										)
									t.options = n.google.protobuf.FieldOptions.fromObject(
										e.options
									)
								}
								if (e.proto3Optional != null)
									t.proto3Optional = Boolean(e.proto3Optional)
								return t
							}
							FieldDescriptorProto.toObject = function toObject(e, t) {
								if (!t) t = {}
								var r = {}
								if (t.defaults) {
									r.name = ""
									r.extendee = ""
									r.number = 0
									r.label = t.enums === String ? "LABEL_OPTIONAL" : 1
									r.type = t.enums === String ? "TYPE_DOUBLE" : 1
									r.typeName = ""
									r.defaultValue = ""
									r.options = null
									r.oneofIndex = 0
									r.jsonName = ""
									r.proto3Optional = false
								}
								if (e.name != null && e.hasOwnProperty("name")) r.name = e.name
								if (e.extendee != null && e.hasOwnProperty("extendee"))
									r.extendee = e.extendee
								if (e.number != null && e.hasOwnProperty("number"))
									r.number = e.number
								if (e.label != null && e.hasOwnProperty("label"))
									r.label =
										t.enums === String
											? n.google.protobuf.FieldDescriptorProto.Label[e.label]
											: e.label
								if (e.type != null && e.hasOwnProperty("type"))
									r.type =
										t.enums === String
											? n.google.protobuf.FieldDescriptorProto.Type[e.type]
											: e.type
								if (e.typeName != null && e.hasOwnProperty("typeName"))
									r.typeName = e.typeName
								if (e.defaultValue != null && e.hasOwnProperty("defaultValue"))
									r.defaultValue = e.defaultValue
								if (e.options != null && e.hasOwnProperty("options"))
									r.options = n.google.protobuf.FieldOptions.toObject(
										e.options,
										t
									)
								if (e.oneofIndex != null && e.hasOwnProperty("oneofIndex"))
									r.oneofIndex = e.oneofIndex
								if (e.jsonName != null && e.hasOwnProperty("jsonName"))
									r.jsonName = e.jsonName
								if (
									e.proto3Optional != null &&
									e.hasOwnProperty("proto3Optional")
								)
									r.proto3Optional = e.proto3Optional
								return r
							}
							FieldDescriptorProto.prototype.toJSON = function toJSON() {
								return this.constructor.toObject(this, e.util.toJSONOptions)
							}
							FieldDescriptorProto.Type = (function () {
								var e = {},
									t = Object.create(e)
								t[(e[1] = "TYPE_DOUBLE")] = 1
								t[(e[2] = "TYPE_FLOAT")] = 2
								t[(e[3] = "TYPE_INT64")] = 3
								t[(e[4] = "TYPE_UINT64")] = 4
								t[(e[5] = "TYPE_INT32")] = 5
								t[(e[6] = "TYPE_FIXED64")] = 6
								t[(e[7] = "TYPE_FIXED32")] = 7
								t[(e[8] = "TYPE_BOOL")] = 8
								t[(e[9] = "TYPE_STRING")] = 9
								t[(e[10] = "TYPE_GROUP")] = 10
								t[(e[11] = "TYPE_MESSAGE")] = 11
								t[(e[12] = "TYPE_BYTES")] = 12
								t[(e[13] = "TYPE_UINT32")] = 13
								t[(e[14] = "TYPE_ENUM")] = 14
								t[(e[15] = "TYPE_SFIXED32")] = 15
								t[(e[16] = "TYPE_SFIXED64")] = 16
								t[(e[17] = "TYPE_SINT32")] = 17
								t[(e[18] = "TYPE_SINT64")] = 18
								return t
							})()
							FieldDescriptorProto.Label = (function () {
								var e = {},
									t = Object.create(e)
								t[(e[1] = "LABEL_OPTIONAL")] = 1
								t[(e[2] = "LABEL_REQUIRED")] = 2
								t[(e[3] = "LABEL_REPEATED")] = 3
								return t
							})()
							return FieldDescriptorProto
						})()
						i.OneofDescriptorProto = (function () {
							function OneofDescriptorProto(e) {
								if (e)
									for (var t = Object.keys(e), r = 0; r < t.length; ++r)
										if (e[t[r]] != null) this[t[r]] = e[t[r]]
							}
							OneofDescriptorProto.prototype.name = ""
							OneofDescriptorProto.prototype.options = null
							OneofDescriptorProto.create = function create(e) {
								return new OneofDescriptorProto(e)
							}
							OneofDescriptorProto.encode = function encode(e, t) {
								if (!t) t = r.create()
								if (e.name != null && Object.hasOwnProperty.call(e, "name"))
									t.uint32(10).string(e.name)
								if (
									e.options != null &&
									Object.hasOwnProperty.call(e, "options")
								)
									n.google.protobuf.OneofOptions.encode(
										e.options,
										t.uint32(18).fork()
									).ldelim()
								return t
							}
							OneofDescriptorProto.encodeDelimited = function encodeDelimited(
								e,
								t
							) {
								return this.encode(e, t).ldelim()
							}
							OneofDescriptorProto.decode = function decode(e, r) {
								if (!(e instanceof t)) e = t.create(e)
								var o = r === undefined ? e.len : e.pos + r,
									i = new n.google.protobuf.OneofDescriptorProto()
								while (e.pos < o) {
									var a = e.uint32()
									switch (a >>> 3) {
										case 1:
											i.name = e.string()
											break
										case 2:
											i.options = n.google.protobuf.OneofOptions.decode(
												e,
												e.uint32()
											)
											break
										default:
											e.skipType(a & 7)
											break
									}
								}
								return i
							}
							OneofDescriptorProto.decodeDelimited = function decodeDelimited(
								e
							) {
								if (!(e instanceof t)) e = new t(e)
								return this.decode(e, e.uint32())
							}
							OneofDescriptorProto.verify = function verify(e) {
								if (typeof e !== "object" || e === null)
									return "object expected"
								if (e.name != null && e.hasOwnProperty("name"))
									if (!o.isString(e.name)) return "name: string expected"
								if (e.options != null && e.hasOwnProperty("options")) {
									var t = n.google.protobuf.OneofOptions.verify(e.options)
									if (t) return "options." + t
								}
								return null
							}
							OneofDescriptorProto.fromObject = function fromObject(e) {
								if (e instanceof n.google.protobuf.OneofDescriptorProto)
									return e
								var t = new n.google.protobuf.OneofDescriptorProto()
								if (e.name != null) t.name = String(e.name)
								if (e.options != null) {
									if (typeof e.options !== "object")
										throw TypeError(
											".google.protobuf.OneofDescriptorProto.options: object expected"
										)
									t.options = n.google.protobuf.OneofOptions.fromObject(
										e.options
									)
								}
								return t
							}
							OneofDescriptorProto.toObject = function toObject(e, t) {
								if (!t) t = {}
								var r = {}
								if (t.defaults) {
									r.name = ""
									r.options = null
								}
								if (e.name != null && e.hasOwnProperty("name")) r.name = e.name
								if (e.options != null && e.hasOwnProperty("options"))
									r.options = n.google.protobuf.OneofOptions.toObject(
										e.options,
										t
									)
								return r
							}
							OneofDescriptorProto.prototype.toJSON = function toJSON() {
								return this.constructor.toObject(this, e.util.toJSONOptions)
							}
							return OneofDescriptorProto
						})()
						i.EnumDescriptorProto = (function () {
							function EnumDescriptorProto(e) {
								this.value = []
								this.reservedRange = []
								this.reservedName = []
								if (e)
									for (var t = Object.keys(e), r = 0; r < t.length; ++r)
										if (e[t[r]] != null) this[t[r]] = e[t[r]]
							}
							EnumDescriptorProto.prototype.name = ""
							EnumDescriptorProto.prototype.value = o.emptyArray
							EnumDescriptorProto.prototype.options = null
							EnumDescriptorProto.prototype.reservedRange = o.emptyArray
							EnumDescriptorProto.prototype.reservedName = o.emptyArray
							EnumDescriptorProto.create = function create(e) {
								return new EnumDescriptorProto(e)
							}
							EnumDescriptorProto.encode = function encode(e, t) {
								if (!t) t = r.create()
								if (e.name != null && Object.hasOwnProperty.call(e, "name"))
									t.uint32(10).string(e.name)
								if (e.value != null && e.value.length)
									for (var o = 0; o < e.value.length; ++o)
										n.google.protobuf.EnumValueDescriptorProto.encode(
											e.value[o],
											t.uint32(18).fork()
										).ldelim()
								if (
									e.options != null &&
									Object.hasOwnProperty.call(e, "options")
								)
									n.google.protobuf.EnumOptions.encode(
										e.options,
										t.uint32(26).fork()
									).ldelim()
								if (e.reservedRange != null && e.reservedRange.length)
									for (var o = 0; o < e.reservedRange.length; ++o)
										n.google.protobuf.EnumDescriptorProto.EnumReservedRange.encode(
											e.reservedRange[o],
											t.uint32(34).fork()
										).ldelim()
								if (e.reservedName != null && e.reservedName.length)
									for (var o = 0; o < e.reservedName.length; ++o)
										t.uint32(42).string(e.reservedName[o])
								return t
							}
							EnumDescriptorProto.encodeDelimited = function encodeDelimited(
								e,
								t
							) {
								return this.encode(e, t).ldelim()
							}
							EnumDescriptorProto.decode = function decode(e, r) {
								if (!(e instanceof t)) e = t.create(e)
								var o = r === undefined ? e.len : e.pos + r,
									i = new n.google.protobuf.EnumDescriptorProto()
								while (e.pos < o) {
									var a = e.uint32()
									switch (a >>> 3) {
										case 1:
											i.name = e.string()
											break
										case 2:
											if (!(i.value && i.value.length)) i.value = []
											i.value.push(
												n.google.protobuf.EnumValueDescriptorProto.decode(
													e,
													e.uint32()
												)
											)
											break
										case 3:
											i.options = n.google.protobuf.EnumOptions.decode(
												e,
												e.uint32()
											)
											break
										case 4:
											if (!(i.reservedRange && i.reservedRange.length))
												i.reservedRange = []
											i.reservedRange.push(
												n.google.protobuf.EnumDescriptorProto.EnumReservedRange.decode(
													e,
													e.uint32()
												)
											)
											break
										case 5:
											if (!(i.reservedName && i.reservedName.length))
												i.reservedName = []
											i.reservedName.push(e.string())
											break
										default:
											e.skipType(a & 7)
											break
									}
								}
								return i
							}
							EnumDescriptorProto.decodeDelimited = function decodeDelimited(
								e
							) {
								if (!(e instanceof t)) e = new t(e)
								return this.decode(e, e.uint32())
							}
							EnumDescriptorProto.verify = function verify(e) {
								if (typeof e !== "object" || e === null)
									return "object expected"
								if (e.name != null && e.hasOwnProperty("name"))
									if (!o.isString(e.name)) return "name: string expected"
								if (e.value != null && e.hasOwnProperty("value")) {
									if (!Array.isArray(e.value)) return "value: array expected"
									for (var t = 0; t < e.value.length; ++t) {
										var r = n.google.protobuf.EnumValueDescriptorProto.verify(
											e.value[t]
										)
										if (r) return "value." + r
									}
								}
								if (e.options != null && e.hasOwnProperty("options")) {
									var r = n.google.protobuf.EnumOptions.verify(e.options)
									if (r) return "options." + r
								}
								if (
									e.reservedRange != null &&
									e.hasOwnProperty("reservedRange")
								) {
									if (!Array.isArray(e.reservedRange))
										return "reservedRange: array expected"
									for (var t = 0; t < e.reservedRange.length; ++t) {
										var r =
											n.google.protobuf.EnumDescriptorProto.EnumReservedRange.verify(
												e.reservedRange[t]
											)
										if (r) return "reservedRange." + r
									}
								}
								if (
									e.reservedName != null &&
									e.hasOwnProperty("reservedName")
								) {
									if (!Array.isArray(e.reservedName))
										return "reservedName: array expected"
									for (var t = 0; t < e.reservedName.length; ++t)
										if (!o.isString(e.reservedName[t]))
											return "reservedName: string[] expected"
								}
								return null
							}
							EnumDescriptorProto.fromObject = function fromObject(e) {
								if (e instanceof n.google.protobuf.EnumDescriptorProto) return e
								var t = new n.google.protobuf.EnumDescriptorProto()
								if (e.name != null) t.name = String(e.name)
								if (e.value) {
									if (!Array.isArray(e.value))
										throw TypeError(
											".google.protobuf.EnumDescriptorProto.value: array expected"
										)
									t.value = []
									for (var r = 0; r < e.value.length; ++r) {
										if (typeof e.value[r] !== "object")
											throw TypeError(
												".google.protobuf.EnumDescriptorProto.value: object expected"
											)
										t.value[r] =
											n.google.protobuf.EnumValueDescriptorProto.fromObject(
												e.value[r]
											)
									}
								}
								if (e.options != null) {
									if (typeof e.options !== "object")
										throw TypeError(
											".google.protobuf.EnumDescriptorProto.options: object expected"
										)
									t.options = n.google.protobuf.EnumOptions.fromObject(
										e.options
									)
								}
								if (e.reservedRange) {
									if (!Array.isArray(e.reservedRange))
										throw TypeError(
											".google.protobuf.EnumDescriptorProto.reservedRange: array expected"
										)
									t.reservedRange = []
									for (var r = 0; r < e.reservedRange.length; ++r) {
										if (typeof e.reservedRange[r] !== "object")
											throw TypeError(
												".google.protobuf.EnumDescriptorProto.reservedRange: object expected"
											)
										t.reservedRange[r] =
											n.google.protobuf.EnumDescriptorProto.EnumReservedRange.fromObject(
												e.reservedRange[r]
											)
									}
								}
								if (e.reservedName) {
									if (!Array.isArray(e.reservedName))
										throw TypeError(
											".google.protobuf.EnumDescriptorProto.reservedName: array expected"
										)
									t.reservedName = []
									for (var r = 0; r < e.reservedName.length; ++r)
										t.reservedName[r] = String(e.reservedName[r])
								}
								return t
							}
							EnumDescriptorProto.toObject = function toObject(e, t) {
								if (!t) t = {}
								var r = {}
								if (t.arrays || t.defaults) {
									r.value = []
									r.reservedRange = []
									r.reservedName = []
								}
								if (t.defaults) {
									r.name = ""
									r.options = null
								}
								if (e.name != null && e.hasOwnProperty("name")) r.name = e.name
								if (e.value && e.value.length) {
									r.value = []
									for (var o = 0; o < e.value.length; ++o)
										r.value[o] =
											n.google.protobuf.EnumValueDescriptorProto.toObject(
												e.value[o],
												t
											)
								}
								if (e.options != null && e.hasOwnProperty("options"))
									r.options = n.google.protobuf.EnumOptions.toObject(
										e.options,
										t
									)
								if (e.reservedRange && e.reservedRange.length) {
									r.reservedRange = []
									for (var o = 0; o < e.reservedRange.length; ++o)
										r.reservedRange[o] =
											n.google.protobuf.EnumDescriptorProto.EnumReservedRange.toObject(
												e.reservedRange[o],
												t
											)
								}
								if (e.reservedName && e.reservedName.length) {
									r.reservedName = []
									for (var o = 0; o < e.reservedName.length; ++o)
										r.reservedName[o] = e.reservedName[o]
								}
								return r
							}
							EnumDescriptorProto.prototype.toJSON = function toJSON() {
								return this.constructor.toObject(this, e.util.toJSONOptions)
							}
							EnumDescriptorProto.EnumReservedRange = (function () {
								function EnumReservedRange(e) {
									if (e)
										for (var t = Object.keys(e), r = 0; r < t.length; ++r)
											if (e[t[r]] != null) this[t[r]] = e[t[r]]
								}
								EnumReservedRange.prototype.start = 0
								EnumReservedRange.prototype.end = 0
								EnumReservedRange.create = function create(e) {
									return new EnumReservedRange(e)
								}
								EnumReservedRange.encode = function encode(e, t) {
									if (!t) t = r.create()
									if (e.start != null && Object.hasOwnProperty.call(e, "start"))
										t.uint32(8).int32(e.start)
									if (e.end != null && Object.hasOwnProperty.call(e, "end"))
										t.uint32(16).int32(e.end)
									return t
								}
								EnumReservedRange.encodeDelimited = function encodeDelimited(
									e,
									t
								) {
									return this.encode(e, t).ldelim()
								}
								EnumReservedRange.decode = function decode(e, r) {
									if (!(e instanceof t)) e = t.create(e)
									var o = r === undefined ? e.len : e.pos + r,
										i =
											new n.google.protobuf.EnumDescriptorProto.EnumReservedRange()
									while (e.pos < o) {
										var a = e.uint32()
										switch (a >>> 3) {
											case 1:
												i.start = e.int32()
												break
											case 2:
												i.end = e.int32()
												break
											default:
												e.skipType(a & 7)
												break
										}
									}
									return i
								}
								EnumReservedRange.decodeDelimited = function decodeDelimited(
									e
								) {
									if (!(e instanceof t)) e = new t(e)
									return this.decode(e, e.uint32())
								}
								EnumReservedRange.verify = function verify(e) {
									if (typeof e !== "object" || e === null)
										return "object expected"
									if (e.start != null && e.hasOwnProperty("start"))
										if (!o.isInteger(e.start)) return "start: integer expected"
									if (e.end != null && e.hasOwnProperty("end"))
										if (!o.isInteger(e.end)) return "end: integer expected"
									return null
								}
								EnumReservedRange.fromObject = function fromObject(e) {
									if (
										e instanceof
										n.google.protobuf.EnumDescriptorProto.EnumReservedRange
									)
										return e
									var t =
										new n.google.protobuf.EnumDescriptorProto.EnumReservedRange()
									if (e.start != null) t.start = e.start | 0
									if (e.end != null) t.end = e.end | 0
									return t
								}
								EnumReservedRange.toObject = function toObject(e, t) {
									if (!t) t = {}
									var r = {}
									if (t.defaults) {
										r.start = 0
										r.end = 0
									}
									if (e.start != null && e.hasOwnProperty("start"))
										r.start = e.start
									if (e.end != null && e.hasOwnProperty("end")) r.end = e.end
									return r
								}
								EnumReservedRange.prototype.toJSON = function toJSON() {
									return this.constructor.toObject(this, e.util.toJSONOptions)
								}
								return EnumReservedRange
							})()
							return EnumDescriptorProto
						})()
						i.EnumValueDescriptorProto = (function () {
							function EnumValueDescriptorProto(e) {
								if (e)
									for (var t = Object.keys(e), r = 0; r < t.length; ++r)
										if (e[t[r]] != null) this[t[r]] = e[t[r]]
							}
							EnumValueDescriptorProto.prototype.name = ""
							EnumValueDescriptorProto.prototype.number = 0
							EnumValueDescriptorProto.prototype.options = null
							EnumValueDescriptorProto.create = function create(e) {
								return new EnumValueDescriptorProto(e)
							}
							EnumValueDescriptorProto.encode = function encode(e, t) {
								if (!t) t = r.create()
								if (e.name != null && Object.hasOwnProperty.call(e, "name"))
									t.uint32(10).string(e.name)
								if (e.number != null && Object.hasOwnProperty.call(e, "number"))
									t.uint32(16).int32(e.number)
								if (
									e.options != null &&
									Object.hasOwnProperty.call(e, "options")
								)
									n.google.protobuf.EnumValueOptions.encode(
										e.options,
										t.uint32(26).fork()
									).ldelim()
								return t
							}
							EnumValueDescriptorProto.encodeDelimited =
								function encodeDelimited(e, t) {
									return this.encode(e, t).ldelim()
								}
							EnumValueDescriptorProto.decode = function decode(e, r) {
								if (!(e instanceof t)) e = t.create(e)
								var o = r === undefined ? e.len : e.pos + r,
									i = new n.google.protobuf.EnumValueDescriptorProto()
								while (e.pos < o) {
									var a = e.uint32()
									switch (a >>> 3) {
										case 1:
											i.name = e.string()
											break
										case 2:
											i.number = e.int32()
											break
										case 3:
											i.options = n.google.protobuf.EnumValueOptions.decode(
												e,
												e.uint32()
											)
											break
										default:
											e.skipType(a & 7)
											break
									}
								}
								return i
							}
							EnumValueDescriptorProto.decodeDelimited =
								function decodeDelimited(e) {
									if (!(e instanceof t)) e = new t(e)
									return this.decode(e, e.uint32())
								}
							EnumValueDescriptorProto.verify = function verify(e) {
								if (typeof e !== "object" || e === null)
									return "object expected"
								if (e.name != null && e.hasOwnProperty("name"))
									if (!o.isString(e.name)) return "name: string expected"
								if (e.number != null && e.hasOwnProperty("number"))
									if (!o.isInteger(e.number)) return "number: integer expected"
								if (e.options != null && e.hasOwnProperty("options")) {
									var t = n.google.protobuf.EnumValueOptions.verify(e.options)
									if (t) return "options." + t
								}
								return null
							}
							EnumValueDescriptorProto.fromObject = function fromObject(e) {
								if (e instanceof n.google.protobuf.EnumValueDescriptorProto)
									return e
								var t = new n.google.protobuf.EnumValueDescriptorProto()
								if (e.name != null) t.name = String(e.name)
								if (e.number != null) t.number = e.number | 0
								if (e.options != null) {
									if (typeof e.options !== "object")
										throw TypeError(
											".google.protobuf.EnumValueDescriptorProto.options: object expected"
										)
									t.options = n.google.protobuf.EnumValueOptions.fromObject(
										e.options
									)
								}
								return t
							}
							EnumValueDescriptorProto.toObject = function toObject(e, t) {
								if (!t) t = {}
								var r = {}
								if (t.defaults) {
									r.name = ""
									r.number = 0
									r.options = null
								}
								if (e.name != null && e.hasOwnProperty("name")) r.name = e.name
								if (e.number != null && e.hasOwnProperty("number"))
									r.number = e.number
								if (e.options != null && e.hasOwnProperty("options"))
									r.options = n.google.protobuf.EnumValueOptions.toObject(
										e.options,
										t
									)
								return r
							}
							EnumValueDescriptorProto.prototype.toJSON = function toJSON() {
								return this.constructor.toObject(this, e.util.toJSONOptions)
							}
							return EnumValueDescriptorProto
						})()
						i.ServiceDescriptorProto = (function () {
							function ServiceDescriptorProto(e) {
								this.method = []
								if (e)
									for (var t = Object.keys(e), r = 0; r < t.length; ++r)
										if (e[t[r]] != null) this[t[r]] = e[t[r]]
							}
							ServiceDescriptorProto.prototype.name = ""
							ServiceDescriptorProto.prototype.method = o.emptyArray
							ServiceDescriptorProto.prototype.options = null
							ServiceDescriptorProto.create = function create(e) {
								return new ServiceDescriptorProto(e)
							}
							ServiceDescriptorProto.encode = function encode(e, t) {
								if (!t) t = r.create()
								if (e.name != null && Object.hasOwnProperty.call(e, "name"))
									t.uint32(10).string(e.name)
								if (e.method != null && e.method.length)
									for (var o = 0; o < e.method.length; ++o)
										n.google.protobuf.MethodDescriptorProto.encode(
											e.method[o],
											t.uint32(18).fork()
										).ldelim()
								if (
									e.options != null &&
									Object.hasOwnProperty.call(e, "options")
								)
									n.google.protobuf.ServiceOptions.encode(
										e.options,
										t.uint32(26).fork()
									).ldelim()
								return t
							}
							ServiceDescriptorProto.encodeDelimited = function encodeDelimited(
								e,
								t
							) {
								return this.encode(e, t).ldelim()
							}
							ServiceDescriptorProto.decode = function decode(e, r) {
								if (!(e instanceof t)) e = t.create(e)
								var o = r === undefined ? e.len : e.pos + r,
									i = new n.google.protobuf.ServiceDescriptorProto()
								while (e.pos < o) {
									var a = e.uint32()
									switch (a >>> 3) {
										case 1:
											i.name = e.string()
											break
										case 2:
											if (!(i.method && i.method.length)) i.method = []
											i.method.push(
												n.google.protobuf.MethodDescriptorProto.decode(
													e,
													e.uint32()
												)
											)
											break
										case 3:
											i.options = n.google.protobuf.ServiceOptions.decode(
												e,
												e.uint32()
											)
											break
										default:
											e.skipType(a & 7)
											break
									}
								}
								return i
							}
							ServiceDescriptorProto.decodeDelimited = function decodeDelimited(
								e
							) {
								if (!(e instanceof t)) e = new t(e)
								return this.decode(e, e.uint32())
							}
							ServiceDescriptorProto.verify = function verify(e) {
								if (typeof e !== "object" || e === null)
									return "object expected"
								if (e.name != null && e.hasOwnProperty("name"))
									if (!o.isString(e.name)) return "name: string expected"
								if (e.method != null && e.hasOwnProperty("method")) {
									if (!Array.isArray(e.method)) return "method: array expected"
									for (var t = 0; t < e.method.length; ++t) {
										var r = n.google.protobuf.MethodDescriptorProto.verify(
											e.method[t]
										)
										if (r) return "method." + r
									}
								}
								if (e.options != null && e.hasOwnProperty("options")) {
									var r = n.google.protobuf.ServiceOptions.verify(e.options)
									if (r) return "options." + r
								}
								return null
							}
							ServiceDescriptorProto.fromObject = function fromObject(e) {
								if (e instanceof n.google.protobuf.ServiceDescriptorProto)
									return e
								var t = new n.google.protobuf.ServiceDescriptorProto()
								if (e.name != null) t.name = String(e.name)
								if (e.method) {
									if (!Array.isArray(e.method))
										throw TypeError(
											".google.protobuf.ServiceDescriptorProto.method: array expected"
										)
									t.method = []
									for (var r = 0; r < e.method.length; ++r) {
										if (typeof e.method[r] !== "object")
											throw TypeError(
												".google.protobuf.ServiceDescriptorProto.method: object expected"
											)
										t.method[r] =
											n.google.protobuf.MethodDescriptorProto.fromObject(
												e.method[r]
											)
									}
								}
								if (e.options != null) {
									if (typeof e.options !== "object")
										throw TypeError(
											".google.protobuf.ServiceDescriptorProto.options: object expected"
										)
									t.options = n.google.protobuf.ServiceOptions.fromObject(
										e.options
									)
								}
								return t
							}
							ServiceDescriptorProto.toObject = function toObject(e, t) {
								if (!t) t = {}
								var r = {}
								if (t.arrays || t.defaults) r.method = []
								if (t.defaults) {
									r.name = ""
									r.options = null
								}
								if (e.name != null && e.hasOwnProperty("name")) r.name = e.name
								if (e.method && e.method.length) {
									r.method = []
									for (var o = 0; o < e.method.length; ++o)
										r.method[o] =
											n.google.protobuf.MethodDescriptorProto.toObject(
												e.method[o],
												t
											)
								}
								if (e.options != null && e.hasOwnProperty("options"))
									r.options = n.google.protobuf.ServiceOptions.toObject(
										e.options,
										t
									)
								return r
							}
							ServiceDescriptorProto.prototype.toJSON = function toJSON() {
								return this.constructor.toObject(this, e.util.toJSONOptions)
							}
							return ServiceDescriptorProto
						})()
						i.MethodDescriptorProto = (function () {
							function MethodDescriptorProto(e) {
								if (e)
									for (var t = Object.keys(e), r = 0; r < t.length; ++r)
										if (e[t[r]] != null) this[t[r]] = e[t[r]]
							}
							MethodDescriptorProto.prototype.name = ""
							MethodDescriptorProto.prototype.inputType = ""
							MethodDescriptorProto.prototype.outputType = ""
							MethodDescriptorProto.prototype.options = null
							MethodDescriptorProto.prototype.clientStreaming = false
							MethodDescriptorProto.prototype.serverStreaming = false
							MethodDescriptorProto.create = function create(e) {
								return new MethodDescriptorProto(e)
							}
							MethodDescriptorProto.encode = function encode(e, t) {
								if (!t) t = r.create()
								if (e.name != null && Object.hasOwnProperty.call(e, "name"))
									t.uint32(10).string(e.name)
								if (
									e.inputType != null &&
									Object.hasOwnProperty.call(e, "inputType")
								)
									t.uint32(18).string(e.inputType)
								if (
									e.outputType != null &&
									Object.hasOwnProperty.call(e, "outputType")
								)
									t.uint32(26).string(e.outputType)
								if (
									e.options != null &&
									Object.hasOwnProperty.call(e, "options")
								)
									n.google.protobuf.MethodOptions.encode(
										e.options,
										t.uint32(34).fork()
									).ldelim()
								if (
									e.clientStreaming != null &&
									Object.hasOwnProperty.call(e, "clientStreaming")
								)
									t.uint32(40).bool(e.clientStreaming)
								if (
									e.serverStreaming != null &&
									Object.hasOwnProperty.call(e, "serverStreaming")
								)
									t.uint32(48).bool(e.serverStreaming)
								return t
							}
							MethodDescriptorProto.encodeDelimited = function encodeDelimited(
								e,
								t
							) {
								return this.encode(e, t).ldelim()
							}
							MethodDescriptorProto.decode = function decode(e, r) {
								if (!(e instanceof t)) e = t.create(e)
								var o = r === undefined ? e.len : e.pos + r,
									i = new n.google.protobuf.MethodDescriptorProto()
								while (e.pos < o) {
									var a = e.uint32()
									switch (a >>> 3) {
										case 1:
											i.name = e.string()
											break
										case 2:
											i.inputType = e.string()
											break
										case 3:
											i.outputType = e.string()
											break
										case 4:
											i.options = n.google.protobuf.MethodOptions.decode(
												e,
												e.uint32()
											)
											break
										case 5:
											i.clientStreaming = e.bool()
											break
										case 6:
											i.serverStreaming = e.bool()
											break
										default:
											e.skipType(a & 7)
											break
									}
								}
								return i
							}
							MethodDescriptorProto.decodeDelimited = function decodeDelimited(
								e
							) {
								if (!(e instanceof t)) e = new t(e)
								return this.decode(e, e.uint32())
							}
							MethodDescriptorProto.verify = function verify(e) {
								if (typeof e !== "object" || e === null)
									return "object expected"
								if (e.name != null && e.hasOwnProperty("name"))
									if (!o.isString(e.name)) return "name: string expected"
								if (e.inputType != null && e.hasOwnProperty("inputType"))
									if (!o.isString(e.inputType))
										return "inputType: string expected"
								if (e.outputType != null && e.hasOwnProperty("outputType"))
									if (!o.isString(e.outputType))
										return "outputType: string expected"
								if (e.options != null && e.hasOwnProperty("options")) {
									var t = n.google.protobuf.MethodOptions.verify(e.options)
									if (t) return "options." + t
								}
								if (
									e.clientStreaming != null &&
									e.hasOwnProperty("clientStreaming")
								)
									if (typeof e.clientStreaming !== "boolean")
										return "clientStreaming: boolean expected"
								if (
									e.serverStreaming != null &&
									e.hasOwnProperty("serverStreaming")
								)
									if (typeof e.serverStreaming !== "boolean")
										return "serverStreaming: boolean expected"
								return null
							}
							MethodDescriptorProto.fromObject = function fromObject(e) {
								if (e instanceof n.google.protobuf.MethodDescriptorProto)
									return e
								var t = new n.google.protobuf.MethodDescriptorProto()
								if (e.name != null) t.name = String(e.name)
								if (e.inputType != null) t.inputType = String(e.inputType)
								if (e.outputType != null) t.outputType = String(e.outputType)
								if (e.options != null) {
									if (typeof e.options !== "object")
										throw TypeError(
											".google.protobuf.MethodDescriptorProto.options: object expected"
										)
									t.options = n.google.protobuf.MethodOptions.fromObject(
										e.options
									)
								}
								if (e.clientStreaming != null)
									t.clientStreaming = Boolean(e.clientStreaming)
								if (e.serverStreaming != null)
									t.serverStreaming = Boolean(e.serverStreaming)
								return t
							}
							MethodDescriptorProto.toObject = function toObject(e, t) {
								if (!t) t = {}
								var r = {}
								if (t.defaults) {
									r.name = ""
									r.inputType = ""
									r.outputType = ""
									r.options = null
									r.clientStreaming = false
									r.serverStreaming = false
								}
								if (e.name != null && e.hasOwnProperty("name")) r.name = e.name
								if (e.inputType != null && e.hasOwnProperty("inputType"))
									r.inputType = e.inputType
								if (e.outputType != null && e.hasOwnProperty("outputType"))
									r.outputType = e.outputType
								if (e.options != null && e.hasOwnProperty("options"))
									r.options = n.google.protobuf.MethodOptions.toObject(
										e.options,
										t
									)
								if (
									e.clientStreaming != null &&
									e.hasOwnProperty("clientStreaming")
								)
									r.clientStreaming = e.clientStreaming
								if (
									e.serverStreaming != null &&
									e.hasOwnProperty("serverStreaming")
								)
									r.serverStreaming = e.serverStreaming
								return r
							}
							MethodDescriptorProto.prototype.toJSON = function toJSON() {
								return this.constructor.toObject(this, e.util.toJSONOptions)
							}
							return MethodDescriptorProto
						})()
						i.FileOptions = (function () {
							function FileOptions(e) {
								this.uninterpretedOption = []
								this[".google.api.resourceDefinition"] = []
								if (e)
									for (var t = Object.keys(e), r = 0; r < t.length; ++r)
										if (e[t[r]] != null) this[t[r]] = e[t[r]]
							}
							FileOptions.prototype.javaPackage = ""
							FileOptions.prototype.javaOuterClassname = ""
							FileOptions.prototype.javaMultipleFiles = false
							FileOptions.prototype.javaGenerateEqualsAndHash = false
							FileOptions.prototype.javaStringCheckUtf8 = false
							FileOptions.prototype.optimizeFor = 1
							FileOptions.prototype.goPackage = ""
							FileOptions.prototype.ccGenericServices = false
							FileOptions.prototype.javaGenericServices = false
							FileOptions.prototype.pyGenericServices = false
							FileOptions.prototype.phpGenericServices = false
							FileOptions.prototype.deprecated = false
							FileOptions.prototype.ccEnableArenas = true
							FileOptions.prototype.objcClassPrefix = ""
							FileOptions.prototype.csharpNamespace = ""
							FileOptions.prototype.swiftPrefix = ""
							FileOptions.prototype.phpClassPrefix = ""
							FileOptions.prototype.phpNamespace = ""
							FileOptions.prototype.phpMetadataNamespace = ""
							FileOptions.prototype.rubyPackage = ""
							FileOptions.prototype.uninterpretedOption = o.emptyArray
							FileOptions.prototype[".google.api.resourceDefinition"] =
								o.emptyArray
							FileOptions.create = function create(e) {
								return new FileOptions(e)
							}
							FileOptions.encode = function encode(e, t) {
								if (!t) t = r.create()
								if (
									e.javaPackage != null &&
									Object.hasOwnProperty.call(e, "javaPackage")
								)
									t.uint32(10).string(e.javaPackage)
								if (
									e.javaOuterClassname != null &&
									Object.hasOwnProperty.call(e, "javaOuterClassname")
								)
									t.uint32(66).string(e.javaOuterClassname)
								if (
									e.optimizeFor != null &&
									Object.hasOwnProperty.call(e, "optimizeFor")
								)
									t.uint32(72).int32(e.optimizeFor)
								if (
									e.javaMultipleFiles != null &&
									Object.hasOwnProperty.call(e, "javaMultipleFiles")
								)
									t.uint32(80).bool(e.javaMultipleFiles)
								if (
									e.goPackage != null &&
									Object.hasOwnProperty.call(e, "goPackage")
								)
									t.uint32(90).string(e.goPackage)
								if (
									e.ccGenericServices != null &&
									Object.hasOwnProperty.call(e, "ccGenericServices")
								)
									t.uint32(128).bool(e.ccGenericServices)
								if (
									e.javaGenericServices != null &&
									Object.hasOwnProperty.call(e, "javaGenericServices")
								)
									t.uint32(136).bool(e.javaGenericServices)
								if (
									e.pyGenericServices != null &&
									Object.hasOwnProperty.call(e, "pyGenericServices")
								)
									t.uint32(144).bool(e.pyGenericServices)
								if (
									e.javaGenerateEqualsAndHash != null &&
									Object.hasOwnProperty.call(e, "javaGenerateEqualsAndHash")
								)
									t.uint32(160).bool(e.javaGenerateEqualsAndHash)
								if (
									e.deprecated != null &&
									Object.hasOwnProperty.call(e, "deprecated")
								)
									t.uint32(184).bool(e.deprecated)
								if (
									e.javaStringCheckUtf8 != null &&
									Object.hasOwnProperty.call(e, "javaStringCheckUtf8")
								)
									t.uint32(216).bool(e.javaStringCheckUtf8)
								if (
									e.ccEnableArenas != null &&
									Object.hasOwnProperty.call(e, "ccEnableArenas")
								)
									t.uint32(248).bool(e.ccEnableArenas)
								if (
									e.objcClassPrefix != null &&
									Object.hasOwnProperty.call(e, "objcClassPrefix")
								)
									t.uint32(290).string(e.objcClassPrefix)
								if (
									e.csharpNamespace != null &&
									Object.hasOwnProperty.call(e, "csharpNamespace")
								)
									t.uint32(298).string(e.csharpNamespace)
								if (
									e.swiftPrefix != null &&
									Object.hasOwnProperty.call(e, "swiftPrefix")
								)
									t.uint32(314).string(e.swiftPrefix)
								if (
									e.phpClassPrefix != null &&
									Object.hasOwnProperty.call(e, "phpClassPrefix")
								)
									t.uint32(322).string(e.phpClassPrefix)
								if (
									e.phpNamespace != null &&
									Object.hasOwnProperty.call(e, "phpNamespace")
								)
									t.uint32(330).string(e.phpNamespace)
								if (
									e.phpGenericServices != null &&
									Object.hasOwnProperty.call(e, "phpGenericServices")
								)
									t.uint32(336).bool(e.phpGenericServices)
								if (
									e.phpMetadataNamespace != null &&
									Object.hasOwnProperty.call(e, "phpMetadataNamespace")
								)
									t.uint32(354).string(e.phpMetadataNamespace)
								if (
									e.rubyPackage != null &&
									Object.hasOwnProperty.call(e, "rubyPackage")
								)
									t.uint32(362).string(e.rubyPackage)
								if (
									e.uninterpretedOption != null &&
									e.uninterpretedOption.length
								)
									for (var o = 0; o < e.uninterpretedOption.length; ++o)
										n.google.protobuf.UninterpretedOption.encode(
											e.uninterpretedOption[o],
											t.uint32(7994).fork()
										).ldelim()
								if (
									e[".google.api.resourceDefinition"] != null &&
									e[".google.api.resourceDefinition"].length
								)
									for (
										var o = 0;
										o < e[".google.api.resourceDefinition"].length;
										++o
									)
										n.google.api.ResourceDescriptor.encode(
											e[".google.api.resourceDefinition"][o],
											t.uint32(8426).fork()
										).ldelim()
								return t
							}
							FileOptions.encodeDelimited = function encodeDelimited(e, t) {
								return this.encode(e, t).ldelim()
							}
							FileOptions.decode = function decode(e, r) {
								if (!(e instanceof t)) e = t.create(e)
								var o = r === undefined ? e.len : e.pos + r,
									i = new n.google.protobuf.FileOptions()
								while (e.pos < o) {
									var a = e.uint32()
									switch (a >>> 3) {
										case 1:
											i.javaPackage = e.string()
											break
										case 8:
											i.javaOuterClassname = e.string()
											break
										case 10:
											i.javaMultipleFiles = e.bool()
											break
										case 20:
											i.javaGenerateEqualsAndHash = e.bool()
											break
										case 27:
											i.javaStringCheckUtf8 = e.bool()
											break
										case 9:
											i.optimizeFor = e.int32()
											break
										case 11:
											i.goPackage = e.string()
											break
										case 16:
											i.ccGenericServices = e.bool()
											break
										case 17:
											i.javaGenericServices = e.bool()
											break
										case 18:
											i.pyGenericServices = e.bool()
											break
										case 42:
											i.phpGenericServices = e.bool()
											break
										case 23:
											i.deprecated = e.bool()
											break
										case 31:
											i.ccEnableArenas = e.bool()
											break
										case 36:
											i.objcClassPrefix = e.string()
											break
										case 37:
											i.csharpNamespace = e.string()
											break
										case 39:
											i.swiftPrefix = e.string()
											break
										case 40:
											i.phpClassPrefix = e.string()
											break
										case 41:
											i.phpNamespace = e.string()
											break
										case 44:
											i.phpMetadataNamespace = e.string()
											break
										case 45:
											i.rubyPackage = e.string()
											break
										case 999:
											if (
												!(i.uninterpretedOption && i.uninterpretedOption.length)
											)
												i.uninterpretedOption = []
											i.uninterpretedOption.push(
												n.google.protobuf.UninterpretedOption.decode(
													e,
													e.uint32()
												)
											)
											break
										case 1053:
											if (
												!(
													i[".google.api.resourceDefinition"] &&
													i[".google.api.resourceDefinition"].length
												)
											)
												i[".google.api.resourceDefinition"] = []
											i[".google.api.resourceDefinition"].push(
												n.google.api.ResourceDescriptor.decode(e, e.uint32())
											)
											break
										default:
											e.skipType(a & 7)
											break
									}
								}
								return i
							}
							FileOptions.decodeDelimited = function decodeDelimited(e) {
								if (!(e instanceof t)) e = new t(e)
								return this.decode(e, e.uint32())
							}
							FileOptions.verify = function verify(e) {
								if (typeof e !== "object" || e === null)
									return "object expected"
								if (e.javaPackage != null && e.hasOwnProperty("javaPackage"))
									if (!o.isString(e.javaPackage))
										return "javaPackage: string expected"
								if (
									e.javaOuterClassname != null &&
									e.hasOwnProperty("javaOuterClassname")
								)
									if (!o.isString(e.javaOuterClassname))
										return "javaOuterClassname: string expected"
								if (
									e.javaMultipleFiles != null &&
									e.hasOwnProperty("javaMultipleFiles")
								)
									if (typeof e.javaMultipleFiles !== "boolean")
										return "javaMultipleFiles: boolean expected"
								if (
									e.javaGenerateEqualsAndHash != null &&
									e.hasOwnProperty("javaGenerateEqualsAndHash")
								)
									if (typeof e.javaGenerateEqualsAndHash !== "boolean")
										return "javaGenerateEqualsAndHash: boolean expected"
								if (
									e.javaStringCheckUtf8 != null &&
									e.hasOwnProperty("javaStringCheckUtf8")
								)
									if (typeof e.javaStringCheckUtf8 !== "boolean")
										return "javaStringCheckUtf8: boolean expected"
								if (e.optimizeFor != null && e.hasOwnProperty("optimizeFor"))
									switch (e.optimizeFor) {
										default:
											return "optimizeFor: enum value expected"
										case 1:
										case 2:
										case 3:
											break
									}
								if (e.goPackage != null && e.hasOwnProperty("goPackage"))
									if (!o.isString(e.goPackage))
										return "goPackage: string expected"
								if (
									e.ccGenericServices != null &&
									e.hasOwnProperty("ccGenericServices")
								)
									if (typeof e.ccGenericServices !== "boolean")
										return "ccGenericServices: boolean expected"
								if (
									e.javaGenericServices != null &&
									e.hasOwnProperty("javaGenericServices")
								)
									if (typeof e.javaGenericServices !== "boolean")
										return "javaGenericServices: boolean expected"
								if (
									e.pyGenericServices != null &&
									e.hasOwnProperty("pyGenericServices")
								)
									if (typeof e.pyGenericServices !== "boolean")
										return "pyGenericServices: boolean expected"
								if (
									e.phpGenericServices != null &&
									e.hasOwnProperty("phpGenericServices")
								)
									if (typeof e.phpGenericServices !== "boolean")
										return "phpGenericServices: boolean expected"
								if (e.deprecated != null && e.hasOwnProperty("deprecated"))
									if (typeof e.deprecated !== "boolean")
										return "deprecated: boolean expected"
								if (
									e.ccEnableArenas != null &&
									e.hasOwnProperty("ccEnableArenas")
								)
									if (typeof e.ccEnableArenas !== "boolean")
										return "ccEnableArenas: boolean expected"
								if (
									e.objcClassPrefix != null &&
									e.hasOwnProperty("objcClassPrefix")
								)
									if (!o.isString(e.objcClassPrefix))
										return "objcClassPrefix: string expected"
								if (
									e.csharpNamespace != null &&
									e.hasOwnProperty("csharpNamespace")
								)
									if (!o.isString(e.csharpNamespace))
										return "csharpNamespace: string expected"
								if (e.swiftPrefix != null && e.hasOwnProperty("swiftPrefix"))
									if (!o.isString(e.swiftPrefix))
										return "swiftPrefix: string expected"
								if (
									e.phpClassPrefix != null &&
									e.hasOwnProperty("phpClassPrefix")
								)
									if (!o.isString(e.phpClassPrefix))
										return "phpClassPrefix: string expected"
								if (e.phpNamespace != null && e.hasOwnProperty("phpNamespace"))
									if (!o.isString(e.phpNamespace))
										return "phpNamespace: string expected"
								if (
									e.phpMetadataNamespace != null &&
									e.hasOwnProperty("phpMetadataNamespace")
								)
									if (!o.isString(e.phpMetadataNamespace))
										return "phpMetadataNamespace: string expected"
								if (e.rubyPackage != null && e.hasOwnProperty("rubyPackage"))
									if (!o.isString(e.rubyPackage))
										return "rubyPackage: string expected"
								if (
									e.uninterpretedOption != null &&
									e.hasOwnProperty("uninterpretedOption")
								) {
									if (!Array.isArray(e.uninterpretedOption))
										return "uninterpretedOption: array expected"
									for (var t = 0; t < e.uninterpretedOption.length; ++t) {
										var r = n.google.protobuf.UninterpretedOption.verify(
											e.uninterpretedOption[t]
										)
										if (r) return "uninterpretedOption." + r
									}
								}
								if (
									e[".google.api.resourceDefinition"] != null &&
									e.hasOwnProperty(".google.api.resourceDefinition")
								) {
									if (!Array.isArray(e[".google.api.resourceDefinition"]))
										return ".google.api.resourceDefinition: array expected"
									for (
										var t = 0;
										t < e[".google.api.resourceDefinition"].length;
										++t
									) {
										var r = n.google.api.ResourceDescriptor.verify(
											e[".google.api.resourceDefinition"][t]
										)
										if (r) return ".google.api.resourceDefinition." + r
									}
								}
								return null
							}
							FileOptions.fromObject = function fromObject(e) {
								if (e instanceof n.google.protobuf.FileOptions) return e
								var t = new n.google.protobuf.FileOptions()
								if (e.javaPackage != null) t.javaPackage = String(e.javaPackage)
								if (e.javaOuterClassname != null)
									t.javaOuterClassname = String(e.javaOuterClassname)
								if (e.javaMultipleFiles != null)
									t.javaMultipleFiles = Boolean(e.javaMultipleFiles)
								if (e.javaGenerateEqualsAndHash != null)
									t.javaGenerateEqualsAndHash = Boolean(
										e.javaGenerateEqualsAndHash
									)
								if (e.javaStringCheckUtf8 != null)
									t.javaStringCheckUtf8 = Boolean(e.javaStringCheckUtf8)
								switch (e.optimizeFor) {
									case "SPEED":
									case 1:
										t.optimizeFor = 1
										break
									case "CODE_SIZE":
									case 2:
										t.optimizeFor = 2
										break
									case "LITE_RUNTIME":
									case 3:
										t.optimizeFor = 3
										break
								}
								if (e.goPackage != null) t.goPackage = String(e.goPackage)
								if (e.ccGenericServices != null)
									t.ccGenericServices = Boolean(e.ccGenericServices)
								if (e.javaGenericServices != null)
									t.javaGenericServices = Boolean(e.javaGenericServices)
								if (e.pyGenericServices != null)
									t.pyGenericServices = Boolean(e.pyGenericServices)
								if (e.phpGenericServices != null)
									t.phpGenericServices = Boolean(e.phpGenericServices)
								if (e.deprecated != null) t.deprecated = Boolean(e.deprecated)
								if (e.ccEnableArenas != null)
									t.ccEnableArenas = Boolean(e.ccEnableArenas)
								if (e.objcClassPrefix != null)
									t.objcClassPrefix = String(e.objcClassPrefix)
								if (e.csharpNamespace != null)
									t.csharpNamespace = String(e.csharpNamespace)
								if (e.swiftPrefix != null) t.swiftPrefix = String(e.swiftPrefix)
								if (e.phpClassPrefix != null)
									t.phpClassPrefix = String(e.phpClassPrefix)
								if (e.phpNamespace != null)
									t.phpNamespace = String(e.phpNamespace)
								if (e.phpMetadataNamespace != null)
									t.phpMetadataNamespace = String(e.phpMetadataNamespace)
								if (e.rubyPackage != null) t.rubyPackage = String(e.rubyPackage)
								if (e.uninterpretedOption) {
									if (!Array.isArray(e.uninterpretedOption))
										throw TypeError(
											".google.protobuf.FileOptions.uninterpretedOption: array expected"
										)
									t.uninterpretedOption = []
									for (var r = 0; r < e.uninterpretedOption.length; ++r) {
										if (typeof e.uninterpretedOption[r] !== "object")
											throw TypeError(
												".google.protobuf.FileOptions.uninterpretedOption: object expected"
											)
										t.uninterpretedOption[r] =
											n.google.protobuf.UninterpretedOption.fromObject(
												e.uninterpretedOption[r]
											)
									}
								}
								if (e[".google.api.resourceDefinition"]) {
									if (!Array.isArray(e[".google.api.resourceDefinition"]))
										throw TypeError(
											".google.protobuf.FileOptions..google.api.resourceDefinition: array expected"
										)
									t[".google.api.resourceDefinition"] = []
									for (
										var r = 0;
										r < e[".google.api.resourceDefinition"].length;
										++r
									) {
										if (
											typeof e[".google.api.resourceDefinition"][r] !== "object"
										)
											throw TypeError(
												".google.protobuf.FileOptions..google.api.resourceDefinition: object expected"
											)
										t[".google.api.resourceDefinition"][r] =
											n.google.api.ResourceDescriptor.fromObject(
												e[".google.api.resourceDefinition"][r]
											)
									}
								}
								return t
							}
							FileOptions.toObject = function toObject(e, t) {
								if (!t) t = {}
								var r = {}
								if (t.arrays || t.defaults) {
									r.uninterpretedOption = []
									r[".google.api.resourceDefinition"] = []
								}
								if (t.defaults) {
									r.javaPackage = ""
									r.javaOuterClassname = ""
									r.optimizeFor = t.enums === String ? "SPEED" : 1
									r.javaMultipleFiles = false
									r.goPackage = ""
									r.ccGenericServices = false
									r.javaGenericServices = false
									r.pyGenericServices = false
									r.javaGenerateEqualsAndHash = false
									r.deprecated = false
									r.javaStringCheckUtf8 = false
									r.ccEnableArenas = true
									r.objcClassPrefix = ""
									r.csharpNamespace = ""
									r.swiftPrefix = ""
									r.phpClassPrefix = ""
									r.phpNamespace = ""
									r.phpGenericServices = false
									r.phpMetadataNamespace = ""
									r.rubyPackage = ""
								}
								if (e.javaPackage != null && e.hasOwnProperty("javaPackage"))
									r.javaPackage = e.javaPackage
								if (
									e.javaOuterClassname != null &&
									e.hasOwnProperty("javaOuterClassname")
								)
									r.javaOuterClassname = e.javaOuterClassname
								if (e.optimizeFor != null && e.hasOwnProperty("optimizeFor"))
									r.optimizeFor =
										t.enums === String
											? n.google.protobuf.FileOptions.OptimizeMode[
													e.optimizeFor
											  ]
											: e.optimizeFor
								if (
									e.javaMultipleFiles != null &&
									e.hasOwnProperty("javaMultipleFiles")
								)
									r.javaMultipleFiles = e.javaMultipleFiles
								if (e.goPackage != null && e.hasOwnProperty("goPackage"))
									r.goPackage = e.goPackage
								if (
									e.ccGenericServices != null &&
									e.hasOwnProperty("ccGenericServices")
								)
									r.ccGenericServices = e.ccGenericServices
								if (
									e.javaGenericServices != null &&
									e.hasOwnProperty("javaGenericServices")
								)
									r.javaGenericServices = e.javaGenericServices
								if (
									e.pyGenericServices != null &&
									e.hasOwnProperty("pyGenericServices")
								)
									r.pyGenericServices = e.pyGenericServices
								if (
									e.javaGenerateEqualsAndHash != null &&
									e.hasOwnProperty("javaGenerateEqualsAndHash")
								)
									r.javaGenerateEqualsAndHash = e.javaGenerateEqualsAndHash
								if (e.deprecated != null && e.hasOwnProperty("deprecated"))
									r.deprecated = e.deprecated
								if (
									e.javaStringCheckUtf8 != null &&
									e.hasOwnProperty("javaStringCheckUtf8")
								)
									r.javaStringCheckUtf8 = e.javaStringCheckUtf8
								if (
									e.ccEnableArenas != null &&
									e.hasOwnProperty("ccEnableArenas")
								)
									r.ccEnableArenas = e.ccEnableArenas
								if (
									e.objcClassPrefix != null &&
									e.hasOwnProperty("objcClassPrefix")
								)
									r.objcClassPrefix = e.objcClassPrefix
								if (
									e.csharpNamespace != null &&
									e.hasOwnProperty("csharpNamespace")
								)
									r.csharpNamespace = e.csharpNamespace
								if (e.swiftPrefix != null && e.hasOwnProperty("swiftPrefix"))
									r.swiftPrefix = e.swiftPrefix
								if (
									e.phpClassPrefix != null &&
									e.hasOwnProperty("phpClassPrefix")
								)
									r.phpClassPrefix = e.phpClassPrefix
								if (e.phpNamespace != null && e.hasOwnProperty("phpNamespace"))
									r.phpNamespace = e.phpNamespace
								if (
									e.phpGenericServices != null &&
									e.hasOwnProperty("phpGenericServices")
								)
									r.phpGenericServices = e.phpGenericServices
								if (
									e.phpMetadataNamespace != null &&
									e.hasOwnProperty("phpMetadataNamespace")
								)
									r.phpMetadataNamespace = e.phpMetadataNamespace
								if (e.rubyPackage != null && e.hasOwnProperty("rubyPackage"))
									r.rubyPackage = e.rubyPackage
								if (e.uninterpretedOption && e.uninterpretedOption.length) {
									r.uninterpretedOption = []
									for (var o = 0; o < e.uninterpretedOption.length; ++o)
										r.uninterpretedOption[o] =
											n.google.protobuf.UninterpretedOption.toObject(
												e.uninterpretedOption[o],
												t
											)
								}
								if (
									e[".google.api.resourceDefinition"] &&
									e[".google.api.resourceDefinition"].length
								) {
									r[".google.api.resourceDefinition"] = []
									for (
										var o = 0;
										o < e[".google.api.resourceDefinition"].length;
										++o
									)
										r[".google.api.resourceDefinition"][o] =
											n.google.api.ResourceDescriptor.toObject(
												e[".google.api.resourceDefinition"][o],
												t
											)
								}
								return r
							}
							FileOptions.prototype.toJSON = function toJSON() {
								return this.constructor.toObject(this, e.util.toJSONOptions)
							}
							FileOptions.OptimizeMode = (function () {
								var e = {},
									t = Object.create(e)
								t[(e[1] = "SPEED")] = 1
								t[(e[2] = "CODE_SIZE")] = 2
								t[(e[3] = "LITE_RUNTIME")] = 3
								return t
							})()
							return FileOptions
						})()
						i.MessageOptions = (function () {
							function MessageOptions(e) {
								this.uninterpretedOption = []
								if (e)
									for (var t = Object.keys(e), r = 0; r < t.length; ++r)
										if (e[t[r]] != null) this[t[r]] = e[t[r]]
							}
							MessageOptions.prototype.messageSetWireFormat = false
							MessageOptions.prototype.noStandardDescriptorAccessor = false
							MessageOptions.prototype.deprecated = false
							MessageOptions.prototype.mapEntry = false
							MessageOptions.prototype.uninterpretedOption = o.emptyArray
							MessageOptions.prototype[".google.api.resource"] = null
							MessageOptions.create = function create(e) {
								return new MessageOptions(e)
							}
							MessageOptions.encode = function encode(e, t) {
								if (!t) t = r.create()
								if (
									e.messageSetWireFormat != null &&
									Object.hasOwnProperty.call(e, "messageSetWireFormat")
								)
									t.uint32(8).bool(e.messageSetWireFormat)
								if (
									e.noStandardDescriptorAccessor != null &&
									Object.hasOwnProperty.call(e, "noStandardDescriptorAccessor")
								)
									t.uint32(16).bool(e.noStandardDescriptorAccessor)
								if (
									e.deprecated != null &&
									Object.hasOwnProperty.call(e, "deprecated")
								)
									t.uint32(24).bool(e.deprecated)
								if (
									e.mapEntry != null &&
									Object.hasOwnProperty.call(e, "mapEntry")
								)
									t.uint32(56).bool(e.mapEntry)
								if (
									e.uninterpretedOption != null &&
									e.uninterpretedOption.length
								)
									for (var o = 0; o < e.uninterpretedOption.length; ++o)
										n.google.protobuf.UninterpretedOption.encode(
											e.uninterpretedOption[o],
											t.uint32(7994).fork()
										).ldelim()
								if (
									e[".google.api.resource"] != null &&
									Object.hasOwnProperty.call(e, ".google.api.resource")
								)
									n.google.api.ResourceDescriptor.encode(
										e[".google.api.resource"],
										t.uint32(8426).fork()
									).ldelim()
								return t
							}
							MessageOptions.encodeDelimited = function encodeDelimited(e, t) {
								return this.encode(e, t).ldelim()
							}
							MessageOptions.decode = function decode(e, r) {
								if (!(e instanceof t)) e = t.create(e)
								var o = r === undefined ? e.len : e.pos + r,
									i = new n.google.protobuf.MessageOptions()
								while (e.pos < o) {
									var a = e.uint32()
									switch (a >>> 3) {
										case 1:
											i.messageSetWireFormat = e.bool()
											break
										case 2:
											i.noStandardDescriptorAccessor = e.bool()
											break
										case 3:
											i.deprecated = e.bool()
											break
										case 7:
											i.mapEntry = e.bool()
											break
										case 999:
											if (
												!(i.uninterpretedOption && i.uninterpretedOption.length)
											)
												i.uninterpretedOption = []
											i.uninterpretedOption.push(
												n.google.protobuf.UninterpretedOption.decode(
													e,
													e.uint32()
												)
											)
											break
										case 1053:
											i[".google.api.resource"] =
												n.google.api.ResourceDescriptor.decode(e, e.uint32())
											break
										default:
											e.skipType(a & 7)
											break
									}
								}
								return i
							}
							MessageOptions.decodeDelimited = function decodeDelimited(e) {
								if (!(e instanceof t)) e = new t(e)
								return this.decode(e, e.uint32())
							}
							MessageOptions.verify = function verify(e) {
								if (typeof e !== "object" || e === null)
									return "object expected"
								if (
									e.messageSetWireFormat != null &&
									e.hasOwnProperty("messageSetWireFormat")
								)
									if (typeof e.messageSetWireFormat !== "boolean")
										return "messageSetWireFormat: boolean expected"
								if (
									e.noStandardDescriptorAccessor != null &&
									e.hasOwnProperty("noStandardDescriptorAccessor")
								)
									if (typeof e.noStandardDescriptorAccessor !== "boolean")
										return "noStandardDescriptorAccessor: boolean expected"
								if (e.deprecated != null && e.hasOwnProperty("deprecated"))
									if (typeof e.deprecated !== "boolean")
										return "deprecated: boolean expected"
								if (e.mapEntry != null && e.hasOwnProperty("mapEntry"))
									if (typeof e.mapEntry !== "boolean")
										return "mapEntry: boolean expected"
								if (
									e.uninterpretedOption != null &&
									e.hasOwnProperty("uninterpretedOption")
								) {
									if (!Array.isArray(e.uninterpretedOption))
										return "uninterpretedOption: array expected"
									for (var t = 0; t < e.uninterpretedOption.length; ++t) {
										var r = n.google.protobuf.UninterpretedOption.verify(
											e.uninterpretedOption[t]
										)
										if (r) return "uninterpretedOption." + r
									}
								}
								if (
									e[".google.api.resource"] != null &&
									e.hasOwnProperty(".google.api.resource")
								) {
									var r = n.google.api.ResourceDescriptor.verify(
										e[".google.api.resource"]
									)
									if (r) return ".google.api.resource." + r
								}
								return null
							}
							MessageOptions.fromObject = function fromObject(e) {
								if (e instanceof n.google.protobuf.MessageOptions) return e
								var t = new n.google.protobuf.MessageOptions()
								if (e.messageSetWireFormat != null)
									t.messageSetWireFormat = Boolean(e.messageSetWireFormat)
								if (e.noStandardDescriptorAccessor != null)
									t.noStandardDescriptorAccessor = Boolean(
										e.noStandardDescriptorAccessor
									)
								if (e.deprecated != null) t.deprecated = Boolean(e.deprecated)
								if (e.mapEntry != null) t.mapEntry = Boolean(e.mapEntry)
								if (e.uninterpretedOption) {
									if (!Array.isArray(e.uninterpretedOption))
										throw TypeError(
											".google.protobuf.MessageOptions.uninterpretedOption: array expected"
										)
									t.uninterpretedOption = []
									for (var r = 0; r < e.uninterpretedOption.length; ++r) {
										if (typeof e.uninterpretedOption[r] !== "object")
											throw TypeError(
												".google.protobuf.MessageOptions.uninterpretedOption: object expected"
											)
										t.uninterpretedOption[r] =
											n.google.protobuf.UninterpretedOption.fromObject(
												e.uninterpretedOption[r]
											)
									}
								}
								if (e[".google.api.resource"] != null) {
									if (typeof e[".google.api.resource"] !== "object")
										throw TypeError(
											".google.protobuf.MessageOptions..google.api.resource: object expected"
										)
									t[".google.api.resource"] =
										n.google.api.ResourceDescriptor.fromObject(
											e[".google.api.resource"]
										)
								}
								return t
							}
							MessageOptions.toObject = function toObject(e, t) {
								if (!t) t = {}
								var r = {}
								if (t.arrays || t.defaults) r.uninterpretedOption = []
								if (t.defaults) {
									r.messageSetWireFormat = false
									r.noStandardDescriptorAccessor = false
									r.deprecated = false
									r.mapEntry = false
									r[".google.api.resource"] = null
								}
								if (
									e.messageSetWireFormat != null &&
									e.hasOwnProperty("messageSetWireFormat")
								)
									r.messageSetWireFormat = e.messageSetWireFormat
								if (
									e.noStandardDescriptorAccessor != null &&
									e.hasOwnProperty("noStandardDescriptorAccessor")
								)
									r.noStandardDescriptorAccessor =
										e.noStandardDescriptorAccessor
								if (e.deprecated != null && e.hasOwnProperty("deprecated"))
									r.deprecated = e.deprecated
								if (e.mapEntry != null && e.hasOwnProperty("mapEntry"))
									r.mapEntry = e.mapEntry
								if (e.uninterpretedOption && e.uninterpretedOption.length) {
									r.uninterpretedOption = []
									for (var o = 0; o < e.uninterpretedOption.length; ++o)
										r.uninterpretedOption[o] =
											n.google.protobuf.UninterpretedOption.toObject(
												e.uninterpretedOption[o],
												t
											)
								}
								if (
									e[".google.api.resource"] != null &&
									e.hasOwnProperty(".google.api.resource")
								)
									r[".google.api.resource"] =
										n.google.api.ResourceDescriptor.toObject(
											e[".google.api.resource"],
											t
										)
								return r
							}
							MessageOptions.prototype.toJSON = function toJSON() {
								return this.constructor.toObject(this, e.util.toJSONOptions)
							}
							return MessageOptions
						})()
						i.FieldOptions = (function () {
							function FieldOptions(e) {
								this.uninterpretedOption = []
								this[".google.api.fieldBehavior"] = []
								if (e)
									for (var t = Object.keys(e), r = 0; r < t.length; ++r)
										if (e[t[r]] != null) this[t[r]] = e[t[r]]
							}
							FieldOptions.prototype.ctype = 0
							FieldOptions.prototype.packed = false
							FieldOptions.prototype.jstype = 0
							FieldOptions.prototype.lazy = false
							FieldOptions.prototype.deprecated = false
							FieldOptions.prototype.weak = false
							FieldOptions.prototype.uninterpretedOption = o.emptyArray
							FieldOptions.prototype[".google.api.fieldBehavior"] = o.emptyArray
							FieldOptions.prototype[".google.api.resourceReference"] = null
							FieldOptions.create = function create(e) {
								return new FieldOptions(e)
							}
							FieldOptions.encode = function encode(e, t) {
								if (!t) t = r.create()
								if (e.ctype != null && Object.hasOwnProperty.call(e, "ctype"))
									t.uint32(8).int32(e.ctype)
								if (e.packed != null && Object.hasOwnProperty.call(e, "packed"))
									t.uint32(16).bool(e.packed)
								if (
									e.deprecated != null &&
									Object.hasOwnProperty.call(e, "deprecated")
								)
									t.uint32(24).bool(e.deprecated)
								if (e.lazy != null && Object.hasOwnProperty.call(e, "lazy"))
									t.uint32(40).bool(e.lazy)
								if (e.jstype != null && Object.hasOwnProperty.call(e, "jstype"))
									t.uint32(48).int32(e.jstype)
								if (e.weak != null && Object.hasOwnProperty.call(e, "weak"))
									t.uint32(80).bool(e.weak)
								if (
									e.uninterpretedOption != null &&
									e.uninterpretedOption.length
								)
									for (var o = 0; o < e.uninterpretedOption.length; ++o)
										n.google.protobuf.UninterpretedOption.encode(
											e.uninterpretedOption[o],
											t.uint32(7994).fork()
										).ldelim()
								if (
									e[".google.api.fieldBehavior"] != null &&
									e[".google.api.fieldBehavior"].length
								) {
									t.uint32(8418).fork()
									for (
										var o = 0;
										o < e[".google.api.fieldBehavior"].length;
										++o
									)
										t.int32(e[".google.api.fieldBehavior"][o])
									t.ldelim()
								}
								if (
									e[".google.api.resourceReference"] != null &&
									Object.hasOwnProperty.call(e, ".google.api.resourceReference")
								)
									n.google.api.ResourceReference.encode(
										e[".google.api.resourceReference"],
										t.uint32(8442).fork()
									).ldelim()
								return t
							}
							FieldOptions.encodeDelimited = function encodeDelimited(e, t) {
								return this.encode(e, t).ldelim()
							}
							FieldOptions.decode = function decode(e, r) {
								if (!(e instanceof t)) e = t.create(e)
								var o = r === undefined ? e.len : e.pos + r,
									i = new n.google.protobuf.FieldOptions()
								while (e.pos < o) {
									var a = e.uint32()
									switch (a >>> 3) {
										case 1:
											i.ctype = e.int32()
											break
										case 2:
											i.packed = e.bool()
											break
										case 6:
											i.jstype = e.int32()
											break
										case 5:
											i.lazy = e.bool()
											break
										case 3:
											i.deprecated = e.bool()
											break
										case 10:
											i.weak = e.bool()
											break
										case 999:
											if (
												!(i.uninterpretedOption && i.uninterpretedOption.length)
											)
												i.uninterpretedOption = []
											i.uninterpretedOption.push(
												n.google.protobuf.UninterpretedOption.decode(
													e,
													e.uint32()
												)
											)
											break
										case 1052:
											if (
												!(
													i[".google.api.fieldBehavior"] &&
													i[".google.api.fieldBehavior"].length
												)
											)
												i[".google.api.fieldBehavior"] = []
											if ((a & 7) === 2) {
												var s = e.uint32() + e.pos
												while (e.pos < s)
													i[".google.api.fieldBehavior"].push(e.int32())
											} else i[".google.api.fieldBehavior"].push(e.int32())
											break
										case 1055:
											i[".google.api.resourceReference"] =
												n.google.api.ResourceReference.decode(e, e.uint32())
											break
										default:
											e.skipType(a & 7)
											break
									}
								}
								return i
							}
							FieldOptions.decodeDelimited = function decodeDelimited(e) {
								if (!(e instanceof t)) e = new t(e)
								return this.decode(e, e.uint32())
							}
							FieldOptions.verify = function verify(e) {
								if (typeof e !== "object" || e === null)
									return "object expected"
								if (e.ctype != null && e.hasOwnProperty("ctype"))
									switch (e.ctype) {
										default:
											return "ctype: enum value expected"
										case 0:
										case 1:
										case 2:
											break
									}
								if (e.packed != null && e.hasOwnProperty("packed"))
									if (typeof e.packed !== "boolean")
										return "packed: boolean expected"
								if (e.jstype != null && e.hasOwnProperty("jstype"))
									switch (e.jstype) {
										default:
											return "jstype: enum value expected"
										case 0:
										case 1:
										case 2:
											break
									}
								if (e.lazy != null && e.hasOwnProperty("lazy"))
									if (typeof e.lazy !== "boolean")
										return "lazy: boolean expected"
								if (e.deprecated != null && e.hasOwnProperty("deprecated"))
									if (typeof e.deprecated !== "boolean")
										return "deprecated: boolean expected"
								if (e.weak != null && e.hasOwnProperty("weak"))
									if (typeof e.weak !== "boolean")
										return "weak: boolean expected"
								if (
									e.uninterpretedOption != null &&
									e.hasOwnProperty("uninterpretedOption")
								) {
									if (!Array.isArray(e.uninterpretedOption))
										return "uninterpretedOption: array expected"
									for (var t = 0; t < e.uninterpretedOption.length; ++t) {
										var r = n.google.protobuf.UninterpretedOption.verify(
											e.uninterpretedOption[t]
										)
										if (r) return "uninterpretedOption." + r
									}
								}
								if (
									e[".google.api.fieldBehavior"] != null &&
									e.hasOwnProperty(".google.api.fieldBehavior")
								) {
									if (!Array.isArray(e[".google.api.fieldBehavior"]))
										return ".google.api.fieldBehavior: array expected"
									for (
										var t = 0;
										t < e[".google.api.fieldBehavior"].length;
										++t
									)
										switch (e[".google.api.fieldBehavior"][t]) {
											default:
												return ".google.api.fieldBehavior: enum value[] expected"
											case 0:
											case 1:
											case 2:
											case 3:
											case 4:
											case 5:
												break
										}
								}
								if (
									e[".google.api.resourceReference"] != null &&
									e.hasOwnProperty(".google.api.resourceReference")
								) {
									var r = n.google.api.ResourceReference.verify(
										e[".google.api.resourceReference"]
									)
									if (r) return ".google.api.resourceReference." + r
								}
								return null
							}
							FieldOptions.fromObject = function fromObject(e) {
								if (e instanceof n.google.protobuf.FieldOptions) return e
								var t = new n.google.protobuf.FieldOptions()
								switch (e.ctype) {
									case "STRING":
									case 0:
										t.ctype = 0
										break
									case "CORD":
									case 1:
										t.ctype = 1
										break
									case "STRING_PIECE":
									case 2:
										t.ctype = 2
										break
								}
								if (e.packed != null) t.packed = Boolean(e.packed)
								switch (e.jstype) {
									case "JS_NORMAL":
									case 0:
										t.jstype = 0
										break
									case "JS_STRING":
									case 1:
										t.jstype = 1
										break
									case "JS_NUMBER":
									case 2:
										t.jstype = 2
										break
								}
								if (e.lazy != null) t.lazy = Boolean(e.lazy)
								if (e.deprecated != null) t.deprecated = Boolean(e.deprecated)
								if (e.weak != null) t.weak = Boolean(e.weak)
								if (e.uninterpretedOption) {
									if (!Array.isArray(e.uninterpretedOption))
										throw TypeError(
											".google.protobuf.FieldOptions.uninterpretedOption: array expected"
										)
									t.uninterpretedOption = []
									for (var r = 0; r < e.uninterpretedOption.length; ++r) {
										if (typeof e.uninterpretedOption[r] !== "object")
											throw TypeError(
												".google.protobuf.FieldOptions.uninterpretedOption: object expected"
											)
										t.uninterpretedOption[r] =
											n.google.protobuf.UninterpretedOption.fromObject(
												e.uninterpretedOption[r]
											)
									}
								}
								if (e[".google.api.fieldBehavior"]) {
									if (!Array.isArray(e[".google.api.fieldBehavior"]))
										throw TypeError(
											".google.protobuf.FieldOptions..google.api.fieldBehavior: array expected"
										)
									t[".google.api.fieldBehavior"] = []
									for (
										var r = 0;
										r < e[".google.api.fieldBehavior"].length;
										++r
									)
										switch (e[".google.api.fieldBehavior"][r]) {
											default:
											case "FIELD_BEHAVIOR_UNSPECIFIED":
											case 0:
												t[".google.api.fieldBehavior"][r] = 0
												break
											case "OPTIONAL":
											case 1:
												t[".google.api.fieldBehavior"][r] = 1
												break
											case "REQUIRED":
											case 2:
												t[".google.api.fieldBehavior"][r] = 2
												break
											case "OUTPUT_ONLY":
											case 3:
												t[".google.api.fieldBehavior"][r] = 3
												break
											case "INPUT_ONLY":
											case 4:
												t[".google.api.fieldBehavior"][r] = 4
												break
											case "IMMUTABLE":
											case 5:
												t[".google.api.fieldBehavior"][r] = 5
												break
										}
								}
								if (e[".google.api.resourceReference"] != null) {
									if (typeof e[".google.api.resourceReference"] !== "object")
										throw TypeError(
											".google.protobuf.FieldOptions..google.api.resourceReference: object expected"
										)
									t[".google.api.resourceReference"] =
										n.google.api.ResourceReference.fromObject(
											e[".google.api.resourceReference"]
										)
								}
								return t
							}
							FieldOptions.toObject = function toObject(e, t) {
								if (!t) t = {}
								var r = {}
								if (t.arrays || t.defaults) {
									r.uninterpretedOption = []
									r[".google.api.fieldBehavior"] = []
								}
								if (t.defaults) {
									r.ctype = t.enums === String ? "STRING" : 0
									r.packed = false
									r.deprecated = false
									r.lazy = false
									r.jstype = t.enums === String ? "JS_NORMAL" : 0
									r.weak = false
									r[".google.api.resourceReference"] = null
								}
								if (e.ctype != null && e.hasOwnProperty("ctype"))
									r.ctype =
										t.enums === String
											? n.google.protobuf.FieldOptions.CType[e.ctype]
											: e.ctype
								if (e.packed != null && e.hasOwnProperty("packed"))
									r.packed = e.packed
								if (e.deprecated != null && e.hasOwnProperty("deprecated"))
									r.deprecated = e.deprecated
								if (e.lazy != null && e.hasOwnProperty("lazy")) r.lazy = e.lazy
								if (e.jstype != null && e.hasOwnProperty("jstype"))
									r.jstype =
										t.enums === String
											? n.google.protobuf.FieldOptions.JSType[e.jstype]
											: e.jstype
								if (e.weak != null && e.hasOwnProperty("weak")) r.weak = e.weak
								if (e.uninterpretedOption && e.uninterpretedOption.length) {
									r.uninterpretedOption = []
									for (var o = 0; o < e.uninterpretedOption.length; ++o)
										r.uninterpretedOption[o] =
											n.google.protobuf.UninterpretedOption.toObject(
												e.uninterpretedOption[o],
												t
											)
								}
								if (
									e[".google.api.fieldBehavior"] &&
									e[".google.api.fieldBehavior"].length
								) {
									r[".google.api.fieldBehavior"] = []
									for (
										var o = 0;
										o < e[".google.api.fieldBehavior"].length;
										++o
									)
										r[".google.api.fieldBehavior"][o] =
											t.enums === String
												? n.google.api.FieldBehavior[
														e[".google.api.fieldBehavior"][o]
												  ]
												: e[".google.api.fieldBehavior"][o]
								}
								if (
									e[".google.api.resourceReference"] != null &&
									e.hasOwnProperty(".google.api.resourceReference")
								)
									r[".google.api.resourceReference"] =
										n.google.api.ResourceReference.toObject(
											e[".google.api.resourceReference"],
											t
										)
								return r
							}
							FieldOptions.prototype.toJSON = function toJSON() {
								return this.constructor.toObject(this, e.util.toJSONOptions)
							}
							FieldOptions.CType = (function () {
								var e = {},
									t = Object.create(e)
								t[(e[0] = "STRING")] = 0
								t[(e[1] = "CORD")] = 1
								t[(e[2] = "STRING_PIECE")] = 2
								return t
							})()
							FieldOptions.JSType = (function () {
								var e = {},
									t = Object.create(e)
								t[(e[0] = "JS_NORMAL")] = 0
								t[(e[1] = "JS_STRING")] = 1
								t[(e[2] = "JS_NUMBER")] = 2
								return t
							})()
							return FieldOptions
						})()
						i.OneofOptions = (function () {
							function OneofOptions(e) {
								this.uninterpretedOption = []
								if (e)
									for (var t = Object.keys(e), r = 0; r < t.length; ++r)
										if (e[t[r]] != null) this[t[r]] = e[t[r]]
							}
							OneofOptions.prototype.uninterpretedOption = o.emptyArray
							OneofOptions.create = function create(e) {
								return new OneofOptions(e)
							}
							OneofOptions.encode = function encode(e, t) {
								if (!t) t = r.create()
								if (
									e.uninterpretedOption != null &&
									e.uninterpretedOption.length
								)
									for (var o = 0; o < e.uninterpretedOption.length; ++o)
										n.google.protobuf.UninterpretedOption.encode(
											e.uninterpretedOption[o],
											t.uint32(7994).fork()
										).ldelim()
								return t
							}
							OneofOptions.encodeDelimited = function encodeDelimited(e, t) {
								return this.encode(e, t).ldelim()
							}
							OneofOptions.decode = function decode(e, r) {
								if (!(e instanceof t)) e = t.create(e)
								var o = r === undefined ? e.len : e.pos + r,
									i = new n.google.protobuf.OneofOptions()
								while (e.pos < o) {
									var a = e.uint32()
									switch (a >>> 3) {
										case 999:
											if (
												!(i.uninterpretedOption && i.uninterpretedOption.length)
											)
												i.uninterpretedOption = []
											i.uninterpretedOption.push(
												n.google.protobuf.UninterpretedOption.decode(
													e,
													e.uint32()
												)
											)
											break
										default:
											e.skipType(a & 7)
											break
									}
								}
								return i
							}
							OneofOptions.decodeDelimited = function decodeDelimited(e) {
								if (!(e instanceof t)) e = new t(e)
								return this.decode(e, e.uint32())
							}
							OneofOptions.verify = function verify(e) {
								if (typeof e !== "object" || e === null)
									return "object expected"
								if (
									e.uninterpretedOption != null &&
									e.hasOwnProperty("uninterpretedOption")
								) {
									if (!Array.isArray(e.uninterpretedOption))
										return "uninterpretedOption: array expected"
									for (var t = 0; t < e.uninterpretedOption.length; ++t) {
										var r = n.google.protobuf.UninterpretedOption.verify(
											e.uninterpretedOption[t]
										)
										if (r) return "uninterpretedOption." + r
									}
								}
								return null
							}
							OneofOptions.fromObject = function fromObject(e) {
								if (e instanceof n.google.protobuf.OneofOptions) return e
								var t = new n.google.protobuf.OneofOptions()
								if (e.uninterpretedOption) {
									if (!Array.isArray(e.uninterpretedOption))
										throw TypeError(
											".google.protobuf.OneofOptions.uninterpretedOption: array expected"
										)
									t.uninterpretedOption = []
									for (var r = 0; r < e.uninterpretedOption.length; ++r) {
										if (typeof e.uninterpretedOption[r] !== "object")
											throw TypeError(
												".google.protobuf.OneofOptions.uninterpretedOption: object expected"
											)
										t.uninterpretedOption[r] =
											n.google.protobuf.UninterpretedOption.fromObject(
												e.uninterpretedOption[r]
											)
									}
								}
								return t
							}
							OneofOptions.toObject = function toObject(e, t) {
								if (!t) t = {}
								var r = {}
								if (t.arrays || t.defaults) r.uninterpretedOption = []
								if (e.uninterpretedOption && e.uninterpretedOption.length) {
									r.uninterpretedOption = []
									for (var o = 0; o < e.uninterpretedOption.length; ++o)
										r.uninterpretedOption[o] =
											n.google.protobuf.UninterpretedOption.toObject(
												e.uninterpretedOption[o],
												t
											)
								}
								return r
							}
							OneofOptions.prototype.toJSON = function toJSON() {
								return this.constructor.toObject(this, e.util.toJSONOptions)
							}
							return OneofOptions
						})()
						i.EnumOptions = (function () {
							function EnumOptions(e) {
								this.uninterpretedOption = []
								if (e)
									for (var t = Object.keys(e), r = 0; r < t.length; ++r)
										if (e[t[r]] != null) this[t[r]] = e[t[r]]
							}
							EnumOptions.prototype.allowAlias = false
							EnumOptions.prototype.deprecated = false
							EnumOptions.prototype.uninterpretedOption = o.emptyArray
							EnumOptions.create = function create(e) {
								return new EnumOptions(e)
							}
							EnumOptions.encode = function encode(e, t) {
								if (!t) t = r.create()
								if (
									e.allowAlias != null &&
									Object.hasOwnProperty.call(e, "allowAlias")
								)
									t.uint32(16).bool(e.allowAlias)
								if (
									e.deprecated != null &&
									Object.hasOwnProperty.call(e, "deprecated")
								)
									t.uint32(24).bool(e.deprecated)
								if (
									e.uninterpretedOption != null &&
									e.uninterpretedOption.length
								)
									for (var o = 0; o < e.uninterpretedOption.length; ++o)
										n.google.protobuf.UninterpretedOption.encode(
											e.uninterpretedOption[o],
											t.uint32(7994).fork()
										).ldelim()
								return t
							}
							EnumOptions.encodeDelimited = function encodeDelimited(e, t) {
								return this.encode(e, t).ldelim()
							}
							EnumOptions.decode = function decode(e, r) {
								if (!(e instanceof t)) e = t.create(e)
								var o = r === undefined ? e.len : e.pos + r,
									i = new n.google.protobuf.EnumOptions()
								while (e.pos < o) {
									var a = e.uint32()
									switch (a >>> 3) {
										case 2:
											i.allowAlias = e.bool()
											break
										case 3:
											i.deprecated = e.bool()
											break
										case 999:
											if (
												!(i.uninterpretedOption && i.uninterpretedOption.length)
											)
												i.uninterpretedOption = []
											i.uninterpretedOption.push(
												n.google.protobuf.UninterpretedOption.decode(
													e,
													e.uint32()
												)
											)
											break
										default:
											e.skipType(a & 7)
											break
									}
								}
								return i
							}
							EnumOptions.decodeDelimited = function decodeDelimited(e) {
								if (!(e instanceof t)) e = new t(e)
								return this.decode(e, e.uint32())
							}
							EnumOptions.verify = function verify(e) {
								if (typeof e !== "object" || e === null)
									return "object expected"
								if (e.allowAlias != null && e.hasOwnProperty("allowAlias"))
									if (typeof e.allowAlias !== "boolean")
										return "allowAlias: boolean expected"
								if (e.deprecated != null && e.hasOwnProperty("deprecated"))
									if (typeof e.deprecated !== "boolean")
										return "deprecated: boolean expected"
								if (
									e.uninterpretedOption != null &&
									e.hasOwnProperty("uninterpretedOption")
								) {
									if (!Array.isArray(e.uninterpretedOption))
										return "uninterpretedOption: array expected"
									for (var t = 0; t < e.uninterpretedOption.length; ++t) {
										var r = n.google.protobuf.UninterpretedOption.verify(
											e.uninterpretedOption[t]
										)
										if (r) return "uninterpretedOption." + r
									}
								}
								return null
							}
							EnumOptions.fromObject = function fromObject(e) {
								if (e instanceof n.google.protobuf.EnumOptions) return e
								var t = new n.google.protobuf.EnumOptions()
								if (e.allowAlias != null) t.allowAlias = Boolean(e.allowAlias)
								if (e.deprecated != null) t.deprecated = Boolean(e.deprecated)
								if (e.uninterpretedOption) {
									if (!Array.isArray(e.uninterpretedOption))
										throw TypeError(
											".google.protobuf.EnumOptions.uninterpretedOption: array expected"
										)
									t.uninterpretedOption = []
									for (var r = 0; r < e.uninterpretedOption.length; ++r) {
										if (typeof e.uninterpretedOption[r] !== "object")
											throw TypeError(
												".google.protobuf.EnumOptions.uninterpretedOption: object expected"
											)
										t.uninterpretedOption[r] =
											n.google.protobuf.UninterpretedOption.fromObject(
												e.uninterpretedOption[r]
											)
									}
								}
								return t
							}
							EnumOptions.toObject = function toObject(e, t) {
								if (!t) t = {}
								var r = {}
								if (t.arrays || t.defaults) r.uninterpretedOption = []
								if (t.defaults) {
									r.allowAlias = false
									r.deprecated = false
								}
								if (e.allowAlias != null && e.hasOwnProperty("allowAlias"))
									r.allowAlias = e.allowAlias
								if (e.deprecated != null && e.hasOwnProperty("deprecated"))
									r.deprecated = e.deprecated
								if (e.uninterpretedOption && e.uninterpretedOption.length) {
									r.uninterpretedOption = []
									for (var o = 0; o < e.uninterpretedOption.length; ++o)
										r.uninterpretedOption[o] =
											n.google.protobuf.UninterpretedOption.toObject(
												e.uninterpretedOption[o],
												t
											)
								}
								return r
							}
							EnumOptions.prototype.toJSON = function toJSON() {
								return this.constructor.toObject(this, e.util.toJSONOptions)
							}
							return EnumOptions
						})()
						i.EnumValueOptions = (function () {
							function EnumValueOptions(e) {
								this.uninterpretedOption = []
								if (e)
									for (var t = Object.keys(e), r = 0; r < t.length; ++r)
										if (e[t[r]] != null) this[t[r]] = e[t[r]]
							}
							EnumValueOptions.prototype.deprecated = false
							EnumValueOptions.prototype.uninterpretedOption = o.emptyArray
							EnumValueOptions.create = function create(e) {
								return new EnumValueOptions(e)
							}
							EnumValueOptions.encode = function encode(e, t) {
								if (!t) t = r.create()
								if (
									e.deprecated != null &&
									Object.hasOwnProperty.call(e, "deprecated")
								)
									t.uint32(8).bool(e.deprecated)
								if (
									e.uninterpretedOption != null &&
									e.uninterpretedOption.length
								)
									for (var o = 0; o < e.uninterpretedOption.length; ++o)
										n.google.protobuf.UninterpretedOption.encode(
											e.uninterpretedOption[o],
											t.uint32(7994).fork()
										).ldelim()
								return t
							}
							EnumValueOptions.encodeDelimited = function encodeDelimited(
								e,
								t
							) {
								return this.encode(e, t).ldelim()
							}
							EnumValueOptions.decode = function decode(e, r) {
								if (!(e instanceof t)) e = t.create(e)
								var o = r === undefined ? e.len : e.pos + r,
									i = new n.google.protobuf.EnumValueOptions()
								while (e.pos < o) {
									var a = e.uint32()
									switch (a >>> 3) {
										case 1:
											i.deprecated = e.bool()
											break
										case 999:
											if (
												!(i.uninterpretedOption && i.uninterpretedOption.length)
											)
												i.uninterpretedOption = []
											i.uninterpretedOption.push(
												n.google.protobuf.UninterpretedOption.decode(
													e,
													e.uint32()
												)
											)
											break
										default:
											e.skipType(a & 7)
											break
									}
								}
								return i
							}
							EnumValueOptions.decodeDelimited = function decodeDelimited(e) {
								if (!(e instanceof t)) e = new t(e)
								return this.decode(e, e.uint32())
							}
							EnumValueOptions.verify = function verify(e) {
								if (typeof e !== "object" || e === null)
									return "object expected"
								if (e.deprecated != null && e.hasOwnProperty("deprecated"))
									if (typeof e.deprecated !== "boolean")
										return "deprecated: boolean expected"
								if (
									e.uninterpretedOption != null &&
									e.hasOwnProperty("uninterpretedOption")
								) {
									if (!Array.isArray(e.uninterpretedOption))
										return "uninterpretedOption: array expected"
									for (var t = 0; t < e.uninterpretedOption.length; ++t) {
										var r = n.google.protobuf.UninterpretedOption.verify(
											e.uninterpretedOption[t]
										)
										if (r) return "uninterpretedOption." + r
									}
								}
								return null
							}
							EnumValueOptions.fromObject = function fromObject(e) {
								if (e instanceof n.google.protobuf.EnumValueOptions) return e
								var t = new n.google.protobuf.EnumValueOptions()
								if (e.deprecated != null) t.deprecated = Boolean(e.deprecated)
								if (e.uninterpretedOption) {
									if (!Array.isArray(e.uninterpretedOption))
										throw TypeError(
											".google.protobuf.EnumValueOptions.uninterpretedOption: array expected"
										)
									t.uninterpretedOption = []
									for (var r = 0; r < e.uninterpretedOption.length; ++r) {
										if (typeof e.uninterpretedOption[r] !== "object")
											throw TypeError(
												".google.protobuf.EnumValueOptions.uninterpretedOption: object expected"
											)
										t.uninterpretedOption[r] =
											n.google.protobuf.UninterpretedOption.fromObject(
												e.uninterpretedOption[r]
											)
									}
								}
								return t
							}
							EnumValueOptions.toObject = function toObject(e, t) {
								if (!t) t = {}
								var r = {}
								if (t.arrays || t.defaults) r.uninterpretedOption = []
								if (t.defaults) r.deprecated = false
								if (e.deprecated != null && e.hasOwnProperty("deprecated"))
									r.deprecated = e.deprecated
								if (e.uninterpretedOption && e.uninterpretedOption.length) {
									r.uninterpretedOption = []
									for (var o = 0; o < e.uninterpretedOption.length; ++o)
										r.uninterpretedOption[o] =
											n.google.protobuf.UninterpretedOption.toObject(
												e.uninterpretedOption[o],
												t
											)
								}
								return r
							}
							EnumValueOptions.prototype.toJSON = function toJSON() {
								return this.constructor.toObject(this, e.util.toJSONOptions)
							}
							return EnumValueOptions
						})()
						i.ServiceOptions = (function () {
							function ServiceOptions(e) {
								this.uninterpretedOption = []
								if (e)
									for (var t = Object.keys(e), r = 0; r < t.length; ++r)
										if (e[t[r]] != null) this[t[r]] = e[t[r]]
							}
							ServiceOptions.prototype.deprecated = false
							ServiceOptions.prototype.uninterpretedOption = o.emptyArray
							ServiceOptions.prototype[".google.api.defaultHost"] = ""
							ServiceOptions.prototype[".google.api.oauthScopes"] = ""
							ServiceOptions.create = function create(e) {
								return new ServiceOptions(e)
							}
							ServiceOptions.encode = function encode(e, t) {
								if (!t) t = r.create()
								if (
									e.deprecated != null &&
									Object.hasOwnProperty.call(e, "deprecated")
								)
									t.uint32(264).bool(e.deprecated)
								if (
									e.uninterpretedOption != null &&
									e.uninterpretedOption.length
								)
									for (var o = 0; o < e.uninterpretedOption.length; ++o)
										n.google.protobuf.UninterpretedOption.encode(
											e.uninterpretedOption[o],
											t.uint32(7994).fork()
										).ldelim()
								if (
									e[".google.api.defaultHost"] != null &&
									Object.hasOwnProperty.call(e, ".google.api.defaultHost")
								)
									t.uint32(8394).string(e[".google.api.defaultHost"])
								if (
									e[".google.api.oauthScopes"] != null &&
									Object.hasOwnProperty.call(e, ".google.api.oauthScopes")
								)
									t.uint32(8402).string(e[".google.api.oauthScopes"])
								return t
							}
							ServiceOptions.encodeDelimited = function encodeDelimited(e, t) {
								return this.encode(e, t).ldelim()
							}
							ServiceOptions.decode = function decode(e, r) {
								if (!(e instanceof t)) e = t.create(e)
								var o = r === undefined ? e.len : e.pos + r,
									i = new n.google.protobuf.ServiceOptions()
								while (e.pos < o) {
									var a = e.uint32()
									switch (a >>> 3) {
										case 33:
											i.deprecated = e.bool()
											break
										case 999:
											if (
												!(i.uninterpretedOption && i.uninterpretedOption.length)
											)
												i.uninterpretedOption = []
											i.uninterpretedOption.push(
												n.google.protobuf.UninterpretedOption.decode(
													e,
													e.uint32()
												)
											)
											break
										case 1049:
											i[".google.api.defaultHost"] = e.string()
											break
										case 1050:
											i[".google.api.oauthScopes"] = e.string()
											break
										default:
											e.skipType(a & 7)
											break
									}
								}
								return i
							}
							ServiceOptions.decodeDelimited = function decodeDelimited(e) {
								if (!(e instanceof t)) e = new t(e)
								return this.decode(e, e.uint32())
							}
							ServiceOptions.verify = function verify(e) {
								if (typeof e !== "object" || e === null)
									return "object expected"
								if (e.deprecated != null && e.hasOwnProperty("deprecated"))
									if (typeof e.deprecated !== "boolean")
										return "deprecated: boolean expected"
								if (
									e.uninterpretedOption != null &&
									e.hasOwnProperty("uninterpretedOption")
								) {
									if (!Array.isArray(e.uninterpretedOption))
										return "uninterpretedOption: array expected"
									for (var t = 0; t < e.uninterpretedOption.length; ++t) {
										var r = n.google.protobuf.UninterpretedOption.verify(
											e.uninterpretedOption[t]
										)
										if (r) return "uninterpretedOption." + r
									}
								}
								if (
									e[".google.api.defaultHost"] != null &&
									e.hasOwnProperty(".google.api.defaultHost")
								)
									if (!o.isString(e[".google.api.defaultHost"]))
										return ".google.api.defaultHost: string expected"
								if (
									e[".google.api.oauthScopes"] != null &&
									e.hasOwnProperty(".google.api.oauthScopes")
								)
									if (!o.isString(e[".google.api.oauthScopes"]))
										return ".google.api.oauthScopes: string expected"
								return null
							}
							ServiceOptions.fromObject = function fromObject(e) {
								if (e instanceof n.google.protobuf.ServiceOptions) return e
								var t = new n.google.protobuf.ServiceOptions()
								if (e.deprecated != null) t.deprecated = Boolean(e.deprecated)
								if (e.uninterpretedOption) {
									if (!Array.isArray(e.uninterpretedOption))
										throw TypeError(
											".google.protobuf.ServiceOptions.uninterpretedOption: array expected"
										)
									t.uninterpretedOption = []
									for (var r = 0; r < e.uninterpretedOption.length; ++r) {
										if (typeof e.uninterpretedOption[r] !== "object")
											throw TypeError(
												".google.protobuf.ServiceOptions.uninterpretedOption: object expected"
											)
										t.uninterpretedOption[r] =
											n.google.protobuf.UninterpretedOption.fromObject(
												e.uninterpretedOption[r]
											)
									}
								}
								if (e[".google.api.defaultHost"] != null)
									t[".google.api.defaultHost"] = String(
										e[".google.api.defaultHost"]
									)
								if (e[".google.api.oauthScopes"] != null)
									t[".google.api.oauthScopes"] = String(
										e[".google.api.oauthScopes"]
									)
								return t
							}
							ServiceOptions.toObject = function toObject(e, t) {
								if (!t) t = {}
								var r = {}
								if (t.arrays || t.defaults) r.uninterpretedOption = []
								if (t.defaults) {
									r.deprecated = false
									r[".google.api.defaultHost"] = ""
									r[".google.api.oauthScopes"] = ""
								}
								if (e.deprecated != null && e.hasOwnProperty("deprecated"))
									r.deprecated = e.deprecated
								if (e.uninterpretedOption && e.uninterpretedOption.length) {
									r.uninterpretedOption = []
									for (var o = 0; o < e.uninterpretedOption.length; ++o)
										r.uninterpretedOption[o] =
											n.google.protobuf.UninterpretedOption.toObject(
												e.uninterpretedOption[o],
												t
											)
								}
								if (
									e[".google.api.defaultHost"] != null &&
									e.hasOwnProperty(".google.api.defaultHost")
								)
									r[".google.api.defaultHost"] = e[".google.api.defaultHost"]
								if (
									e[".google.api.oauthScopes"] != null &&
									e.hasOwnProperty(".google.api.oauthScopes")
								)
									r[".google.api.oauthScopes"] = e[".google.api.oauthScopes"]
								return r
							}
							ServiceOptions.prototype.toJSON = function toJSON() {
								return this.constructor.toObject(this, e.util.toJSONOptions)
							}
							return ServiceOptions
						})()
						i.MethodOptions = (function () {
							function MethodOptions(e) {
								this.uninterpretedOption = []
								this[".google.api.methodSignature"] = []
								if (e)
									for (var t = Object.keys(e), r = 0; r < t.length; ++r)
										if (e[t[r]] != null) this[t[r]] = e[t[r]]
							}
							MethodOptions.prototype.deprecated = false
							MethodOptions.prototype.idempotencyLevel = 0
							MethodOptions.prototype.uninterpretedOption = o.emptyArray
							MethodOptions.prototype[".google.api.http"] = null
							MethodOptions.prototype[".google.api.methodSignature"] =
								o.emptyArray
							MethodOptions.create = function create(e) {
								return new MethodOptions(e)
							}
							MethodOptions.encode = function encode(e, t) {
								if (!t) t = r.create()
								if (
									e.deprecated != null &&
									Object.hasOwnProperty.call(e, "deprecated")
								)
									t.uint32(264).bool(e.deprecated)
								if (
									e.idempotencyLevel != null &&
									Object.hasOwnProperty.call(e, "idempotencyLevel")
								)
									t.uint32(272).int32(e.idempotencyLevel)
								if (
									e.uninterpretedOption != null &&
									e.uninterpretedOption.length
								)
									for (var o = 0; o < e.uninterpretedOption.length; ++o)
										n.google.protobuf.UninterpretedOption.encode(
											e.uninterpretedOption[o],
											t.uint32(7994).fork()
										).ldelim()
								if (
									e[".google.api.methodSignature"] != null &&
									e[".google.api.methodSignature"].length
								)
									for (
										var o = 0;
										o < e[".google.api.methodSignature"].length;
										++o
									)
										t.uint32(8410).string(e[".google.api.methodSignature"][o])
								if (
									e[".google.api.http"] != null &&
									Object.hasOwnProperty.call(e, ".google.api.http")
								)
									n.google.api.HttpRule.encode(
										e[".google.api.http"],
										t.uint32(578365826).fork()
									).ldelim()
								return t
							}
							MethodOptions.encodeDelimited = function encodeDelimited(e, t) {
								return this.encode(e, t).ldelim()
							}
							MethodOptions.decode = function decode(e, r) {
								if (!(e instanceof t)) e = t.create(e)
								var o = r === undefined ? e.len : e.pos + r,
									i = new n.google.protobuf.MethodOptions()
								while (e.pos < o) {
									var a = e.uint32()
									switch (a >>> 3) {
										case 33:
											i.deprecated = e.bool()
											break
										case 34:
											i.idempotencyLevel = e.int32()
											break
										case 999:
											if (
												!(i.uninterpretedOption && i.uninterpretedOption.length)
											)
												i.uninterpretedOption = []
											i.uninterpretedOption.push(
												n.google.protobuf.UninterpretedOption.decode(
													e,
													e.uint32()
												)
											)
											break
										case 72295728:
											i[".google.api.http"] = n.google.api.HttpRule.decode(
												e,
												e.uint32()
											)
											break
										case 1051:
											if (
												!(
													i[".google.api.methodSignature"] &&
													i[".google.api.methodSignature"].length
												)
											)
												i[".google.api.methodSignature"] = []
											i[".google.api.methodSignature"].push(e.string())
											break
										default:
											e.skipType(a & 7)
											break
									}
								}
								return i
							}
							MethodOptions.decodeDelimited = function decodeDelimited(e) {
								if (!(e instanceof t)) e = new t(e)
								return this.decode(e, e.uint32())
							}
							MethodOptions.verify = function verify(e) {
								if (typeof e !== "object" || e === null)
									return "object expected"
								if (e.deprecated != null && e.hasOwnProperty("deprecated"))
									if (typeof e.deprecated !== "boolean")
										return "deprecated: boolean expected"
								if (
									e.idempotencyLevel != null &&
									e.hasOwnProperty("idempotencyLevel")
								)
									switch (e.idempotencyLevel) {
										default:
											return "idempotencyLevel: enum value expected"
										case 0:
										case 1:
										case 2:
											break
									}
								if (
									e.uninterpretedOption != null &&
									e.hasOwnProperty("uninterpretedOption")
								) {
									if (!Array.isArray(e.uninterpretedOption))
										return "uninterpretedOption: array expected"
									for (var t = 0; t < e.uninterpretedOption.length; ++t) {
										var r = n.google.protobuf.UninterpretedOption.verify(
											e.uninterpretedOption[t]
										)
										if (r) return "uninterpretedOption." + r
									}
								}
								if (
									e[".google.api.http"] != null &&
									e.hasOwnProperty(".google.api.http")
								) {
									var r = n.google.api.HttpRule.verify(e[".google.api.http"])
									if (r) return ".google.api.http." + r
								}
								if (
									e[".google.api.methodSignature"] != null &&
									e.hasOwnProperty(".google.api.methodSignature")
								) {
									if (!Array.isArray(e[".google.api.methodSignature"]))
										return ".google.api.methodSignature: array expected"
									for (
										var t = 0;
										t < e[".google.api.methodSignature"].length;
										++t
									)
										if (!o.isString(e[".google.api.methodSignature"][t]))
											return ".google.api.methodSignature: string[] expected"
								}
								return null
							}
							MethodOptions.fromObject = function fromObject(e) {
								if (e instanceof n.google.protobuf.MethodOptions) return e
								var t = new n.google.protobuf.MethodOptions()
								if (e.deprecated != null) t.deprecated = Boolean(e.deprecated)
								switch (e.idempotencyLevel) {
									case "IDEMPOTENCY_UNKNOWN":
									case 0:
										t.idempotencyLevel = 0
										break
									case "NO_SIDE_EFFECTS":
									case 1:
										t.idempotencyLevel = 1
										break
									case "IDEMPOTENT":
									case 2:
										t.idempotencyLevel = 2
										break
								}
								if (e.uninterpretedOption) {
									if (!Array.isArray(e.uninterpretedOption))
										throw TypeError(
											".google.protobuf.MethodOptions.uninterpretedOption: array expected"
										)
									t.uninterpretedOption = []
									for (var r = 0; r < e.uninterpretedOption.length; ++r) {
										if (typeof e.uninterpretedOption[r] !== "object")
											throw TypeError(
												".google.protobuf.MethodOptions.uninterpretedOption: object expected"
											)
										t.uninterpretedOption[r] =
											n.google.protobuf.UninterpretedOption.fromObject(
												e.uninterpretedOption[r]
											)
									}
								}
								if (e[".google.api.http"] != null) {
									if (typeof e[".google.api.http"] !== "object")
										throw TypeError(
											".google.protobuf.MethodOptions..google.api.http: object expected"
										)
									t[".google.api.http"] = n.google.api.HttpRule.fromObject(
										e[".google.api.http"]
									)
								}
								if (e[".google.api.methodSignature"]) {
									if (!Array.isArray(e[".google.api.methodSignature"]))
										throw TypeError(
											".google.protobuf.MethodOptions..google.api.methodSignature: array expected"
										)
									t[".google.api.methodSignature"] = []
									for (
										var r = 0;
										r < e[".google.api.methodSignature"].length;
										++r
									)
										t[".google.api.methodSignature"][r] = String(
											e[".google.api.methodSignature"][r]
										)
								}
								return t
							}
							MethodOptions.toObject = function toObject(e, t) {
								if (!t) t = {}
								var r = {}
								if (t.arrays || t.defaults) {
									r.uninterpretedOption = []
									r[".google.api.methodSignature"] = []
								}
								if (t.defaults) {
									r.deprecated = false
									r.idempotencyLevel =
										t.enums === String ? "IDEMPOTENCY_UNKNOWN" : 0
									r[".google.api.http"] = null
								}
								if (e.deprecated != null && e.hasOwnProperty("deprecated"))
									r.deprecated = e.deprecated
								if (
									e.idempotencyLevel != null &&
									e.hasOwnProperty("idempotencyLevel")
								)
									r.idempotencyLevel =
										t.enums === String
											? n.google.protobuf.MethodOptions.IdempotencyLevel[
													e.idempotencyLevel
											  ]
											: e.idempotencyLevel
								if (e.uninterpretedOption && e.uninterpretedOption.length) {
									r.uninterpretedOption = []
									for (var o = 0; o < e.uninterpretedOption.length; ++o)
										r.uninterpretedOption[o] =
											n.google.protobuf.UninterpretedOption.toObject(
												e.uninterpretedOption[o],
												t
											)
								}
								if (
									e[".google.api.methodSignature"] &&
									e[".google.api.methodSignature"].length
								) {
									r[".google.api.methodSignature"] = []
									for (
										var o = 0;
										o < e[".google.api.methodSignature"].length;
										++o
									)
										r[".google.api.methodSignature"][o] =
											e[".google.api.methodSignature"][o]
								}
								if (
									e[".google.api.http"] != null &&
									e.hasOwnProperty(".google.api.http")
								)
									r[".google.api.http"] = n.google.api.HttpRule.toObject(
										e[".google.api.http"],
										t
									)
								return r
							}
							MethodOptions.prototype.toJSON = function toJSON() {
								return this.constructor.toObject(this, e.util.toJSONOptions)
							}
							MethodOptions.IdempotencyLevel = (function () {
								var e = {},
									t = Object.create(e)
								t[(e[0] = "IDEMPOTENCY_UNKNOWN")] = 0
								t[(e[1] = "NO_SIDE_EFFECTS")] = 1
								t[(e[2] = "IDEMPOTENT")] = 2
								return t
							})()
							return MethodOptions
						})()
						i.UninterpretedOption = (function () {
							function UninterpretedOption(e) {
								this.name = []
								if (e)
									for (var t = Object.keys(e), r = 0; r < t.length; ++r)
										if (e[t[r]] != null) this[t[r]] = e[t[r]]
							}
							UninterpretedOption.prototype.name = o.emptyArray
							UninterpretedOption.prototype.identifierValue = ""
							UninterpretedOption.prototype.positiveIntValue = o.Long
								? o.Long.fromBits(0, 0, true)
								: 0
							UninterpretedOption.prototype.negativeIntValue = o.Long
								? o.Long.fromBits(0, 0, false)
								: 0
							UninterpretedOption.prototype.doubleValue = 0
							UninterpretedOption.prototype.stringValue = o.newBuffer([])
							UninterpretedOption.prototype.aggregateValue = ""
							UninterpretedOption.create = function create(e) {
								return new UninterpretedOption(e)
							}
							UninterpretedOption.encode = function encode(e, t) {
								if (!t) t = r.create()
								if (e.name != null && e.name.length)
									for (var o = 0; o < e.name.length; ++o)
										n.google.protobuf.UninterpretedOption.NamePart.encode(
											e.name[o],
											t.uint32(18).fork()
										).ldelim()
								if (
									e.identifierValue != null &&
									Object.hasOwnProperty.call(e, "identifierValue")
								)
									t.uint32(26).string(e.identifierValue)
								if (
									e.positiveIntValue != null &&
									Object.hasOwnProperty.call(e, "positiveIntValue")
								)
									t.uint32(32).uint64(e.positiveIntValue)
								if (
									e.negativeIntValue != null &&
									Object.hasOwnProperty.call(e, "negativeIntValue")
								)
									t.uint32(40).int64(e.negativeIntValue)
								if (
									e.doubleValue != null &&
									Object.hasOwnProperty.call(e, "doubleValue")
								)
									t.uint32(49).double(e.doubleValue)
								if (
									e.stringValue != null &&
									Object.hasOwnProperty.call(e, "stringValue")
								)
									t.uint32(58).bytes(e.stringValue)
								if (
									e.aggregateValue != null &&
									Object.hasOwnProperty.call(e, "aggregateValue")
								)
									t.uint32(66).string(e.aggregateValue)
								return t
							}
							UninterpretedOption.encodeDelimited = function encodeDelimited(
								e,
								t
							) {
								return this.encode(e, t).ldelim()
							}
							UninterpretedOption.decode = function decode(e, r) {
								if (!(e instanceof t)) e = t.create(e)
								var o = r === undefined ? e.len : e.pos + r,
									i = new n.google.protobuf.UninterpretedOption()
								while (e.pos < o) {
									var a = e.uint32()
									switch (a >>> 3) {
										case 2:
											if (!(i.name && i.name.length)) i.name = []
											i.name.push(
												n.google.protobuf.UninterpretedOption.NamePart.decode(
													e,
													e.uint32()
												)
											)
											break
										case 3:
											i.identifierValue = e.string()
											break
										case 4:
											i.positiveIntValue = e.uint64()
											break
										case 5:
											i.negativeIntValue = e.int64()
											break
										case 6:
											i.doubleValue = e.double()
											break
										case 7:
											i.stringValue = e.bytes()
											break
										case 8:
											i.aggregateValue = e.string()
											break
										default:
											e.skipType(a & 7)
											break
									}
								}
								return i
							}
							UninterpretedOption.decodeDelimited = function decodeDelimited(
								e
							) {
								if (!(e instanceof t)) e = new t(e)
								return this.decode(e, e.uint32())
							}
							UninterpretedOption.verify = function verify(e) {
								if (typeof e !== "object" || e === null)
									return "object expected"
								if (e.name != null && e.hasOwnProperty("name")) {
									if (!Array.isArray(e.name)) return "name: array expected"
									for (var t = 0; t < e.name.length; ++t) {
										var r =
											n.google.protobuf.UninterpretedOption.NamePart.verify(
												e.name[t]
											)
										if (r) return "name." + r
									}
								}
								if (
									e.identifierValue != null &&
									e.hasOwnProperty("identifierValue")
								)
									if (!o.isString(e.identifierValue))
										return "identifierValue: string expected"
								if (
									e.positiveIntValue != null &&
									e.hasOwnProperty("positiveIntValue")
								)
									if (
										!o.isInteger(e.positiveIntValue) &&
										!(
											e.positiveIntValue &&
											o.isInteger(e.positiveIntValue.low) &&
											o.isInteger(e.positiveIntValue.high)
										)
									)
										return "positiveIntValue: integer|Long expected"
								if (
									e.negativeIntValue != null &&
									e.hasOwnProperty("negativeIntValue")
								)
									if (
										!o.isInteger(e.negativeIntValue) &&
										!(
											e.negativeIntValue &&
											o.isInteger(e.negativeIntValue.low) &&
											o.isInteger(e.negativeIntValue.high)
										)
									)
										return "negativeIntValue: integer|Long expected"
								if (e.doubleValue != null && e.hasOwnProperty("doubleValue"))
									if (typeof e.doubleValue !== "number")
										return "doubleValue: number expected"
								if (e.stringValue != null && e.hasOwnProperty("stringValue"))
									if (
										!(
											(e.stringValue &&
												typeof e.stringValue.length === "number") ||
											o.isString(e.stringValue)
										)
									)
										return "stringValue: buffer expected"
								if (
									e.aggregateValue != null &&
									e.hasOwnProperty("aggregateValue")
								)
									if (!o.isString(e.aggregateValue))
										return "aggregateValue: string expected"
								return null
							}
							UninterpretedOption.fromObject = function fromObject(e) {
								if (e instanceof n.google.protobuf.UninterpretedOption) return e
								var t = new n.google.protobuf.UninterpretedOption()
								if (e.name) {
									if (!Array.isArray(e.name))
										throw TypeError(
											".google.protobuf.UninterpretedOption.name: array expected"
										)
									t.name = []
									for (var r = 0; r < e.name.length; ++r) {
										if (typeof e.name[r] !== "object")
											throw TypeError(
												".google.protobuf.UninterpretedOption.name: object expected"
											)
										t.name[r] =
											n.google.protobuf.UninterpretedOption.NamePart.fromObject(
												e.name[r]
											)
									}
								}
								if (e.identifierValue != null)
									t.identifierValue = String(e.identifierValue)
								if (e.positiveIntValue != null)
									if (o.Long)
										(t.positiveIntValue = o.Long.fromValue(
											e.positiveIntValue
										)).unsigned = true
									else if (typeof e.positiveIntValue === "string")
										t.positiveIntValue = parseInt(e.positiveIntValue, 10)
									else if (typeof e.positiveIntValue === "number")
										t.positiveIntValue = e.positiveIntValue
									else if (typeof e.positiveIntValue === "object")
										t.positiveIntValue = new o.LongBits(
											e.positiveIntValue.low >>> 0,
											e.positiveIntValue.high >>> 0
										).toNumber(true)
								if (e.negativeIntValue != null)
									if (o.Long)
										(t.negativeIntValue = o.Long.fromValue(
											e.negativeIntValue
										)).unsigned = false
									else if (typeof e.negativeIntValue === "string")
										t.negativeIntValue = parseInt(e.negativeIntValue, 10)
									else if (typeof e.negativeIntValue === "number")
										t.negativeIntValue = e.negativeIntValue
									else if (typeof e.negativeIntValue === "object")
										t.negativeIntValue = new o.LongBits(
											e.negativeIntValue.low >>> 0,
											e.negativeIntValue.high >>> 0
										).toNumber()
								if (e.doubleValue != null) t.doubleValue = Number(e.doubleValue)
								if (e.stringValue != null)
									if (typeof e.stringValue === "string")
										o.base64.decode(
											e.stringValue,
											(t.stringValue = o.newBuffer(
												o.base64.length(e.stringValue)
											)),
											0
										)
									else if (e.stringValue.length) t.stringValue = e.stringValue
								if (e.aggregateValue != null)
									t.aggregateValue = String(e.aggregateValue)
								return t
							}
							UninterpretedOption.toObject = function toObject(e, t) {
								if (!t) t = {}
								var r = {}
								if (t.arrays || t.defaults) r.name = []
								if (t.defaults) {
									r.identifierValue = ""
									if (o.Long) {
										var i = new o.Long(0, 0, true)
										r.positiveIntValue =
											t.longs === String
												? i.toString()
												: t.longs === Number
												? i.toNumber()
												: i
									} else r.positiveIntValue = t.longs === String ? "0" : 0
									if (o.Long) {
										var i = new o.Long(0, 0, false)
										r.negativeIntValue =
											t.longs === String
												? i.toString()
												: t.longs === Number
												? i.toNumber()
												: i
									} else r.negativeIntValue = t.longs === String ? "0" : 0
									r.doubleValue = 0
									if (t.bytes === String) r.stringValue = ""
									else {
										r.stringValue = []
										if (t.bytes !== Array)
											r.stringValue = o.newBuffer(r.stringValue)
									}
									r.aggregateValue = ""
								}
								if (e.name && e.name.length) {
									r.name = []
									for (var a = 0; a < e.name.length; ++a)
										r.name[a] =
											n.google.protobuf.UninterpretedOption.NamePart.toObject(
												e.name[a],
												t
											)
								}
								if (
									e.identifierValue != null &&
									e.hasOwnProperty("identifierValue")
								)
									r.identifierValue = e.identifierValue
								if (
									e.positiveIntValue != null &&
									e.hasOwnProperty("positiveIntValue")
								)
									if (typeof e.positiveIntValue === "number")
										r.positiveIntValue =
											t.longs === String
												? String(e.positiveIntValue)
												: e.positiveIntValue
									else
										r.positiveIntValue =
											t.longs === String
												? o.Long.prototype.toString.call(e.positiveIntValue)
												: t.longs === Number
												? new o.LongBits(
														e.positiveIntValue.low >>> 0,
														e.positiveIntValue.high >>> 0
												  ).toNumber(true)
												: e.positiveIntValue
								if (
									e.negativeIntValue != null &&
									e.hasOwnProperty("negativeIntValue")
								)
									if (typeof e.negativeIntValue === "number")
										r.negativeIntValue =
											t.longs === String
												? String(e.negativeIntValue)
												: e.negativeIntValue
									else
										r.negativeIntValue =
											t.longs === String
												? o.Long.prototype.toString.call(e.negativeIntValue)
												: t.longs === Number
												? new o.LongBits(
														e.negativeIntValue.low >>> 0,
														e.negativeIntValue.high >>> 0
												  ).toNumber()
												: e.negativeIntValue
								if (e.doubleValue != null && e.hasOwnProperty("doubleValue"))
									r.doubleValue =
										t.json && !isFinite(e.doubleValue)
											? String(e.doubleValue)
											: e.doubleValue
								if (e.stringValue != null && e.hasOwnProperty("stringValue"))
									r.stringValue =
										t.bytes === String
											? o.base64.encode(e.stringValue, 0, e.stringValue.length)
											: t.bytes === Array
											? Array.prototype.slice.call(e.stringValue)
											: e.stringValue
								if (
									e.aggregateValue != null &&
									e.hasOwnProperty("aggregateValue")
								)
									r.aggregateValue = e.aggregateValue
								return r
							}
							UninterpretedOption.prototype.toJSON = function toJSON() {
								return this.constructor.toObject(this, e.util.toJSONOptions)
							}
							UninterpretedOption.NamePart = (function () {
								function NamePart(e) {
									if (e)
										for (var t = Object.keys(e), r = 0; r < t.length; ++r)
											if (e[t[r]] != null) this[t[r]] = e[t[r]]
								}
								NamePart.prototype.namePart = ""
								NamePart.prototype.isExtension = false
								NamePart.create = function create(e) {
									return new NamePart(e)
								}
								NamePart.encode = function encode(e, t) {
									if (!t) t = r.create()
									t.uint32(10).string(e.namePart)
									t.uint32(16).bool(e.isExtension)
									return t
								}
								NamePart.encodeDelimited = function encodeDelimited(e, t) {
									return this.encode(e, t).ldelim()
								}
								NamePart.decode = function decode(e, r) {
									if (!(e instanceof t)) e = t.create(e)
									var i = r === undefined ? e.len : e.pos + r,
										a = new n.google.protobuf.UninterpretedOption.NamePart()
									while (e.pos < i) {
										var s = e.uint32()
										switch (s >>> 3) {
											case 1:
												a.namePart = e.string()
												break
											case 2:
												a.isExtension = e.bool()
												break
											default:
												e.skipType(s & 7)
												break
										}
									}
									if (!a.hasOwnProperty("namePart"))
										throw o.ProtocolError("missing required 'namePart'", {
											instance: a
										})
									if (!a.hasOwnProperty("isExtension"))
										throw o.ProtocolError("missing required 'isExtension'", {
											instance: a
										})
									return a
								}
								NamePart.decodeDelimited = function decodeDelimited(e) {
									if (!(e instanceof t)) e = new t(e)
									return this.decode(e, e.uint32())
								}
								NamePart.verify = function verify(e) {
									if (typeof e !== "object" || e === null)
										return "object expected"
									if (!o.isString(e.namePart))
										return "namePart: string expected"
									if (typeof e.isExtension !== "boolean")
										return "isExtension: boolean expected"
									return null
								}
								NamePart.fromObject = function fromObject(e) {
									if (
										e instanceof n.google.protobuf.UninterpretedOption.NamePart
									)
										return e
									var t = new n.google.protobuf.UninterpretedOption.NamePart()
									if (e.namePart != null) t.namePart = String(e.namePart)
									if (e.isExtension != null)
										t.isExtension = Boolean(e.isExtension)
									return t
								}
								NamePart.toObject = function toObject(e, t) {
									if (!t) t = {}
									var r = {}
									if (t.defaults) {
										r.namePart = ""
										r.isExtension = false
									}
									if (e.namePart != null && e.hasOwnProperty("namePart"))
										r.namePart = e.namePart
									if (e.isExtension != null && e.hasOwnProperty("isExtension"))
										r.isExtension = e.isExtension
									return r
								}
								NamePart.prototype.toJSON = function toJSON() {
									return this.constructor.toObject(this, e.util.toJSONOptions)
								}
								return NamePart
							})()
							return UninterpretedOption
						})()
						i.SourceCodeInfo = (function () {
							function SourceCodeInfo(e) {
								this.location = []
								if (e)
									for (var t = Object.keys(e), r = 0; r < t.length; ++r)
										if (e[t[r]] != null) this[t[r]] = e[t[r]]
							}
							SourceCodeInfo.prototype.location = o.emptyArray
							SourceCodeInfo.create = function create(e) {
								return new SourceCodeInfo(e)
							}
							SourceCodeInfo.encode = function encode(e, t) {
								if (!t) t = r.create()
								if (e.location != null && e.location.length)
									for (var o = 0; o < e.location.length; ++o)
										n.google.protobuf.SourceCodeInfo.Location.encode(
											e.location[o],
											t.uint32(10).fork()
										).ldelim()
								return t
							}
							SourceCodeInfo.encodeDelimited = function encodeDelimited(e, t) {
								return this.encode(e, t).ldelim()
							}
							SourceCodeInfo.decode = function decode(e, r) {
								if (!(e instanceof t)) e = t.create(e)
								var o = r === undefined ? e.len : e.pos + r,
									i = new n.google.protobuf.SourceCodeInfo()
								while (e.pos < o) {
									var a = e.uint32()
									switch (a >>> 3) {
										case 1:
											if (!(i.location && i.location.length)) i.location = []
											i.location.push(
												n.google.protobuf.SourceCodeInfo.Location.decode(
													e,
													e.uint32()
												)
											)
											break
										default:
											e.skipType(a & 7)
											break
									}
								}
								return i
							}
							SourceCodeInfo.decodeDelimited = function decodeDelimited(e) {
								if (!(e instanceof t)) e = new t(e)
								return this.decode(e, e.uint32())
							}
							SourceCodeInfo.verify = function verify(e) {
								if (typeof e !== "object" || e === null)
									return "object expected"
								if (e.location != null && e.hasOwnProperty("location")) {
									if (!Array.isArray(e.location))
										return "location: array expected"
									for (var t = 0; t < e.location.length; ++t) {
										var r = n.google.protobuf.SourceCodeInfo.Location.verify(
											e.location[t]
										)
										if (r) return "location." + r
									}
								}
								return null
							}
							SourceCodeInfo.fromObject = function fromObject(e) {
								if (e instanceof n.google.protobuf.SourceCodeInfo) return e
								var t = new n.google.protobuf.SourceCodeInfo()
								if (e.location) {
									if (!Array.isArray(e.location))
										throw TypeError(
											".google.protobuf.SourceCodeInfo.location: array expected"
										)
									t.location = []
									for (var r = 0; r < e.location.length; ++r) {
										if (typeof e.location[r] !== "object")
											throw TypeError(
												".google.protobuf.SourceCodeInfo.location: object expected"
											)
										t.location[r] =
											n.google.protobuf.SourceCodeInfo.Location.fromObject(
												e.location[r]
											)
									}
								}
								return t
							}
							SourceCodeInfo.toObject = function toObject(e, t) {
								if (!t) t = {}
								var r = {}
								if (t.arrays || t.defaults) r.location = []
								if (e.location && e.location.length) {
									r.location = []
									for (var o = 0; o < e.location.length; ++o)
										r.location[o] =
											n.google.protobuf.SourceCodeInfo.Location.toObject(
												e.location[o],
												t
											)
								}
								return r
							}
							SourceCodeInfo.prototype.toJSON = function toJSON() {
								return this.constructor.toObject(this, e.util.toJSONOptions)
							}
							SourceCodeInfo.Location = (function () {
								function Location(e) {
									this.path = []
									this.span = []
									this.leadingDetachedComments = []
									if (e)
										for (var t = Object.keys(e), r = 0; r < t.length; ++r)
											if (e[t[r]] != null) this[t[r]] = e[t[r]]
								}
								Location.prototype.path = o.emptyArray
								Location.prototype.span = o.emptyArray
								Location.prototype.leadingComments = ""
								Location.prototype.trailingComments = ""
								Location.prototype.leadingDetachedComments = o.emptyArray
								Location.create = function create(e) {
									return new Location(e)
								}
								Location.encode = function encode(e, t) {
									if (!t) t = r.create()
									if (e.path != null && e.path.length) {
										t.uint32(10).fork()
										for (var o = 0; o < e.path.length; ++o) t.int32(e.path[o])
										t.ldelim()
									}
									if (e.span != null && e.span.length) {
										t.uint32(18).fork()
										for (var o = 0; o < e.span.length; ++o) t.int32(e.span[o])
										t.ldelim()
									}
									if (
										e.leadingComments != null &&
										Object.hasOwnProperty.call(e, "leadingComments")
									)
										t.uint32(26).string(e.leadingComments)
									if (
										e.trailingComments != null &&
										Object.hasOwnProperty.call(e, "trailingComments")
									)
										t.uint32(34).string(e.trailingComments)
									if (
										e.leadingDetachedComments != null &&
										e.leadingDetachedComments.length
									)
										for (var o = 0; o < e.leadingDetachedComments.length; ++o)
											t.uint32(50).string(e.leadingDetachedComments[o])
									return t
								}
								Location.encodeDelimited = function encodeDelimited(e, t) {
									return this.encode(e, t).ldelim()
								}
								Location.decode = function decode(e, r) {
									if (!(e instanceof t)) e = t.create(e)
									var o = r === undefined ? e.len : e.pos + r,
										i = new n.google.protobuf.SourceCodeInfo.Location()
									while (e.pos < o) {
										var a = e.uint32()
										switch (a >>> 3) {
											case 1:
												if (!(i.path && i.path.length)) i.path = []
												if ((a & 7) === 2) {
													var s = e.uint32() + e.pos
													while (e.pos < s) i.path.push(e.int32())
												} else i.path.push(e.int32())
												break
											case 2:
												if (!(i.span && i.span.length)) i.span = []
												if ((a & 7) === 2) {
													var s = e.uint32() + e.pos
													while (e.pos < s) i.span.push(e.int32())
												} else i.span.push(e.int32())
												break
											case 3:
												i.leadingComments = e.string()
												break
											case 4:
												i.trailingComments = e.string()
												break
											case 6:
												if (
													!(
														i.leadingDetachedComments &&
														i.leadingDetachedComments.length
													)
												)
													i.leadingDetachedComments = []
												i.leadingDetachedComments.push(e.string())
												break
											default:
												e.skipType(a & 7)
												break
										}
									}
									return i
								}
								Location.decodeDelimited = function decodeDelimited(e) {
									if (!(e instanceof t)) e = new t(e)
									return this.decode(e, e.uint32())
								}
								Location.verify = function verify(e) {
									if (typeof e !== "object" || e === null)
										return "object expected"
									if (e.path != null && e.hasOwnProperty("path")) {
										if (!Array.isArray(e.path)) return "path: array expected"
										for (var t = 0; t < e.path.length; ++t)
											if (!o.isInteger(e.path[t]))
												return "path: integer[] expected"
									}
									if (e.span != null && e.hasOwnProperty("span")) {
										if (!Array.isArray(e.span)) return "span: array expected"
										for (var t = 0; t < e.span.length; ++t)
											if (!o.isInteger(e.span[t]))
												return "span: integer[] expected"
									}
									if (
										e.leadingComments != null &&
										e.hasOwnProperty("leadingComments")
									)
										if (!o.isString(e.leadingComments))
											return "leadingComments: string expected"
									if (
										e.trailingComments != null &&
										e.hasOwnProperty("trailingComments")
									)
										if (!o.isString(e.trailingComments))
											return "trailingComments: string expected"
									if (
										e.leadingDetachedComments != null &&
										e.hasOwnProperty("leadingDetachedComments")
									) {
										if (!Array.isArray(e.leadingDetachedComments))
											return "leadingDetachedComments: array expected"
										for (var t = 0; t < e.leadingDetachedComments.length; ++t)
											if (!o.isString(e.leadingDetachedComments[t]))
												return "leadingDetachedComments: string[] expected"
									}
									return null
								}
								Location.fromObject = function fromObject(e) {
									if (e instanceof n.google.protobuf.SourceCodeInfo.Location)
										return e
									var t = new n.google.protobuf.SourceCodeInfo.Location()
									if (e.path) {
										if (!Array.isArray(e.path))
											throw TypeError(
												".google.protobuf.SourceCodeInfo.Location.path: array expected"
											)
										t.path = []
										for (var r = 0; r < e.path.length; ++r)
											t.path[r] = e.path[r] | 0
									}
									if (e.span) {
										if (!Array.isArray(e.span))
											throw TypeError(
												".google.protobuf.SourceCodeInfo.Location.span: array expected"
											)
										t.span = []
										for (var r = 0; r < e.span.length; ++r)
											t.span[r] = e.span[r] | 0
									}
									if (e.leadingComments != null)
										t.leadingComments = String(e.leadingComments)
									if (e.trailingComments != null)
										t.trailingComments = String(e.trailingComments)
									if (e.leadingDetachedComments) {
										if (!Array.isArray(e.leadingDetachedComments))
											throw TypeError(
												".google.protobuf.SourceCodeInfo.Location.leadingDetachedComments: array expected"
											)
										t.leadingDetachedComments = []
										for (var r = 0; r < e.leadingDetachedComments.length; ++r)
											t.leadingDetachedComments[r] = String(
												e.leadingDetachedComments[r]
											)
									}
									return t
								}
								Location.toObject = function toObject(e, t) {
									if (!t) t = {}
									var r = {}
									if (t.arrays || t.defaults) {
										r.path = []
										r.span = []
										r.leadingDetachedComments = []
									}
									if (t.defaults) {
										r.leadingComments = ""
										r.trailingComments = ""
									}
									if (e.path && e.path.length) {
										r.path = []
										for (var o = 0; o < e.path.length; ++o)
											r.path[o] = e.path[o]
									}
									if (e.span && e.span.length) {
										r.span = []
										for (var o = 0; o < e.span.length; ++o)
											r.span[o] = e.span[o]
									}
									if (
										e.leadingComments != null &&
										e.hasOwnProperty("leadingComments")
									)
										r.leadingComments = e.leadingComments
									if (
										e.trailingComments != null &&
										e.hasOwnProperty("trailingComments")
									)
										r.trailingComments = e.trailingComments
									if (
										e.leadingDetachedComments &&
										e.leadingDetachedComments.length
									) {
										r.leadingDetachedComments = []
										for (var o = 0; o < e.leadingDetachedComments.length; ++o)
											r.leadingDetachedComments[o] =
												e.leadingDetachedComments[o]
									}
									return r
								}
								Location.prototype.toJSON = function toJSON() {
									return this.constructor.toObject(this, e.util.toJSONOptions)
								}
								return Location
							})()
							return SourceCodeInfo
						})()
						i.GeneratedCodeInfo = (function () {
							function GeneratedCodeInfo(e) {
								this.annotation = []
								if (e)
									for (var t = Object.keys(e), r = 0; r < t.length; ++r)
										if (e[t[r]] != null) this[t[r]] = e[t[r]]
							}
							GeneratedCodeInfo.prototype.annotation = o.emptyArray
							GeneratedCodeInfo.create = function create(e) {
								return new GeneratedCodeInfo(e)
							}
							GeneratedCodeInfo.encode = function encode(e, t) {
								if (!t) t = r.create()
								if (e.annotation != null && e.annotation.length)
									for (var o = 0; o < e.annotation.length; ++o)
										n.google.protobuf.GeneratedCodeInfo.Annotation.encode(
											e.annotation[o],
											t.uint32(10).fork()
										).ldelim()
								return t
							}
							GeneratedCodeInfo.encodeDelimited = function encodeDelimited(
								e,
								t
							) {
								return this.encode(e, t).ldelim()
							}
							GeneratedCodeInfo.decode = function decode(e, r) {
								if (!(e instanceof t)) e = t.create(e)
								var o = r === undefined ? e.len : e.pos + r,
									i = new n.google.protobuf.GeneratedCodeInfo()
								while (e.pos < o) {
									var a = e.uint32()
									switch (a >>> 3) {
										case 1:
											if (!(i.annotation && i.annotation.length))
												i.annotation = []
											i.annotation.push(
												n.google.protobuf.GeneratedCodeInfo.Annotation.decode(
													e,
													e.uint32()
												)
											)
											break
										default:
											e.skipType(a & 7)
											break
									}
								}
								return i
							}
							GeneratedCodeInfo.decodeDelimited = function decodeDelimited(e) {
								if (!(e instanceof t)) e = new t(e)
								return this.decode(e, e.uint32())
							}
							GeneratedCodeInfo.verify = function verify(e) {
								if (typeof e !== "object" || e === null)
									return "object expected"
								if (e.annotation != null && e.hasOwnProperty("annotation")) {
									if (!Array.isArray(e.annotation))
										return "annotation: array expected"
									for (var t = 0; t < e.annotation.length; ++t) {
										var r =
											n.google.protobuf.GeneratedCodeInfo.Annotation.verify(
												e.annotation[t]
											)
										if (r) return "annotation." + r
									}
								}
								return null
							}
							GeneratedCodeInfo.fromObject = function fromObject(e) {
								if (e instanceof n.google.protobuf.GeneratedCodeInfo) return e
								var t = new n.google.protobuf.GeneratedCodeInfo()
								if (e.annotation) {
									if (!Array.isArray(e.annotation))
										throw TypeError(
											".google.protobuf.GeneratedCodeInfo.annotation: array expected"
										)
									t.annotation = []
									for (var r = 0; r < e.annotation.length; ++r) {
										if (typeof e.annotation[r] !== "object")
											throw TypeError(
												".google.protobuf.GeneratedCodeInfo.annotation: object expected"
											)
										t.annotation[r] =
											n.google.protobuf.GeneratedCodeInfo.Annotation.fromObject(
												e.annotation[r]
											)
									}
								}
								return t
							}
							GeneratedCodeInfo.toObject = function toObject(e, t) {
								if (!t) t = {}
								var r = {}
								if (t.arrays || t.defaults) r.annotation = []
								if (e.annotation && e.annotation.length) {
									r.annotation = []
									for (var o = 0; o < e.annotation.length; ++o)
										r.annotation[o] =
											n.google.protobuf.GeneratedCodeInfo.Annotation.toObject(
												e.annotation[o],
												t
											)
								}
								return r
							}
							GeneratedCodeInfo.prototype.toJSON = function toJSON() {
								return this.constructor.toObject(this, e.util.toJSONOptions)
							}
							GeneratedCodeInfo.Annotation = (function () {
								function Annotation(e) {
									this.path = []
									if (e)
										for (var t = Object.keys(e), r = 0; r < t.length; ++r)
											if (e[t[r]] != null) this[t[r]] = e[t[r]]
								}
								Annotation.prototype.path = o.emptyArray
								Annotation.prototype.sourceFile = ""
								Annotation.prototype.begin = 0
								Annotation.prototype.end = 0
								Annotation.create = function create(e) {
									return new Annotation(e)
								}
								Annotation.encode = function encode(e, t) {
									if (!t) t = r.create()
									if (e.path != null && e.path.length) {
										t.uint32(10).fork()
										for (var o = 0; o < e.path.length; ++o) t.int32(e.path[o])
										t.ldelim()
									}
									if (
										e.sourceFile != null &&
										Object.hasOwnProperty.call(e, "sourceFile")
									)
										t.uint32(18).string(e.sourceFile)
									if (e.begin != null && Object.hasOwnProperty.call(e, "begin"))
										t.uint32(24).int32(e.begin)
									if (e.end != null && Object.hasOwnProperty.call(e, "end"))
										t.uint32(32).int32(e.end)
									return t
								}
								Annotation.encodeDelimited = function encodeDelimited(e, t) {
									return this.encode(e, t).ldelim()
								}
								Annotation.decode = function decode(e, r) {
									if (!(e instanceof t)) e = t.create(e)
									var o = r === undefined ? e.len : e.pos + r,
										i = new n.google.protobuf.GeneratedCodeInfo.Annotation()
									while (e.pos < o) {
										var a = e.uint32()
										switch (a >>> 3) {
											case 1:
												if (!(i.path && i.path.length)) i.path = []
												if ((a & 7) === 2) {
													var s = e.uint32() + e.pos
													while (e.pos < s) i.path.push(e.int32())
												} else i.path.push(e.int32())
												break
											case 2:
												i.sourceFile = e.string()
												break
											case 3:
												i.begin = e.int32()
												break
											case 4:
												i.end = e.int32()
												break
											default:
												e.skipType(a & 7)
												break
										}
									}
									return i
								}
								Annotation.decodeDelimited = function decodeDelimited(e) {
									if (!(e instanceof t)) e = new t(e)
									return this.decode(e, e.uint32())
								}
								Annotation.verify = function verify(e) {
									if (typeof e !== "object" || e === null)
										return "object expected"
									if (e.path != null && e.hasOwnProperty("path")) {
										if (!Array.isArray(e.path)) return "path: array expected"
										for (var t = 0; t < e.path.length; ++t)
											if (!o.isInteger(e.path[t]))
												return "path: integer[] expected"
									}
									if (e.sourceFile != null && e.hasOwnProperty("sourceFile"))
										if (!o.isString(e.sourceFile))
											return "sourceFile: string expected"
									if (e.begin != null && e.hasOwnProperty("begin"))
										if (!o.isInteger(e.begin)) return "begin: integer expected"
									if (e.end != null && e.hasOwnProperty("end"))
										if (!o.isInteger(e.end)) return "end: integer expected"
									return null
								}
								Annotation.fromObject = function fromObject(e) {
									if (
										e instanceof n.google.protobuf.GeneratedCodeInfo.Annotation
									)
										return e
									var t = new n.google.protobuf.GeneratedCodeInfo.Annotation()
									if (e.path) {
										if (!Array.isArray(e.path))
											throw TypeError(
												".google.protobuf.GeneratedCodeInfo.Annotation.path: array expected"
											)
										t.path = []
										for (var r = 0; r < e.path.length; ++r)
											t.path[r] = e.path[r] | 0
									}
									if (e.sourceFile != null) t.sourceFile = String(e.sourceFile)
									if (e.begin != null) t.begin = e.begin | 0
									if (e.end != null) t.end = e.end | 0
									return t
								}
								Annotation.toObject = function toObject(e, t) {
									if (!t) t = {}
									var r = {}
									if (t.arrays || t.defaults) r.path = []
									if (t.defaults) {
										r.sourceFile = ""
										r.begin = 0
										r.end = 0
									}
									if (e.path && e.path.length) {
										r.path = []
										for (var o = 0; o < e.path.length; ++o)
											r.path[o] = e.path[o]
									}
									if (e.sourceFile != null && e.hasOwnProperty("sourceFile"))
										r.sourceFile = e.sourceFile
									if (e.begin != null && e.hasOwnProperty("begin"))
										r.begin = e.begin
									if (e.end != null && e.hasOwnProperty("end")) r.end = e.end
									return r
								}
								Annotation.prototype.toJSON = function toJSON() {
									return this.constructor.toObject(this, e.util.toJSONOptions)
								}
								return Annotation
							})()
							return GeneratedCodeInfo
						})()
						return i
					})()
					i.type = (function () {
						var i = {}
						i.Expr = (function () {
							function Expr(e) {
								if (e)
									for (var t = Object.keys(e), r = 0; r < t.length; ++r)
										if (e[t[r]] != null) this[t[r]] = e[t[r]]
							}
							Expr.prototype.expression = ""
							Expr.prototype.title = ""
							Expr.prototype.description = ""
							Expr.prototype.location = ""
							Expr.create = function create(e) {
								return new Expr(e)
							}
							Expr.encode = function encode(e, t) {
								if (!t) t = r.create()
								if (
									e.expression != null &&
									Object.hasOwnProperty.call(e, "expression")
								)
									t.uint32(10).string(e.expression)
								if (e.title != null && Object.hasOwnProperty.call(e, "title"))
									t.uint32(18).string(e.title)
								if (
									e.description != null &&
									Object.hasOwnProperty.call(e, "description")
								)
									t.uint32(26).string(e.description)
								if (
									e.location != null &&
									Object.hasOwnProperty.call(e, "location")
								)
									t.uint32(34).string(e.location)
								return t
							}
							Expr.encodeDelimited = function encodeDelimited(e, t) {
								return this.encode(e, t).ldelim()
							}
							Expr.decode = function decode(e, r) {
								if (!(e instanceof t)) e = t.create(e)
								var o = r === undefined ? e.len : e.pos + r,
									i = new n.google.type.Expr()
								while (e.pos < o) {
									var a = e.uint32()
									switch (a >>> 3) {
										case 1:
											i.expression = e.string()
											break
										case 2:
											i.title = e.string()
											break
										case 3:
											i.description = e.string()
											break
										case 4:
											i.location = e.string()
											break
										default:
											e.skipType(a & 7)
											break
									}
								}
								return i
							}
							Expr.decodeDelimited = function decodeDelimited(e) {
								if (!(e instanceof t)) e = new t(e)
								return this.decode(e, e.uint32())
							}
							Expr.verify = function verify(e) {
								if (typeof e !== "object" || e === null)
									return "object expected"
								if (e.expression != null && e.hasOwnProperty("expression"))
									if (!o.isString(e.expression))
										return "expression: string expected"
								if (e.title != null && e.hasOwnProperty("title"))
									if (!o.isString(e.title)) return "title: string expected"
								if (e.description != null && e.hasOwnProperty("description"))
									if (!o.isString(e.description))
										return "description: string expected"
								if (e.location != null && e.hasOwnProperty("location"))
									if (!o.isString(e.location))
										return "location: string expected"
								return null
							}
							Expr.fromObject = function fromObject(e) {
								if (e instanceof n.google.type.Expr) return e
								var t = new n.google.type.Expr()
								if (e.expression != null) t.expression = String(e.expression)
								if (e.title != null) t.title = String(e.title)
								if (e.description != null) t.description = String(e.description)
								if (e.location != null) t.location = String(e.location)
								return t
							}
							Expr.toObject = function toObject(e, t) {
								if (!t) t = {}
								var r = {}
								if (t.defaults) {
									r.expression = ""
									r.title = ""
									r.description = ""
									r.location = ""
								}
								if (e.expression != null && e.hasOwnProperty("expression"))
									r.expression = e.expression
								if (e.title != null && e.hasOwnProperty("title"))
									r.title = e.title
								if (e.description != null && e.hasOwnProperty("description"))
									r.description = e.description
								if (e.location != null && e.hasOwnProperty("location"))
									r.location = e.location
								return r
							}
							Expr.prototype.toJSON = function toJSON() {
								return this.constructor.toObject(this, e.util.toJSONOptions)
							}
							return Expr
						})()
						return i
					})()
					return i
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
			var o = t
			o.build = "minimal"
			o.Writer = r(400)
			o.BufferWriter = r(47)
			o.Reader = r(993)
			o.BufferReader = r(544)
			o.util = r(123)
			o.rpc = r(749)
			o.roots = r(210)
			o.configure = configure
			function configure() {
				o.util._configure()
				o.Writer._configure(o.BufferWriter)
				o.Reader._configure(o.BufferReader)
			}
			configure()
		},
		993: (e, t, r) => {
			"use strict"
			e.exports = Reader
			var o = r(123)
			var n
			var i = o.LongBits,
				a = o.utf8
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
			var s =
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
			var l = function create() {
				return o.Buffer
					? function create_buffer_setup(e) {
							return (Reader.create = function create_buffer(e) {
								return o.Buffer.isBuffer(e) ? new n(e) : s(e)
							})(e)
					  }
					: s
			}
			Reader.create = l()
			Reader.prototype._slice =
				o.Array.prototype.subarray || o.Array.prototype.slice
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
				var e = new i(0, 0)
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
				return new i(
					readFixed32_end(this.buf, (this.pos += 4)),
					readFixed32_end(this.buf, (this.pos += 4))
				)
			}
			Reader.prototype.float = function read_float() {
				if (this.pos + 4 > this.len) throw indexOutOfRange(this, 4)
				var e = o.float.readFloatLE(this.buf, this.pos)
				this.pos += 4
				return e
			}
			Reader.prototype.double = function read_double() {
				if (this.pos + 8 > this.len) throw indexOutOfRange(this, 4)
				var e = o.float.readDoubleLE(this.buf, this.pos)
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
				return a.read(e, 0, e.length)
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
				Reader.create = l()
				n._configure()
				var t = o.Long ? "toLong" : "toNumber"
				o.merge(Reader.prototype, {
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
			var o = r(993)
			;(BufferReader.prototype = Object.create(o.prototype)).constructor =
				BufferReader
			var n = r(123)
			function BufferReader(e) {
				o.call(this, e)
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
			var o = t
			o.Service = r(968)
		},
		968: (e, t, r) => {
			"use strict"
			e.exports = Service
			var o = r(123)
			;(Service.prototype = Object.create(
				o.EventEmitter.prototype
			)).constructor = Service
			function Service(e, t, r) {
				if (typeof e !== "function")
					throw TypeError("rpcImpl must be a function")
				o.EventEmitter.call(this)
				this.rpcImpl = e
				this.requestDelimited = Boolean(t)
				this.responseDelimited = Boolean(r)
			}
			Service.prototype.rpcCall = function rpcCall(e, t, r, n, i) {
				if (!n) throw TypeError("request must be specified")
				var a = this
				if (!i) return o.asPromise(rpcCall, a, e, t, r, n)
				if (!a.rpcImpl) {
					setTimeout(function () {
						i(Error("already ended"))
					}, 0)
					return undefined
				}
				try {
					return a.rpcImpl(
						e,
						t[a.requestDelimited ? "encodeDelimited" : "encode"](n).finish(),
						function rpcCallback(t, o) {
							if (t) {
								a.emit("error", t, e)
								return i(t)
							}
							if (o === null) {
								a.end(true)
								return undefined
							}
							if (!(o instanceof r)) {
								try {
									o = r[a.responseDelimited ? "decodeDelimited" : "decode"](o)
								} catch (t) {
									a.emit("error", t, e)
									return i(t)
								}
							}
							a.emit("data", o, e)
							return i(null, o)
						}
					)
				} catch (t) {
					a.emit("error", t, e)
					setTimeout(function () {
						i(t)
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
			var o = r(123)
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
			var i = (LongBits.zeroHash = "\0\0\0\0\0\0\0\0")
			LongBits.fromNumber = function fromNumber(e) {
				if (e === 0) return n
				var t = e < 0
				if (t) e = -e
				var r = e >>> 0,
					o = ((e - r) / 4294967296) >>> 0
				if (t) {
					o = ~o >>> 0
					r = ~r >>> 0
					if (++r > 4294967295) {
						r = 0
						if (++o > 4294967295) o = 0
					}
				}
				return new LongBits(r, o)
			}
			LongBits.from = function from(e) {
				if (typeof e === "number") return LongBits.fromNumber(e)
				if (o.isString(e)) {
					if (o.Long) e = o.Long.fromString(e)
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
				return o.Long
					? new o.Long(this.lo | 0, this.hi | 0, Boolean(e))
					: { low: this.lo | 0, high: this.hi | 0, unsigned: Boolean(e) }
			}
			var a = String.prototype.charCodeAt
			LongBits.fromHash = function fromHash(e) {
				if (e === i) return n
				return new LongBits(
					(a.call(e, 0) |
						(a.call(e, 1) << 8) |
						(a.call(e, 2) << 16) |
						(a.call(e, 3) << 24)) >>>
						0,
					(a.call(e, 4) |
						(a.call(e, 5) << 8) |
						(a.call(e, 6) << 16) |
						(a.call(e, 7) << 24)) >>>
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
			var o = t
			o.asPromise = r(776)
			o.base64 = r(869)
			o.EventEmitter = r(536)
			o.float = r(611)
			o.inquire = r(379)
			o.utf8 = r(112)
			o.pool = r(41)
			o.LongBits = r(361)
			o.isNode = Boolean(
				typeof global !== "undefined" &&
					global &&
					global.process &&
					global.process.versions &&
					global.process.versions.node
			)
			o.global =
				(o.isNode && global) ||
				(typeof window !== "undefined" && window) ||
				(typeof self !== "undefined" && self) ||
				this
			o.emptyArray = Object.freeze ? Object.freeze([]) : []
			o.emptyObject = Object.freeze ? Object.freeze({}) : {}
			o.isInteger =
				Number.isInteger ||
				function isInteger(e) {
					return typeof e === "number" && isFinite(e) && Math.floor(e) === e
				}
			o.isString = function isString(e) {
				return typeof e === "string" || e instanceof String
			}
			o.isObject = function isObject(e) {
				return e && typeof e === "object"
			}
			o.isset = o.isSet = function isSet(e, t) {
				var r = e[t]
				if (r != null && e.hasOwnProperty(t))
					return (
						typeof r !== "object" ||
						(Array.isArray(r) ? r.length : Object.keys(r).length) > 0
					)
				return false
			}
			o.Buffer = (function () {
				try {
					var e = o.inquire("buffer").Buffer
					return e.prototype.utf8Write ? e : null
				} catch (e) {
					return null
				}
			})()
			o._Buffer_from = null
			o._Buffer_allocUnsafe = null
			o.newBuffer = function newBuffer(e) {
				return typeof e === "number"
					? o.Buffer
						? o._Buffer_allocUnsafe(e)
						: new o.Array(e)
					: o.Buffer
					? o._Buffer_from(e)
					: typeof Uint8Array === "undefined"
					? e
					: new Uint8Array(e)
			}
			o.Array = typeof Uint8Array !== "undefined" ? Uint8Array : Array
			o.Long =
				(o.global.dcodeIO && o.global.dcodeIO.Long) ||
				o.global.Long ||
				o.inquire("long")
			o.key2Re = /^true|false|0|1$/
			o.key32Re = /^-?(?:0|[1-9][0-9]*)$/
			o.key64Re = /^(?:[\\x00-\\xff]{8}|-?(?:0|[1-9][0-9]*))$/
			o.longToHash = function longToHash(e) {
				return e ? o.LongBits.from(e).toHash() : o.LongBits.zeroHash
			}
			o.longFromHash = function longFromHash(e, t) {
				var r = o.LongBits.fromHash(e)
				if (o.Long) return o.Long.fromBits(r.lo, r.hi, t)
				return r.toNumber(Boolean(t))
			}
			function merge(e, t, r) {
				for (var o = Object.keys(t), n = 0; n < o.length; ++n)
					if (e[o[n]] === undefined || !r) e[o[n]] = t[o[n]]
				return e
			}
			o.merge = merge
			o.lcFirst = function lcFirst(e) {
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
			o.newError = newError
			o.ProtocolError = newError("ProtocolError")
			o.oneOfGetter = function getOneOf(e) {
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
			o.oneOfSetter = function setOneOf(e) {
				return function (t) {
					for (var r = 0; r < e.length; ++r) if (e[r] !== t) delete this[e[r]]
				}
			}
			o.toJSONOptions = {
				longs: String,
				enums: String,
				bytes: String,
				json: true
			}
			o._configure = function () {
				var e = o.Buffer
				if (!e) {
					o._Buffer_from = o._Buffer_allocUnsafe = null
					return
				}
				o._Buffer_from =
					(e.from !== Uint8Array.from && e.from) ||
					function Buffer_from(t, r) {
						return new e(t, r)
					}
				o._Buffer_allocUnsafe =
					e.allocUnsafe ||
					function Buffer_allocUnsafe(t) {
						return new e(t)
					}
			}
		},
		400: (e, t, r) => {
			"use strict"
			e.exports = Writer
			var o = r(123)
			var n
			var i = o.LongBits,
				a = o.base64,
				s = o.utf8
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
			var l = function create() {
				return o.Buffer
					? function create_buffer_setup() {
							return (Writer.create = function create_buffer() {
								return new n()
							})()
					  }
					: function create_array() {
							return new Writer()
					  }
			}
			Writer.create = l()
			Writer.alloc = function alloc(e) {
				return new o.Array(e)
			}
			if (o.Array !== Array)
				Writer.alloc = o.pool(Writer.alloc, o.Array.prototype.subarray)
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
					? this._push(writeVarint64, 10, i.fromNumber(e))
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
				var t = i.from(e)
				return this._push(writeVarint64, t.length(), t)
			}
			Writer.prototype.int64 = Writer.prototype.uint64
			Writer.prototype.sint64 = function write_sint64(e) {
				var t = i.from(e).zzEncode()
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
				var t = i.from(e)
				return this._push(writeFixed32, 4, t.lo)._push(writeFixed32, 4, t.hi)
			}
			Writer.prototype.sfixed64 = Writer.prototype.fixed64
			Writer.prototype.float = function write_float(e) {
				return this._push(o.float.writeFloatLE, 4, e)
			}
			Writer.prototype.double = function write_double(e) {
				return this._push(o.float.writeDoubleLE, 8, e)
			}
			var p = o.Array.prototype.set
				? function writeBytes_set(e, t, r) {
						t.set(e, r)
				  }
				: function writeBytes_for(e, t, r) {
						for (var o = 0; o < e.length; ++o) t[r + o] = e[o]
				  }
			Writer.prototype.bytes = function write_bytes(e) {
				var t = e.length >>> 0
				if (!t) return this._push(writeByte, 1, 0)
				if (o.isString(e)) {
					var r = Writer.alloc((t = a.length(e)))
					a.decode(e, r, 0)
					e = r
				}
				return this.uint32(t)._push(p, t, e)
			}
			Writer.prototype.string = function write_string(e) {
				var t = s.length(e)
				return t
					? this.uint32(t)._push(s.write, t, e)
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
				Writer.create = l()
				n._configure()
			}
		},
		47: (e, t, r) => {
			"use strict"
			e.exports = BufferWriter
			var o = r(400)
			;(BufferWriter.prototype = Object.create(o.prototype)).constructor =
				BufferWriter
			var n = r(123)
			function BufferWriter() {
				o.call(this)
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
								else for (var o = 0; o < e.length; ) t[r++] = e[o++]
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
		var o = true
		try {
			__webpack_modules__[e].call(r.exports, r, r.exports, __nccwpck_require__)
			o = false
		} finally {
			if (o) delete __webpack_module_cache__[e]
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
	var __webpack_exports__ = __nccwpck_require__(408)
	module.exports = __webpack_exports__
})()
//# sourceMappingURL=protos/iam_service.js.map
