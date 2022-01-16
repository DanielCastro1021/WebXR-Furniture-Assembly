import * as THREE from './three.js/build/three.module.js';
import { GLTFLoader } from './three.js/examples/jsm/loaders/GLTFLoader.js';

// button to start XR experience
let xrButton = document.getElementById('xr-button');
let ui = document.getElementById('ui');
let stepDescription = document.getElementById('ui-description');
// xr session
let xrSession = null;
// reference space used within an application
let xrRefSpace = null;
// Canvas OpenGL context used for rendering
let gl = null;
// Model placed on a surface or plane
let model1 = null,
  model2 = null,
  model3 = null,
  model4 = null,
  model5 = null,
  model6 = null,
  model7 = null;
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
//step controller
let stepController = 0;

function checkSupportedState() {
  navigator.xr.isSessionSupported('immersive-ar').then((supported) => {
    if (supported) {
      xrButton.innerHTML = 'Enter AR';
      xrButton.addEventListener('click', onButtonClicked);
    } else {
      xrButton.innerHTML = 'AR not found';
    }
    xrButton.addEventListener('click', onButtonClicked);
    xrButton.disabled = false;
  });
}

function onButtonClicked() {
  if (!xrSession) {
    navigator.xr
      .requestSession('immersive-ar', {
        requiredFeatures: ['local', 'hit-test'],
        optionalFeatures: [' dom-overlay'],
        domOverlay: {
          root: document.getElementById('xr-overlay'),
        },
      })
      .then(onSessionStarted, onRequestSessionError);
  } else {
    xrSession.end();
  }
}

// on session started
function onSessionStarted(session) {
  xrSession = session;
  ui.style.display = 'inline';
  xrButton.innerHTML = 'Exit AR';
  stepController = 0;
  updateStepDescription();

  // Show which type of DOM Overlay got enabled (if any)
  if (session.domOverlayState) {
    document.getElementById('info').innerHTML =
      'DOM Overlay type: ' + session.domOverlayState.type;
  }

  // screen and session events
  session.addEventListener('select', nextStep);
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
  document.getElementById('info').innerHTML =
    ' <h2>WebXR Furniture Assembly</h2><p>This app demonstrates the assembly of an IKEA shelf with the WebXR API.</p>';
  ui.style.display = 'none';
  gl = null;
}

