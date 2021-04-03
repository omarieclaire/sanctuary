import * as THREE from './node_modules/three/build/three.module.js';
import { OrbitControls } from './node_modules/three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from './node_modules/three/examples/jsm/loaders/GLTFLoader.js';

import Stats from './node_modules/three/examples/jsm/libs/stats.module.js';
import { GUI } from './node_modules/three/examples/jsm/libs/dat.gui.module.js';
import { Water } from './node_modules/three/examples/jsm/objects/Water.js';
import { Sky } from './node_modules/three/examples/jsm/objects/Sky.js';
import { BufferGeometryUtils } from "./node_modules/three/examples/jsm/utils/BufferGeometryUtils.js";
import { PointerLockControls } from './node_modules/three/examples/jsm/controls/PointerLockControls.js';


import { SimplifyModifier } from './node_modules/three/examples/jsm/modifiers/SimplifyModifier.js';

var firebaseConfig = {
  apiKey: "AIzaSyDiCOSmTc5a0U0m4jY4D8s7ZXZ6ab5NTWo",
  authDomain: "sanctuary-76c32.firebaseapp.com",
  projectId: "sanctuary-76c32",
  storageBucket: "sanctuary-76c32.appspot.com",
  messagingSenderId: "656056199487",
  appId: "1:656056199487:web:278a2511cfb83f7798cb8a",
  measurementId: "G-TDGFN204SM"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

let container, stats;
let camera, scene, raycaster, renderer;

let pointerControls, controls, water, sun, centerObj;

const sky = new Sky();
let skyBright = 10;
let newText;
let INTERSECTED;
let theta = 0;
let currFriendModalDiv = undefined;
let modalOpen = false;
const mouse = new THREE.Vector2();
let boxGroup;
let boxSpeeds = [];
const radius = 100;
let toggleOpen = false;
let centerObjects = [];
let rot1;
let rot2;
let rot3;
let numberOfFriends = 40;
let soundMuted = false;
let sparkUniforms, sparkGeometry;
const sparkles = 1;
const sparkleFriendMap = {};



let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;

let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const vertex = new THREE.Vector3();
const color = new THREE.Color();

const friendSound = new Audio("audio/friend.mp3");
const seaSound = new Audio("audio/sea.mp3");
const backgroundSound = new Audio("audio/background.mp3");
const rot1Sound = new Audio("audio/rot1.mp3");
const rot2Sound = new Audio("audio/rot2.mp3");
const rot3Sound = new Audio("audio/rot3.mp3");

var jellyfish = [];

let database = firebase.database();
let ref = database.ref();
let msgsRef = ref.child('msg');

let username;
let friendOrbs = {};
let friendMap = {};
let friendQuestions = {
  0: "What did you learn today?",
  1: "What does it mean?",
  2: "Where does the time go?",
  3: "Where are you from?",
  4: "Who inspires you?",
  5: "How do you learn?",
  6: "Who do you love?",
  7: "When did you last rest?",
  8: "Do you wish you had more?",
  9: "Can you imagine a better way?",
  10: "What is a strange thing you know?",
  11: "What is at the bottom?",
  12: "Have you ever failed?",
  13: "What is the perfect day?",
  14: "Who do you wish you could speak to?",
  15: "What are you grateful for?",
  16: "If you had a secret hour every day how would you spend it?",
  17: "What is your earliest memory of play?",
  18: "What does friendship mean to you?",
  19: "What song will you listen to right now?",
  20: "How does your body feel?",
  21: "What are you curious about?",
  22: "Why do you get up in the morning?",
  23: "What book changed your life?",
  24: "Where do you wish you could go?",
  25: "Would you choose peace, love, or joy?",
  26: "What meal would you like to eat?",
  27: "What is something you shared with someone?",
  28: "Tell us about a dream?",
  29: "Tell us a fact?",
  30: "Tell us a story in 10 words?",
  31: "What are you looking forward to?",
  32: "Describe a peaceful place?",
  33: "Describe a perfect day?",
  34: "Describe a good question",
  35: "Describe a good friend",
  36: "Describe a peaceful evening",
  37: "Where is home?",
  38: "Where have you been?",
  39: "Where have you never been?",
  40: "Where is the good life?",
  41: "Why are you happy?",
  42: "What gift would you like to give?",
  43: "How have you changed someone's life?",
  44: "What is a beloved tree?",
  45: "What is a beloved animal?",
  46: "When did you last stretch?",
  47: "What can you hear right now?",
  48: "When you turn around, what do you see?",
  49: "Where could you walk today?",
  50: "Describe a beloved soft thing",
  51: "Describe a beloved smell?",
  52: "Where do you wish you were?",
  53: "When did you last dance?",
  54: "What do your hands want to do?",
  55: "What does your face want to do?",
  56: "How do you feel?",
  57: "What are you thinking about?",
  58: "What soft surface can you touch right now",
  59: "What are you hoping for?",
  60: "What is behind you?"
};

const initialFriendYPositions = [];
for (let i = 0; i < numberOfFriends * 10; i++) {
  initialFriendYPositions.push(Math.random());
}

function mkGoodPosition() {
  return {
    x: Math.random() * 900 - 500,
    y: Math.random() * 150 - 5, // 100
    z: Math.random() * 900 - 600 // -200
  };
}

function mkGoodRotation() {
  return {
    x: Math.random() * 2 * Math.PI,
    y: Math.random() * 2 * Math.PI,
    z: Math.random() * 2 * Math.PI
  };
}

function windowOnLoad() {
  document.body.classList.remove("preload");
  
  const jellyFishGLTFPromise = new Promise((resolve, reject) => {
    const gltfLoader2 = new GLTFLoader();
    gltfLoader2.load('./img/oct.glb', (gltf) => {
      resolve(gltf.scene);
    });
  });

  const friendShapePromise = new Promise((resolve, reject) => {
    const gltfLoader = new GLTFLoader();
    gltfLoader.load('./img/friend3.glb', (gltf) => {
      resolve(gltf.scene);
    });
  });

  init();
  animate();

  function makeSparkles(spSource, spSpread, spLight, spSize, spQuant, numOfSets) {
    let setsOfSparks = [];

    sparkUniforms = {
      pointTexture: { value: new THREE.TextureLoader().load("img/spark1.png") }
    };
    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms: sparkUniforms,
      vertexShader: document.getElementById('vertexshader').textContent,
      fragmentShader: document.getElementById('fragmentshader').textContent,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: true,
      vertexColors: true
    });

    const sparkRadius = spSpread; //how wide they spread out
    sparkGeometry = new THREE.BufferGeometry();
    const sparkPositions = [];
    const sparkColors = [];
    const sparkSizes = [];
    const sparkColor = new THREE.Color();

    for (let x = 0; x < numOfSets; x++) {
      const set = x;

      for (let i = 0; i < spQuant; i++) {
        sparkPositions.push((Math.random() * 2 - 1) * sparkRadius);
        sparkPositions.push((Math.random() * 2 - 1) * sparkRadius);
        sparkPositions.push((Math.random() * 2 - 1) * sparkRadius);

        let tempHue = Math.random() * 0xffffff
        sparkColor.setHSL(tempHue, 1.0, spLight);
        sparkColors.push(sparkColor.r, sparkColor.g, sparkColor.b);
        sparkSizes.push(spSize);
      }

      sparkGeometry.setAttribute('position', new THREE.Float32BufferAttribute(sparkPositions, 3));
      sparkGeometry.setAttribute('color', new THREE.Float32BufferAttribute(sparkColors, 3));
      sparkGeometry.setAttribute('size', new THREE.Float32BufferAttribute(sparkSizes, 1).setUsage(THREE.DynamicDrawUsage));

      let sparkleSystem = new THREE.Points(sparkGeometry, shaderMaterial);
      sparkleFriendMap[spSource.friendID] = sparkleSystem;
      spSource.add(sparkleSystem);
      setsOfSparks.push(sparkleSystem);
    }

    function removeSparks() {
      if (setsOfSparks.length == 0) {
        // do nothing -this stops the recursion!
      } else {
        let sparklesToFade = setsOfSparks.pop();
        spSource.remove(sparklesToFade);
        setTimeout(removeSparks, 50);
      }
    }

    if (numOfSets > 1) {
      setTimeout(removeSparks, 0);
    }
  }

  function setupObject(obj, id, group, speeds, positionX, positionY, positionZ, rotationX, rotationY, rotationZ, objScale) {
    // console.log(`setup id ${id}`);
    obj.scale.multiplyScalar(objScale);
    obj.traverse((o) => {
      if (o.isMesh) {
        o.friendID = id;
        o.material = new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff, opacity: 0.5, transparent: true, })
      }
    });

    obj.friendID = id;

    obj.position.x = positionX;
    obj.position.y = positionY;
    obj.position.z = positionZ;

    obj.rotation.x = rotationX;
    obj.rotation.y = rotationY;
    obj.rotation.z = rotationZ;

    group.add(obj);
    speeds.push(Math.random());
    // console.log('===');
  }

  function init() {

    // function pauseSounds(){
    //   for (let i = 0; i < songs.length; i++) {
    //     songs[i].pause();
    //   }
    // }


    function nameDisplayCheck() {
      if (localStorage.getItem('name')) {
        let name = localStorage.getItem('name');
        return name;
        // h1.textContent = 'Welcome, ' + name;
      } else {
        // h1.textContent = 'Welcome to our website ';
      }
    }

    let savedUserName = nameDisplayCheck();
    if (savedUserName) {
      document.getElementById("username").value = savedUserName;
    }

    container = document.getElementById('container');

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    //

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 20000);
    camera.position.set(0, 0, 200);

    //
    sun = new THREE.Vector3();


    // Water

    const waterGeometry = new THREE.PlaneGeometry(10000, 10000);

    water = new Water(
      waterGeometry,
      {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: new THREE.TextureLoader().load('img/waternormals.jpeg', function (texture) {

          texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

        }),
        alpha: 1.0,
        sunDirection: new THREE.Vector3(),
        sunColor: 0xffffff,
        waterColor: 0x001e0f,
        distortionScale: 3.7,
        fog: scene.fog !== undefined
      }
    );

    water.rotation.x = - Math.PI / 2;

    scene.add(water);

    // Skybox

    sky.scale.setScalar(10000);
    scene.add(sky);

    const skyUniforms = sky.material.uniforms;

    skyUniforms['turbidity'].value = skyBright; // 0 makes the sky go black
    skyUniforms['rayleigh'].value = 10; //modd
    skyUniforms['mieCoefficient'].value = 0.009;
    skyUniforms['mieDirectionalG'].value = 0.8; //modd

    const parameters = {
      inclination: 0.49,
      azimuth: 0.205
    };

    const pmremGenerator = new THREE.PMREMGenerator(renderer);

    function updateSun() {

      const theta = Math.PI * (parameters.inclination - 0.5);
      const phi = 1.85 * Math.PI * (parameters.azimuth - 0.5);

      sun.x = Math.cos(phi);
      sun.y = Math.sin(phi) * Math.sin(theta);
      sun.z = Math.sin(phi) * Math.cos(theta);

      sky.material.uniforms['sunPosition'].value.copy(sun);
      water.material.uniforms['sunDirection'].value.copy(sun).normalize();

      scene.environment = pmremGenerator.fromScene(sky).texture;

    }

    updateSun();

    let ambient = new THREE.AmbientLight(0x555555);
    scene.add(ambient);

    const color = 0xFFFFFF;
    const intensity = .5;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(5, 10, 2);
    scene.add(light);
    scene.add(light.target);

    const ncolor = 0xFFFFFF;
    const nintensity = 1;
    const nlight = new THREE.DirectionalLight(ncolor, nintensity);
    nlight.position.set(-1, 2, 4);
    scene.add(nlight);

    let directionalLight = new THREE.DirectionalLight(0xff8c19);
    directionalLight.position.set(0, 0, 1);
    scene.add(directionalLight);

    scene.fog = new THREE.FogExp2(15655413, 0.0002);
    renderer.setClearColor(scene.fog.color);
   
    //

    boxGroup = new THREE.Group();

    const torusKnotGeometry = new THREE.TorusKnotGeometry(2.7, 1.1, 300, 20, 2, 3);
    const sphereGeometry = new THREE.SphereGeometry(2, 30, 20, 30);
    const centerObjMaterial = new THREE.MeshLambertMaterial({ color: 16737818, opacity: 0.54, transparent: true, emissive: 3})
    const centerObjSphereMaterial = new THREE.MeshLambertMaterial({ color: 8215273, opacity: .2, transparent: true, emissive: 6})

    const centerWorldContainer = new THREE.Object3D();
    scene.add(centerWorldContainer);
    centerObjects.push(centerWorldContainer);

    centerObj = new THREE.Mesh(torusKnotGeometry, centerObjMaterial);
    centerObj.scale.set(.75, .75, .75);
    centerWorldContainer.add(centerObj);
    centerObjects.push(centerObj);

    let centerObjSphere = new THREE.Mesh(sphereGeometry, centerObjSphereMaterial);
    centerObjSphere.scale.set(3.5,3.5, 3.5);
    centerObj.add(centerObjSphere);
    // centerObjects.push(centerObjSphere);


    function makeRotatorObjInstance(geometry, color, x, y, z) {
      const rotatorMaterial = new THREE.MeshLambertMaterial({ color: color, opacity: 0.4, transparent: true, emissive: 1})
      const rotatorObjInstance = new THREE.Mesh(torusKnotGeometry, rotatorMaterial);
      rotatorObjInstance.position.x = x;
      rotatorObjInstance.position.y = y;
      rotatorObjInstance.position.z = z;
      centerObjects.push(rotatorObjInstance);
      centerWorldContainer.add(rotatorObjInstance); //rotate

      let rotatorSphere = new THREE.Mesh(sphereGeometry, centerObjSphereMaterial);
      rotatorSphere.scale.set(1.5,1.5, 1.5);
      rotatorObjInstance.add(rotatorSphere);
      return rotatorObjInstance;
    } 

    const triLength = 60;
    const triHeight = Math.sqrt(3)/2*triLength;
    const ax = - triLength/2;
    const ay = -triHeight/3;
    const bx = triLength/2;
    const by = -triHeight/3;
    const cx = 0;
    const cy = 2/3*triHeight;

    rot1 = makeRotatorObjInstance(torusKnotGeometry, 6823151, ax, 0, ay);
    rot2 = makeRotatorObjInstance(torusKnotGeometry, 1514735, bx, 0, by);
    rot3 = makeRotatorObjInstance(torusKnotGeometry, 1543450, cx, 0, cy);


    // const centerObjs = [
    //   makeCenterObjInstance(torusKnotGeometry, 0x8844aa, ax, 0, ay),
    //   makeCenterObjInstance(torusKnotGeometry, 0xaa8844, bx, 0, by),
    //   makeCenterObjInstance(torusKnotGeometry, 0x8844aa, cx, 0, cy),
    // ];

    // const friendWorld = new THREE.Object3D();
    // scene.add(friendWorld);
    // objects.push(friendWorld);
    // const earthMaterial = new THREE.MeshPhongMaterial({ color: 3093151, opacity: 0.5, transparent: true, emissive: 1 })
    // const earthMesh = new THREE.Mesh(sphereGeometry, centerObjMateria);
    // earthMesh.position.x = 10;
    // earthMesh.position.y = 3;
    // earthMesh.scale.set(1, 1, 1);

    // friendWorld.add(earthMesh);
    // objects.push(earthMesh);

    // function makeTinyRotatorInstance(geometry, color, x, y, z) {
    //   let iMaterial = new THREE.MeshPhongMaterial({ color: Math.random() * 0xffffff, opacity: 0.5, transparent: true, emissive: 1 })
    //   const tinyRotator = new THREE.Mesh(sphereGeometry, iMaterial);
    //   tinyRotator.position.x = x;
    //   tinyRotator.position.y = y;
    //   tinyRotator.position.z = z;
    //   tinyRotator.scale.set(.3, .3, .3);
    //   return tinyRotator;
    // }

    // const tinyRotat = [];

    // for (let i = -10; i < 10; i++) {
    //   let x = Math.random() * 40 - 25;
    //   let y = Math.random() * 15 - 5; // 100
    //   let z = Math.random() * 30 - 10; //-200
    //   let rotat = makeTinyRotatorInstance(centerObjGeom, 0x8844aa, x, y, z);
    //   friendWorldd.add(rotat);
    //   objects.push(rotat);
    // }

    

    controls = new OrbitControls(camera, renderer.domElement);
    controls.maxPolarAngle = Math.PI * 0.499;
    controls.target.set(0, 10, 0);
    controls.minDistance = 10.0;
    controls.maxDistance = 800.0;

    // https://threejs.org/docs/#examples/en/controls/OrbitControls.keys

    controls.update();

    // ---- pointer controls stuff----- 
    pointerControls = new PointerLockControls(camera, document.body);
    scene.add(pointerControls.getObject());

    const onKeyDown = function (event) {
      var delta = 20;

      switch (event.code) {

        case 'ArrowUp':
        case 'KeyW':
          moveForward = true;
         camera.position.z = camera.position.z - delta;
          camera.updateProjectionMatrix();


          break;

        case 'ArrowLeft':
        case 'KeyA':
          moveLeft = true;
          camera.position.x = camera.position.x - delta;
          camera.updateProjectionMatrix();


          break;

        case 'ArrowDown':
        case 'KeyS':
          moveBackward = true;
          camera.position.z = camera.position.z + delta;
          camera.updateProjectionMatrix();


          break;

        case 'ArrowRight':
        case 'KeyD':
          moveRight = true;
          camera.position.x = camera.position.x + delta;
          camera.updateProjectionMatrix();


          break;

        case 'Space':
          if (canJump === true) velocity.y += 350;
          canJump = false;
          break;

      }

    };

    const onKeyUp = function (event) {

      switch (event.code) {

        case 'ArrowUp':
        case 'KeyW':
          moveForward = false;
          break;

        case 'ArrowLeft':
        case 'KeyA':
          moveLeft = false;
          break;

        case 'ArrowDown':
        case 'KeyS':
          moveBackward = false;
          break;

        case 'ArrowRight':
        case 'KeyD':
          moveRight = false;
          break;
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    //end controls

    // const geometry = new THREE.TorusKnotGeometry(10, 6, 100, 14, 4, 2);
 
    function makeFriendModal(friendID, id) {
      let container = document.getElementById("container");
      let friendModalDiv = document.createElement("div");
      // let innerFriendWrapper = document.createElement("div");
      let printFriendNumberDiv = document.createElement("div");
      let friendNumber = document.createTextNode("#" + friendID);    // Create a text node
      let infoTextDiv = document.createElement("div");
      let hr = document.createElement("hr");
      let newInfoText = document.createTextNode(`${friendQuestions[id]}`);    // Create a text node
      let printTextDiv = document.createElement("div");
      let printText = document.createTextNode(" ");    // Create a text node
      let formDiv = document.createElement("div");
      let form = document.createElement("form");
      let textInput = document.createElement("input");
      let submitInput = document.createElement("input");
      let closeModalBtnDiv = document.createElement("div")
      let closeModalBtn = document.createElement("div")


      friendModalDiv.id = "friendModalDivID" + friendID;
      printTextDiv.id = "printTextDivID" + friendID;
      textInput.id = "textInput" + friendID;

      printFriendNumberDiv.classList.add("printFriendNumberDiv");
      hr.classList.add("hr");
      infoTextDiv.classList.add("infoTextDiv");
      friendModalDiv.classList.add("friendModalDiv");
      printTextDiv.classList.add("printTextDiv");
      formDiv.classList.add("formDiv");
      form.classList.add("chat");
      closeModalBtnDiv.classList.add("closeModalBtnDiv");
      closeModalBtn.classList.add("closeModalBtn");

      textInput.type = "text";
      textInput.placeholder = "";
      submitInput.type = "submit";
      submitInput.value = "send";

      printFriendNumberDiv.appendChild(friendNumber);
      printTextDiv.appendChild(printText);
      infoTextDiv.appendChild(newInfoText);
      infoTextDiv.appendChild(hr);

      formDiv.appendChild(form);
      form.appendChild(textInput);
      form.appendChild(submitInput);
      closeModalBtnDiv.appendChild(closeModalBtn);

      friendModalDiv.insertBefore(formDiv, friendModalDiv.childNodes[0]);
      container.insertBefore(friendModalDiv, container.childNodes[0]);
      friendModalDiv.insertBefore(printTextDiv, friendModalDiv.childNodes[0]);
      friendModalDiv.insertBefore(infoTextDiv, friendModalDiv.childNodes[0]);
      friendModalDiv.insertBefore(printFriendNumberDiv, friendModalDiv.childNodes[0]);
      friendModalDiv.insertBefore(closeModalBtnDiv, friendModalDiv.childNodes[0]);

      submitInput.addEventListener("click", function (event) {
        event.preventDefault()
        if (textInput.value == "") {
          textInput.focus();
          return;
        } else {
          let ref2 = msgsRef.child(`${friendID}`).child('msgs');
          // console.log(ref2);
          ref2.push({
            username: username,
            msg: textInput.value
          });
          textInput.value = "";
          textInput.focus();
        }
      });

      closeModalBtn.addEventListener("click", function (event) {
        friendModalDiv.classList.remove("openFriendModalDiv");
      })

    }

    // makefriendorbs
    for (let i = 0; i < numberOfFriends; i++) {

      const goodPosition = mkGoodPosition();
      const positionX = goodPosition.x;
      const positionY = goodPosition.y; // 100
      const positionZ = goodPosition.z; //-200

      const goodRotation = mkGoodRotation();
      const rotationX = goodRotation.x;
      const rotationY = goodRotation.y;
      const rotationZ = goodRotation.z;

      const brightMaterial = new THREE.MeshPhongMaterial({ emissive: 0xFFFF00 });
      let sphereAtHeartOfFriend = new THREE.Mesh(sphereGeometry, brightMaterial);
      // object.scale.set(1, 1, 1);
      sphereAtHeartOfFriend.scale.set(.03, .03, .03);

      scene.add(sphereAtHeartOfFriend);

      friendShapePromise.then((friendShapeGLTF) => {
        const friendShape = friendShapeGLTF.clone()
        friendMap[i] = friendShape;
        setupObject(friendShape, i, boxGroup, boxSpeeds, positionX, positionY, positionZ, rotationX, rotationY, rotationZ, 20);
      });

      jellyFishGLTFPromise.then((jelly) => {
        jellyfish[i] = jelly.clone();
      });

      // setTimeout(function () {
      //   const gltfLoader2 = new GLTFLoader();
      //   gltfLoader2.load('./img/oct.glb', (gltf) => {
      //     jellyfish[i] = gltf.scene;
      //     // setupObject(jellyfish, i, boxGroup, boxSpeeds, 10, 10, 10, rotationX, rotationY, rotationZ, 30);
      //   });
      // }, Math.random() * 5000 + 1000);
     
      friendOrbs[i] = sphereAtHeartOfFriend;

      setupObject(sphereAtHeartOfFriend, i, boxGroup, boxSpeeds, positionX, positionY, positionZ, rotationX, rotationY, rotationZ, 1);
      makeFriendModal(sphereAtHeartOfFriend.friendID, i);

    }

    scene.add(boxGroup);


    raycaster = new THREE.Raycaster();
    document.addEventListener('mousemove', onDocumentMouseMove);
    window.addEventListener('resize', onWindowResize);
  }

  let loadingScreenDiv = document.getElementById("loadingScreenDiv");
  let submitUsername = document.getElementById("submitUsername");

  submitUsername.addEventListener(
    "click",
    function (event) {
      event.preventDefault();
      let currUsername = document.getElementById("username").value;
      if (currUsername != "") {
        let usernameForm = document.getElementById("usernameForm");
      } else {
        return
      }
      localStorage.setItem('name', currUsername);
      username = nameDisplayCheck();
      loadingScreenDiv.classList.add("fade");
      seaSound.play();
      seaSound.volume = 0.08;
      seaSound.loop = true;
      backgroundSound.play();
      backgroundSound.volume = 0.08;
      backgroundSound.loop = true;
      setTimeout(function () { loadingScreenDiv.style.display = "none"; }, 600);
    },
    false
  );

  function nameDisplayCheck() {
    if (localStorage.getItem('name')) {
      let name = localStorage.getItem('name');
      return name;
    }
  }

  function modifyMesh(object, callback) {
    object.traverse(function (o) {
      if (o.isMesh) {
        callback(o);
      }
    })
  }

  function gotData(data) {
    // if we didn't use .val we'd get a bunch of other info
    let msgDatabase = data.val();
    let keys = Object.keys(msgDatabase);
    for (let i = 0; i < keys.length; i++) {
      let k = keys[i];
      var friendMsgs = msgDatabase[k].msgs;

      if (typeof (friendMsgs) === 'undefined') { //deal with empty friends
        friendMsgs = {};
      }

      let friendMsgsKeys = Object.keys(friendMsgs);

      let txtDivToUpdate = document.getElementById("printTextDivID" + k);
      txtDivToUpdate.innerHTML = '';
      let ulNode = document.createElement('UL');
      txtDivToUpdate.appendChild(ulNode);

      for (let j = 0; j < friendMsgsKeys.length; j++) {
        let friendMsgKey = friendMsgsKeys[j];
        let msg = friendMsgs[friendMsgKey];

        let liNode = document.createElement('li');
        ulNode.appendChild(liNode);

        let span = document.createElement("span");
        span.classList.add("username");
        let msgTextNode = document.createTextNode(`${msg.msg}`);
        let usernameTextNode = document.createTextNode(`${msg.username}: `);

        span.appendChild(usernameTextNode);
        liNode.appendChild(span);
        liNode.appendChild(msgTextNode);
      }
      function scrollToTopOfDiv(txtDivToUpdate) {
        txtDivToUpdate.scrollTop = txtDivToUpdate.scrollHeight;
      }
      scrollToTopOfDiv(txtDivToUpdate);

    }
  }
  function errData() {
    console.log("error");
  }
  // takes event (value), then callback, then error)
  msgsRef.on('value', gotData, errData); //callback for receive data, then for err data

  let ORBS_WITH_SPARKLES = {};

  for (let j = 0; j < numberOfFriends; j++) {
    let newItems = false;
    msgsRef.child(`${j}/msgs`).limitToLast(1).on('child_added', function (snapshot, prevKey) {
      let msg = snapshot.val();

      const friend = friendMap[j];
      if (typeof (friend) !== 'undefined') {
        modifyMesh(friend, (o) => {
          o.material.opacity = 0.5;
          // let noOfPosts = msgsRef.child(); https://stackoverflow.com/questions/53815822/most-efficient-way-to-count-children-with-firebase-database
          // o.scale.multiplyScalar(2); findme 
        });
      }


      // get a reference to the orb
      let orb = friendOrbs[j];
      // add sparkles to the orb spSource, spSpread, spLight, spSize, spQuant, numofSets
      makeSparkles(orb, 150, 0.1, 20, 1, 1);
      // keep track of the orbs with sparkles
      ORBS_WITH_SPARKLES[j] = true;

      if (newItems) {
        if (msg.username == username) {
          console.log("don't display sparkles");
        } else {
          console.log(j, snapshot.val());
        }
      } else {
        // console.log(`${j}: not a new item`);
      }
      newItems = true;

    });
  }

  function takeModalIDReturnMsg(currModalID) {
    return "Welcome to orb " + currModalID;
  }

  function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

  }

  function animate() {
    requestAnimationFrame(animate);
    render();

    // ---- pointer controls stuff----- 
    // const time = performance.now();


    // raycaster.ray.origin.copy(pointerControls.getObject().position);
    // raycaster.ray.origin.y -= 10;

    // const intersections = raycaster.intersectObjects(objects);

    // const onObject = intersections.length > 0;

    // const delta = (time - prevTime) / 1000;

    // velocity.x -= velocity.x * 10.0 * delta;
    // velocity.z -= velocity.z * 10.0 * delta;

    // velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

    // direction.z = Number(moveForward) - Number(moveBackward);
    // direction.x = Number(moveRight) - Number(moveLeft);
    // direction.normalize(); // this ensures consistent movements in all directions

    // if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
    // if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;

    // if (onObject === true) {

    //   velocity.y = Math.max(0, velocity.y);
    //   canJump = true;

    // }

    // pointerControls.moveRight(- velocity.x * delta);
    // pointerControls.moveForward(- velocity.z * delta);

    // pointerControls.getObject().position.y += (velocity.y * delta); // new behavior

    // if (pointerControls.getObject().position.y < 10) {

    //   velocity.y = 0;
    //   pointerControls.getObject().position.y = 10;

    //   canJump = true;

    // }

  }



  function render() {
    // example of updating sky in render
    // sky.material.uniforms['turbidity'].value = 0;

    const time = performance.now() * 0.0001;

    centerObj.position.y = Math.sin(time) * 20 + 5;
    centerObj.rotation.x = time * 0.5;
    centerObj.rotation.z = time * 0.51;

    for (let i = 0; i < boxGroup.children.length; i++) {
      // let random = Math.random() * -.05 - .08; // 100
      const randomSpeedForThisBox = boxSpeeds[i];
      // Pi = 3.14159  
      let offset = initialFriendYPositions[i] * 15;
      // boxGroup.children[i].position.y = Math.sin(time + offset) * 40 + 15;
      boxGroup.children[i].position.y = Math.sin(time) * 40 + 35;

      // boxGroup.children[i].position.y = Math.sin(randomSpeedForThisBox * time) * 80 + 15;
      boxGroup.children[i].rotation.x = Math.sin(time) * 2 + 1;
      boxGroup.children[i].rotation.z = Math.sin(time) * 5 + 1;

    }

    centerObjects.forEach((obj) => {
      obj.rotation.y = time;
      centerObj.rotation.x = time * 0.5;
    centerObj.rotation.z = time * 0.51;
    });


    water.material.uniforms['time'].value += 1.0 / 60.0;


    camera.updateMatrixWorld();

    //HOVER stuff
    // find intersections
    raycaster.setFromCamera(mouse, camera);
    const hoverableThings = boxGroup.children.concat(centerObjects);
    const intersects = raycaster.intersectObjects(hoverableThings, true);
    if (intersects.length > 0) {
      // console.log("gotcha");
      if (INTERSECTED != intersects[0].object) {
        if (INTERSECTED) {
          INTERSECTED.traverse((o) => {
            if (o.isMesh) {
              o.material.emissive.setHex(o.currentHex);
            }
          });
        }
        INTERSECTED = intersects[0].object;

        modifyMesh(INTERSECTED, (o) => {
          o.currentHex = o.material.emissive.getHex();
          o.material.emissive.setHex(0xff0000);
        });
      }
    } else {
      if (INTERSECTED) {
        modifyMesh(INTERSECTED, (o) => {
          o.material.emissive.setHex(o.currentHex);
        });
      }
      INTERSECTED = null;
    }

    renderer.render(scene, camera);
  }

  renderer.domElement.addEventListener('click', onClick, false);
  renderer.domElement.addEventListener("touchend", onTouch, false);
  document.body.appendChild(renderer.domElement); // does this even do anything?


  function onDocumentMouseMove(event) {
    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
  }

  function onClick(event) {
    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    clickOrTouchFriendOrbs(event);

  }

  function onTouch(event) {
    event.preventDefault();
    mouse.x = (event.pageX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.pageY / window.innerHeight) * 2 + 1;
    clickOrTouchFriendOrbs(event);
  }

  // close modals when clicking outside them - this works but not as expected
  function closeAllModals(event) {
    var modal = document.getElementsByClassName('friendModalDiv');
    if (event.target.classList.contains('friendModalDiv')) {
    } else {
      for (var i = 0; i < modal.length; i++) {
        let currModal = modal[i];
        currModal.classList.remove("openFriendModalDiv");
      }
    }
  }

  // fade the jellies by changing their opacity
  function fadeJellyfishFromScene(jellies) {
    var exit = false;
    jellies.forEach(function (jelly) {
      jelly.traverse(function (o) {
        if (o.isMesh) {
          const opacity = o.material.opacity;
          if (opacity > 0.01) {
            o.material.opacity = opacity - 0.01;
          } else {
            // we exit if any opacity is < 0.01
            // but they should all have the same value
            // so its not a big deal.
            exit = true;
          }
        }
      });
    });

    if(exit == true) {
      jellies.forEach(function(jelly) {
        const parent = jelly.parent;
        parent.remove(jelly);
        modifyMesh(jelly, (o) => {
          o.material.opacity = 0.5;
        });
      });
    } else {
      setTimeout(fadeJellyfishFromScene, 200, jellies);
    }

  }

  function clickOrTouchFriendOrbs(event) {
    raycaster.setFromCamera(mouse, camera);

    closeAllModals(event);

    let intersectsCenterObj = raycaster.intersectObjects([centerObj], true);
    if (intersectsCenterObj.length > 0) {
      // spSource, spSpread, spLight, spSize, spQuant, numofsets
      makeSparkles(centerObj, 800, .2, 9, 50, 50);

    }

    let intersectsRot1 = raycaster.intersectObjects([rot1], true);
    if (intersectsRot1.length > 0) {
      rot1Sound.play();
      rot1Sound.volume = 0.08;
      jellyfish.forEach(function(jelly) {
        var setup = jelly.iHaveBeenSetup || false;
        if(setup == true) {
          boxGroup.add(jelly);
        } else {
          const rotation = mkGoodRotation();
          const position = mkGoodPosition();  
          setupObject(jelly, 100, boxGroup, boxSpeeds, position.x, position.y, position.z, rotation.x, rotation.y, rotation.z, 30);
          jelly.iHaveBeenSetup = true;  
        }
      });

      fadeJellyfishFromScene(jellyfish);

      // skyBright = 0;
      // init();
      console.log("h1");
    }
    let intersectsRot2 = raycaster.intersectObjects([rot2], true);
    if (intersectsRot2.length > 0) {
      rot2Sound.play();
      rot2Sound.volume = 0.08;
      // spSource, spSpread, spLight, spSize, spQuant, numofsets
      console.log("h2");
    }
    let intersectsRot3 = raycaster.intersectObjects([rot3], true);
    if (intersectsRot3.length > 0) {
      rot3Sound.play();
      rot3Sound.volume = 0.08;
      // spSource, spSpread, spLight, spSize, spQuant, numofsets
      console.log("h3");
    }

    let intersectsFriend = raycaster.intersectObjects(boxGroup.children, true);
    if (intersectsFriend.length > 0) { //you know you have an intersection
      friendSound.volume = 0.09;
      friendSound.play();
      document.getElementById("settingsDropdown").classList.remove("showDropdown");

      let currFriendID = intersectsFriend[0].object.friendID; //grab the id of the friend

      let currModalID = "friendModalDivID" + currFriendID; //form the modal ID
      currFriendModalDiv = document.getElementById(currModalID); //grad the current Modal
      currFriendModalDiv.classList.add("openFriendModalDiv")
      modalOpen = true;

      // let msg = takeModalIDReturnMsg(currFriendID);
      // let currTextDiv = document.getElementById("textInputID" + currFriendID);

      for (let i = 0; i < intersectsFriend.length; i++) {
        let currObj = intersectsFriend[i].object;
        currObj.parent.children.forEach((obj) => {
          modifyMesh(obj, (o) => {
            o.material.emissive.setHex(3135135);
            o.material.opacity = 0.2;
          })
        });
      }
      let currentOrb = friendOrbs[currFriendID];
      currentOrb.remove(sparkleFriendMap[currentOrb.friendID]);

    }
  }

  let currBtn;

  // let video = document.getElementById("video");
  // let source = document.createElement("source");
  // video.appendChild(source);

  // const wrapper = document.getElementById("wrapper");
  // const wrapperBtn = document.getElementById("wrapperBtn");
  // const wrapperToggleDiv = document.getElementById("wrapperToggleDiv");

  // const btn1 = document.getElementById("btn1");
  // const btn2 = document.getElementById("btn2");
  // const btn3 = document.getElementById("btn3");
  // const btn4 = document.getElementById("btn4");
  // const btn5 = document.getElementById("btn5");
  // const btn6 = document.getElementById("btn6");

  document.addEventListener(
    "click",
    function (event) {
      if (toggleOpen == false) {
        // console.log("toggle is closed - return");
        // return;
      } else {
        // console.log("toggle is open");
        if (event.target.classList.contains(wrapper)) { // || event.target.contains( wrapper )
          console.log("clicking on wrapper or button - return");
          // return;
        } else {
          console.log("clicking on world - run code");

          // if (wrapper.classList.contains("openWrapper")) {
          //   wrapper.classList.remove("openWrapper");
          //   wrapperBtn.classList.add("wrapperBtnClosing");
          //   toggleOpen = false;
          // }
        }
      }
    },
  );

  // wrapperBtn.addEventListener(
  //   "click",
  //   function (event) {
  //     if (toggleOpen == false) {
  //       // console.log("toggle is opening");
  //       if (wrapperBtn.classList.contains('wrapperBtnClosed')) {
  //         wrapperBtn.classList.remove("wrapperBtnClosed");
  //       }
  //       if (wrapperBtn.classList.contains('wrapperBtnClosing')) {
  //         wrapperBtn.classList.remove("wrapperBtnClosing");
  //       }
  //       wrapperBtn.classList.add("wrapperBtnOpening");
  //       wrapper.classList.add("openWrapper");
  //       toggleOpen = true;
  //       // console.log(`toggle should be open ${toggleOpen}`);
  //     } else {
  //       console.log("toggle is closing");
  //       if (wrapperBtn.classList.contains('wrapperBtnOpening')) {
  //         wrapperBtn.classList.remove("wrapperBtnOpening");
  //       }
  //       wrapperBtn.classList.add("wrapperBtnClosing");
  //       wrapper.classList.remove("openWrapper");
  //       toggleOpen = false;
  //       // console.log(`toggle should be closed ${toggleOpen}`);


  //     }
  //     // toggleOpen != toggleOpen
  //     // console.log(toggleOpen);
  //     // toggleOpen
  //   },
  // );

  // new toggle info stuff

  // settings menu stuff

  let settingsDropdown = document.getElementById("settingsDropdown");
  let toggleChangeNameInput = document.getElementById("toggleChangeNameInput");
  let settingsBtn = document.getElementById("settingsBtn");
  let changeNameInput = document.getElementById("changeNameInput");
  let changeNameSlider = document.getElementById("changeNameSlider");
  let changeNameForm = document.getElementById("changeNameForm");
  // let toggleSoundCheckbox = document.getElementById("toggleSoundCheckbox");

  function settingsMenuOpen(event) {
    // document.getElementById("wrapperBtn").classList.add("wrapperBtnOpening");
    settingsDropdown.classList.toggle("showDropdown");
    document.getElementsByClassName('slide-in')[0].classList.toggle('show');
    closeAllModals(event);
    // console.log("closeem");
    toggleChangeNameInput.value = `Change name, ${username}?`;
  }

  settingsBtn.addEventListener("click", settingsMenuOpen);

  function expand() {
    changeNameSlider.className = 'expanded';
    setTimeout(function () {
      changeNameInput.focus();
    }, 500);
  }

  function collapse() {
    changeNameSlider.className = 'collapsed';
    changeNameInput.blur();
  }

  toggleChangeNameInput.onclick = expand;

  changeNameInput.onblur = function () {
    setTimeout(collapse, 100);
  }

  changeNameForm.onsubmit = function (e) {
    e.preventDefault();
    console.log(changeNameInput.value);
    localStorage.setItem('name', changeNameInput.value);
    username = nameDisplayCheck();
    document.getElementById("toggleChangeNameInput").value = `Change name, ${username}?`;
    collapse();
  }

  // toggle sound
  let toggleSoundCheckbox = document.querySelector("input[name=toggleSoundCheckbox]");

  toggleSoundCheckbox.addEventListener('change', function () {
    if (this.checked) {
      console.log("Checkbox is checked..");
      backgroundSound.volume = 0.08;
      seaSound.volume = 0.08;
      friendSound.volume = 0.04;
      soundMuted = false;


    } else {
      console.log("Checkbox is not checked..");
      backgroundSound.volume = 0;
      seaSound.volume = 0;
      friendSound.volume = 0;
      soundMuted = true;
    }

    // function muteSounds() {
    //   if (soundMuted) {
    //     seaSound.volume = 0.1;
    //   } else {
    //     seaSound.volume = 0;
    //   }
    //   soundMuted != soundMuted;
    // }
    // muteSounds();
  });

  // new toggle info stuff end

  // btn1.addEventListener(
  //   "click",
  //   function () {
  //     updateBtnStyle(btn1);
  //     // source.setAttribute("src", "img/v1.mp4");
  //     // video.load();
  //     playSong(song1);
  //   },
  //   false
  // );
  // btn2.addEventListener(
  //   "click",
  //   function () {
  //     updateBtnStyle(btn2);
  //     // source.setAttribute("src", "img/v2.mp4");
  //     // video.load();
  //     playSong(song2);
  //   },
  //   false
  // );
  // btn3.addEventListener(
  //   "click",
  //   function () {
  //     updateBtnStyle(btn3);
  //     // source.setAttribute("src", "img/v3.mp4");
  //     // video.load();
  //     playSong(song3);
  //   },
  //   false
  // );
  // btn4.addEventListener(
  //   "click",
  //   function () {
  //     updateBtnStyle(btn4);
  //     // source.setAttribute("src", "img/v4.mp4");
  //     // video.load();
  //     playSong(song4);
  //   },
  //   false
  // );
  // btn5.addEventListener(
  //   "click",
  //   function () {
  //     updateBtnStyle(btn5);
  //     // source.setAttribute("src", "img/v5.mp4");
  //     // video.load();
  //     playSong(song5);
  //   },
  //   false
  // );
  // btn6.addEventListener(
  //   "click",
  //   function () {
  //     updateBtnStyle(btn6);
  //     // source.setAttribute("src", "img/v6.mp4");
  //     // video.load();
  //     playSong(song6);
  //   },
  //   false
  // );

  // function updateBtnStyle(clickedBtn) {
  //   // remove the class from the old button (which is the "current" button)
  //   if (currBtn !== undefined) {
  //     currBtn.classList.remove("currBtn");
  //   }
  //   currBtn = clickedBtn; // update the "current" button to the most recently clicked button
  //   clickedBtn.classList.add("currBtn");
  // }



  document.body.onload = nameDisplayCheck;
}

window.addEventListener("load", windowOnLoad);

