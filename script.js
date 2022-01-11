import * as THREE from './three.js/build/three.module.js';
import { GLTFLoader } from './three.js/examples/jsm/loaders/GLTFLoader.js';

// button to start XR experience
let xrButton = document.getElementById('xr-button');
let xrt = document.getElementById('tee11');
// xr session
let xrSession = null;
// reference space used within an application
let xrRefSpace = null;
// Canvas OpenGL context used for rendering
let gl = null;
// Model placed on a surface or plane
let model = null;
// XR Hit test object
let xrHitTestSource = null;
// XR renderer
let renderer = null;
// XR scene
let scene = null;
// XR camera
let camera = null;
// XR recitle (object pointing to where models should be placed)
let reticle = null;

function checkSupportedState() {
  navigator.xr.isSessionSupported('immersive-ar').then((supported) => {
    if (supported) {
      xrButton.innerHTML = 'Enter AR';
      xrButton.addEventListener('click', onButtonClicked);
    } else {
      xrButton.innerHTML = 'AR not found';
    }
    xrButton.addEventListener('click', onButtonClicked);
    xrButton.disabled = !supported;
  });
}

function onButtonClicked() {
  if (!xrSession) {
    navigator.xr
      .requestSession('immersive-ar', {
        requiredFeatures: ['local', 'hit-test'],
      })
      .then(onSessionStarted, onRequestSessionError);
  } else {
    xrSession.end();
  }
}

// on session started
function onSessionStarted(session) {
  xrSession = session;
  xrButton.innerHTML = 'Exit AR';

  // Show which type of DOM Overlay got enabled (if any)
  if (session.domOverlayState) {
    document.getElementById('info').innerHTML =
      'DOM Overlay type: ' + session.domOverlayState.type;
  }

  // screen and session events
  session.addEventListener('select', placeObject);
  session.addEventListener('end', onSessionEnded);

  // create a canvas element and WebGL context for rendering
  let canvas = document.createElement('canvas');
  gl = canvas.getContext('webgl', { xrCompatible: true });
  session.updateRenderState({ baseLayer: new XRWebGLLayer(session, gl) });

  session.requestReferenceSpace('local').then((refSpace) => {
    xrRefSpace = refSpace;
    // start WebXR rendering loop
    session.requestAnimationFrame(onXRFrame);
  });

  // here we ask for viewer reference space, since we will be casting a ray
  // from a viewer towards a detected surface. The results of ray and surface intersection
  // will be obtained via xrHitTestSource variable
  session.requestReferenceSpace('viewer').then((refSpace) => {
    session.requestHitTestSource({ space: refSpace }).then((hitTestSource) => {
      xrHitTestSource = hitTestSource;
    });
  });
  initScene(gl, session);
  // Hit test source de-initialization that’s done within onSessionEnded():
  if (xrHitTestSource) xrHitTestSource.cancel();
  xrHitTestSource = null;
}

// on XR sessino error
function onRequestSessionError(ex) {
  document.getElementById('info').innerHTML = 'Failed to start AR session.';
}

// clear code on XR session ends
function onSessionEnded(event) {
  xrSession = null;
  xrButton.innerHTML = 'Enter AR';
  document.getElementById('info').innerHTML = '';
  gl = null;
}

// reneder all frames
function onXRFrame(t, frame) {
  let session = frame.session;
  session.requestAnimationFrame(onXRFrame);
  if (xrHitTestSource) {
    // obtain hit test results by casting a ray from the center of device screen
    // into AR view. Results indicate that ray intersected with one or more detected surfaces
    const hitTestResults = frame.getHitTestResults(xrHitTestSource);
    if (hitTestResults.length) {
      // obtain a local pose at the intersection point
      const pose = hitTestResults[0].getPose(xrRefSpace);
      // place a reticle at the intersection point
      reticle.matrix.fromArray(pose.transform.matrix);
      reticle.visible = true;
    }
  } else {
    // do not show a reticle if no surfaces are intersected
    reticle.visible = false;
  }
  // bind our gl context that was created with WebXR to threejs renderer
  gl.bindFramebuffer(gl.FRAMEBUFFER, session.renderState.baseLayer.framebuffer);
  // render the scene
  renderer.render(scene, camera);
}

// create virtual secene
function initScene(gl, session) {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  // load our gltf model
  var loader = new GLTFLoader();
  loader.load(
    './model/wheel.glb',
    (gltf) => {
      model = gltf.scene;
      model.scale.set(0.1, 0.1, 0.1);
      model.castShadow = true;
      model.receiveShadow = true;
    },
    () => {},
    (error) => console.error(error)
  );

  var light = new THREE.PointLight(0xffffff, 2, 100); // soft white light
  light.position.z = 1;
  light.position.y = 5;
  scene.add(light);
  // create and configure three.js renderer with XR support
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    autoClear: true,
    context: gl,
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;
  renderer.xr.setReferenceSpaceType('local');
  renderer.xr.setSession(session);
  // simple sprite to indicate detected surfaces
  reticle = new THREE.Mesh(
    new THREE.RingBufferGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2),
    new THREE.MeshPhongMaterial({ color: 0x0fff00 })
  );
  reticle.matrixAutoUpdate = false;
  reticle.visible = false;
  scene.add(reticle);
}
// Place VR Objet
function placeObject() {
  if (reticle.visible && model) {
    reticle.visible = false;
    model.position.setFromMatrixPosition(reticle.matrix);
    //scene.remove(reticle);
    scene.add(model);
  }
}

window.onload = () => {
  if ('xr' in navigator) {
    checkSupportedState();
  } else {
    alert('not supported!');
  }
};
