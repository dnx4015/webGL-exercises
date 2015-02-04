var gl;
var shaderProgram;
var triangleVertexPositionBuffer;
var triangleVertexColorBuffer;
var triangle2VertexPositionBuffer;
var triangle2VertexColorBuffer;
var mMatrix = mat4.create();
var pMatrix = mat4.create();
var vMatrix = mat4.create();
var mMatrixStack = [];
var lastTime = 0;
var rTri = 0;
var rTri2 = 0;

// Iniciar o ambiente quando a página for carregada
$(function()
{
  iniciaWebGL();
});

// Iniciar o ambiente
function iniciaWebGL()
{
  var canvas = $('#licao01-canvas')[0];
  iniciarGL(canvas); // Definir como um canvas 3D
  iniciarShaders();  // Obter e processar os Shaders
  iniciarBuffers();  // Enviar o triângulo e quadrado na GPU
  iniciarAmbiente(); // Definir background e cor do objeto
  //desenharCena();    // Usar os itens anteriores e desenhar
  tick();
}

function iniciarGL(canvas)
{
  try
  {
    gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
  }
  catch(e)
  {
    if(!gl)
    {
      alert("Não pode inicializar WebGL, desculpe");
    }
  }
}

function iniciarShaders()
{
  var vertexShader = getShader(gl, "#shader-vs");
  var fragmentShader = getShader(gl, "#shader-fs");

  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if(!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS))
  {
    alert("Não pode inicializar shaders");
  }

  gl.useProgram(shaderProgram);

  shaderProgram.vertexPositionAttribute = gl.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
  
  shaderProgram.vertexColorAttribute = gl.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
  gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

  shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
  shaderProgram.vMatrixUniform = gl.getUniformLocation(shaderProgram, "uVMatrix");
  shaderProgram.mMatrixUniform = gl.getUniformLocation(shaderProgram, "uMMatrix");
}

function getShader(gl, id)
{
  var shaderScript = $(id)[0];
  if(!shaderScript) 
  {
    return null;
  }

  var str = "";
  var k = shaderScript.firstChild;
  while(k)
  {
    if(k.nodeType == 3)
      str += k.textContent;
    k = k.nextSibling;
  }

  var shader;
  if(shaderScript.type == "x-shader/x-fragment")
  {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  }
  else if(shaderScript.type == "x-shader/x-vertex")
  {
    shader = gl.createShader(gl.VERTEX_SHADER);
  }
  else
  {
    return null;
  }

  gl.shaderSource(shader, str);
  gl.compileShader(shader);

  if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
  {
    alert(gl.getShaderInfoLog(shader));
    return null;
  }

  return shader;
}

function iniciarBuffers()
{
  triangleVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
  var vertices = [
       0.0, 1.0, 0.0,
      -1.0,-1.0, 0.0,
       1.0,-1.0, 0.0
      ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  triangleVertexPositionBuffer.itemSize = 3;
  triangleVertexPositionBuffer.numItems = 3;
  
  triangleVertexColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer);
  var colors = [
      1.0, 0.0, 0.0, 1.0,
      0.0, 1.0, 0.0, 1.0,
      0.0, 0.0, 1.0, 1.0
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
  triangleVertexColorBuffer.itemSize = 4;
  triangleVertexColorBuffer.numItems = 3;
  
  

  triangle2VertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangle2VertexPositionBuffer);
  /*vertices = [
    1.0, 1.0, 0.0,
   -1.0, 1.0, 0.0,
    1.0,-1.0, 0.0
  ];*/
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  triangle2VertexPositionBuffer.itemSize = 3;
  triangle2VertexPositionBuffer.numItems = 3;
  
  triangle2VertexColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangle2VertexColorBuffer);
  colors = [];
  for (var i=0; i < 3; i++) {
      colors = colors.concat([0.5, 0.5, 1.0, 1.0]);
  }
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
  triangle2VertexColorBuffer.itemSize = 4;
  triangle2VertexColorBuffer.numItems = 3;
}

function iniciarAmbiente()
{
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
}

function tick() {
    requestAnimFrame(tick);
    drawScene();
    animate();
}

function animate() {
    var timeNow = new Date().getTime();
    if (lastTime != 0) {
        var elapsed = timeNow - lastTime;

        rTri += (90 * elapsed) / 1000.0;
        rTri2 += (75 * elapsed) / 1000.0;
    }
    lastTime = timeNow;
}

function drawScene()
{
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
  mat4.identity(mMatrix);
  mat4.identity(vMatrix);

  // Desenhando Triângulo
  mat4.translate(mMatrix, [-1.5, 0.0, -7.0]);
  //Rotate triangle 1
  mPushMatrix();
  mat4.rotate(mMatrix, degToRad(rTri), [0, 0, 1]);
  
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, triangleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
  
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, triangleVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
  
  setMatrixUniforms();
  gl.drawArrays(gl.TRIANGLES, 0, triangleVertexPositionBuffer.numItems);

  mPopMatrix();
  
  // Desenhando Triangle 2
  mat4.translate(mMatrix, [3.0, 0.0, 0.0]);
  
  mPushMatrix();
  mat4.rotate(mMatrix, degToRad(rTri2), [0, 0, -1]);
  
  gl.bindBuffer(gl.ARRAY_BUFFER, triangle2VertexPositionBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, triangle2VertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
  
  gl.bindBuffer(gl.ARRAY_BUFFER, triangle2VertexColorBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, triangle2VertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

  setMatrixUniforms();
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, triangle2VertexPositionBuffer.numItems);
  
  mPopMatrix();
}

function mPushMatrix() {
  var copy = mat4.create();
  mat4.set(mMatrix, copy);
  mMatrixStack.push(copy);
}

function mPopMatrix() {
  if (mMatrixStack.length == 0) {
    throw "Invalid popMatrix!";
  }
  mMatrix = mMatrixStack.pop();
}

function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

function setMatrixUniforms()
{
  gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
  gl.uniformMatrix4fv(shaderProgram.vMatrixUniform, false, vMatrix);
  gl.uniformMatrix4fv(shaderProgram.mMatrixUniform, false, mMatrix);
}
