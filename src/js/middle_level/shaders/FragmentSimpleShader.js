import Shader from '../../low_level/shaders/Shader';
import VertexWorldShaderSource from './VertexWorldShader';


export class FragmentSimpleShaderSource {
  // In the context within these member methods,
  // this is the instance of the corresponding shader class.

  VSTransform_FragmentSimpleShaderSource(existCamera_f, f) {
    var shaderText = '';

    if (existCamera_f) {
      shaderText +=   '  gl_Position = projectionMatrix * viewMatrix * position_world;\n';
    } else {
      shaderText +=   '  gl_Position = position_world;\n';
    }

    return shaderText;
  }

  FSDefine_FragmentSimpleShaderSource(in_, f) {
    let shaderText =      'uniform float opacity;\n';
    shaderText +=         'uniform bool isPreMultipliedAlpha;\n';
    return shaderText;
  }

  FSShade_FragmentSimpleShaderSource(f, gl) {
    let shaderText =   "";
    shaderText +=   `bool isDataOutput = false;\n`;
    shaderText +=   `rt0 = vec4(1.0, 1.0, 1.0, opacity);\n`;

    return shaderText;
  }

  FSFinalize_FragmentSimpleShaderSource(f, gl, lights, material, extraData) {
    let shaderText = '';

    shaderText += 'if (isPreMultipliedAlpha && !isDataOutput) {\n';
    shaderText += '  rt0.rgb *= rt0.a;\n';
    shaderText += '}\n';

    return shaderText;
  }

  prepare_FragmentSimpleShaderSource(gl, glslProgram, expression, vertexAttribs, existCamera_f, lights, material, extraData) {

    var vertexAttribsAsResult = [];

    material.setUniform(glslProgram, 'uniform_opacity', this._glContext.getUniformLocation(glslProgram, 'opacity'));
    material.setUniform(glslProgram, 'uniform_isPremultipliedAlpha', this._glContext.getUniformLocation(glslProgram, 'isPremultipliedAlpha'));

    let uniformLocationDepthBias = material.getUniform(glslProgram, 'uniform_depthBias');
    if (uniformLocationDepthBias) {
      let depthBias = this.getShaderParameter(material, 'depthBias', false);
      if (depthBias) {
        this._glContext.uniform1f(uniformLocationDepthBias, depthBias, true);
      }
    }

    return vertexAttribsAsResult;
  }
}

export default class FragmentSimpleShader extends Shader {
  constructor(glBoostContext, basicShader = VertexWorldShaderSource) {

    super(glBoostContext, basicShader);

    FragmentSimpleShader.mixin(basicShader);
    FragmentSimpleShader.mixin(FragmentSimpleShaderSource);

    this._isPreMultipliedAlpha = null;
  }

  setUniforms(gl, glslProgram, scene, material, camera, mesh, lights) {
    super.setUniforms(gl, glslProgram, scene, material, camera, mesh, lights);

    this._glContext.uniform1i(material.getUniform(glslProgram, 'uniform_isPreMultipliedAlpha'), this._isPreMultipliedAlpha, true);

  }

  set isPreMultipliedAlpha(flg) {
    this._isPreMultipliedAlpha = flg;
  }

  get isPreMultipliedAlpha() {
    return this._isPreMultipliedAlpha;
  }
}


GLBoost['FragmentSimpleShader'] = FragmentSimpleShader;
