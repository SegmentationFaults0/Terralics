import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  SphereGeometry,
  MeshStandardMaterial,
  Mesh,
  Color,
  PointLight,
  AmbientLight,
} from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";

export default function Cube() {
  const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
  }
  
  const scene = new Scene();
  scene.background = new Color(0xffffff);

  //Camera
  const camera = new PerspectiveCamera(
    50,
    sizes.width / sizes.height,
    0.1,
    1000
  );
  camera.position.z = 5;
  scene.add(camera);

  //Lighting
  const light = new PointLight(0xffffff, 1, 100);
  light.position.set(0, 5, 5);
  light.intensity = 1.25;
  scene.add(light);
  const ambient = new AmbientLight(0xffffff);
  scene.add(ambient);

  //Rendering
  const renderer = new WebGLRenderer();
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(2);
  renderer.render(scene, camera);
  document.body.appendChild(renderer.domElement);

  //Object
  const geometry = new SphereGeometry(1, 32, 32);
  const material = new MeshStandardMaterial({ color: 0x9900cc, wireframe: true });
  const cube = new Mesh(geometry, material);
  scene.add(cube);

  //OrbitControls
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.enablePan = false
  controls.enableZoom = false

  //PageResisingProblem-Solver 3000 v1 alpha beta pro max
  //TODO: werkt nog niet bij resize door middel van windows-knop
  window.addEventListener('resize', () => {
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    camera.updateProjectionMatrix()
    camera.aspect = sizes.width/sizes.height
    renderer.setSize(sizes.width, sizes.height)
  })

  //TODO: vaste framerate?
  function animate() {
    controls.update();
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  return <></>;
}
