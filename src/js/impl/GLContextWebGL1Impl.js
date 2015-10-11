import GLContextImpl from './GLContextImpl'

export default class GLContextWebGL1Impl extends GLContextImpl {

  constructor(canvas, parent) {
    super(canvas, parent);

    super.init('webgl', WebGLRenderingContext);

  }

  get gl() {
    return this._canvas._gl;
  }

}
