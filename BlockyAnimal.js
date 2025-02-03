let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotationMat;


//let g_bodySize = 0.2;
let g_legAngle1 = 30;
let g_legAngle2 = -45;
//let g_animationSpeed = 2.0;
//let g_legSwingRange = 40;
let g_angle = 0;
let g_animation = true;

let g_bodySize = 0.15;         
let g_legSwingRange = 20;      
let g_animationSpeed = 1.2;    

// Shader programs
const VSHADER_SOURCE = `
attribute vec4 a_Position;
uniform mat4 u_ModelMatrix;
uniform mat4 u_GlobalRotationMat;
void main() {
    gl_Position = u_GlobalRotationMat * u_ModelMatrix * a_Position;
}`;

const FSHADER_SOURCE = `
precision mediump float;
uniform vec4 u_FragColor;
void main() {
    gl_FragColor = u_FragColor;
}`;

function main() {
    canvas = document.getElementById('webgl');
    gl = canvas.getContext('webgl', {preserveDrawingBuffer: true});
    
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to initialize shaders');
        return;
    }

    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    u_GlobalRotationMat = gl.getUniformLocation(gl.program, 'u_GlobalRotationMat');

    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.1, 0.1, 0.1, 1.0);

    setupControls();
    tick();
}

function setupControls() {
    document.getElementById('aniOn').onclick = () => g_animation = true;
    document.getElementById('aniOff').onclick = () => g_animation = false;
    
    document.getElementById('leg1Slider').addEventListener('input', (e) => {
        g_legAngle1 = parseFloat(e.target.value);
    });
    
    document.getElementById('leg2Slider').addEventListener('input', (e) => {
        g_legAngle2 = parseFloat(e.target.value);
    });

    document.getElementById('speedSlider').addEventListener('input', (e) => {
        g_animationSpeed = parseFloat(e.target.value);
    });

    document.getElementById('rotationSlider').addEventListener('input', (e) => {
        g_angle = parseFloat(e.target.value);
    });
}

// Animation state variables

let g_lastTime = performance.now();
let g_animationAngle = 0;

function tick() {
    // Calculate time delta
    const currentTime = performance.now();
    const deltaTime = (currentTime - g_lastTime) / 1000; // Convert to seconds
    g_lastTime = currentTime;

    if (g_animation) {
        // Update animation angle based on time and speed
        g_animationAngle += deltaTime * g_animationSpeed;
        
        // Update leg angles using sine wave
        g_legAngle1 = g_legSwingRange * Math.sin(g_animationAngle * Math.PI);
        g_legAngle2 = -g_legSwingRange * Math.sin(g_animationAngle * Math.PI);
        
        // Update UI sliders to match current angles
        document.getElementById('leg1Slider').value = g_legAngle1;
        document.getElementById('leg2Slider').value = g_legAngle2;
        
        // Update the number display
        document.getElementById('numdot').innerHTML = 
            `Leg 1 Angle: ${g_legAngle1.toFixed(2)}<br>
             Leg 2 Angle: ${g_legAngle2.toFixed(2)}<br>
             Animation Speed: ${g_animationSpeed.toFixed(2)}`;
    }

    // Clear and render
    renderAllShapes();
    
    // Request next frame
    requestAnimationFrame(tick);
}

function createLegSegment(length, color, angleX, angleY) {
    const leg = new Cube();
    leg.color = color;
    leg.matrix.rotate(angleX, 1, 0, 0);
    leg.matrix.rotate(angleY, 0, 1, 0);
    leg.matrix.scale(0.05, 0.05, length);
    return leg;
}

function renderAllShapes() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  const globalRotMat = new Matrix4().rotate(g_angle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotationMat, false, globalRotMat.elements);

  renderScene();
}