// load all models glb needed
function loadFurnitureModels() {
  var loader = new GLTFLoader();
  let x_scl = 0.5,
    y_scl = 0.5,
    z_scl = 0.5;

  //Model 1
  loader.load(
    './model/step-1.glb',
    (gltf) => {
      model1 = gltf.scene;
      model1.scale.set(x_scl, y_scl, z_scl);
      model1.castShadow = true;
      model1.receiveShadow = true;
    },
    (xhr) => console.log((xhr.loaded / xhr.total) * 100 + '% loaded'),
    (error) => console.error(error)
  );
  //Model 2
  loader.load(
    './model/step-2.glb',
    (gltf) => {
      model2 = gltf.scene;
      model2.scale.set(x_scl, y_scl, z_scl);
      model2.castShadow = true;
      model2.receiveShadow = true;
    },
    (xhr) => console.log((xhr.loaded / xhr.total) * 100 + '% loaded'),
    (error) => console.error(error)
  );
  //Model 3
  loader.load(
    './model/step-3.glb',
    (gltf) => {
      model3 = gltf.scene;
      model3.scale.set(x_scl, y_scl, z_scl);
      model3.castShadow = true;
      model3.receiveShadow = true;
    },
    (xhr) => console.log((xhr.loaded / xhr.total) * 100 + '% loaded'),
    (error) => console.error(error)
  );
  //Model 4
  loader.load(
    './model/step-4.glb',
    (gltf) => {
      model4 = gltf.scene;
      model4.scale.set(x_scl, y_scl, z_scl);
      model4.castShadow = true;
      model4.receiveShadow = true;
    },
    (xhr) => console.log((xhr.loaded / xhr.total) * 100 + '% loaded'),
    (error) => console.error(error)
  );
  //Model 5
  loader.load(
    './model/step-5.glb',
    (gltf) => {
      model5 = gltf.scene;
      model5.scale.set(x_scl, y_scl, z_scl);
      model5.castShadow = true;
      model5.receiveShadow = true;
    },
    (xhr) => console.log((xhr.loaded / xhr.total) * 100 + '% loaded'),
    (error) => console.error(error)
  );
  //Model 6
  loader.load(
    './model/step-6.glb',
    (gltf) => {
      model6 = gltf.scene;
      model6.scale.set(x_scl, y_scl, z_scl);
      model6.castShadow = true;
      model6.receiveShadow = true;
    },
    (xhr) => console.log((xhr.loaded / xhr.total) * 100 + '% loaded'),
    (error) => console.error(error)
  );

  //Model 7
  loader.load(
    './model/step-7.glb',
    (gltf) => {
      model7 = gltf.scene;
      model7.scale.set(x_scl, y_scl, z_scl);
      model7.castShadow = true;
      model7.receiveShadow = true;
    },
    (xhr) => console.log((xhr.loaded / xhr.total) * 100 + '% loaded'),
    (error) => console.error(error)
  );
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

// create virtual scene
function initScene(gl, session) {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  loadFurnitureModels();

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

function nextStep() {
  if (
    (reticle.visible == true && stepController == 0) ||
    (stepController > 0 && stepController < 8)
  ) {
    stepController++;
    switch (stepController) {
      case 1:
        reticle.visible = false;
        model1.position.setFromMatrixPosition(reticle.matrix);
        scene.remove(reticle);
        scene.add(model1);
        break;
      case 2:
        model2.position.setFromMatrixPosition(model1.matrix);
        scene.remove(model1);
        scene.add(model2);
        break;
      case 3:
        model3.position.setFromMatrixPosition(model2.matrix);
        scene.remove(model2);
        scene.add(model3);
        break;
      case 4:
        model4.position.setFromMatrixPosition(model3.matrix);
        scene.remove(model3);
        scene.add(model4);
        break;
      case 5:
        model5.position.setFromMatrixPosition(model4.matrix);
        scene.remove(model4);
        scene.add(model5);
        break;
      case 6:
        model6.position.setFromMatrixPosition(model5.matrix);
        scene.remove(model5);
        scene.add(model6);
        break;
      case 7:
        model7.position.setFromMatrixPosition(model6.matrix);
        scene.remove(model6);
        scene.add(model7);
        break;
    }

    updateStepDescription();
  }
}

function updateStepDescription() {
  if (stepController < 8) {
    stepDescription.innerHTML = '<p>' + getStepDescription() + '</p>';
  }
}

function getStepDescription() {
  let description;
  switch (stepController) {
    case 0:
      description =
        'When green reticle shows, click on screen to place base of shelf.';
      break;
    case 1:
      description =
        ' Step 1 : Place lateral plank in left side of base plank, click screen to show result.';
      break;
    case 2:
      description =
        ' Step 2 : Place lateral plank in right side of base plank, click screen to show result.';
      break;
    case 3:
      description =
        ' Step 3 : Place small interior plank in top of base plank, click screen to show result.';
      break;
    case 4:
      description =
        ' Step 4 : Place big interior plank on top of the last small plank, click screen to show result.';
      break;
    case 5:
      description =
        ' Step 5 : Place another small interior plank in top of the big interior plank, click screen to show result.';
      break;
    case 6:
      description =
        ' Step 6 : Place last big plank on top of lateral planks and small interior plank, click screen to show result.';
      break;
    case 7:
      description =
        ' Step 7 :Terminou a experiência WebXR de Furniture Assembly';
      break;
  }
  return description;
}

/**
 * Start App
 */
window.addEventListener('load', function (event) {
  if ('xr' in navigator) {
    checkSupportedState();
  }
});
