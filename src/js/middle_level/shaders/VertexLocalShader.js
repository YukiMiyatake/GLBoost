import Shader from '../../low_level/shaders/Shader';

export default class VertexLocalShaderSource {
  VSDefine_VertexLocalShaderSource(in_, out_, f) {
    let shaderText = '';

    if (Shader._exist(f, GLBoost.NORMAL)) {
      shaderText += `${in_} vec3 aVertex_normal;\n`;
      shaderText += `${out_} vec3 v_normal;\n`;
    }
    shaderText += `${out_} vec4 position;\n`;
    shaderText +=      'uniform mat4 modelViewProjectionMatrix;\n';
    return shaderText;
  }

  VSTransform_VertexLocalShaderSource(existCamera_f, f) {
    var shaderText = '';
    if (existCamera_f) {
      shaderText +=   '  gl_Position = modelViewProjectionMatrix * position_local;\n';
      shaderText +=   '  mat4 pvwMatrix = modelViewProjectionMatrix;\n';
    } else {
      shaderText +=   '  gl_Position = position_local;\n';
    }
    if (Shader._exist(f, GLBoost.NORMAL)) {
      shaderText += '  v_normal = aVertex_normal;\n';
    }
    shaderText += '  position = vec4(aVertex_position, 1.0);\n';

    return shaderText;
  }

  FSDefine_VertexLocalShaderSource(in_, f, lights, material, extraData) {
    var shaderText = '';
    if(lights.length > 0) {
      shaderText += `uniform vec4 lightPosition[${lights.length}];\n`;
      shaderText += `uniform vec4 lightDiffuse[${lights.length}];\n`;
    }
    if (Shader._exist(f, GLBoost.NORMAL)) {
      shaderText += `${in_} vec3 v_normal;\n`;
    }
    shaderText += `${in_} vec4 position;\n`;

    return shaderText;
  }

  prepare_VertexLocalShaderSource(gl, shaderProgram, expression, vertexAttribs, existCamera_f, lights, material, extraData) {

    var vertexAttribsAsResult = [];

    vertexAttribs.forEach((attribName)=>{
      if (attribName === 'position' || attribName === 'normal') {
        shaderProgram['vertexAttribute_' + attribName] = gl.getAttribLocation(shaderProgram, 'aVertex_' + attribName);
        gl.enableVertexAttribArray(shaderProgram['vertexAttribute_' + attribName]);
        vertexAttribsAsResult.push(attribName);
      }
    });

    if (existCamera_f) {
      material.setUniform(shaderProgram, 'uniform_modelViewProjectionMatrix', this._glContext.getUniformLocation(shaderProgram, 'modelViewProjectionMatrix'));
      material._semanticsDic['MODELVIEWPROJECTION'] = 'modelViewProjectionMatrix';
    }

    for(let i=0; i<lights.length; i++) {
      material.setUniform(shaderProgram, 'uniform_lightPosition_'+i, this._glContext.getUniformLocation(shaderProgram, `lightPosition[${i}]`));
      material.setUniform(shaderProgram, 'uniform_lightDiffuse_'+i, this._glContext.getUniformLocation(shaderProgram, `lightDiffuse[${i}]`));
    }

    return vertexAttribsAsResult;
  }
}

GLBoost['VertexLocalShaderSource'] = VertexLocalShaderSource;
