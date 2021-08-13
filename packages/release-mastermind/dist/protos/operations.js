/** @format */

require("./sourcemap-register.js")
;(() => {
	var __webpack_modules__ = {
		776: (e) => {
			"use strict"
			e.exports = asPromise
			function asPromise(e, t) {
				var n = new Array(arguments.length - 1),
					r = 0,
					o = 2,
					i = true
				while (o < arguments.length) n[r++] = arguments[o++]
				return new Promise(function executor(o, a) {
					n[r] = function callback(e) {
						if (i) {
							i = false
							if (e) a(e)
							else {
								var t = new Array(arguments.length - 1),
									n = 0
								while (n < t.length) t[n++] = arguments[n]
								o.apply(null, t)
							}
						}
					}
					try {
						e.apply(t || null, n)
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
			var n = t
			n.length = function length(e) {
				var t = e.length
				if (!t) return 0
				var n = 0
				while (--t % 4 > 1 && e.charAt(t) === "=") ++n
				return Math.ceil(e.length * 3) / 4 - n
			}
			var r = new Array(64)
			var o = new Array(123)
			for (var i = 0; i < 64; )
				o[
					(r[i] =
						i < 26 ? i + 65 : i < 52 ? i + 71 : i < 62 ? i - 4 : (i - 59) | 43)
				] = i++
			n.encode = function encode(e, t, n) {
				var o = null,
					i = []
				var a = 0,
					p = 0,
					s
				while (t < n) {
					var l = e[t++]
					switch (p) {
						case 0:
							i[a++] = r[l >> 2]
							s = (l & 3) << 4
							p = 1
							break
						case 1:
							i[a++] = r[s | (l >> 4)]
							s = (l & 15) << 2
							p = 2
							break
						case 2:
							i[a++] = r[s | (l >> 6)]
							i[a++] = r[l & 63]
							p = 0
							break
					}
					if (a > 8191) {
						;(o || (o = [])).push(String.fromCharCode.apply(String, i))
						a = 0
					}
				}
				if (p) {
					i[a++] = r[s]
					i[a++] = 61
					if (p === 1) i[a++] = 61
				}
				if (o) {
					if (a) o.push(String.fromCharCode.apply(String, i.slice(0, a)))
					return o.join("")
				}
				return String.fromCharCode.apply(String, i.slice(0, a))
			}
			var a = "invalid encoding"
			n.decode = function decode(e, t, n) {
				var r = n
				var i = 0,
					p
				for (var s = 0; s < e.length; ) {
					var l = e.charCodeAt(s++)
					if (l === 61 && i > 1) break
					if ((l = o[l]) === undefined) throw Error(a)
					switch (i) {
						case 0:
							p = l
							i = 1
							break
						case 1:
							t[n++] = (p << 2) | ((l & 48) >> 4)
							p = l
							i = 2
							break
						case 2:
							t[n++] = ((p & 15) << 4) | ((l & 60) >> 2)
							p = l
							i = 3
							break
						case 3:
							t[n++] = ((p & 3) << 6) | l
							i = 0
							break
					}
				}
				if (i === 1) throw Error(a)
				return n - r
			}
			n.test = function test(e) {
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
			EventEmitter.prototype.on = function on(e, t, n) {
				;(this._listeners[e] || (this._listeners[e] = [])).push({
					fn: t,
					ctx: n || this
				})
				return this
			}
			EventEmitter.prototype.off = function off(e, t) {
				if (e === undefined) this._listeners = {}
				else {
					if (t === undefined) this._listeners[e] = []
					else {
						var n = this._listeners[e]
						for (var r = 0; r < n.length; )
							if (n[r].fn === t) n.splice(r, 1)
							else ++r
					}
				}
				return this
			}
			EventEmitter.prototype.emit = function emit(e) {
				var t = this._listeners[e]
				if (t) {
					var n = [],
						r = 1
					for (; r < arguments.length; ) n.push(arguments[r++])
					for (r = 0; r < t.length; ) t[r].fn.apply(t[r++].ctx, n)
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
							n = new Uint8Array(t.buffer),
							r = n[3] === 128
						function writeFloat_f32_cpy(e, r, o) {
							t[0] = e
							r[o] = n[0]
							r[o + 1] = n[1]
							r[o + 2] = n[2]
							r[o + 3] = n[3]
						}
						function writeFloat_f32_rev(e, r, o) {
							t[0] = e
							r[o] = n[3]
							r[o + 1] = n[2]
							r[o + 2] = n[1]
							r[o + 3] = n[0]
						}
						e.writeFloatLE = r ? writeFloat_f32_cpy : writeFloat_f32_rev
						e.writeFloatBE = r ? writeFloat_f32_rev : writeFloat_f32_cpy
						function readFloat_f32_cpy(e, r) {
							n[0] = e[r]
							n[1] = e[r + 1]
							n[2] = e[r + 2]
							n[3] = e[r + 3]
							return t[0]
						}
						function readFloat_f32_rev(e, r) {
							n[3] = e[r]
							n[2] = e[r + 1]
							n[1] = e[r + 2]
							n[0] = e[r + 3]
							return t[0]
						}
						e.readFloatLE = r ? readFloat_f32_cpy : readFloat_f32_rev
						e.readFloatBE = r ? readFloat_f32_rev : readFloat_f32_cpy
					})()
				else
					(function () {
						function writeFloat_ieee754(e, t, n, r) {
							var o = t < 0 ? 1 : 0
							if (o) t = -t
							if (t === 0) e(1 / t > 0 ? 0 : 2147483648, n, r)
							else if (isNaN(t)) e(2143289344, n, r)
							else if (t > 34028234663852886e22)
								e(((o << 31) | 2139095040) >>> 0, n, r)
							else if (t < 11754943508222875e-54)
								e(
									((o << 31) | Math.round(t / 1401298464324817e-60)) >>> 0,
									n,
									r
								)
							else {
								var i = Math.floor(Math.log(t) / Math.LN2),
									a = Math.round(t * Math.pow(2, -i) * 8388608) & 8388607
								e(((o << 31) | ((i + 127) << 23) | a) >>> 0, n, r)
							}
						}
						e.writeFloatLE = writeFloat_ieee754.bind(null, writeUintLE)
						e.writeFloatBE = writeFloat_ieee754.bind(null, writeUintBE)
						function readFloat_ieee754(e, t, n) {
							var r = e(t, n),
								o = (r >> 31) * 2 + 1,
								i = (r >>> 23) & 255,
								a = r & 8388607
							return i === 255
								? a
									? NaN
									: o * Infinity
								: i === 0
								? o * 1401298464324817e-60 * a
								: o * Math.pow(2, i - 150) * (a + 8388608)
						}
						e.readFloatLE = readFloat_ieee754.bind(null, readUintLE)
						e.readFloatBE = readFloat_ieee754.bind(null, readUintBE)
					})()
				if (typeof Float64Array !== "undefined")
					(function () {
						var t = new Float64Array([-0]),
							n = new Uint8Array(t.buffer),
							r = n[7] === 128
						function writeDouble_f64_cpy(e, r, o) {
							t[0] = e
							r[o] = n[0]
							r[o + 1] = n[1]
							r[o + 2] = n[2]
							r[o + 3] = n[3]
							r[o + 4] = n[4]
							r[o + 5] = n[5]
							r[o + 6] = n[6]
							r[o + 7] = n[7]
						}
						function writeDouble_f64_rev(e, r, o) {
							t[0] = e
							r[o] = n[7]
							r[o + 1] = n[6]
							r[o + 2] = n[5]
							r[o + 3] = n[4]
							r[o + 4] = n[3]
							r[o + 5] = n[2]
							r[o + 6] = n[1]
							r[o + 7] = n[0]
						}
						e.writeDoubleLE = r ? writeDouble_f64_cpy : writeDouble_f64_rev
						e.writeDoubleBE = r ? writeDouble_f64_rev : writeDouble_f64_cpy
						function readDouble_f64_cpy(e, r) {
							n[0] = e[r]
							n[1] = e[r + 1]
							n[2] = e[r + 2]
							n[3] = e[r + 3]
							n[4] = e[r + 4]
							n[5] = e[r + 5]
							n[6] = e[r + 6]
							n[7] = e[r + 7]
							return t[0]
						}
						function readDouble_f64_rev(e, r) {
							n[7] = e[r]
							n[6] = e[r + 1]
							n[5] = e[r + 2]
							n[4] = e[r + 3]
							n[3] = e[r + 4]
							n[2] = e[r + 5]
							n[1] = e[r + 6]
							n[0] = e[r + 7]
							return t[0]
						}
						e.readDoubleLE = r ? readDouble_f64_cpy : readDouble_f64_rev
						e.readDoubleBE = r ? readDouble_f64_rev : readDouble_f64_cpy
					})()
				else
					(function () {
						function writeDouble_ieee754(e, t, n, r, o, i) {
							var a = r < 0 ? 1 : 0
							if (a) r = -r
							if (r === 0) {
								e(0, o, i + t)
								e(1 / r > 0 ? 0 : 2147483648, o, i + n)
							} else if (isNaN(r)) {
								e(0, o, i + t)
								e(2146959360, o, i + n)
							} else if (r > 17976931348623157e292) {
								e(0, o, i + t)
								e(((a << 31) | 2146435072) >>> 0, o, i + n)
							} else {
								var p
								if (r < 22250738585072014e-324) {
									p = r / 5e-324
									e(p >>> 0, o, i + t)
									e(((a << 31) | (p / 4294967296)) >>> 0, o, i + n)
								} else {
									var s = Math.floor(Math.log(r) / Math.LN2)
									if (s === 1024) s = 1023
									p = r * Math.pow(2, -s)
									e((p * 4503599627370496) >>> 0, o, i + t)
									e(
										((a << 31) |
											((s + 1023) << 20) |
											((p * 1048576) & 1048575)) >>>
											0,
										o,
										i + n
									)
								}
							}
						}
						e.writeDoubleLE = writeDouble_ieee754.bind(null, writeUintLE, 0, 4)
						e.writeDoubleBE = writeDouble_ieee754.bind(null, writeUintBE, 4, 0)
						function readDouble_ieee754(e, t, n, r, o) {
							var i = e(r, o + t),
								a = e(r, o + n)
							var p = (a >> 31) * 2 + 1,
								s = (a >>> 20) & 2047,
								l = 4294967296 * (a & 1048575) + i
							return s === 2047
								? l
									? NaN
									: p * Infinity
								: s === 0
								? p * 5e-324 * l
								: p * Math.pow(2, s - 1075) * (l + 4503599627370496)
						}
						e.readDoubleLE = readDouble_ieee754.bind(null, readUintLE, 0, 4)
						e.readDoubleBE = readDouble_ieee754.bind(null, readUintBE, 4, 0)
					})()
				return e
			}
			function writeUintLE(e, t, n) {
				t[n] = e & 255
				t[n + 1] = (e >>> 8) & 255
				t[n + 2] = (e >>> 16) & 255
				t[n + 3] = e >>> 24
			}
			function writeUintBE(e, t, n) {
				t[n] = e >>> 24
				t[n + 1] = (e >>> 16) & 255
				t[n + 2] = (e >>> 8) & 255
				t[n + 3] = e & 255
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
			function pool(e, t, n) {
				var r = n || 8192
				var o = r >>> 1
				var i = null
				var a = r
				return function pool_alloc(n) {
					if (n < 1 || n > o) return e(n)
					if (a + n > r) {
						i = e(r)
						a = 0
					}
					var p = t.call(i, a, (a += n))
					if (a & 7) a = (a | 7) + 1
					return p
				}
			}
		},
		112: (e, t) => {
			"use strict"
			var n = t
			n.length = function utf8_length(e) {
				var t = 0,
					n = 0
				for (var r = 0; r < e.length; ++r) {
					n = e.charCodeAt(r)
					if (n < 128) t += 1
					else if (n < 2048) t += 2
					else if (
						(n & 64512) === 55296 &&
						(e.charCodeAt(r + 1) & 64512) === 56320
					) {
						++r
						t += 4
					} else t += 3
				}
				return t
			}
			n.read = function utf8_read(e, t, n) {
				var r = n - t
				if (r < 1) return ""
				var o = null,
					i = [],
					a = 0,
					p
				while (t < n) {
					p = e[t++]
					if (p < 128) i[a++] = p
					else if (p > 191 && p < 224) i[a++] = ((p & 31) << 6) | (e[t++] & 63)
					else if (p > 239 && p < 365) {
						p =
							(((p & 7) << 18) |
								((e[t++] & 63) << 12) |
								((e[t++] & 63) << 6) |
								(e[t++] & 63)) -
							65536
						i[a++] = 55296 + (p >> 10)
						i[a++] = 56320 + (p & 1023)
					} else
						i[a++] = ((p & 15) << 12) | ((e[t++] & 63) << 6) | (e[t++] & 63)
					if (a > 8191) {
						;(o || (o = [])).push(String.fromCharCode.apply(String, i))
						a = 0
					}
				}
				if (o) {
					if (a) o.push(String.fromCharCode.apply(String, i.slice(0, a)))
					return o.join("")
				}
				return String.fromCharCode.apply(String, i.slice(0, a))
			}
			n.write = function utf8_write(e, t, n) {
				var r = n,
					o,
					i
				for (var a = 0; a < e.length; ++a) {
					o = e.charCodeAt(a)
					if (o < 128) {
						t[n++] = o
					} else if (o < 2048) {
						t[n++] = (o >> 6) | 192
						t[n++] = (o & 63) | 128
					} else if (
						(o & 64512) === 55296 &&
						((i = e.charCodeAt(a + 1)) & 64512) === 56320
					) {
						o = 65536 + ((o & 1023) << 10) + (i & 1023)
						++a
						t[n++] = (o >> 18) | 240
						t[n++] = ((o >> 12) & 63) | 128
						t[n++] = ((o >> 6) & 63) | 128
						t[n++] = (o & 63) | 128
					} else {
						t[n++] = (o >> 12) | 224
						t[n++] = ((o >> 6) & 63) | 128
						t[n++] = (o & 63) | 128
					}
				}
				return n - r
			}
		},
		400: function (e, t, n) {
			e = n.nmd(e)
			;(function (t, r) {
				if (typeof define === "function" && define.amd)
					define(["protobufjs/minimal"], r)
				else if (true && e && e.exports) e.exports = r(n(281))
			})(this, function (e) {
				"use strict"
				var t = e.Reader,
					n = e.Writer,
					r = e.util
				var o = e.roots.operations_protos || (e.roots.operations_protos = {})
				o.google = (function () {
					var i = {}
					i.longrunning = (function () {
						var i = {}
						i.Operations = (function () {
							function Operations(t, n, r) {
								e.rpc.Service.call(this, t, n, r)
							}
							;(Operations.prototype = Object.create(
								e.rpc.Service.prototype
							)).constructor = Operations
							Operations.create = function create(e, t, n) {
								return new this(e, t, n)
							}
							Object.defineProperty(
								(Operations.prototype.listOperations = function listOperations(
									e,
									t
								) {
									return this.rpcCall(
										listOperations,
										o.google.longrunning.ListOperationsRequest,
										o.google.longrunning.ListOperationsResponse,
										e,
										t
									)
								}),
								"name",
								{ value: "ListOperations" }
							)
							Object.defineProperty(
								(Operations.prototype.getOperation = function getOperation(
									e,
									t
								) {
									return this.rpcCall(
										getOperation,
										o.google.longrunning.GetOperationRequest,
										o.google.longrunning.Operation,
										e,
										t
									)
								}),
								"name",
								{ value: "GetOperation" }
							)
							Object.defineProperty(
								(Operations.prototype.deleteOperation =
									function deleteOperation(e, t) {
										return this.rpcCall(
											deleteOperation,
											o.google.longrunning.DeleteOperationRequest,
											o.google.protobuf.Empty,
											e,
											t
										)
									}),
								"name",
								{ value: "DeleteOperation" }
							)
							Object.defineProperty(
								(Operations.prototype.cancelOperation =
									function cancelOperation(e, t) {
										return this.rpcCall(
											cancelOperation,
											o.google.longrunning.CancelOperationRequest,
											o.google.protobuf.Empty,
											e,
											t
										)
									}),
								"name",
								{ value: "CancelOperation" }
							)
							Object.defineProperty(
								(Operations.prototype.waitOperation = function waitOperation(
									e,
									t
								) {
									return this.rpcCall(
										waitOperation,
										o.google.longrunning.WaitOperationRequest,
										o.google.longrunning.Operation,
										e,
										t
									)
								}),
								"name",
								{ value: "WaitOperation" }
							)
							return Operations
						})()
						i.Operation = (function () {
							function Operation(e) {
								if (e)
									for (var t = Object.keys(e), n = 0; n < t.length; ++n)
										if (e[t[n]] != null) this[t[n]] = e[t[n]]
							}
							Operation.prototype.name = ""
							Operation.prototype.metadata = null
							Operation.prototype.done = false
							Operation.prototype.error = null
							Operation.prototype.response = null
							var i
							Object.defineProperty(Operation.prototype, "result", {
								get: r.oneOfGetter((i = ["error", "response"])),
								set: r.oneOfSetter(i)
							})
							Operation.create = function create(e) {
								return new Operation(e)
							}
							Operation.encode = function encode(e, t) {
								if (!t) t = n.create()
								if (e.name != null && Object.hasOwnProperty.call(e, "name"))
									t.uint32(10).string(e.name)
								if (
									e.metadata != null &&
									Object.hasOwnProperty.call(e, "metadata")
								)
									o.google.protobuf.Any.encode(
										e.metadata,
										t.uint32(18).fork()
									).ldelim()
								if (e.done != null && Object.hasOwnProperty.call(e, "done"))
									t.uint32(24).bool(e.done)
								if (e.error != null && Object.hasOwnProperty.call(e, "error"))
									o.google.rpc.Status.encode(
										e.error,
										t.uint32(34).fork()
									).ldelim()
								if (
									e.response != null &&
									Object.hasOwnProperty.call(e, "response")
								)
									o.google.protobuf.Any.encode(
										e.response,
										t.uint32(42).fork()
									).ldelim()
								return t
							}
							Operation.encodeDelimited = function encodeDelimited(e, t) {
								return this.encode(e, t).ldelim()
							}
							Operation.decode = function decode(e, n) {
								if (!(e instanceof t)) e = t.create(e)
								var r = n === undefined ? e.len : e.pos + n,
									i = new o.google.longrunning.Operation()
								while (e.pos < r) {
									var a = e.uint32()
									switch (a >>> 3) {
										case 1:
											i.name = e.string()
											break
										case 2:
											i.metadata = o.google.protobuf.Any.decode(e, e.uint32())
											break
										case 3:
											i.done = e.bool()
											break
										case 4:
											i.error = o.google.rpc.Status.decode(e, e.uint32())
											break
										case 5:
											i.response = o.google.protobuf.Any.decode(e, e.uint32())
											break
										default:
											e.skipType(a & 7)
											break
									}
								}
								return i
							}
							Operation.decodeDelimited = function decodeDelimited(e) {
								if (!(e instanceof t)) e = new t(e)
								return this.decode(e, e.uint32())
							}
							Operation.verify = function verify(e) {
								if (typeof e !== "object" || e === null)
									return "object expected"
								var t = {}
								if (e.name != null && e.hasOwnProperty("name"))
									if (!r.isString(e.name)) return "name: string expected"
								if (e.metadata != null && e.hasOwnProperty("metadata")) {
									var n = o.google.protobuf.Any.verify(e.metadata)
									if (n) return "metadata." + n
								}
								if (e.done != null && e.hasOwnProperty("done"))
									if (typeof e.done !== "boolean")
										return "done: boolean expected"
								if (e.error != null && e.hasOwnProperty("error")) {
									t.result = 1
									{
										var n = o.google.rpc.Status.verify(e.error)
										if (n) return "error." + n
									}
								}
								if (e.response != null && e.hasOwnProperty("response")) {
									if (t.result === 1) return "result: multiple values"
									t.result = 1
									{
										var n = o.google.protobuf.Any.verify(e.response)
										if (n) return "response." + n
									}
								}
								return null
							}
							Operation.fromObject = function fromObject(e) {
								if (e instanceof o.google.longrunning.Operation) return e
								var t = new o.google.longrunning.Operation()
								if (e.name != null) t.name = String(e.name)
								if (e.metadata != null) {
									if (typeof e.metadata !== "object")
										throw TypeError(
											".google.longrunning.Operation.metadata: object expected"
										)
									t.metadata = o.google.protobuf.Any.fromObject(e.metadata)
								}
								if (e.done != null) t.done = Boolean(e.done)
								if (e.error != null) {
									if (typeof e.error !== "object")
										throw TypeError(
											".google.longrunning.Operation.error: object expected"
										)
									t.error = o.google.rpc.Status.fromObject(e.error)
								}
								if (e.response != null) {
									if (typeof e.response !== "object")
										throw TypeError(
											".google.longrunning.Operation.response: object expected"
										)
									t.response = o.google.protobuf.Any.fromObject(e.response)
								}
								return t
							}
							Operation.toObject = function toObject(e, t) {
								if (!t) t = {}
								var n = {}
								if (t.defaults) {
									n.name = ""
									n.metadata = null
									n.done = false
								}
								if (e.name != null && e.hasOwnProperty("name")) n.name = e.name
								if (e.metadata != null && e.hasOwnProperty("metadata"))
									n.metadata = o.google.protobuf.Any.toObject(e.metadata, t)
								if (e.done != null && e.hasOwnProperty("done")) n.done = e.done
								if (e.error != null && e.hasOwnProperty("error")) {
									n.error = o.google.rpc.Status.toObject(e.error, t)
									if (t.oneofs) n.result = "error"
								}
								if (e.response != null && e.hasOwnProperty("response")) {
									n.response = o.google.protobuf.Any.toObject(e.response, t)
									if (t.oneofs) n.result = "response"
								}
								return n
							}
							Operation.prototype.toJSON = function toJSON() {
								return this.constructor.toObject(this, e.util.toJSONOptions)
							}
							return Operation
						})()
						i.GetOperationRequest = (function () {
							function GetOperationRequest(e) {
								if (e)
									for (var t = Object.keys(e), n = 0; n < t.length; ++n)
										if (e[t[n]] != null) this[t[n]] = e[t[n]]
							}
							GetOperationRequest.prototype.name = ""
							GetOperationRequest.create = function create(e) {
								return new GetOperationRequest(e)
							}
							GetOperationRequest.encode = function encode(e, t) {
								if (!t) t = n.create()
								if (e.name != null && Object.hasOwnProperty.call(e, "name"))
									t.uint32(10).string(e.name)
								return t
							}
							GetOperationRequest.encodeDelimited = function encodeDelimited(
								e,
								t
							) {
								return this.encode(e, t).ldelim()
							}
							GetOperationRequest.decode = function decode(e, n) {
								if (!(e instanceof t)) e = t.create(e)
								var r = n === undefined ? e.len : e.pos + n,
									i = new o.google.longrunning.GetOperationRequest()
								while (e.pos < r) {
									var a = e.uint32()
									switch (a >>> 3) {
										case 1:
											i.name = e.string()
											break
										default:
											e.skipType(a & 7)
											break
									}
								}
								return i
							}
							GetOperationRequest.decodeDelimited = function decodeDelimited(
								e
							) {
								if (!(e instanceof t)) e = new t(e)
								return this.decode(e, e.uint32())
							}
							GetOperationRequest.verify = function verify(e) {
								if (typeof e !== "object" || e === null)
									return "object expected"
								if (e.name != null && e.hasOwnProperty("name"))
									if (!r.isString(e.name)) return "name: string expected"
								return null
							}
							GetOperationRequest.fromObject = function fromObject(e) {
								if (e instanceof o.google.longrunning.GetOperationRequest)
									return e
								var t = new o.google.longrunning.GetOperationRequest()
								if (e.name != null) t.name = String(e.name)
								return t
							}
							GetOperationRequest.toObject = function toObject(e, t) {
								if (!t) t = {}
								var n = {}
								if (t.defaults) n.name = ""
								if (e.name != null && e.hasOwnProperty("name")) n.name = e.name
								return n
							}
							GetOperationRequest.prototype.toJSON = function toJSON() {
								return this.constructor.toObject(this, e.util.toJSONOptions)
							}
							return GetOperationRequest
						})()
						i.ListOperationsRequest = (function () {
							function ListOperationsRequest(e) {
								if (e)
									for (var t = Object.keys(e), n = 0; n < t.length; ++n)
										if (e[t[n]] != null) this[t[n]] = e[t[n]]
							}
							ListOperationsRequest.prototype.name = ""
							ListOperationsRequest.prototype.filter = ""
							ListOperationsRequest.prototype.pageSize = 0
							ListOperationsRequest.prototype.pageToken = ""
							ListOperationsRequest.create = function create(e) {
								return new ListOperationsRequest(e)
							}
							ListOperationsRequest.encode = function encode(e, t) {
								if (!t) t = n.create()
								if (e.filter != null && Object.hasOwnProperty.call(e, "filter"))
									t.uint32(10).string(e.filter)
								if (
									e.pageSize != null &&
									Object.hasOwnProperty.call(e, "pageSize")
								)
									t.uint32(16).int32(e.pageSize)
								if (
									e.pageToken != null &&
									Object.hasOwnProperty.call(e, "pageToken")
								)
									t.uint32(26).string(e.pageToken)
								if (e.name != null && Object.hasOwnProperty.call(e, "name"))
									t.uint32(34).string(e.name)
								return t
							}
							ListOperationsRequest.encodeDelimited = function encodeDelimited(
								e,
								t
							) {
								return this.encode(e, t).ldelim()
							}
							ListOperationsRequest.decode = function decode(e, n) {
								if (!(e instanceof t)) e = t.create(e)
								var r = n === undefined ? e.len : e.pos + n,
									i = new o.google.longrunning.ListOperationsRequest()
								while (e.pos < r) {
									var a = e.uint32()
									switch (a >>> 3) {
										case 4:
											i.name = e.string()
											break
										case 1:
											i.filter = e.string()
											break
										case 2:
											i.pageSize = e.int32()
											break
										case 3:
											i.pageToken = e.string()
											break
										default:
											e.skipType(a & 7)
											break
									}
								}
								return i
							}
							ListOperationsRequest.decodeDelimited = function decodeDelimited(
								e
							) {
								if (!(e instanceof t)) e = new t(e)
								return this.decode(e, e.uint32())
							}
							ListOperationsRequest.verify = function verify(e) {
								if (typeof e !== "object" || e === null)
									return "object expected"
								if (e.name != null && e.hasOwnProperty("name"))
									if (!r.isString(e.name)) return "name: string expected"
								if (e.filter != null && e.hasOwnProperty("filter"))
									if (!r.isString(e.filter)) return "filter: string expected"
								if (e.pageSize != null && e.hasOwnProperty("pageSize"))
									if (!r.isInteger(e.pageSize))
										return "pageSize: integer expected"
								if (e.pageToken != null && e.hasOwnProperty("pageToken"))
									if (!r.isString(e.pageToken))
										return "pageToken: string expected"
								return null
							}
							ListOperationsRequest.fromObject = function fromObject(e) {
								if (e instanceof o.google.longrunning.ListOperationsRequest)
									return e
								var t = new o.google.longrunning.ListOperationsRequest()
								if (e.name != null) t.name = String(e.name)
								if (e.filter != null) t.filter = String(e.filter)
								if (e.pageSize != null) t.pageSize = e.pageSize | 0
								if (e.pageToken != null) t.pageToken = String(e.pageToken)
								return t
							}
							ListOperationsRequest.toObject = function toObject(e, t) {
								if (!t) t = {}
								var n = {}
								if (t.defaults) {
									n.filter = ""
									n.pageSize = 0
									n.pageToken = ""
									n.name = ""
								}
								if (e.filter != null && e.hasOwnProperty("filter"))
									n.filter = e.filter
								if (e.pageSize != null && e.hasOwnProperty("pageSize"))
									n.pageSize = e.pageSize
								if (e.pageToken != null && e.hasOwnProperty("pageToken"))
									n.pageToken = e.pageToken
								if (e.name != null && e.hasOwnProperty("name")) n.name = e.name
								return n
							}
							ListOperationsRequest.prototype.toJSON = function toJSON() {
								return this.constructor.toObject(this, e.util.toJSONOptions)
							}
							return ListOperationsRequest
						})()
						i.ListOperationsResponse = (function () {
							function ListOperationsResponse(e) {
								this.operations = []
								if (e)
									for (var t = Object.keys(e), n = 0; n < t.length; ++n)
										if (e[t[n]] != null) this[t[n]] = e[t[n]]
							}
							ListOperationsResponse.prototype.operations = r.emptyArray
							ListOperationsResponse.prototype.nextPageToken = ""
							ListOperationsResponse.create = function create(e) {
								return new ListOperationsResponse(e)
							}
							ListOperationsResponse.encode = function encode(e, t) {
								if (!t) t = n.create()
								if (e.operations != null && e.operations.length)
									for (var r = 0; r < e.operations.length; ++r)
										o.google.longrunning.Operation.encode(
											e.operations[r],
											t.uint32(10).fork()
										).ldelim()
								if (
									e.nextPageToken != null &&
									Object.hasOwnProperty.call(e, "nextPageToken")
								)
									t.uint32(18).string(e.nextPageToken)
								return t
							}
							ListOperationsResponse.encodeDelimited = function encodeDelimited(
								e,
								t
							) {
								return this.encode(e, t).ldelim()
							}
							ListOperationsResponse.decode = function decode(e, n) {
								if (!(e instanceof t)) e = t.create(e)
								var r = n === undefined ? e.len : e.pos + n,
									i = new o.google.longrunning.ListOperationsResponse()
								while (e.pos < r) {
									var a = e.uint32()
									switch (a >>> 3) {
										case 1:
											if (!(i.operations && i.operations.length))
												i.operations = []
											i.operations.push(
												o.google.longrunning.Operation.decode(e, e.uint32())
											)
											break
										case 2:
											i.nextPageToken = e.string()
											break
										default:
											e.skipType(a & 7)
											break
									}
								}
								return i
							}
							ListOperationsResponse.decodeDelimited = function decodeDelimited(
								e
							) {
								if (!(e instanceof t)) e = new t(e)
								return this.decode(e, e.uint32())
							}
							ListOperationsResponse.verify = function verify(e) {
								if (typeof e !== "object" || e === null)
									return "object expected"
								if (e.operations != null && e.hasOwnProperty("operations")) {
									if (!Array.isArray(e.operations))
										return "operations: array expected"
									for (var t = 0; t < e.operations.length; ++t) {
										var n = o.google.longrunning.Operation.verify(
											e.operations[t]
										)
										if (n) return "operations." + n
									}
								}
								if (
									e.nextPageToken != null &&
									e.hasOwnProperty("nextPageToken")
								)
									if (!r.isString(e.nextPageToken))
										return "nextPageToken: string expected"
								return null
							}
							ListOperationsResponse.fromObject = function fromObject(e) {
								if (e instanceof o.google.longrunning.ListOperationsResponse)
									return e
								var t = new o.google.longrunning.ListOperationsResponse()
								if (e.operations) {
									if (!Array.isArray(e.operations))
										throw TypeError(
											".google.longrunning.ListOperationsResponse.operations: array expected"
										)
									t.operations = []
									for (var n = 0; n < e.operations.length; ++n) {
										if (typeof e.operations[n] !== "object")
											throw TypeError(
												".google.longrunning.ListOperationsResponse.operations: object expected"
											)
										t.operations[n] = o.google.longrunning.Operation.fromObject(
											e.operations[n]
										)
									}
								}
								if (e.nextPageToken != null)
									t.nextPageToken = String(e.nextPageToken)
								return t
							}
							ListOperationsResponse.toObject = function toObject(e, t) {
								if (!t) t = {}
								var n = {}
								if (t.arrays || t.defaults) n.operations = []
								if (t.defaults) n.nextPageToken = ""
								if (e.operations && e.operations.length) {
									n.operations = []
									for (var r = 0; r < e.operations.length; ++r)
										n.operations[r] = o.google.longrunning.Operation.toObject(
											e.operations[r],
											t
										)
								}
								if (
									e.nextPageToken != null &&
									e.hasOwnProperty("nextPageToken")
								)
									n.nextPageToken = e.nextPageToken
								return n
							}
							ListOperationsResponse.prototype.toJSON = function toJSON() {
								return this.constructor.toObject(this, e.util.toJSONOptions)
							}
							return ListOperationsResponse
						})()
						i.CancelOperationRequest = (function () {
							function CancelOperationRequest(e) {
								if (e)
									for (var t = Object.keys(e), n = 0; n < t.length; ++n)
										if (e[t[n]] != null) this[t[n]] = e[t[n]]
							}
							CancelOperationRequest.prototype.name = ""
							CancelOperationRequest.create = function create(e) {
								return new CancelOperationRequest(e)
							}
							CancelOperationRequest.encode = function encode(e, t) {
								if (!t) t = n.create()
								if (e.name != null && Object.hasOwnProperty.call(e, "name"))
									t.uint32(10).string(e.name)
								return t
							}
							CancelOperationRequest.encodeDelimited = function encodeDelimited(
								e,
								t
							) {
								return this.encode(e, t).ldelim()
							}
							CancelOperationRequest.decode = function decode(e, n) {
								if (!(e instanceof t)) e = t.create(e)
								var r = n === undefined ? e.len : e.pos + n,
									i = new o.google.longrunning.CancelOperationRequest()
								while (e.pos < r) {
									var a = e.uint32()
									switch (a >>> 3) {
										case 1:
											i.name = e.string()
											break
										default:
											e.skipType(a & 7)
											break
									}
								}
								return i
							}
							CancelOperationRequest.decodeDelimited = function decodeDelimited(
								e
							) {
								if (!(e instanceof t)) e = new t(e)
								return this.decode(e, e.uint32())
							}
							CancelOperationRequest.verify = function verify(e) {
								if (typeof e !== "object" || e === null)
									return "object expected"
								if (e.name != null && e.hasOwnProperty("name"))
									if (!r.isString(e.name)) return "name: string expected"
								return null
							}
							CancelOperationRequest.fromObject = function fromObject(e) {
								if (e instanceof o.google.longrunning.CancelOperationRequest)
									return e
								var t = new o.google.longrunning.CancelOperationRequest()
								if (e.name != null) t.name = String(e.name)
								return t
							}
							CancelOperationRequest.toObject = function toObject(e, t) {
								if (!t) t = {}
								var n = {}
								if (t.defaults) n.name = ""
								if (e.name != null && e.hasOwnProperty("name")) n.name = e.name
								return n
							}
							CancelOperationRequest.prototype.toJSON = function toJSON() {
								return this.constructor.toObject(this, e.util.toJSONOptions)
							}
							return CancelOperationRequest
						})()
						i.DeleteOperationRequest = (function () {
							function DeleteOperationRequest(e) {
								if (e)
									for (var t = Object.keys(e), n = 0; n < t.length; ++n)
										if (e[t[n]] != null) this[t[n]] = e[t[n]]
							}
							DeleteOperationRequest.prototype.name = ""
							DeleteOperationRequest.create = function create(e) {
								return new DeleteOperationRequest(e)
							}
							DeleteOperationRequest.encode = function encode(e, t) {
								if (!t) t = n.create()
								if (e.name != null && Object.hasOwnProperty.call(e, "name"))
									t.uint32(10).string(e.name)
								return t
							}
							DeleteOperationRequest.encodeDelimited = function encodeDelimited(
								e,
								t
							) {
								return this.encode(e, t).ldelim()
							}
							DeleteOperationRequest.decode = function decode(e, n) {
								if (!(e instanceof t)) e = t.create(e)
								var r = n === undefined ? e.len : e.pos + n,
									i = new o.google.longrunning.DeleteOperationRequest()
								while (e.pos < r) {
									var a = e.uint32()
									switch (a >>> 3) {
										case 1:
											i.name = e.string()
											break
										default:
											e.skipType(a & 7)
											break
									}
								}
								return i
							}
							DeleteOperationRequest.decodeDelimited = function decodeDelimited(
								e
							) {
								if (!(e instanceof t)) e = new t(e)
								return this.decode(e, e.uint32())
							}
							DeleteOperationRequest.verify = function verify(e) {
								if (typeof e !== "object" || e === null)
									return "object expected"
								if (e.name != null && e.hasOwnProperty("name"))
									if (!r.isString(e.name)) return "name: string expected"
								return null
							}
							DeleteOperationRequest.fromObject = function fromObject(e) {
								if (e instanceof o.google.longrunning.DeleteOperationRequest)
									return e
								var t = new o.google.longrunning.DeleteOperationRequest()
								if (e.name != null) t.name = String(e.name)
								return t
							}
							DeleteOperationRequest.toObject = function toObject(e, t) {
								if (!t) t = {}
								var n = {}
								if (t.defaults) n.name = ""
								if (e.name != null && e.hasOwnProperty("name")) n.name = e.name
								return n
							}
							DeleteOperationRequest.prototype.toJSON = function toJSON() {
								return this.constructor.toObject(this, e.util.toJSONOptions)
							}
							return DeleteOperationRequest
						})()
						i.WaitOperationRequest = (function () {
							function WaitOperationRequest(e) {
								if (e)
									for (var t = Object.keys(e), n = 0; n < t.length; ++n)
										if (e[t[n]] != null) this[t[n]] = e[t[n]]
							}
							WaitOperationRequest.prototype.name = ""
							WaitOperationRequest.prototype.timeout = null
							WaitOperationRequest.create = function create(e) {
								return new WaitOperationRequest(e)
							}
							WaitOperationRequest.encode = function encode(e, t) {
								if (!t) t = n.create()
								if (e.name != null && Object.hasOwnProperty.call(e, "name"))
									t.uint32(10).string(e.name)
								if (
									e.timeout != null &&
									Object.hasOwnProperty.call(e, "timeout")
								)
									o.google.protobuf.Duration.encode(
										e.timeout,
										t.uint32(18).fork()
									).ldelim()
								return t
							}
							WaitOperationRequest.encodeDelimited = function encodeDelimited(
								e,
								t
							) {
								return this.encode(e, t).ldelim()
							}
							WaitOperationRequest.decode = function decode(e, n) {
								if (!(e instanceof t)) e = t.create(e)
								var r = n === undefined ? e.len : e.pos + n,
									i = new o.google.longrunning.WaitOperationRequest()
								while (e.pos < r) {
									var a = e.uint32()
									switch (a >>> 3) {
										case 1:
											i.name = e.string()
											break
										case 2:
											i.timeout = o.google.protobuf.Duration.decode(
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
							WaitOperationRequest.decodeDelimited = function decodeDelimited(
								e
							) {
								if (!(e instanceof t)) e = new t(e)
								return this.decode(e, e.uint32())
							}
							WaitOperationRequest.verify = function verify(e) {
								if (typeof e !== "object" || e === null)
									return "object expected"
								if (e.name != null && e.hasOwnProperty("name"))
									if (!r.isString(e.name)) return "name: string expected"
								if (e.timeout != null && e.hasOwnProperty("timeout")) {
									var t = o.google.protobuf.Duration.verify(e.timeout)
									if (t) return "timeout." + t
								}
								return null
							}
							WaitOperationRequest.fromObject = function fromObject(e) {
								if (e instanceof o.google.longrunning.WaitOperationRequest)
									return e
								var t = new o.google.longrunning.WaitOperationRequest()
								if (e.name != null) t.name = String(e.name)
								if (e.timeout != null) {
									if (typeof e.timeout !== "object")
										throw TypeError(
											".google.longrunning.WaitOperationRequest.timeout: object expected"
										)
									t.timeout = o.google.protobuf.Duration.fromObject(e.timeout)
								}
								return t
							}
							WaitOperationRequest.toObject = function toObject(e, t) {
								if (!t) t = {}
								var n = {}
								if (t.defaults) {
									n.name = ""
									n.timeout = null
								}
								if (e.name != null && e.hasOwnProperty("name")) n.name = e.name
								if (e.timeout != null && e.hasOwnProperty("timeout"))
									n.timeout = o.google.protobuf.Duration.toObject(e.timeout, t)
								return n
							}
							WaitOperationRequest.prototype.toJSON = function toJSON() {
								return this.constructor.toObject(this, e.util.toJSONOptions)
							}
							return WaitOperationRequest
						})()
						i.OperationInfo = (function () {
							function OperationInfo(e) {
								if (e)
									for (var t = Object.keys(e), n = 0; n < t.length; ++n)
										if (e[t[n]] != null) this[t[n]] = e[t[n]]
							}
							OperationInfo.prototype.responseType = ""
							OperationInfo.prototype.metadataType = ""
							OperationInfo.create = function create(e) {
								return new OperationInfo(e)
							}
							OperationInfo.encode = function encode(e, t) {
								if (!t) t = n.create()
								if (
									e.responseType != null &&
									Object.hasOwnProperty.call(e, "responseType")
								)
									t.uint32(10).string(e.responseType)
								if (
									e.metadataType != null &&
									Object.hasOwnProperty.call(e, "metadataType")
								)
									t.uint32(18).string(e.metadataType)
								return t
							}
							OperationInfo.encodeDelimited = function encodeDelimited(e, t) {
								return this.encode(e, t).ldelim()
							}
							OperationInfo.decode = function decode(e, n) {
								if (!(e instanceof t)) e = t.create(e)
								var r = n === undefined ? e.len : e.pos + n,
									i = new o.google.longrunning.OperationInfo()
								while (e.pos < r) {
									var a = e.uint32()
									switch (a >>> 3) {
										case 1:
											i.responseType = e.string()
											break
										case 2:
											i.metadataType = e.string()
											break
										default:
											e.skipType(a & 7)
											break
									}
								}
								return i
							}
							OperationInfo.decodeDelimited = function decodeDelimited(e) {
								if (!(e instanceof t)) e = new t(e)
								return this.decode(e, e.uint32())
							}
							OperationInfo.verify = function verify(e) {
								if (typeof e !== "object" || e === null)
									return "object expected"
								if (e.responseType != null && e.hasOwnProperty("responseType"))
									if (!r.isString(e.responseType))
										return "responseType: string expected"
								if (e.metadataType != null && e.hasOwnProperty("metadataType"))
									if (!r.isString(e.metadataType))
										return "metadataType: string expected"
								return null
							}
							OperationInfo.fromObject = function fromObject(e) {
								if (e instanceof o.google.longrunning.OperationInfo) return e
								var t = new o.google.longrunning.OperationInfo()
								if (e.responseType != null)
									t.responseType = String(e.responseType)
								if (e.metadataType != null)
									t.metadataType = String(e.metadataType)
								return t
							}
							OperationInfo.toObject = function toObject(e, t) {
								if (!t) t = {}
								var n = {}
								if (t.defaults) {
									n.responseType = ""
									n.metadataType = ""
								}
								if (e.responseType != null && e.hasOwnProperty("responseType"))
									n.responseType = e.responseType
								if (e.metadataType != null && e.hasOwnProperty("metadataType"))
									n.metadataType = e.metadataType
								return n
							}
							OperationInfo.prototype.toJSON = function toJSON() {
								return this.constructor.toObject(this, e.util.toJSONOptions)
							}
							return OperationInfo
						})()
						return i
					})()
					i.api = (function () {
						var i = {}
						i.Http = (function () {
							function Http(e) {
								this.rules = []
								if (e)
									for (var t = Object.keys(e), n = 0; n < t.length; ++n)
										if (e[t[n]] != null) this[t[n]] = e[t[n]]
							}
							Http.prototype.rules = r.emptyArray
							Http.prototype.fullyDecodeReservedExpansion = false
							Http.create = function create(e) {
								return new Http(e)
							}
							Http.encode = function encode(e, t) {
								if (!t) t = n.create()
								if (e.rules != null && e.rules.length)
									for (var r = 0; r < e.rules.length; ++r)
										o.google.api.HttpRule.encode(
											e.rules[r],
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
							Http.decode = function decode(e, n) {
								if (!(e instanceof t)) e = t.create(e)
								var r = n === undefined ? e.len : e.pos + n,
									i = new o.google.api.Http()
								while (e.pos < r) {
									var a = e.uint32()
									switch (a >>> 3) {
										case 1:
											if (!(i.rules && i.rules.length)) i.rules = []
											i.rules.push(o.google.api.HttpRule.decode(e, e.uint32()))
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
										var n = o.google.api.HttpRule.verify(e.rules[t])
										if (n) return "rules." + n
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
								if (e instanceof o.google.api.Http) return e
								var t = new o.google.api.Http()
								if (e.rules) {
									if (!Array.isArray(e.rules))
										throw TypeError(".google.api.Http.rules: array expected")
									t.rules = []
									for (var n = 0; n < e.rules.length; ++n) {
										if (typeof e.rules[n] !== "object")
											throw TypeError(".google.api.Http.rules: object expected")
										t.rules[n] = o.google.api.HttpRule.fromObject(e.rules[n])
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
								var n = {}
								if (t.arrays || t.defaults) n.rules = []
								if (t.defaults) n.fullyDecodeReservedExpansion = false
								if (e.rules && e.rules.length) {
									n.rules = []
									for (var r = 0; r < e.rules.length; ++r)
										n.rules[r] = o.google.api.HttpRule.toObject(e.rules[r], t)
								}
								if (
									e.fullyDecodeReservedExpansion != null &&
									e.hasOwnProperty("fullyDecodeReservedExpansion")
								)
									n.fullyDecodeReservedExpansion =
										e.fullyDecodeReservedExpansion
								return n
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
									for (var t = Object.keys(e), n = 0; n < t.length; ++n)
										if (e[t[n]] != null) this[t[n]] = e[t[n]]
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
							HttpRule.prototype.additionalBindings = r.emptyArray
							var i
							Object.defineProperty(HttpRule.prototype, "pattern", {
								get: r.oneOfGetter(
									(i = ["get", "put", "post", "delete", "patch", "custom"])
								),
								set: r.oneOfSetter(i)
							})
							HttpRule.create = function create(e) {
								return new HttpRule(e)
							}
							HttpRule.encode = function encode(e, t) {
								if (!t) t = n.create()
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
									o.google.api.CustomHttpPattern.encode(
										e.custom,
										t.uint32(66).fork()
									).ldelim()
								if (e.additionalBindings != null && e.additionalBindings.length)
									for (var r = 0; r < e.additionalBindings.length; ++r)
										o.google.api.HttpRule.encode(
											e.additionalBindings[r],
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
							HttpRule.decode = function decode(e, n) {
								if (!(e instanceof t)) e = t.create(e)
								var r = n === undefined ? e.len : e.pos + n,
									i = new o.google.api.HttpRule()
								while (e.pos < r) {
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
											i.custom = o.google.api.CustomHttpPattern.decode(
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
												o.google.api.HttpRule.decode(e, e.uint32())
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
									if (!r.isString(e.selector))
										return "selector: string expected"
								if (e.get != null && e.hasOwnProperty("get")) {
									t.pattern = 1
									if (!r.isString(e.get)) return "get: string expected"
								}
								if (e.put != null && e.hasOwnProperty("put")) {
									if (t.pattern === 1) return "pattern: multiple values"
									t.pattern = 1
									if (!r.isString(e.put)) return "put: string expected"
								}
								if (e.post != null && e.hasOwnProperty("post")) {
									if (t.pattern === 1) return "pattern: multiple values"
									t.pattern = 1
									if (!r.isString(e.post)) return "post: string expected"
								}
								if (e["delete"] != null && e.hasOwnProperty("delete")) {
									if (t.pattern === 1) return "pattern: multiple values"
									t.pattern = 1
									if (!r.isString(e["delete"])) return "delete: string expected"
								}
								if (e.patch != null && e.hasOwnProperty("patch")) {
									if (t.pattern === 1) return "pattern: multiple values"
									t.pattern = 1
									if (!r.isString(e.patch)) return "patch: string expected"
								}
								if (e.custom != null && e.hasOwnProperty("custom")) {
									if (t.pattern === 1) return "pattern: multiple values"
									t.pattern = 1
									{
										var n = o.google.api.CustomHttpPattern.verify(e.custom)
										if (n) return "custom." + n
									}
								}
								if (e.body != null && e.hasOwnProperty("body"))
									if (!r.isString(e.body)) return "body: string expected"
								if (e.responseBody != null && e.hasOwnProperty("responseBody"))
									if (!r.isString(e.responseBody))
										return "responseBody: string expected"
								if (
									e.additionalBindings != null &&
									e.hasOwnProperty("additionalBindings")
								) {
									if (!Array.isArray(e.additionalBindings))
										return "additionalBindings: array expected"
									for (var i = 0; i < e.additionalBindings.length; ++i) {
										var n = o.google.api.HttpRule.verify(
											e.additionalBindings[i]
										)
										if (n) return "additionalBindings." + n
									}
								}
								return null
							}
							HttpRule.fromObject = function fromObject(e) {
								if (e instanceof o.google.api.HttpRule) return e
								var t = new o.google.api.HttpRule()
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
									t.custom = o.google.api.CustomHttpPattern.fromObject(e.custom)
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
									for (var n = 0; n < e.additionalBindings.length; ++n) {
										if (typeof e.additionalBindings[n] !== "object")
											throw TypeError(
												".google.api.HttpRule.additionalBindings: object expected"
											)
										t.additionalBindings[n] = o.google.api.HttpRule.fromObject(
											e.additionalBindings[n]
										)
									}
								}
								return t
							}
							HttpRule.toObject = function toObject(e, t) {
								if (!t) t = {}
								var n = {}
								if (t.arrays || t.defaults) n.additionalBindings = []
								if (t.defaults) {
									n.selector = ""
									n.body = ""
									n.responseBody = ""
								}
								if (e.selector != null && e.hasOwnProperty("selector"))
									n.selector = e.selector
								if (e.get != null && e.hasOwnProperty("get")) {
									n.get = e.get
									if (t.oneofs) n.pattern = "get"
								}
								if (e.put != null && e.hasOwnProperty("put")) {
									n.put = e.put
									if (t.oneofs) n.pattern = "put"
								}
								if (e.post != null && e.hasOwnProperty("post")) {
									n.post = e.post
									if (t.oneofs) n.pattern = "post"
								}
								if (e["delete"] != null && e.hasOwnProperty("delete")) {
									n["delete"] = e["delete"]
									if (t.oneofs) n.pattern = "delete"
								}
								if (e.patch != null && e.hasOwnProperty("patch")) {
									n.patch = e.patch
									if (t.oneofs) n.pattern = "patch"
								}
								if (e.body != null && e.hasOwnProperty("body")) n.body = e.body
								if (e.custom != null && e.hasOwnProperty("custom")) {
									n.custom = o.google.api.CustomHttpPattern.toObject(
										e.custom,
										t
									)
									if (t.oneofs) n.pattern = "custom"
								}
								if (e.additionalBindings && e.additionalBindings.length) {
									n.additionalBindings = []
									for (var r = 0; r < e.additionalBindings.length; ++r)
										n.additionalBindings[r] = o.google.api.HttpRule.toObject(
											e.additionalBindings[r],
											t
										)
								}
								if (e.responseBody != null && e.hasOwnProperty("responseBody"))
									n.responseBody = e.responseBody
								return n
							}
							HttpRule.prototype.toJSON = function toJSON() {
								return this.constructor.toObject(this, e.util.toJSONOptions)
							}
							return HttpRule
						})()
						i.CustomHttpPattern = (function () {
							function CustomHttpPattern(e) {
								if (e)
									for (var t = Object.keys(e), n = 0; n < t.length; ++n)
										if (e[t[n]] != null) this[t[n]] = e[t[n]]
							}
							CustomHttpPattern.prototype.kind = ""
							CustomHttpPattern.prototype.path = ""
							CustomHttpPattern.create = function create(e) {
								return new CustomHttpPattern(e)
							}
							CustomHttpPattern.encode = function encode(e, t) {
								if (!t) t = n.create()
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
							CustomHttpPattern.decode = function decode(e, n) {
								if (!(e instanceof t)) e = t.create(e)
								var r = n === undefined ? e.len : e.pos + n,
									i = new o.google.api.CustomHttpPattern()
								while (e.pos < r) {
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
									if (!r.isString(e.kind)) return "kind: string expected"
								if (e.path != null && e.hasOwnProperty("path"))
									if (!r.isString(e.path)) return "path: string expected"
								return null
							}
							CustomHttpPattern.fromObject = function fromObject(e) {
								if (e instanceof o.google.api.CustomHttpPattern) return e
								var t = new o.google.api.CustomHttpPattern()
								if (e.kind != null) t.kind = String(e.kind)
								if (e.path != null) t.path = String(e.path)
								return t
							}
							CustomHttpPattern.toObject = function toObject(e, t) {
								if (!t) t = {}
								var n = {}
								if (t.defaults) {
									n.kind = ""
									n.path = ""
								}
								if (e.kind != null && e.hasOwnProperty("kind")) n.kind = e.kind
								if (e.path != null && e.hasOwnProperty("path")) n.path = e.path
								return n
							}
							CustomHttpPattern.prototype.toJSON = function toJSON() {
								return this.constructor.toObject(this, e.util.toJSONOptions)
							}
							return CustomHttpPattern
						})()
						return i
					})()
					i.protobuf = (function () {
						var i = {}
						i.FileDescriptorSet = (function () {
							function FileDescriptorSet(e) {
								this.file = []
								if (e)
									for (var t = Object.keys(e), n = 0; n < t.length; ++n)
										if (e[t[n]] != null) this[t[n]] = e[t[n]]
							}
							FileDescriptorSet.prototype.file = r.emptyArray
							FileDescriptorSet.create = function create(e) {
								return new FileDescriptorSet(e)
							}
							FileDescriptorSet.encode = function encode(e, t) {
								if (!t) t = n.create()
								if (e.file != null && e.file.length)
									for (var r = 0; r < e.file.length; ++r)
										o.google.protobuf.FileDescriptorProto.encode(
											e.file[r],
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
							FileDescriptorSet.decode = function decode(e, n) {
								if (!(e instanceof t)) e = t.create(e)
								var r = n === undefined ? e.len : e.pos + n,
									i = new o.google.protobuf.FileDescriptorSet()
								while (e.pos < r) {
									var a = e.uint32()
									switch (a >>> 3) {
										case 1:
											if (!(i.file && i.file.length)) i.file = []
											i.file.push(
												o.google.protobuf.FileDescriptorProto.decode(
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
										var n = o.google.protobuf.FileDescriptorProto.verify(
											e.file[t]
										)
										if (n) return "file." + n
									}
								}
								return null
							}
							FileDescriptorSet.fromObject = function fromObject(e) {
								if (e instanceof o.google.protobuf.FileDescriptorSet) return e
								var t = new o.google.protobuf.FileDescriptorSet()
								if (e.file) {
									if (!Array.isArray(e.file))
										throw TypeError(
											".google.protobuf.FileDescriptorSet.file: array expected"
										)
									t.file = []
									for (var n = 0; n < e.file.length; ++n) {
										if (typeof e.file[n] !== "object")
											throw TypeError(
												".google.protobuf.FileDescriptorSet.file: object expected"
											)
										t.file[n] =
											o.google.protobuf.FileDescriptorProto.fromObject(
												e.file[n]
											)
									}
								}
								return t
							}
							FileDescriptorSet.toObject = function toObject(e, t) {
								if (!t) t = {}
								var n = {}
								if (t.arrays || t.defaults) n.file = []
								if (e.file && e.file.length) {
									n.file = []
									for (var r = 0; r < e.file.length; ++r)
										n.file[r] = o.google.protobuf.FileDescriptorProto.toObject(
											e.file[r],
											t
										)
								}
								return n
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
									for (var t = Object.keys(e), n = 0; n < t.length; ++n)
										if (e[t[n]] != null) this[t[n]] = e[t[n]]
							}
							FileDescriptorProto.prototype.name = ""
							FileDescriptorProto.prototype["package"] = ""
							FileDescriptorProto.prototype.dependency = r.emptyArray
							FileDescriptorProto.prototype.publicDependency = r.emptyArray
							FileDescriptorProto.prototype.weakDependency = r.emptyArray
							FileDescriptorProto.prototype.messageType = r.emptyArray
							FileDescriptorProto.prototype.enumType = r.emptyArray
							FileDescriptorProto.prototype.service = r.emptyArray
							FileDescriptorProto.prototype.extension = r.emptyArray
							FileDescriptorProto.prototype.options = null
							FileDescriptorProto.prototype.sourceCodeInfo = null
							FileDescriptorProto.prototype.syntax = ""
							FileDescriptorProto.create = function create(e) {
								return new FileDescriptorProto(e)
							}
							FileDescriptorProto.encode = function encode(e, t) {
								if (!t) t = n.create()
								if (e.name != null && Object.hasOwnProperty.call(e, "name"))
									t.uint32(10).string(e.name)
								if (
									e["package"] != null &&
									Object.hasOwnProperty.call(e, "package")
								)
									t.uint32(18).string(e["package"])
								if (e.dependency != null && e.dependency.length)
									for (var r = 0; r < e.dependency.length; ++r)
										t.uint32(26).string(e.dependency[r])
								if (e.messageType != null && e.messageType.length)
									for (var r = 0; r < e.messageType.length; ++r)
										o.google.protobuf.DescriptorProto.encode(
											e.messageType[r],
											t.uint32(34).fork()
										).ldelim()
								if (e.enumType != null && e.enumType.length)
									for (var r = 0; r < e.enumType.length; ++r)
										o.google.protobuf.EnumDescriptorProto.encode(
											e.enumType[r],
											t.uint32(42).fork()
										).ldelim()
								if (e.service != null && e.service.length)
									for (var r = 0; r < e.service.length; ++r)
										o.google.protobuf.ServiceDescriptorProto.encode(
											e.service[r],
											t.uint32(50).fork()
										).ldelim()
								if (e.extension != null && e.extension.length)
									for (var r = 0; r < e.extension.length; ++r)
										o.google.protobuf.FieldDescriptorProto.encode(
											e.extension[r],
											t.uint32(58).fork()
										).ldelim()
								if (
									e.options != null &&
									Object.hasOwnProperty.call(e, "options")
								)
									o.google.protobuf.FileOptions.encode(
										e.options,
										t.uint32(66).fork()
									).ldelim()
								if (
									e.sourceCodeInfo != null &&
									Object.hasOwnProperty.call(e, "sourceCodeInfo")
								)
									o.google.protobuf.SourceCodeInfo.encode(
										e.sourceCodeInfo,
										t.uint32(74).fork()
									).ldelim()
								if (e.publicDependency != null && e.publicDependency.length)
									for (var r = 0; r < e.publicDependency.length; ++r)
										t.uint32(80).int32(e.publicDependency[r])
								if (e.weakDependency != null && e.weakDependency.length)
									for (var r = 0; r < e.weakDependency.length; ++r)
										t.uint32(88).int32(e.weakDependency[r])
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
							FileDescriptorProto.decode = function decode(e, n) {
								if (!(e instanceof t)) e = t.create(e)
								var r = n === undefined ? e.len : e.pos + n,
									i = new o.google.protobuf.FileDescriptorProto()
								while (e.pos < r) {
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
												var p = e.uint32() + e.pos
												while (e.pos < p) i.publicDependency.push(e.int32())
											} else i.publicDependency.push(e.int32())
											break
										case 11:
											if (!(i.weakDependency && i.weakDependency.length))
												i.weakDependency = []
											if ((a & 7) === 2) {
												var p = e.uint32() + e.pos
												while (e.pos < p) i.weakDependency.push(e.int32())
											} else i.weakDependency.push(e.int32())
											break
										case 4:
											if (!(i.messageType && i.messageType.length))
												i.messageType = []
											i.messageType.push(
												o.google.protobuf.DescriptorProto.decode(e, e.uint32())
											)
											break
										case 5:
											if (!(i.enumType && i.enumType.length)) i.enumType = []
											i.enumType.push(
												o.google.protobuf.EnumDescriptorProto.decode(
													e,
													e.uint32()
												)
											)
											break
										case 6:
											if (!(i.service && i.service.length)) i.service = []
											i.service.push(
												o.google.protobuf.ServiceDescriptorProto.decode(
													e,
													e.uint32()
												)
											)
											break
										case 7:
											if (!(i.extension && i.extension.length)) i.extension = []
											i.extension.push(
												o.google.protobuf.FieldDescriptorProto.decode(
													e,
													e.uint32()
												)
											)
											break
										case 8:
											i.options = o.google.protobuf.FileOptions.decode(
												e,
												e.uint32()
											)
											break
										case 9:
											i.sourceCodeInfo =
												o.google.protobuf.SourceCodeInfo.decode(e, e.uint32())
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
									if (!r.isString(e.name)) return "name: string expected"
								if (e["package"] != null && e.hasOwnProperty("package"))
									if (!r.isString(e["package"]))
										return "package: string expected"
								if (e.dependency != null && e.hasOwnProperty("dependency")) {
									if (!Array.isArray(e.dependency))
										return "dependency: array expected"
									for (var t = 0; t < e.dependency.length; ++t)
										if (!r.isString(e.dependency[t]))
											return "dependency: string[] expected"
								}
								if (
									e.publicDependency != null &&
									e.hasOwnProperty("publicDependency")
								) {
									if (!Array.isArray(e.publicDependency))
										return "publicDependency: array expected"
									for (var t = 0; t < e.publicDependency.length; ++t)
										if (!r.isInteger(e.publicDependency[t]))
											return "publicDependency: integer[] expected"
								}
								if (
									e.weakDependency != null &&
									e.hasOwnProperty("weakDependency")
								) {
									if (!Array.isArray(e.weakDependency))
										return "weakDependency: array expected"
									for (var t = 0; t < e.weakDependency.length; ++t)
										if (!r.isInteger(e.weakDependency[t]))
											return "weakDependency: integer[] expected"
								}
								if (e.messageType != null && e.hasOwnProperty("messageType")) {
									if (!Array.isArray(e.messageType))
										return "messageType: array expected"
									for (var t = 0; t < e.messageType.length; ++t) {
										var n = o.google.protobuf.DescriptorProto.verify(
											e.messageType[t]
										)
										if (n) return "messageType." + n
									}
								}
								if (e.enumType != null && e.hasOwnProperty("enumType")) {
									if (!Array.isArray(e.enumType))
										return "enumType: array expected"
									for (var t = 0; t < e.enumType.length; ++t) {
										var n = o.google.protobuf.EnumDescriptorProto.verify(
											e.enumType[t]
										)
										if (n) return "enumType." + n
									}
								}
								if (e.service != null && e.hasOwnProperty("service")) {
									if (!Array.isArray(e.service))
										return "service: array expected"
									for (var t = 0; t < e.service.length; ++t) {
										var n = o.google.protobuf.ServiceDescriptorProto.verify(
											e.service[t]
										)
										if (n) return "service." + n
									}
								}
								if (e.extension != null && e.hasOwnProperty("extension")) {
									if (!Array.isArray(e.extension))
										return "extension: array expected"
									for (var t = 0; t < e.extension.length; ++t) {
										var n = o.google.protobuf.FieldDescriptorProto.verify(
											e.extension[t]
										)
										if (n) return "extension." + n
									}
								}
								if (e.options != null && e.hasOwnProperty("options")) {
									var n = o.google.protobuf.FileOptions.verify(e.options)
									if (n) return "options." + n
								}
								if (
									e.sourceCodeInfo != null &&
									e.hasOwnProperty("sourceCodeInfo")
								) {
									var n = o.google.protobuf.SourceCodeInfo.verify(
										e.sourceCodeInfo
									)
									if (n) return "sourceCodeInfo." + n
								}
								if (e.syntax != null && e.hasOwnProperty("syntax"))
									if (!r.isString(e.syntax)) return "syntax: string expected"
								return null
							}
							FileDescriptorProto.fromObject = function fromObject(e) {
								if (e instanceof o.google.protobuf.FileDescriptorProto) return e
								var t = new o.google.protobuf.FileDescriptorProto()
								if (e.name != null) t.name = String(e.name)
								if (e["package"] != null) t["package"] = String(e["package"])
								if (e.dependency) {
									if (!Array.isArray(e.dependency))
										throw TypeError(
											".google.protobuf.FileDescriptorProto.dependency: array expected"
										)
									t.dependency = []
									for (var n = 0; n < e.dependency.length; ++n)
										t.dependency[n] = String(e.dependency[n])
								}
								if (e.publicDependency) {
									if (!Array.isArray(e.publicDependency))
										throw TypeError(
											".google.protobuf.FileDescriptorProto.publicDependency: array expected"
										)
									t.publicDependency = []
									for (var n = 0; n < e.publicDependency.length; ++n)
										t.publicDependency[n] = e.publicDependency[n] | 0
								}
								if (e.weakDependency) {
									if (!Array.isArray(e.weakDependency))
										throw TypeError(
											".google.protobuf.FileDescriptorProto.weakDependency: array expected"
										)
									t.weakDependency = []
									for (var n = 0; n < e.weakDependency.length; ++n)
										t.weakDependency[n] = e.weakDependency[n] | 0
								}
								if (e.messageType) {
									if (!Array.isArray(e.messageType))
										throw TypeError(
											".google.protobuf.FileDescriptorProto.messageType: array expected"
										)
									t.messageType = []
									for (var n = 0; n < e.messageType.length; ++n) {
										if (typeof e.messageType[n] !== "object")
											throw TypeError(
												".google.protobuf.FileDescriptorProto.messageType: object expected"
											)
										t.messageType[n] =
											o.google.protobuf.DescriptorProto.fromObject(
												e.messageType[n]
											)
									}
								}
								if (e.enumType) {
									if (!Array.isArray(e.enumType))
										throw TypeError(
											".google.protobuf.FileDescriptorProto.enumType: array expected"
										)
									t.enumType = []
									for (var n = 0; n < e.enumType.length; ++n) {
										if (typeof e.enumType[n] !== "object")
											throw TypeError(
												".google.protobuf.FileDescriptorProto.enumType: object expected"
											)
										t.enumType[n] =
											o.google.protobuf.EnumDescriptorProto.fromObject(
												e.enumType[n]
											)
									}
								}
								if (e.service) {
									if (!Array.isArray(e.service))
										throw TypeError(
											".google.protobuf.FileDescriptorProto.service: array expected"
										)
									t.service = []
									for (var n = 0; n < e.service.length; ++n) {
										if (typeof e.service[n] !== "object")
											throw TypeError(
												".google.protobuf.FileDescriptorProto.service: object expected"
											)
										t.service[n] =
											o.google.protobuf.ServiceDescriptorProto.fromObject(
												e.service[n]
											)
									}
								}
								if (e.extension) {
									if (!Array.isArray(e.extension))
										throw TypeError(
											".google.protobuf.FileDescriptorProto.extension: array expected"
										)
									t.extension = []
									for (var n = 0; n < e.extension.length; ++n) {
										if (typeof e.extension[n] !== "object")
											throw TypeError(
												".google.protobuf.FileDescriptorProto.extension: object expected"
											)
										t.extension[n] =
											o.google.protobuf.FieldDescriptorProto.fromObject(
												e.extension[n]
											)
									}
								}
								if (e.options != null) {
									if (typeof e.options !== "object")
										throw TypeError(
											".google.protobuf.FileDescriptorProto.options: object expected"
										)
									t.options = o.google.protobuf.FileOptions.fromObject(
										e.options
									)
								}
								if (e.sourceCodeInfo != null) {
									if (typeof e.sourceCodeInfo !== "object")
										throw TypeError(
											".google.protobuf.FileDescriptorProto.sourceCodeInfo: object expected"
										)
									t.sourceCodeInfo =
										o.google.protobuf.SourceCodeInfo.fromObject(
											e.sourceCodeInfo
										)
								}
								if (e.syntax != null) t.syntax = String(e.syntax)
								return t
							}
							FileDescriptorProto.toObject = function toObject(e, t) {
								if (!t) t = {}
								var n = {}
								if (t.arrays || t.defaults) {
									n.dependency = []
									n.messageType = []
									n.enumType = []
									n.service = []
									n.extension = []
									n.publicDependency = []
									n.weakDependency = []
								}
								if (t.defaults) {
									n.name = ""
									n["package"] = ""
									n.options = null
									n.sourceCodeInfo = null
									n.syntax = ""
								}
								if (e.name != null && e.hasOwnProperty("name")) n.name = e.name
								if (e["package"] != null && e.hasOwnProperty("package"))
									n["package"] = e["package"]
								if (e.dependency && e.dependency.length) {
									n.dependency = []
									for (var r = 0; r < e.dependency.length; ++r)
										n.dependency[r] = e.dependency[r]
								}
								if (e.messageType && e.messageType.length) {
									n.messageType = []
									for (var r = 0; r < e.messageType.length; ++r)
										n.messageType[r] =
											o.google.protobuf.DescriptorProto.toObject(
												e.messageType[r],
												t
											)
								}
								if (e.enumType && e.enumType.length) {
									n.enumType = []
									for (var r = 0; r < e.enumType.length; ++r)
										n.enumType[r] =
											o.google.protobuf.EnumDescriptorProto.toObject(
												e.enumType[r],
												t
											)
								}
								if (e.service && e.service.length) {
									n.service = []
									for (var r = 0; r < e.service.length; ++r)
										n.service[r] =
											o.google.protobuf.ServiceDescriptorProto.toObject(
												e.service[r],
												t
											)
								}
								if (e.extension && e.extension.length) {
									n.extension = []
									for (var r = 0; r < e.extension.length; ++r)
										n.extension[r] =
											o.google.protobuf.FieldDescriptorProto.toObject(
												e.extension[r],
												t
											)
								}
								if (e.options != null && e.hasOwnProperty("options"))
									n.options = o.google.protobuf.FileOptions.toObject(
										e.options,
										t
									)
								if (
									e.sourceCodeInfo != null &&
									e.hasOwnProperty("sourceCodeInfo")
								)
									n.sourceCodeInfo = o.google.protobuf.SourceCodeInfo.toObject(
										e.sourceCodeInfo,
										t
									)
								if (e.publicDependency && e.publicDependency.length) {
									n.publicDependency = []
									for (var r = 0; r < e.publicDependency.length; ++r)
										n.publicDependency[r] = e.publicDependency[r]
								}
								if (e.weakDependency && e.weakDependency.length) {
									n.weakDependency = []
									for (var r = 0; r < e.weakDependency.length; ++r)
										n.weakDependency[r] = e.weakDependency[r]
								}
								if (e.syntax != null && e.hasOwnProperty("syntax"))
									n.syntax = e.syntax
								return n
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
									for (var t = Object.keys(e), n = 0; n < t.length; ++n)
										if (e[t[n]] != null) this[t[n]] = e[t[n]]
							}
							DescriptorProto.prototype.name = ""
							DescriptorProto.prototype.field = r.emptyArray
							DescriptorProto.prototype.extension = r.emptyArray
							DescriptorProto.prototype.nestedType = r.emptyArray
							DescriptorProto.prototype.enumType = r.emptyArray
							DescriptorProto.prototype.extensionRange = r.emptyArray
							DescriptorProto.prototype.oneofDecl = r.emptyArray
							DescriptorProto.prototype.options = null
							DescriptorProto.prototype.reservedRange = r.emptyArray
							DescriptorProto.prototype.reservedName = r.emptyArray
							DescriptorProto.create = function create(e) {
								return new DescriptorProto(e)
							}
							DescriptorProto.encode = function encode(e, t) {
								if (!t) t = n.create()
								if (e.name != null && Object.hasOwnProperty.call(e, "name"))
									t.uint32(10).string(e.name)
								if (e.field != null && e.field.length)
									for (var r = 0; r < e.field.length; ++r)
										o.google.protobuf.FieldDescriptorProto.encode(
											e.field[r],
											t.uint32(18).fork()
										).ldelim()
								if (e.nestedType != null && e.nestedType.length)
									for (var r = 0; r < e.nestedType.length; ++r)
										o.google.protobuf.DescriptorProto.encode(
											e.nestedType[r],
											t.uint32(26).fork()
										).ldelim()
								if (e.enumType != null && e.enumType.length)
									for (var r = 0; r < e.enumType.length; ++r)
										o.google.protobuf.EnumDescriptorProto.encode(
											e.enumType[r],
											t.uint32(34).fork()
										).ldelim()
								if (e.extensionRange != null && e.extensionRange.length)
									for (var r = 0; r < e.extensionRange.length; ++r)
										o.google.protobuf.DescriptorProto.ExtensionRange.encode(
											e.extensionRange[r],
											t.uint32(42).fork()
										).ldelim()
								if (e.extension != null && e.extension.length)
									for (var r = 0; r < e.extension.length; ++r)
										o.google.protobuf.FieldDescriptorProto.encode(
											e.extension[r],
											t.uint32(50).fork()
										).ldelim()
								if (
									e.options != null &&
									Object.hasOwnProperty.call(e, "options")
								)
									o.google.protobuf.MessageOptions.encode(
										e.options,
										t.uint32(58).fork()
									).ldelim()
								if (e.oneofDecl != null && e.oneofDecl.length)
									for (var r = 0; r < e.oneofDecl.length; ++r)
										o.google.protobuf.OneofDescriptorProto.encode(
											e.oneofDecl[r],
											t.uint32(66).fork()
										).ldelim()
								if (e.reservedRange != null && e.reservedRange.length)
									for (var r = 0; r < e.reservedRange.length; ++r)
										o.google.protobuf.DescriptorProto.ReservedRange.encode(
											e.reservedRange[r],
											t.uint32(74).fork()
										).ldelim()
								if (e.reservedName != null && e.reservedName.length)
									for (var r = 0; r < e.reservedName.length; ++r)
										t.uint32(82).string(e.reservedName[r])
								return t
							}
							DescriptorProto.encodeDelimited = function encodeDelimited(e, t) {
								return this.encode(e, t).ldelim()
							}
							DescriptorProto.decode = function decode(e, n) {
								if (!(e instanceof t)) e = t.create(e)
								var r = n === undefined ? e.len : e.pos + n,
									i = new o.google.protobuf.DescriptorProto()
								while (e.pos < r) {
									var a = e.uint32()
									switch (a >>> 3) {
										case 1:
											i.name = e.string()
											break
										case 2:
											if (!(i.field && i.field.length)) i.field = []
											i.field.push(
												o.google.protobuf.FieldDescriptorProto.decode(
													e,
													e.uint32()
												)
											)
											break
										case 6:
											if (!(i.extension && i.extension.length)) i.extension = []
											i.extension.push(
												o.google.protobuf.FieldDescriptorProto.decode(
													e,
													e.uint32()
												)
											)
											break
										case 3:
											if (!(i.nestedType && i.nestedType.length))
												i.nestedType = []
											i.nestedType.push(
												o.google.protobuf.DescriptorProto.decode(e, e.uint32())
											)
											break
										case 4:
											if (!(i.enumType && i.enumType.length)) i.enumType = []
											i.enumType.push(
												o.google.protobuf.EnumDescriptorProto.decode(
													e,
													e.uint32()
												)
											)
											break
										case 5:
											if (!(i.extensionRange && i.extensionRange.length))
												i.extensionRange = []
											i.extensionRange.push(
												o.google.protobuf.DescriptorProto.ExtensionRange.decode(
													e,
													e.uint32()
												)
											)
											break
										case 8:
											if (!(i.oneofDecl && i.oneofDecl.length)) i.oneofDecl = []
											i.oneofDecl.push(
												o.google.protobuf.OneofDescriptorProto.decode(
													e,
													e.uint32()
												)
											)
											break
										case 7:
											i.options = o.google.protobuf.MessageOptions.decode(
												e,
												e.uint32()
											)
											break
										case 9:
											if (!(i.reservedRange && i.reservedRange.length))
												i.reservedRange = []
											i.reservedRange.push(
												o.google.protobuf.DescriptorProto.ReservedRange.decode(
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
									if (!r.isString(e.name)) return "name: string expected"
								if (e.field != null && e.hasOwnProperty("field")) {
									if (!Array.isArray(e.field)) return "field: array expected"
									for (var t = 0; t < e.field.length; ++t) {
										var n = o.google.protobuf.FieldDescriptorProto.verify(
											e.field[t]
										)
										if (n) return "field." + n
									}
								}
								if (e.extension != null && e.hasOwnProperty("extension")) {
									if (!Array.isArray(e.extension))
										return "extension: array expected"
									for (var t = 0; t < e.extension.length; ++t) {
										var n = o.google.protobuf.FieldDescriptorProto.verify(
											e.extension[t]
										)
										if (n) return "extension." + n
									}
								}
								if (e.nestedType != null && e.hasOwnProperty("nestedType")) {
									if (!Array.isArray(e.nestedType))
										return "nestedType: array expected"
									for (var t = 0; t < e.nestedType.length; ++t) {
										var n = o.google.protobuf.DescriptorProto.verify(
											e.nestedType[t]
										)
										if (n) return "nestedType." + n
									}
								}
								if (e.enumType != null && e.hasOwnProperty("enumType")) {
									if (!Array.isArray(e.enumType))
										return "enumType: array expected"
									for (var t = 0; t < e.enumType.length; ++t) {
										var n = o.google.protobuf.EnumDescriptorProto.verify(
											e.enumType[t]
										)
										if (n) return "enumType." + n
									}
								}
								if (
									e.extensionRange != null &&
									e.hasOwnProperty("extensionRange")
								) {
									if (!Array.isArray(e.extensionRange))
										return "extensionRange: array expected"
									for (var t = 0; t < e.extensionRange.length; ++t) {
										var n =
											o.google.protobuf.DescriptorProto.ExtensionRange.verify(
												e.extensionRange[t]
											)
										if (n) return "extensionRange." + n
									}
								}
								if (e.oneofDecl != null && e.hasOwnProperty("oneofDecl")) {
									if (!Array.isArray(e.oneofDecl))
										return "oneofDecl: array expected"
									for (var t = 0; t < e.oneofDecl.length; ++t) {
										var n = o.google.protobuf.OneofDescriptorProto.verify(
											e.oneofDecl[t]
										)
										if (n) return "oneofDecl." + n
									}
								}
								if (e.options != null && e.hasOwnProperty("options")) {
									var n = o.google.protobuf.MessageOptions.verify(e.options)
									if (n) return "options." + n
								}
								if (
									e.reservedRange != null &&
									e.hasOwnProperty("reservedRange")
								) {
									if (!Array.isArray(e.reservedRange))
										return "reservedRange: array expected"
									for (var t = 0; t < e.reservedRange.length; ++t) {
										var n =
											o.google.protobuf.DescriptorProto.ReservedRange.verify(
												e.reservedRange[t]
											)
										if (n) return "reservedRange." + n
									}
								}
								if (
									e.reservedName != null &&
									e.hasOwnProperty("reservedName")
								) {
									if (!Array.isArray(e.reservedName))
										return "reservedName: array expected"
									for (var t = 0; t < e.reservedName.length; ++t)
										if (!r.isString(e.reservedName[t]))
											return "reservedName: string[] expected"
								}
								return null
							}
							DescriptorProto.fromObject = function fromObject(e) {
								if (e instanceof o.google.protobuf.DescriptorProto) return e
								var t = new o.google.protobuf.DescriptorProto()
								if (e.name != null) t.name = String(e.name)
								if (e.field) {
									if (!Array.isArray(e.field))
										throw TypeError(
											".google.protobuf.DescriptorProto.field: array expected"
										)
									t.field = []
									for (var n = 0; n < e.field.length; ++n) {
										if (typeof e.field[n] !== "object")
											throw TypeError(
												".google.protobuf.DescriptorProto.field: object expected"
											)
										t.field[n] =
											o.google.protobuf.FieldDescriptorProto.fromObject(
												e.field[n]
											)
									}
								}
								if (e.extension) {
									if (!Array.isArray(e.extension))
										throw TypeError(
											".google.protobuf.DescriptorProto.extension: array expected"
										)
									t.extension = []
									for (var n = 0; n < e.extension.length; ++n) {
										if (typeof e.extension[n] !== "object")
											throw TypeError(
												".google.protobuf.DescriptorProto.extension: object expected"
											)
										t.extension[n] =
											o.google.protobuf.FieldDescriptorProto.fromObject(
												e.extension[n]
											)
									}
								}
								if (e.nestedType) {
									if (!Array.isArray(e.nestedType))
										throw TypeError(
											".google.protobuf.DescriptorProto.nestedType: array expected"
										)
									t.nestedType = []
									for (var n = 0; n < e.nestedType.length; ++n) {
										if (typeof e.nestedType[n] !== "object")
											throw TypeError(
												".google.protobuf.DescriptorProto.nestedType: object expected"
											)
										t.nestedType[n] =
											o.google.protobuf.DescriptorProto.fromObject(
												e.nestedType[n]
											)
									}
								}
								if (e.enumType) {
									if (!Array.isArray(e.enumType))
										throw TypeError(
											".google.protobuf.DescriptorProto.enumType: array expected"
										)
									t.enumType = []
									for (var n = 0; n < e.enumType.length; ++n) {
										if (typeof e.enumType[n] !== "object")
											throw TypeError(
												".google.protobuf.DescriptorProto.enumType: object expected"
											)
										t.enumType[n] =
											o.google.protobuf.EnumDescriptorProto.fromObject(
												e.enumType[n]
											)
									}
								}
								if (e.extensionRange) {
									if (!Array.isArray(e.extensionRange))
										throw TypeError(
											".google.protobuf.DescriptorProto.extensionRange: array expected"
										)
									t.extensionRange = []
									for (var n = 0; n < e.extensionRange.length; ++n) {
										if (typeof e.extensionRange[n] !== "object")
											throw TypeError(
												".google.protobuf.DescriptorProto.extensionRange: object expected"
											)
										t.extensionRange[n] =
											o.google.protobuf.DescriptorProto.ExtensionRange.fromObject(
												e.extensionRange[n]
											)
									}
								}
								if (e.oneofDecl) {
									if (!Array.isArray(e.oneofDecl))
										throw TypeError(
											".google.protobuf.DescriptorProto.oneofDecl: array expected"
										)
									t.oneofDecl = []
									for (var n = 0; n < e.oneofDecl.length; ++n) {
										if (typeof e.oneofDecl[n] !== "object")
											throw TypeError(
												".google.protobuf.DescriptorProto.oneofDecl: object expected"
											)
										t.oneofDecl[n] =
											o.google.protobuf.OneofDescriptorProto.fromObject(
												e.oneofDecl[n]
											)
									}
								}
								if (e.options != null) {
									if (typeof e.options !== "object")
										throw TypeError(
											".google.protobuf.DescriptorProto.options: object expected"
										)
									t.options = o.google.protobuf.MessageOptions.fromObject(
										e.options
									)
								}
								if (e.reservedRange) {
									if (!Array.isArray(e.reservedRange))
										throw TypeError(
											".google.protobuf.DescriptorProto.reservedRange: array expected"
										)
									t.reservedRange = []
									for (var n = 0; n < e.reservedRange.length; ++n) {
										if (typeof e.reservedRange[n] !== "object")
											throw TypeError(
												".google.protobuf.DescriptorProto.reservedRange: object expected"
											)
										t.reservedRange[n] =
											o.google.protobuf.DescriptorProto.ReservedRange.fromObject(
												e.reservedRange[n]
											)
									}
								}
								if (e.reservedName) {
									if (!Array.isArray(e.reservedName))
										throw TypeError(
											".google.protobuf.DescriptorProto.reservedName: array expected"
										)
									t.reservedName = []
									for (var n = 0; n < e.reservedName.length; ++n)
										t.reservedName[n] = String(e.reservedName[n])
								}
								return t
							}
							DescriptorProto.toObject = function toObject(e, t) {
								if (!t) t = {}
								var n = {}
								if (t.arrays || t.defaults) {
									n.field = []
									n.nestedType = []
									n.enumType = []
									n.extensionRange = []
									n.extension = []
									n.oneofDecl = []
									n.reservedRange = []
									n.reservedName = []
								}
								if (t.defaults) {
									n.name = ""
									n.options = null
								}
								if (e.name != null && e.hasOwnProperty("name")) n.name = e.name
								if (e.field && e.field.length) {
									n.field = []
									for (var r = 0; r < e.field.length; ++r)
										n.field[r] =
											o.google.protobuf.FieldDescriptorProto.toObject(
												e.field[r],
												t
											)
								}
								if (e.nestedType && e.nestedType.length) {
									n.nestedType = []
									for (var r = 0; r < e.nestedType.length; ++r)
										n.nestedType[r] =
											o.google.protobuf.DescriptorProto.toObject(
												e.nestedType[r],
												t
											)
								}
								if (e.enumType && e.enumType.length) {
									n.enumType = []
									for (var r = 0; r < e.enumType.length; ++r)
										n.enumType[r] =
											o.google.protobuf.EnumDescriptorProto.toObject(
												e.enumType[r],
												t
											)
								}
								if (e.extensionRange && e.extensionRange.length) {
									n.extensionRange = []
									for (var r = 0; r < e.extensionRange.length; ++r)
										n.extensionRange[r] =
											o.google.protobuf.DescriptorProto.ExtensionRange.toObject(
												e.extensionRange[r],
												t
											)
								}
								if (e.extension && e.extension.length) {
									n.extension = []
									for (var r = 0; r < e.extension.length; ++r)
										n.extension[r] =
											o.google.protobuf.FieldDescriptorProto.toObject(
												e.extension[r],
												t
											)
								}
								if (e.options != null && e.hasOwnProperty("options"))
									n.options = o.google.protobuf.MessageOptions.toObject(
										e.options,
										t
									)
								if (e.oneofDecl && e.oneofDecl.length) {
									n.oneofDecl = []
									for (var r = 0; r < e.oneofDecl.length; ++r)
										n.oneofDecl[r] =
											o.google.protobuf.OneofDescriptorProto.toObject(
												e.oneofDecl[r],
												t
											)
								}
								if (e.reservedRange && e.reservedRange.length) {
									n.reservedRange = []
									for (var r = 0; r < e.reservedRange.length; ++r)
										n.reservedRange[r] =
											o.google.protobuf.DescriptorProto.ReservedRange.toObject(
												e.reservedRange[r],
												t
											)
								}
								if (e.reservedName && e.reservedName.length) {
									n.reservedName = []
									for (var r = 0; r < e.reservedName.length; ++r)
										n.reservedName[r] = e.reservedName[r]
								}
								return n
							}
							DescriptorProto.prototype.toJSON = function toJSON() {
								return this.constructor.toObject(this, e.util.toJSONOptions)
							}
							DescriptorProto.ExtensionRange = (function () {
								function ExtensionRange(e) {
									if (e)
										for (var t = Object.keys(e), n = 0; n < t.length; ++n)
											if (e[t[n]] != null) this[t[n]] = e[t[n]]
								}
								ExtensionRange.prototype.start = 0
								ExtensionRange.prototype.end = 0
								ExtensionRange.prototype.options = null
								ExtensionRange.create = function create(e) {
									return new ExtensionRange(e)
								}
								ExtensionRange.encode = function encode(e, t) {
									if (!t) t = n.create()
									if (e.start != null && Object.hasOwnProperty.call(e, "start"))
										t.uint32(8).int32(e.start)
									if (e.end != null && Object.hasOwnProperty.call(e, "end"))
										t.uint32(16).int32(e.end)
									if (
										e.options != null &&
										Object.hasOwnProperty.call(e, "options")
									)
										o.google.protobuf.ExtensionRangeOptions.encode(
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
								ExtensionRange.decode = function decode(e, n) {
									if (!(e instanceof t)) e = t.create(e)
									var r = n === undefined ? e.len : e.pos + n,
										i = new o.google.protobuf.DescriptorProto.ExtensionRange()
									while (e.pos < r) {
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
													o.google.protobuf.ExtensionRangeOptions.decode(
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
										if (!r.isInteger(e.start)) return "start: integer expected"
									if (e.end != null && e.hasOwnProperty("end"))
										if (!r.isInteger(e.end)) return "end: integer expected"
									if (e.options != null && e.hasOwnProperty("options")) {
										var t = o.google.protobuf.ExtensionRangeOptions.verify(
											e.options
										)
										if (t) return "options." + t
									}
									return null
								}
								ExtensionRange.fromObject = function fromObject(e) {
									if (
										e instanceof
										o.google.protobuf.DescriptorProto.ExtensionRange
									)
										return e
									var t = new o.google.protobuf.DescriptorProto.ExtensionRange()
									if (e.start != null) t.start = e.start | 0
									if (e.end != null) t.end = e.end | 0
									if (e.options != null) {
										if (typeof e.options !== "object")
											throw TypeError(
												".google.protobuf.DescriptorProto.ExtensionRange.options: object expected"
											)
										t.options =
											o.google.protobuf.ExtensionRangeOptions.fromObject(
												e.options
											)
									}
									return t
								}
								ExtensionRange.toObject = function toObject(e, t) {
									if (!t) t = {}
									var n = {}
									if (t.defaults) {
										n.start = 0
										n.end = 0
										n.options = null
									}
									if (e.start != null && e.hasOwnProperty("start"))
										n.start = e.start
									if (e.end != null && e.hasOwnProperty("end")) n.end = e.end
									if (e.options != null && e.hasOwnProperty("options"))
										n.options =
											o.google.protobuf.ExtensionRangeOptions.toObject(
												e.options,
												t
											)
									return n
								}
								ExtensionRange.prototype.toJSON = function toJSON() {
									return this.constructor.toObject(this, e.util.toJSONOptions)
								}
								return ExtensionRange
							})()
							DescriptorProto.ReservedRange = (function () {
								function ReservedRange(e) {
									if (e)
										for (var t = Object.keys(e), n = 0; n < t.length; ++n)
											if (e[t[n]] != null) this[t[n]] = e[t[n]]
								}
								ReservedRange.prototype.start = 0
								ReservedRange.prototype.end = 0
								ReservedRange.create = function create(e) {
									return new ReservedRange(e)
								}
								ReservedRange.encode = function encode(e, t) {
									if (!t) t = n.create()
									if (e.start != null && Object.hasOwnProperty.call(e, "start"))
										t.uint32(8).int32(e.start)
									if (e.end != null && Object.hasOwnProperty.call(e, "end"))
										t.uint32(16).int32(e.end)
									return t
								}
								ReservedRange.encodeDelimited = function encodeDelimited(e, t) {
									return this.encode(e, t).ldelim()
								}
								ReservedRange.decode = function decode(e, n) {
									if (!(e instanceof t)) e = t.create(e)
									var r = n === undefined ? e.len : e.pos + n,
										i = new o.google.protobuf.DescriptorProto.ReservedRange()
									while (e.pos < r) {
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
										if (!r.isInteger(e.start)) return "start: integer expected"
									if (e.end != null && e.hasOwnProperty("end"))
										if (!r.isInteger(e.end)) return "end: integer expected"
									return null
								}
								ReservedRange.fromObject = function fromObject(e) {
									if (
										e instanceof o.google.protobuf.DescriptorProto.ReservedRange
									)
										return e
									var t = new o.google.protobuf.DescriptorProto.ReservedRange()
									if (e.start != null) t.start = e.start | 0
									if (e.end != null) t.end = e.end | 0
									return t
								}
								ReservedRange.toObject = function toObject(e, t) {
									if (!t) t = {}
									var n = {}
									if (t.defaults) {
										n.start = 0
										n.end = 0
									}
									if (e.start != null && e.hasOwnProperty("start"))
										n.start = e.start
									if (e.end != null && e.hasOwnProperty("end")) n.end = e.end
									return n
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
									for (var t = Object.keys(e), n = 0; n < t.length; ++n)
										if (e[t[n]] != null) this[t[n]] = e[t[n]]
							}
							ExtensionRangeOptions.prototype.uninterpretedOption = r.emptyArray
							ExtensionRangeOptions.create = function create(e) {
								return new ExtensionRangeOptions(e)
							}
							ExtensionRangeOptions.encode = function encode(e, t) {
								if (!t) t = n.create()
								if (
									e.uninterpretedOption != null &&
									e.uninterpretedOption.length
								)
									for (var r = 0; r < e.uninterpretedOption.length; ++r)
										o.google.protobuf.UninterpretedOption.encode(
											e.uninterpretedOption[r],
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
							ExtensionRangeOptions.decode = function decode(e, n) {
								if (!(e instanceof t)) e = t.create(e)
								var r = n === undefined ? e.len : e.pos + n,
									i = new o.google.protobuf.ExtensionRangeOptions()
								while (e.pos < r) {
									var a = e.uint32()
									switch (a >>> 3) {
										case 999:
											if (
												!(i.uninterpretedOption && i.uninterpretedOption.length)
											)
												i.uninterpretedOption = []
											i.uninterpretedOption.push(
												o.google.protobuf.UninterpretedOption.decode(
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
										var n = o.google.protobuf.UninterpretedOption.verify(
											e.uninterpretedOption[t]
										)
										if (n) return "uninterpretedOption." + n
									}
								}
								return null
							}
							ExtensionRangeOptions.fromObject = function fromObject(e) {
								if (e instanceof o.google.protobuf.ExtensionRangeOptions)
									return e
								var t = new o.google.protobuf.ExtensionRangeOptions()
								if (e.uninterpretedOption) {
									if (!Array.isArray(e.uninterpretedOption))
										throw TypeError(
											".google.protobuf.ExtensionRangeOptions.uninterpretedOption: array expected"
										)
									t.uninterpretedOption = []
									for (var n = 0; n < e.uninterpretedOption.length; ++n) {
										if (typeof e.uninterpretedOption[n] !== "object")
											throw TypeError(
												".google.protobuf.ExtensionRangeOptions.uninterpretedOption: object expected"
											)
										t.uninterpretedOption[n] =
											o.google.protobuf.UninterpretedOption.fromObject(
												e.uninterpretedOption[n]
											)
									}
								}
								return t
							}
							ExtensionRangeOptions.toObject = function toObject(e, t) {
								if (!t) t = {}
								var n = {}
								if (t.arrays || t.defaults) n.uninterpretedOption = []
								if (e.uninterpretedOption && e.uninterpretedOption.length) {
									n.uninterpretedOption = []
									for (var r = 0; r < e.uninterpretedOption.length; ++r)
										n.uninterpretedOption[r] =
											o.google.protobuf.UninterpretedOption.toObject(
												e.uninterpretedOption[r],
												t
											)
								}
								return n
							}
							ExtensionRangeOptions.prototype.toJSON = function toJSON() {
								return this.constructor.toObject(this, e.util.toJSONOptions)
							}
							return ExtensionRangeOptions
						})()
						i.FieldDescriptorProto = (function () {
							function FieldDescriptorProto(e) {
								if (e)
									for (var t = Object.keys(e), n = 0; n < t.length; ++n)
										if (e[t[n]] != null) this[t[n]] = e[t[n]]
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
								if (!t) t = n.create()
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
									o.google.protobuf.FieldOptions.encode(
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
							FieldDescriptorProto.decode = function decode(e, n) {
								if (!(e instanceof t)) e = t.create(e)
								var r = n === undefined ? e.len : e.pos + n,
									i = new o.google.protobuf.FieldDescriptorProto()
								while (e.pos < r) {
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
											i.options = o.google.protobuf.FieldOptions.decode(
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
									if (!r.isString(e.name)) return "name: string expected"
								if (e.number != null && e.hasOwnProperty("number"))
									if (!r.isInteger(e.number)) return "number: integer expected"
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
									if (!r.isString(e.typeName))
										return "typeName: string expected"
								if (e.extendee != null && e.hasOwnProperty("extendee"))
									if (!r.isString(e.extendee))
										return "extendee: string expected"
								if (e.defaultValue != null && e.hasOwnProperty("defaultValue"))
									if (!r.isString(e.defaultValue))
										return "defaultValue: string expected"
								if (e.oneofIndex != null && e.hasOwnProperty("oneofIndex"))
									if (!r.isInteger(e.oneofIndex))
										return "oneofIndex: integer expected"
								if (e.jsonName != null && e.hasOwnProperty("jsonName"))
									if (!r.isString(e.jsonName))
										return "jsonName: string expected"
								if (e.options != null && e.hasOwnProperty("options")) {
									var t = o.google.protobuf.FieldOptions.verify(e.options)
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
								if (e instanceof o.google.protobuf.FieldDescriptorProto)
									return e
								var t = new o.google.protobuf.FieldDescriptorProto()
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
									t.options = o.google.protobuf.FieldOptions.fromObject(
										e.options
									)
								}
								if (e.proto3Optional != null)
									t.proto3Optional = Boolean(e.proto3Optional)
								return t
							}
							FieldDescriptorProto.toObject = function toObject(e, t) {
								if (!t) t = {}
								var n = {}
								if (t.defaults) {
									n.name = ""
									n.extendee = ""
									n.number = 0
									n.label = t.enums === String ? "LABEL_OPTIONAL" : 1
									n.type = t.enums === String ? "TYPE_DOUBLE" : 1
									n.typeName = ""
									n.defaultValue = ""
									n.options = null
									n.oneofIndex = 0
									n.jsonName = ""
									n.proto3Optional = false
								}
								if (e.name != null && e.hasOwnProperty("name")) n.name = e.name
								if (e.extendee != null && e.hasOwnProperty("extendee"))
									n.extendee = e.extendee
								if (e.number != null && e.hasOwnProperty("number"))
									n.number = e.number
								if (e.label != null && e.hasOwnProperty("label"))
									n.label =
										t.enums === String
											? o.google.protobuf.FieldDescriptorProto.Label[e.label]
											: e.label
								if (e.type != null && e.hasOwnProperty("type"))
									n.type =
										t.enums === String
											? o.google.protobuf.FieldDescriptorProto.Type[e.type]
											: e.type
								if (e.typeName != null && e.hasOwnProperty("typeName"))
									n.typeName = e.typeName
								if (e.defaultValue != null && e.hasOwnProperty("defaultValue"))
									n.defaultValue = e.defaultValue
								if (e.options != null && e.hasOwnProperty("options"))
									n.options = o.google.protobuf.FieldOptions.toObject(
										e.options,
										t
									)
								if (e.oneofIndex != null && e.hasOwnProperty("oneofIndex"))
									n.oneofIndex = e.oneofIndex
								if (e.jsonName != null && e.hasOwnProperty("jsonName"))
									n.jsonName = e.jsonName
								if (
									e.proto3Optional != null &&
									e.hasOwnProperty("proto3Optional")
								)
									n.proto3Optional = e.proto3Optional
								return n
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
									for (var t = Object.keys(e), n = 0; n < t.length; ++n)
										if (e[t[n]] != null) this[t[n]] = e[t[n]]
							}
							OneofDescriptorProto.prototype.name = ""
							OneofDescriptorProto.prototype.options = null
							OneofDescriptorProto.create = function create(e) {
								return new OneofDescriptorProto(e)
							}
							OneofDescriptorProto.encode = function encode(e, t) {
								if (!t) t = n.create()
								if (e.name != null && Object.hasOwnProperty.call(e, "name"))
									t.uint32(10).string(e.name)
								if (
									e.options != null &&
									Object.hasOwnProperty.call(e, "options")
								)
									o.google.protobuf.OneofOptions.encode(
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
							OneofDescriptorProto.decode = function decode(e, n) {
								if (!(e instanceof t)) e = t.create(e)
								var r = n === undefined ? e.len : e.pos + n,
									i = new o.google.protobuf.OneofDescriptorProto()
								while (e.pos < r) {
									var a = e.uint32()
									switch (a >>> 3) {
										case 1:
											i.name = e.string()
											break
										case 2:
											i.options = o.google.protobuf.OneofOptions.decode(
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
									if (!r.isString(e.name)) return "name: string expected"
								if (e.options != null && e.hasOwnProperty("options")) {
									var t = o.google.protobuf.OneofOptions.verify(e.options)
									if (t) return "options." + t
								}
								return null
							}
							OneofDescriptorProto.fromObject = function fromObject(e) {
								if (e instanceof o.google.protobuf.OneofDescriptorProto)
									return e
								var t = new o.google.protobuf.OneofDescriptorProto()
								if (e.name != null) t.name = String(e.name)
								if (e.options != null) {
									if (typeof e.options !== "object")
										throw TypeError(
											".google.protobuf.OneofDescriptorProto.options: object expected"
										)
									t.options = o.google.protobuf.OneofOptions.fromObject(
										e.options
									)
								}
								return t
							}
							OneofDescriptorProto.toObject = function toObject(e, t) {
								if (!t) t = {}
								var n = {}
								if (t.defaults) {
									n.name = ""
									n.options = null
								}
								if (e.name != null && e.hasOwnProperty("name")) n.name = e.name
								if (e.options != null && e.hasOwnProperty("options"))
									n.options = o.google.protobuf.OneofOptions.toObject(
										e.options,
										t
									)
								return n
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
									for (var t = Object.keys(e), n = 0; n < t.length; ++n)
										if (e[t[n]] != null) this[t[n]] = e[t[n]]
							}
							EnumDescriptorProto.prototype.name = ""
							EnumDescriptorProto.prototype.value = r.emptyArray
							EnumDescriptorProto.prototype.options = null
							EnumDescriptorProto.prototype.reservedRange = r.emptyArray
							EnumDescriptorProto.prototype.reservedName = r.emptyArray
							EnumDescriptorProto.create = function create(e) {
								return new EnumDescriptorProto(e)
							}
							EnumDescriptorProto.encode = function encode(e, t) {
								if (!t) t = n.create()
								if (e.name != null && Object.hasOwnProperty.call(e, "name"))
									t.uint32(10).string(e.name)
								if (e.value != null && e.value.length)
									for (var r = 0; r < e.value.length; ++r)
										o.google.protobuf.EnumValueDescriptorProto.encode(
											e.value[r],
											t.uint32(18).fork()
										).ldelim()
								if (
									e.options != null &&
									Object.hasOwnProperty.call(e, "options")
								)
									o.google.protobuf.EnumOptions.encode(
										e.options,
										t.uint32(26).fork()
									).ldelim()
								if (e.reservedRange != null && e.reservedRange.length)
									for (var r = 0; r < e.reservedRange.length; ++r)
										o.google.protobuf.EnumDescriptorProto.EnumReservedRange.encode(
											e.reservedRange[r],
											t.uint32(34).fork()
										).ldelim()
								if (e.reservedName != null && e.reservedName.length)
									for (var r = 0; r < e.reservedName.length; ++r)
										t.uint32(42).string(e.reservedName[r])
								return t
							}
							EnumDescriptorProto.encodeDelimited = function encodeDelimited(
								e,
								t
							) {
								return this.encode(e, t).ldelim()
							}
							EnumDescriptorProto.decode = function decode(e, n) {
								if (!(e instanceof t)) e = t.create(e)
								var r = n === undefined ? e.len : e.pos + n,
									i = new o.google.protobuf.EnumDescriptorProto()
								while (e.pos < r) {
									var a = e.uint32()
									switch (a >>> 3) {
										case 1:
											i.name = e.string()
											break
										case 2:
											if (!(i.value && i.value.length)) i.value = []
											i.value.push(
												o.google.protobuf.EnumValueDescriptorProto.decode(
													e,
													e.uint32()
												)
											)
											break
										case 3:
											i.options = o.google.protobuf.EnumOptions.decode(
												e,
												e.uint32()
											)
											break
										case 4:
											if (!(i.reservedRange && i.reservedRange.length))
												i.reservedRange = []
											i.reservedRange.push(
												o.google.protobuf.EnumDescriptorProto.EnumReservedRange.decode(
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
									if (!r.isString(e.name)) return "name: string expected"
								if (e.value != null && e.hasOwnProperty("value")) {
									if (!Array.isArray(e.value)) return "value: array expected"
									for (var t = 0; t < e.value.length; ++t) {
										var n = o.google.protobuf.EnumValueDescriptorProto.verify(
											e.value[t]
										)
										if (n) return "value." + n
									}
								}
								if (e.options != null && e.hasOwnProperty("options")) {
									var n = o.google.protobuf.EnumOptions.verify(e.options)
									if (n) return "options." + n
								}
								if (
									e.reservedRange != null &&
									e.hasOwnProperty("reservedRange")
								) {
									if (!Array.isArray(e.reservedRange))
										return "reservedRange: array expected"
									for (var t = 0; t < e.reservedRange.length; ++t) {
										var n =
											o.google.protobuf.EnumDescriptorProto.EnumReservedRange.verify(
												e.reservedRange[t]
											)
										if (n) return "reservedRange." + n
									}
								}
								if (
									e.reservedName != null &&
									e.hasOwnProperty("reservedName")
								) {
									if (!Array.isArray(e.reservedName))
										return "reservedName: array expected"
									for (var t = 0; t < e.reservedName.length; ++t)
										if (!r.isString(e.reservedName[t]))
											return "reservedName: string[] expected"
								}
								return null
							}
							EnumDescriptorProto.fromObject = function fromObject(e) {
								if (e instanceof o.google.protobuf.EnumDescriptorProto) return e
								var t = new o.google.protobuf.EnumDescriptorProto()
								if (e.name != null) t.name = String(e.name)
								if (e.value) {
									if (!Array.isArray(e.value))
										throw TypeError(
											".google.protobuf.EnumDescriptorProto.value: array expected"
										)
									t.value = []
									for (var n = 0; n < e.value.length; ++n) {
										if (typeof e.value[n] !== "object")
											throw TypeError(
												".google.protobuf.EnumDescriptorProto.value: object expected"
											)
										t.value[n] =
											o.google.protobuf.EnumValueDescriptorProto.fromObject(
												e.value[n]
											)
									}
								}
								if (e.options != null) {
									if (typeof e.options !== "object")
										throw TypeError(
											".google.protobuf.EnumDescriptorProto.options: object expected"
										)
									t.options = o.google.protobuf.EnumOptions.fromObject(
										e.options
									)
								}
								if (e.reservedRange) {
									if (!Array.isArray(e.reservedRange))
										throw TypeError(
											".google.protobuf.EnumDescriptorProto.reservedRange: array expected"
										)
									t.reservedRange = []
									for (var n = 0; n < e.reservedRange.length; ++n) {
										if (typeof e.reservedRange[n] !== "object")
											throw TypeError(
												".google.protobuf.EnumDescriptorProto.reservedRange: object expected"
											)
										t.reservedRange[n] =
											o.google.protobuf.EnumDescriptorProto.EnumReservedRange.fromObject(
												e.reservedRange[n]
											)
									}
								}
								if (e.reservedName) {
									if (!Array.isArray(e.reservedName))
										throw TypeError(
											".google.protobuf.EnumDescriptorProto.reservedName: array expected"
										)
									t.reservedName = []
									for (var n = 0; n < e.reservedName.length; ++n)
										t.reservedName[n] = String(e.reservedName[n])
								}
								return t
							}
							EnumDescriptorProto.toObject = function toObject(e, t) {
								if (!t) t = {}
								var n = {}
								if (t.arrays || t.defaults) {
									n.value = []
									n.reservedRange = []
									n.reservedName = []
								}
								if (t.defaults) {
									n.name = ""
									n.options = null
								}
								if (e.name != null && e.hasOwnProperty("name")) n.name = e.name
								if (e.value && e.value.length) {
									n.value = []
									for (var r = 0; r < e.value.length; ++r)
										n.value[r] =
											o.google.protobuf.EnumValueDescriptorProto.toObject(
												e.value[r],
												t
											)
								}
								if (e.options != null && e.hasOwnProperty("options"))
									n.options = o.google.protobuf.EnumOptions.toObject(
										e.options,
										t
									)
								if (e.reservedRange && e.reservedRange.length) {
									n.reservedRange = []
									for (var r = 0; r < e.reservedRange.length; ++r)
										n.reservedRange[r] =
											o.google.protobuf.EnumDescriptorProto.EnumReservedRange.toObject(
												e.reservedRange[r],
												t
											)
								}
								if (e.reservedName && e.reservedName.length) {
									n.reservedName = []
									for (var r = 0; r < e.reservedName.length; ++r)
										n.reservedName[r] = e.reservedName[r]
								}
								return n
							}
							EnumDescriptorProto.prototype.toJSON = function toJSON() {
								return this.constructor.toObject(this, e.util.toJSONOptions)
							}
							EnumDescriptorProto.EnumReservedRange = (function () {
								function EnumReservedRange(e) {
									if (e)
										for (var t = Object.keys(e), n = 0; n < t.length; ++n)
											if (e[t[n]] != null) this[t[n]] = e[t[n]]
								}
								EnumReservedRange.prototype.start = 0
								EnumReservedRange.prototype.end = 0
								EnumReservedRange.create = function create(e) {
									return new EnumReservedRange(e)
								}
								EnumReservedRange.encode = function encode(e, t) {
									if (!t) t = n.create()
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
								EnumReservedRange.decode = function decode(e, n) {
									if (!(e instanceof t)) e = t.create(e)
									var r = n === undefined ? e.len : e.pos + n,
										i =
											new o.google.protobuf.EnumDescriptorProto.EnumReservedRange()
									while (e.pos < r) {
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
										if (!r.isInteger(e.start)) return "start: integer expected"
									if (e.end != null && e.hasOwnProperty("end"))
										if (!r.isInteger(e.end)) return "end: integer expected"
									return null
								}
								EnumReservedRange.fromObject = function fromObject(e) {
									if (
										e instanceof
										o.google.protobuf.EnumDescriptorProto.EnumReservedRange
									)
										return e
									var t =
										new o.google.protobuf.EnumDescriptorProto.EnumReservedRange()
									if (e.start != null) t.start = e.start | 0
									if (e.end != null) t.end = e.end | 0
									return t
								}
								EnumReservedRange.toObject = function toObject(e, t) {
									if (!t) t = {}
									var n = {}
									if (t.defaults) {
										n.start = 0
										n.end = 0
									}
									if (e.start != null && e.hasOwnProperty("start"))
										n.start = e.start
									if (e.end != null && e.hasOwnProperty("end")) n.end = e.end
									return n
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
									for (var t = Object.keys(e), n = 0; n < t.length; ++n)
										if (e[t[n]] != null) this[t[n]] = e[t[n]]
							}
							EnumValueDescriptorProto.prototype.name = ""
							EnumValueDescriptorProto.prototype.number = 0
							EnumValueDescriptorProto.prototype.options = null
							EnumValueDescriptorProto.create = function create(e) {
								return new EnumValueDescriptorProto(e)
							}
							EnumValueDescriptorProto.encode = function encode(e, t) {
								if (!t) t = n.create()
								if (e.name != null && Object.hasOwnProperty.call(e, "name"))
									t.uint32(10).string(e.name)
								if (e.number != null && Object.hasOwnProperty.call(e, "number"))
									t.uint32(16).int32(e.number)
								if (
									e.options != null &&
									Object.hasOwnProperty.call(e, "options")
								)
									o.google.protobuf.EnumValueOptions.encode(
										e.options,
										t.uint32(26).fork()
									).ldelim()
								return t
							}
							EnumValueDescriptorProto.encodeDelimited =
								function encodeDelimited(e, t) {
									return this.encode(e, t).ldelim()
								}
							EnumValueDescriptorProto.decode = function decode(e, n) {
								if (!(e instanceof t)) e = t.create(e)
								var r = n === undefined ? e.len : e.pos + n,
									i = new o.google.protobuf.EnumValueDescriptorProto()
								while (e.pos < r) {
									var a = e.uint32()
									switch (a >>> 3) {
										case 1:
											i.name = e.string()
											break
										case 2:
											i.number = e.int32()
											break
										case 3:
											i.options = o.google.protobuf.EnumValueOptions.decode(
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
									if (!r.isString(e.name)) return "name: string expected"
								if (e.number != null && e.hasOwnProperty("number"))
									if (!r.isInteger(e.number)) return "number: integer expected"
								if (e.options != null && e.hasOwnProperty("options")) {
									var t = o.google.protobuf.EnumValueOptions.verify(e.options)
									if (t) return "options." + t
								}
								return null
							}
							EnumValueDescriptorProto.fromObject = function fromObject(e) {
								if (e instanceof o.google.protobuf.EnumValueDescriptorProto)
									return e
								var t = new o.google.protobuf.EnumValueDescriptorProto()
								if (e.name != null) t.name = String(e.name)
								if (e.number != null) t.number = e.number | 0
								if (e.options != null) {
									if (typeof e.options !== "object")
										throw TypeError(
											".google.protobuf.EnumValueDescriptorProto.options: object expected"
										)
									t.options = o.google.protobuf.EnumValueOptions.fromObject(
										e.options
									)
								}
								return t
							}
							EnumValueDescriptorProto.toObject = function toObject(e, t) {
								if (!t) t = {}
								var n = {}
								if (t.defaults) {
									n.name = ""
									n.number = 0
									n.options = null
								}
								if (e.name != null && e.hasOwnProperty("name")) n.name = e.name
								if (e.number != null && e.hasOwnProperty("number"))
									n.number = e.number
								if (e.options != null && e.hasOwnProperty("options"))
									n.options = o.google.protobuf.EnumValueOptions.toObject(
										e.options,
										t
									)
								return n
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
									for (var t = Object.keys(e), n = 0; n < t.length; ++n)
										if (e[t[n]] != null) this[t[n]] = e[t[n]]
							}
							ServiceDescriptorProto.prototype.name = ""
							ServiceDescriptorProto.prototype.method = r.emptyArray
							ServiceDescriptorProto.prototype.options = null
							ServiceDescriptorProto.create = function create(e) {
								return new ServiceDescriptorProto(e)
							}
							ServiceDescriptorProto.encode = function encode(e, t) {
								if (!t) t = n.create()
								if (e.name != null && Object.hasOwnProperty.call(e, "name"))
									t.uint32(10).string(e.name)
								if (e.method != null && e.method.length)
									for (var r = 0; r < e.method.length; ++r)
										o.google.protobuf.MethodDescriptorProto.encode(
											e.method[r],
											t.uint32(18).fork()
										).ldelim()
								if (
									e.options != null &&
									Object.hasOwnProperty.call(e, "options")
								)
									o.google.protobuf.ServiceOptions.encode(
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
							ServiceDescriptorProto.decode = function decode(e, n) {
								if (!(e instanceof t)) e = t.create(e)
								var r = n === undefined ? e.len : e.pos + n,
									i = new o.google.protobuf.ServiceDescriptorProto()
								while (e.pos < r) {
									var a = e.uint32()
									switch (a >>> 3) {
										case 1:
											i.name = e.string()
											break
										case 2:
											if (!(i.method && i.method.length)) i.method = []
											i.method.push(
												o.google.protobuf.MethodDescriptorProto.decode(
													e,
													e.uint32()
												)
											)
											break
										case 3:
											i.options = o.google.protobuf.ServiceOptions.decode(
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
									if (!r.isString(e.name)) return "name: string expected"
								if (e.method != null && e.hasOwnProperty("method")) {
									if (!Array.isArray(e.method)) return "method: array expected"
									for (var t = 0; t < e.method.length; ++t) {
										var n = o.google.protobuf.MethodDescriptorProto.verify(
											e.method[t]
										)
										if (n) return "method." + n
									}
								}
								if (e.options != null && e.hasOwnProperty("options")) {
									var n = o.google.protobuf.ServiceOptions.verify(e.options)
									if (n) return "options." + n
								}
								return null
							}
							ServiceDescriptorProto.fromObject = function fromObject(e) {
								if (e instanceof o.google.protobuf.ServiceDescriptorProto)
									return e
								var t = new o.google.protobuf.ServiceDescriptorProto()
								if (e.name != null) t.name = String(e.name)
								if (e.method) {
									if (!Array.isArray(e.method))
										throw TypeError(
											".google.protobuf.ServiceDescriptorProto.method: array expected"
										)
									t.method = []
									for (var n = 0; n < e.method.length; ++n) {
										if (typeof e.method[n] !== "object")
											throw TypeError(
												".google.protobuf.ServiceDescriptorProto.method: object expected"
											)
										t.method[n] =
											o.google.protobuf.MethodDescriptorProto.fromObject(
												e.method[n]
											)
									}
								}
								if (e.options != null) {
									if (typeof e.options !== "object")
										throw TypeError(
											".google.protobuf.ServiceDescriptorProto.options: object expected"
										)
									t.options = o.google.protobuf.ServiceOptions.fromObject(
										e.options
									)
								}
								return t
							}
							ServiceDescriptorProto.toObject = function toObject(e, t) {
								if (!t) t = {}
								var n = {}
								if (t.arrays || t.defaults) n.method = []
								if (t.defaults) {
									n.name = ""
									n.options = null
								}
								if (e.name != null && e.hasOwnProperty("name")) n.name = e.name
								if (e.method && e.method.length) {
									n.method = []
									for (var r = 0; r < e.method.length; ++r)
										n.method[r] =
											o.google.protobuf.MethodDescriptorProto.toObject(
												e.method[r],
												t
											)
								}
								if (e.options != null && e.hasOwnProperty("options"))
									n.options = o.google.protobuf.ServiceOptions.toObject(
										e.options,
										t
									)
								return n
							}
							ServiceDescriptorProto.prototype.toJSON = function toJSON() {
								return this.constructor.toObject(this, e.util.toJSONOptions)
							}
							return ServiceDescriptorProto
						})()
						i.MethodDescriptorProto = (function () {
							function MethodDescriptorProto(e) {
								if (e)
									for (var t = Object.keys(e), n = 0; n < t.length; ++n)
										if (e[t[n]] != null) this[t[n]] = e[t[n]]
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
								if (!t) t = n.create()
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
									o.google.protobuf.MethodOptions.encode(
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
							MethodDescriptorProto.decode = function decode(e, n) {
								if (!(e instanceof t)) e = t.create(e)
								var r = n === undefined ? e.len : e.pos + n,
									i = new o.google.protobuf.MethodDescriptorProto()
								while (e.pos < r) {
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
											i.options = o.google.protobuf.MethodOptions.decode(
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
									if (!r.isString(e.name)) return "name: string expected"
								if (e.inputType != null && e.hasOwnProperty("inputType"))
									if (!r.isString(e.inputType))
										return "inputType: string expected"
								if (e.outputType != null && e.hasOwnProperty("outputType"))
									if (!r.isString(e.outputType))
										return "outputType: string expected"
								if (e.options != null && e.hasOwnProperty("options")) {
									var t = o.google.protobuf.MethodOptions.verify(e.options)
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
								if (e instanceof o.google.protobuf.MethodDescriptorProto)
									return e
								var t = new o.google.protobuf.MethodDescriptorProto()
								if (e.name != null) t.name = String(e.name)
								if (e.inputType != null) t.inputType = String(e.inputType)
								if (e.outputType != null) t.outputType = String(e.outputType)
								if (e.options != null) {
									if (typeof e.options !== "object")
										throw TypeError(
											".google.protobuf.MethodDescriptorProto.options: object expected"
										)
									t.options = o.google.protobuf.MethodOptions.fromObject(
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
								var n = {}
								if (t.defaults) {
									n.name = ""
									n.inputType = ""
									n.outputType = ""
									n.options = null
									n.clientStreaming = false
									n.serverStreaming = false
								}
								if (e.name != null && e.hasOwnProperty("name")) n.name = e.name
								if (e.inputType != null && e.hasOwnProperty("inputType"))
									n.inputType = e.inputType
								if (e.outputType != null && e.hasOwnProperty("outputType"))
									n.outputType = e.outputType
								if (e.options != null && e.hasOwnProperty("options"))
									n.options = o.google.protobuf.MethodOptions.toObject(
										e.options,
										t
									)
								if (
									e.clientStreaming != null &&
									e.hasOwnProperty("clientStreaming")
								)
									n.clientStreaming = e.clientStreaming
								if (
									e.serverStreaming != null &&
									e.hasOwnProperty("serverStreaming")
								)
									n.serverStreaming = e.serverStreaming
								return n
							}
							MethodDescriptorProto.prototype.toJSON = function toJSON() {
								return this.constructor.toObject(this, e.util.toJSONOptions)
							}
							return MethodDescriptorProto
						})()
						i.FileOptions = (function () {
							function FileOptions(e) {
								this.uninterpretedOption = []
								if (e)
									for (var t = Object.keys(e), n = 0; n < t.length; ++n)
										if (e[t[n]] != null) this[t[n]] = e[t[n]]
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
							FileOptions.prototype.uninterpretedOption = r.emptyArray
							FileOptions.create = function create(e) {
								return new FileOptions(e)
							}
							FileOptions.encode = function encode(e, t) {
								if (!t) t = n.create()
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
									for (var r = 0; r < e.uninterpretedOption.length; ++r)
										o.google.protobuf.UninterpretedOption.encode(
											e.uninterpretedOption[r],
											t.uint32(7994).fork()
										).ldelim()
								return t
							}
							FileOptions.encodeDelimited = function encodeDelimited(e, t) {
								return this.encode(e, t).ldelim()
							}
							FileOptions.decode = function decode(e, n) {
								if (!(e instanceof t)) e = t.create(e)
								var r = n === undefined ? e.len : e.pos + n,
									i = new o.google.protobuf.FileOptions()
								while (e.pos < r) {
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
												o.google.protobuf.UninterpretedOption.decode(
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
							FileOptions.decodeDelimited = function decodeDelimited(e) {
								if (!(e instanceof t)) e = new t(e)
								return this.decode(e, e.uint32())
							}
							FileOptions.verify = function verify(e) {
								if (typeof e !== "object" || e === null)
									return "object expected"
								if (e.javaPackage != null && e.hasOwnProperty("javaPackage"))
									if (!r.isString(e.javaPackage))
										return "javaPackage: string expected"
								if (
									e.javaOuterClassname != null &&
									e.hasOwnProperty("javaOuterClassname")
								)
									if (!r.isString(e.javaOuterClassname))
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
									if (!r.isString(e.goPackage))
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
									if (!r.isString(e.objcClassPrefix))
										return "objcClassPrefix: string expected"
								if (
									e.csharpNamespace != null &&
									e.hasOwnProperty("csharpNamespace")
								)
									if (!r.isString(e.csharpNamespace))
										return "csharpNamespace: string expected"
								if (e.swiftPrefix != null && e.hasOwnProperty("swiftPrefix"))
									if (!r.isString(e.swiftPrefix))
										return "swiftPrefix: string expected"
								if (
									e.phpClassPrefix != null &&
									e.hasOwnProperty("phpClassPrefix")
								)
									if (!r.isString(e.phpClassPrefix))
										return "phpClassPrefix: string expected"
								if (e.phpNamespace != null && e.hasOwnProperty("phpNamespace"))
									if (!r.isString(e.phpNamespace))
										return "phpNamespace: string expected"
								if (
									e.phpMetadataNamespace != null &&
									e.hasOwnProperty("phpMetadataNamespace")
								)
									if (!r.isString(e.phpMetadataNamespace))
										return "phpMetadataNamespace: string expected"
								if (e.rubyPackage != null && e.hasOwnProperty("rubyPackage"))
									if (!r.isString(e.rubyPackage))
										return "rubyPackage: string expected"
								if (
									e.uninterpretedOption != null &&
									e.hasOwnProperty("uninterpretedOption")
								) {
									if (!Array.isArray(e.uninterpretedOption))
										return "uninterpretedOption: array expected"
									for (var t = 0; t < e.uninterpretedOption.length; ++t) {
										var n = o.google.protobuf.UninterpretedOption.verify(
											e.uninterpretedOption[t]
										)
										if (n) return "uninterpretedOption." + n
									}
								}
								return null
							}
							FileOptions.fromObject = function fromObject(e) {
								if (e instanceof o.google.protobuf.FileOptions) return e
								var t = new o.google.protobuf.FileOptions()
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
									for (var n = 0; n < e.uninterpretedOption.length; ++n) {
										if (typeof e.uninterpretedOption[n] !== "object")
											throw TypeError(
												".google.protobuf.FileOptions.uninterpretedOption: object expected"
											)
										t.uninterpretedOption[n] =
											o.google.protobuf.UninterpretedOption.fromObject(
												e.uninterpretedOption[n]
											)
									}
								}
								return t
							}
							FileOptions.toObject = function toObject(e, t) {
								if (!t) t = {}
								var n = {}
								if (t.arrays || t.defaults) n.uninterpretedOption = []
								if (t.defaults) {
									n.javaPackage = ""
									n.javaOuterClassname = ""
									n.optimizeFor = t.enums === String ? "SPEED" : 1
									n.javaMultipleFiles = false
									n.goPackage = ""
									n.ccGenericServices = false
									n.javaGenericServices = false
									n.pyGenericServices = false
									n.javaGenerateEqualsAndHash = false
									n.deprecated = false
									n.javaStringCheckUtf8 = false
									n.ccEnableArenas = true
									n.objcClassPrefix = ""
									n.csharpNamespace = ""
									n.swiftPrefix = ""
									n.phpClassPrefix = ""
									n.phpNamespace = ""
									n.phpGenericServices = false
									n.phpMetadataNamespace = ""
									n.rubyPackage = ""
								}
								if (e.javaPackage != null && e.hasOwnProperty("javaPackage"))
									n.javaPackage = e.javaPackage
								if (
									e.javaOuterClassname != null &&
									e.hasOwnProperty("javaOuterClassname")
								)
									n.javaOuterClassname = e.javaOuterClassname
								if (e.optimizeFor != null && e.hasOwnProperty("optimizeFor"))
									n.optimizeFor =
										t.enums === String
											? o.google.protobuf.FileOptions.OptimizeMode[
													e.optimizeFor
											  ]
											: e.optimizeFor
								if (
									e.javaMultipleFiles != null &&
									e.hasOwnProperty("javaMultipleFiles")
								)
									n.javaMultipleFiles = e.javaMultipleFiles
								if (e.goPackage != null && e.hasOwnProperty("goPackage"))
									n.goPackage = e.goPackage
								if (
									e.ccGenericServices != null &&
									e.hasOwnProperty("ccGenericServices")
								)
									n.ccGenericServices = e.ccGenericServices
								if (
									e.javaGenericServices != null &&
									e.hasOwnProperty("javaGenericServices")
								)
									n.javaGenericServices = e.javaGenericServices
								if (
									e.pyGenericServices != null &&
									e.hasOwnProperty("pyGenericServices")
								)
									n.pyGenericServices = e.pyGenericServices
								if (
									e.javaGenerateEqualsAndHash != null &&
									e.hasOwnProperty("javaGenerateEqualsAndHash")
								)
									n.javaGenerateEqualsAndHash = e.javaGenerateEqualsAndHash
								if (e.deprecated != null && e.hasOwnProperty("deprecated"))
									n.deprecated = e.deprecated
								if (
									e.javaStringCheckUtf8 != null &&
									e.hasOwnProperty("javaStringCheckUtf8")
								)
									n.javaStringCheckUtf8 = e.javaStringCheckUtf8
								if (
									e.ccEnableArenas != null &&
									e.hasOwnProperty("ccEnableArenas")
								)
									n.ccEnableArenas = e.ccEnableArenas
								if (
									e.objcClassPrefix != null &&
									e.hasOwnProperty("objcClassPrefix")
								)
									n.objcClassPrefix = e.objcClassPrefix
								if (
									e.csharpNamespace != null &&
									e.hasOwnProperty("csharpNamespace")
								)
									n.csharpNamespace = e.csharpNamespace
								if (e.swiftPrefix != null && e.hasOwnProperty("swiftPrefix"))
									n.swiftPrefix = e.swiftPrefix
								if (
									e.phpClassPrefix != null &&
									e.hasOwnProperty("phpClassPrefix")
								)
									n.phpClassPrefix = e.phpClassPrefix
								if (e.phpNamespace != null && e.hasOwnProperty("phpNamespace"))
									n.phpNamespace = e.phpNamespace
								if (
									e.phpGenericServices != null &&
									e.hasOwnProperty("phpGenericServices")
								)
									n.phpGenericServices = e.phpGenericServices
								if (
									e.phpMetadataNamespace != null &&
									e.hasOwnProperty("phpMetadataNamespace")
								)
									n.phpMetadataNamespace = e.phpMetadataNamespace
								if (e.rubyPackage != null && e.hasOwnProperty("rubyPackage"))
									n.rubyPackage = e.rubyPackage
								if (e.uninterpretedOption && e.uninterpretedOption.length) {
									n.uninterpretedOption = []
									for (var r = 0; r < e.uninterpretedOption.length; ++r)
										n.uninterpretedOption[r] =
											o.google.protobuf.UninterpretedOption.toObject(
												e.uninterpretedOption[r],
												t
											)
								}
								return n
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
									for (var t = Object.keys(e), n = 0; n < t.length; ++n)
										if (e[t[n]] != null) this[t[n]] = e[t[n]]
							}
							MessageOptions.prototype.messageSetWireFormat = false
							MessageOptions.prototype.noStandardDescriptorAccessor = false
							MessageOptions.prototype.deprecated = false
							MessageOptions.prototype.mapEntry = false
							MessageOptions.prototype.uninterpretedOption = r.emptyArray
							MessageOptions.create = function create(e) {
								return new MessageOptions(e)
							}
							MessageOptions.encode = function encode(e, t) {
								if (!t) t = n.create()
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
									for (var r = 0; r < e.uninterpretedOption.length; ++r)
										o.google.protobuf.UninterpretedOption.encode(
											e.uninterpretedOption[r],
											t.uint32(7994).fork()
										).ldelim()
								return t
							}
							MessageOptions.encodeDelimited = function encodeDelimited(e, t) {
								return this.encode(e, t).ldelim()
							}
							MessageOptions.decode = function decode(e, n) {
								if (!(e instanceof t)) e = t.create(e)
								var r = n === undefined ? e.len : e.pos + n,
									i = new o.google.protobuf.MessageOptions()
								while (e.pos < r) {
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
												o.google.protobuf.UninterpretedOption.decode(
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
										var n = o.google.protobuf.UninterpretedOption.verify(
											e.uninterpretedOption[t]
										)
										if (n) return "uninterpretedOption." + n
									}
								}
								return null
							}
							MessageOptions.fromObject = function fromObject(e) {
								if (e instanceof o.google.protobuf.MessageOptions) return e
								var t = new o.google.protobuf.MessageOptions()
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
									for (var n = 0; n < e.uninterpretedOption.length; ++n) {
										if (typeof e.uninterpretedOption[n] !== "object")
											throw TypeError(
												".google.protobuf.MessageOptions.uninterpretedOption: object expected"
											)
										t.uninterpretedOption[n] =
											o.google.protobuf.UninterpretedOption.fromObject(
												e.uninterpretedOption[n]
											)
									}
								}
								return t
							}
							MessageOptions.toObject = function toObject(e, t) {
								if (!t) t = {}
								var n = {}
								if (t.arrays || t.defaults) n.uninterpretedOption = []
								if (t.defaults) {
									n.messageSetWireFormat = false
									n.noStandardDescriptorAccessor = false
									n.deprecated = false
									n.mapEntry = false
								}
								if (
									e.messageSetWireFormat != null &&
									e.hasOwnProperty("messageSetWireFormat")
								)
									n.messageSetWireFormat = e.messageSetWireFormat
								if (
									e.noStandardDescriptorAccessor != null &&
									e.hasOwnProperty("noStandardDescriptorAccessor")
								)
									n.noStandardDescriptorAccessor =
										e.noStandardDescriptorAccessor
								if (e.deprecated != null && e.hasOwnProperty("deprecated"))
									n.deprecated = e.deprecated
								if (e.mapEntry != null && e.hasOwnProperty("mapEntry"))
									n.mapEntry = e.mapEntry
								if (e.uninterpretedOption && e.uninterpretedOption.length) {
									n.uninterpretedOption = []
									for (var r = 0; r < e.uninterpretedOption.length; ++r)
										n.uninterpretedOption[r] =
											o.google.protobuf.UninterpretedOption.toObject(
												e.uninterpretedOption[r],
												t
											)
								}
								return n
							}
							MessageOptions.prototype.toJSON = function toJSON() {
								return this.constructor.toObject(this, e.util.toJSONOptions)
							}
							return MessageOptions
						})()
						i.FieldOptions = (function () {
							function FieldOptions(e) {
								this.uninterpretedOption = []
								if (e)
									for (var t = Object.keys(e), n = 0; n < t.length; ++n)
										if (e[t[n]] != null) this[t[n]] = e[t[n]]
							}
							FieldOptions.prototype.ctype = 0
							FieldOptions.prototype.packed = false
							FieldOptions.prototype.jstype = 0
							FieldOptions.prototype.lazy = false
							FieldOptions.prototype.deprecated = false
							FieldOptions.prototype.weak = false
							FieldOptions.prototype.uninterpretedOption = r.emptyArray
							FieldOptions.create = function create(e) {
								return new FieldOptions(e)
							}
							FieldOptions.encode = function encode(e, t) {
								if (!t) t = n.create()
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
									for (var r = 0; r < e.uninterpretedOption.length; ++r)
										o.google.protobuf.UninterpretedOption.encode(
											e.uninterpretedOption[r],
											t.uint32(7994).fork()
										).ldelim()
								return t
							}
							FieldOptions.encodeDelimited = function encodeDelimited(e, t) {
								return this.encode(e, t).ldelim()
							}
							FieldOptions.decode = function decode(e, n) {
								if (!(e instanceof t)) e = t.create(e)
								var r = n === undefined ? e.len : e.pos + n,
									i = new o.google.protobuf.FieldOptions()
								while (e.pos < r) {
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
												o.google.protobuf.UninterpretedOption.decode(
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
										var n = o.google.protobuf.UninterpretedOption.verify(
											e.uninterpretedOption[t]
										)
										if (n) return "uninterpretedOption." + n
									}
								}
								return null
							}
							FieldOptions.fromObject = function fromObject(e) {
								if (e instanceof o.google.protobuf.FieldOptions) return e
								var t = new o.google.protobuf.FieldOptions()
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
									for (var n = 0; n < e.uninterpretedOption.length; ++n) {
										if (typeof e.uninterpretedOption[n] !== "object")
											throw TypeError(
												".google.protobuf.FieldOptions.uninterpretedOption: object expected"
											)
										t.uninterpretedOption[n] =
											o.google.protobuf.UninterpretedOption.fromObject(
												e.uninterpretedOption[n]
											)
									}
								}
								return t
							}
							FieldOptions.toObject = function toObject(e, t) {
								if (!t) t = {}
								var n = {}
								if (t.arrays || t.defaults) n.uninterpretedOption = []
								if (t.defaults) {
									n.ctype = t.enums === String ? "STRING" : 0
									n.packed = false
									n.deprecated = false
									n.lazy = false
									n.jstype = t.enums === String ? "JS_NORMAL" : 0
									n.weak = false
								}
								if (e.ctype != null && e.hasOwnProperty("ctype"))
									n.ctype =
										t.enums === String
											? o.google.protobuf.FieldOptions.CType[e.ctype]
											: e.ctype
								if (e.packed != null && e.hasOwnProperty("packed"))
									n.packed = e.packed
								if (e.deprecated != null && e.hasOwnProperty("deprecated"))
									n.deprecated = e.deprecated
								if (e.lazy != null && e.hasOwnProperty("lazy")) n.lazy = e.lazy
								if (e.jstype != null && e.hasOwnProperty("jstype"))
									n.jstype =
										t.enums === String
											? o.google.protobuf.FieldOptions.JSType[e.jstype]
											: e.jstype
								if (e.weak != null && e.hasOwnProperty("weak")) n.weak = e.weak
								if (e.uninterpretedOption && e.uninterpretedOption.length) {
									n.uninterpretedOption = []
									for (var r = 0; r < e.uninterpretedOption.length; ++r)
										n.uninterpretedOption[r] =
											o.google.protobuf.UninterpretedOption.toObject(
												e.uninterpretedOption[r],
												t
											)
								}
								return n
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
									for (var t = Object.keys(e), n = 0; n < t.length; ++n)
										if (e[t[n]] != null) this[t[n]] = e[t[n]]
							}
							OneofOptions.prototype.uninterpretedOption = r.emptyArray
							OneofOptions.create = function create(e) {
								return new OneofOptions(e)
							}
							OneofOptions.encode = function encode(e, t) {
								if (!t) t = n.create()
								if (
									e.uninterpretedOption != null &&
									e.uninterpretedOption.length
								)
									for (var r = 0; r < e.uninterpretedOption.length; ++r)
										o.google.protobuf.UninterpretedOption.encode(
											e.uninterpretedOption[r],
											t.uint32(7994).fork()
										).ldelim()
								return t
							}
							OneofOptions.encodeDelimited = function encodeDelimited(e, t) {
								return this.encode(e, t).ldelim()
							}
							OneofOptions.decode = function decode(e, n) {
								if (!(e instanceof t)) e = t.create(e)
								var r = n === undefined ? e.len : e.pos + n,
									i = new o.google.protobuf.OneofOptions()
								while (e.pos < r) {
									var a = e.uint32()
									switch (a >>> 3) {
										case 999:
											if (
												!(i.uninterpretedOption && i.uninterpretedOption.length)
											)
												i.uninterpretedOption = []
											i.uninterpretedOption.push(
												o.google.protobuf.UninterpretedOption.decode(
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
										var n = o.google.protobuf.UninterpretedOption.verify(
											e.uninterpretedOption[t]
										)
										if (n) return "uninterpretedOption." + n
									}
								}
								return null
							}
							OneofOptions.fromObject = function fromObject(e) {
								if (e instanceof o.google.protobuf.OneofOptions) return e
								var t = new o.google.protobuf.OneofOptions()
								if (e.uninterpretedOption) {
									if (!Array.isArray(e.uninterpretedOption))
										throw TypeError(
											".google.protobuf.OneofOptions.uninterpretedOption: array expected"
										)
									t.uninterpretedOption = []
									for (var n = 0; n < e.uninterpretedOption.length; ++n) {
										if (typeof e.uninterpretedOption[n] !== "object")
											throw TypeError(
												".google.protobuf.OneofOptions.uninterpretedOption: object expected"
											)
										t.uninterpretedOption[n] =
											o.google.protobuf.UninterpretedOption.fromObject(
												e.uninterpretedOption[n]
											)
									}
								}
								return t
							}
							OneofOptions.toObject = function toObject(e, t) {
								if (!t) t = {}
								var n = {}
								if (t.arrays || t.defaults) n.uninterpretedOption = []
								if (e.uninterpretedOption && e.uninterpretedOption.length) {
									n.uninterpretedOption = []
									for (var r = 0; r < e.uninterpretedOption.length; ++r)
										n.uninterpretedOption[r] =
											o.google.protobuf.UninterpretedOption.toObject(
												e.uninterpretedOption[r],
												t
											)
								}
								return n
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
									for (var t = Object.keys(e), n = 0; n < t.length; ++n)
										if (e[t[n]] != null) this[t[n]] = e[t[n]]
							}
							EnumOptions.prototype.allowAlias = false
							EnumOptions.prototype.deprecated = false
							EnumOptions.prototype.uninterpretedOption = r.emptyArray
							EnumOptions.create = function create(e) {
								return new EnumOptions(e)
							}
							EnumOptions.encode = function encode(e, t) {
								if (!t) t = n.create()
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
									for (var r = 0; r < e.uninterpretedOption.length; ++r)
										o.google.protobuf.UninterpretedOption.encode(
											e.uninterpretedOption[r],
											t.uint32(7994).fork()
										).ldelim()
								return t
							}
							EnumOptions.encodeDelimited = function encodeDelimited(e, t) {
								return this.encode(e, t).ldelim()
							}
							EnumOptions.decode = function decode(e, n) {
								if (!(e instanceof t)) e = t.create(e)
								var r = n === undefined ? e.len : e.pos + n,
									i = new o.google.protobuf.EnumOptions()
								while (e.pos < r) {
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
												o.google.protobuf.UninterpretedOption.decode(
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
										var n = o.google.protobuf.UninterpretedOption.verify(
											e.uninterpretedOption[t]
										)
										if (n) return "uninterpretedOption." + n
									}
								}
								return null
							}
							EnumOptions.fromObject = function fromObject(e) {
								if (e instanceof o.google.protobuf.EnumOptions) return e
								var t = new o.google.protobuf.EnumOptions()
								if (e.allowAlias != null) t.allowAlias = Boolean(e.allowAlias)
								if (e.deprecated != null) t.deprecated = Boolean(e.deprecated)
								if (e.uninterpretedOption) {
									if (!Array.isArray(e.uninterpretedOption))
										throw TypeError(
											".google.protobuf.EnumOptions.uninterpretedOption: array expected"
										)
									t.uninterpretedOption = []
									for (var n = 0; n < e.uninterpretedOption.length; ++n) {
										if (typeof e.uninterpretedOption[n] !== "object")
											throw TypeError(
												".google.protobuf.EnumOptions.uninterpretedOption: object expected"
											)
										t.uninterpretedOption[n] =
											o.google.protobuf.UninterpretedOption.fromObject(
												e.uninterpretedOption[n]
											)
									}
								}
								return t
							}
							EnumOptions.toObject = function toObject(e, t) {
								if (!t) t = {}
								var n = {}
								if (t.arrays || t.defaults) n.uninterpretedOption = []
								if (t.defaults) {
									n.allowAlias = false
									n.deprecated = false
								}
								if (e.allowAlias != null && e.hasOwnProperty("allowAlias"))
									n.allowAlias = e.allowAlias
								if (e.deprecated != null && e.hasOwnProperty("deprecated"))
									n.deprecated = e.deprecated
								if (e.uninterpretedOption && e.uninterpretedOption.length) {
									n.uninterpretedOption = []
									for (var r = 0; r < e.uninterpretedOption.length; ++r)
										n.uninterpretedOption[r] =
											o.google.protobuf.UninterpretedOption.toObject(
												e.uninterpretedOption[r],
												t
											)
								}
								return n
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
									for (var t = Object.keys(e), n = 0; n < t.length; ++n)
										if (e[t[n]] != null) this[t[n]] = e[t[n]]
							}
							EnumValueOptions.prototype.deprecated = false
							EnumValueOptions.prototype.uninterpretedOption = r.emptyArray
							EnumValueOptions.create = function create(e) {
								return new EnumValueOptions(e)
							}
							EnumValueOptions.encode = function encode(e, t) {
								if (!t) t = n.create()
								if (
									e.deprecated != null &&
									Object.hasOwnProperty.call(e, "deprecated")
								)
									t.uint32(8).bool(e.deprecated)
								if (
									e.uninterpretedOption != null &&
									e.uninterpretedOption.length
								)
									for (var r = 0; r < e.uninterpretedOption.length; ++r)
										o.google.protobuf.UninterpretedOption.encode(
											e.uninterpretedOption[r],
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
							EnumValueOptions.decode = function decode(e, n) {
								if (!(e instanceof t)) e = t.create(e)
								var r = n === undefined ? e.len : e.pos + n,
									i = new o.google.protobuf.EnumValueOptions()
								while (e.pos < r) {
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
												o.google.protobuf.UninterpretedOption.decode(
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
										var n = o.google.protobuf.UninterpretedOption.verify(
											e.uninterpretedOption[t]
										)
										if (n) return "uninterpretedOption." + n
									}
								}
								return null
							}
							EnumValueOptions.fromObject = function fromObject(e) {
								if (e instanceof o.google.protobuf.EnumValueOptions) return e
								var t = new o.google.protobuf.EnumValueOptions()
								if (e.deprecated != null) t.deprecated = Boolean(e.deprecated)
								if (e.uninterpretedOption) {
									if (!Array.isArray(e.uninterpretedOption))
										throw TypeError(
											".google.protobuf.EnumValueOptions.uninterpretedOption: array expected"
										)
									t.uninterpretedOption = []
									for (var n = 0; n < e.uninterpretedOption.length; ++n) {
										if (typeof e.uninterpretedOption[n] !== "object")
											throw TypeError(
												".google.protobuf.EnumValueOptions.uninterpretedOption: object expected"
											)
										t.uninterpretedOption[n] =
											o.google.protobuf.UninterpretedOption.fromObject(
												e.uninterpretedOption[n]
											)
									}
								}
								return t
							}
							EnumValueOptions.toObject = function toObject(e, t) {
								if (!t) t = {}
								var n = {}
								if (t.arrays || t.defaults) n.uninterpretedOption = []
								if (t.defaults) n.deprecated = false
								if (e.deprecated != null && e.hasOwnProperty("deprecated"))
									n.deprecated = e.deprecated
								if (e.uninterpretedOption && e.uninterpretedOption.length) {
									n.uninterpretedOption = []
									for (var r = 0; r < e.uninterpretedOption.length; ++r)
										n.uninterpretedOption[r] =
											o.google.protobuf.UninterpretedOption.toObject(
												e.uninterpretedOption[r],
												t
											)
								}
								return n
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
									for (var t = Object.keys(e), n = 0; n < t.length; ++n)
										if (e[t[n]] != null) this[t[n]] = e[t[n]]
							}
							ServiceOptions.prototype.deprecated = false
							ServiceOptions.prototype.uninterpretedOption = r.emptyArray
							ServiceOptions.prototype[".google.api.defaultHost"] = ""
							ServiceOptions.prototype[".google.api.oauthScopes"] = ""
							ServiceOptions.create = function create(e) {
								return new ServiceOptions(e)
							}
							ServiceOptions.encode = function encode(e, t) {
								if (!t) t = n.create()
								if (
									e.deprecated != null &&
									Object.hasOwnProperty.call(e, "deprecated")
								)
									t.uint32(264).bool(e.deprecated)
								if (
									e.uninterpretedOption != null &&
									e.uninterpretedOption.length
								)
									for (var r = 0; r < e.uninterpretedOption.length; ++r)
										o.google.protobuf.UninterpretedOption.encode(
											e.uninterpretedOption[r],
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
							ServiceOptions.decode = function decode(e, n) {
								if (!(e instanceof t)) e = t.create(e)
								var r = n === undefined ? e.len : e.pos + n,
									i = new o.google.protobuf.ServiceOptions()
								while (e.pos < r) {
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
												o.google.protobuf.UninterpretedOption.decode(
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
										var n = o.google.protobuf.UninterpretedOption.verify(
											e.uninterpretedOption[t]
										)
										if (n) return "uninterpretedOption." + n
									}
								}
								if (
									e[".google.api.defaultHost"] != null &&
									e.hasOwnProperty(".google.api.defaultHost")
								)
									if (!r.isString(e[".google.api.defaultHost"]))
										return ".google.api.defaultHost: string expected"
								if (
									e[".google.api.oauthScopes"] != null &&
									e.hasOwnProperty(".google.api.oauthScopes")
								)
									if (!r.isString(e[".google.api.oauthScopes"]))
										return ".google.api.oauthScopes: string expected"
								return null
							}
							ServiceOptions.fromObject = function fromObject(e) {
								if (e instanceof o.google.protobuf.ServiceOptions) return e
								var t = new o.google.protobuf.ServiceOptions()
								if (e.deprecated != null) t.deprecated = Boolean(e.deprecated)
								if (e.uninterpretedOption) {
									if (!Array.isArray(e.uninterpretedOption))
										throw TypeError(
											".google.protobuf.ServiceOptions.uninterpretedOption: array expected"
										)
									t.uninterpretedOption = []
									for (var n = 0; n < e.uninterpretedOption.length; ++n) {
										if (typeof e.uninterpretedOption[n] !== "object")
											throw TypeError(
												".google.protobuf.ServiceOptions.uninterpretedOption: object expected"
											)
										t.uninterpretedOption[n] =
											o.google.protobuf.UninterpretedOption.fromObject(
												e.uninterpretedOption[n]
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
								var n = {}
								if (t.arrays || t.defaults) n.uninterpretedOption = []
								if (t.defaults) {
									n.deprecated = false
									n[".google.api.defaultHost"] = ""
									n[".google.api.oauthScopes"] = ""
								}
								if (e.deprecated != null && e.hasOwnProperty("deprecated"))
									n.deprecated = e.deprecated
								if (e.uninterpretedOption && e.uninterpretedOption.length) {
									n.uninterpretedOption = []
									for (var r = 0; r < e.uninterpretedOption.length; ++r)
										n.uninterpretedOption[r] =
											o.google.protobuf.UninterpretedOption.toObject(
												e.uninterpretedOption[r],
												t
											)
								}
								if (
									e[".google.api.defaultHost"] != null &&
									e.hasOwnProperty(".google.api.defaultHost")
								)
									n[".google.api.defaultHost"] = e[".google.api.defaultHost"]
								if (
									e[".google.api.oauthScopes"] != null &&
									e.hasOwnProperty(".google.api.oauthScopes")
								)
									n[".google.api.oauthScopes"] = e[".google.api.oauthScopes"]
								return n
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
									for (var t = Object.keys(e), n = 0; n < t.length; ++n)
										if (e[t[n]] != null) this[t[n]] = e[t[n]]
							}
							MethodOptions.prototype.deprecated = false
							MethodOptions.prototype.idempotencyLevel = 0
							MethodOptions.prototype.uninterpretedOption = r.emptyArray
							MethodOptions.prototype[".google.longrunning.operationInfo"] =
								null
							MethodOptions.prototype[".google.api.http"] = null
							MethodOptions.prototype[".google.api.methodSignature"] =
								r.emptyArray
							MethodOptions.create = function create(e) {
								return new MethodOptions(e)
							}
							MethodOptions.encode = function encode(e, t) {
								if (!t) t = n.create()
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
									for (var r = 0; r < e.uninterpretedOption.length; ++r)
										o.google.protobuf.UninterpretedOption.encode(
											e.uninterpretedOption[r],
											t.uint32(7994).fork()
										).ldelim()
								if (
									e[".google.longrunning.operationInfo"] != null &&
									Object.hasOwnProperty.call(
										e,
										".google.longrunning.operationInfo"
									)
								)
									o.google.longrunning.OperationInfo.encode(
										e[".google.longrunning.operationInfo"],
										t.uint32(8394).fork()
									).ldelim()
								if (
									e[".google.api.methodSignature"] != null &&
									e[".google.api.methodSignature"].length
								)
									for (
										var r = 0;
										r < e[".google.api.methodSignature"].length;
										++r
									)
										t.uint32(8410).string(e[".google.api.methodSignature"][r])
								if (
									e[".google.api.http"] != null &&
									Object.hasOwnProperty.call(e, ".google.api.http")
								)
									o.google.api.HttpRule.encode(
										e[".google.api.http"],
										t.uint32(578365826).fork()
									).ldelim()
								return t
							}
							MethodOptions.encodeDelimited = function encodeDelimited(e, t) {
								return this.encode(e, t).ldelim()
							}
							MethodOptions.decode = function decode(e, n) {
								if (!(e instanceof t)) e = t.create(e)
								var r = n === undefined ? e.len : e.pos + n,
									i = new o.google.protobuf.MethodOptions()
								while (e.pos < r) {
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
												o.google.protobuf.UninterpretedOption.decode(
													e,
													e.uint32()
												)
											)
											break
										case 1049:
											i[".google.longrunning.operationInfo"] =
												o.google.longrunning.OperationInfo.decode(e, e.uint32())
											break
										case 72295728:
											i[".google.api.http"] = o.google.api.HttpRule.decode(
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
										var n = o.google.protobuf.UninterpretedOption.verify(
											e.uninterpretedOption[t]
										)
										if (n) return "uninterpretedOption." + n
									}
								}
								if (
									e[".google.longrunning.operationInfo"] != null &&
									e.hasOwnProperty(".google.longrunning.operationInfo")
								) {
									var n = o.google.longrunning.OperationInfo.verify(
										e[".google.longrunning.operationInfo"]
									)
									if (n) return ".google.longrunning.operationInfo." + n
								}
								if (
									e[".google.api.http"] != null &&
									e.hasOwnProperty(".google.api.http")
								) {
									var n = o.google.api.HttpRule.verify(e[".google.api.http"])
									if (n) return ".google.api.http." + n
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
										if (!r.isString(e[".google.api.methodSignature"][t]))
											return ".google.api.methodSignature: string[] expected"
								}
								return null
							}
							MethodOptions.fromObject = function fromObject(e) {
								if (e instanceof o.google.protobuf.MethodOptions) return e
								var t = new o.google.protobuf.MethodOptions()
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
									for (var n = 0; n < e.uninterpretedOption.length; ++n) {
										if (typeof e.uninterpretedOption[n] !== "object")
											throw TypeError(
												".google.protobuf.MethodOptions.uninterpretedOption: object expected"
											)
										t.uninterpretedOption[n] =
											o.google.protobuf.UninterpretedOption.fromObject(
												e.uninterpretedOption[n]
											)
									}
								}
								if (e[".google.longrunning.operationInfo"] != null) {
									if (
										typeof e[".google.longrunning.operationInfo"] !== "object"
									)
										throw TypeError(
											".google.protobuf.MethodOptions..google.longrunning.operationInfo: object expected"
										)
									t[".google.longrunning.operationInfo"] =
										o.google.longrunning.OperationInfo.fromObject(
											e[".google.longrunning.operationInfo"]
										)
								}
								if (e[".google.api.http"] != null) {
									if (typeof e[".google.api.http"] !== "object")
										throw TypeError(
											".google.protobuf.MethodOptions..google.api.http: object expected"
										)
									t[".google.api.http"] = o.google.api.HttpRule.fromObject(
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
										var n = 0;
										n < e[".google.api.methodSignature"].length;
										++n
									)
										t[".google.api.methodSignature"][n] = String(
											e[".google.api.methodSignature"][n]
										)
								}
								return t
							}
							MethodOptions.toObject = function toObject(e, t) {
								if (!t) t = {}
								var n = {}
								if (t.arrays || t.defaults) {
									n.uninterpretedOption = []
									n[".google.api.methodSignature"] = []
								}
								if (t.defaults) {
									n.deprecated = false
									n.idempotencyLevel =
										t.enums === String ? "IDEMPOTENCY_UNKNOWN" : 0
									n[".google.longrunning.operationInfo"] = null
									n[".google.api.http"] = null
								}
								if (e.deprecated != null && e.hasOwnProperty("deprecated"))
									n.deprecated = e.deprecated
								if (
									e.idempotencyLevel != null &&
									e.hasOwnProperty("idempotencyLevel")
								)
									n.idempotencyLevel =
										t.enums === String
											? o.google.protobuf.MethodOptions.IdempotencyLevel[
													e.idempotencyLevel
											  ]
											: e.idempotencyLevel
								if (e.uninterpretedOption && e.uninterpretedOption.length) {
									n.uninterpretedOption = []
									for (var r = 0; r < e.uninterpretedOption.length; ++r)
										n.uninterpretedOption[r] =
											o.google.protobuf.UninterpretedOption.toObject(
												e.uninterpretedOption[r],
												t
											)
								}
								if (
									e[".google.longrunning.operationInfo"] != null &&
									e.hasOwnProperty(".google.longrunning.operationInfo")
								)
									n[".google.longrunning.operationInfo"] =
										o.google.longrunning.OperationInfo.toObject(
											e[".google.longrunning.operationInfo"],
											t
										)
								if (
									e[".google.api.methodSignature"] &&
									e[".google.api.methodSignature"].length
								) {
									n[".google.api.methodSignature"] = []
									for (
										var r = 0;
										r < e[".google.api.methodSignature"].length;
										++r
									)
										n[".google.api.methodSignature"][r] =
											e[".google.api.methodSignature"][r]
								}
								if (
									e[".google.api.http"] != null &&
									e.hasOwnProperty(".google.api.http")
								)
									n[".google.api.http"] = o.google.api.HttpRule.toObject(
										e[".google.api.http"],
										t
									)
								return n
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
									for (var t = Object.keys(e), n = 0; n < t.length; ++n)
										if (e[t[n]] != null) this[t[n]] = e[t[n]]
							}
							UninterpretedOption.prototype.name = r.emptyArray
							UninterpretedOption.prototype.identifierValue = ""
							UninterpretedOption.prototype.positiveIntValue = r.Long
								? r.Long.fromBits(0, 0, true)
								: 0
							UninterpretedOption.prototype.negativeIntValue = r.Long
								? r.Long.fromBits(0, 0, false)
								: 0
							UninterpretedOption.prototype.doubleValue = 0
							UninterpretedOption.prototype.stringValue = r.newBuffer([])
							UninterpretedOption.prototype.aggregateValue = ""
							UninterpretedOption.create = function create(e) {
								return new UninterpretedOption(e)
							}
							UninterpretedOption.encode = function encode(e, t) {
								if (!t) t = n.create()
								if (e.name != null && e.name.length)
									for (var r = 0; r < e.name.length; ++r)
										o.google.protobuf.UninterpretedOption.NamePart.encode(
											e.name[r],
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
							UninterpretedOption.decode = function decode(e, n) {
								if (!(e instanceof t)) e = t.create(e)
								var r = n === undefined ? e.len : e.pos + n,
									i = new o.google.protobuf.UninterpretedOption()
								while (e.pos < r) {
									var a = e.uint32()
									switch (a >>> 3) {
										case 2:
											if (!(i.name && i.name.length)) i.name = []
											i.name.push(
												o.google.protobuf.UninterpretedOption.NamePart.decode(
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
										var n =
											o.google.protobuf.UninterpretedOption.NamePart.verify(
												e.name[t]
											)
										if (n) return "name." + n
									}
								}
								if (
									e.identifierValue != null &&
									e.hasOwnProperty("identifierValue")
								)
									if (!r.isString(e.identifierValue))
										return "identifierValue: string expected"
								if (
									e.positiveIntValue != null &&
									e.hasOwnProperty("positiveIntValue")
								)
									if (
										!r.isInteger(e.positiveIntValue) &&
										!(
											e.positiveIntValue &&
											r.isInteger(e.positiveIntValue.low) &&
											r.isInteger(e.positiveIntValue.high)
										)
									)
										return "positiveIntValue: integer|Long expected"
								if (
									e.negativeIntValue != null &&
									e.hasOwnProperty("negativeIntValue")
								)
									if (
										!r.isInteger(e.negativeIntValue) &&
										!(
											e.negativeIntValue &&
											r.isInteger(e.negativeIntValue.low) &&
											r.isInteger(e.negativeIntValue.high)
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
											r.isString(e.stringValue)
										)
									)
										return "stringValue: buffer expected"
								if (
									e.aggregateValue != null &&
									e.hasOwnProperty("aggregateValue")
								)
									if (!r.isString(e.aggregateValue))
										return "aggregateValue: string expected"
								return null
							}
							UninterpretedOption.fromObject = function fromObject(e) {
								if (e instanceof o.google.protobuf.UninterpretedOption) return e
								var t = new o.google.protobuf.UninterpretedOption()
								if (e.name) {
									if (!Array.isArray(e.name))
										throw TypeError(
											".google.protobuf.UninterpretedOption.name: array expected"
										)
									t.name = []
									for (var n = 0; n < e.name.length; ++n) {
										if (typeof e.name[n] !== "object")
											throw TypeError(
												".google.protobuf.UninterpretedOption.name: object expected"
											)
										t.name[n] =
											o.google.protobuf.UninterpretedOption.NamePart.fromObject(
												e.name[n]
											)
									}
								}
								if (e.identifierValue != null)
									t.identifierValue = String(e.identifierValue)
								if (e.positiveIntValue != null)
									if (r.Long)
										(t.positiveIntValue = r.Long.fromValue(
											e.positiveIntValue
										)).unsigned = true
									else if (typeof e.positiveIntValue === "string")
										t.positiveIntValue = parseInt(e.positiveIntValue, 10)
									else if (typeof e.positiveIntValue === "number")
										t.positiveIntValue = e.positiveIntValue
									else if (typeof e.positiveIntValue === "object")
										t.positiveIntValue = new r.LongBits(
											e.positiveIntValue.low >>> 0,
											e.positiveIntValue.high >>> 0
										).toNumber(true)
								if (e.negativeIntValue != null)
									if (r.Long)
										(t.negativeIntValue = r.Long.fromValue(
											e.negativeIntValue
										)).unsigned = false
									else if (typeof e.negativeIntValue === "string")
										t.negativeIntValue = parseInt(e.negativeIntValue, 10)
									else if (typeof e.negativeIntValue === "number")
										t.negativeIntValue = e.negativeIntValue
									else if (typeof e.negativeIntValue === "object")
										t.negativeIntValue = new r.LongBits(
											e.negativeIntValue.low >>> 0,
											e.negativeIntValue.high >>> 0
										).toNumber()
								if (e.doubleValue != null) t.doubleValue = Number(e.doubleValue)
								if (e.stringValue != null)
									if (typeof e.stringValue === "string")
										r.base64.decode(
											e.stringValue,
											(t.stringValue = r.newBuffer(
												r.base64.length(e.stringValue)
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
								var n = {}
								if (t.arrays || t.defaults) n.name = []
								if (t.defaults) {
									n.identifierValue = ""
									if (r.Long) {
										var i = new r.Long(0, 0, true)
										n.positiveIntValue =
											t.longs === String
												? i.toString()
												: t.longs === Number
												? i.toNumber()
												: i
									} else n.positiveIntValue = t.longs === String ? "0" : 0
									if (r.Long) {
										var i = new r.Long(0, 0, false)
										n.negativeIntValue =
											t.longs === String
												? i.toString()
												: t.longs === Number
												? i.toNumber()
												: i
									} else n.negativeIntValue = t.longs === String ? "0" : 0
									n.doubleValue = 0
									if (t.bytes === String) n.stringValue = ""
									else {
										n.stringValue = []
										if (t.bytes !== Array)
											n.stringValue = r.newBuffer(n.stringValue)
									}
									n.aggregateValue = ""
								}
								if (e.name && e.name.length) {
									n.name = []
									for (var a = 0; a < e.name.length; ++a)
										n.name[a] =
											o.google.protobuf.UninterpretedOption.NamePart.toObject(
												e.name[a],
												t
											)
								}
								if (
									e.identifierValue != null &&
									e.hasOwnProperty("identifierValue")
								)
									n.identifierValue = e.identifierValue
								if (
									e.positiveIntValue != null &&
									e.hasOwnProperty("positiveIntValue")
								)
									if (typeof e.positiveIntValue === "number")
										n.positiveIntValue =
											t.longs === String
												? String(e.positiveIntValue)
												: e.positiveIntValue
									else
										n.positiveIntValue =
											t.longs === String
												? r.Long.prototype.toString.call(e.positiveIntValue)
												: t.longs === Number
												? new r.LongBits(
														e.positiveIntValue.low >>> 0,
														e.positiveIntValue.high >>> 0
												  ).toNumber(true)
												: e.positiveIntValue
								if (
									e.negativeIntValue != null &&
									e.hasOwnProperty("negativeIntValue")
								)
									if (typeof e.negativeIntValue === "number")
										n.negativeIntValue =
											t.longs === String
												? String(e.negativeIntValue)
												: e.negativeIntValue
									else
										n.negativeIntValue =
											t.longs === String
												? r.Long.prototype.toString.call(e.negativeIntValue)
												: t.longs === Number
												? new r.LongBits(
														e.negativeIntValue.low >>> 0,
														e.negativeIntValue.high >>> 0
												  ).toNumber()
												: e.negativeIntValue
								if (e.doubleValue != null && e.hasOwnProperty("doubleValue"))
									n.doubleValue =
										t.json && !isFinite(e.doubleValue)
											? String(e.doubleValue)
											: e.doubleValue
								if (e.stringValue != null && e.hasOwnProperty("stringValue"))
									n.stringValue =
										t.bytes === String
											? r.base64.encode(e.stringValue, 0, e.stringValue.length)
											: t.bytes === Array
											? Array.prototype.slice.call(e.stringValue)
											: e.stringValue
								if (
									e.aggregateValue != null &&
									e.hasOwnProperty("aggregateValue")
								)
									n.aggregateValue = e.aggregateValue
								return n
							}
							UninterpretedOption.prototype.toJSON = function toJSON() {
								return this.constructor.toObject(this, e.util.toJSONOptions)
							}
							UninterpretedOption.NamePart = (function () {
								function NamePart(e) {
									if (e)
										for (var t = Object.keys(e), n = 0; n < t.length; ++n)
											if (e[t[n]] != null) this[t[n]] = e[t[n]]
								}
								NamePart.prototype.namePart = ""
								NamePart.prototype.isExtension = false
								NamePart.create = function create(e) {
									return new NamePart(e)
								}
								NamePart.encode = function encode(e, t) {
									if (!t) t = n.create()
									t.uint32(10).string(e.namePart)
									t.uint32(16).bool(e.isExtension)
									return t
								}
								NamePart.encodeDelimited = function encodeDelimited(e, t) {
									return this.encode(e, t).ldelim()
								}
								NamePart.decode = function decode(e, n) {
									if (!(e instanceof t)) e = t.create(e)
									var i = n === undefined ? e.len : e.pos + n,
										a = new o.google.protobuf.UninterpretedOption.NamePart()
									while (e.pos < i) {
										var p = e.uint32()
										switch (p >>> 3) {
											case 1:
												a.namePart = e.string()
												break
											case 2:
												a.isExtension = e.bool()
												break
											default:
												e.skipType(p & 7)
												break
										}
									}
									if (!a.hasOwnProperty("namePart"))
										throw r.ProtocolError("missing required 'namePart'", {
											instance: a
										})
									if (!a.hasOwnProperty("isExtension"))
										throw r.ProtocolError("missing required 'isExtension'", {
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
									if (!r.isString(e.namePart))
										return "namePart: string expected"
									if (typeof e.isExtension !== "boolean")
										return "isExtension: boolean expected"
									return null
								}
								NamePart.fromObject = function fromObject(e) {
									if (
										e instanceof o.google.protobuf.UninterpretedOption.NamePart
									)
										return e
									var t = new o.google.protobuf.UninterpretedOption.NamePart()
									if (e.namePart != null) t.namePart = String(e.namePart)
									if (e.isExtension != null)
										t.isExtension = Boolean(e.isExtension)
									return t
								}
								NamePart.toObject = function toObject(e, t) {
									if (!t) t = {}
									var n = {}
									if (t.defaults) {
										n.namePart = ""
										n.isExtension = false
									}
									if (e.namePart != null && e.hasOwnProperty("namePart"))
										n.namePart = e.namePart
									if (e.isExtension != null && e.hasOwnProperty("isExtension"))
										n.isExtension = e.isExtension
									return n
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
									for (var t = Object.keys(e), n = 0; n < t.length; ++n)
										if (e[t[n]] != null) this[t[n]] = e[t[n]]
							}
							SourceCodeInfo.prototype.location = r.emptyArray
							SourceCodeInfo.create = function create(e) {
								return new SourceCodeInfo(e)
							}
							SourceCodeInfo.encode = function encode(e, t) {
								if (!t) t = n.create()
								if (e.location != null && e.location.length)
									for (var r = 0; r < e.location.length; ++r)
										o.google.protobuf.SourceCodeInfo.Location.encode(
											e.location[r],
											t.uint32(10).fork()
										).ldelim()
								return t
							}
							SourceCodeInfo.encodeDelimited = function encodeDelimited(e, t) {
								return this.encode(e, t).ldelim()
							}
							SourceCodeInfo.decode = function decode(e, n) {
								if (!(e instanceof t)) e = t.create(e)
								var r = n === undefined ? e.len : e.pos + n,
									i = new o.google.protobuf.SourceCodeInfo()
								while (e.pos < r) {
									var a = e.uint32()
									switch (a >>> 3) {
										case 1:
											if (!(i.location && i.location.length)) i.location = []
											i.location.push(
												o.google.protobuf.SourceCodeInfo.Location.decode(
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
										var n = o.google.protobuf.SourceCodeInfo.Location.verify(
											e.location[t]
										)
										if (n) return "location." + n
									}
								}
								return null
							}
							SourceCodeInfo.fromObject = function fromObject(e) {
								if (e instanceof o.google.protobuf.SourceCodeInfo) return e
								var t = new o.google.protobuf.SourceCodeInfo()
								if (e.location) {
									if (!Array.isArray(e.location))
										throw TypeError(
											".google.protobuf.SourceCodeInfo.location: array expected"
										)
									t.location = []
									for (var n = 0; n < e.location.length; ++n) {
										if (typeof e.location[n] !== "object")
											throw TypeError(
												".google.protobuf.SourceCodeInfo.location: object expected"
											)
										t.location[n] =
											o.google.protobuf.SourceCodeInfo.Location.fromObject(
												e.location[n]
											)
									}
								}
								return t
							}
							SourceCodeInfo.toObject = function toObject(e, t) {
								if (!t) t = {}
								var n = {}
								if (t.arrays || t.defaults) n.location = []
								if (e.location && e.location.length) {
									n.location = []
									for (var r = 0; r < e.location.length; ++r)
										n.location[r] =
											o.google.protobuf.SourceCodeInfo.Location.toObject(
												e.location[r],
												t
											)
								}
								return n
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
										for (var t = Object.keys(e), n = 0; n < t.length; ++n)
											if (e[t[n]] != null) this[t[n]] = e[t[n]]
								}
								Location.prototype.path = r.emptyArray
								Location.prototype.span = r.emptyArray
								Location.prototype.leadingComments = ""
								Location.prototype.trailingComments = ""
								Location.prototype.leadingDetachedComments = r.emptyArray
								Location.create = function create(e) {
									return new Location(e)
								}
								Location.encode = function encode(e, t) {
									if (!t) t = n.create()
									if (e.path != null && e.path.length) {
										t.uint32(10).fork()
										for (var r = 0; r < e.path.length; ++r) t.int32(e.path[r])
										t.ldelim()
									}
									if (e.span != null && e.span.length) {
										t.uint32(18).fork()
										for (var r = 0; r < e.span.length; ++r) t.int32(e.span[r])
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
										for (var r = 0; r < e.leadingDetachedComments.length; ++r)
											t.uint32(50).string(e.leadingDetachedComments[r])
									return t
								}
								Location.encodeDelimited = function encodeDelimited(e, t) {
									return this.encode(e, t).ldelim()
								}
								Location.decode = function decode(e, n) {
									if (!(e instanceof t)) e = t.create(e)
									var r = n === undefined ? e.len : e.pos + n,
										i = new o.google.protobuf.SourceCodeInfo.Location()
									while (e.pos < r) {
										var a = e.uint32()
										switch (a >>> 3) {
											case 1:
												if (!(i.path && i.path.length)) i.path = []
												if ((a & 7) === 2) {
													var p = e.uint32() + e.pos
													while (e.pos < p) i.path.push(e.int32())
												} else i.path.push(e.int32())
												break
											case 2:
												if (!(i.span && i.span.length)) i.span = []
												if ((a & 7) === 2) {
													var p = e.uint32() + e.pos
													while (e.pos < p) i.span.push(e.int32())
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
											if (!r.isInteger(e.path[t]))
												return "path: integer[] expected"
									}
									if (e.span != null && e.hasOwnProperty("span")) {
										if (!Array.isArray(e.span)) return "span: array expected"
										for (var t = 0; t < e.span.length; ++t)
											if (!r.isInteger(e.span[t]))
												return "span: integer[] expected"
									}
									if (
										e.leadingComments != null &&
										e.hasOwnProperty("leadingComments")
									)
										if (!r.isString(e.leadingComments))
											return "leadingComments: string expected"
									if (
										e.trailingComments != null &&
										e.hasOwnProperty("trailingComments")
									)
										if (!r.isString(e.trailingComments))
											return "trailingComments: string expected"
									if (
										e.leadingDetachedComments != null &&
										e.hasOwnProperty("leadingDetachedComments")
									) {
										if (!Array.isArray(e.leadingDetachedComments))
											return "leadingDetachedComments: array expected"
										for (var t = 0; t < e.leadingDetachedComments.length; ++t)
											if (!r.isString(e.leadingDetachedComments[t]))
												return "leadingDetachedComments: string[] expected"
									}
									return null
								}
								Location.fromObject = function fromObject(e) {
									if (e instanceof o.google.protobuf.SourceCodeInfo.Location)
										return e
									var t = new o.google.protobuf.SourceCodeInfo.Location()
									if (e.path) {
										if (!Array.isArray(e.path))
											throw TypeError(
												".google.protobuf.SourceCodeInfo.Location.path: array expected"
											)
										t.path = []
										for (var n = 0; n < e.path.length; ++n)
											t.path[n] = e.path[n] | 0
									}
									if (e.span) {
										if (!Array.isArray(e.span))
											throw TypeError(
												".google.protobuf.SourceCodeInfo.Location.span: array expected"
											)
										t.span = []
										for (var n = 0; n < e.span.length; ++n)
											t.span[n] = e.span[n] | 0
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
										for (var n = 0; n < e.leadingDetachedComments.length; ++n)
											t.leadingDetachedComments[n] = String(
												e.leadingDetachedComments[n]
											)
									}
									return t
								}
								Location.toObject = function toObject(e, t) {
									if (!t) t = {}
									var n = {}
									if (t.arrays || t.defaults) {
										n.path = []
										n.span = []
										n.leadingDetachedComments = []
									}
									if (t.defaults) {
										n.leadingComments = ""
										n.trailingComments = ""
									}
									if (e.path && e.path.length) {
										n.path = []
										for (var r = 0; r < e.path.length; ++r)
											n.path[r] = e.path[r]
									}
									if (e.span && e.span.length) {
										n.span = []
										for (var r = 0; r < e.span.length; ++r)
											n.span[r] = e.span[r]
									}
									if (
										e.leadingComments != null &&
										e.hasOwnProperty("leadingComments")
									)
										n.leadingComments = e.leadingComments
									if (
										e.trailingComments != null &&
										e.hasOwnProperty("trailingComments")
									)
										n.trailingComments = e.trailingComments
									if (
										e.leadingDetachedComments &&
										e.leadingDetachedComments.length
									) {
										n.leadingDetachedComments = []
										for (var r = 0; r < e.leadingDetachedComments.length; ++r)
											n.leadingDetachedComments[r] =
												e.leadingDetachedComments[r]
									}
									return n
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
									for (var t = Object.keys(e), n = 0; n < t.length; ++n)
										if (e[t[n]] != null) this[t[n]] = e[t[n]]
							}
							GeneratedCodeInfo.prototype.annotation = r.emptyArray
							GeneratedCodeInfo.create = function create(e) {
								return new GeneratedCodeInfo(e)
							}
							GeneratedCodeInfo.encode = function encode(e, t) {
								if (!t) t = n.create()
								if (e.annotation != null && e.annotation.length)
									for (var r = 0; r < e.annotation.length; ++r)
										o.google.protobuf.GeneratedCodeInfo.Annotation.encode(
											e.annotation[r],
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
							GeneratedCodeInfo.decode = function decode(e, n) {
								if (!(e instanceof t)) e = t.create(e)
								var r = n === undefined ? e.len : e.pos + n,
									i = new o.google.protobuf.GeneratedCodeInfo()
								while (e.pos < r) {
									var a = e.uint32()
									switch (a >>> 3) {
										case 1:
											if (!(i.annotation && i.annotation.length))
												i.annotation = []
											i.annotation.push(
												o.google.protobuf.GeneratedCodeInfo.Annotation.decode(
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
										var n =
											o.google.protobuf.GeneratedCodeInfo.Annotation.verify(
												e.annotation[t]
											)
										if (n) return "annotation." + n
									}
								}
								return null
							}
							GeneratedCodeInfo.fromObject = function fromObject(e) {
								if (e instanceof o.google.protobuf.GeneratedCodeInfo) return e
								var t = new o.google.protobuf.GeneratedCodeInfo()
								if (e.annotation) {
									if (!Array.isArray(e.annotation))
										throw TypeError(
											".google.protobuf.GeneratedCodeInfo.annotation: array expected"
										)
									t.annotation = []
									for (var n = 0; n < e.annotation.length; ++n) {
										if (typeof e.annotation[n] !== "object")
											throw TypeError(
												".google.protobuf.GeneratedCodeInfo.annotation: object expected"
											)
										t.annotation[n] =
											o.google.protobuf.GeneratedCodeInfo.Annotation.fromObject(
												e.annotation[n]
											)
									}
								}
								return t
							}
							GeneratedCodeInfo.toObject = function toObject(e, t) {
								if (!t) t = {}
								var n = {}
								if (t.arrays || t.defaults) n.annotation = []
								if (e.annotation && e.annotation.length) {
									n.annotation = []
									for (var r = 0; r < e.annotation.length; ++r)
										n.annotation[r] =
											o.google.protobuf.GeneratedCodeInfo.Annotation.toObject(
												e.annotation[r],
												t
											)
								}
								return n
							}
							GeneratedCodeInfo.prototype.toJSON = function toJSON() {
								return this.constructor.toObject(this, e.util.toJSONOptions)
							}
							GeneratedCodeInfo.Annotation = (function () {
								function Annotation(e) {
									this.path = []
									if (e)
										for (var t = Object.keys(e), n = 0; n < t.length; ++n)
											if (e[t[n]] != null) this[t[n]] = e[t[n]]
								}
								Annotation.prototype.path = r.emptyArray
								Annotation.prototype.sourceFile = ""
								Annotation.prototype.begin = 0
								Annotation.prototype.end = 0
								Annotation.create = function create(e) {
									return new Annotation(e)
								}
								Annotation.encode = function encode(e, t) {
									if (!t) t = n.create()
									if (e.path != null && e.path.length) {
										t.uint32(10).fork()
										for (var r = 0; r < e.path.length; ++r) t.int32(e.path[r])
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
								Annotation.decode = function decode(e, n) {
									if (!(e instanceof t)) e = t.create(e)
									var r = n === undefined ? e.len : e.pos + n,
										i = new o.google.protobuf.GeneratedCodeInfo.Annotation()
									while (e.pos < r) {
										var a = e.uint32()
										switch (a >>> 3) {
											case 1:
												if (!(i.path && i.path.length)) i.path = []
												if ((a & 7) === 2) {
													var p = e.uint32() + e.pos
													while (e.pos < p) i.path.push(e.int32())
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
											if (!r.isInteger(e.path[t]))
												return "path: integer[] expected"
									}
									if (e.sourceFile != null && e.hasOwnProperty("sourceFile"))
										if (!r.isString(e.sourceFile))
											return "sourceFile: string expected"
									if (e.begin != null && e.hasOwnProperty("begin"))
										if (!r.isInteger(e.begin)) return "begin: integer expected"
									if (e.end != null && e.hasOwnProperty("end"))
										if (!r.isInteger(e.end)) return "end: integer expected"
									return null
								}
								Annotation.fromObject = function fromObject(e) {
									if (
										e instanceof o.google.protobuf.GeneratedCodeInfo.Annotation
									)
										return e
									var t = new o.google.protobuf.GeneratedCodeInfo.Annotation()
									if (e.path) {
										if (!Array.isArray(e.path))
											throw TypeError(
												".google.protobuf.GeneratedCodeInfo.Annotation.path: array expected"
											)
										t.path = []
										for (var n = 0; n < e.path.length; ++n)
											t.path[n] = e.path[n] | 0
									}
									if (e.sourceFile != null) t.sourceFile = String(e.sourceFile)
									if (e.begin != null) t.begin = e.begin | 0
									if (e.end != null) t.end = e.end | 0
									return t
								}
								Annotation.toObject = function toObject(e, t) {
									if (!t) t = {}
									var n = {}
									if (t.arrays || t.defaults) n.path = []
									if (t.defaults) {
										n.sourceFile = ""
										n.begin = 0
										n.end = 0
									}
									if (e.path && e.path.length) {
										n.path = []
										for (var r = 0; r < e.path.length; ++r)
											n.path[r] = e.path[r]
									}
									if (e.sourceFile != null && e.hasOwnProperty("sourceFile"))
										n.sourceFile = e.sourceFile
									if (e.begin != null && e.hasOwnProperty("begin"))
										n.begin = e.begin
									if (e.end != null && e.hasOwnProperty("end")) n.end = e.end
									return n
								}
								Annotation.prototype.toJSON = function toJSON() {
									return this.constructor.toObject(this, e.util.toJSONOptions)
								}
								return Annotation
							})()
							return GeneratedCodeInfo
						})()
						i.Any = (function () {
							function Any(e) {
								if (e)
									for (var t = Object.keys(e), n = 0; n < t.length; ++n)
										if (e[t[n]] != null) this[t[n]] = e[t[n]]
							}
							Any.prototype.type_url = ""
							Any.prototype.value = r.newBuffer([])
							Any.create = function create(e) {
								return new Any(e)
							}
							Any.encode = function encode(e, t) {
								if (!t) t = n.create()
								if (
									e.type_url != null &&
									Object.hasOwnProperty.call(e, "type_url")
								)
									t.uint32(10).string(e.type_url)
								if (e.value != null && Object.hasOwnProperty.call(e, "value"))
									t.uint32(18).bytes(e.value)
								return t
							}
							Any.encodeDelimited = function encodeDelimited(e, t) {
								return this.encode(e, t).ldelim()
							}
							Any.decode = function decode(e, n) {
								if (!(e instanceof t)) e = t.create(e)
								var r = n === undefined ? e.len : e.pos + n,
									i = new o.google.protobuf.Any()
								while (e.pos < r) {
									var a = e.uint32()
									switch (a >>> 3) {
										case 1:
											i.type_url = e.string()
											break
										case 2:
											i.value = e.bytes()
											break
										default:
											e.skipType(a & 7)
											break
									}
								}
								return i
							}
							Any.decodeDelimited = function decodeDelimited(e) {
								if (!(e instanceof t)) e = new t(e)
								return this.decode(e, e.uint32())
							}
							Any.verify = function verify(e) {
								if (typeof e !== "object" || e === null)
									return "object expected"
								if (e.type_url != null && e.hasOwnProperty("type_url"))
									if (!r.isString(e.type_url))
										return "type_url: string expected"
								if (e.value != null && e.hasOwnProperty("value"))
									if (
										!(
											(e.value && typeof e.value.length === "number") ||
											r.isString(e.value)
										)
									)
										return "value: buffer expected"
								return null
							}
							Any.fromObject = function fromObject(e) {
								if (e instanceof o.google.protobuf.Any) return e
								var t = new o.google.protobuf.Any()
								if (e.type_url != null) t.type_url = String(e.type_url)
								if (e.value != null)
									if (typeof e.value === "string")
										r.base64.decode(
											e.value,
											(t.value = r.newBuffer(r.base64.length(e.value))),
											0
										)
									else if (e.value.length) t.value = e.value
								return t
							}
							Any.toObject = function toObject(e, t) {
								if (!t) t = {}
								var n = {}
								if (t.defaults) {
									n.type_url = ""
									if (t.bytes === String) n.value = ""
									else {
										n.value = []
										if (t.bytes !== Array) n.value = r.newBuffer(n.value)
									}
								}
								if (e.type_url != null && e.hasOwnProperty("type_url"))
									n.type_url = e.type_url
								if (e.value != null && e.hasOwnProperty("value"))
									n.value =
										t.bytes === String
											? r.base64.encode(e.value, 0, e.value.length)
											: t.bytes === Array
											? Array.prototype.slice.call(e.value)
											: e.value
								return n
							}
							Any.prototype.toJSON = function toJSON() {
								return this.constructor.toObject(this, e.util.toJSONOptions)
							}
							return Any
						})()
						i.Duration = (function () {
							function Duration(e) {
								if (e)
									for (var t = Object.keys(e), n = 0; n < t.length; ++n)
										if (e[t[n]] != null) this[t[n]] = e[t[n]]
							}
							Duration.prototype.seconds = r.Long
								? r.Long.fromBits(0, 0, false)
								: 0
							Duration.prototype.nanos = 0
							Duration.create = function create(e) {
								return new Duration(e)
							}
							Duration.encode = function encode(e, t) {
								if (!t) t = n.create()
								if (
									e.seconds != null &&
									Object.hasOwnProperty.call(e, "seconds")
								)
									t.uint32(8).int64(e.seconds)
								if (e.nanos != null && Object.hasOwnProperty.call(e, "nanos"))
									t.uint32(16).int32(e.nanos)
								return t
							}
							Duration.encodeDelimited = function encodeDelimited(e, t) {
								return this.encode(e, t).ldelim()
							}
							Duration.decode = function decode(e, n) {
								if (!(e instanceof t)) e = t.create(e)
								var r = n === undefined ? e.len : e.pos + n,
									i = new o.google.protobuf.Duration()
								while (e.pos < r) {
									var a = e.uint32()
									switch (a >>> 3) {
										case 1:
											i.seconds = e.int64()
											break
										case 2:
											i.nanos = e.int32()
											break
										default:
											e.skipType(a & 7)
											break
									}
								}
								return i
							}
							Duration.decodeDelimited = function decodeDelimited(e) {
								if (!(e instanceof t)) e = new t(e)
								return this.decode(e, e.uint32())
							}
							Duration.verify = function verify(e) {
								if (typeof e !== "object" || e === null)
									return "object expected"
								if (e.seconds != null && e.hasOwnProperty("seconds"))
									if (
										!r.isInteger(e.seconds) &&
										!(
											e.seconds &&
											r.isInteger(e.seconds.low) &&
											r.isInteger(e.seconds.high)
										)
									)
										return "seconds: integer|Long expected"
								if (e.nanos != null && e.hasOwnProperty("nanos"))
									if (!r.isInteger(e.nanos)) return "nanos: integer expected"
								return null
							}
							Duration.fromObject = function fromObject(e) {
								if (e instanceof o.google.protobuf.Duration) return e
								var t = new o.google.protobuf.Duration()
								if (e.seconds != null)
									if (r.Long)
										(t.seconds = r.Long.fromValue(e.seconds)).unsigned = false
									else if (typeof e.seconds === "string")
										t.seconds = parseInt(e.seconds, 10)
									else if (typeof e.seconds === "number") t.seconds = e.seconds
									else if (typeof e.seconds === "object")
										t.seconds = new r.LongBits(
											e.seconds.low >>> 0,
											e.seconds.high >>> 0
										).toNumber()
								if (e.nanos != null) t.nanos = e.nanos | 0
								return t
							}
							Duration.toObject = function toObject(e, t) {
								if (!t) t = {}
								var n = {}
								if (t.defaults) {
									if (r.Long) {
										var o = new r.Long(0, 0, false)
										n.seconds =
											t.longs === String
												? o.toString()
												: t.longs === Number
												? o.toNumber()
												: o
									} else n.seconds = t.longs === String ? "0" : 0
									n.nanos = 0
								}
								if (e.seconds != null && e.hasOwnProperty("seconds"))
									if (typeof e.seconds === "number")
										n.seconds =
											t.longs === String ? String(e.seconds) : e.seconds
									else
										n.seconds =
											t.longs === String
												? r.Long.prototype.toString.call(e.seconds)
												: t.longs === Number
												? new r.LongBits(
														e.seconds.low >>> 0,
														e.seconds.high >>> 0
												  ).toNumber()
												: e.seconds
								if (e.nanos != null && e.hasOwnProperty("nanos"))
									n.nanos = e.nanos
								return n
							}
							Duration.prototype.toJSON = function toJSON() {
								return this.constructor.toObject(this, e.util.toJSONOptions)
							}
							return Duration
						})()
						i.Empty = (function () {
							function Empty(e) {
								if (e)
									for (var t = Object.keys(e), n = 0; n < t.length; ++n)
										if (e[t[n]] != null) this[t[n]] = e[t[n]]
							}
							Empty.create = function create(e) {
								return new Empty(e)
							}
							Empty.encode = function encode(e, t) {
								if (!t) t = n.create()
								return t
							}
							Empty.encodeDelimited = function encodeDelimited(e, t) {
								return this.encode(e, t).ldelim()
							}
							Empty.decode = function decode(e, n) {
								if (!(e instanceof t)) e = t.create(e)
								var r = n === undefined ? e.len : e.pos + n,
									i = new o.google.protobuf.Empty()
								while (e.pos < r) {
									var a = e.uint32()
									switch (a >>> 3) {
										default:
											e.skipType(a & 7)
											break
									}
								}
								return i
							}
							Empty.decodeDelimited = function decodeDelimited(e) {
								if (!(e instanceof t)) e = new t(e)
								return this.decode(e, e.uint32())
							}
							Empty.verify = function verify(e) {
								if (typeof e !== "object" || e === null)
									return "object expected"
								return null
							}
							Empty.fromObject = function fromObject(e) {
								if (e instanceof o.google.protobuf.Empty) return e
								return new o.google.protobuf.Empty()
							}
							Empty.toObject = function toObject() {
								return {}
							}
							Empty.prototype.toJSON = function toJSON() {
								return this.constructor.toObject(this, e.util.toJSONOptions)
							}
							return Empty
						})()
						return i
					})()
					i.rpc = (function () {
						var i = {}
						i.Status = (function () {
							function Status(e) {
								this.details = []
								if (e)
									for (var t = Object.keys(e), n = 0; n < t.length; ++n)
										if (e[t[n]] != null) this[t[n]] = e[t[n]]
							}
							Status.prototype.code = 0
							Status.prototype.message = ""
							Status.prototype.details = r.emptyArray
							Status.create = function create(e) {
								return new Status(e)
							}
							Status.encode = function encode(e, t) {
								if (!t) t = n.create()
								if (e.code != null && Object.hasOwnProperty.call(e, "code"))
									t.uint32(8).int32(e.code)
								if (
									e.message != null &&
									Object.hasOwnProperty.call(e, "message")
								)
									t.uint32(18).string(e.message)
								if (e.details != null && e.details.length)
									for (var r = 0; r < e.details.length; ++r)
										o.google.protobuf.Any.encode(
											e.details[r],
											t.uint32(26).fork()
										).ldelim()
								return t
							}
							Status.encodeDelimited = function encodeDelimited(e, t) {
								return this.encode(e, t).ldelim()
							}
							Status.decode = function decode(e, n) {
								if (!(e instanceof t)) e = t.create(e)
								var r = n === undefined ? e.len : e.pos + n,
									i = new o.google.rpc.Status()
								while (e.pos < r) {
									var a = e.uint32()
									switch (a >>> 3) {
										case 1:
											i.code = e.int32()
											break
										case 2:
											i.message = e.string()
											break
										case 3:
											if (!(i.details && i.details.length)) i.details = []
											i.details.push(
												o.google.protobuf.Any.decode(e, e.uint32())
											)
											break
										default:
											e.skipType(a & 7)
											break
									}
								}
								return i
							}
							Status.decodeDelimited = function decodeDelimited(e) {
								if (!(e instanceof t)) e = new t(e)
								return this.decode(e, e.uint32())
							}
							Status.verify = function verify(e) {
								if (typeof e !== "object" || e === null)
									return "object expected"
								if (e.code != null && e.hasOwnProperty("code"))
									if (!r.isInteger(e.code)) return "code: integer expected"
								if (e.message != null && e.hasOwnProperty("message"))
									if (!r.isString(e.message)) return "message: string expected"
								if (e.details != null && e.hasOwnProperty("details")) {
									if (!Array.isArray(e.details))
										return "details: array expected"
									for (var t = 0; t < e.details.length; ++t) {
										var n = o.google.protobuf.Any.verify(e.details[t])
										if (n) return "details." + n
									}
								}
								return null
							}
							Status.fromObject = function fromObject(e) {
								if (e instanceof o.google.rpc.Status) return e
								var t = new o.google.rpc.Status()
								if (e.code != null) t.code = e.code | 0
								if (e.message != null) t.message = String(e.message)
								if (e.details) {
									if (!Array.isArray(e.details))
										throw TypeError(
											".google.rpc.Status.details: array expected"
										)
									t.details = []
									for (var n = 0; n < e.details.length; ++n) {
										if (typeof e.details[n] !== "object")
											throw TypeError(
												".google.rpc.Status.details: object expected"
											)
										t.details[n] = o.google.protobuf.Any.fromObject(
											e.details[n]
										)
									}
								}
								return t
							}
							Status.toObject = function toObject(e, t) {
								if (!t) t = {}
								var n = {}
								if (t.arrays || t.defaults) n.details = []
								if (t.defaults) {
									n.code = 0
									n.message = ""
								}
								if (e.code != null && e.hasOwnProperty("code")) n.code = e.code
								if (e.message != null && e.hasOwnProperty("message"))
									n.message = e.message
								if (e.details && e.details.length) {
									n.details = []
									for (var r = 0; r < e.details.length; ++r)
										n.details[r] = o.google.protobuf.Any.toObject(
											e.details[r],
											t
										)
								}
								return n
							}
							Status.prototype.toJSON = function toJSON() {
								return this.constructor.toObject(this, e.util.toJSONOptions)
							}
							return Status
						})()
						return i
					})()
					return i
				})()
				return o
			})
		},
		281: (e, t, n) => {
			"use strict"
			e.exports = n(774)
		},
		774: (e, t, n) => {
			"use strict"
			var r = t
			r.build = "minimal"
			r.Writer = n(35)
			r.BufferWriter = n(47)
			r.Reader = n(993)
			r.BufferReader = n(544)
			r.util = n(123)
			r.rpc = n(749)
			r.roots = n(210)
			r.configure = configure
			function configure() {
				r.util._configure()
				r.Writer._configure(r.BufferWriter)
				r.Reader._configure(r.BufferReader)
			}
			configure()
		},
		993: (e, t, n) => {
			"use strict"
			e.exports = Reader
			var r = n(123)
			var o
			var i = r.LongBits,
				a = r.utf8
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
			var p =
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
			var s = function create() {
				return r.Buffer
					? function create_buffer_setup(e) {
							return (Reader.create = function create_buffer(e) {
								return r.Buffer.isBuffer(e) ? new o(e) : p(e)
							})(e)
					  }
					: p
			}
			Reader.create = s()
			Reader.prototype._slice =
				r.Array.prototype.subarray || r.Array.prototype.slice
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
				var e = r.float.readFloatLE(this.buf, this.pos)
				this.pos += 4
				return e
			}
			Reader.prototype.double = function read_double() {
				if (this.pos + 8 > this.len) throw indexOutOfRange(this, 4)
				var e = r.float.readDoubleLE(this.buf, this.pos)
				this.pos += 8
				return e
			}
			Reader.prototype.bytes = function read_bytes() {
				var e = this.uint32(),
					t = this.pos,
					n = this.pos + e
				if (n > this.len) throw indexOutOfRange(this, e)
				this.pos += e
				if (Array.isArray(this.buf)) return this.buf.slice(t, n)
				return t === n
					? new this.buf.constructor(0)
					: this._slice.call(this.buf, t, n)
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
				o = e
				Reader.create = s()
				o._configure()
				var t = r.Long ? "toLong" : "toNumber"
				r.merge(Reader.prototype, {
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
		544: (e, t, n) => {
			"use strict"
			e.exports = BufferReader
			var r = n(993)
			;(BufferReader.prototype = Object.create(r.prototype)).constructor =
				BufferReader
			var o = n(123)
			function BufferReader(e) {
				r.call(this, e)
			}
			BufferReader._configure = function () {
				if (o.Buffer) BufferReader.prototype._slice = o.Buffer.prototype.slice
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
		749: (e, t, n) => {
			"use strict"
			var r = t
			r.Service = n(968)
		},
		968: (e, t, n) => {
			"use strict"
			e.exports = Service
			var r = n(123)
			;(Service.prototype = Object.create(
				r.EventEmitter.prototype
			)).constructor = Service
			function Service(e, t, n) {
				if (typeof e !== "function")
					throw TypeError("rpcImpl must be a function")
				r.EventEmitter.call(this)
				this.rpcImpl = e
				this.requestDelimited = Boolean(t)
				this.responseDelimited = Boolean(n)
			}
			Service.prototype.rpcCall = function rpcCall(e, t, n, o, i) {
				if (!o) throw TypeError("request must be specified")
				var a = this
				if (!i) return r.asPromise(rpcCall, a, e, t, n, o)
				if (!a.rpcImpl) {
					setTimeout(function () {
						i(Error("already ended"))
					}, 0)
					return undefined
				}
				try {
					return a.rpcImpl(
						e,
						t[a.requestDelimited ? "encodeDelimited" : "encode"](o).finish(),
						function rpcCallback(t, r) {
							if (t) {
								a.emit("error", t, e)
								return i(t)
							}
							if (r === null) {
								a.end(true)
								return undefined
							}
							if (!(r instanceof n)) {
								try {
									r = n[a.responseDelimited ? "decodeDelimited" : "decode"](r)
								} catch (t) {
									a.emit("error", t, e)
									return i(t)
								}
							}
							a.emit("data", r, e)
							return i(null, r)
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
		361: (e, t, n) => {
			"use strict"
			e.exports = LongBits
			var r = n(123)
			function LongBits(e, t) {
				this.lo = e >>> 0
				this.hi = t >>> 0
			}
			var o = (LongBits.zero = new LongBits(0, 0))
			o.toNumber = function () {
				return 0
			}
			o.zzEncode = o.zzDecode = function () {
				return this
			}
			o.length = function () {
				return 1
			}
			var i = (LongBits.zeroHash = "\0\0\0\0\0\0\0\0")
			LongBits.fromNumber = function fromNumber(e) {
				if (e === 0) return o
				var t = e < 0
				if (t) e = -e
				var n = e >>> 0,
					r = ((e - n) / 4294967296) >>> 0
				if (t) {
					r = ~r >>> 0
					n = ~n >>> 0
					if (++n > 4294967295) {
						n = 0
						if (++r > 4294967295) r = 0
					}
				}
				return new LongBits(n, r)
			}
			LongBits.from = function from(e) {
				if (typeof e === "number") return LongBits.fromNumber(e)
				if (r.isString(e)) {
					if (r.Long) e = r.Long.fromString(e)
					else return LongBits.fromNumber(parseInt(e, 10))
				}
				return e.low || e.high ? new LongBits(e.low >>> 0, e.high >>> 0) : o
			}
			LongBits.prototype.toNumber = function toNumber(e) {
				if (!e && this.hi >>> 31) {
					var t = (~this.lo + 1) >>> 0,
						n = ~this.hi >>> 0
					if (!t) n = (n + 1) >>> 0
					return -(t + n * 4294967296)
				}
				return this.lo + this.hi * 4294967296
			}
			LongBits.prototype.toLong = function toLong(e) {
				return r.Long
					? new r.Long(this.lo | 0, this.hi | 0, Boolean(e))
					: { low: this.lo | 0, high: this.hi | 0, unsigned: Boolean(e) }
			}
			var a = String.prototype.charCodeAt
			LongBits.fromHash = function fromHash(e) {
				if (e === i) return o
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
					n = this.hi >>> 24
				return n === 0
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
					: n < 128
					? 9
					: 10
			}
		},
		123: function (e, t, n) {
			"use strict"
			var r = t
			r.asPromise = n(776)
			r.base64 = n(869)
			r.EventEmitter = n(536)
			r.float = n(611)
			r.inquire = n(379)
			r.utf8 = n(112)
			r.pool = n(41)
			r.LongBits = n(361)
			r.isNode = Boolean(
				typeof global !== "undefined" &&
					global &&
					global.process &&
					global.process.versions &&
					global.process.versions.node
			)
			r.global =
				(r.isNode && global) ||
				(typeof window !== "undefined" && window) ||
				(typeof self !== "undefined" && self) ||
				this
			r.emptyArray = Object.freeze ? Object.freeze([]) : []
			r.emptyObject = Object.freeze ? Object.freeze({}) : {}
			r.isInteger =
				Number.isInteger ||
				function isInteger(e) {
					return typeof e === "number" && isFinite(e) && Math.floor(e) === e
				}
			r.isString = function isString(e) {
				return typeof e === "string" || e instanceof String
			}
			r.isObject = function isObject(e) {
				return e && typeof e === "object"
			}
			r.isset = r.isSet = function isSet(e, t) {
				var n = e[t]
				if (n != null && e.hasOwnProperty(t))
					return (
						typeof n !== "object" ||
						(Array.isArray(n) ? n.length : Object.keys(n).length) > 0
					)
				return false
			}
			r.Buffer = (function () {
				try {
					var e = r.inquire("buffer").Buffer
					return e.prototype.utf8Write ? e : null
				} catch (e) {
					return null
				}
			})()
			r._Buffer_from = null
			r._Buffer_allocUnsafe = null
			r.newBuffer = function newBuffer(e) {
				return typeof e === "number"
					? r.Buffer
						? r._Buffer_allocUnsafe(e)
						: new r.Array(e)
					: r.Buffer
					? r._Buffer_from(e)
					: typeof Uint8Array === "undefined"
					? e
					: new Uint8Array(e)
			}
			r.Array = typeof Uint8Array !== "undefined" ? Uint8Array : Array
			r.Long =
				(r.global.dcodeIO && r.global.dcodeIO.Long) ||
				r.global.Long ||
				r.inquire("long")
			r.key2Re = /^true|false|0|1$/
			r.key32Re = /^-?(?:0|[1-9][0-9]*)$/
			r.key64Re = /^(?:[\\x00-\\xff]{8}|-?(?:0|[1-9][0-9]*))$/
			r.longToHash = function longToHash(e) {
				return e ? r.LongBits.from(e).toHash() : r.LongBits.zeroHash
			}
			r.longFromHash = function longFromHash(e, t) {
				var n = r.LongBits.fromHash(e)
				if (r.Long) return r.Long.fromBits(n.lo, n.hi, t)
				return n.toNumber(Boolean(t))
			}
			function merge(e, t, n) {
				for (var r = Object.keys(t), o = 0; o < r.length; ++o)
					if (e[r[o]] === undefined || !n) e[r[o]] = t[r[o]]
				return e
			}
			r.merge = merge
			r.lcFirst = function lcFirst(e) {
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
			r.newError = newError
			r.ProtocolError = newError("ProtocolError")
			r.oneOfGetter = function getOneOf(e) {
				var t = {}
				for (var n = 0; n < e.length; ++n) t[e[n]] = 1
				return function () {
					for (var e = Object.keys(this), n = e.length - 1; n > -1; --n)
						if (
							t[e[n]] === 1 &&
							this[e[n]] !== undefined &&
							this[e[n]] !== null
						)
							return e[n]
				}
			}
			r.oneOfSetter = function setOneOf(e) {
				return function (t) {
					for (var n = 0; n < e.length; ++n) if (e[n] !== t) delete this[e[n]]
				}
			}
			r.toJSONOptions = {
				longs: String,
				enums: String,
				bytes: String,
				json: true
			}
			r._configure = function () {
				var e = r.Buffer
				if (!e) {
					r._Buffer_from = r._Buffer_allocUnsafe = null
					return
				}
				r._Buffer_from =
					(e.from !== Uint8Array.from && e.from) ||
					function Buffer_from(t, n) {
						return new e(t, n)
					}
				r._Buffer_allocUnsafe =
					e.allocUnsafe ||
					function Buffer_allocUnsafe(t) {
						return new e(t)
					}
			}
		},
		35: (e, t, n) => {
			"use strict"
			e.exports = Writer
			var r = n(123)
			var o
			var i = r.LongBits,
				a = r.base64,
				p = r.utf8
			function Op(e, t, n) {
				this.fn = e
				this.len = t
				this.next = undefined
				this.val = n
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
			var s = function create() {
				return r.Buffer
					? function create_buffer_setup() {
							return (Writer.create = function create_buffer() {
								return new o()
							})()
					  }
					: function create_array() {
							return new Writer()
					  }
			}
			Writer.create = s()
			Writer.alloc = function alloc(e) {
				return new r.Array(e)
			}
			if (r.Array !== Array)
				Writer.alloc = r.pool(Writer.alloc, r.Array.prototype.subarray)
			Writer.prototype._push = function push(e, t, n) {
				this.tail = this.tail.next = new Op(e, t, n)
				this.len += t
				return this
			}
			function writeByte(e, t, n) {
				t[n] = e & 255
			}
			function writeVarint32(e, t, n) {
				while (e > 127) {
					t[n++] = (e & 127) | 128
					e >>>= 7
				}
				t[n] = e
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
			function writeVarint64(e, t, n) {
				while (e.hi) {
					t[n++] = (e.lo & 127) | 128
					e.lo = ((e.lo >>> 7) | (e.hi << 25)) >>> 0
					e.hi >>>= 7
				}
				while (e.lo > 127) {
					t[n++] = (e.lo & 127) | 128
					e.lo = e.lo >>> 7
				}
				t[n++] = e.lo
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
			function writeFixed32(e, t, n) {
				t[n] = e & 255
				t[n + 1] = (e >>> 8) & 255
				t[n + 2] = (e >>> 16) & 255
				t[n + 3] = e >>> 24
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
				return this._push(r.float.writeFloatLE, 4, e)
			}
			Writer.prototype.double = function write_double(e) {
				return this._push(r.float.writeDoubleLE, 8, e)
			}
			var l = r.Array.prototype.set
				? function writeBytes_set(e, t, n) {
						t.set(e, n)
				  }
				: function writeBytes_for(e, t, n) {
						for (var r = 0; r < e.length; ++r) t[n + r] = e[r]
				  }
			Writer.prototype.bytes = function write_bytes(e) {
				var t = e.length >>> 0
				if (!t) return this._push(writeByte, 1, 0)
				if (r.isString(e)) {
					var n = Writer.alloc((t = a.length(e)))
					a.decode(e, n, 0)
					e = n
				}
				return this.uint32(t)._push(l, t, e)
			}
			Writer.prototype.string = function write_string(e) {
				var t = p.length(e)
				return t
					? this.uint32(t)._push(p.write, t, e)
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
					n = this.len
				this.reset().uint32(n)
				if (n) {
					this.tail.next = e.next
					this.tail = t
					this.len += n
				}
				return this
			}
			Writer.prototype.finish = function finish() {
				var e = this.head.next,
					t = this.constructor.alloc(this.len),
					n = 0
				while (e) {
					e.fn(e.val, t, n)
					n += e.len
					e = e.next
				}
				return t
			}
			Writer._configure = function (e) {
				o = e
				Writer.create = s()
				o._configure()
			}
		},
		47: (e, t, n) => {
			"use strict"
			e.exports = BufferWriter
			var r = n(35)
			;(BufferWriter.prototype = Object.create(r.prototype)).constructor =
				BufferWriter
			var o = n(123)
			function BufferWriter() {
				r.call(this)
			}
			BufferWriter._configure = function () {
				BufferWriter.alloc = o._Buffer_allocUnsafe
				BufferWriter.writeBytesBuffer =
					o.Buffer &&
					o.Buffer.prototype instanceof Uint8Array &&
					o.Buffer.prototype.set.name === "set"
						? function writeBytesBuffer_set(e, t, n) {
								t.set(e, n)
						  }
						: function writeBytesBuffer_copy(e, t, n) {
								if (e.copy) e.copy(t, n, 0, e.length)
								else for (var r = 0; r < e.length; ) t[n++] = e[r++]
						  }
			}
			BufferWriter.prototype.bytes = function write_bytes_buffer(e) {
				if (o.isString(e)) e = o._Buffer_from(e, "base64")
				var t = e.length >>> 0
				this.uint32(t)
				if (t) this._push(BufferWriter.writeBytesBuffer, t, e)
				return this
			}
			function writeStringBuffer(e, t, n) {
				if (e.length < 40) o.utf8.write(e, t, n)
				else if (t.utf8Write) t.utf8Write(e, n)
				else t.write(e, n)
			}
			BufferWriter.prototype.string = function write_string_buffer(e) {
				var t = o.Buffer.byteLength(e)
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
		var n = (__webpack_module_cache__[e] = {
			id: e,
			loaded: false,
			exports: {}
		})
		var r = true
		try {
			__webpack_modules__[e].call(n.exports, n, n.exports, __nccwpck_require__)
			r = false
		} finally {
			if (r) delete __webpack_module_cache__[e]
		}
		n.loaded = true
		return n.exports
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
	var __webpack_exports__ = __nccwpck_require__(400)
	module.exports = __webpack_exports__
})()
//# sourceMappingURL=protos/operations.js.map
