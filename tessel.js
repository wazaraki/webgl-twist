"use strict";

var canvas;
var gl;

var points = [];

var NumTimesToSubdivide = 3;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    var vertices = [
        vec2( -1, -1 ),
        vec2(  0,  1 ),
        vec2(  1, -1 )
    ];

    divideTriangle( vertices[0], vertices[1], vertices[2],
                    NumTimesToSubdivide);

    console.dir(points);
    points = points.map((function () {
        return twist(Math.PI/4);
    })());
    console.dir(points);
    
    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    render();
};

function triangle( a, b, c )
{
    points.push( a, b, c );
}

function divideTriangle( a, b, c, count )
{

    // check for end of recursion

    if ( count === 0 ) {
        triangle( a, b, c );
    }
    else {

        //bisect the sides

        var ab = mix( a, b, 0.5 );
        var ac = mix( a, c, 0.5 );
        var bc = mix( b, c, 0.5 );

        --count;

        // four new triangles

        divideTriangle( a,  ab, ac, count );
        divideTriangle( c,  ac, bc, count );
        divideTriangle( b,  bc, ab, count );
        divideTriangle( ab, ac, bc, count );
    }
}

function rotateVertex (angle) {
    return function (vert) {
        return [
            vert[0] * Math.cos(angle) - vert[1] * Math.sin(angle),
            vert[0] * Math.sin(angle) - vert[1] * Math.cos(angle)
            ];
    };
}

function twist (angle) {
    return function (vert) {
        var d = Math.sqrt( Math.pow( vert[0], 2 ) + Math.pow( vert[1], 2 ) );
        return [
            (vert[0] * Math.cos(d * angle)) - (vert[1] * Math.sin(d * angle)),
            (vert[0] * Math.sin(d * angle)) - (vert[1] * Math.cos(d * angle))
            ];
    };
}


function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
}
