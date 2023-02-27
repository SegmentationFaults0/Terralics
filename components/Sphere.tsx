import { useState, useRef, useEffect, startTransition } from "react";
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
  UniformsUtils,
  ShaderMaterial,
  BackSide,
  AdditiveBlending,
  MeshPhongMaterial,
  Vector3,
  MeshBasicMaterial,
  Group,
  Vector2,
  Raycaster,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import LoadingAnimation from "./LoadingAnimation";
import styles from "../styles/Sphere.module.css";
import {
  CSS2DRenderer,
  CSS2DObject,
} from "three/examples/jsm/renderers/CSS2DRenderer";
import { create } from "domain";

// [LATITUDE, LONGITUDE]
const brussels = [50.85045, 4.34878, "Brussels"];
const newYork = [40.71427, -74.00597, "New York"];
const paris = [48.85341, 2.3488, "Paris"];
const brazzaville = [-4.26613, 15.28318, "Brazzaville"];
const sanJose = [9.93333, -84.08333, "San José"];
const mumbai = [19.07283, 72.88261, "Mumbai"];
const hoChiMinCity = [10.82302, 106.62965, "Ho Chi Min City"];
const tokyo = [35.6895, 139.69171, "Tokyo"];
const sydney = [-33.86785, 151.20732, "Sydney"];
const hawai = [19.6024, -155.52289, "Hawaï"];
const points = [
  brussels,
  newYork,
  paris,
  brazzaville,
  sanJose,
  mumbai,
  hoChiMinCity,
  tokyo,
  sydney,
  hawai,
];

