import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";

export default function BlueCorePod() {
  const mountRef = useRef(null);
  const [label, setLabel] = useState(
    "Rotate, scroll to zoom. Hover the numbered markers to learn each part."
  );

  useEffect(() => {
    const mount = mountRef.current;
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b2e33);
    scene.fog = new THREE.Fog(0x0b2e33, 14, 34);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(9, 6, 10);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // Lights
    const hemi = new THREE.HemisphereLight(0xbfe8dc, 0x0b2e33, 1.1);
    scene.add(hemi);
    const key = new THREE.DirectionalLight(0xffffff, 1.1);
    key.position.set(6, 10, 4);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xe8b75d, 0.5);
    rim.position.set(-6, 3, -6);
    scene.add(rim);

    // ---- Ocean plane ----
    const waterGeo = new THREE.PlaneGeometry(60, 60, 60, 60);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0f5f66,
      transparent: true,
      opacity: 0.55,
      roughness: 0.35,
      metalness: 0.1,
      side: THREE.DoubleSide,
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.y = 0;
    scene.add(water);
    const waterPos = waterGeo.attributes.position;

    // ---- Root group for the whole pod assembly ----
    const pod = new THREE.Group();
    scene.add(pod);

    // Materials
    const hullMat = new THREE.MeshStandardMaterial({
      color: 0x1e8a82,
      roughness: 0.35,
      metalness: 0.4,
    });
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x8fd9c4,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
      metalness: 0.1,
    });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xe8b75d,
      roughness: 0.4,
      metalness: 0.6,
    });
    const darkMat = new THREE.MeshStandardMaterial({
      color: 0x0b2e33,
      roughness: 0.6,
      metalness: 0.3,
    });

    // 1) Solar/power collar (floats at waterline)
    const collar = new THREE.Mesh(
      new THREE.TorusGeometry(2.6, 0.22, 16, 48),
      goldMat
    );
    collar.rotation.x = Math.PI / 2;
    collar.position.y = 0.1;
    pod.add(collar);

    // 2) Upper dome (intake sensor housing, above water)
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(1.5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      glassMat
    );
    dome.position.y = 0.15;
    pod.add(dome);

    // Intake grid ring on dome
    const grid = new THREE.Mesh(
      new THREE.TorusGeometry(1.5, 0.05, 8, 32),
      darkMat
    );
    grid.rotation.x = Math.PI / 2;
    grid.position.y = 0.15;
    pod.add(grid);

    // 3) Main pod body (submerged desalination core) - capsule-like via cylinder + spheres
    const bodyCyl = new THREE.Mesh(
      new THREE.CylinderGeometry(1.9, 1.9, 3.4, 32),
      hullMat
    );
    bodyCyl.position.y = -2.0;
    pod.add(bodyCyl);
    const bodyCapTop = new THREE.Mesh(new THREE.SphereGeometry(1.9, 32, 16), hullMat);
    bodyCapTop.position.y = -0.3;
    pod.add(bodyCapTop);
    const bodyCapBottom = new THREE.Mesh(new THREE.SphereGeometry(1.9, 32, 16), hullMat);
    bodyCapBottom.position.y = -3.7;
    pod.add(bodyCapBottom);

    // Membrane bands around the body (purification membranes)
    for (let i = 0; i < 4; i++) {
      const band = new THREE.Mesh(
        new THREE.TorusGeometry(1.95, 0.08, 8, 32),
        new THREE.MeshStandardMaterial({ color: 0xf2f7f5, roughness: 0.3, metalness: 0.2 })
      );
      band.rotation.x = Math.PI / 2;
      band.position.y = -1.0 - i * 0.7;
      pod.add(band);
    }

    // 4) Waste/brine collection chamber below (funnel toward a hopper)
    const funnel = new THREE.Mesh(
      new THREE.CylinderGeometry(1.9, 0.6, 1.4, 32, 1, true),
      darkMat
    );
    funnel.material.side = THREE.DoubleSide;
    funnel.position.y = -4.6;
    pod.add(funnel);

    const hopper = new THREE.Mesh(
      new THREE.CylinderGeometry(0.6, 0.6, 1.0, 24),
      goldMat
    );
    hopper.position.y = -5.6;
    pod.add(hopper);

    // Purified water outflow pipe (arcs up and out, above waterline)
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(1.9, -2.4, 0),
      new THREE.Vector3(3.0, -1.6, 0),
      new THREE.Vector3(3.6, 0.3, 0),
      new THREE.Vector3(3.4, 1.0, 0),
    ]);
    const pipeGeo = new THREE.TubeGeometry(curve, 40, 0.16, 12, false);
    const pipe = new THREE.Mesh(pipeGeo, new THREE.MeshStandardMaterial({ color: 0xf2f7f5, roughness: 0.3, metalness: 0.3 }));
    pod.add(pipe);

    // 5) Upcycling collection buoy/dock, offset to the side, tethered
    const dockGroup = new THREE.Group();
    dockGroup.position.set(5.2, 0, 3.4);
    pod.add(dockGroup);

    const buoyHull = new THREE.Mesh(
      new THREE.CylinderGeometry(1.1, 1.1, 0.7, 24),
      goldMat
    );
    buoyHull.position.y = 0.05;
    dockGroup.add(buoyHull);

    const crate = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 0.7, 1.1),
      new THREE.MeshStandardMaterial({ color: 0xc98f3a, roughness: 0.7 })
    );
    crate.position.y = 0.75;
    dockGroup.add(crate);

    // Tether line from funnel/hopper to dock (waste transfer line)
    const tetherCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.6, -5.4, 0),
      new THREE.Vector3(2.6, -3.5, 1.5),
      new THREE.Vector3(4.4, -1.0, 3.0),
      new THREE.Vector3(5.2, 0.0, 3.4),
    ]);
    const tetherGeo = new THREE.TubeGeometry(tetherCurve, 40, 0.06, 8, false);
    const tether = new THREE.Mesh(tetherGeo, darkMat);
    pod.add(tether);

    // Anchor lines (visual, simple)
    const anchorMat = new THREE.LineBasicMaterial({ color: 0x8fd9c4, transparent: true, opacity: 0.5 });
    const anchorPts = [new THREE.Vector3(0, -5.9, 0), new THREE.Vector3(-1.5, -9, 1.5)];
    const anchorGeo = new THREE.BufferGeometry().setFromPoints(anchorPts);
    pod.add(new THREE.Line(anchorGeo, anchorMat));

    // ---- Markers (numbered hotspots) ----
    const markerData = [
      { pos: new THREE.Vector3(0, 1.65, 0), text: "1 — Sensor dome: monitors salinity, flow & water quality" },
      { pos: new THREE.Vector3(2.6, 0.1, 0), text: "2 — Solar collar: powers the pod, keeps it buoyant at the waterline" },
      { pos: new THREE.Vector3(2.0, -1.8, 0), text: "3 — Membrane core: reverse-osmosis stack purifies intake water" },
      { pos: new THREE.Vector3(3.6, 1.0, 0), text: "4 — Outflow pipe: delivers purified fresh water to shore/storage" },
      { pos: new THREE.Vector3(0.6, -5.6, 0), text: "5 — Waste hopper: concentrates brine & collected debris" },
      { pos: new THREE.Vector3(5.2, 1.0, 3.4), text: "6 — Collection dock: BlueCore retrieves waste here for upcycling" },
    ];

    const markers = [];
    markerData.forEach((m) => {
      const spriteMat = new THREE.SpriteMaterial({
        color: 0xf2f7f5,
        transparent: true,
      });
      const marker = new THREE.Mesh(
        new THREE.SphereGeometry(0.14, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0xf2f7f5, emissive: 0xe8b75d, emissiveIntensity: 0.3 })
      );
      marker.position.copy(m.pos);
      marker.userData.text = m.text;
      pod.add(marker);
      markers.push(marker);
    });

    // Raycaster for hover
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    function onPointerMove(e) {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(markers);
      if (hits.length > 0) {
        setLabel(hits[0].object.userData.text);
        renderer.domElement.style.cursor = "pointer";
      } else {
        renderer.domElement.style.cursor = "grab";
      }
    }
    renderer.domElement.addEventListener("pointermove", onPointerMove);

    // ---- Orbit-ish controls (manual, no extra deps) ----
    let isDragging = false;
    let prevX = 0, prevY = 0;
    let theta = 0.9, phi = 1.0, radius = 14;

    function updateCamera() {
      camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
      camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
      camera.position.y = radius * Math.cos(phi);
      camera.lookAt(0, -1.5, 0);
    }
    updateCamera();

    function onDown(e) {
      isDragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
    }
    function onUp() {
      isDragging = false;
    }
    function onMove(e) {
      if (!isDragging) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      theta -= dx * 0.006;
      phi -= dy * 0.006;
      phi = Math.max(0.3, Math.min(1.5, phi));
      prevX = e.clientX;
      prevY = e.clientY;
      updateCamera();
    }
    function onWheel(e) {
      radius += e.deltaY * 0.01;
      radius = Math.max(7, Math.min(24, radius));
      updateCamera();
      e.preventDefault();
    }
    renderer.domElement.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointermove", onMove);
    renderer.domElement.addEventListener("wheel", onWheel, { passive: false });

    // ---- Animation loop ----
    let t = 0;
    let raf;
    function animate() {
      t += 0.015;
      pod.position.y = Math.sin(t) * 0.08;
      pod.rotation.y += 0.0025;

      // water wave animation
      for (let i = 0; i < waterPos.count; i++) {
        const x = waterPos.getX(i);
        const y = waterPos.getY(i);
        const z = 0.15 * Math.sin(x * 0.4 + t) * Math.cos(y * 0.3 + t * 0.7);
        waterPos.setZ(i, z);
      }
      waterPos.needsUpdate = true;
      waterGeo.computeVertexNormals();

      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    }
    animate();

    function onResize() {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointermove", onMove);
      renderer.domElement.removeEventListener("pointerdown", onDown);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("wheel", onWheel);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return (
    <div style={{ width: "100%", height: "100%", background: "#0B2E33", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "12px 16px", color: "#F2F7F5", fontFamily: "Helvetica, Arial, sans-serif" }}>
        <div style={{ fontWeight: 700, fontSize: 18, letterSpacing: 2 }}>BLUECORE — DESALINATION POD</div>
        <div style={{ fontSize: 13, opacity: 0.75, marginTop: 4, minHeight: 18 }}>{label}</div>
      </div>
      <div ref={mountRef} style={{ flex: 1, width: "100%", cursor: "grab" }} />
    </div>
  );
}
