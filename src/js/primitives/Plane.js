import GLBoost from './../globals'
import Element from './../Element'
import GLContext from './../GLContext'
import GLExtentionsManager from './../GLExtentionsManager'
import Mesh from './../Mesh'
import Vector3 from './../math/Vector3'
import Vector2 from './../math/Vector2'

export default class Plane extends Mesh {
  constructor(width, height, vertexColor, canvas) {
    super(canvas);

    this._setupVertexData(width/2.0, height/2.0, vertexColor);
  }

  _setupVertexData(halfWidth, halfHeight, vertexColor) {
    var indices = [
      //0, 1, 3, 3, 1, 2
      3, 1, 0, 2, 1, 3
    ];

    var positions = [
      new Vector3(-halfWidth, 0, -halfHeight),
      new Vector3(halfWidth,  0, -halfHeight),
      new Vector3(halfWidth,  0, halfHeight),
      new Vector3(-halfWidth, 0, halfHeight)
    ];
    var colors = [
      new Vector3(vertexColor.x, vertexColor.y, vertexColor.z),
      new Vector3(vertexColor.x, vertexColor.y, vertexColor.z),
      new Vector3(vertexColor.x, vertexColor.y, vertexColor.z),
      new Vector3(vertexColor.x, vertexColor.y, vertexColor.z)
    ];
    var texcoords = [
      new Vector2(0.0, 0.0),
      new Vector2(1.0, 0.0),
      new Vector2(1.0, 1.0),
      new Vector2(0.0, 1.0)
    ];

    this.setVerticesData({
      position: positions,
      color: colors,
      texcoord: texcoords,
      indices: [indices]
    });
  }

}

GLBoost["Plane"] = Plane;
