import * as THREE from "three";

function createAsphaltTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#15171b";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 2400; i += 1) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const shade = 18 + Math.random() * 18;
    ctx.fillStyle = `rgba(${shade}, ${shade + 1}, ${shade + 3}, ${0.16 + Math.random() * 0.2})`;
    ctx.fillRect(x, y, Math.random() * 4 + 1, Math.random() * 4 + 1);
  }

  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(210, 90);
  ctx.lineTo(210, 940);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(814, 90);
  ctx.lineTo(814, 940);
  ctx.stroke();

  ctx.strokeStyle = "rgba(255,182,106,0.28)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(512, 120);
  ctx.lineTo(512, 900);
  ctx.stroke();

  for (let i = 0; i < 7; i += 1) {
    const w = 80 + Math.random() * 140;
    const h = 40 + Math.random() * 90;
    const x = Math.random() * (canvas.width - w);
    const y = Math.random() * (canvas.height - h);
    const grad = ctx.createRadialGradient(x + w / 2, y + h / 2, 20, x + w / 2, y + h / 2, Math.max(w, h));
    grad.addColorStop(0, "rgba(255,160,90,0.12)");
    grad.addColorStop(1, "rgba(255,160,90,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, w, h);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4.5, 4.5);
  texture.anisotropy = 8;
  return texture;
}

function createWallTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#171411";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 70; i += 1) {
    const x = (canvas.width / 70) * i;
    ctx.strokeStyle = i % 2 === 0 ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.15)";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(255,122,24,0.16)";
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.moveTo(120, 320);
  ctx.lineTo(280, 250);
  ctx.lineTo(380, 310);
  ctx.stroke();

  ctx.strokeStyle = "rgba(123, 207, 255, 0.14)";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(690, 180);
  ctx.lineTo(850, 130);
  ctx.lineTo(930, 190);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2.6, 1.8);
  return texture;
}

function createSmokeTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  const grad = ctx.createRadialGradient(128, 128, 10, 128, 128, 120);
  grad.addColorStop(0, "rgba(255,255,255,0.75)");
  grad.addColorStop(0.45, "rgba(200,200,200,0.35)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(canvas);
}

function createLamp(color, position, targetPosition) {
  const lampGroup = new THREE.Group();
  lampGroup.position.copy(position);

  const cap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.64, 0.18, 18),
    new THREE.MeshStandardMaterial({
      color: 0x11151b,
      metalness: 0.9,
      roughness: 0.26
    })
  );
  lampGroup.add(cap);

  const bulb = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.26, 0.1, 12),
    new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 2.8
    })
  );
  bulb.position.y = -0.09;
  lampGroup.add(bulb);

  const light = new THREE.SpotLight(color, 55, 22, 0.44, 0.55, 1.3);
  light.position.copy(position);
  light.target.position.copy(targetPosition);
  light.castShadow = true;
  light.shadow.mapSize.width = 512;
  light.shadow.mapSize.height = 512;

  return { lampGroup, light };
}

