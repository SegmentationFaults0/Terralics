import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  BoxGeometry,
  MeshBasicMaterial,
  Mesh,
  Color,
} from "three";

export default function Cube() {
  const scene = new Scene();
  scene.background = new Color(null);
  const camera = new PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  const renderer = new WebGLRenderer( {alpha: true} );
  renderer.setSize(0.75 * window.innerWidth, 0.75 * window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const geometry = new BoxGeometry(1, 1, 1);
  const material = new MeshBasicMaterial({ color: "rgb(236, 249, 255)" });
  const cube = new Mesh(geometry, material);
  scene.add(cube);

  camera.position.z = 5;

  function animate() {
    requestAnimationFrame(animate);
    cube.rotation.x += 0.005;
    cube.rotation.y += 0.005;
    renderer.render(scene, camera);
  }
  animate();

  return <></>;
}
