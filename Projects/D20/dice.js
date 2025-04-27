import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';

let scene, camera, renderer, diceGroup, cube, animationFrameId, rollProgress;
const diceZone = document.querySelector('.dice-zone');
let rollResult;
let faceData = []; // Stores face data: { number, center, normal, up }

// Number mesh creation from Kasra.
function createNumberMesh(number, faceCenter, faceNormal, faceUp) {
  const loader = new THREE.TextureLoader();
  // Adjust the path as needed.
  const imageUrl = `images/${number}.png`;
  loader.load(
    imageUrl,
    function (texture) {
      // Create a plane geometry sized appropriately.
      const geometry = new THREE.PlaneGeometry(0.4, 0.4);
      // Use transparent if the images contain transparency.
      const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
      const mesh = new THREE.Mesh(geometry, material);
      
      // Offset the image slightly from the face.
      const offsetDistance = 0.05;
      const position = faceCenter.clone().add(faceNormal.clone().multiplyScalar(offsetDistance));
      mesh.position.copy(position);
      
      // Create a basis so the image is oriented to the face.
      const newRight = new THREE.Vector3().crossVectors(faceUp, faceNormal).normalize();
      const matrix = new THREE.Matrix4().makeBasis(newRight, faceUp, faceNormal);
      mesh.setRotationFromMatrix(matrix);
      
      diceGroup.add(mesh);
    }
  );
}

function initDice() {
  diceZone.innerHTML = '';
  scene = new THREE.Scene();
  const zoneWidth = diceZone.clientWidth || window.innerWidth;
  const zoneHeight = diceZone.clientHeight || window.innerHeight;
  camera = new THREE.PerspectiveCamera(55, zoneWidth / zoneHeight, 0.1, 1000);
  camera.position.z = 5;
  
  // Enable antialiasing and set the pixel ratio for a crisper render.
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(zoneWidth, zoneHeight);
  renderer.domElement.classList.add("dice");
  diceZone.appendChild(renderer.domElement);
  
  // Create a group to hold the die and its numbers.
  diceGroup = new THREE.Group();
  scene.add(diceGroup);
  
  // Create a crisp, flat‑shaded d20.
  const geometry = new THREE.IcosahedronGeometry(1, 0);
  const material = new THREE.MeshNormalMaterial({ flatShading: true });
  cube = new THREE.Mesh(geometry, material);
  diceGroup.add(cube);
  
  // Compute face data and add the numbers.
  faceData = [];
  const positions = geometry.attributes.position;
  const verticesPerFace = 3;
  const numFaces = positions.count / verticesPerFace;
  for (let i = 0; i < numFaces; i++) {
    const idx = i * verticesPerFace;
    const v0 = new THREE.Vector3(positions.getX(idx), positions.getY(idx), positions.getZ(idx));
    const v1 = new THREE.Vector3(positions.getX(idx + 1), positions.getY(idx + 1), positions.getZ(idx + 1));
    const v2 = new THREE.Vector3(positions.getX(idx + 2), positions.getY(idx + 2), positions.getZ(idx + 2));
    const center = new THREE.Vector3().addVectors(v0, v1).add(v2).divideScalar(3);
    const edge1 = new THREE.Vector3().subVectors(v1, v0);
    const edge2 = new THREE.Vector3().subVectors(v2, v0);
    const normal = new THREE.Vector3().crossVectors(edge1, edge2).normalize();
    // Calculate face "up" by projecting world up (0,1,0) onto the face plane.
    let faceUp = new THREE.Vector3(0, 1, 0).projectOnPlane(normal).normalize();
    if (faceUp.length() < 0.001) faceUp.set(1, 0, 0);
    faceData.push({ number: i + 1, center, normal, up: faceUp });
    createNumberMesh(i + 1, center, normal, faceUp);
  }
  
  // Start offscreen.
  diceGroup.position.set(-5, 0, 0);
  rollProgress = 0;
  
  // Reset any result display.
  const resultEl = document.getElementById("result");
  if (resultEl) {
    resultEl.innerText = "";
    resultEl.classList.remove("fade-in");
    resultEl.style.opacity = 0;
  }
}

function animateDice() {
  animationFrameId = requestAnimationFrame(animateDice);
  
  // Rotate while rolling.
  diceGroup.rotation.x += 0.05;
  diceGroup.rotation.y += 0.05;
  
  if (rollProgress < 1) {
    rollProgress += 0.005;
    const startX = -5, endX = 0;
    diceGroup.position.x = startX + (endX - startX) * rollProgress;
    diceGroup.position.y = Math.abs(Math.sin(2 * Math.PI * rollProgress)) * (1 - rollProgress) * 3;
    const interimResult = Math.floor(Math.random() * 20) + 1;
    const resultEl = document.getElementById("result");
    if (resultEl) resultEl.innerText = interimResult;
  } else {
    diceGroup.position.set(0, 0, 0);
    if (rollResult === undefined) {
      rollResult = Math.floor(Math.random() * 20) + 1;
      const resultEl = document.getElementById("result");
      if (resultEl) resultEl.innerText = rollResult;
    }
    
    // Snap the die so the chosen face is directly facing the camera.
    const chosenFace = faceData[rollResult - 1];
    const desiredNormal = new THREE.Vector3(0, 0, -1);
    const q1 = new THREE.Quaternion().setFromUnitVectors(chosenFace.normal, desiredNormal);
    const rotatedUp = chosenFace.up.clone().applyQuaternion(q1);
    const desiredUp = new THREE.Vector3(0, 1, 0);
    let angle = Math.acos(THREE.MathUtils.clamp(rotatedUp.dot(desiredUp), -1, 1));
    const cross = new THREE.Vector3().crossVectors(rotatedUp, desiredUp);
    const sign = cross.dot(desiredNormal) < 0 ? -1 : 1;
    angle *= sign;
    const q2 = new THREE.Quaternion().setFromAxisAngle(desiredNormal, angle);
    const targetQuaternion = new THREE.Quaternion();
    targetQuaternion.multiplyQuaternions(q2, q1);
    diceGroup.quaternion.copy(targetQuaternion);
    
    // Previous fade effect
    // const resultEl = document.getElementById("result");
    // if (resultEl) resultEl.classList.add("fade-in");
    
    cancelAnimationFrame(animationFrameId);
    renderer.render(scene, camera);
    return;
  }
  
  renderer.render(scene, camera);
}

document.querySelector('.button-zone button').addEventListener('click', () => {
  rollResult = undefined;
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  initDice();
  animateDice();
});