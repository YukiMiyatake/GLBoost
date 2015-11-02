/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _interopRequireDefault = __webpack_require__(1)['default'];

	var _Renderer = __webpack_require__(2);

	var _Renderer2 = _interopRequireDefault(_Renderer);

	var _Scene = __webpack_require__(48);

	var _Scene2 = _interopRequireDefault(_Scene);

	var _Vector2 = __webpack_require__(49);

	var _Vector22 = _interopRequireDefault(_Vector2);

	var _Vector3 = __webpack_require__(44);

	var _Vector32 = _interopRequireDefault(_Vector3);

	var _Vector4 = __webpack_require__(50);

	var _Vector42 = _interopRequireDefault(_Vector4);

	var _ClassicMaterial = __webpack_require__(51);

	var _ClassicMaterial2 = _interopRequireDefault(_ClassicMaterial);

	var _Texture = __webpack_require__(52);

	var _Texture2 = _interopRequireDefault(_Texture);

	var _Camera = __webpack_require__(43);

	var _Camera2 = _interopRequireDefault(_Camera);

	var _BlendShapeMesh = __webpack_require__(53);

	var _BlendShapeMesh2 = _interopRequireDefault(_BlendShapeMesh);

	var _ObjLoader = __webpack_require__(55);

	var _ObjLoader2 = _interopRequireDefault(_ObjLoader);

/***/ },
/* 1 */
/***/ function(module, exports) {

	"use strict";

	exports["default"] = function (obj) {
	  return obj && obj.__esModule ? obj : {
	    "default": obj
	  };
	};

	exports.__esModule = true;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = __webpack_require__(3)['default'];

	var _classCallCheck = __webpack_require__(7)['default'];

	var _interopRequireDefault = __webpack_require__(1)['default'];

	var _globals = __webpack_require__(8);

	var _globals2 = _interopRequireDefault(_globals);

	var _Mesh = __webpack_require__(9);

	var _Mesh2 = _interopRequireDefault(_Mesh);

	var _Camera = __webpack_require__(43);

	var _Camera2 = _interopRequireDefault(_Camera);

	var _Matrix4x4 = __webpack_require__(35);

	var _Matrix4x42 = _interopRequireDefault(_Matrix4x4);

	var _GLContext = __webpack_require__(36);

	var _GLContext2 = _interopRequireDefault(_GLContext);

	var _GLExtentionsManager = __webpack_require__(40);

	var _GLExtentionsManager2 = _interopRequireDefault(_GLExtentionsManager);

	var _MutableTexture = __webpack_require__(45);

	var _MutableTexture2 = _interopRequireDefault(_MutableTexture);

	var _RenderPass = __webpack_require__(47);

	var _RenderPass2 = _interopRequireDefault(_RenderPass);

	var Renderer = (function () {
	  function Renderer(parameters) {
	    _classCallCheck(this, Renderer);

	    var _canvas = parameters.canvas;
	    var _clearColor = parameters.clearColor;

	    this._gl = _GLContext2['default'].getInstance(_canvas).gl;

	    var gl = this._gl;

	    var setDefaultGLStates = function setDefaultGLStates() {
	      gl.frontFace(gl.CCW);
	      gl.cullFace(gl.BACK);
	      gl.enable(gl.CULL_FACE);

	      gl.enable(gl.DEPTH_TEST);
	      gl.depthFunc(gl.LEQUAL);

	      gl.enable(gl.BLEND);
	      gl.blendEquation(gl.FUNC_ADD);
	      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

	      gl.clearColor(_clearColor.red, _clearColor.green, _clearColor.blue, _clearColor.alpha);
	      gl.clearDepth(1);
	      gl.clearStencil(0);
	    };

	    setDefaultGLStates();

	    this._currentRenderTargetTextures = [];
	    this._renderPasses = null;
	  }

	  _createClass(Renderer, [{
	    key: 'draw',
	    value: function draw(scene) {
	      var _this = this;

	      var projectionAndViewMatrix = null;
	      scene.elements.forEach(function (elm) {
	        if (elm instanceof _Camera2['default']) {
	          if (elm.isMainCamera) {
	            projectionAndViewMatrix = _Matrix4x42['default'].multiply(elm.perspectiveRHMatrix(), elm.lookAtRHMatrix());
	            projectionAndViewMatrix = _Matrix4x42['default'].transpose(projectionAndViewMatrix);
	          }
	        }
	      });

	      var gl = this._gl;
	      var glem = _GLExtentionsManager2['default'].getInstance(gl);

	      // if you didn't setup RenderPasses, all meshes are drawn to the backbuffer of framebuffer (gl.BACK).
	      if (this._renderPasses === null) {
	        glem.drawBuffers(gl, [gl.BACK]);

	        scene.elements.forEach(function (elm) {
	          if (elm instanceof _Mesh2['default']) {
	            elm.draw(projectionAndViewMatrix);
	          }
	        });
	      } else {
	        // if you did setup RenderPasses, drawing meshes are executed for each RenderPass.
	        this._renderPasses.forEach(function (renderPass) {

	          if (renderPass.buffersToDraw[0] !== gl.BACK) {
	            gl.bindFramebuffer(gl.FRAMEBUFFER, _this._fbo);
	          }
	          glem.drawBuffers(gl, renderPass.buffersToDraw); // set render target buffers for each RenderPass.

	          if (renderPass.clearColor) {
	            var color = renderPass.clearColor;
	            gl.clearColor(color[0], color[1], color[2], color[3]);
	            gl.clear(gl.COLOR_BUFFER_BIT);
	          }

	          var meshes = renderPass.getMeshes();
	          meshes.forEach(function (mesh) {
	            mesh.draw(projectionAndViewMatrix);
	          });

	          gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	          glem.drawBuffers(gl, [gl.BACK]);
	        });
	      }
	    }
	  }, {
	    key: 'clearCanvas',
	    value: function clearCanvas(color_flg, depth_flg, stencil_flg) {

	      var gl = this._gl;

	      var bufferBits = 0;

	      if (color_flg === void 0 || color_flg) bufferBits |= gl.COLOR_BUFFER_BIT;
	      if (depth_flg === void 0 || depth_flg) bufferBits |= gl.DEPTH_BUFFER_BIT;
	      if (stencil_flg === void 0 || stencil_flg) bufferBits |= gl.STENCIL_BUFFER_BIT;

	      gl.clear(bufferBits);
	    }
	  }, {
	    key: 'createTexturesForRenderTarget',
	    value: function createTexturesForRenderTarget(width, height, textureNum) {

	      var gl = this._gl;

	      var glem = _GLExtentionsManager2['default'].getInstance(gl);

	      if (this._fbo) {
	        gl.deleteFramebuffers(1, this._fbo);
	      }
	      // Create FBO
	      this._fbo = gl.createFramebuffer();
	      gl.bindFramebuffer(gl.FRAMEBUFFER, this._fbo);
	      this._fbo.width = width ? width : gl._canvas.width;
	      this._fbo.height = height ? height : gl._canvas.height;

	      for (var i = 0; i < textureNum; i++) {
	        var texture = new _MutableTexture2['default'](gl._canvas, this._fbo.width, this._fbo.height);
	        this._currentRenderTargetTextures.push(texture);
	      }

	      // Create RenderBuffer
	      var renderbuffer = gl.createRenderbuffer();
	      gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
	      gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this._fbo.width, this._fbo.height);

	      // Attach Buffers
	      this._currentRenderTargetTextures.forEach(function (texture, i) {
	        var glTexture = texture.glTextureResource;
	        var attachimentId = glem.colorAttachiment(gl, i);
	        texture.colorAttachiment = attachimentId;
	        gl.framebufferTexture2D(gl.FRAMEBUFFER, attachimentId, gl.TEXTURE_2D, glTexture, 0);
	      });
	      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);

	      gl.bindTexture(gl.TEXTURE_2D, null);
	      gl.bindRenderbuffer(gl.RENDERBUFFER, null);
	      gl.bindFramebuffer(gl.FRAMEBUFFER, null);

	      return this._currentRenderTargetTextures;
	    }
	  }, {
	    key: 'createRenderPasses',
	    value: function createRenderPasses(number) {
	      this._renderPasses = [];
	      for (var i = 0; i < number; i++) {
	        this._renderPasses.push(new _RenderPass2['default'](this._gl));
	      }

	      return this._renderPasses;
	    }
	  }]);

	  return Renderer;
	})();

	_globals2['default']["Renderer"] = Renderer;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _Object$defineProperty = __webpack_require__(4)["default"];

	exports["default"] = (function () {
	  function defineProperties(target, props) {
	    for (var i = 0; i < props.length; i++) {
	      var descriptor = props[i];
	      descriptor.enumerable = descriptor.enumerable || false;
	      descriptor.configurable = true;
	      if ("value" in descriptor) descriptor.writable = true;

	      _Object$defineProperty(target, descriptor.key, descriptor);
	    }
	  }

	  return function (Constructor, protoProps, staticProps) {
	    if (protoProps) defineProperties(Constructor.prototype, protoProps);
	    if (staticProps) defineProperties(Constructor, staticProps);
	    return Constructor;
	  };
	})();

	exports.__esModule = true;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(5), __esModule: true };

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(6);
	module.exports = function defineProperty(it, key, desc){
	  return $.setDesc(it, key, desc);
	};

/***/ },
/* 6 */
/***/ function(module, exports) {

	var $Object = Object;
	module.exports = {
	  create:     $Object.create,
	  getProto:   $Object.getPrototypeOf,
	  isEnum:     {}.propertyIsEnumerable,
	  getDesc:    $Object.getOwnPropertyDescriptor,
	  setDesc:    $Object.defineProperty,
	  setDescs:   $Object.defineProperties,
	  getKeys:    $Object.keys,
	  getNames:   $Object.getOwnPropertyNames,
	  getSymbols: $Object.getOwnPropertySymbols,
	  each:       [].forEach
	};

/***/ },
/* 7 */
/***/ function(module, exports) {

	"use strict";

	exports["default"] = function (instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	};

	exports.__esModule = true;

/***/ },
/* 8 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	window.GLBoost = window.GLBoost || { REVISION: '1' };

	var global = window;
	global.GLBoost["TARGET_WEBGL_VERSION"] = 1;
	global.GLBoost["POSITION"] = 'position';
	global.GLBoost["COLOR"] = 'color';
	global.GLBoost["TEXCOORD"] = 'texcoord';
	global.GLBoost["BLENDTARGET1"] = 'shapetarget_1';
	global.GLBoost["BLENDTARGET2"] = 'shapetarget_2';
	global.GLBoost["BLENDTARGET3"] = 'shapetarget_3';
	global.GLBoost["BLENDTARGET4"] = 'shapetarget_4';
	global.GLBoost["BLENDTARGET5"] = 'shapetarget_5';
	global.GLBoost["BLENDTARGET6"] = 'shapetarget_6';
	global.GLBoost["BLENDTARGET7"] = 'shapetarget_7';
	global.GLBoost["BLENDTARGET8"] = 'shapetarget_8';
	global.GLBoost["BLENDTARGET9"] = 'shapetarget_9';
	global.GLBoost["BLENDTARGET10"] = 'shapetarget_10';

	exports["default"] = global.GLBoost;

	global.GLBoost.isThisGLVersion_2 = function (gl) {
	  if (typeof WebGL2RenderingContext === "undefined") {
	    return false;
	  }
	  return gl instanceof WebGL2RenderingContext;
	};
	module.exports = exports["default"];

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _get = __webpack_require__(10)['default'];

	var _inherits = __webpack_require__(23)['default'];

	var _createClass = __webpack_require__(3)['default'];

	var _classCallCheck = __webpack_require__(7)['default'];

	var _interopRequireDefault = __webpack_require__(1)['default'];

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _globals = __webpack_require__(8);

	var _globals2 = _interopRequireDefault(_globals);

	var _Element2 = __webpack_require__(34);

	var _Element3 = _interopRequireDefault(_Element2);

	var _Matrix4x4 = __webpack_require__(35);

	var _Matrix4x42 = _interopRequireDefault(_Matrix4x4);

	var _GLContext = __webpack_require__(36);

	var _GLContext2 = _interopRequireDefault(_GLContext);

	var _GLExtentionsManager = __webpack_require__(40);

	var _GLExtentionsManager2 = _interopRequireDefault(_GLExtentionsManager);

	var _SimpleShader = __webpack_require__(41);

	var _SimpleShader2 = _interopRequireDefault(_SimpleShader);

	var Mesh = (function (_Element) {
	  _inherits(Mesh, _Element);

	  function Mesh(canvas) {
	    _classCallCheck(this, Mesh);

	    _get(Object.getPrototypeOf(Mesh.prototype), 'constructor', this).call(this);
	    this._gl = _GLContext2['default'].getInstance(canvas).gl;
	    this.canvas = canvas;
	    this._material = null;
	    this._vertexN = 0;
	    this._stride = 0;
	    this._glslProgram = null;
	    this._vertices = null;
	  }

	  /**
	   * データとして利用する頂点属性を判断し、そのリストを返す
	   * 不必要な頂点属性のデータは無視する。
	   */

	  _createClass(Mesh, [{
	    key: '_decideNeededVertexAttribs',
	    value: function _decideNeededVertexAttribs(vertices) {
	      var attribNameArray = [];
	      for (var attribName in vertices) {
	        if (attribName === _globals2['default'].TEXCOORD) {
	          // texcoordの場合は、テクスチャ付きのマテリアルをちゃんと持っているときに限り、'texcoord'が有効となる
	          if (this._material !== null && this._material.diffuseTexture !== null) {
	            attribNameArray.push(attribName);
	          } else {
	            delete vertices[_globals2['default'].TEXCOORD];
	          }
	        } else {
	          if (attribName !== 'index') {
	            attribNameArray.push(attribName);
	          }
	        }
	      }

	      return attribNameArray;
	    }
	  }, {
	    key: '_getSheder',
	    value: function _getSheder(result, existCamera_f) {
	      var simpleShader = _SimpleShader2['default'].getInstance(this.canvas);
	      return simpleShader.getShaderProgram(result, existCamera_f);
	    }
	  }, {
	    key: 'setVerticesData',
	    value: function setVerticesData(vertices) {
	      this._vertices = vertices;
	    }
	  }, {
	    key: 'prepareForRender',
	    value: function prepareForRender(existCamera_f) {
	      var _this = this;

	      var vertices = this._vertices;
	      var gl = this._gl;
	      //    var extVAO = GLExtentionsManager.getInstance(gl).extVAO;
	      var glem = _GLExtentionsManager2['default'].getInstance(gl);

	      // GLSLプログラム作成。
	      var optimizedVertexAttrib = this._decideNeededVertexAttribs(vertices);
	      var glslProgram = this._getSheder(optimizedVertexAttrib, existCamera_f);

	      // create VAO
	      var vao = glem.createVertexArray(gl);
	      glem.bindVertexArray(gl, vao);

	      // create VBO
	      var verticesBuffer = gl.createBuffer();
	      gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);

	      this._vertexN = vertices.position.length;

	      var vertexData = [];

	      this._stride = 0;
	      vertices.position.forEach(function (elem, index, array) {
	        optimizedVertexAttrib.forEach(function (attribName) {
	          var element = vertices[attribName][index];
	          vertexData.push(element.x);
	          vertexData.push(element.y);
	          if (element.z !== void 0) {
	            vertexData.push(element.z);
	          }
	        });
	      });

	      optimizedVertexAttrib.forEach(function (attribName) {
	        var numberOfComponentOfVector = vertices[attribName][0].z === void 0 ? 2 : 3;
	        _this._stride += numberOfComponentOfVector * 4;
	      });

	      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

	      // 頂点レイアウト設定
	      var offset = 0;
	      optimizedVertexAttrib.forEach(function (attribName) {
	        gl.enableVertexAttribArray(glslProgram['vertexAttribute_' + attribName]);
	        var numberOfComponentOfVector = vertices[attribName][0].z === void 0 ? 2 : 3;
	        gl.vertexAttribPointer(glslProgram['vertexAttribute_' + attribName], numberOfComponentOfVector, gl.FLOAT, gl.FALSE, _this._stride, offset);
	        offset += numberOfComponentOfVector * 4;
	      });
	      gl.bindBuffer(gl.ARRAY_BUFFER, null);

	      if (vertices.index) {
	        // create Index Buffer
	        this._indicesBuffer = gl.createBuffer();
	        this._indicesN = vertices.index.length;
	        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indicesBuffer);
	        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertices.index), gl.STATIC_DRAW);
	        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	      } else {
	        this._indicesBuffer = null;
	      }

	      glem.bindVertexArray(gl, null);

	      this._vao = vao;
	      this._glslProgram = glslProgram;
	    }
	  }, {
	    key: 'draw',
	    value: function draw(projectionAndViewMatrix) {
	      var gl = this._gl;
	      var glem = _GLExtentionsManager2['default'].getInstance(gl);
	      var material = this._material;

	      gl.useProgram(this._glslProgram);

	      if (projectionAndViewMatrix) {
	        var pv_m = projectionAndViewMatrix;
	        gl.uniformMatrix4fv(this._glslProgram.projectionAndViewMatrix, false, new Float32Array(pv_m.flatten()));
	      }

	      glem.bindVertexArray(gl, this._vao);

	      if (material) {
	        material.setUp();
	      }

	      if (this._indicesBuffer) {
	        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indicesBuffer);
	        gl.drawElements(gl.TRIANGLES, this._indicesN, gl.UNSIGNED_SHORT, 0);
	        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	      } else {
	        gl.drawArrays(gl.TRIANGLES, 0, this._vertexN);
	      }

	      if (material) {
	        material.tearDown();
	      }

	      glem.bindVertexArray(gl, null);
	    }
	  }, {
	    key: 'material',
	    set: function set(mat) {
	      this._material = mat;
	    }
	  }]);

	  return Mesh;
	})(_Element3['default']);

	exports['default'] = Mesh;

	_globals2['default']["Mesh"] = Mesh;
	module.exports = exports['default'];

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _Object$getOwnPropertyDescriptor = __webpack_require__(11)["default"];

	exports["default"] = function get(_x, _x2, _x3) {
	  var _again = true;

	  _function: while (_again) {
	    var object = _x,
	        property = _x2,
	        receiver = _x3;
	    desc = parent = getter = undefined;
	    _again = false;
	    if (object === null) object = Function.prototype;

	    var desc = _Object$getOwnPropertyDescriptor(object, property);

	    if (desc === undefined) {
	      var parent = Object.getPrototypeOf(object);

	      if (parent === null) {
	        return undefined;
	      } else {
	        _x = parent;
	        _x2 = property;
	        _x3 = receiver;
	        _again = true;
	        continue _function;
	      }
	    } else if ("value" in desc) {
	      return desc.value;
	    } else {
	      var getter = desc.get;

	      if (getter === undefined) {
	        return undefined;
	      }

	      return getter.call(receiver);
	    }
	  }
	};

	exports.__esModule = true;

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(12), __esModule: true };

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(6);
	__webpack_require__(13);
	module.exports = function getOwnPropertyDescriptor(it, key){
	  return $.getDesc(it, key);
	};

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
	var toIObject = __webpack_require__(14);

	__webpack_require__(18)('getOwnPropertyDescriptor', function($getOwnPropertyDescriptor){
	  return function getOwnPropertyDescriptor(it, key){
	    return $getOwnPropertyDescriptor(toIObject(it), key);
	  };
	});

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	// to indexed object, toObject with fallback for non-array-like ES3 strings
	var IObject = __webpack_require__(15)
	  , defined = __webpack_require__(17);
	module.exports = function(it){
	  return IObject(defined(it));
	};

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	// indexed object, fallback for non-array-like ES3 strings
	var cof = __webpack_require__(16);
	module.exports = 0 in Object('z') ? Object : function(it){
	  return cof(it) == 'String' ? it.split('') : Object(it);
	};