function renderScene() {
  // Body 
  const body = new Cube();
  body.color = [0.3, 0.3, 0.3, 1.0];  
  body.matrix.scale(0.25, 0.25, 0.4);
  body.matrix.translate(-0.5, 0, -0.5);
  body.render();

  // Head 
  const head = new Cube();
  head.color = [0.95, 0.95, 0.95, 1.0];  
  head.matrix.scale(0.15, 0.15, 0.15);
  head.matrix.translate(-0.5, 1.0, -2.0);
  head.render();

  // Beak 
  const beak = new Cube();
  beak.color = [0.8, 0.8, 0.0, 1.0];  
  beak.matrix.scale(0.08, 0.08, 0.15);
  beak.matrix.rotate(20, 1, 0, 0);  
  beak.matrix.translate(-0.5, 1.5, -3.0);
  beak.render();

  // Eyes
  const eye = new Cube();
  eye.color = [0.1, 0.1, 0.1, 1.0];  
  [-1, 1].forEach(side => {
      eye.matrix = new Matrix4();
      eye.matrix.scale(0.03, 0.03, 0.03);
      eye.matrix.translate(side * 2, 6, -7);
      eye.render();
  });

  // Animated wings
  const wingAngle = Math.sin(performance.now() * 0.001 * g_animationSpeed) * 20;
  
  // Left wing 
  const leftWing = new Cube();
  leftWing.color = [0.2, 0.2, 0.2, 1.0];
  leftWing.matrix.rotate(-wingAngle, 0, 0, 1);
  leftWing.matrix.scale(0.5, 0.05, 0.4);
  leftWing.matrix.translate(-1.2, 1, -0.5);
  leftWing.render();

  const leftWingTip = new Cube();
  leftWingTip.color = [0.15, 0.15, 0.15, 1.0];
  leftWingTip.matrix.rotate(-wingAngle - 10, 0, 0, 1);
  leftWingTip.matrix.scale(0.4, 0.03, 0.3);
  leftWingTip.matrix.translate(-2.0, 1, -0.5);
  leftWingTip.render();

  // Right wing 
  const rightWing = new Cube();
  rightWing.color = [0.2, 0.2, 0.2, 1.0];
  rightWing.matrix.rotate(wingAngle, 0, 0, 1);
  rightWing.matrix.scale(0.5, 0.05, 0.4);
  rightWing.matrix.translate(0.2, 1, -0.5);
  rightWing.render();

  const rightWingTip = new Cube();
  rightWingTip.color = [0.15, 0.15, 0.15, 1.0];
  rightWingTip.matrix.rotate(wingAngle + 10, 0, 0, 1);
  rightWingTip.matrix.scale(0.4, 0.03, 0.3);
  rightWingTip.matrix.translate(1.0, 1, -0.5);
  rightWingTip.render();

  // Tail feathers
  const tail = new Cube();
  tail.color = [0.95, 0.95, 0.95, 1.0];  
  tail.matrix.scale(0.25, 0.05, 0.3);
  tail.matrix.translate(-0.5, 0.5, 0.8);
  tail.render();

  // Bird legs with animation
  const legColor = [0.8, 0.8, 0.0, 1.0];  
  [-1, 1].forEach((side, index) => {
      // Base leg position
      const matrix = new Matrix4();
      matrix.translate(side * 0.1, -0.2, 0); // Move to side of body
      
      // Upper leg
      const upperLeg = new Cube();
      upperLeg.color = legColor;
      upperLeg.matrix = new Matrix4(matrix);
      // Apply leg1 angle
      upperLeg.matrix.rotate(index === 0 ? g_legAngle1 : -g_legAngle1, 1, 0, 0);
      upperLeg.matrix.scale(0.05, 0.15, 0.05);
      upperLeg.render();

      // Lower leg 
      const lowerLeg = new Cube();
      lowerLeg.color = legColor;
      lowerLeg.matrix = new Matrix4(matrix);
      // Apply both leg angles
      lowerLeg.matrix.rotate(index === 0 ? g_legAngle1 : -g_legAngle1, 1, 0, 0);
      lowerLeg.matrix.translate(0, -0.15, 0);
      lowerLeg.matrix.rotate(g_legAngle2, 1, 0, 0);
      lowerLeg.matrix.scale(0.05, 0.1, 0.05);
      lowerLeg.render();

      // Claws
      const claw = new Cube();
      claw.color = [0.3, 0.3, 0.3, 1.0];
      claw.matrix = new Matrix4(lowerLeg.matrix);
      claw.matrix.translate(0, -0.1, 0);
      claw.matrix.rotate(30, 1, 0, 0);
      claw.matrix.scale(0.4, 0.5, 0.4);
      claw.render();
  });
}