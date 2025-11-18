let texture = null;

function initTextures(gl, file = null) {
  texture = gl.createTexture();
  const image = new Image();
  image.crossOrigin = "";

  image.onload = function() {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.generateMipmap(gl.TEXTURE_2D);
  };

  if (file) {
    image.src = URL.createObjectURL(file);   // ← dari upload
  } else {
    // default: 1x1 putih
    const whitePixel = new Uint8Array([255, 255, 255, 255]);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, whitePixel);
  }
}

function translation(dx, dy, dz, gl, program){
    var forMatrix = new Float32Array([
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        dx, dy, dz, 1.0
    ]);

    var uFormMatrix = gl.getUniformLocation(program, 'uFormMatrix');
    gl.uniformMatrix4fv(uFormMatrix, false, forMatrix);
}

function scale(sx, sy, sz, gl, program){
    var forMatrix = new Float32Array([
        sx, 0.0, 0.0, 0.0,
        0.0, sy, 0.0, 0.0,
        0.0, 0.0, sz, 0.0,
        0.0, 0.0, 0.0, 1.0
    ]);

    var uFormMatrix = gl.getUniformLocation(program, 'uFormMatrix');
    gl.uniformMatrix4fv(uFormMatrix, false, forMatrix);
}

function shear(angle, gl, program){
    var cota = 1/Math.tan(angle);
    var forMatrix = new Float32Array([
        1.0, cota, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
    ]);

    var uFormMatrix = gl.getUniformLocation(program, 'uFormMatrix');
    gl.uniformMatrix4fv(uFormMatrix, false, forMatrix);
}

function rotateZ(angle, gl, program){
    var sa = Math.sin(angle);
    var ca = Math.cos(angle);
    var forMatrix = new Float32Array([
        ca, -sa, 0.0, 0.0,
        sa, ca, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
    ]);

    var uFormMatrix = gl.getUniformLocation(program, 'uFormMatrix');
    gl.uniformMatrix4fv(uFormMatrix, false, forMatrix);
}

function rotateX(angle, gl, program){
    var sa = Math.sin(angle);
    var ca = Math.cos(angle);
    var forMatrix = new Float32Array([
        1.0, 0.0, 0.0, 0.0,
        0.0, ca, -sa, 0.0,
        0.0, sa, ca, 0.0,
        0.0, 0.0, 0.0, 1.0
    ]);

    var uFormMatrix = gl.getUniformLocation(program, 'uFormMatrix');
    gl.uniformMatrix4fv(uFormMatrix, false, forMatrix);
}

function rotateY(angle, gl, program){
    var sa = Math.sin(angle);
    var ca = Math.cos(angle);
    var forMatrix = new Float32Array([
        ca, 0.0, sa, 0.0,
        0.0, 1.0, 0.0, 0.0,
        -sa, 0.0, ca, 0.0,
        0.0, 0.0, 0.0, 1.0
    ]);

    var uFormMatrix = gl.getUniformLocation(program, 'uFormMatrix');
    gl.uniformMatrix4fv(uFormMatrix, false, forMatrix);
}