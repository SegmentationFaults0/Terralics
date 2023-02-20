import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  SphereGeometry,
  MeshBasicMaterial,
  Mesh,
  PointLight,
  AmbientLight,
  Clock,
  LoadingManager,
  TextureLoader,
  useLoader,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import globeAlbedo from 'public/Albedo-diffuse.jpg';
import globeBumpMap from 'public/Bump.jpg';

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
  const globeTexture = textureLoader.load(globeAlbedo);
  const globeBump = textureLoader.load(globeBumpMap);
  loadingManager.onStart = () => {
    console.log('loading started');
  }
  loadingManager.onLoad = () => {
    console.log('loading finished');
  }
  loadingManager.onProgress = () => {
    console.log('loading progressing');
  }
  loadingManager.onError = () => {
    console.log('loading ERROR');
  }

  // Object
  const globeGeometry = new SphereGeometry(3, 64, 64);
  const globeMaterial = new MeshBasicMaterial({
    // wireframe: true,
    map: globeTexture,
    bumpMap: globeBump,
  });
  const globe = new Mesh(globeGeometry, globeMaterial);
  scene.add(globe);

  // Camera
  const camera = new PerspectiveCamera(
    45,
    sizes.width / sizes.height,
    0.1,
    110,
  );
  camera.position.z = 15;
  scene.add(camera);

  // Lighting
  const ambientLight = new AmbientLight(0xffffff, 1);
  scene.add(ambientLight);

  // Rendering
  const renderer = new WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  document.body.appendChild(renderer.domElement);
  renderer.render(scene, camera);

  // OrbitControls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.minPolarAngle = Math.PI / 2;
  controls.maxPolarAngle = Math.PI / 2;

  // PageResisingProblem-Solver 3000 v1 alpha beta pro max
  // TODO: werkt nog niet bij resize door middel van maximise-knop
  //Resize
  const updateResize = () => {
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    camera.updateProjectionMatrix()
    camera.aspect = sizes.width/sizes.height
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  }
  window.addEventListener('resize', () => {
    updateResize()
  })

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