function buildEnvironment(scene) {
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(42, 42),
    new THREE.MeshStandardMaterial({
      map: createAsphaltTexture(),
      color: 0x131519,
      metalness: 0.58,
      roughness: 0.82
    })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const wallMaterial = new THREE.MeshStandardMaterial({
    map: createWallTexture(),
    color: 0x1b1815,
    metalness: 0.5,
    roughness: 0.84
  });

  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(24, 8), wallMaterial);
  backWall.position.set(0, 3.6, -8.6);
  scene.add(backWall);

  const sideWallLeft = new THREE.Mesh(new THREE.PlaneGeometry(11, 7.5), wallMaterial);
  sideWallLeft.position.set(-8.4, 3.4, -4.6);
  sideWallLeft.rotation.y = Math.PI / 2;
  scene.add(sideWallLeft);

  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(18, 0.24, 13),
    new THREE.MeshStandardMaterial({
      color: 0x0f1217,
      metalness: 0.86,
      roughness: 0.3
    })
  );
  roof.position.set(-0.3, 6.05, -2.6);
  roof.receiveShadow = true;
  scene.add(roof);

  for (let i = 0; i < 5; i += 1) {
    const beam = new THREE.Mesh(
      new THREE.BoxGeometry(18, 0.15, 0.2),
      new THREE.MeshStandardMaterial({
        color: 0x1a1d23,
        metalness: 0.88,
        roughness: 0.24
      })
    );
    beam.position.set(-0.3, 5.72, -7.7 + i * 2.4);
    scene.add(beam);
  }

  [
    [-7.6, 2.75, -7.1],
    [7.6, 2.75, -7.1],
    [-7.6, 2.75, 1.5],
    [7.6, 2.75, 1.5],
    [-2.2, 2.75, -7.1],
    [2.6, 2.75, -7.1]
  ].forEach(([x, y, z]) => {
    const column = new THREE.Mesh(
      new THREE.BoxGeometry(0.34, 5.5, 0.34),
      new THREE.MeshStandardMaterial({
        color: 0x11151b,
        metalness: 0.9,
        roughness: 0.22
      })
    );
    column.position.set(x, y, z);
    column.castShadow = true;
    column.receiveShadow = true;
    scene.add(column);
  });

  const lamps = [
    createLamp(0xffc07a, new THREE.Vector3(-4.6, 5.3, -4.4), new THREE.Vector3(-4.6, 0, -3.8)),
    createLamp(0xffc07a, new THREE.Vector3(0.4, 5.3, -4.2), new THREE.Vector3(0.2, 0, -2.6)),
    createLamp(0xffc07a, new THREE.Vector3(5.2, 5.3, -3.8), new THREE.Vector3(4.8, 0, -2.2))
  ];
  lamps.forEach(({ lampGroup, light }) => {
    scene.add(lampGroup, light, light.target);
  });

  const cityGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 10),
    new THREE.MeshBasicMaterial({
      color: 0xff8c42,
      transparent: true,
      opacity: 0.12
    })
  );
  cityGlow.position.set(0, 3.8, 8.8);
  cityGlow.rotation.y = Math.PI;
  scene.add(cityGlow);

  const hazeTexture = createSmokeTexture();
  const hazePositions = [
    [-2.4, 0.55, 4.6, 5.2],
    [3.2, 0.7, 3.8, 4.1],
    [6.1, 0.65, -1.4, 3.6]
  ];

  hazePositions.forEach(([x, y, z, scale]) => {
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: hazeTexture,
        color: 0xd8d8d8,
        opacity: 0.34,
        transparent: true,
        depthWrite: false
      })
    );
    sprite.position.set(x, y, z);
    sprite.scale.set(scale, scale * 0.65, 1);
    scene.add(sprite);
  });
}

function buildFaceMetrics(textures) {
  const tallestImage = Math.max(...textures.map((texture) => texture.image.height));
  const worldScale = 3 / tallestImage;

  return textures.map((texture) => {
    const photoWidth = texture.image.width * worldScale;
    const photoHeight = texture.image.height * worldScale;
    const frameWidth = photoWidth + 0.28;
    const frameHeight = photoHeight + 0.28;

    return {
      photoWidth,
      photoHeight,
      frameWidth,
      frameHeight,
      finDepth: Math.max(0.92, frameWidth * 0.42),
      visorDepth: Math.max(0.74, frameWidth * 0.36)
    };
  });
}

