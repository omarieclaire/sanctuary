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

let controls, water, sun, centerObj;

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
var flyingBoxes = [];
var flyingSpheres = [];



let database = firebase.database();
let ref = database.ref();
let msgsRef = ref.child('msg');

let username;
let friendOrbs = {};
let friendMap = {};
let friendQuestionsS = {
  0: "¿Cuál sería un placer sencillo para ti?",
  1: "¿Qué significa eso?",
  2: "¿Quién te inspira?",
  3: "¿Cómo aprendes?",
  4: "¿Desarías tener más?", 
  5: "¿Puedes imaginar una mejor alternativa?",
  6: "¿Qué cosa sorprendente has aprendido?",
  7: "¿Qué hay al final?", 
  8: "Describe una mañana hermosa",
  9: "¿Con quién te gustaría poder hablar?",
  10: "Describe algo suave que ames",
  11: "Si los días tuvieran una hora extra ¿cómo la aprovecharías?",
  12: "¿Cuál es tu recuerdo más temprano de juego?",
  13: "¿Cómo sabes cuando alguien es un/a verdadero/a amigo/a?",
  14: "¿Qué canción quisieras compartir por aquí?",
  15: "¿Cómo huele tu lugar favorito?",
  16: "¿Qué quieren hacer tus manos?",
  17: "¿Qué texturas te gusta tocar?",
  18: "¿Qué cosa buena podrías hacer por vos ahora mismo?",
  19: "¿Qué se ve por tu ventana?",
  20: "¿Qué quiere hacer tu cuerpo ahora?",
  21: "¿Qué te genera curiosidad?",
  22: "¿Qué te hace reír incontrolablemente?",
  23: "¿Qué libro darías como regalo?",
  24: "Describe algo que adores",
  25: "¿Elegirías paz, amor o alegría?",
  26: "¿Qué comida te gustaría comer ahora mismo?",
  27: "¿Qué es algo que hayas compartido con alguien?",
  28: "Describe un sueño memorable",
  29: "¿Un lugar que recuerdes con cariño?",
  30: "Cuenta una historia en 10 palabras",
  31: "¿Qué es lo que estás buscando?",
  32: "Describe un lugar imaginario pacífico",
  33: "¿Cuándo te das vuelta, qué ves?",
  34: "¿Qué hace que una pregunta sea buena?",
  35: "¿Qué sonidos escuchas en este momento?",
  36: "¿Qué te hace sentir conectado/a?",
  37: "¿Qué es el hogar?",
  38: "¿Qué regalo te gustaría dar?",
  39: "Describe un animal que ames",
  40: "Describe una planta que ames"
};

