function main(){
    var canvas = document.getElementById("myCanvas");
    var gl = canvas.getContext("webgl");

    if (!gl) {
        alert("WebGL tidak tersedia di browser ini");
        return;
    }

    function updateViewport(){
        const w = canvas.clientWidth || canvas.width;
        const h = canvas.clientHeight || canvas.height;
        if (canvas.width !== w || canvas.height !== h){
            canvas.width = w;
            canvas.height = h;
        }
        gl.viewport(0, 0, canvas.width, canvas.height);
    }
    updateViewport();
    window.addEventListener("resize", updateViewport);

    // ===== Buffers =====
    var vBuff = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuff);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    var cBuff = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuff);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    var nBuff = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuff);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

    var iBuff = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuff);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    // UV
    var texCoords = [];
    for (let i=0;i<vertices.length/3;i++){
        texCoords.push((vertices[i*3]+1)/2, (vertices[i*3+1]+1)/2);
    }
    var tBuff = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuff);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

    // ===== Shaders =====
    function compile(type, src){
        const sh = gl.createShader(type);
        gl.shaderSource(sh, src);
        gl.compileShader(sh);
        if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)){
            console.error(gl.getShaderInfoLog(sh));
        }
        return sh;
    }

    var vs = compile(gl.VERTEX_SHADER, document.getElementById("vertexShaderCode").text);
    var fs = compile(gl.FRAGMENT_SHADER, document.getElementById("fragmentShaderCode").text);

    var program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    function bindAttrib(name, buffer, size){
        let loc = gl.getAttribLocation(program, name);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(loc);
    }

    bindAttrib("aPosition", vBuff, 3);
    bindAttrib("aColor",    cBuff, 3);
    bindAttrib("aNormal",   nBuff, 3);

    gl.bindBuffer(gl.ARRAY_BUFFER, tBuff);
    let aTex = gl.getAttribLocation(program, "aTexCoord");
    gl.vertexAttribPointer(aTex, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aTex);

    // ===== Texture =====
    var texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // default
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([255,255,255,255]));

    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);

    var uSampler = gl.getUniformLocation(program,"uSampler");
    var uUseTexture = gl.getUniformLocation(program,"uUseTexture");
    gl.uniform1i(uSampler,0);
    gl.uniform1i(uUseTexture,0);

    document.getElementById("textureInput").addEventListener("change", e=>{
        const file=e.target.files[0];
        if(!file) return;
        const img=new Image();
        img.onload=()=>{
            gl.bindTexture(gl.TEXTURE_2D,texture);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
            gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);
            // NO MIPMAP
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
            gl.uniform1i(uUseTexture,1);
        };
        img.src=URL.createObjectURL(file);
    });

    // Matriks
    var uForm = gl.getUniformLocation(program,"uFormMatrix");

    function rotateX(a){
        let c=Math.cos(a), s=Math.sin(a);
        return new Float32Array([
            1,0,0,0,
            0,c,s,0,
            0,-s,c,0,
            0,0,0,1
        ]);
    }
    function rotateY(a){
        let c=Math.cos(a), s=Math.sin(a);
        return new Float32Array([
            c,0,-s,0,
            0,1,0,0,
            s,0,c,0,
            0,0,0,1
        ]);
    }
    function translate(x,y,z){
        return new Float32Array([
            1,0,0,0,
            0,1,0,0,
            0,0,1,0,
            x,y,z,1
        ]);
    }
    function multiply(A,B){
        let R=new Float32Array(16);
        for(let r=0;r<4;r++){
            for(let c=0;c<4;c++){
                let sum=0;
                for(let k=0;k<4;k++){
                    sum += A[k*4+r]*B[c*4+k];
                }
                R[c*4+r]=sum;
            }
        }
        return R;
    }
    function perspective(fov,asp,n,f){
        let t=1/Math.tan(fov/2);
        return new Float32Array([
            t/asp,0,0,0,
            0,t,0,0,
            0,0,(f+n)/(n-f),-1,
            0,0,(2*f*n)/(n-f),0
        ]);
    }

    // Interaksi
    let autoX = 0;             // rotasi otomatis
    let dragX = 0, dragY = 0;  // rotasi manual
    let zoom = -3;

    let dragging=false, lx=0, ly=0;

    canvas.addEventListener("mousedown",e=>{
        dragging=true; lx=e.clientX; ly=e.clientY;
    });
    window.addEventListener("mouseup",()=>dragging=false);
    canvas.addEventListener("mousemove",e=>{
        if(!dragging) return;
        let dx=e.clientX-lx;
        let dy=e.clientY-ly;
        dragY += dx*0.01;
        dragX += dy*0.01;
        lx=e.clientX; ly=e.clientY;
    });

    canvas.addEventListener("wheel",e=>{
        e.preventDefault();
        zoom += e.deltaY*0.002;
        if(zoom>-0.5) zoom=-0.5;
        if(zoom<-20) zoom=-20;
    },{passive:false});

    // Render
    function render(){
    updateViewport();
    gl.clearColor(1,1,1,1);
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);

    // rotasi otomatis
    autoX += 0.01;

    let rxAuto   = rotateX(autoX);   // auto-rotate X
    let rxManual = rotateX(dragX);   // drag vertical
    let ryManual = rotateY(dragY);   // drag horizontal

    let model = multiply(ryManual, multiply(rxAuto, rxManual));

    let tz = translate(0,0,zoom);
    model = multiply(tz, model);

    let proj = perspective(45*Math.PI/180, canvas.width/canvas.height, 0.1, 100);

    let mvp = multiply(proj, model);
    gl.uniformMatrix4fv(uForm,false,mvp);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,iBuff);
    gl.drawElements(gl.TRIANGLES,indices.length,gl.UNSIGNED_SHORT,0);

    requestAnimationFrame(render);
	}
	
    render();
}