/***/ },
/* 16 */
/***/ function(module, exports) {

	var toString = {}.toString;

	module.exports = function(it){
	  return toString.call(it).slice(8, -1);
	};

/***/ },
/* 17 */
/***/ function(module, exports) {

	// 7.2.1 RequireObjectCoercible(argument)
	module.exports = function(it){
	  if(it == undefined)throw TypeError("Can't call method on  " + it);
	  return it;
	};

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	// most Object methods by ES6 should accept primitives
	module.exports = function(KEY, exec){
	  var $def = __webpack_require__(19)
	    , fn   = (__webpack_require__(21).Object || {})[KEY] || Object[KEY]
	    , exp  = {};
	  exp[KEY] = exec(fn);
	  $def($def.S + $def.F * __webpack_require__(22)(function(){ fn(1); }), 'Object', exp);
	};

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	var global    = __webpack_require__(20)
	  , core      = __webpack_require__(21)
	  , PROTOTYPE = 'prototype';
	var ctx = function(fn, that){
	  return function(){
	    return fn.apply(that, arguments);
	  };
	};
	var $def = function(type, name, source){
	  var key, own, out, exp
	    , isGlobal = type & $def.G
	    , isProto  = type & $def.P
	    , target   = isGlobal ? global : type & $def.S
	        ? global[name] : (global[name] || {})[PROTOTYPE]
	    , exports  = isGlobal ? core : core[name] || (core[name] = {});
	  if(isGlobal)source = name;
	  for(key in source){
	    // contains in native
	    own = !(type & $def.F) && target && key in target;
	    if(own && key in exports)continue;
	    // export native or passed
	    out = own ? target[key] : source[key];
	    // prevent global pollution for namespaces
	    if(isGlobal && typeof target[key] != 'function')exp = source[key];
	    // bind timers to global for call from export context
	    else if(type & $def.B && own)exp = ctx(out, global);
	    // wrap global constructors for prevent change them in library
	    else if(type & $def.W && target[key] == out)!function(C){
	      exp = function(param){
	        return this instanceof C ? new C(param) : C(param);
	      };
	      exp[PROTOTYPE] = C[PROTOTYPE];
	    }(out);
	    else exp = isProto && typeof out == 'function' ? ctx(Function.call, out) : out;
	    // export
	    exports[key] = exp;
	    if(isProto)(exports[PROTOTYPE] || (exports[PROTOTYPE] = {}))[key] = out;
	  }
	};
	// type bitmap
	$def.F = 1;  // forced
	$def.G = 2;  // global
	$def.S = 4;  // static
	$def.P = 8;  // proto
	$def.B = 16; // bind
	$def.W = 32; // wrap
	module.exports = $def;

/***/ },
/* 20 */
/***/ function(module, exports) {

	// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	var UNDEFINED = 'undefined';
	var global = module.exports = typeof window != UNDEFINED && window.Math == Math
	  ? window : typeof self != UNDEFINED && self.Math == Math ? self : Function('return this')();
	if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef

/***/ },
/* 21 */
/***/ function(module, exports) {

	var core = module.exports = {version: '1.2.1'};
	if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef

/***/ },
/* 22 */
/***/ function(module, exports) {

	module.exports = function(exec){
	  try {
	    return !!exec();
	  } catch(e){
	    return true;
	  }
	};

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _Object$create = __webpack_require__(24)["default"];

	var _Object$setPrototypeOf = __webpack_require__(26)["default"];

	exports["default"] = function (subClass, superClass) {
	  if (typeof superClass !== "function" && superClass !== null) {
	    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
	  }

	  subClass.prototype = _Object$create(superClass && superClass.prototype, {
	    constructor: {
	      value: subClass,
	      enumerable: false,
	      writable: true,
	      configurable: true
	    }
	  });
	  if (superClass) _Object$setPrototypeOf ? _Object$setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
	};

	exports.__esModule = true;

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(25), __esModule: true };

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(6);
	module.exports = function create(P, D){
	  return $.create(P, D);
	};

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(27), __esModule: true };

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(28);
	module.exports = __webpack_require__(21).Object.setPrototypeOf;

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.3.19 Object.setPrototypeOf(O, proto)
	var $def = __webpack_require__(19);
	$def($def.S, 'Object', {setPrototypeOf: __webpack_require__(29).set});

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	// Works with __proto__ only. Old v8 can't work with null proto objects.
	/* eslint-disable no-proto */
	var getDesc  = __webpack_require__(6).getDesc
	  , isObject = __webpack_require__(30)
	  , anObject = __webpack_require__(31);
	var check = function(O, proto){
	  anObject(O);
	  if(!isObject(proto) && proto !== null)throw TypeError(proto + ": can't set as prototype!");
	};
	module.exports = {
	  set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line no-proto
	    function(test, buggy, set){
	      try {
	        set = __webpack_require__(32)(Function.call, getDesc(Object.prototype, '__proto__').set, 2);
	        set(test, []);
	        buggy = !(test instanceof Array);
	      } catch(e){ buggy = true; }
	      return function setPrototypeOf(O, proto){
	        check(O, proto);
	        if(buggy)O.__proto__ = proto;
	        else set(O, proto);
	        return O;
	      };
	    }({}, false) : undefined),
	  check: check
	};

