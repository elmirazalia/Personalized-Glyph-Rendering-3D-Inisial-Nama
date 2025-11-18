
// ketebalan balok ke arah z
const depth = 0.1;
const thickness = 0.04; // ketebalan balok secara horizontal/vertikal

var vertices = [];
var colors = [];
var indices = [];

// fungsi membuat balok dari garis (x1,y1)-(x2,y2)
function addBox(x1, y1, x2, y2, color) {
    const zFront = 0.0;
    const zBack = -depth;

    // arah vektor
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx*dx + dy*dy);
    const nx = -dy / len * thickness;
    const ny = dx / len * thickness;

    // 8 titik (depan dan belakang)
    let pts = [
        [x1+nx, y1+ny, zFront], // 0
        [x1-nx, y1-ny, zFront], // 1
        [x2+nx, y2+ny, zFront], // 2
        [x2-nx, y2-ny, zFront], // 3

        [x1+nx, y1+ny, zBack],  // 4
        [x1-nx, y1-ny, zBack],  // 5
        [x2+nx, y2+ny, zBack],  // 6
        [x2-nx, y2-ny, zBack],  // 7
    ];

    const baseIndex = vertices.length / 3;

    // masukkan ke vertices dan colors
    pts.forEach(p => {
        vertices.push(...p);
        colors.push(...color);
    });

    // sisi depan (0,1,2,3)
    indices.push(
        baseIndex+0, baseIndex+1, baseIndex+2,
        baseIndex+1, baseIndex+3, baseIndex+2
    );

    // sisi belakang (4,6,5,7) — urutan dibalik untuk orientasi normal
    indices.push(
        baseIndex+4, baseIndex+6, baseIndex+5,
        baseIndex+5, baseIndex+6, baseIndex+7
    );

    // sisi atas (0,2,4,6)
    indices.push(
        baseIndex+0, baseIndex+2, baseIndex+4,
        baseIndex+2, baseIndex+6, baseIndex+4
    );

    // sisi bawah (1,5,3,7)
    indices.push(
        baseIndex+1, baseIndex+5, baseIndex+3,
        baseIndex+3, baseIndex+5, baseIndex+7
    );

    // sisi kiri (0,4,1,5)
    indices.push(
        baseIndex+0, baseIndex+4, baseIndex+1,
        baseIndex+1, baseIndex+4, baseIndex+5
    );

    // sisi kanan (2,3,6,7)
    indices.push(
        baseIndex+2, baseIndex+3, baseIndex+6,
        baseIndex+3, baseIndex+7, baseIndex+6
    );
}

// ======== BENTUK HURUF ========
// Warna: E = magenta, L = kuning, 7 = cyan
const magenta = [0.6, 0.0, 0.4]; 
const yellow  = [0.7, 0.55, 0.0]; 
const cyan    = [0.0, 0.5, 0.6];  

// E
addBox(-0.9,  0.5, -0.9, -0.5, magenta);
addBox(-0.9,  0.5, -0.5,  0.5, magenta);
addBox(-0.9,  0.0, -0.6,  0.0, magenta);
addBox(-0.9, -0.5, -0.5, -0.5, magenta);

// L
addBox(-0.3,  0.5, -0.3, -0.5, yellow);
addBox(-0.3, -0.5,  0.1, -0.5, yellow);

// 7
addBox( 0.3,  0.5,  0.9,  0.5, cyan);
addBox( 0.9,  0.5,  0.5, -0.5, cyan);

// === HITUNG NORMAL PER-VERTEX ===
var normals = new Float32Array(vertices.length).fill(0);

for (let i = 0; i < indices.length; i += 3) {
    const i0 = indices[i] * 3;
    const i1 = indices[i+1] * 3;
    const i2 = indices[i+2] * 3;

    const v0 = [vertices[i0], vertices[i0+1], vertices[i0+2]];
    const v1 = [vertices[i1], vertices[i1+1], vertices[i1+2]];
    const v2 = [vertices[i2], vertices[i2+1], vertices[i2+2]];

    // vector edges
    const e1 = [v1[0]-v0[0], v1[1]-v0[1], v1[2]-v0[2]];
    const e2 = [v2[0]-v0[0], v2[1]-v0[1], v2[2]-v0[2]];

    // cross product e1 x e2
    const nx = e1[1]*e2[2] - e1[2]*e2[1];
    const ny = e1[2]*e2[0] - e1[0]*e2[2];
    const nz = e1[0]*e2[1] - e1[1]*e2[0];

    // accumulate to each vertex normal
    normals[i0]   += nx; normals[i0+1]   += ny; normals[i0+2]   += nz;
    normals[i1]   += nx; normals[i1+1]   += ny; normals[i1+2]   += nz;
    normals[i2]   += nx; normals[i2+1]   += ny; normals[i2+2]   += nz;
}

// normalisasi setiap normal
for (let i = 0; i < normals.length; i += 3) {
    const nx = normals[i], ny = normals[i+1], nz = normals[i+2];
    const len = Math.sqrt(nx*nx + ny*ny + nz*nz);
    if (len > 0.0001) {
        normals[i]   /= len;
        normals[i+1] /= len;
        normals[i+2] /= len;
    }
}