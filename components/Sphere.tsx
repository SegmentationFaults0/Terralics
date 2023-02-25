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
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import LoadingAnimation from "./LoadingAnimation";
import styles from "../styles/Sphere.module.css";

export default function Sphere() {
  const [loaded, setLoaded] = useState(false);
  let [clicked, setClicked] = useState(true);
  const mountRef = useRef<HTMLDivElement>(null);
  const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
  };
  const radius = 3;

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
      sizes.width / sizes.height,
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
    // [LATITUDE, LONGITUDE]
    const brussels = [50.85045, 4.34878];
    const newYork = [40.71427, -74.00597];
    const paris = [48.85341, 2.3488];
    const brazzaville = [-4.26613, 15.28318];
    const sanJose = [9.93333, -84.08333];
    const mumbai = [19.07283, 72.88261];
    const hoChiMinCity = [10.82302, 106.62965];
    const tokyo = [35.6895, 139.69171];
    const sydney = [-33.86785, 151.20732];
    const hawai = [19.6024, -155.52289];
    const cities = [
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

    const getCarthesian = (lat, lon) => {
      const phi = (90 - lat) * (Math.PI / 180),
        theta = (lon + 180) * (Math.PI / 180),
        x = -(radius * Math.sin(phi) * Math.cos(theta)),
        z = radius * Math.sin(phi) * Math.sin(theta),
        y = radius * Math.cos(phi);

      return new Vector3(x, y, z);
    };
    const placePinpoint = (lat, lon) => {
      let carthVector = getCarthesian(lat, lon);
      const pinpointGeometry = new SphereGeometry(0.05, 16, 16);
      const pinpointMaterial = new MeshBasicMaterial({
        color: 0xff0000,
      });
      const pinpointMesh = new Mesh(pinpointGeometry, pinpointMaterial);
      pinpointMesh.position.set(carthVector.x, carthVector.y, carthVector.z);
      scene.add(pinpointMesh);
      globe.add(pinpointMesh);
    };
    const placeAllpinpoints = () => {
      for (let i = 0; i < cities.length; i++) {
        placePinpoint(cities[i][0], cities[i][1]);
      }
    };
    placeAllpinpoints();

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
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    //document.body.appendChild(renderer.domElement);
    renderer.render(scene, camera);
    current.appendChild(domElement);

    // TODO: setClicked() werkt niet!
    renderer.domElement.addEventListener("click", () => {
      console.log("clicked");
      setClicked(true);
    });

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.enableZoom = false;

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
      if (!clicked) {
        globe.rotation.y = elapsed * 0.1;
      }
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
          <p className={styles.description}>press Z to zoom in</p>
        </div>
      ) : (
        <LoadingAnimation />
      )}
    </div>
  );
}
