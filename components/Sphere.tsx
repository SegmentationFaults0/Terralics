import { useState, useRef, useEffect } from "react";
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
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import LoadingAnimation from "./LoadingAnimation";
import styles from "../styles/Sphere.module.css";
import { Z_NO_COMPRESSION } from "zlib";

export default function Sphere() {
  const [loaded, setLoaded] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const mountRef = useRef<HTMLDivElement>(null);
  const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  useEffect(() => {
    // Grab it here
    const { current } = mountRef;
    if (!current) {
      return;
    }
    const scene = new Scene();
    scene.background = null;

    // Loaders
    const loadingManager = new LoadingManager();
    const textureLoader = new TextureLoader(loadingManager);
    const globeTexture = textureLoader.load("/Albedo-diffuse.jpg");
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
    const globeGeometry = new SphereGeometry(3, 64, 64);
    const globeMaterial = new MeshStandardMaterial({
      // wireframe: true,
      map: globeTexture,
    });
    const globe = new Mesh(globeGeometry, globeMaterial);
    globe.visible = true;
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

    let glowIntensity = 0.8;
    let fragmentShader = [
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

    var uniforms = UniformsUtils.clone({});
    var glowMaterial = new ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      side: BackSide,
      blending: AdditiveBlending,
      transparent: true,
    });

    var glowMesh = new Mesh(globeGeometry, glowMaterial);
    glowMesh.scale.set(1.15, 1.15, 1.1);
    glowMesh.visible = true;
    scene.add(glowMesh);

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
    const light1 = new PointLight(0xf4e99b, 1, 100);
    light1.position.set(-10, 6, 16);
    light1.intensity = 1.8;
    scene.add(light1);
    camera.add(light1);
    const ambientLight = new AmbientLight(0xffffff, 0.1);
    scene.add(ambientLight);

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

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.enableZoom = false;

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

    // TODO: how to check if user has clicked?
    // TODO: how to handle zoom-button functions?

    const zoomIn = () => {
      const fov = getFov();
      camera.fov = clickZoom(fov, "zoomIn");
      camera.updateProjectionMatrix();
    };

    const zoomOut = () => {
      const fov = getFov();
      camera.fov = clickZoom(fov, "zoomOut");
      camera.updateProjectionMatrix();
    };
    const maxZoom = 20;
    const minZoom = 75;
    const zoomStep = 5;
    const clickZoom = (value, zoomType) => {
      if (value >= maxZoom && zoomType === "zoomIn") {
        return value - zoomStep;
      } else if (value <= minZoom && zoomType === "zoomOut") {
        return value + zoomStep;
      } else {
        return value;
      }
    };

    const getFov = () => {
      return Math.floor(
        (2 *
          Math.atan(camera.getFilmHeight() / 2 / camera.getFocalLength()) *
          180) /
          Math.PI
      );
    };

    const clock = new Clock();
    function animate() {
      const elapsed = clock.getElapsedTime();
      controls.update();
      if (!userInteracted) {
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
        <div className={styles.zoomcontainer}>
          <button className={styles.zoombutton} type="button" onClick={}>
            +
          </button>
          <button className={styles.zoombutton} type="button" onClick={}>
            -
          </button>
        </div>
      ) : (
        <LoadingAnimation />
      )}
    </div>
  );
}