/***/ },
/* 30 */
/***/ function(module, exports) {

	module.exports = function(it){
	  return typeof it === 'object' ? it !== null : typeof it === 'function';
	};

/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(30);
	module.exports = function(it){
	  if(!isObject(it))throw TypeError(it + ' is not an object!');
	  return it;
	};

/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	// optional / simple context binding
	var aFunction = __webpack_require__(33);
	module.exports = function(fn, that, length){
	  aFunction(fn);
	  if(that === undefined)return fn;
	  switch(length){
	    case 1: return function(a){
	      return fn.call(that, a);
	    };
	    case 2: return function(a, b){
	      return fn.call(that, a, b);
	    };
	    case 3: return function(a, b, c){
	      return fn.call(that, a, b, c);
	    };
	  }
	  return function(/* ...args */){
	    return fn.apply(that, arguments);
	  };
	};

/***/ },
/* 33 */
/***/ function(module, exports) {

	module.exports = function(it){
	  if(typeof it != 'function')throw TypeError(it + ' is not a function!');
	  return it;
	};

/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _classCallCheck = __webpack_require__(7)["default"];

	var _interopRequireDefault = __webpack_require__(1)["default"];

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _globals = __webpack_require__(8);

	var _globals2 = _interopRequireDefault(_globals);

	var Element = function Element() {
	  _classCallCheck(this, Element);

	  this.children = [];
	};

	exports["default"] = Element;

	_globals2["default"]["Element"] = Element;
	module.exports = exports["default"];

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _createClass = __webpack_require__(3)["default"];

	var _classCallCheck = __webpack_require__(7)["default"];

	var _interopRequireDefault = __webpack_require__(1)["default"];

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _globals = __webpack_require__(8);

	var _globals2 = _interopRequireDefault(_globals);

	var Matrix4x4 = (function () {
	  function Matrix4x4() {
	    _classCallCheck(this, Matrix4x4);

	    this.m = [];
	    if (arguments.length >= 16) {
	      this.setComponents.apply(this, arguments);
	    } else {
	      this.identity();
	    }
	  }

	  _createClass(Matrix4x4, [{
	    key: "setComponents",
	    value: function setComponents(m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
	      this.m00 = m00;this.m01 = m01;this.m02 = m02;this.m03 = m03;
	      this.m10 = m10;this.m11 = m11;this.m12 = m12;this.m13 = m13;
	      this.m20 = m20;this.m21 = m21;this.m22 = m22;this.m23 = m23;
	      this.m30 = m30;this.m31 = m31;this.m32 = m32;this.m33 = m33;

	      return this;
	    }

	    /**
	     * 単位行列にする
	     */
	  }, {
	    key: "identity",
	    value: function identity() {
	      this.setComponents(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
	      return this;
	    }

	    /**
	     * 単位行列にする（static版）
	     */
	  }, {
	    key: "zero",

	    /**
	     * ゼロ行列
	     */
	    value: function zero() {
	      this.setComponents(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
	      return this;
	    }
	  }, {
	    key: "flatten",
	    value: function flatten() {
	      return this.m;
	    }
	  }, {
	    key: "_swap",
	    value: function _swap(l, r) {
	      this.m[r] = [this.m[l], this.m[l] = this.m[r]][0]; // Swap
	    }

	    /**
	     * 転置
	     */
	  }, {
	    key: "transpose",
	    value: function transpose() {
	      this._swap(1, 4);
	      this._swap(2, 8);
	      this._swap(3, 12);
	      this._swap(6, 9);
	      this._swap(7, 13);
	      this._swap(11, 14);

	      return this;
	    }

	    /**
	     * 転置（static版）
	     */
	  }, {
	    key: "multiply",

	    /**
	     * 行列同士の乗算
	     */
	    value: function multiply(mat) {
	      var m00 = this.m00 * mat.m00 + this.m01 * mat.m10 + this.m02 * mat.m20 + this.m03 * mat.m30;
	      var m01 = this.m00 * mat.m01 + this.m01 * mat.m11 + this.m02 * mat.m21 + this.m03 * mat.m31;
	      var m02 = this.m00 * mat.m02 + this.m01 * mat.m12 + this.m02 * mat.m22 + this.m03 * mat.m32;
	      var m03 = this.m00 * mat.m03 + this.m01 * mat.m13 + this.m02 * mat.m23 + this.m03 * mat.m33;

	      var m10 = this.m10 * mat.m00 + this.m11 * mat.m10 + this.m12 * mat.m20 + this.m13 * mat.m30;
	      var m11 = this.m10 * mat.m01 + this.m11 * mat.m11 + this.m12 * mat.m21 + this.m13 * mat.m31;
	      var m12 = this.m10 * mat.m02 + this.m11 * mat.m12 + this.m12 * mat.m22 + this.m13 * mat.m32;
	      var m13 = this.m10 * mat.m03 + this.m11 * mat.m13 + this.m12 * mat.m23 + this.m13 * mat.m33;

	      var m20 = this.m20 * mat.m00 + this.m21 * mat.m10 + this.m22 * mat.m20 + this.m23 * mat.m30;
	      var m21 = this.m20 * mat.m01 + this.m21 * mat.m11 + this.m22 * mat.m21 + this.m23 * mat.m31;
	      var m22 = this.m20 * mat.m02 + this.m21 * mat.m12 + this.m22 * mat.m22 + this.m23 * mat.m32;
	      var m23 = this.m20 * mat.m03 + this.m21 * mat.m13 + this.m22 * mat.m23 + this.m23 * mat.m33;

	      var m30 = this.m30 * mat.m00 + this.m31 * mat.m10 + this.m32 * mat.m20 + this.m33 * mat.m30;
	      var m31 = this.m30 * mat.m01 + this.m31 * mat.m11 + this.m32 * mat.m21 + this.m33 * mat.m31;
	      var m32 = this.m30 * mat.m02 + this.m31 * mat.m12 + this.m32 * mat.m22 + this.m33 * mat.m32;
	      var m33 = this.m30 * mat.m03 + this.m31 * mat.m13 + this.m32 * mat.m23 + this.m33 * mat.m33;

	      return this.setComponents(m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33);
	    }

	    /**
	     * 行列同士の乗算（static版）
	     */
	  }, {
	    key: "m00",
	    set: function set(val) {
	      this.m[0] = val;
	    },
	    get: function get() {
	      return this.m[0];
	    }
	  }, {
	    key: "m01",
	    set: function set(val) {
	      this.m[1] = val;
	    },
	    get: function get() {
	      return this.m[1];
	    }
	  }, {
	    key: "m02",
	    set: function set(val) {
	      this.m[2] = val;
	    },
	    get: function get() {
	      return this.m[2];
	    }
	  }, {
	    key: "m03",
	    set: function set(val) {
	      this.m[3] = val;
	    },
	    get: function get() {
	      return this.m[3];
	    }
	  }, {
	    key: "m10",
	    set: function set(val) {
	      this.m[4] = val;
	    },
	    get: function get() {
	      return this.m[4];
	    }
	  }, {
	    key: "m11",
	    set: function set(val) {
	      this.m[5] = val;
	    },
	    get: function get() {
	      return this.m[5];
	    }
	  }, {
	    key: "m12",
	    set: function set(val) {
	      this.m[6] = val;
	    },
	    get: function get() {
	      return this.m[6];
	    }
	  }, {
	    key: "m13",
	    set: function set(val) {
	      this.m[7] = val;
	    },
	    get: function get() {
	      return this.m[7];
	    }
	  }, {
	    key: "m20",
	    set: function set(val) {
	      this.m[8] = val;
	    },
	    get: function get() {
	      return this.m[8];
	    }
	  }, {
	    key: "m21",
	    set: function set(val) {
	      this.m[9] = val;
	    },
	    get: function get() {
	      return this.m[9];
	    }
	  }, {
	    key: "m22",
	    set: function set(val) {
	      this.m[10] = val;
	    },
	    get: function get() {
	      return this.m[10];
	    }
	  }, {
	    key: "m23",
	    set: function set(val) {
	      this.m[11] = val;
	    },
	    get: function get() {
	      return this.m[11];
	    }
	  }, {
	    key: "m30",
	    set: function set(val) {
	      this.m[12] = val;
	    },
	    get: function get() {
	      return this.m[12];
	    }
	  }, {
	    key: "m31",
	    set: function set(val) {
	      this.m[13] = val;
	    },
	    get: function get() {
	      return this.m[13];
	    }
	  }, {
	    key: "m32",
	    set: function set(val) {
	      this.m[14] = val;
	    },
	    get: function get() {
	      return this.m[14];
	    }
	  }, {
	    key: "m33",
	    set: function set(val) {
	      this.m[15] = val;
	    },
	    get: function get() {
	      return this.m[15];
	    }
	  }], [{
	    key: "identity",
	    value: function identity() {
	      return new Matrix4x4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
	    }
	  }, {
	    key: "zero",
	    value: function zero() {
	      return new Matrix4x4(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
	    }
	  }, {
	    key: "transpose",
	    value: function transpose(mat) {

	      var mat_t = new Matrix4x4(mat.m00, mat.m01, mat.m02, mat.m03, mat.m10, mat.m11, mat.m12, mat.m13, mat.m20, mat.m21, mat.m22, mat.m23, mat.m30, mat.m31, mat.m32, mat.m33);
	      mat_t._swap(1, 4);
	      mat_t._swap(2, 8);
	      mat_t._swap(3, 12);
	      mat_t._swap(6, 9);
	      mat_t._swap(7, 13);
	      mat_t._swap(11, 14);

	      return mat_t;
	    }
	  }, {
	    key: "multiply",
	    value: function multiply(l_m, r_m) {
	      var m00 = l_m.m00 * r_m.m00 + l_m.m01 * r_m.m10 + l_m.m02 * r_m.m20 + l_m.m03 * r_m.m30;
	      var m10 = l_m.m10 * r_m.m00 + l_m.m11 * r_m.m10 + l_m.m12 * r_m.m20 + l_m.m13 * r_m.m30;
	      var m20 = l_m.m20 * r_m.m00 + l_m.m21 * r_m.m10 + l_m.m22 * r_m.m20 + l_m.m23 * r_m.m30;
	      var m30 = l_m.m30 * r_m.m00 + l_m.m31 * r_m.m10 + l_m.m32 * r_m.m20 + l_m.m33 * r_m.m30;

	      var m01 = l_m.m00 * r_m.m01 + l_m.m01 * r_m.m11 + l_m.m02 * r_m.m21 + l_m.m03 * r_m.m31;
	      var m11 = l_m.m10 * r_m.m01 + l_m.m11 * r_m.m11 + l_m.m12 * r_m.m21 + l_m.m13 * r_m.m31;
	      var m21 = l_m.m20 * r_m.m01 + l_m.m21 * r_m.m11 + l_m.m22 * r_m.m21 + l_m.m23 * r_m.m31;
	      var m31 = l_m.m30 * r_m.m01 + l_m.m31 * r_m.m11 + l_m.m32 * r_m.m21 + l_m.m33 * r_m.m31;

	      var m02 = l_m.m00 * r_m.m02 + l_m.m01 * r_m.m12 + l_m.m02 * r_m.m22 + l_m.m03 * r_m.m32;
	      var m12 = l_m.m10 * r_m.m02 + l_m.m11 * r_m.m12 + l_m.m12 * r_m.m22 + l_m.m13 * r_m.m32;
	      var m22 = l_m.m20 * r_m.m02 + l_m.m21 * r_m.m12 + l_m.m22 * r_m.m22 + l_m.m23 * r_m.m32;
	      var m32 = l_m.m30 * r_m.m02 + l_m.m31 * r_m.m12 + l_m.m32 * r_m.m22 + l_m.m33 * r_m.m32;

	      var m03 = l_m.m00 * r_m.m03 + l_m.m01 * r_m.m13 + l_m.m02 * r_m.m23 + l_m.m03 * r_m.m33;
	      var m13 = l_m.m10 * r_m.m03 + l_m.m11 * r_m.m13 + l_m.m12 * r_m.m23 + l_m.m13 * r_m.m33;
	      var m23 = l_m.m20 * r_m.m03 + l_m.m21 * r_m.m13 + l_m.m22 * r_m.m23 + l_m.m23 * r_m.m33;
	      var m33 = l_m.m30 * r_m.m03 + l_m.m31 * r_m.m13 + l_m.m32 * r_m.m23 + l_m.m33 * r_m.m33;

	      return new Matrix4x4(m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33);
	    }
	  }]);

	  return Matrix4x4;
	})();

	exports["default"] = Matrix4x4;

	_globals2["default"]["Matrix4x4"] = Matrix4x4;
	module.exports = exports["default"];

/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = __webpack_require__(3)['default'];

	var _classCallCheck = __webpack_require__(7)['default'];

	var _interopRequireDefault = __webpack_require__(1)['default'];

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _implGLContextWebGL1Impl = __webpack_require__(37);

	var _implGLContextWebGL1Impl2 = _interopRequireDefault(_implGLContextWebGL1Impl);

	var _implGLContextWebGL2Impl = __webpack_require__(39);

	var _implGLContextWebGL2Impl2 = _interopRequireDefault(_implGLContextWebGL2Impl);

	var GLContext = (function () {
	  function GLContext(canvas) {
	    _classCallCheck(this, GLContext);

	    if (GLContext._instances[canvas.id] instanceof GLContext) {
	      return GLContext._instances[canvas.id];
	    }

	    if (GLBoost.TARGET_WEBGL_VERSION === 1) {
	      this.impl = new _implGLContextWebGL1Impl2['default'](canvas, this);
	    } else if (GLBoost.TARGET_WEBGL_VERSION === 2) {
	      this.impl = new _implGLContextWebGL2Impl2['default'](canvas, this);
	    }

	    GLContext._instances[canvas.id] = this;
	  }

	  _createClass(GLContext, [{
	    key: 'gl',
	    get: function get() {
	      return this.impl.gl;
	    }
	  }], [{
	    key: 'getInstance',
	    value: function getInstance(canvas) {
	      if (typeof canvas === 'string') {
	        var canvas = window.document.querySelector(canvas);
	      }
	      return new GLContext(canvas);
	    }
	  }]);

	  return GLContext;
	})();

	exports['default'] = GLContext;

	GLContext._instances = new Object();
	module.exports = exports['default'];

/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _get = __webpack_require__(10)['default'];

	var _inherits = __webpack_require__(23)['default'];

	var _createClass = __webpack_require__(3)['default'];

	var _classCallCheck = __webpack_require__(7)['default'];

	var _interopRequireDefault = __webpack_require__(1)['default'];

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _GLContextImpl2 = __webpack_require__(38);

	var _GLContextImpl3 = _interopRequireDefault(_GLContextImpl2);

	var GLContextWebGL1Impl = (function (_GLContextImpl) {
	  _inherits(GLContextWebGL1Impl, _GLContextImpl);

	  function GLContextWebGL1Impl(canvas, parent) {
	    _classCallCheck(this, GLContextWebGL1Impl);

	    _get(Object.getPrototypeOf(GLContextWebGL1Impl.prototype), 'constructor', this).call(this, canvas, parent);

	    _get(Object.getPrototypeOf(GLContextWebGL1Impl.prototype), 'init', this).call(this, 'webgl', WebGLRenderingContext);
	  }

	  _createClass(GLContextWebGL1Impl, [{
	    key: 'gl',
	    get: function get() {
	      return this._canvas._gl;
	    }
	  }]);

	  return GLContextWebGL1Impl;
	})(_GLContextImpl3['default']);

	exports['default'] = GLContextWebGL1Impl;
	module.exports = exports['default'];

/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _createClass = __webpack_require__(3)["default"];

	var _classCallCheck = __webpack_require__(7)["default"];

	var _interopRequireDefault = __webpack_require__(1)["default"];

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _GLContext = __webpack_require__(36);

	var _GLContext2 = _interopRequireDefault(_GLContext);

	var GLContextImpl = (function () {
	  function GLContextImpl(canvas, parent) {
	    _classCallCheck(this, GLContextImpl);

	    //    if (new.target === GLContextImpl) {
	    if (this.constructor === GLContextImpl) {
	      throw new TypeError("Cannot construct GLContextImpl instances directly");
	    }

	    if (!(parent instanceof _GLContext2["default"])) {
	      throw new Error("This concrete class can only be instantiated from the 'GLContext' class.");
	    }

	    if (canvas === void 0) {
	      throw new Error("Failed to create WebGL Context due to no canvas object.");
	    }

	    this._canvas = canvas;
	    this._canvas._gl = null; // ここでnullを入れておかないと、後段のthis.gl === undefinedのチェックがうまくいかない

	    if (this.gl === undefined) {
	      throw new TypeError("Must override gl getter.");
	    }
	  }

	  _createClass(GLContextImpl, [{
	    key: "init",
	    value: function init(glVersionString, ContextType) {

	      var gl = this._canvas.getContext(glVersionString);

	      if (!gl) {
	        throw new Error("This platform doesn't support WebGL.");
	      }

	      if (!gl instanceof ContextType) {
	        throw new Error("Unexpected rendering context.");
	      }

	      gl._canvas = this._canvas;
	      this._canvas._gl = gl;
	    }
	  }]);

	  return GLContextImpl;
	})();

	exports["default"] = GLContextImpl;
	module.exports = exports["default"];

/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _get = __webpack_require__(10)['default'];

	var _inherits = __webpack_require__(23)['default'];

	var _createClass = __webpack_require__(3)['default'];

	var _classCallCheck = __webpack_require__(7)['default'];

	var _interopRequireDefault = __webpack_require__(1)['default'];

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _GLContextImpl2 = __webpack_require__(38);

	var _GLContextImpl3 = _interopRequireDefault(_GLContextImpl2);

	var GLContextWebGL2Impl = (function (_GLContextImpl) {
	  _inherits(GLContextWebGL2Impl, _GLContextImpl);

	  function GLContextWebGL2Impl(canvas, parent) {
	    _classCallCheck(this, GLContextWebGL2Impl);

	    _get(Object.getPrototypeOf(GLContextWebGL2Impl.prototype), 'constructor', this).call(this, canvas, parent);

	    _get(Object.getPrototypeOf(GLContextWebGL2Impl.prototype), 'init', this).call(this, 'webgl2', WebGL2RenderingContext);
	  }

	  _createClass(GLContextWebGL2Impl, [{
	    key: 'gl',
	    get: function get() {
	      return this._canvas._gl;
	    }
	  }]);

	  return GLContextWebGL2Impl;
	})(_GLContextImpl3['default']);

	exports['default'] = GLContextWebGL2Impl;
	module.exports = exports['default'];

/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _createClass = __webpack_require__(3)["default"];

	var _classCallCheck = __webpack_require__(7)["default"];

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var GLExtentionsManager = (function () {
	  function GLExtentionsManager(gl) {
	    _classCallCheck(this, GLExtentionsManager);

	    if (GLExtentionsManager._instance) {
	      return GLExtentionsManager._instance;
	    }

	    this._extVAO = gl.getExtension("OES_vertex_array_object");
	    if (!GLBoost.isThisGLVersion_2(gl) && !this._extVAO) {
	      throw new Error("OES_vertex_array_objectをサポートしていません");
	    }

	    this._extDBs = gl.getExtension("WEBGL_draw_buffers");
	    //    if (!this._extDBs)
	    //      throw("WEBGL_draw_buffersをサポートしていません");

	    GLExtentionsManager._instance = this;
	  }

	  _createClass(GLExtentionsManager, [{
	    key: "createVertexArray",
	    value: function createVertexArray(gl) {
	      return GLBoost.isThisGLVersion_2(gl) ? gl.createVertexArray() : this._extVAO.createVertexArrayOES();
	    }
	  }, {
	    key: "bindVertexArray",
	    value: function bindVertexArray(gl, vao) {
	      return GLBoost.isThisGLVersion_2(gl) ? gl.bindVertexArray(vao) : this._extVAO.bindVertexArrayOES(vao);
	    }
	  }, {
	    key: "drawBuffers",
	    value: function drawBuffers(gl, buffers) {
	      return this._extDBs ? this.extDBs.drawBuffersWEBGL(buffers) : gl.drawBuffers(buffers);
	    }
	  }, {
	    key: "colorAttachiment",
	    value: function colorAttachiment(gl, index) {
	      return this._extDBs ? this._extDBs["COLOR_ATTACHMENT" + index + "_WEBGL"] : gl["COLOR_ATTACHMENT" + index];
	    }
	  }, {
	    key: "extVAO",
	    get: function get() {
	      return this._extVAO;
	    }
	  }, {
	    key: "extDBs",
	    get: function get() {
	      return this._extDBs;
	    }
	  }], [{
	    key: "getInstance",
	    value: function getInstance(gl) {
	      return new GLExtentionsManager(gl);
	    }
	  }]);

	  return GLExtentionsManager;
	})();

	exports["default"] = GLExtentionsManager;

	GLExtentionsManager._instance = null;
	module.exports = exports["default"];

/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _get = __webpack_require__(10)['default'];

	var _inherits = __webpack_require__(23)['default'];

	var _createClass = __webpack_require__(3)['default'];

	var _classCallCheck = __webpack_require__(7)['default'];

	var _interopRequireDefault = __webpack_require__(1)['default'];

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _Shader2 = __webpack_require__(42);

	var _Shader3 = _interopRequireDefault(_Shader2);

	var SimpleShader = (function (_Shader) {
	  _inherits(SimpleShader, _Shader);

	  function SimpleShader(canvas) {
	    _classCallCheck(this, SimpleShader);

	    _get(Object.getPrototypeOf(SimpleShader.prototype), 'constructor', this).call(this, canvas, SimpleShader);
	  }

	  _createClass(SimpleShader, [{
	    key: '_getSimpleVertexShaderString',
	    value: function _getSimpleVertexShaderString(gl, functions, existCamera_f) {
	      var f = functions;
	      var shaderText = '';

	      var in_ = _get(Object.getPrototypeOf(SimpleShader.prototype), '_in_onVert', this).call(this, gl);
	      var out_ = _get(Object.getPrototypeOf(SimpleShader.prototype), '_out_onVert', this).call(this, gl);

	      shaderText += _get(Object.getPrototypeOf(SimpleShader.prototype), '_glslVer', this).call(this, gl);
	      shaderText += 'precision mediump float;\n';
	      shaderText += in_ + ' vec3 aVertex_position;\n';
	      if (this._exist(f, GLBoost.COLOR)) {
	        shaderText += in_ + ' vec3 aVertex_color;\n';
	        shaderText += out_ + ' vec4 color;\n';
	      }
	      if (this._exist(f, GLBoost.TEXCOORD)) {
	        shaderText += in_ + ' vec2 aVertex_texcoord;\n';
	        shaderText += out_ + ' vec2 texcoord;\n';
	      }
	      if (existCamera_f) {
	        shaderText += 'uniform mat4 projectionAndViewMatrix;\n';
	      }
	      shaderText += 'void main(void) {\n';

	      if (existCamera_f) {
	        shaderText += '  gl_Position = projectionAndViewMatrix * vec4(aVertex_position, 1.0);\n';
	      } else {
	        shaderText += '  gl_Position = vec4(aVertex_position, 1.0);\n';
	      }
	      if (this._exist(f, GLBoost.COLOR)) {
	        shaderText += '  color = vec4(aVertex_color, 1.0);\n';
	      }
	      if (this._exist(f, GLBoost.TEXCOORD)) {
	        shaderText += '  texcoord = aVertex_texcoord;\n';
	      }
	      shaderText += '}\n';

	      return shaderText;
	    }
	  }, {
	    key: '_getSimpleFragmentShaderString',
	    value: function _getSimpleFragmentShaderString(gl, functions) {
	      var f = functions;
	      var shaderText = '';

	      var in_ = _get(Object.getPrototypeOf(SimpleShader.prototype), '_in_onFrag', this).call(this, gl);

	      shaderText += _get(Object.getPrototypeOf(SimpleShader.prototype), '_glslVer', this).call(this, gl);
	      shaderText += 'precision mediump float;\n';
	      shaderText += _get(Object.getPrototypeOf(SimpleShader.prototype), '_set_outColor_onFrag', this).call(this, gl);
	      if (this._exist(f, GLBoost.COLOR)) {
	        shaderText += in_ + ' vec4 color;\n';
	      }
	      if (this._exist(f, GLBoost.TEXCOORD)) {
	        shaderText += in_ + ' vec2 texcoord;\n\n';
	        shaderText += 'uniform sampler2D uTexture;\n';
	      }
	      shaderText += 'void main(void) {\n';

	      var textureFunc = _get(Object.getPrototypeOf(SimpleShader.prototype), '_texture_func', this).call(this, gl);
	      if (this._exist(f, GLBoost.TEXCOORD)) {
	        shaderText += '  rt1 = ' + textureFunc + '(uTexture, texcoord);\n';
	      } else if (this._exist(f, GLBoost.COLOR)) {
	        shaderText += '  rt1 = color;\n';
	      } else {
	        shaderText += '  rt1 = vec4(1.0, 1.0, 1.0, 1.0);\n';
	      }
	      shaderText += _get(Object.getPrototypeOf(SimpleShader.prototype), '_set_glFragColor_inGLVer1', this).call(this, gl);
	      shaderText += '}\n';

	      return shaderText;
	    }
	  }, {
	    key: 'getShaderProgram',
	    value: function getShaderProgram(vertexAttribs, existCamera_f) {
	      var gl = this._gl;
	      var shaderProgram = this._initShaders(gl, this._getSimpleVertexShaderString(gl, vertexAttribs, existCamera_f), this._getSimpleFragmentShaderString(gl, vertexAttribs));

	      vertexAttribs.forEach(function (attribName) {
	        shaderProgram['vertexAttribute_' + attribName] = gl.getAttribLocation(shaderProgram, 'aVertex_' + attribName);
	        gl.enableVertexAttribArray(shaderProgram['vertexAttribute_' + attribName]);
	      });

	      if (this._exist(vertexAttribs, GLBoost.TEXCOORD)) {
	        shaderProgram.uniformTextureSampler_0 = gl.getUniformLocation(shaderProgram, 'texture');
	        // サンプラーにテクスチャユニット０を指定する
	        gl.uniform1i(shaderProgram.uniformTextureSampler_0, 0);
	      }

	      if (existCamera_f) {
	        shaderProgram.projectionAndViewMatrix = gl.getUniformLocation(shaderProgram, 'projectionAndViewMatrix');
	      }

	      return shaderProgram;
	    }
	  }], [{
	    key: 'getInstance',
	    value: function getInstance(canvas) {
	      if (_Shader3['default']._instances[canvas.id] instanceof SimpleShader) {
	        return _Shader3['default']._instances[canvas.id];
	      } else {
	        return new SimpleShader(canvas);
	      }
	    }
	  }]);

	  return SimpleShader;
	})(_Shader3['default']);

	exports['default'] = SimpleShader;
	module.exports = exports['default'];

/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = __webpack_require__(3)['default'];

	var _classCallCheck = __webpack_require__(7)['default'];

	var _interopRequireDefault = __webpack_require__(1)['default'];

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _GLContext = __webpack_require__(36);

	var _GLContext2 = _interopRequireDefault(_GLContext);

	var Shader = (function () {
	  function Shader(canvas, childClass) {
	    _classCallCheck(this, Shader);

	    if (typeof canvas === 'string') {
	      var canvas = window.document.querySelector(canvas);
	    }

	    this._gl = _GLContext2['default'].getInstance(canvas).gl;

	    Shader._instances[canvas.id] = this;
	  }

	  _createClass(Shader, [{
	    key: '_getShader',
	    value: function _getShader(gl, theSource, type) {
	      var shader;

	      if (type == "x-shader/x-fragment") {
	        shader = gl.createShader(gl.FRAGMENT_SHADER);
	      } else if (type == "x-shader/x-vertex") {
	        shader = gl.createShader(gl.VERTEX_SHADER);
	      } else {
	        // Unknown shader type
	        return null;
	      }

	      gl.shaderSource(shader, theSource);

	      // Compile the shader program
	      gl.compileShader(shader);

	      // See if it compiled successfully
	      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
	        alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
	        return null;
	      }

	      return shader;
	    }
	  }, {
	    key: '_initShaders',
	    value: function _initShaders(gl, vertexShaderStr, fragmentShaderStr) {
	      var vertexShader = this._getShader(gl, vertexShaderStr, 'x-shader/x-vertex');
	      var fragmentShader = this._getShader(gl, fragmentShaderStr, 'x-shader/x-fragment');

	      // Create the shader program
	      var shaderProgram = gl.createProgram();
	      gl.attachShader(shaderProgram, vertexShader);
	      gl.attachShader(shaderProgram, fragmentShader);
	      gl.linkProgram(shaderProgram);

	      // If creating the shader program failed, alert
	      if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
	        alert("Unable to initialize the shader program.");
	      }

	      gl.useProgram(shaderProgram);

	      return shaderProgram;
	    }
	  }, {
	    key: '_exist',
	    value: function _exist(functions, attribute) {
	      return functions.indexOf(attribute) >= 0;
	    }
	  }, {
	    key: 'isThisGLVersion_2',
	    value: function isThisGLVersion_2(gl) {
	      return gl instanceof WebGL2RenderingContext;
	    }
	  }, {
	    key: '_glslVer',
	    value: function _glslVer(gl) {
	      return GLBoost.isThisGLVersion_2(gl) ? '#version 300 es\n' : '';
	    }
	  }, {
	    key: '_in_onVert',
	    value: function _in_onVert(gl) {
	      return GLBoost.isThisGLVersion_2(gl) ? 'in' : 'attribute';
	    }
	  }, {
	    key: '_out_onVert',
	    value: function _out_onVert(gl) {
	      return GLBoost.isThisGLVersion_2(gl) ? 'out' : 'varying';
	    }
	  }, {
	    key: '_in_onFrag',
	    value: function _in_onFrag(gl) {
	      return GLBoost.isThisGLVersion_2(gl) ? 'in' : 'varying';
	    }
	  }, {
	    key: '_texture_func',
	    value: function _texture_func(gl) {
	      return GLBoost.isThisGLVersion_2(gl) ? 'texture' : 'texture2D';
	    }
	  }, {
	    key: '_set_outColor_onFrag',
	    value: function _set_outColor_onFrag(gl) {
	      return GLBoost.isThisGLVersion_2(gl) ? 'layout(location = 0) out vec4 rt1;' : 'vec4 rt1;';
	    }
	  }, {
	    key: '_set_glFragColor_inGLVer1',
	    value: function _set_glFragColor_inGLVer1(gl) {
	      return !GLBoost.isThisGLVersion_2(gl) ? 'gl_FragColor = rt1;' : '';
	    }
	  }]);

	  return Shader;
	})();

	exports['default'] = Shader;

	Shader._instances = new Object();
	module.exports = exports['default'];

/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _get = __webpack_require__(10)['default'];

	var _inherits = __webpack_require__(23)['default'];

	var _createClass = __webpack_require__(3)['default'];

	var _classCallCheck = __webpack_require__(7)['default'];

	var _interopRequireDefault = __webpack_require__(1)['default'];

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _globals = __webpack_require__(8);

	var _globals2 = _interopRequireDefault(_globals);

	var _Vector3 = __webpack_require__(44);

	var _Vector32 = _interopRequireDefault(_Vector3);

	var _Element2 = __webpack_require__(34);

	var _Element3 = _interopRequireDefault(_Element2);

	var _Matrix4x4 = __webpack_require__(35);

	var _Matrix4x42 = _interopRequireDefault(_Matrix4x4);

	var Camera = (function (_Element) {
	  _inherits(Camera, _Element);

	  function Camera(lookat, perspective) {
	    _classCallCheck(this, Camera);

	    _get(Object.getPrototypeOf(Camera.prototype), 'constructor', this).call(this);

	    this.eye = lookat.eye;
	    this.center = lookat.center;
	    this.up = lookat.up;

	    this.fovy = perspective.fovy;
	    this.aspect = perspective.aspect;
	    this.zNear = perspective.zNear;
	    this.zFar = perspective.zFar;

	    this.setAsMainCamera();
	  }

	  _createClass(Camera, [{
	    key: 'lookAtRHMatrix',
	    value: function lookAtRHMatrix() {
	      //    return Matrix4x4.identity();
	      return Camera.lookAtRHMatrix(this.eye, this.center, this.up);
	    }
	  }, {
	    key: 'perspectiveRHMatrix',
	    value: function perspectiveRHMatrix() {
	      //    return Matrix4x4.identity();
	      return Camera.perspectiveRHMatrix(this.fovy, this.aspect, this.zNear, this.zFar);
	    }
	  }, {
	    key: 'setAsMainCamera',
	    value: function setAsMainCamera() {
	      Camera._mainCamera = this;
	    }
	  }, {
	    key: 'isMainCamera',
	    get: function get() {
	      return Camera._mainCamera === this;
	    }
	  }], [{
	    key: 'lookAtRHMatrix',
	    value: function lookAtRHMatrix(eye, center, up) {

	      var f = _Vector32['default'].normalize(_Vector32['default'].subtract(center, eye));
	      var s = _Vector32['default'].normalize(_Vector32['default'].cross(f, up));
	      var u = _Vector32['default'].cross(s, f);

	      return new _Matrix4x42['default'](s.x, s.y, s.z, -_Vector32['default'].dotProduct(s, eye), u.x, u.y, u.z, -_Vector32['default'].dotProduct(u, eye), -f.x, -f.y, -f.z, _Vector32['default'].dotProduct(f, eye), 0, 0, 0, 1);
	    }
	  }, {
	    key: 'perspectiveRHMatrix',
	    value: function perspectiveRHMatrix(fovy, aspect, zNear, zFar) {

	      var yscale = 1.0 / Math.tan(0.5 * fovy * Math.PI / 180);
	      var xscale = yscale / aspect;

	      return new _Matrix4x42['default'](xscale, 0.0, 0.0, 0.0, 0.0, yscale, 0.0, 0.0, 0.0, 0.0, -(zFar + zNear) / (zFar - zNear), -(2.0 * zFar * zNear) / (zFar - zNear), 0.0, 0.0, -1.0, 0.0);
	    }
	  }]);

	  return Camera;
	})(_Element3['default']);

	exports['default'] = Camera;

	Camera._mainCamera = null;

	_globals2['default']["Camera"] = Camera;
	module.exports = exports['default'];

/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _createClass = __webpack_require__(3)["default"];

	var _classCallCheck = __webpack_require__(7)["default"];

	var _interopRequireDefault = __webpack_require__(1)["default"];

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _globals = __webpack_require__(8);

	var _globals2 = _interopRequireDefault(_globals);

	var Vector3 = (function () {
	  function Vector3(x, y, z) {
	    _classCallCheck(this, Vector3);

	    this.x = x;
	    this.y = y;
	    this.z = z;
	  }

	  /**
	   * 長さ
	   */

	  _createClass(Vector3, [{
	    key: "length",
	    value: function length() {
	      return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
	    }

	    /**
	     * 長さ（static版）
	     */
	  }, {
	    key: "lengthSquared",

	    /**
	     * 長さの2乗
	     */
	    value: function lengthSquared() {
	      return this.x * this.x + this.y * this.y + this.z * this.z;
	    }

	    /**
	     * 長さの2乗（static版）
	     */
	  }, {
	    key: "lengthSquared",
	    value: function lengthSquared(vec3) {
	      return vec3.x * vec3.x + vec3.y * vec3.y + vec3.z * vec3.z;
	    }

	    /**
	     * 内積
	     */
	  }, {
	    key: "dotProduct",
	    value: function dotProduct(vec3) {
	      return this.x * vec3.x + this.y * vec3.y + this.z * vec3.z;
	    }

	    /**
	     * 内積（static版）
	     */
	  }, {
	    key: "cross",

	    /**
	     * 外積
	     */
	    value: function cross(v) {
	      var x = this.y * v.z - this.z * v.y;
	      var y = this.z * v.x - this.x * v.z;
	      var z = this.x * v.y - this.y * v.x;

	      this.setComponents(x, y, z);

	      return this;
	    }

	    /**
	    * 外積(static版)
	    */
	  }, {
	    key: "normalize",

	    /**
	     * 正規化
	     */
	    value: function normalize() {
	      var length = this.length();
	      this.divide(length);

	      return this;
	    }

	    /**
	     * 正規化（static版）
	     */
	  }, {
	    key: "subtract",

	    /**
	     * 減算
	     */
	    value: function subtract(v) {
	      this.x -= v.x;
	      this.y -= v.y;
	      this.z -= v.z;

	      return this;
	    }

	    /**
	     * 減算（static版）
	     */
	  }, {
	    key: "divide",

	    /**
	     * 除算
	     */
	    value: function divide(val) {
	      console.assert(val != 0, "0 division!");
	      this.x /= val;
	      this.y /= val;
	      this.z /= val;

	      return this;
	    }

	    /**
	     * 除算（static版）
	     */
	  }], [{
	    key: "length",
	    value: function length(vec3) {
	      return Math.sqrt(vec3.x * vec3.x + vec3.y * vec3.y + vec3.z * vec3.z);
	    }
	  }, {
	    key: "dotProduct",
	    value: function dotProduct(lv, rv) {
	      return lv.x * rv.x + lv.y * rv.y + lv.z * rv.z;
	    }
	  }, {
	    key: "cross",
	    value: function cross(lv, rv) {
	      var x = lv.y * rv.z - lv.z * rv.y;
	      var y = lv.z * rv.x - lv.x * rv.z;
	      var z = lv.x * rv.y - lv.y * rv.x;

	      return new Vector3(x, y, z);
	    }
	  }, {
	    key: "normalize",
	    value: function normalize(vec3) {
	      var length = vec3.length();
	      vec3.divide(length);

	      return vec3;
	    }
	  }, {
	    key: "subtract",
	    value: function subtract(lv, rv) {
	      return new Vector3(lv.x - rv.x, lv.y - rv.y, lv.z - rv.z);
	    }
	  }, {
	    key: "divide",
	    value: function divide(vec3, val) {
	      console.assert(val != 0, "0 division!");
	      return new Vector3(vec3.x / val, vec3.y / val, vec3.z / val);
	    }
	  }]);

	  return Vector3;
	})();

	exports["default"] = Vector3;

	_globals2["default"]["Vector3"] = Vector3;
	module.exports = exports["default"];

/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _get = __webpack_require__(10)['default'];

	var _inherits = __webpack_require__(23)['default'];

	var _createClass = __webpack_require__(3)['default'];

	var _classCallCheck = __webpack_require__(7)['default'];

	var _interopRequireDefault = __webpack_require__(1)['default'];

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _globals = __webpack_require__(8);

	var _globals2 = _interopRequireDefault(_globals);

	var _GLContext = __webpack_require__(36);

	var _GLContext2 = _interopRequireDefault(_GLContext);

	var _AbstractTexture2 = __webpack_require__(46);

	var _AbstractTexture3 = _interopRequireDefault(_AbstractTexture2);

	var MutableTexture = (function (_AbstractTexture) {
	  _inherits(MutableTexture, _AbstractTexture);

	  function MutableTexture(canvas, width, height) {
	    _classCallCheck(this, MutableTexture);

	    _get(Object.getPrototypeOf(MutableTexture.prototype), 'constructor', this).call(this, canvas);

	    this._isTextureReady = false;
	    this._texture = null;
	    this._width = width;
	    this._height = height;

	    var gl = this._gl;

	    this._texture = gl.createTexture();
	    gl.bindTexture(gl.TEXTURE_2D, this._texture);
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
	    gl.bindTexture(gl.TEXTURE_2D, null);
	  }

	  _createClass(MutableTexture, [{
	    key: 'colorAttachiment',
	    set: function set(attachmentId) {
	      this._attachmentId = attachmentId;
	    },
	    get: function get() {
	      return this._attachmentId;
	    }
	  }]);

	  return MutableTexture;
	})(_AbstractTexture3['default']);

	exports['default'] = MutableTexture;

	_globals2['default']["MutableTexture"] = MutableTexture;
	module.exports = exports['default'];

/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = __webpack_require__(3)['default'];

	var _classCallCheck = __webpack_require__(7)['default'];

	var _interopRequireDefault = __webpack_require__(1)['default'];

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _globals = __webpack_require__(8);

	var _globals2 = _interopRequireDefault(_globals);

	var _GLContext = __webpack_require__(36);

	var _GLContext2 = _interopRequireDefault(_GLContext);

	var AbstractTexture = (function () {
	  function AbstractTexture(canvas) {
	    _classCallCheck(this, AbstractTexture);

	    if (this.constructor === AbstractTexture) {
	      throw new TypeError("Cannot construct AbstractTexture instances directly.");
	    }

	    this._gl = _GLContext2['default'].getInstance(canvas).gl;
	    this._name = "";
	  }

	  _createClass(AbstractTexture, [{
	    key: 'setUp',
	    value: function setUp() {
	      this._gl.bindTexture(this._gl.TEXTURE_2D, this._texture);
	    }
	  }, {
	    key: 'tearDown',
	    value: function tearDown() {
	      this._gl.bindTexture(this._gl.TEXTURE_2D, null);
	    }
	  }, {
	    key: 'glTextureResource',
	    get: function get() {
	      return this._texture;
	    }
	  }, {
	    key: 'name',
	    set: function set(name) {
	      this._name = name;
	    },
	    get: function get() {
	      return this._name;
	    }
	  }, {
	    key: 'width',
	    get: function get() {
	      return this._width;
	    }
	  }, {
	    key: 'height',
	    get: function get() {
	      return this._height;
	    }
	  }]);

	  return AbstractTexture;
	})();

	exports['default'] = AbstractTexture;

	_globals2['default']["AbstractTexture"] = AbstractTexture;
	module.exports = exports['default'];

/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = __webpack_require__(3)['default'];

	var _classCallCheck = __webpack_require__(7)['default'];

	var _interopRequireDefault = __webpack_require__(1)['default'];

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _globals = __webpack_require__(8);

	var _globals2 = _interopRequireDefault(_globals);

	var _GLContext = __webpack_require__(36);

	var _GLContext2 = _interopRequireDefault(_GLContext);

	var _Mesh = __webpack_require__(9);

	var _Mesh2 = _interopRequireDefault(_Mesh);

	var RenderPass = (function () {
	  function RenderPass(gl) {
	    _classCallCheck(this, RenderPass);

	    this._meshes = [];
	    this._drawBuffers = [gl.BACK];
	    this._clearColor = null;
	  }

	  _createClass(RenderPass, [{
	    key: 'addMeshes',
	    value: function addMeshes(meshes) {
	      var _this = this;

	      meshes.forEach(function (mesh) {
	        if (!(mesh instanceof _Mesh2['default'])) {
	          throw new TypeError("RenderPass accepts Mesh objects only.");
	        }
	        _this._meshes.push(mesh);
	      });
	    }
	  }, {
	    key: 'getMeshes',
	    value: function getMeshes() {
	      return this._meshes;
	    }
	  }, {
	    key: 'specifyRenderTargetTextures',
	    value: function specifyRenderTargetTextures(canvas, renderTargetTextures) {
	      var _this2 = this;

	      var gl = _GLContext2['default'].getInstance(canvas).gl;

	      if (renderTargetTextures) {
	        this._drawBuffers = [];
	        renderTargetTextures.forEach(function (texture) {
	          _this2._drawBuffers.push(texture.colorAttachiment);
	        });
	      } else {
	        this._drawBuffers = [gl.BACK];
	      }
	    }
	  }, {
	    key: 'setClearColor',
	    value: function setClearColor(color) {
	      this._clearColor = color;
	    }
	  }, {
	    key: 'buffersToDraw',
	    get: function get() {
	      return this._drawBuffers;
	    }
	  }, {
	    key: 'clearColor',
	    get: function get() {
	      return this._clearColor;
	    }
	  }]);

	  return RenderPass;
	})();

	exports['default'] = RenderPass;

	_globals2['default']["RenderPass"] = RenderPass;
	module.exports = exports['default'];

/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _get = __webpack_require__(10)['default'];

	var _inherits = __webpack_require__(23)['default'];

	var _createClass = __webpack_require__(3)['default'];

	var _classCallCheck = __webpack_require__(7)['default'];

	var _interopRequireDefault = __webpack_require__(1)['default'];

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _globals = __webpack_require__(8);

	var _globals2 = _interopRequireDefault(_globals);

	var _Element2 = __webpack_require__(34);

	var _Element3 = _interopRequireDefault(_Element2);

	var _Camera = __webpack_require__(43);

	var _Camera2 = _interopRequireDefault(_Camera);

	var Scene = (function (_Element) {
	  _inherits(Scene, _Element);

	  function Scene() {
	    _classCallCheck(this, Scene);

	    _get(Object.getPrototypeOf(Scene.prototype), 'constructor', this).call(this);
	    this._elements = [];
	  }

	  _createClass(Scene, [{
	    key: 'add',
	    value: function add(mesh) {
	      this._elements.push(mesh);
	    }
	  }, {
	    key: 'prepareForRender',
	    value: function prepareForRender() {
	      // カメラが最低１つでも存在しているか確認
	      var existCamera_f = false;
	      this._elements.forEach(function (elm) {
	        if (elm instanceof _Camera2['default']) {
	          existCamera_f = true;
	        }
	      });

	      // レンダリングの準備をさせる。
	      this._elements.forEach(function (elm) {
	        if (elm.prepareForRender === void 0) return; // prepareForRenderメソッドを持っていないエレメントは処理しない
	        elm.prepareForRender(existCamera_f);
	      });
	    }
	  }, {
	    key: 'elements',
	    get: function get() {
	      return this._elements;
	    }
	  }]);

	  return Scene;
	})(_Element3['default']);

	exports['default'] = Scene;

	_globals2['default']["Scene"] = Scene;
	module.exports = exports['default'];

/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _classCallCheck = __webpack_require__(7)["default"];

	var _interopRequireDefault = __webpack_require__(1)["default"];

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _globals = __webpack_require__(8);

	var _globals2 = _interopRequireDefault(_globals);

	var Vector2 = function Vector2(x, y) {
	  _classCallCheck(this, Vector2);

	  this.x = x;
	  this.y = y;
	};

	exports["default"] = Vector2;

	_globals2["default"]["Vector2"] = Vector2;
	module.exports = exports["default"];

/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _classCallCheck = __webpack_require__(7)["default"];

	var _interopRequireDefault = __webpack_require__(1)["default"];

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _globals = __webpack_require__(8);

	var _globals2 = _interopRequireDefault(_globals);

	var Vector4 = function Vector4(x, y, z, w) {
	  _classCallCheck(this, Vector4);

	  this.x = x;
	  this.y = y;
	  this.z = z;
	  this.w = w;
	};

	exports["default"] = Vector4;

	_globals2["default"]["Vector4"] = Vector4;
	module.exports = exports["default"];

/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = __webpack_require__(3)['default'];

	var _classCallCheck = __webpack_require__(7)['default'];

	var _interopRequireDefault = __webpack_require__(1)['default'];

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _globals = __webpack_require__(8);

	var _globals2 = _interopRequireDefault(_globals);

	var _GLContext = __webpack_require__(36);

	var _GLContext2 = _interopRequireDefault(_GLContext);

	var _Vector3 = __webpack_require__(44);

	var _Vector32 = _interopRequireDefault(_Vector3);

	var ClassicMaterial = (function () {
	  function ClassicMaterial(canvas) {
	    _classCallCheck(this, ClassicMaterial);

	    this._diffuseTexture = null;
	    this._gl = _GLContext2['default'].getInstance(canvas).gl;
	    this._diffuseColor = new _Vector32['default'](1.0, 1.0, 1.0);
	    this._specularColor = new _Vector32['default'](1.0, 1.0, 1.0);
	    this._ambientColor = new _Vector32['default'](0.0, 0.0, 0.0);
	    this._name = "";
	  }

	  _createClass(ClassicMaterial, [{
	    key: 'setUp',
	    value: function setUp() {
	      var gl = this._gl;
	      if (this._diffuseTexture) {
	        // テクスチャユニット０にテクスチャオブジェクトをバインドする
	        gl.activeTexture(gl.TEXTURE0);
	        this._diffuseTexture.setUp();
	      }
	    }
	  }, {
	    key: 'tearDown',
	    value: function tearDown() {
	      if (this._diffuseTexture) {
	        this._diffuseTexture.tearDown();
	      }
	    }
	  }, {
	    key: 'diffuseTexture',
	    set: function set(tex) {
	      this._diffuseTexture = tex;
	    },
	    get: function get() {
	      return this._diffuseTexture;
	    }
	  }, {
	    key: 'diffuseColor',
	    set: function set(vec) {
	      this._diffuseColor = vec;
	    },
	    get: function get() {
	      return this._diffuseColor;
	    }
	  }, {
	    key: 'specularColor',
	    set: function set(vec) {
	      this._specularColor = vec;
	    },
	    get: function get() {
	      return this._specularColor;
	    }
	  }, {
	    key: 'ambientColor',
	    set: function set(vec) {
	      this._ambientColor = vec;
	    },
	    get: function get() {
	      return this._ambientColor;
	    }
	  }, {
	    key: 'name',
	    set: function set(name) {
	      this._name = name;
	    },
	    get: function get() {
	      return this._name;
	    }
	  }]);

	  return ClassicMaterial;
	})();

	exports['default'] = ClassicMaterial;

	_globals2['default']["ClassicMaterial"] = ClassicMaterial;
	module.exports = exports['default'];

/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _get = __webpack_require__(10)['default'];

	var _inherits = __webpack_require__(23)['default'];

	var _createClass = __webpack_require__(3)['default'];

	var _classCallCheck = __webpack_require__(7)['default'];

	var _interopRequireDefault = __webpack_require__(1)['default'];

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _globals = __webpack_require__(8);

	var _globals2 = _interopRequireDefault(_globals);

	var _GLContext = __webpack_require__(36);

	var _GLContext2 = _interopRequireDefault(_GLContext);

	var _AbstractTexture2 = __webpack_require__(46);

	var _AbstractTexture3 = _interopRequireDefault(_AbstractTexture2);

	var Texture = (function (_AbstractTexture) {
	  _inherits(Texture, _AbstractTexture);

	  function Texture(imageUrl, canvas) {
	    var _this = this;

	    _classCallCheck(this, Texture);

	    _get(Object.getPrototypeOf(Texture.prototype), 'constructor', this).call(this, canvas);

	    this._isTextureReady = false;
	    this._texture = null;

	    var img = new Image();
	    img.onload = function () {
	      var gl = _this._gl;
	      var texture = gl.createTexture();
	      gl.bindTexture(gl.TEXTURE_2D, texture);
	      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
	      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
	      gl.generateMipmap(gl.TEXTURE_2D);
	      gl.bindTexture(gl.TEXTURE_2D, null);

	      _this._texture = texture;
	      _this._isTextureReady = true;
	      _this._width = img.width;
	      _this._height = img.width;
	    };

	    img.src = imageUrl;
	  }

	  _createClass(Texture, [{
	    key: 'isTextureReady',
	    get: function get() {
	      return this._isTextureReady;
	    }
	  }]);

	  return Texture;
	})(_AbstractTexture3['default']);

	exports['default'] = Texture;

	_globals2['default']["Texture"] = Texture;
	module.exports = exports['default'];

/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _get = __webpack_require__(10)['default'];

	var _inherits = __webpack_require__(23)['default'];

	var _createClass = __webpack_require__(3)['default'];

	var _classCallCheck = __webpack_require__(7)['default'];

	var _interopRequireDefault = __webpack_require__(1)['default'];

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _globals = __webpack_require__(8);

	var _globals2 = _interopRequireDefault(_globals);

	var _Element = __webpack_require__(34);

	var _Element2 = _interopRequireDefault(_Element);

	var _GLContext = __webpack_require__(36);

	var _GLContext2 = _interopRequireDefault(_GLContext);

	var _GLExtentionsManager = __webpack_require__(40);

	var _GLExtentionsManager2 = _interopRequireDefault(_GLExtentionsManager);

	var _BlendShapeShader = __webpack_require__(54);

	var _BlendShapeShader2 = _interopRequireDefault(_BlendShapeShader);

	var _Mesh2 = __webpack_require__(9);

	var _Mesh3 = _interopRequireDefault(_Mesh2);

	var BlendShapeMesh = (function (_Mesh) {
	  _inherits(BlendShapeMesh, _Mesh);

	  function BlendShapeMesh(canvas) {
	    _classCallCheck(this, BlendShapeMesh);

	    _get(Object.getPrototypeOf(BlendShapeMesh.prototype), 'constructor', this).call(this, canvas);
	  }

	  _createClass(BlendShapeMesh, [{
	    key: '_getSheder',
	    value: function _getSheder(result, existCamera_f) {
	      var blendShapeShader = _BlendShapeShader2['default'].getInstance(this.canvas);
	      return blendShapeShader.getShaderProgram(result, existCamera_f);
	    }
	  }, {
	    key: 'blendWeight_1',
	    set: function set(weight) {
	      var gl = this._gl;
	      var currentProgram = gl.getParameter(gl.CURRENT_PROGRAM);
	      gl.useProgram(this._glslProgram);
	      this._gl.uniform1f(this._glslProgram['uniformFloatSampler_blendWeight_' + _globals2['default'].BLENDTARGET1], weight);
	      gl.useProgram(currentProgram);
	    }
	  }, {
	    key: 'blendWeight_2',
	    set: function set(weight) {
	      var gl = this._gl;
	      var currentProgram = gl.getParameter(gl.CURRENT_PROGRAM);
	      gl.useProgram(this._glslProgram);
	      this._gl.uniform1f(this._glslProgram['uniformFloatSampler_blendWeight_' + _globals2['default'].BLENDTARGET2], weight);
	      gl.useProgram(currentProgram);
	    }
	  }, {
	    key: 'blendWeight_3',
	    set: function set(weight) {
	      var gl = this._gl;
	      var currentProgram = gl.getParameter(gl.CURRENT_PROGRAM);
	      gl.useProgram(this._glslProgram);
	      this._gl.uniform1f(this._glslProgram['uniformFloatSampler_blendWeight_' + _globals2['default'].BLENDTARGET3], weight);
	      gl.useProgram(currentProgram);
	    }
	  }, {
	    key: 'blendWeight_4',
	    set: function set(weight) {
	      var gl = this._gl;
	      var currentProgram = gl.getParameter(gl.CURRENT_PROGRAM);
	      gl.useProgram(this._glslProgram);
	      this._gl.uniform1f(this._glslProgram['uniformFloatSampler_blendWeight_' + _globals2['default'].BLENDTARGET4], weight);
	      gl.useProgram(currentProgram);
	    }
	  }, {
	    key: 'blendWeight_5',
	    set: function set(weight) {
	      var gl = this._gl;
	      var currentProgram = gl.getParameter(gl.CURRENT_PROGRAM);
	      gl.useProgram(this._glslProgram);
	      this._gl.uniform1f(this._glslProgram['uniformFloatSampler_blendWeight_' + _globals2['default'].BLENDTARGET5], weight);
	      gl.useProgram(currentProgram);
	    }
	  }, {
	    key: 'blendWeight_6',
	    set: function set(weight) {
	      var gl = this._gl;
	      var currentProgram = gl.getParameter(gl.CURRENT_PROGRAM);
	      gl.useProgram(this._glslProgram);
	      this._gl.uniform1f(this._glslProgram['uniformFloatSampler_blendWeight_' + _globals2['default'].BLENDTARGET6], weight);
	      gl.useProgram(currentProgram);
	    }
	  }, {
	    key: 'blendWeight_7',
	    set: function set(weight) {
	      var gl = this._gl;
	      var currentProgram = gl.getParameter(gl.CURRENT_PROGRAM);
	      gl.useProgram(this._glslProgram);
	      this._gl.uniform1f(this._glslProgram['uniformFloatSampler_blendWeight_' + _globals2['default'].BLENDTARGET7], weight);
	      gl.useProgram(currentProgram);
	    }
	  }, {
	    key: 'blendWeight_8',
	    set: function set(weight) {
	      var gl = this._gl;
	      var currentProgram = gl.getParameter(gl.CURRENT_PROGRAM);
	      gl.useProgram(this._glslProgram);
	      this._gl.uniform1f(this._glslProgram['uniformFloatSampler_blendWeight_' + _globals2['default'].BLENDTARGET8], weight);
	      gl.useProgram(currentProgram);
	    }
	  }, {
	    key: 'blendWeight_9',
	    set: function set(weight) {
	      var gl = this._gl;
	      var currentProgram = gl.getParameter(gl.CURRENT_PROGRAM);
	      gl.useProgram(this._glslProgram);
	      this._gl.uniform1f(this._glslProgram['uniformFloatSampler_blendWeight_' + _globals2['default'].BLENDTARGET9], weight);
	      gl.useProgram(currentProgram);
	    }
	  }, {
	    key: 'blendWeight_10',
	    set: function set(weight) {
	      var gl = this._gl;
	      var currentProgram = gl.getParameter(gl.CURRENT_PROGRAM);
	      gl.useProgram(this._glslProgram);
	      this._gl.uniform1f(this._glslProgram['uniformFloatSampler_blendWeight_' + _globals2['default'].BLENDTARGET10], weight);
	      gl.useProgram(currentProgram);
	    }
	  }]);

	  return BlendShapeMesh;
	})(_Mesh3['default']);

	exports['default'] = BlendShapeMesh;

	_globals2['default']["BlendShapeMesh"] = BlendShapeMesh;
	module.exports = exports['default'];

/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _get = __webpack_require__(10)['default'];

	var _inherits = __webpack_require__(23)['default'];

	var _createClass = __webpack_require__(3)['default'];

	var _classCallCheck = __webpack_require__(7)['default'];

	var _interopRequireDefault = __webpack_require__(1)['default'];

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _Shader2 = __webpack_require__(42);

	var _Shader3 = _interopRequireDefault(_Shader2);

	var BlendShapeShader = (function (_Shader) {
	  _inherits(BlendShapeShader, _Shader);

	  function BlendShapeShader(canvas) {
	    _classCallCheck(this, BlendShapeShader);

	    _get(Object.getPrototypeOf(BlendShapeShader.prototype), 'constructor', this).call(this, canvas, BlendShapeShader);
	  }

	  _createClass(BlendShapeShader, [{
	    key: '_getBlendShapeVertexShaderString',
	    value: function _getBlendShapeVertexShaderString(gl, functions, existCamera_f) {
	      var _this = this;

	      var f = functions;
	      var shaderText = '';

	      var in_ = _get(Object.getPrototypeOf(BlendShapeShader.prototype), '_in_onVert', this).call(this, gl);
	      var out_ = _get(Object.getPrototypeOf(BlendShapeShader.prototype), '_out_onVert', this).call(this, gl);

	      shaderText += _get(Object.getPrototypeOf(BlendShapeShader.prototype), '_glslVer', this).call(this, gl);
	      shaderText += 'precision mediump float;\n';
	      shaderText += in_ + ' vec3 aVertex_position;\n';
	      if (this._exist(f, GLBoost.COLOR)) {
	        shaderText += in_ + ' vec3 aVertex_color;\n';
	        shaderText += out_ + ' vec4 color;\n';
	      }
	      if (this._exist(f, GLBoost.TEXCOORD)) {
	        shaderText += in_ + ' vec2 aVertex_texcoord;\n';
	        shaderText += out_ + ' vec2 texcoord;\n';
	      }
	      functions.forEach(function (attribName) {
	        if (_this._isShapeTarget(attribName)) {
	          shaderText += in_ + ' vec3 aVertex_' + attribName + ';\n';
	          shaderText += 'uniform float blendWeight_' + attribName + ';\n';
	        }
	      });
	      if (existCamera_f) {
	        shaderText += 'uniform mat4 projectionAndViewMatrix;\n';
	      }

	      shaderText += 'void main(void) {\n';
	      shaderText += 'float sumOfWeights = 0.0;\n';
	      functions.forEach(function (attribName) {
	        if (_this._isShapeTarget(attribName)) {
	          shaderText += 'sumOfWeights += blendWeight_' + attribName + ';\n';
	        }
	      });
	      var numOfShapeTargets = this._numberOfShapeTargets(functions);
	      shaderText += '    vec3 blendedPosition = aVertex_position * max(1.0 - sumOfWeights/float(' + numOfShapeTargets + '), 0.0);\n';
	      functions.forEach(function (attribName) {
	        if (_this._isShapeTarget(attribName)) {
	          shaderText += 'blendedPosition += aVertex_' + attribName + ' * blendWeight_' + attribName + '/float(' + numOfShapeTargets + ');\n';
	        }
	      });
	      if (existCamera_f) {
	        shaderText += '  gl_Position = projectionAndViewMatrix * vec4(blendedPosition, 1.0);\n';
	      } else {
	        shaderText += '  gl_Position = vec4(blendedPosition, 1.0);\n';
	      }
	      if (this._exist(f, GLBoost.COLOR)) {
	        shaderText += '  color = vec4(aVertex_color, 1.0);\n';
	      }
	      if (this._exist(f, GLBoost.TEXCOORD)) {
	        shaderText += '  texcoord = aVertex_texcoord;\n';
	      }
	      shaderText += '}\n';

	      return shaderText;
	    }
	  }, {
	    key: '_getBlendShapeFragmentShaderString',
	    value: function _getBlendShapeFragmentShaderString(gl, functions) {
	      var f = functions;
	      var shaderText = '';

	      var in_ = _get(Object.getPrototypeOf(BlendShapeShader.prototype), '_in_onFrag', this).call(this, gl);

	      shaderText += _get(Object.getPrototypeOf(BlendShapeShader.prototype), '_glslVer', this).call(this, gl);
	      shaderText += 'precision mediump float;\n';
	      shaderText += _get(Object.getPrototypeOf(BlendShapeShader.prototype), '_set_outColor_onFrag', this).call(this, gl);
	      if (this._exist(f, GLBoost.COLOR)) {
	        shaderText += in_ + ' vec4 color;\n';
	      }
	      if (this._exist(f, GLBoost.TEXCOORD)) {
	        shaderText += in_ + ' vec2 texcoord;\n\n';
	        shaderText += 'uniform sampler2D uTexture;\n';
	      }
	      shaderText += 'void main(void) {\n';

	      var textureFunc = _get(Object.getPrototypeOf(BlendShapeShader.prototype), '_texture_func', this).call(this, gl);
	      if (this._exist(f, GLBoost.TEXCOORD)) {
	        shaderText += '  rt1 = ' + textureFunc + '(uTexture, texcoord);\n';
	      } else if (this._exist(f, GLBoost.COLOR)) {
	        shaderText += '  rt1 = color;\n';
	      } else {
	        shaderText += '  rt1 = vec4(1.0, 1.0, 1.0, 1.0);\n';
	      }
	      shaderText += _get(Object.getPrototypeOf(BlendShapeShader.prototype), '_set_glFragColor_inGLVer1', this).call(this, gl);

	      shaderText += '}\n';

	      return shaderText;
	    }
	  }, {
	    key: '_numberOfShapeTargets',
	    value: function _numberOfShapeTargets(attributes) {
	      var _this2 = this;

	      var count = 0;
	      attributes.forEach(function (attribName) {
	        if (_this2._isShapeTarget(attribName)) {
	          count += 1;
	        }
	      });
	      return count;
	    }
	  }, {
	    key: '_isShapeTarget',
	    value: function _isShapeTarget(attribName) {
	      return !this._exist(attribName, GLBoost.POSITION) && !this._exist(attribName, GLBoost.COLOR) && !this._exist(attribName, GLBoost.TEXCOORD);
	    }
	  }, {
	    key: 'getShaderProgram',
	    value: function getShaderProgram(vertexAttribs, existCamera_f) {
	      var _this3 = this;

	      var gl = this._gl;
	      var shaderProgram = this._initShaders(gl, this._getBlendShapeVertexShaderString(gl, vertexAttribs, existCamera_f), this._getBlendShapeFragmentShaderString(gl, vertexAttribs));

	      vertexAttribs.forEach(function (attribName) {
	        shaderProgram['vertexAttribute_' + attribName] = gl.getAttribLocation(shaderProgram, 'aVertex_' + attribName);
	        gl.enableVertexAttribArray(shaderProgram['vertexAttribute_' + attribName]);
	      });

	      if (this._exist(vertexAttribs, GLBoost.TEXCOORD)) {
	        shaderProgram.uniformTextureSampler_0 = gl.getUniformLocation(shaderProgram, 'texture');
	        // サンプラーにテクスチャユニット０を指定する
	        gl.uniform1i(shaderProgram.uniformTextureSampler_0, 0);
	      }

	      vertexAttribs.forEach(function (attribName) {
	        if (_this3._isShapeTarget(attribName)) {
	          shaderProgram['uniformFloatSampler_blendWeight_' + attribName] = gl.getUniformLocation(shaderProgram, 'blendWeight_' + attribName);
	          // とりあえずゼロ初期化
	          gl.uniform1f(shaderProgram['uniformFloatSampler_blendWeight_' + attribName], 0.0);
	        }
	      });

	      if (existCamera_f) {
	        shaderProgram.projectionAndViewMatrix = gl.getUniformLocation(shaderProgram, 'projectionAndViewMatrix');
	      }

	      return shaderProgram;
	    }
	  }], [{
	    key: 'getInstance',
	    value: function getInstance(canvas) {
	      if (_Shader3['default']._instances[canvas.id] instanceof BlendShapeShader) {
	        return _Shader3['default']._instances[canvas.id];
	      } else {
	        return new BlendShapeShader(canvas);
	      }
	    }
	  }]);

	  return BlendShapeShader;
	})(_Shader3['default']);

	exports['default'] = BlendShapeShader;
	module.exports = exports['default'];

/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = __webpack_require__(3)['default'];

	var _classCallCheck = __webpack_require__(7)['default'];

	var _Symbol = __webpack_require__(56)['default'];

	var _Promise = __webpack_require__(73)['default'];

	var _interopRequireDefault = __webpack_require__(1)['default'];

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _globals = __webpack_require__(8);

	var _globals2 = _interopRequireDefault(_globals);

	var _Vector3 = __webpack_require__(44);

	var _Vector32 = _interopRequireDefault(_Vector3);

	var _Vector2 = __webpack_require__(49);

	var _Vector22 = _interopRequireDefault(_Vector2);

	var _ClassicMaterial = __webpack_require__(51);

	var _ClassicMaterial2 = _interopRequireDefault(_ClassicMaterial);

	var _Texture = __webpack_require__(52);

	var _Texture2 = _interopRequireDefault(_Texture);

	var singleton = _Symbol();
	var singletonEnforcer = _Symbol();

	var ObjLoader = (function () {
	  function ObjLoader(enforcer) {
	    _classCallCheck(this, ObjLoader);

	    if (enforcer !== singletonEnforcer) {
	      throw new Error("This is a Singleton class. get the instance using 'getInstance' static method.");
	    }
	  }

	  _createClass(ObjLoader, [{
	    key: 'loadObj',
	    value: function loadObj(url, canvas) {
	      var _this = this;

	      this._numMaterial = 0;
	      return new _Promise(function (resolve, reject) {
	        var xmlHttp = new XMLHttpRequest();
	        xmlHttp.onreadystatechange = function () {
	          if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
	            var gotText = xmlHttp.responseText;
	            var partsOfPath = url.split('/');
	            var basePath = '';
	            for (var i = 0; i < partsOfPath.length - 1; i++) {
	              basePath += partsOfPath[i] + '/';
	            }
	            var mesh = _this.constructMesh(gotText, basePath, canvas);
	            resolve(mesh);
	          }
	        };

	        xmlHttp.open("GET", url, true);
	        xmlHttp.send(null);
	      });
	    }
	  }, {
	    key: 'loadMaterialFromFile',
	    value: function loadMaterialFromFile(filePath, canvas) {
	      console.log(filePath);

	      var xmlHttp = new XMLHttpRequest();
	      xmlHttp.open("GET", filePath, false);
	      xmlHttp.send(null);
	      console.log(xmlHttp.responseText);

	      var mtlTextRows = xmlHttp.responseText.split('\n');

	      // checking the number of material
	      for (var i = 0; i < mtlTextRows.length; i++) {
	        var matchArray = mtlTextRows[i].match(/^(\w+) (\w+)/);
	        if (matchArray === null) {
	          continue;
	        }

	        if (matchArray[1] === "newmtl") {
	          this._numMaterial++;
	        }
	      }

	      var materials = new Array(this._numMaterial);
	      var iMCount = -1;

	      // main loading
	      for (var i = 0; i < mtlTextRows.length; i++) {
	        var matchArray = mtlTextRows[i].match(/^(\w+) (\w+) (\w+) (\w+)/);

	        if (matchArray === null) {
	          continue;
	        }

	        if (matchArray[1] === "newmtl") {
	          iMCount++;
	          materials[iMCount] = new _ClassicMaterial2['default'](canvas);
	          materials[iMCount].name = matchArray[2];
	        }

	        if (matchArray[1] === "Ka") {
	          materials[iMCount].ambientColor.x = parseFloat(matchArray[2]);
	          materials[iMCount].ambientColor.y = parseFloat(matchArray[3]);
	          materials[iMCount].ambientColor.z = parseFloat(matchArray[4]);
	        }

	        if (matchArray[1] === "Kd") {
	          materials[iMCount].diffuseColor.x = parseFloat(matchArray[2]);
	          materials[iMCount].diffuseColor.y = parseFloat(matchArray[3]);
	          materials[iMCount].diffuseColor.z = parseFloat(matchArray[4]);
	        }

	        if (matchArray[1] === "Ks") {
	          materials[iMCount].specularColor.x = parseFloat(matchArray[2]);
	          materials[iMCount].specularColor.y = parseFloat(matchArray[3]);
	          materials[iMCount].specularColor.z = parseFloat(matchArray[4]);
	        }

	        if (matchArray[1] === "map_Kd") {
	          var texture = new _Texture2['default'](matchArray[2], canvas);
	          texture.name = matchArray[2];
	          materials[iMCount].diffuseTexture = texture;
	        }
	      }
	      this._materials = materials;
	    }
	  }, {
	    key: 'constructMesh',
	    value: function constructMesh(objText, basePath, canvas) {

	      console.log(basePath);

	      var objTextRows = objText.split('\n');

	      var vCount = 0;
	      var fCount = 0;
	      var vnCount = 0;
	      var vtCount = 0;

	      var outputRows = [];
	      for (var i = 0; i < objTextRows.length; i++) {
	        var matchArray = objTextRows[i].match(/^(\w+) (\w+)/);
	        if (matchArray === null) {
	          continue;
	        }

	        // material file
	        if (matchArray[1] === "mtllib") {
	          this.loadMaterialFromFile(basePath + matchArray[2] + '.mtl', canvas);
	        }
	        // Vertex
	        if (matchArray[1] === "v") {
	          vCount++;
	        }
	        // Vertex Normal
	        if (matchArray[1] === "vn") {
	          vnCount++;
	        }
	        // Texcoord
	        if (matchArray[1] === "vt") {
	          vtCount++;
	        }
	        // Face
	        if (matchArray[1] === "f") {
	          fCount++;
	        }
	        outputRows.push(matchArray[1] + ' ' + matchArray[2]);
	      }

	      var verteces = new Array(fCount * 3);
	      var pvCoord = new Array(vCount);
	      var pvNormal = new Array(vnCount);
	      var pvTexture = new Array(vtCount);

	      vCount = 0;
	      vnCount = 0;
	      vtCount = 0;
	      fCount = 0;

	      for (var i = 0; i < objTextRows.length; i++) {
	        //キーワード 読み込み
	        var matchArray = objTextRows[i].match(/^(\w+) (\w+) (\w+) (\w+)/);

	        if (matchArray === null) {
	          continue;
	        }

	        //頂点 読み込み
	        if (matchArray[1] === "v") {
	          //          pvCoord[vCount].x=-x;//OBJは右手、Direct3Dは左手座標系。
	          pvCoord[vCount] = new _Vector32['default']();
	          pvCoord[vCount].x = parseFloat(matchArray[2]);
	          pvCoord[vCount].y = parseFloat(matchArray[3]);
	          pvCoord[vCount].z = parseFloat(matchArray[4]);
	          vCount++;
	        }

	        //法線 読み込み
	        if (matchArray[1] === "vn") {
	          //          pvNormal[vnCount].x=-x;//OBJは右手、Direct3Dは左手座標系。
	          pvNormal[vnCount] = new _Vector32['default']();
	          pvNormal[vnCount].x = parseFloat(matchArray[2]);
	          pvNormal[vnCount].y = parseFloat(matchArray[3]);
	          pvNormal[vnCount].z = parseFloat(matchArray[4]);
	          vnCount++;
	        }

	        //テクスチャー座標 読み込み
	        if (matchArray[1] === "vt") {
	          pvTexture[vtCount] = new _Vector22['default']();
	          pvTexture[vtCount].x = parseFloat(matchArray[2]);
	          //          pvTexture[vtCount].y=1-y;//Y成分が逆なので合わせる
	          pvTexture[vtCount].y = parseFloat(matchArray[3]);
	          vtCount++;
	        }
	      }

	      this._indexBuffers = new Array(this._materials); //GLuint[g_dwNumMaterial];

	      var boFlag = false;

	      this._FaceN = fCount;
	      var iFaceBufferArray = new Array(this._FaceN * 3);
	      fCount = 0;
	      var partFCount = 0;

	      for (var i = 0; i < this._materials.length; i++) {
	        partFCount = 0;

	        for (var j = 0; j < objTextRows.length && fCount < this._FaceN; j++) {
	          var matchArray = objTextRows[j].match(/^(\w+) (\w+)/);

	          if (matchArray[1] === "usemtl") {
	            if (matchArray[2] === matchArray[i].name) {
	              boFlag = true;
	            } else {
	              boFlag = false;
	            }
	          }

	          if (matchArray[1] === "f" && boFlag) {
	            var v1 = 0,
	                v2 = 0,
	                v3 = 0;
	            var vn1 = 0,
	                vn2 = 0,
	                vn3 = 0;
	            var vt1 = 0,
	                vt2 = 0,
	                vt3 = 0;

	            if (materials[i].diffuseTexture) {
	              var _matchArray = objTextRows[j].match(/^(\w+) (\d+)\/(\d+)\/(\d+) (\d+)\/(\d+)\/(\d+) (\d+)\/(\d+)\/(\d+)/);
	              v1 = _matchArray[2];
	              vt1 = _matchArray[3];
	              vn1 = _matchArray[4];
	              v2 = _matchArray[5];
	              vt2 = _matchArray[6];
	              vn2 = _matchArray[7];
	              v3 = _matchArray[8];
	              vt3 = _matchArray[9];
	              vn3 = _matchArray[10];

	              if (vt1) {}
	            }
	          }
	        }
	      }

	      return outputRows;
	    }
	  }], [{
	    key: 'getInstance',
	    value: function getInstance() {
	      if (!this[singleton]) {
	        this[singleton] = new ObjLoader(singletonEnforcer);
	      }
	      return this[singleton];
	    }
	  }]);

	  return ObjLoader;
	})();

	exports['default'] = ObjLoader;

	_globals2['default']["ObjLoader"] = ObjLoader;
	module.exports = exports['default'];

/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(57), __esModule: true };

