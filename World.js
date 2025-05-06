// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform sampler2D u_Sampler3;
  uniform sampler2D u_Sampler4;
  uniform sampler2D u_Sampler5;
  uniform int u_whichTexture;
  void main() {
    if (u_whichTexture == -2) {
        gl_FragColor = u_FragColor;
      } else if (u_whichTexture == -1) {
       gl_FragColor = vec4(v_UV, 1.0, 1.0);
      } else if (u_whichTexture == 0) {
        gl_FragColor = texture2D(u_Sampler0, v_UV);
      } else if (u_whichTexture == 1) {
        gl_FragColor = texture2D(u_Sampler1, v_UV);
      } else if (u_whichTexture == 2) {
        gl_FragColor = texture2D(u_Sampler2, v_UV);
      } else if (u_whichTexture == 3) {
        gl_FragColor = texture2D(u_Sampler3, v_UV);
      } else if (u_whichTexture == 4) {
        gl_FragColor = texture2D(u_Sampler4, v_UV);
      } else if (u_whichTexture == 5) {
        gl_FragColor = texture2D(u_Sampler5, v_UV);
      } else {
        gl_FragColor = vec4(1, 0.2, 0.2, 1);
      }
  }`

// Global Variables
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_Sampler0;
let u_whichTexture;

let camera = new Camera();
let rotateSensitivity = 0.15;

const textures = [
  "sky.jpg",
  "dirt.jpg",
  "sun.jpg",
  "chicken.jpg",
  "egg.jpg",
  "chicken_jockey.jpg"
];

// Globals related UI elements
var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  a_UV = gl.getAttribLocation(gl.program, "a_UV");
  if (a_UV < 0) {
    console.log("Failed to get the storage location of a_UV.");
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  u_ViewMatrix = gl.getUniformLocation(gl.program, "u_ViewMatrix");
  if (!u_ViewMatrix) {
    console.log("Failed to get the storage location of u_ViewMatrix.");
    return;
  }

  u_ProjectionMatrix = gl.getUniformLocation(gl.program, "u_ProjectionMatrix");
  if (!u_ProjectionMatrix) {
    console.log("Failed to get the storage location of u_ProjectionMatrix.");
    return;
  }

  u_whichTexture = gl.getUniformLocation(gl.program, "u_whichTexture");
  if (!u_whichTexture) {
    console.log("Failed to get the storage location of u_whichTexture.");
    return;
  }

  // Set an initial value for this matrix to identity
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

// Set up actions for the HTML UI elements
function addActionsForHtmlUI() {
  document.addEventListener("keydown", keydown);
  let isDragging = false;
  let lastX = 0;
  let lastY = 0;
  canvas.addEventListener("mousedown", (ev) => { if (ev.button === 0) { isDragging = true; lastX = ev.clientX; lastY = ev.clientY; document.body.style.cursor = "none"; } });

  document.addEventListener("mousemove", (ev) => { if (isDragging) { let deltaX = ev.clientX - lastX; let deltaY = ev.clientY - lastY; camera.pan(-deltaX * rotateSensitivity); camera.tilt(deltaY * rotateSensitivity); lastX = ev.clientX; lastY = ev.clientY; } });

  document.addEventListener("mouseup", () => { isDragging = false; document.body.style.cursor = "default"; });
}

function initTextures() {
  for (let i = 0; i < textures.length; i += 1) {
    let image = new Image();
    if (!image) {
      console.log("Failed to create the image object");
      return false;
    }

    image.onload = function () {
      sendTextureToGLSL(image, i);
    };

    image.src = `${textures[i]}`;
  }

  return true;
}

function sendTextureToGLSL(image, index) {
  var texture = gl.createTexture();
  if (!texture) {
    console.log("Failed to create the texture object");
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl["TEXTURE" + index]);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(gl.getUniformLocation(gl.program, "u_Sampler" + index), index);
}

function main() {
  // Set up canvas and gl variables
  setupWebGL();
  // Set up GLSL shader programs and connect GLSL variables
  connectVariablesToGLSL();

  // Set up actions for the HTML UI elements
  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  //canvas.onmousedown = click;
  //canvas.onmousemove = function(ev) { if (ev.buttons == 1) { click(ev); }};

  initTextures();

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  requestAnimationFrame(tick);
}

// Called by browser repeatedly whenever its time
function tick() {
  // Save the current time
  g_seconds = performance.now() / 1000.0 - g_startTime;
  // Draw everything
  renderScene();
  // Tell the browser to update again when it has time
  requestAnimationFrame(tick);
}

function click(ev) {
  // Extract the event click and return it in WebGL coordinates
  let [x, y] = convertCoordinatesEventToGL(ev);

  // Draw every shape that is supposed to be in the canvas
  renderScene();
}

// Extract the event click and return it in WebGL coordinates
function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
  y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

  return([x, y]);
}

function keydown(ev) {
  if (ev.keyCode == 87) {
    // Up
    camera.forward();
  } else if (ev.keyCode == 83) {
    // Down
    camera.back();
  } else if (ev.keyCode == 65) {
    // Left
    camera.left();
  } else if (ev.keyCode == 68) {
    // Right
    camera.right();
  } else if (ev.keyCode == 81) {
    // Q
    camera.pan(5);
  } else if (ev.keyCode == 69) {
    // E
    camera.pan(-5);
  } else if (ev.keyCode == 70) {
    // F
    addBlock(camera);
  } else if (ev.keyCode == 71) {
    // G
    removeBlock(camera);
  }
}

let base = [
  [3, 0, 1, 1, 1, 1, 1, 4],
  [1, 0, 0, 3, 0, 2, 0, 0],
  [1, 0, 1, 1, 0, 0, 0, 0],
  [0, 0, 3, 0, 0, 0, 1, 0],
  [1, 0, 2, 0, 0, 1, 0, 0],
  [1, 0, 0, 0, 0, 0, 0, 0],
  [1, 0, 0, 3, 0, 0, 0, 0],
  [4, 0, 1, 0, 0, 0, 0, 4],
];

let g_map = [];
for (let i = 0; i < 32; i++) {
  g_map[i] = [];
  for (let j = 0; j < 32; j++) {
    g_map[i][j] = base[i % 8][j % 8];
  }
}


function drawMap() {
  for (let x = 0; x < 32; x += 1) {
    for (let z = 0; z < 32; z += 1) {
      let height = g_map[x][z];
      for (let y = 0; y < height; y += 1) {
        if (y < 2) {
          let cube = new Cube();
          cube.textureNum = 1;
          cube.matrix.translate(x, y, z - 25);
          cube.renderfast(); 
        } else {
          let chicken = new Cube();
          chicken.textureNum = 3;
          chicken.matrix.translate(x, y, z - 25);
          chicken.renderfast();
        }
      }
    }
  }
}

function getFacingCell(camera) {
  let f = new Vector3();
  f.set(camera.at);
  f.sub(camera.eye);
  f.normalize();

  let dx = Math.round(f.elements[0]);
  let dz = Math.round(f.elements[2]);

  let x = Math.floor(camera.eye.elements[0] + dx);
  let z = Math.floor(camera.eye.elements[2] + dz + 25);

  x = Math.max(0, Math.min(31, x));
  z = Math.max(0, Math.min(31, z));

  return {x, z};
}

function addBlock(camera) {
  let {x, z} = getFacingCell(camera);
  if (g_map[x][z] < 10) {
    g_map[x][z] += 1;
    drawMap();
  }
}

function removeBlock(camera) {
  let {x, z} = getFacingCell(camera);
  if (g_map[x][z] > 0) {
    g_map[x][z] -= 1;
    drawMap();
  }
}

let raindrops = [];

for (let i = 0; i < 200; i++) {
  let x = Math.random() * 32;
  let y = Math.random() * 20;
  let z = Math.random() * 32 - 25;
  raindrops.push(new Raindrop(x, y, z));
}

// Draw every shape that is supposed to be in the canvas
function renderScene() {
  // Check the time at the start of this function
  var startTime = performance.now();

  // Pass the projection matrix
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, camera.projMat.elements);

  // Pass the view matrix
  gl.uniformMatrix4fv(u_ViewMatrix, false, camera.viewMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  var sky = new Cube();
  sky.textureNum = 0;
  sky.matrix.scale(38, 10, 38);
  sky.matrix.translate(-0.05, -0.001, 0.25);
  sky.renderfast();

  var sun = new Cube();
  sun.textureNum = 2;
  sun.matrix.scale(2, 2, 2);
  sun.matrix.translate(-0.9, 4, -13.25);
  sun.renderfast();

  var ground = new Cube();
  ground.color = [0.5, 0.7, 0.2, 1.0];
  ground.matrix.translate(-1.92, -0.001, 9.5);
  ground.matrix.scale(38, 0, 38);
  ground.matrix.translate(0, 0, 0);
  ground.renderfast();

  var egg = new Cube();
  egg.textureNum = 4;
  egg.matrix.scale(.5, .5, .5);
  egg.matrix.translate(8 , 2, 8);
  egg.renderfast();

  let chicken_j = new Cube();
    chicken_j.textureNum = 5;
    chicken_j.matrix.scale(1, 1, 1);
    chicken_j.matrix.translate(3.8 , 1.5, 4.2);
    chicken_j.renderfast();

  drawMap();

  for (let drop of raindrops) {
    drop.update();
    drop.render();
  }

  
  // Check the time at the end of the function, and show on web page
  var duration = performance.now() - startTime;
  sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000 / duration) / 10, "numdot");
}

function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML.");
    return;
  }
  htmlElm.innerHTML = text;
}