export default function Sphere() {
  const [loaded, setLoaded] = useState(false);
  let [clicked, setClicked] = useState(true);
  const mountRef = useRef<HTMLDivElement>(null);
  const radius = 3;
  const textRadius = 3.2;

  useEffect(() => {
    const { current } = mountRef;

    const scene = new Scene();
    scene.background = null;

    // Loaders
    const loadingManager = new LoadingManager();
    const textureLoader = new TextureLoader(loadingManager);
    const globeTexture = textureLoader.load("/textureTerralics.png");
    const stars = textureLoader.load("/stars.png");
    loadingManager.onStart = () => {
      console.log("loading started");
    };
    loadingManager.onLoad = () => {
      console.log("loading finished");
      setLoaded(true);
    };
    loadingManager.onProgress = () => {
      console.log("loading progressing");
    };
    loadingManager.onError = () => {
      console.log("loading ERROR");
    };
    // Object
    const globeGeometry = new SphereGeometry(radius, 64, 64);
    const globeMaterial = new MeshStandardMaterial({
      // wireframe: true,
      map: globeTexture,
    });
    const globe = new Mesh(globeGeometry, globeMaterial);
    globe.visible = true;
    scene.add(globe);

    // Custom shader for outer glow V1
    const vertexShader = [
      "varying vec3 vNormal;",
      "varying vec3 vPosition;",
      "void main() {",
      "vNormal = normalize( normalMatrix * normal );",

      "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
      "vPosition = gl_Position.xyz;",
      "}",
    ].join("\n");

    const glowIntensity = 0.8;
    const fragmentShader = [
      "varying vec3 vNormal;",
      "varying vec3 vPosition;",

      "void main() {",
      "vec3 lightPosition = vec3(-10.0, 6.0, 16);",
      "vec3 lightDirection = normalize(lightPosition - vPosition);",
      "float dotNL = clamp(dot(lightDirection, vNormal), 0.0, 1.0);",
      `float intensity = pow( ${glowIntensity} - dot( vNormal, vec3( 0, 0, 1.0 ) ), 12.0 );`,
      "gl_FragColor = vec4(0.64, 0.85, 0.85, 1.0) * intensity * dotNL;",
      "}",
    ].join("\n");

    const uniforms = UniformsUtils.clone({});
    const glowMaterial = new ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      side: BackSide,
      blending: AdditiveBlending,
      transparent: true,
    });

    const glowMesh = new Mesh(globeGeometry, glowMaterial);
    glowMesh.scale.set(1.15, 1.15, 1.1);
    glowMesh.visible = true;
    scene.add(glowMesh);

    // Skybox
    var geometry = new SphereGeometry(100, 90, 50);
    var material = new MeshPhongMaterial({
      map: stars,
      shininess: 100,
      transparent: true,
      side: BackSide,
      blending: AdditiveBlending,
      depthWrite: false,
    });

    var sphere = new Mesh(geometry, material);
    scene.add(sphere);

    // Camera
    const camera = new PerspectiveCamera(
      47.5,
      window.innerWidth / window.innerHeight,
      0.1,
      110
    );
    camera.position.set(0, 1, 10);
    scene.add(camera);

    // Lighting
    const light1 = new PointLight(0xf3edba, 1, 100);
    light1.position.set(-10, 6, 16);
    light1.intensity = 1;
    scene.add(light1);
    camera.add(light1);
    const ambientLight = new AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    // Coordinaten-mapper
    const getCarthesian = (lat, lon, r) => {
      const phi = (90 - lat) * (Math.PI / 180),
        theta = (lon + 180) * (Math.PI / 180),
        x = -(r * Math.sin(phi) * Math.cos(theta)),
        z = r * Math.sin(phi) * Math.sin(theta),
        y = r * Math.cos(phi);

      return new Vector3(x, y, z);
    };
    const createPOIMesh = (infoShort, vector) => {
      const geo = new SphereGeometry(0.05);
      const mat = new MeshBasicMaterial({ color: 0xff0000 });
      const mesh = new Mesh(geo, mat);
      mesh.position.set(vector.x, vector.y, vector.z);
      mesh.name = infoShort;
      return mesh;
    };
    const POIGroup = new Group();
    const drawPOI = (points) => {
      for (let i = 0; i < points.length; i++) {
        let POI = createPOIMesh(
          points[i][2],
          getCarthesian(points[i][0], points[i][1], radius)
        );
        POIGroup.add(POI);
      }
      scene.add(POIGroup);
    };
    drawPOI(points);

    const p = document.createElement("p");
    p.className = "label";
    const pContainer = document.createElement("div");
    pContainer.appendChild(p);
    const pointLabel = new CSS2DObject(pContainer);
    scene.add(pointLabel);

    const mousePos = new Vector2();
    const raycaster = new Raycaster();

    window.addEventListener("mousemove", (e) => {
      mousePos.x = (e.clientX / window.innerWidth) * 2 - 1;
      mousePos.y = -(e.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mousePos, camera);
      const intersects = raycaster.intersectObject(POIGroup);
      if (intersects.length > 0) {
        for (let i = 0; i < points.length; i++) {
          if (intersects[0].object.name == points[i][2]) {
            p.className = "label show";
            const pos = getCarthesian(points[i][0], points[i][1], textRadius);
            pointLabel.position.set(pos.x, pos.y, pos.z);
            p.textContent = points[i][2].toString();
          } else {
            p.className = "label hide";
          }
        }
      }
    });

    // Labels
    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.domElement.style.position = "absolute";
    labelRenderer.domElement.style.top = "0px";
    labelRenderer.domElement.style.pointerEvents = "none";
    document.body.appendChild(labelRenderer.domElement);

    // Zoom controls
    window.addEventListener("keypress", (e) => {
      if (e.key.toLowerCase() === "z") {
        camera.zoom = 2;
        camera.updateProjectionMatrix();
      } else {
        if (e.key.toLowerCase() === "e") {
          camera.zoom = 1;
          camera.updateProjectionMatrix();
        }
      }
    });

    // Rendering
    const renderer = new WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    const { domElement } = renderer;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    //document.body.appendChild(renderer.domElement);
    renderer.render(scene, camera);
    current.appendChild(domElement);

    // TODO: setClicked() werkt niet!
    renderer.domElement.addEventListener("click", () => {
      setClicked(true);
    });

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.enableZoom = false;

    //Resize
    const updateResize = () => {
      camera.updateProjectionMatrix();
      camera.aspect = window.innerWidth / window.innerHeight;
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      labelRenderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", () => {
      updateResize();
    });

    const clock = new Clock();
    function animate() {
      const elapsed = clock.getElapsedTime();
      controls.update();
      if (!clicked) {
        globe.rotation.y = elapsed * 0.1;
      }
      labelRenderer.render(scene, camera);
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    animate();

    return () => {
      current.removeChild(domElement);
    };
  }, []);

  return (
    <div ref={mountRef}>
      {loaded ? (
        <div className={styles.legende}>
          <p className={styles.description}>press Z to zoom in</p>
          <p className={styles.description}>press E to zoom out</p>
        </div>
      ) : (
        <LoadingAnimation />
      )}
    </div>
  );
}