function createHub(faceMetrics) {
  const screenCount = faceMetrics.length;
  const hub = new THREE.Group();
  const step = (Math.PI * 2) / screenCount;
  const maxFrameWidth = Math.max(...faceMetrics.map((metric) => metric.frameWidth));
  const maxFrameHeight = Math.max(...faceMetrics.map((metric) => metric.frameHeight));
  const faceRadius = maxFrameWidth / (2 * Math.tan(Math.PI / screenCount)) + 0.62;
  const faceHeight = maxFrameHeight + 0.6;
  const outerRadius = faceRadius + 0.34;
  const topRadius = faceRadius + 0.14;

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(outerRadius + 0.44, outerRadius + 0.7, 0.48, screenCount),
    new THREE.MeshStandardMaterial({
      color: 0x11161d,
      metalness: 0.92,
      roughness: 0.22
    })
  );
  base.position.y = 0.22;
  base.rotation.y = step / 2;
  base.castShadow = true;
  base.receiveShadow = true;
  hub.add(base);

  const lowerShell = new THREE.Mesh(
    new THREE.CylinderGeometry(outerRadius, outerRadius + 0.08, faceHeight * 0.54, screenCount),
    new THREE.MeshStandardMaterial({
      color: 0x13161d,
      metalness: 0.88,
      roughness: 0.22,
      emissive: 0x110804,
      emissiveIntensity: 0.25
    })
  );
  lowerShell.position.y = faceHeight * 0.27 + 0.34;
  lowerShell.rotation.y = step / 2;
  lowerShell.castShadow = true;
  lowerShell.receiveShadow = true;
  hub.add(lowerShell);

  const upperShell = new THREE.Mesh(
    new THREE.CylinderGeometry(topRadius, outerRadius, faceHeight * 0.52, screenCount),
    new THREE.MeshStandardMaterial({
      color: 0x0f141b,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0x130904,
      emissiveIntensity: 0.18
    })
  );
  upperShell.position.y = faceHeight * 0.76 + 0.34;
  upperShell.rotation.y = step / 2;
  upperShell.castShadow = true;
  upperShell.receiveShadow = true;
  hub.add(upperShell);

  const topCap = new THREE.Mesh(
    new THREE.CylinderGeometry(topRadius - 0.12, topRadius, 0.3, screenCount),
    new THREE.MeshStandardMaterial({
      color: 0x0f131a,
      metalness: 0.92,
      roughness: 0.18
    })
  );
  topCap.position.y = faceHeight + 0.5;
  topCap.rotation.y = step / 2;
  hub.add(topCap);

  const crown = new THREE.Mesh(
    new THREE.CylinderGeometry(topRadius - 0.34, topRadius - 0.08, 0.18, screenCount),
    new THREE.MeshStandardMaterial({
      color: 0x1a1f27,
      metalness: 0.96,
      roughness: 0.14
    })
  );
  crown.position.y = faceHeight + 0.72;
  crown.rotation.y = step / 2;
  hub.add(crown);

  const neonRing = new THREE.Mesh(
    new THREE.TorusGeometry(outerRadius + 0.58, 0.06, 16, 72),
    new THREE.MeshStandardMaterial({
      color: 0x252e38,
      emissive: 0xff7a18,
      emissiveIntensity: 0.34,
      metalness: 0.95,
      roughness: 0.16
    })
  );
  neonRing.rotation.x = Math.PI / 2;
  neonRing.position.y = 0.62;
  hub.add(neonRing);

  const edgeMaterial = new THREE.LineBasicMaterial({
    color: 0xffa35a,
    transparent: true,
    opacity: 0.34
  });

  [lowerShell, upperShell].forEach((mesh) => {
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), edgeMaterial);
    edges.position.copy(mesh.position);
    edges.rotation.copy(mesh.rotation);
    hub.add(edges);
  });

  return { hub, faceRadius, faceHeight, step, neonRing };
}

async function loadTextures(renderer, screens) {
  const loader = new THREE.TextureLoader();
  const anisotropy = renderer.capabilities.getMaxAnisotropy();

  return Promise.all(
    screens.map(async (screen) => {
      const texture = await loader.loadAsync(screen.image);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = anisotropy;
      return texture;
    })
  );
}

