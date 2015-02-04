var canvas;
var gl;

var points = [];
var colors = [];

var NumTimesToSubdivide = 0;
var angleX = 0;
var angleY = 0;

window.onload = function () 
{
	document.getElementById("dec").onmousedown = function(){onClickIt(-1)};
	document.getElementById("inc").onmousedown = function(){onClickIt(1)};
	document.getElementById("rotX1").onmousedown = function(){onClickRot(0, 5);}
	document.getElementById("rotX2").onmousedown = function(){onClickRot(0, -5);}
	document.getElementById("rotY1").onmousedown = function(){onClickRot(1, 5);}
	document.getElementById("rotY2").onmousedown = function(){onClickRot(1, -5);}
	document.onkeydown = function ( e ) 
	{ 
		var charCode = (typeof e.which === "number") ? e.which :  e.keyCode;
		var inc = 5;
		switch (charCode)
		{
			case 37:onClickRot(1, -inc);e.preventDefault();break;
			case 38:onClickRot(0, inc);e.preventDefault();break;
			case 39:onClickRot(1, inc);e.preventDefault();break;
			case 40:onClickRot(0, -inc);e.preventDefault();break;
		}
	}
	init();
}

function onClickIt (cant)
{
	if ( ( NumTimesToSubdivide < 1 && cant < 0 ) || 
		(NumTimesToSubdivide > 6  && cant > 0 ) ) { console.log ("return");return; }
	NumTimesToSubdivide += cant;
	init();
	document.getElementById("numIt").innerHTML = NumTimesToSubdivide;
}

function onClickRot(x,cant){
	var name = ( x === 0 ) ? "rotX" : "rotY";
	var angle = ( ( x === 0 ) ? angleX : angleY ) +  cant;
	angle = angle % 360;
	(x === 0) ? (angleX = angle) : (angleY = angle);
	document.getElementById(name).innerHTML = angle;
	init();
}

function rotX(x, y, z, angle){
	var cosA = Math.cos(angle);
	var sinA = Math.sin(angle);
	var new_y = y * cosA - z * sinA;
	var new_z = y * sinA + z * cosA;
	return vec3(x, new_y, new_z);
}

function rotY(x, y, z, angle){
	if ( Array.isArray(x) && x.length == 3 ) {
        z = x[2];
		angle = y;
        y = x[1];
        x = x[0];
    }

	var cosA = Math.cos(angle);
	var sinA = Math.sin(angle);
	var new_z = z * cosA - x * sinA;
	var new_x = z * sinA + x * cosA;
	return vec3(new_x, y, new_z);
}

function init()
{
    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
	
	points = [];
    //  Initialize our octahedron
    var vertices = [
        rotY(rotX(-0.7071, 0.0000, 0.7071, radians(angleX)), radians(angleY)),
        rotY(rotX(0.0000, 1.0000, 0.0000, radians(angleX)), radians(angleY)),
        rotY(rotX(-0.7071, 0.0000, -0.7071, radians(angleX)), radians(angleY)),
        rotY(rotX(0.7071,  0.0000, -0.7071, radians(angleX)), radians(angleY)),
        rotY(rotX(0.7071,  0.0000,  0.7071, radians(angleX)), radians(angleY)),
        rotY(rotX(0.0000, -1.0000,  0.0000, radians(angleX)), radians(angleY))
    ];

    octahedron( vertices[0], vertices[1], vertices[2], vertices[3],
		        vertices[4], vertices[5], NumTimesToSubdivide);
	
	//console.info(points);

    //  Configure WebGL
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    // enable hidden-surface removal
	//gl.enable( gl.BLEND );
	//gl.blendEquation( gl.FUNC_ADD );
	//gl.blendFunc( gl.SRC_ALPHA, gl.SRC_ONE );
	//gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.DEPTH_TEST);
		
    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // Create a bwith the
    //  associated attribute variable in our vertex shader
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

    render();
};

function triangle( a, b, c, color )
{
    // add colors and vertices for one triangle
	var transparent = vec4(0.0, 0.0, 0.0, 0.0);
	var cor = vec4(0.9, 0.9, 0.9, 1.0);
	colors.push( transparent );
	points.push( a );
    colors.push( cor );
    points.push( a );
    colors.push( cor );
    points.push( b );
    colors.push( cor );
    points.push( c );
    colors.push( cor );
	points.push( a );
	colors.push( transparent );
	points.push( a );
}

function divideTriangle( a, b, c, count, color )
{

    // check for end of recursion
    
    if ( count === 0 ) {
        triangle( a, b, c, color );
    }
    else {
    
        //bisect the sides
        
        var ab = normalize(mix( a, b, 0.5 ));
        var ac = normalize(mix( a, c, 0.5 ));
        var bc = normalize(mix( b, c, 0.5 ));

        --count;

        // three new triangles
        
        divideTriangle( a, ab, ac, count, color );
        divideTriangle( c, ac, bc, count, color );
        divideTriangle( b, bc, ab, count, color );
        divideTriangle( ac, ab, bc, count, color );

    }
}

function octahedron( a, b, c, d, e, f, count )
{
    //upper part
	divideTriangle( b, a, c, count, 0);
    divideTriangle( b, c, d, count, 0);
    divideTriangle( b, d, e, count, 1);
    divideTriangle( b, e, a, count, 1);
    //lower part
	divideTriangle( f, a, c, count, 0);
	divideTriangle( f, c, d, count, 0);
	divideTriangle( f, d, e, count, 1);
    divideTriangle( f, e, a, count, 1);

}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
// 	gl.drawArrays( gl.TRIANGLES, 0, points.length );   
	gl.drawArrays( gl.LINE_STRIP, 0, points.length );
}
