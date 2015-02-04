var canvas;
var gl;

var points = [ ];
var colors = [ ];
var indices = [ ];

var last = 0;
var t = 0;
var tLoc;
var A = 0.5;
var aLoc;
var lambda = 1.0;
var lambdaLoc;
var v = 2.0
var vLoc;
var theta = [-70, -5, 0];
var thetaLoc;

var cantX = 4;
var cantZ = 4;
var numVertices = (cantX + 1) * (cantZ + 1) - 1;

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var inc = 5;

window.onload = function () 
{
	document.getElementById("compute").onclick = function(){
		A = getVal("amplitude", A);
		lambda = getVal("lambda", lambda);
		v = getVal("velocity", v);
	};
	document.getElementById("create").onclick = function(){
		var val = parseInt(getVal("cantX"));
		cantX = isNaN(val) ? cantX: val;
		cantX = cantX >= 20 ? 20 : cantX;
		val = parseInt(getVal("cantZ"));
		cantZ = isNaN(val) ? cantZ: val;
		cantZ = cantZ >= 10 ? 10 : cantZ;
		numVertices = (cantX + 1) * (cantZ + 1) - 1;
		init();
	}
	document.getElementById("rotX1").onmousedown = function(){onClickRot(xAxis, inc);}
	document.getElementById("rotX2").onmousedown = function(){onClickRot(xAxis, -inc);}
	document.getElementById("rotY1").onmousedown = function(){onClickRot(yAxis, inc);}
	document.getElementById("rotY2").onmousedown = function(){onClickRot(yAxis, -inc);}
	document.getElementById("rotZ1").onmousedown = function(){onClickRot(zAxis, inc);}
	document.getElementById("rotZ2").onmousedown = function(){onClickRot(zAxis, -inc);}

	document.onkeydown = function ( e ) 
	{ 
		var charCode = (typeof e.which === "number") ? e.which :  e.keyCode;
		switch (charCode)
		{
			case 37:onClickRot(yAxis, -inc);e.preventDefault();break;
			case 38:onClickRot(xAxis, inc);e.preventDefault();break;
			case 39:onClickRot(yAxis, inc);e.preventDefault();break;
			case 40:onClickRot(xAxis, -inc);e.preventDefault();break;
		}
	}
	
	init();
}

function createPoints(){
	var iniX = -0.5, finX = 0.5;
	var iniZ = -0.5, finZ = 0.5;
	var dx = (finX - iniX) / cantX;
	var dz = (finZ - iniZ) / cantZ;
	var x, z;
	
	for (var i = 0; i <= cantX; i++){
		for(var j = 0; j <= cantZ; j++){
			x = iniX + i * dx;
			z = iniZ + j * dz;
			points.push(x, 0, z);
			if(x >= 0){
				colors.push(0.0, 0.0, 1.0, 1.0);//blue
			}else{
				colors.push(0.0, 0.0, 0.0, 1.0);//black
			}
		}
	}
}

function createIndices(){
	var max = numVertices - cantZ - 1;
	for (var i = 0; i < max; i++)
	{
		if((i + 1) % (cantZ + 1) !== 0)
		{
			var k = cantZ + 1 + i;
			var j = i + 1;
			indices.push(i, k, j);
			indices.push(j, k, k + 1);
		}
	}
}

function getVal (id, prev)
{
	var val = parseFloat(document.getElementById(id).value);
	return isNaN(val) ? prev : val;
}

function onClickRot( axis, cant ){
	var angle = theta[axis] + cant;
	angle %= 360;
	theta[axis] = angle;
	var name;
	switch(axis){
		case xAxis: name = "rotX"; break;
		case yAxis: name = "rotY"; break;
		case zAxis: name = "rotZ"; break;
	}
	document.getElementById(name).innerHTML = angle;
}

function init()
{
    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
	
	points = [];
	colors = [];
	indices = [];
	createPoints();
	createIndices();

	console.log(points);
	//console.log(indices);
    
	gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);
		
    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
     
	// array element buffer
    var iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), gl.STATIC_DRAW);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );
    
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

	thetaLoc = gl.getUniformLocation(program, "theta");
	aLoc = gl.getUniformLocation(program, "A");
	lambdaLoc = gl.getUniformLocation(program, "lambda");
	vLoc = gl.getUniformLocation(program, "v");
	tLoc = gl.getUniformLocation(program, "t");

    render();
};

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	var now = new Date().getTime();
	var dt = 20;
    if (last !== 0) {
        dt = now - last;
       t += dt / 1000.0;
   	}
    last = now;
	
	//console.log(t);
	
	gl.uniform3fv(thetaLoc, theta);
	gl.uniform1f(tLoc, t);
	gl.uniform1f(aLoc, A);
	gl.uniform1f(lambdaLoc, lambda);
	gl.uniform1f(vLoc, v);

	gl.drawElements( gl.TRIANGLES, indices.length, gl.UNSIGNED_BYTE, 0 );
	requestAnimFrame(render);

}
