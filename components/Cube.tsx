import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  SphereGeometry,
  MeshStandardMaterial,
  Mesh,
  PointLight,
  AmbientLight,
  Clock,
  LoadingManager,
  TextureLoader,
  useLoader,
  UniformsUtils,
  ShaderMaterial,
  BackSide,
  AdditiveBlending,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default function Cube() {
  const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  const scene = new Scene();
  scene.background = null;

  // Loaders
  const loadingManager = new LoadingManager();
  const textureLoader = new TextureLoader(loadingManager);
  const globeTexture = textureLoader.load("/textures/earth-day.jpg");
  const globeBump = textureLoader.load("/textures/earth-topology.png");
  loadingManager.onStart = () => {
    console.log("loading started");
  };
  loadingManager.onLoad = () => {
    console.log("loading finished");
  };
  loadingManager.onProgress = () => {
    console.log("loading progressing");
  };
  loadingManager.onError = () => {
    console.log("loading ERROR");
  };

  // Object
  const globeGeometry = new SphereGeometry(3, 64, 64);
  const globeMaterial = new MeshStandardMaterial({
    // wireframe: true,
    map: globeTexture,
    //bumpMap: globeBump,
  });
  const globe = new Mesh(globeGeometry, globeMaterial);
  scene.add(globe);

  // Custom shader for outer glow V1
  let vertexShader = [
    "varying vec3 vNormal;",
    "varying vec3 vPosition;",
    "void main() {",
    "vNormal = normalize( normalMatrix * normal );",

    "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
    "vPosition = gl_Position.xyz;",
    "}",
  ].join("\n");

  let glowIntensity = 0.85;
  let fragmentShader = [
    "varying vec3 vNormal;",
    "varying vec3 vPosition;",

    "void main() {",
    "vec3 lightPosition = vec3(-10.0, 10.0, 0.0);",
    "vec3 lightDirection = normalize(lightPosition - vPosition);",
    "float dotNL = clamp(dot(lightDirection, vNormal), 0.0, 1.0);",
    `float intensity = pow( ${glowIntensity} - dot( vNormal, vec3( 0, 0, 1.0 ) ), 12.0 );`,
    "gl_FragColor = vec4(0.64, 0.85, 0.85, 1.0) * intensity * dotNL;",
    "}",
  ].join("\n");

  var uniforms = UniformsUtils.clone({});
  var material = new ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    side: BackSide,
    blending: AdditiveBlending,
    transparent: true,
  });

  var glowMesh = new Mesh(globeGeometry, material);
  glowMesh.scale.set(1.09, 1.09, 1.09);
  scene.add(glowMesh);

  // Camera
  const camera = new PerspectiveCamera(
    45,
    sizes.width / sizes.height,
    0.1,
    110
  );
  camera.position.x = 0;
  camera.position.y = 1;
  camera.position.z = 15;
  scene.add(camera);

  // Lighting
  let light1Offset = [-10, 5, 1]; // TODO: is toch gewoon light - camera pos?
  const light1 = new PointLight(0xffffff, 1, 100);
  light1.position.set(-10, 6, 16);
  light1.intensity = 1.7;
  scene.add(light1);
  const ambientLight = new AmbientLight(0xffffff, 0.1);
  scene.add(ambientLight);

  // Rendering
  const renderer = new WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  document.body.appendChild(renderer.domElement);
  renderer.render(scene, camera);

  // OrbitControls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.enableZoom = false;
  // controls.minPolarAngle = Math.PI / 2;
  // controls.maxPolarAngle = Math.PI / 2;
  controls.addEventListener("change", light_update);
  function light_update() {
    light1.position.copy(camera.position);
  }

  // PageResisingProblem-Solver 3000 v1 alpha beta pro max
  // TODO: werkt nog niet bij resize door middel van maximise-knop
  //Resize
  const updateResize = () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    camera.updateProjectionMatrix();
    camera.aspect = sizes.width / sizes.height;
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  };
  window.addEventListener("resize", () => {
    updateResize();
  });

  const clock = new Clock();
  function animate() {
    const elapsed = clock.getElapsedTime();
    controls.update();
    globe.rotation.y = elapsed * 0.1;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  return <></>;
}