function buildFaces({ hub, screens, textures, faceRadius, step, faceMetrics }) {
  const faces = [];

  textures.forEach((texture, index) => {
    const metrics = faceMetrics[index];
    const angle = step * index;
    const normal = new THREE.Vector3(Math.sin(angle), 0, Math.cos(angle));
    const tangent = new THREE.Vector3(normal.z, 0, -normal.x);
    const center = new THREE.Vector3(normal.x * faceRadius, metrics.frameHeight / 2 + 0.48, normal.z * faceRadius);

    const faceGroup = new THREE.Group();
    faceGroup.position.copy(center);
    faceGroup.rotation.y = angle;

    const frameMaterial = new THREE.MeshStandardMaterial({
      color: 0x14181f,
      metalness: 0.94,
      roughness: 0.18,
      emissive: 0x000000,
      emissiveIntensity: 0
    });

    const photoMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0.92,
      toneMapped: false
    });

    const borderThickness = 0.09;
    const borderDepth = 0.13;

    const topBorder = new THREE.Mesh(new THREE.BoxGeometry(metrics.frameWidth, borderThickness, borderDepth), frameMaterial);
    topBorder.position.y = metrics.frameHeight / 2 - borderThickness / 2;
    topBorder.castShadow = true;
    topBorder.receiveShadow = true;
    faceGroup.add(topBorder);

    const bottomBorder = topBorder.clone();
    bottomBorder.position.y = -metrics.frameHeight / 2 + borderThickness / 2;
    faceGroup.add(bottomBorder);

    const sideBorderHeight = metrics.frameHeight - borderThickness * 2;

    const leftBorder = new THREE.Mesh(new THREE.BoxGeometry(borderThickness, sideBorderHeight, borderDepth), frameMaterial);
    leftBorder.position.x = -metrics.frameWidth / 2 + borderThickness / 2;
    leftBorder.castShadow = true;
    leftBorder.receiveShadow = true;
    faceGroup.add(leftBorder);

    const rightBorder = leftBorder.clone();
    rightBorder.position.x = metrics.frameWidth / 2 - borderThickness / 2;
    faceGroup.add(rightBorder);

    const photo = new THREE.Mesh(new THREE.PlaneGeometry(metrics.photoWidth, metrics.photoHeight), photoMaterial);
    photo.position.z = 0.073;
    faceGroup.add(photo);

    const leftFin = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, Math.max(0.82, metrics.frameHeight - 0.18), metrics.finDepth),
      new THREE.MeshStandardMaterial({
        color: 0x0b0d11,
        metalness: 0.9,
        roughness: 0.22
      })
    );
    leftFin.position.set(-(metrics.frameWidth / 2 + 0.05), 0, -metrics.finDepth * 0.26);
    leftFin.rotation.y = 0.9;
    faceGroup.add(leftFin);

    const rightFin = leftFin.clone();
    rightFin.position.x = metrics.frameWidth / 2 + 0.05;
    rightFin.rotation.y = -0.9;
    faceGroup.add(rightFin);

    const topVisor = new THREE.Mesh(
      new THREE.BoxGeometry(metrics.frameWidth * 0.76, 0.12, metrics.visorDepth),
      new THREE.MeshStandardMaterial({
        color: 0x0a0c10,
        metalness: 0.92,
        roughness: 0.18
      })
    );
    topVisor.position.set(0, metrics.frameHeight / 2 - 0.06, -metrics.visorDepth * 0.22);
    topVisor.rotation.x = 0.32;
    faceGroup.add(topVisor);

    const lightBar = new THREE.Mesh(
      new THREE.BoxGeometry(metrics.frameWidth * 0.66, 0.05, 0.04),
      new THREE.MeshStandardMaterial({
        color: 0xffb075,
        emissive: 0xff7a18,
        emissiveIntensity: 1.3
      })
    );
    lightBar.position.set(0, metrics.frameHeight / 2 - 0.14, 0.09);
    faceGroup.add(lightBar);

    hub.add(faceGroup);

    faces.push({
      screen: screens[index],
      group: faceGroup,
      frameMaterial,
      photoMaterial,
      lightBarMaterial: lightBar.material,
      normal,
      tangent,
      center,
      metrics
    });
  });

  return faces;
}

