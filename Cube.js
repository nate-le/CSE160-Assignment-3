class Cube {
  constructor() {
    this.type = "cube";
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
    this.textureNum = -2;

    this.cubeVerts32 = new Float32Array([
      // Front face
      0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0,

      // Back face
      0, 0, -1, 1, 0, -1, 1, 1, -1, 0, 0, -1, 1, 1, -1, 0, 1, -1,

      // Top face
      0, 1, 0, 1, 1, 0, 1, 1, -1, 0, 1, 0, 1, 1, -1, 0, 1, -1,

      // Bottom face
      0, 0, 0, 1, 0, 0, 1, 0, -1, 0, 0, 0, 1, 0, -1, 0, 0, -1,

      // Left face
      0, 0, 0, 0, 1, 0, 0, 1, -1, 0, 0, 0, 0, 1, -1, 0, 0, -1,

      // Right face
      1, 0, 0, 1, 1, 0, 1, 1, -1, 1, 0, 0, 1, 1, -1, 1, 0, -1,
    ]);

    this.cubeUVs = new Float32Array([
      // Front face
      0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1,

      // Back face
      0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1,

      // Top face
      0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0,

      // Bottom face
      1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0,

      // Left face
      1, 0, 1, 1, 0, 1, 1, 0, 0, 1, 0, 0,

      // Right face
      0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0,
    ]);
  }

  render() {
    var rgba = this.color;

    gl.uniform1i(u_whichTexture, 0);
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    // Top face
    drawTriangle3DUV([0, 0, 0, 1, 1, 0, 1, 0, 0], [0, 0, 1, 1, 1, 0]);
    drawTriangle3DUV([0, 0, 0, 0, 1, 0, 1, 1, 0], [0, 0, 0, 1, 1, 1]);

    gl.uniform4f(
      u_FragColor,
      rgba[0] * 0.9,
      rgba[1] * 0.9,
      rgba[2] * 0.9,
      rgba[3]
    );

    // Front face
    drawTriangle3D([0, 0, 0, 1, 0, 0, 1, 0, -1]);
    drawTriangle3D([0, 0, 0, 1, 0, -1, 0, 0, -1]);

    // Back face
    drawTriangle3D([0, 1, 0, 1, 1, 0, 1, 1, -1]);
    drawTriangle3D([0, 1, 0, 1, 1, -1, 0, 1, -1]);

    // Left face
    drawTriangle3D([0, 0, 0, 0, 0, -1, 0, 1, -1]);
    drawTriangle3D([0, 0, 0, 0, 1, -1, 0, 1, 0]);

    // Right face
    drawTriangle3D([1, 0, 0, 1, 0, -1, 1, 1, -1]);
    drawTriangle3D([1, 0, 0, 1, 1, -1, 1, 1, 0]);

    // Bottom face
    drawTriangle3D([0, 0, -1, 1, 0, -1, 1, 1, -1]);
    drawTriangle3D([0, 0, -1, 1, 1, -1, 0, 1, -1]);
  }

  renderfast() {
    var rgba = this.color;

    gl.uniform1i(u_whichTexture, this.textureNum);
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    if (g_vertexBuffer == null) {
      initTriangle3D();
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.cubeVerts32, gl.DYNAMIC_DRAW);

    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    var uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.cubeUVs, gl.DYNAMIC_DRAW);

    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_UV);

    gl.drawArrays(gl.TRIANGLES, 0, 36);
  }
}

function drawCube(matrix, color) {
  gl.enable(gl.DEPTH_TEST);

  var n = 36; // number of vertices

  const vertices = [
    // Front face
    0, 0, 0, 1, 0, 0, 1, 0, -1, 0, 0, 0, 1, 0, -1, 0, 0, -1,

    // Back face
    0, 1, 0, 1, 1, 0, 1, 1, -1, 0, 1, 0, 1, 1, -1, 0, 1, -1,

    // Left face
    0, 0, 0, 0, 0, -1, 0, 1, -1, 0, 0, 0, 0, 1, -1, 0, 1, 0,

    // Right face
    1, 0, 0, 1, 0, -1, 1, 1, -1, 1, 0, 0, 1, 1, -1, 1, 1, 0,

    // Top face
    0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0,

    // Bottom face
    0, 0, -1, 1, 0, -1, 1, 1, -1, 0, 0, -1, 1, 1, -1, 0, 1, -1,
  ];

  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log("Failed to create the buffer object");
    return;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);
  
  gl.uniformMatrix4fv(u_ModelMatrix, false, matrix.elements);
  gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3]);

  gl.drawArrays(gl.TRIANGLES, 0, 30);

  gl.uniform4f(
    u_FragColor,
    color[0] * 0.9,
    color[1] * 0.9,
    color[2] * 0.9,
    color[3]
  );

  gl.drawArrays(gl.TRIANGLES, 30, 6);
}