let friendQuestions = {
  0: "What is a simple pleasure for you?",
  1: "What does it mean?",
  2: "Who inspires you?",
  3: "How do you learn?",
  4: "Do you wish you had more?",
  5: "Can you imagine a better way?",
  6: "What is a surprising thing you’ve learned?",
  7: "What is at the bottom?",
  8: "Describe a beautiful morning?",
  9: "Who do you wish you could speak to?",
  10: "Describe a beloved soft thing?",
  11: "If you had an extra hour every day how would you spend it?",
  12: "What is your earliest memory of play?",
  13: "How do you know when someone is a true friend?",
  14: "What song would you like to share here?",
  15: "What does your favourite place smell like?",
  16: "What do your hands want to do?",
  17: "What texture do you like to touch?",
  18: "What kind thing could you do for yourself right now?",
  19: "What is outside your window?",
  20: "What does your body want to do?",
  21: "What are you curious about?",
  22: "What makes you laugh uncontrollably?",
  23: "What book would you give as a gift?",
  24: "Describe a beloved soft thing",
  25: "Would you choose peace, love, or joy?",
  26: "What meal would you like to eat right now?",
  27: "What is something you shared with someone?",
  28: "Describe a memorable dream?",
  29: "What is a place you remember fondly?",
  30: "Tell a story in 10 words?",
  31: "What are you looking forward to?",
  32: "Describe an imaginary peaceful place?",
  33: "When you turn around, what do you see?",
  34: "What makes a question good?",
  35: "What quiet under-noises do your ears hear right now?",
  36: "What makes you feel connected?",
  37: "What is home?",
  38: "What gift would you like to give?",
  39: "Describe a beloved animal?",
  40: "Describe a plant that you love?"
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

  const boxGeometry = new THREE.TorusKnotGeometry(.8, .1, 300, 7, 5, 7);
  // const boxGeometry = new THREE.BoxGeometry(3, 3, 3, 10, 10, 10);

  function makeFlyingBoxes(x, y, z) {
    let boxGeometryInstance = new THREE.Mesh(boxGeometry, buildTwistMaterial(0.5));
    boxGeometryInstance.position.x = x;
    boxGeometryInstance.position.y = y;
    boxGeometryInstance.position.z = z;
    // centerWorldContainer.add(boxGeometryInstance); //rotate
    return boxGeometryInstance;
  }

  const nsphereGeometry = new THREE.TorusGeometry( 18, .8, 21, 100, 6.3 );
  function makeFlyingSpheres(x, y, z) {
    let sphereGeometryInstance = new THREE.Mesh(nsphereGeometry, buildTwistMaterial(0.2));
    sphereGeometryInstance.position.x = x;
    sphereGeometryInstance.position.y = y;
    sphereGeometryInstance.position.z = z;
    // centerWorldContainer.add(boxGeometryInstance); //rotate
    return sphereGeometryInstance;
  }

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
      document.getElementById("usernameS").value = savedUserName;
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
    const centerObjMaterial = new THREE.MeshLambertMaterial({ color: 16737818, opacity: 0.54, transparent: true, emissive: 3 })
    const centerObjSphereMaterial = new THREE.MeshLambertMaterial({ color: 8215273, opacity: .2, transparent: true, emissive: 6 })

    const centerWorldContainer = new THREE.Object3D();
    scene.add(centerWorldContainer);
    centerObjects.push(centerWorldContainer);

    // centerObj = new THREE.Mesh(torusKnotGeometry, centerObjMaterial);

    centerObj = new THREE.Mesh(torusKnotGeometry, buildTwistMaterial(20.0));


    centerObj.scale.set(.75, .75, .75);
    centerWorldContainer.add(centerObj);
    centerObjects.push(centerObj);

    let centerObjSphere = new THREE.Mesh(sphereGeometry, centerObjSphereMaterial);
    centerObjSphere.scale.set(3.5, 3.5, 3.5);
    centerObj.add(centerObjSphere);
    // centerObjects.push(centerObjSphere);


    function makeRotatorObjInstance(geometry, color, x, y, z) {
      const rotatorMaterial = new THREE.MeshLambertMaterial({ color: color, opacity: 0.4, transparent: true, emissive: 1 })
      const rotatorObjInstance = new THREE.Mesh(torusKnotGeometry, rotatorMaterial);
      rotatorObjInstance.position.x = x;
      rotatorObjInstance.position.y = y;
      rotatorObjInstance.position.z = z;
      centerObjects.push(rotatorObjInstance);
      centerWorldContainer.add(rotatorObjInstance); //rotate

      let rotatorSphere = new THREE.Mesh(sphereGeometry, centerObjSphereMaterial);
      rotatorSphere.scale.set(1.5, 1.5, 1.5);
      rotatorObjInstance.add(rotatorSphere);
      return rotatorObjInstance;
    }

    const triLength = 60;
    const triHeight = Math.sqrt(3) / 2 * triLength;
    const ax = - triLength / 2;
    const ay = -triHeight / 3;
    const bx = triLength / 2;
    const by = -triHeight / 3;
    const cx = 0;
    const cy = 2 / 3 * triHeight;

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
    controls.listenToKeyEvents(window); // optional
    controls.screenSpacePanning = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.keyPanSpeed = 50;
    controls.update();
    // https://threejs.org/docs/#examples/en/controls/OrbitControls.keys

    // const geometry = new THREE.TorusKnotGeometry(10, 6, 100, 14, 4, 2);

    function makeFriendModal(friendID, id) {
      let container = document.getElementById("container");
      let friendModalDiv = document.createElement("div");
      // let innerFriendWrapper = document.createElement("div");
      let printFriendNumberDiv = document.createElement("div");
      let friendNumber = document.createTextNode("#" + friendID);    // Create a text node
      let infoTextDiv = document.createElement("div");
      let infoTextDivS = document.createElement("div");

      let hr = document.createElement("hr");
      let newInfoText = document.createTextNode(`${friendQuestions[id]}`);    // Create a text node
      let newInfoTextS = document.createTextNode(`${friendQuestionsS[id]}`);    // Create a text node
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
      infoTextDivS.classList.add("infoTextDiv");

      infoTextDivS.lang = "es";
      infoTextDiv.lang = "en";


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
      infoTextDivS.appendChild(newInfoTextS);
      infoTextDivS.appendChild(hr);
      formDiv.appendChild(form);
      form.appendChild(textInput);
      form.appendChild(submitInput);
      closeModalBtnDiv.appendChild(closeModalBtn);

      friendModalDiv.insertBefore(formDiv, friendModalDiv.childNodes[0]);
      container.insertBefore(friendModalDiv, container.childNodes[0]);
      friendModalDiv.insertBefore(printTextDiv, friendModalDiv.childNodes[0]);
      friendModalDiv.insertBefore(infoTextDiv, friendModalDiv.childNodes[0]);
      friendModalDiv.insertBefore(infoTextDivS, friendModalDiv.childNodes[0]);
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
        // buildTwistMaterial(20.0)
        const friendShape = friendShapeGLTF.clone()
        friendMap[i] = friendShape;
        setupObject(friendShape, i, boxGroup, boxSpeeds, positionX, positionY, positionZ, rotationX, rotationY, rotationZ, 20);
      });

      jellyFishGLTFPromise.then((jelly) => {
        jellyfish[i] = jelly.clone();
      });

      flyingBoxes[i] = makeFlyingBoxes(positionX, positionY, positionZ);
      flyingSpheres[i] = makeFlyingSpheres(positionX, positionY, positionZ);

      friendOrbs[i] = sphereAtHeartOfFriend;

      setupObject(sphereAtHeartOfFriend, i, boxGroup, boxSpeeds, positionX, positionY, positionZ, rotationX, rotationY, rotationZ, 1);
      makeFriendModal(sphereAtHeartOfFriend.friendID, i);

    }

    scene.add(boxGroup);


    raycaster = new THREE.Raycaster();
    document.addEventListener('mousemove', onDocumentMouseMove);
    window.addEventListener('resize', onWindowResize);
  }

  function buildTwistMaterial(amount) {

    const material = new THREE.MeshNormalMaterial();
    material.opacity = 0.54;
    material.transparent = true;
    material.onBeforeCompile = function (shader) {

      shader.uniforms.time = { value: 0 };

      shader.vertexShader = 'uniform float time;\n' + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        [
          `float theta = sin( time + position.y ) / ${amount.toFixed(1)};`,
          'float c = cos(theta);',
          'float s = sin(theta);',
          'mat3 m = mat3(c, 0, s, 0, 1, 0, -s, 0, c);',
          'vec3 transformed = vec3(position) * m;',
          'vNormal = vNormal * m;'
        ].join('\n')
      );

      material.userData.shader = shader;

    };

    // Make sure WebGLRenderer doesnt reuse a single program

    material.customProgramCacheKey = function () {

      return amount;

    };

    return material;

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

  let submitUsernameS = document.getElementById("submitUsernameS");
  submitUsernameS.addEventListener(
    "click",
    function (event) {
      event.preventDefault();
      let currUsername = document.getElementById("usernameS").value;
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
          // console.log(j, snapshot.val());
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
    controls.update();
  }



  function render() {

    scene.traverse(function (child) {
      if (child.isMesh) {
        const shader = child.material.userData.shader;
        if (shader) {
          shader.uniforms.time.value = performance.now() / 1000;
        }
      }
    });
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
  function fadeFlyingThingsFromScene(things) {
    var exit = false;
    things.forEach(function (jelly) {
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

    if (exit == true) {
      things.forEach(function (jelly) {
        const parent = jelly.parent;
        parent.remove(jelly);
        modifyMesh(jelly, (o) => {
          o.material.opacity = 0.5;
        });
      });
    } else {
      setTimeout(fadeFlyingThingsFromScene, 200, things);
    }

  }

  function makeRotatingCreatures(flyingThings){
    flyingThings.forEach(function (box) {
      var setup = box.iHaveBeenSetup || false;
      if (setup == true) {
        boxGroup.add(box);
      } else {
        const rotation = mkGoodRotation();
        const position = mkGoodPosition();
        setupObject(box, 100, boxGroup, boxSpeeds, position.x, position.y, position.z, rotation.x, rotation.y, rotation.z, 30);
        box.iHaveBeenSetup = true;
      }
    });
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
      makeRotatingCreatures(jellyfish);
      fadeFlyingThingsFromScene(jellyfish);
      // skyBright = 0;
    }
    let intersectsRot2 = raycaster.intersectObjects([rot2], true);
    if (intersectsRot2.length > 0) {
      rot2Sound.play();
      rot2Sound.volume = 0.08;
      makeRotatingCreatures(flyingBoxes);
      fadeFlyingThingsFromScene(flyingBoxes);
    }
    let intersectsRot3 = raycaster.intersectObjects([rot3], true);
    if (intersectsRot3.length > 0) {
      rot3Sound.play();
      rot3Sound.volume = 0.08;
      makeRotatingCreatures(flyingSpheres);
      fadeFlyingThingsFromScene(flyingSpheres);
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

  document.addEventListener(
    "click",
    function (event) {
      if (toggleOpen == false) {
      } else {
        if (event.target.classList.contains(wrapper)) { // || event.target.contains( wrapper )
          console.log("clicking on wrapper or button - return");
        } else {
          console.log("clicking on world - run code");
        }
      }
    },
  );

  let settingsDropdown = document.getElementById("settingsDropdown");
  let toggleChangeNameInput = document.getElementById("toggleChangeNameInput");
  let toggleChangeNameInputS = document.getElementById("toggleChangeNameInputS");
  let settingsBtn = document.getElementById("settingsBtn");
  let changeNameInput = document.getElementById("changeNameInput");
  let changeNameSlider = document.getElementById("changeNameSlider");
  let changeNameForm = document.getElementById("changeNameForm");
  let changeNameFormS = document.getElementById("changeNameFormS");

  // let toggleSoundCheckbox = document.getElementById("toggleSoundCheckbox");

  function settingsMenuOpen(event) {
    // document.getElementById("wrapperBtn").classList.add("wrapperBtnOpening");
    settingsDropdown.classList.toggle("showDropdown");
    document.getElementsByClassName('slide-in')[0].classList.toggle('show');
    closeAllModals(event);
    // console.log("closeem");
    toggleChangeNameInput.value = `Change name, ${username}?`;
    toggleChangeNameInputS.value = `¿Quieres cambiar tu nombre, ${username}?`;
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
  toggleChangeNameInputS.onclick = expand;


  changeNameInput.onblur = function () {
    setTimeout(collapse, 100);
  }

  changeNameForm.onsubmit = function (e) {
    e.preventDefault();
    console.log(changeNameInput.value);
    localStorage.setItem('name', changeNameInput.value);
    username = nameDisplayCheck();

    document.getElementById("toggleChangeNameInput").value = `Change name, ${username}?`;
    document.getElementById("toggleChangeNameInputS").value = `¿Quieres cambiar tu nombre, ${username}?`;

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

  document.body.onload = nameDisplayCheck;

  // language

  var currentLanguage = 'es';
  function updateVisibility(lang, visibility) {
    document.querySelectorAll(`[lang="${lang}"]`).forEach((element) => {
      element.style.display = visibility;
    });
  }
  updateVisibility('en', 'none');
  updateVisibility('es', '');

  function handleLanguageUpdate(event) {
    event.preventDefault();
    if(currentLanguage == 'en') {
      updateVisibility('en', 'none');
      updateVisibility('es', '');
      currentLanguage = 'es';
    } else {
      updateVisibility('en', '');
      updateVisibility('es', 'none');
      currentLanguage = 'en';
    }
  }

  let toggleLanguage = document.getElementById("languageP");
  let toggleLanguageS = document.getElementById("languagePS");

  toggleLanguage.addEventListener('click', handleLanguageUpdate)
  toggleLanguageS.addEventListener('click', handleLanguageUpdate)

  // toggleSoundCheckbox.addEventListener('change', handleLanguageUpdate);

}

window.addEventListener("load", windowOnLoad);

