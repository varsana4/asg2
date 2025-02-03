class Cube {
    constructor() {
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
    }

    render() {
        gl.uniform4f(u_FragColor, ...this.color);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Front face
        drawTriangle3D([0,0,0, 1,1,0, 1,0,0]);
        drawTriangle3D([0,0,0, 0,1,0, 1,1,0]);

        // Other faces
        const faces = [
            {color: [0.8,0.8,0.8,1], vertices: [0,1,0, 0,1,1, 1,1,1]}, // Top
            {color: [0.6,0.6,0.6,1], vertices: [1,0,0, 1,1,0, 1,1,1]}, // Right
            {color: [0.4,0.4,0.4,1], vertices: [0,0,0, 0,0,1, 1,0,1]}, // Bottom
            {color: [0.5,0.5,0.5,1], vertices: [0,0,0, 0,1,0, 0,0,1]}, // Left
            {color: [0.3,0.3,0.3,1], vertices: [0,1,1, 1,1,1, 0,0,1]}  // Back
        ];

        faces.forEach(face => {
            gl.uniform4f(u_FragColor, ...face.color);
            drawTriangle3D(face.vertices.slice(0,9));
            drawTriangle3D([...face.vertices.slice(3,9), ...face.vertices.slice(0,3)]);
        });
    }
}

function drawTriangle3D(vertices) {
    const n = 3;
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    gl.drawArrays(gl.TRIANGLES, 0, n);
}