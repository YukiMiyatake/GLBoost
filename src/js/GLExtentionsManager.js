import GLBoost from './globals';

export default class GLExtentionsManager {

  constructor(glContext) {
    var gl = glContext.gl;
    if (GLExtentionsManager._instances[glContext.canvas.id]) {
      return GLExtentionsManager._instances[glContext.canvas.id];
    }

    if (GLBoost.WEBGL_ONE_USE_EXTENSIONS) {
      this._extVAO = gl.getExtension('OES_vertex_array_object');

      this._extDBs = gl.getExtension('WEBGL_draw_buffers');

      this._extTFA = gl.getExtension('EXT_texture_filter_anisotropic') ||
        gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic') ||
        gl.getExtension('MOZ_EXT_texture_filter_anisotropic');

      this._extEIUI = gl.getExtension('OES_element_index_uint');
    }

    GLExtentionsManager._instances[glContext.canvas.id] = this;
  }
  static getInstance(gl) {
    return new GLExtentionsManager(gl);
  }

  get extVAO() {
    return this._extVAO;
  }

  get extDBs() {
    return this._extDBs;
  }

  get extTFA() {
    return this._extTFA;
  }

  createVertexArray(gl) {
    if (GLBoost.isThisGLVersion_2(gl)) {
      return gl.createVertexArray();
    } else if (this._extVAO) {
      return this._extVAO.createVertexArrayOES();
    } else {
      return null;
    }
  }

  bindVertexArray(gl, vao) {
    if (GLBoost.isThisGLVersion_2(gl)) {
      gl.bindVertexArray(vao);
      return true;
    } else if (this._extVAO) {
      this._extVAO.bindVertexArrayOES(vao);
      return true;
    } else {
      return false;
    }
  }

  drawBuffers(gl, buffers) {
    if (GLBoost.isThisGLVersion_2(gl)) {
      gl.drawBuffers(buffers);
      return true;
    } else if (this._extDBs) {
      this.extDBs.drawBuffersWEBGL(buffers);
      return true;
    } else {
      return false;
    }
  }

  colorAttachiment(gl, index) {
    return this._extDBs ?
      this._extDBs[`COLOR_ATTACHMENT${index}_WEBGL`] :
      gl[`COLOR_ATTACHMENT${index}`];
  }

  elementIndexBitSize(gl) {
    if (GLBoost.isThisGLVersion_2(gl) || this._extEIUI) {
      return gl.UNSIGNED_INT;
    } else {
      return gl.UNSIGNED_SHORT;
    }
  }

  createUintArrayForElementIndex(gl, array) {
    if (GLBoost.isThisGLVersion_2(gl) || this._extEIUI) {
      return new Uint32Array(array);
    } else {
      return new Uint16Array(array);
    }
  }

}
GLExtentionsManager._instances = new Object();