/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(58);
	module.exports = __webpack_require__(21).Symbol;

/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	// ECMAScript 6 symbols shim
	var $              = __webpack_require__(6)
	  , global         = __webpack_require__(20)
	  , has            = __webpack_require__(62)
	  , SUPPORT_DESC   = __webpack_require__(63)
	  , $def           = __webpack_require__(19)
	  , $redef         = __webpack_require__(64)
	  , $fails         = __webpack_require__(22)
	  , shared         = __webpack_require__(60)
	  , setTag         = __webpack_require__(67)
	  , uid            = __webpack_require__(61)
	  , wks            = __webpack_require__(59)
	  , keyOf          = __webpack_require__(68)
	  , $names         = __webpack_require__(69)
	  , enumKeys       = __webpack_require__(70)
	  , isArray        = __webpack_require__(71)
	  , isObject       = __webpack_require__(30)
	  , anObject       = __webpack_require__(31)
	  , toIObject      = __webpack_require__(14)
	  , createDesc     = __webpack_require__(66)
	  , getDesc        = $.getDesc
	  , setDesc        = $.setDesc
	  , _create        = $.create
	  , getNames       = $names.get
	  , $Symbol        = global.Symbol
	  , $JSON          = global.JSON
	  , _stringify     = $JSON && $JSON.stringify
	  , setter         = false
	  , HIDDEN         = wks('_hidden')
	  , isEnum         = $.isEnum
	  , SymbolRegistry = shared('symbol-registry')
	  , AllSymbols     = shared('symbols')
	  , useNative      = typeof $Symbol == 'function'
	  , ObjectProto    = Object.prototype;

	// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
	var setSymbolDesc = SUPPORT_DESC && $fails(function(){
	  return _create(setDesc({}, 'a', {
	    get: function(){ return setDesc(this, 'a', {value: 7}).a; }
	  })).a != 7;
	}) ? function(it, key, D){
	  var protoDesc = getDesc(ObjectProto, key);
	  if(protoDesc)delete ObjectProto[key];
	  setDesc(it, key, D);
	  if(protoDesc && it !== ObjectProto)setDesc(ObjectProto, key, protoDesc);
	} : setDesc;

	var wrap = function(tag){
	  var sym = AllSymbols[tag] = _create($Symbol.prototype);
	  sym._k = tag;
	  SUPPORT_DESC && setter && setSymbolDesc(ObjectProto, tag, {
	    configurable: true,
	    set: function(value){
	      if(has(this, HIDDEN) && has(this[HIDDEN], tag))this[HIDDEN][tag] = false;
	      setSymbolDesc(this, tag, createDesc(1, value));
	    }
	  });
	  return sym;
	};

	var isSymbol = function(it){
	  return typeof it == 'symbol';
	};

	var $defineProperty = function defineProperty(it, key, D){
	  if(D && has(AllSymbols, key)){
	    if(!D.enumerable){
	      if(!has(it, HIDDEN))setDesc(it, HIDDEN, createDesc(1, {}));
	      it[HIDDEN][key] = true;
	    } else {
	      if(has(it, HIDDEN) && it[HIDDEN][key])it[HIDDEN][key] = false;
	      D = _create(D, {enumerable: createDesc(0, false)});
	    } return setSymbolDesc(it, key, D);
	  } return setDesc(it, key, D);
	};
	var $defineProperties = function defineProperties(it, P){
	  anObject(it);
	  var keys = enumKeys(P = toIObject(P))
	    , i    = 0
	    , l = keys.length
	    , key;
	  while(l > i)$defineProperty(it, key = keys[i++], P[key]);
	  return it;
	};
	var $create = function create(it, P){
	  return P === undefined ? _create(it) : $defineProperties(_create(it), P);
	};
	var $propertyIsEnumerable = function propertyIsEnumerable(key){
	  var E = isEnum.call(this, key);
	  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key]
	    ? E : true;
	};
	var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key){
	  var D = getDesc(it = toIObject(it), key);
	  if(D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key]))D.enumerable = true;
	  return D;
	};
	var $getOwnPropertyNames = function getOwnPropertyNames(it){
	  var names  = getNames(toIObject(it))
	    , result = []
	    , i      = 0
	    , key;
	  while(names.length > i)if(!has(AllSymbols, key = names[i++]) && key != HIDDEN)result.push(key);
	  return result;
	};
	var $getOwnPropertySymbols = function getOwnPropertySymbols(it){
	  var names  = getNames(toIObject(it))
	    , result = []
	    , i      = 0
	    , key;
	  while(names.length > i)if(has(AllSymbols, key = names[i++]))result.push(AllSymbols[key]);
	  return result;
	};
	var $stringify = function stringify(it){
	  var args = [it]
	    , i    = 1
	    , replacer, $replacer;
	  while(arguments.length > i)args.push(arguments[i++]);
	  replacer = args[1];
	  if(typeof replacer == 'function')$replacer = replacer;
	  if($replacer || !isArray(replacer))replacer = function(key, value){
	    if($replacer)value = $replacer.call(this, key, value);
	    if(!isSymbol(value))return value;
	  };
	  args[1] = replacer;
	  return _stringify.apply($JSON, args);
	};
	var buggyJSON = $fails(function(){
	  var S = $Symbol();
	  // MS Edge converts symbol values to JSON as {}
	  // WebKit converts symbol values to JSON as null
	  // V8 throws on boxed symbols
	  return _stringify([S]) != '[null]' || _stringify({a: S}) != '{}' || _stringify(Object(S)) != '{}';
	});

	// 19.4.1.1 Symbol([description])
	if(!useNative){
	  $Symbol = function Symbol(){
	    if(isSymbol(this))throw TypeError('Symbol is not a constructor');
	    return wrap(uid(arguments[0]));
	  };
	  $redef($Symbol.prototype, 'toString', function toString(){
	    return this._k;
	  });

	  isSymbol = function(it){
	    return it instanceof $Symbol;
	  };

	  $.create     = $create;
	  $.isEnum     = $propertyIsEnumerable;
	  $.getDesc    = $getOwnPropertyDescriptor;
	  $.setDesc    = $defineProperty;
	  $.setDescs   = $defineProperties;
	  $.getNames   = $names.get = $getOwnPropertyNames;
	  $.getSymbols = $getOwnPropertySymbols;

	  if(SUPPORT_DESC && !__webpack_require__(72)){
	    $redef(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
	  }
	}

	var symbolStatics = {
	  // 19.4.2.1 Symbol.for(key)
	  'for': function(key){
	    return has(SymbolRegistry, key += '')
	      ? SymbolRegistry[key]
	      : SymbolRegistry[key] = $Symbol(key);
	  },
	  // 19.4.2.5 Symbol.keyFor(sym)
	  keyFor: function keyFor(key){
	    return keyOf(SymbolRegistry, key);
	  },
	  useSetter: function(){ setter = true; },
	  useSimple: function(){ setter = false; }
	};
	// 19.4.2.2 Symbol.hasInstance
	// 19.4.2.3 Symbol.isConcatSpreadable
	// 19.4.2.4 Symbol.iterator
	// 19.4.2.6 Symbol.match
	// 19.4.2.8 Symbol.replace
	// 19.4.2.9 Symbol.search
	// 19.4.2.10 Symbol.species
	// 19.4.2.11 Symbol.split
	// 19.4.2.12 Symbol.toPrimitive
	// 19.4.2.13 Symbol.toStringTag
	// 19.4.2.14 Symbol.unscopables
	$.each.call((
	    'hasInstance,isConcatSpreadable,iterator,match,replace,search,' +
	    'species,split,toPrimitive,toStringTag,unscopables'
	  ).split(','), function(it){
	    var sym = wks(it);
	    symbolStatics[it] = useNative ? sym : wrap(sym);
	  }
	);

	setter = true;

	$def($def.G + $def.W, {Symbol: $Symbol});

	$def($def.S, 'Symbol', symbolStatics);

	$def($def.S + $def.F * !useNative, 'Object', {
	  // 19.1.2.2 Object.create(O [, Properties])
	  create: $create,
	  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
	  defineProperty: $defineProperty,
	  // 19.1.2.3 Object.defineProperties(O, Properties)
	  defineProperties: $defineProperties,
	  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
	  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
	  // 19.1.2.7 Object.getOwnPropertyNames(O)
	  getOwnPropertyNames: $getOwnPropertyNames,
	  // 19.1.2.8 Object.getOwnPropertySymbols(O)
	  getOwnPropertySymbols: $getOwnPropertySymbols
	});

	// 24.3.2 JSON.stringify(value [, replacer [, space]])
	$JSON && $def($def.S + $def.F * (!useNative || buggyJSON), 'JSON', {stringify: $stringify});

	// 19.4.3.5 Symbol.prototype[@@toStringTag]
	setTag($Symbol, 'Symbol');
	// 20.2.1.9 Math[@@toStringTag]
	setTag(Math, 'Math', true);
	// 24.3.3 JSON[@@toStringTag]
	setTag(global.JSON, 'JSON', true);

/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	var store  = __webpack_require__(60)('wks')
	  , Symbol = __webpack_require__(20).Symbol;
	module.exports = function(name){
	  return store[name] || (store[name] =
	    Symbol && Symbol[name] || (Symbol || __webpack_require__(61))('Symbol.' + name));
	};

/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	var global = __webpack_require__(20)
	  , SHARED = '__core-js_shared__'
	  , store  = global[SHARED] || (global[SHARED] = {});
	module.exports = function(key){
	  return store[key] || (store[key] = {});
	};

/***/ },
/* 61 */
/***/ function(module, exports) {

	var id = 0
	  , px = Math.random();
	module.exports = function(key){
	  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
	};

/***/ },
/* 62 */
/***/ function(module, exports) {

	var hasOwnProperty = {}.hasOwnProperty;
	module.exports = function(it, key){
	  return hasOwnProperty.call(it, key);
	};

/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

	// Thank's IE8 for his funny defineProperty
	module.exports = !__webpack_require__(22)(function(){
	  return Object.defineProperty({}, 'a', {get: function(){ return 7; }}).a != 7;
	});

/***/ },
/* 64 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(65);

/***/ },
/* 65 */
/***/ function(module, exports, __webpack_require__) {

	var $          = __webpack_require__(6)
	  , createDesc = __webpack_require__(66);
	module.exports = __webpack_require__(63) ? function(object, key, value){
	  return $.setDesc(object, key, createDesc(1, value));
	} : function(object, key, value){
	  object[key] = value;
	  return object;
	};

/***/ },
/* 66 */
/***/ function(module, exports) {

	module.exports = function(bitmap, value){
	  return {
	    enumerable  : !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable    : !(bitmap & 4),
	    value       : value
	  };
	};

/***/ },
/* 67 */
/***/ function(module, exports, __webpack_require__) {

	var has  = __webpack_require__(62)
	  , hide = __webpack_require__(65)
	  , TAG  = __webpack_require__(59)('toStringTag');

	module.exports = function(it, tag, stat){
	  if(it && !has(it = stat ? it : it.prototype, TAG))hide(it, TAG, tag);
	};

/***/ },
/* 68 */
/***/ function(module, exports, __webpack_require__) {

	var $         = __webpack_require__(6)
	  , toIObject = __webpack_require__(14);
	module.exports = function(object, el){
	  var O      = toIObject(object)
	    , keys   = $.getKeys(O)
	    , length = keys.length
	    , index  = 0
	    , key;
	  while(length > index)if(O[key = keys[index++]] === el)return key;
	};

/***/ },
/* 69 */
/***/ function(module, exports, __webpack_require__) {

	// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
	var toString  = {}.toString
	  , toIObject = __webpack_require__(14)
	  , getNames  = __webpack_require__(6).getNames;

	var windowNames = typeof window == 'object' && Object.getOwnPropertyNames
	  ? Object.getOwnPropertyNames(window) : [];

	var getWindowNames = function(it){
	  try {
	    return getNames(it);
	  } catch(e){
	    return windowNames.slice();
	  }
	};

	module.exports.get = function getOwnPropertyNames(it){
	  if(windowNames && toString.call(it) == '[object Window]')return getWindowNames(it);
	  return getNames(toIObject(it));
	};

/***/ },
/* 70 */
/***/ function(module, exports, __webpack_require__) {

	// all enumerable object keys, includes symbols
	var $ = __webpack_require__(6);
	module.exports = function(it){
	  var keys       = $.getKeys(it)
	    , getSymbols = $.getSymbols;
	  if(getSymbols){
	    var symbols = getSymbols(it)
	      , isEnum  = $.isEnum
	      , i       = 0
	      , key;
	    while(symbols.length > i)if(isEnum.call(it, key = symbols[i++]))keys.push(key);
	  }
	  return keys;
	};

/***/ },
/* 71 */
/***/ function(module, exports, __webpack_require__) {

	// 7.2.2 IsArray(argument)
	var cof = __webpack_require__(16);
	module.exports = Array.isArray || function(arg){
	  return cof(arg) == 'Array';
	};

/***/ },
/* 72 */
/***/ function(module, exports) {

	module.exports = true;

/***/ },
/* 73 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(74), __esModule: true };

/***/ },
/* 74 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(75);
	__webpack_require__(76);
	__webpack_require__(82);
	__webpack_require__(86);
	module.exports = __webpack_require__(21).Promise;

/***/ },
/* 75 */
/***/ function(module, exports) {

	

/***/ },
/* 76 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $at  = __webpack_require__(77)(true);

	// 21.1.3.27 String.prototype[@@iterator]()
	__webpack_require__(79)(String, 'String', function(iterated){
	  this._t = String(iterated); // target
	  this._i = 0;                // next index
	// 21.1.5.2.1 %StringIteratorPrototype%.next()
	}, function(){
	  var O     = this._t
	    , index = this._i
	    , point;
	  if(index >= O.length)return {value: undefined, done: true};
	  point = $at(O, index);
	  this._i += point.length;
	  return {value: point, done: false};
	});

/***/ },
/* 77 */
/***/ function(module, exports, __webpack_require__) {

	// true  -> String#at
	// false -> String#codePointAt
	var toInteger = __webpack_require__(78)
	  , defined   = __webpack_require__(17);
	module.exports = function(TO_STRING){
	  return function(that, pos){
	    var s = String(defined(that))
	      , i = toInteger(pos)
	      , l = s.length
	      , a, b;
	    if(i < 0 || i >= l)return TO_STRING ? '' : undefined;
	    a = s.charCodeAt(i);
	    return a < 0xd800 || a > 0xdbff || i + 1 === l
	      || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
	        ? TO_STRING ? s.charAt(i) : a
	        : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
	  };
	};

/***/ },
/* 78 */
/***/ function(module, exports) {

	// 7.1.4 ToInteger
	var ceil  = Math.ceil
	  , floor = Math.floor;
	module.exports = function(it){
	  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
	};

/***/ },
/* 79 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var LIBRARY         = __webpack_require__(72)
	  , $def            = __webpack_require__(19)
	  , $redef          = __webpack_require__(64)
	  , hide            = __webpack_require__(65)
	  , has             = __webpack_require__(62)
	  , SYMBOL_ITERATOR = __webpack_require__(59)('iterator')
	  , Iterators       = __webpack_require__(80)
	  , BUGGY           = !([].keys && 'next' in [].keys()) // Safari has buggy iterators w/o `next`
	  , FF_ITERATOR     = '@@iterator'
	  , KEYS            = 'keys'
	  , VALUES          = 'values';
	var returnThis = function(){ return this; };
	module.exports = function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCE){
	  __webpack_require__(81)(Constructor, NAME, next);
	  var createMethod = function(kind){
	    switch(kind){
	      case KEYS: return function keys(){ return new Constructor(this, kind); };
	      case VALUES: return function values(){ return new Constructor(this, kind); };
	    } return function entries(){ return new Constructor(this, kind); };
	  };
	  var TAG      = NAME + ' Iterator'
	    , proto    = Base.prototype
	    , _native  = proto[SYMBOL_ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT]
	    , _default = _native || createMethod(DEFAULT)
	    , methods, key;
	  // Fix native
	  if(_native){
	    var IteratorPrototype = __webpack_require__(6).getProto(_default.call(new Base));
	    // Set @@toStringTag to native iterators
	    __webpack_require__(67)(IteratorPrototype, TAG, true);
	    // FF fix
	    if(!LIBRARY && has(proto, FF_ITERATOR))hide(IteratorPrototype, SYMBOL_ITERATOR, returnThis);
	  }
	  // Define iterator
	  if(!LIBRARY || FORCE)hide(proto, SYMBOL_ITERATOR, _default);
	  // Plug for library
	  Iterators[NAME] = _default;
	  Iterators[TAG]  = returnThis;
	  if(DEFAULT){
	    methods = {
	      keys:    IS_SET            ? _default : createMethod(KEYS),
	      values:  DEFAULT == VALUES ? _default : createMethod(VALUES),
	      entries: DEFAULT != VALUES ? _default : createMethod('entries')
	    };
	    if(FORCE)for(key in methods){
	      if(!(key in proto))$redef(proto, key, methods[key]);
	    } else $def($def.P + $def.F * BUGGY, NAME, methods);
	  }
	};

/***/ },
/* 80 */
/***/ function(module, exports) {

	module.exports = {};

/***/ },
/* 81 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $ = __webpack_require__(6)
	  , IteratorPrototype = {};

	// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
	__webpack_require__(65)(IteratorPrototype, __webpack_require__(59)('iterator'), function(){ return this; });

	module.exports = function(Constructor, NAME, next){
	  Constructor.prototype = $.create(IteratorPrototype, {next: __webpack_require__(66)(1,next)});
	  __webpack_require__(67)(Constructor, NAME + ' Iterator');
	};

/***/ },
/* 82 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(83);
	var Iterators = __webpack_require__(80);
	Iterators.NodeList = Iterators.HTMLCollection = Iterators.Array;

/***/ },
/* 83 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var setUnscope = __webpack_require__(84)
	  , step       = __webpack_require__(85)
	  , Iterators  = __webpack_require__(80)
	  , toIObject  = __webpack_require__(14);

	// 22.1.3.4 Array.prototype.entries()
	// 22.1.3.13 Array.prototype.keys()
	// 22.1.3.29 Array.prototype.values()
	// 22.1.3.30 Array.prototype[@@iterator]()
	__webpack_require__(79)(Array, 'Array', function(iterated, kind){
	  this._t = toIObject(iterated); // target
	  this._i = 0;                   // next index
	  this._k = kind;                // kind
	// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
	}, function(){
	  var O     = this._t
	    , kind  = this._k
	    , index = this._i++;
	  if(!O || index >= O.length){
	    this._t = undefined;
	    return step(1);
	  }
	  if(kind == 'keys'  )return step(0, index);
	  if(kind == 'values')return step(0, O[index]);
	  return step(0, [index, O[index]]);
	}, 'values');

	// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
	Iterators.Arguments = Iterators.Array;

	setUnscope('keys');
	setUnscope('values');
	setUnscope('entries');

/***/ },
/* 84 */
/***/ function(module, exports) {

	module.exports = function(){ /* empty */ };

/***/ },
/* 85 */
/***/ function(module, exports) {

	module.exports = function(done, value){
	  return {value: value, done: !!done};
	};

/***/ },
/* 86 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $          = __webpack_require__(6)
	  , LIBRARY    = __webpack_require__(72)
	  , global     = __webpack_require__(20)
	  , ctx        = __webpack_require__(32)
	  , classof    = __webpack_require__(87)
	  , $def       = __webpack_require__(19)
	  , isObject   = __webpack_require__(30)
	  , anObject   = __webpack_require__(31)
	  , aFunction  = __webpack_require__(33)
	  , strictNew  = __webpack_require__(88)
	  , forOf      = __webpack_require__(89)
	  , setProto   = __webpack_require__(29).set
	  , same       = __webpack_require__(94)
	  , species    = __webpack_require__(95)
	  , SPECIES    = __webpack_require__(59)('species')
	  , RECORD     = __webpack_require__(61)('record')
	  , asap       = __webpack_require__(96)
	  , PROMISE    = 'Promise'
	  , process    = global.process
	  , isNode     = classof(process) == 'process'
	  , P          = global[PROMISE]
	  , Wrapper;

	var testResolve = function(sub){
	  var test = new P(function(){});
	  if(sub)test.constructor = Object;
	  return P.resolve(test) === test;
	};

	var useNative = function(){
	  var works = false;
	  function P2(x){
	    var self = new P(x);
	    setProto(self, P2.prototype);
	    return self;
	  }
	  try {
	    works = P && P.resolve && testResolve();
	    setProto(P2, P);
	    P2.prototype = $.create(P.prototype, {constructor: {value: P2}});
	    // actual Firefox has broken subclass support, test that
	    if(!(P2.resolve(5).then(function(){}) instanceof P2)){
	      works = false;
	    }
	    // actual V8 bug, https://code.google.com/p/v8/issues/detail?id=4162
	    if(works && __webpack_require__(63)){
	      var thenableThenGotten = false;
	      P.resolve($.setDesc({}, 'then', {
	        get: function(){ thenableThenGotten = true; }
	      }));
	      works = thenableThenGotten;
	    }
	  } catch(e){ works = false; }
	  return works;
	}();

	// helpers
	var isPromise = function(it){
	  return isObject(it) && (useNative ? classof(it) == 'Promise' : RECORD in it);
	};
	var sameConstructor = function(a, b){
	  // library wrapper special case
	  if(LIBRARY && a === P && b === Wrapper)return true;
	  return same(a, b);
	};
	var getConstructor = function(C){
	  var S = anObject(C)[SPECIES];
	  return S != undefined ? S : C;
	};
	var isThenable = function(it){
	  var then;
	  return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
	};
	var notify = function(record, isReject){
	  if(record.n)return;
	  record.n = true;
	  var chain = record.c;
	  asap(function(){
	    var value = record.v
	      , ok    = record.s == 1
	      , i     = 0;
	    var run = function(react){
	      var cb = ok ? react.ok : react.fail
	        , ret, then;
	      try {
	        if(cb){
	          if(!ok)record.h = true;
	          ret = cb === true ? value : cb(value);
	          if(ret === react.P){
	            react.rej(TypeError('Promise-chain cycle'));
	          } else if(then = isThenable(ret)){
	            then.call(ret, react.res, react.rej);
	          } else react.res(ret);
	        } else react.rej(value);
	      } catch(err){
	        react.rej(err);
	      }
	    };
	    while(chain.length > i)run(chain[i++]); // variable length - can't use forEach
	    chain.length = 0;
	    record.n = false;
	    if(isReject)setTimeout(function(){
	      var promise = record.p
	        , handler, console;
	      if(isUnhandled(promise)){
	        if(isNode){
	          process.emit('unhandledRejection', value, promise);
	        } else if(handler = global.onunhandledrejection){
	          handler({promise: promise, reason: value});
	        } else if((console = global.console) && console.error){
	          console.error('Unhandled promise rejection', value);
	        }
	      } record.a = undefined;
	    }, 1);
	  });
	};
	var isUnhandled = function(promise){
	  var record = promise[RECORD]
	    , chain  = record.a || record.c
	    , i      = 0
	    , react;
	  if(record.h)return false;
	  while(chain.length > i){
	    react = chain[i++];
	    if(react.fail || !isUnhandled(react.P))return false;
	  } return true;
	};
	var $reject = function(value){
	  var record = this;
	  if(record.d)return;
	  record.d = true;
	  record = record.r || record; // unwrap
	  record.v = value;
	  record.s = 2;
	  record.a = record.c.slice();
	  notify(record, true);
	};
	var $resolve = function(value){
	  var record = this
	    , then;
	  if(record.d)return;
	  record.d = true;
	  record = record.r || record; // unwrap
	  try {
	    if(then = isThenable(value)){
	      asap(function(){
	        var wrapper = {r: record, d: false}; // wrap
	        try {
	          then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
	        } catch(e){
	          $reject.call(wrapper, e);
	        }
	      });
	    } else {
	      record.v = value;
	      record.s = 1;
	      notify(record, false);
	    }
	  } catch(e){
	    $reject.call({r: record, d: false}, e); // wrap
	  }
	};

	// constructor polyfill
	if(!useNative){
	  // 25.4.3.1 Promise(executor)
	  P = function Promise(executor){
	    aFunction(executor);
	    var record = {
	      p: strictNew(this, P, PROMISE),         // <- promise
	      c: [],                                  // <- awaiting reactions
	      a: undefined,                           // <- checked in isUnhandled reactions
	      s: 0,                                   // <- state
	      d: false,                               // <- done
	      v: undefined,                           // <- value
	      h: false,                               // <- handled rejection
	      n: false                                // <- notify
	    };
	    this[RECORD] = record;
	    try {
	      executor(ctx($resolve, record, 1), ctx($reject, record, 1));
	    } catch(err){
	      $reject.call(record, err);
	    }
	  };
	  __webpack_require__(101)(P.prototype, {
	    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
	    then: function then(onFulfilled, onRejected){
	      var S = anObject(anObject(this).constructor)[SPECIES];
	      var react = {
	        ok:   typeof onFulfilled == 'function' ? onFulfilled : true,
	        fail: typeof onRejected == 'function'  ? onRejected  : false
	      };
	      var promise = react.P = new (S != undefined ? S : P)(function(res, rej){
	        react.res = res;
	        react.rej = rej;
	      });
	      aFunction(react.res);
	      aFunction(react.rej);
	      var record = this[RECORD];
	      record.c.push(react);
	      if(record.a)record.a.push(react);
	      if(record.s)notify(record, false);
	      return promise;
	    },
	    // 25.4.5.1 Promise.prototype.catch(onRejected)
	    'catch': function(onRejected){
	      return this.then(undefined, onRejected);
	    }
	  });
	}

	// export
	$def($def.G + $def.W + $def.F * !useNative, {Promise: P});
	__webpack_require__(67)(P, PROMISE);
	species(P);
	species(Wrapper = __webpack_require__(21)[PROMISE]);

	// statics
	$def($def.S + $def.F * !useNative, PROMISE, {
	  // 25.4.4.5 Promise.reject(r)
	  reject: function reject(r){
	    return new this(function(res, rej){ rej(r); });
	  }
	});
	$def($def.S + $def.F * (!useNative || testResolve(true)), PROMISE, {
	  // 25.4.4.6 Promise.resolve(x)
	  resolve: function resolve(x){
	    return isPromise(x) && sameConstructor(x.constructor, this)
	      ? x : new this(function(res){ res(x); });
	  }
	});
	$def($def.S + $def.F * !(useNative && __webpack_require__(102)(function(iter){
	  P.all(iter)['catch'](function(){});
	})), PROMISE, {
	  // 25.4.4.1 Promise.all(iterable)
	  all: function all(iterable){
	    var C      = getConstructor(this)
	      , values = [];
	    return new C(function(res, rej){
	      forOf(iterable, false, values.push, values);
	      var remaining = values.length
	        , results   = Array(remaining);
	      if(remaining)$.each.call(values, function(promise, index){
	        C.resolve(promise).then(function(value){
	          results[index] = value;
	          --remaining || res(results);
	        }, rej);
	      });
	      else res(results);
	    });
	  },
	  // 25.4.4.4 Promise.race(iterable)
	  race: function race(iterable){
	    var C = getConstructor(this);
	    return new C(function(res, rej){
	      forOf(iterable, false, function(promise){
	        C.resolve(promise).then(res, rej);
	      });
	    });
	  }
	});

/***/ },
/* 87 */
/***/ function(module, exports, __webpack_require__) {

	// getting tag from 19.1.3.6 Object.prototype.toString()
	var cof = __webpack_require__(16)
	  , TAG = __webpack_require__(59)('toStringTag')
	  // ES3 wrong here
	  , ARG = cof(function(){ return arguments; }()) == 'Arguments';

	module.exports = function(it){
	  var O, T, B;
	  return it === undefined ? 'Undefined' : it === null ? 'Null'
	    // @@toStringTag case
	    : typeof (T = (O = Object(it))[TAG]) == 'string' ? T
	    // builtinTag case
	    : ARG ? cof(O)
	    // ES3 arguments fallback
	    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
	};

/***/ },
/* 88 */
/***/ function(module, exports) {

	module.exports = function(it, Constructor, name){
	  if(!(it instanceof Constructor))throw TypeError(name + ": use the 'new' operator!");
	  return it;
	};

/***/ },
/* 89 */
/***/ function(module, exports, __webpack_require__) {

	var ctx         = __webpack_require__(32)
	  , call        = __webpack_require__(90)
	  , isArrayIter = __webpack_require__(91)
	  , anObject    = __webpack_require__(31)
	  , toLength    = __webpack_require__(92)
	  , getIterFn   = __webpack_require__(93);
	module.exports = function(iterable, entries, fn, that){
	  var iterFn = getIterFn(iterable)
	    , f      = ctx(fn, that, entries ? 2 : 1)
	    , index  = 0
	    , length, step, iterator;
	  if(typeof iterFn != 'function')throw TypeError(iterable + ' is not iterable!');
	  // fast case for arrays with default iterator
	  if(isArrayIter(iterFn))for(length = toLength(iterable.length); length > index; index++){
	    entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
	  } else for(iterator = iterFn.call(iterable); !(step = iterator.next()).done; ){
	    call(iterator, f, step.value, entries);
	  }
	};

/***/ },
/* 90 */
/***/ function(module, exports, __webpack_require__) {

	// call something on iterator step with safe closing on error
	var anObject = __webpack_require__(31);
	module.exports = function(iterator, fn, value, entries){
	  try {
	    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
	  // 7.4.6 IteratorClose(iterator, completion)
	  } catch(e){
	    var ret = iterator['return'];
	    if(ret !== undefined)anObject(ret.call(iterator));
	    throw e;
	  }
	};

/***/ },
/* 91 */
/***/ function(module, exports, __webpack_require__) {

	// check on default Array iterator
	var Iterators = __webpack_require__(80)
	  , ITERATOR  = __webpack_require__(59)('iterator');
	module.exports = function(it){
	  return (Iterators.Array || Array.prototype[ITERATOR]) === it;
	};

/***/ },
/* 92 */
/***/ function(module, exports, __webpack_require__) {

	// 7.1.15 ToLength
	var toInteger = __webpack_require__(78)
	  , min       = Math.min;
	module.exports = function(it){
	  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
	};

/***/ },
/* 93 */
/***/ function(module, exports, __webpack_require__) {

	var classof   = __webpack_require__(87)
	  , ITERATOR  = __webpack_require__(59)('iterator')
	  , Iterators = __webpack_require__(80);
	module.exports = __webpack_require__(21).getIteratorMethod = function(it){
	  if(it != undefined)return it[ITERATOR] || it['@@iterator'] || Iterators[classof(it)];
	};

/***/ },
/* 94 */
/***/ function(module, exports) {

	module.exports = Object.is || function is(x, y){
	  return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
	};

/***/ },
/* 95 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $       = __webpack_require__(6)
	  , SPECIES = __webpack_require__(59)('species');
	module.exports = function(C){
	  if(__webpack_require__(63) && !(SPECIES in C))$.setDesc(C, SPECIES, {
	    configurable: true,
	    get: function(){ return this; }
	  });
	};

/***/ },
/* 96 */
/***/ function(module, exports, __webpack_require__) {

	var global    = __webpack_require__(20)
	  , macrotask = __webpack_require__(97).set
	  , Observer  = global.MutationObserver || global.WebKitMutationObserver
	  , process   = global.process
	  , isNode    = __webpack_require__(16)(process) == 'process'
	  , head, last, notify;

	var flush = function(){
	  var parent, domain;
	  if(isNode && (parent = process.domain)){
	    process.domain = null;
	    parent.exit();
	  }
	  while(head){
	    domain = head.domain;
	    if(domain)domain.enter();
	    head.fn.call(); // <- currently we use it only for Promise - try / catch not required
	    if(domain)domain.exit();
	    head = head.next;
	  } last = undefined;
	  if(parent)parent.enter();
	}

	// Node.js
	if(isNode){
	  notify = function(){
	    process.nextTick(flush);
	  };
	// browsers with MutationObserver
	} else if(Observer){
	  var toggle = 1
	    , node   = document.createTextNode('');
	  new Observer(flush).observe(node, {characterData: true}); // eslint-disable-line no-new
	  notify = function(){
	    node.data = toggle = -toggle;
	  };
	// for other environments - macrotask based on:
	// - setImmediate
	// - MessageChannel
	// - window.postMessag
	// - onreadystatechange
	// - setTimeout
	} else {
	  notify = function(){
	    // strange IE + webpack dev server bug - use .call(global)
	    macrotask.call(global, flush);
	  };
	}

	module.exports = function asap(fn){
	  var task = {fn: fn, next: undefined, domain: isNode && process.domain};
	  if(last)last.next = task;
	  if(!head){
	    head = task;
	    notify();
	  } last = task;
	};

/***/ },
/* 97 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var ctx                = __webpack_require__(32)
	  , invoke             = __webpack_require__(99)
	  , html               = __webpack_require__(100)
	  , cel                = __webpack_require__(98)
	  , global             = __webpack_require__(20)
	  , process            = global.process
	  , setTask            = global.setImmediate
	  , clearTask          = global.clearImmediate
	  , MessageChannel     = global.MessageChannel
	  , counter            = 0
	  , queue              = {}
	  , ONREADYSTATECHANGE = 'onreadystatechange'
	  , defer, channel, port;
	var run = function(){
	  var id = +this;
	  if(queue.hasOwnProperty(id)){
	    var fn = queue[id];
	    delete queue[id];
	    fn();
	  }
	};
	var listner = function(event){
	  run.call(event.data);
	};
	// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
	if(!setTask || !clearTask){
	  setTask = function setImmediate(fn){
	    var args = [], i = 1;
	    while(arguments.length > i)args.push(arguments[i++]);
	    queue[++counter] = function(){
	      invoke(typeof fn == 'function' ? fn : Function(fn), args);
	    };
	    defer(counter);
	    return counter;
	  };
	  clearTask = function clearImmediate(id){
	    delete queue[id];
	  };
	  // Node.js 0.8-
	  if(__webpack_require__(16)(process) == 'process'){
	    defer = function(id){
	      process.nextTick(ctx(run, id, 1));
	    };
	  // Browsers with MessageChannel, includes WebWorkers
	  } else if(MessageChannel){
	    channel = new MessageChannel;
	    port    = channel.port2;
	    channel.port1.onmessage = listner;
	    defer = ctx(port.postMessage, port, 1);
	  // Browsers with postMessage, skip WebWorkers
	  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
	  } else if(global.addEventListener && typeof postMessage == 'function' && !global.importScripts){
	    defer = function(id){
	      global.postMessage(id + '', '*');
	    };
	    global.addEventListener('message', listner, false);
	  // IE8-
	  } else if(ONREADYSTATECHANGE in cel('script')){
	    defer = function(id){
	      html.appendChild(cel('script'))[ONREADYSTATECHANGE] = function(){
	        html.removeChild(this);
	        run.call(id);
	      };
	    };
	  // Rest old browsers
	  } else {
	    defer = function(id){
	      setTimeout(ctx(run, id, 1), 0);
	    };
	  }
	}
	module.exports = {
	  set:   setTask,
	  clear: clearTask
	};

/***/ },
/* 98 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(30)
	  , document = __webpack_require__(20).document
	  // in old IE typeof document.createElement is 'object'
	  , is = isObject(document) && isObject(document.createElement);
	module.exports = function(it){
	  return is ? document.createElement(it) : {};
	};

/***/ },
/* 99 */
/***/ function(module, exports) {

	// fast apply, http://jsperf.lnkit.com/fast-apply/5
	module.exports = function(fn, args, that){
	  var un = that === undefined;
	  switch(args.length){
	    case 0: return un ? fn()
	                      : fn.call(that);
	    case 1: return un ? fn(args[0])
	                      : fn.call(that, args[0]);
	    case 2: return un ? fn(args[0], args[1])
	                      : fn.call(that, args[0], args[1]);
	    case 3: return un ? fn(args[0], args[1], args[2])
	                      : fn.call(that, args[0], args[1], args[2]);
	    case 4: return un ? fn(args[0], args[1], args[2], args[3])
	                      : fn.call(that, args[0], args[1], args[2], args[3]);
	  } return              fn.apply(that, args);
	};

/***/ },
/* 100 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(20).document && document.documentElement;

/***/ },
/* 101 */
/***/ function(module, exports, __webpack_require__) {

	var $redef = __webpack_require__(64);
	module.exports = function(target, src){
	  for(var key in src)$redef(target, key, src[key]);
	  return target;
	};

/***/ },
/* 102 */
/***/ function(module, exports, __webpack_require__) {

	var SYMBOL_ITERATOR = __webpack_require__(59)('iterator')
	  , SAFE_CLOSING    = false;
	try {
	  var riter = [7][SYMBOL_ITERATOR]();
	  riter['return'] = function(){ SAFE_CLOSING = true; };
	  Array.from(riter, function(){ throw 2; });
	} catch(e){ /* empty */ }
	module.exports = function(exec){
	  if(!SAFE_CLOSING)return false;
	  var safe = false;
	  try {
	    var arr  = [7]
	      , iter = arr[SYMBOL_ITERATOR]();
	    iter.next = function(){ safe = true; };
	    arr[SYMBOL_ITERATOR] = function(){ return iter; };
	    exec(arr);
	  } catch(e){ /* empty */ }
	  return safe;
	};

/***/ }
/******/ ]);