export async function createScene({ mount, screens }) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
  renderer.setSize(mount.clientWidth, mount.clientHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  mount.append(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x07080b, 0.048);

  const camera = new THREE.PerspectiveCamera(30, mount.clientWidth / mount.clientHeight, 0.1, 100);
  const currentLookAt = new THREE.Vector3(0, 2.2, 0);
  const targetLookAt = new THREE.Vector3(0, 2.2, 0);
  const targetCameraPosition = new THREE.Vector3(0, 2.42, 10.6);
  let targetFov = 30;

  const ambient = new THREE.AmbientLight(0x9f8268, 1.25);
  scene.add(ambient);

  const skyLight = new THREE.HemisphereLight(0x7ccfff, 0x221810, 0.85);
  scene.add(skyLight);

  const warmPoint = new THREE.PointLight(0xff6e21, 28, 20, 2);
  warmPoint.position.set(6.6, 2.8, 4.1);
  scene.add(warmPoint);

  const coolPoint = new THREE.PointLight(0x7bcfff, 18, 18, 2);
  coolPoint.position.set(-7.2, 3.4, -2.6);
  scene.add(coolPoint);

  buildEnvironment(scene);

  const hubRoot = new THREE.Group();
  hubRoot.position.set(0.44, -0.26, -2.18);
  scene.add(hubRoot);

  const textures = await loadTextures(renderer, screens);
  const faceMetrics = buildFaceMetrics(textures);
  const hubData = createHub(faceMetrics);
  hubRoot.add(hubData.hub);
  const faces = buildFaces({ hub: hubData.hub, screens, textures, faceRadius: hubData.faceRadius, step: hubData.step, faceMetrics });

  function updateTargetForScreen(index) {
    const face = faces[index];
    const view = face.screen.view;
    const restrainedDistance = Math.max(view.distance, 6.05 + face.metrics.frameWidth * 0.14);
    const restrainedSide = THREE.MathUtils.clamp(view.side * 0.66, -0.72, 0.72);
    const restrainedFov = THREE.MathUtils.clamp(view.fov, 29.8, 31.6);
    const base = hubRoot.position.clone().add(face.center);
    const position = base
      .clone()
      .add(face.normal.clone().multiplyScalar(restrainedDistance))
      .add(face.tangent.clone().multiplyScalar(restrainedSide));
    position.y = view.height - 0.08;

    const lookAt = hubRoot.position
      .clone()
      .add(face.center.clone().multiplyScalar(0.98))
      .add(face.tangent.clone().multiplyScalar(view.lookSide * 0.56));
    lookAt.y = view.lookHeight - 0.1;

    targetCameraPosition.copy(position);
    targetLookAt.copy(lookAt);
    targetFov = restrainedFov;
  }

  const clock = new THREE.Clock();
  let activeIndex = 0;
  let frameId = 0;

  function resize() {
    camera.aspect = mount.clientWidth / mount.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(mount.clientWidth, mount.clientHeight);
  }

  function animate() {
    frameId = window.requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

    camera.position.lerp(targetCameraPosition, 0.034);
    currentLookAt.lerp(targetLookAt, 0.04);
    camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, 0.035);
    camera.updateProjectionMatrix();
    camera.lookAt(currentLookAt);

    hubData.neonRing.rotation.z += 0.0018;

    faces.forEach((face, index) => {
      const isActive = index === activeIndex;
      const targetScale = isActive ? 1.04 : 1;
      const targetGlow = isActive ? 0.66 : 0.05;
      const targetPhoto = isActive ? 1 : 0.9;
      const targetBar = isActive ? 2.6 : 0.8;

      face.group.scale.x = THREE.MathUtils.lerp(face.group.scale.x, targetScale, 0.09);
      face.group.scale.y = THREE.MathUtils.lerp(face.group.scale.y, targetScale, 0.09);
      face.group.scale.z = THREE.MathUtils.lerp(face.group.scale.z, targetScale, 0.09);
      face.frameMaterial.emissiveIntensity = THREE.MathUtils.lerp(face.frameMaterial.emissiveIntensity, targetGlow, 0.09);
      face.photoMaterial.opacity = THREE.MathUtils.lerp(face.photoMaterial.opacity, targetPhoto, 0.09);
      face.lightBarMaterial.emissiveIntensity = THREE.MathUtils.lerp(face.lightBarMaterial.emissiveIntensity, targetBar, 0.09);
    });

    warmPoint.position.x = 6.6 + Math.sin(elapsed * 0.4) * 0.3;
    coolPoint.position.z = -2.6 + Math.cos(elapsed * 0.35) * 0.25;

    renderer.render(scene, camera);
  }

  function focusScreen(index) {
    activeIndex = index;
    updateTargetForScreen(index);
  }

  window.addEventListener("resize", resize);
  resize();
  focusScreen(0);
  animate();

  return {
    focusScreen,
    dispose() {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      renderer.dispose();
      mount.innerHTML = "";
    }
  };
}
