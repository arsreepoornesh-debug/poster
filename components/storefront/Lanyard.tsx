"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, extend, useFrame } from "@react-three/fiber";
import { useTexture, Environment, Lightformer } from "@react-three/drei";
import { Physics, RigidBody, BallCollider, CuboidCollider, useRopeJoint, useSphericalJoint } from "@react-three/rapier";
// @ts-ignore
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import * as THREE from "three";
import "./Lanyard.css";

extend({ MeshLineGeometry, MeshLineMaterial });

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        meshLineGeometry: any;
        meshLineMaterial: any;
      }
    }
  }
}

// 1x1 transparent pixels for fallbacks
const BLANK_PIXEL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

const DEFAULT_BAND_TEX =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAD0lEQVR42mNkQAOMIEwEABsQAEWJ3C0qAAAAAElFTkSuQmCC";

interface LanyardProps {
  position?: [number, number, number];
  gravity?: [number, number, number];
  fov?: number;
  transparent?: boolean;
  frontImage?: string | null;
  backImage?: string | null;
  imageFit?: "cover" | "contain";
  lanyardImage?: string | null;
  lanyardWidth?: number;
  sizeFormat?: string;
}

export default function Lanyard({
  position = [0, 0, 20],
  gravity = [0, -40, 0],
  fov = 20,
  transparent = true,
  frontImage = null,
  backImage = null,
  imageFit = "cover",
  lanyardImage = null,
  lanyardWidth = 0.15,
  sizeFormat = "A4",
}: LanyardProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="lanyard-wrapper">
      <Canvas
        camera={{ position: position, fov: fov }}
        dpr={[1, isMobile ? 1.5 : 2]}
        gl={{ alpha: transparent }}
        onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)}
      >
        <ambientLight intensity={Math.PI} />
        <Physics gravity={gravity} timeStep={isMobile ? 1 / 30 : 1 / 60}>
          <Band
            isMobile={isMobile}
            frontImage={frontImage}
            backImage={backImage}
            imageFit={imageFit}
            lanyardImage={lanyardImage}
            lanyardWidth={lanyardWidth}
            sizeFormat={sizeFormat}
          />
        </Physics>
        <Environment blur={0.75}>
          <Lightformer
            intensity={2}
            color="white"
            position={[0, -1, 5]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[-1, -1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[1, 1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={10}
            color="white"
            position={[-10, 0, 14]}
            rotation={[0, Math.PI / 2, Math.PI / 3]}
            scale={[100, 10, 1]}
          />
        </Environment>
      </Canvas>
    </div>
  );
}

interface BandProps {
  maxSpeed?: number;
  minSpeed?: number;
  isMobile?: boolean;
  frontImage?: string | null;
  backImage?: string | null;
  imageFit?: "cover" | "contain";
  lanyardImage?: string | null;
  lanyardWidth?: number;
  sizeFormat?: string;
}

function Band({
  maxSpeed = 50,
  minSpeed = 0,
  isMobile = false,
  frontImage = null,
  backImage = null,
  imageFit = "cover",
  lanyardImage = null,
  lanyardWidth = 0.15,
  sizeFormat = "A4",
}: BandProps) {
  const band = useRef<any>(null);
  const fixed = useRef<any>(null);
  const j1 = useRef<any>(null);
  const j2 = useRef<any>(null);
  const j3 = useRef<any>(null);
  const card = useRef<any>(null);

  const vec = useMemo(() => new THREE.Vector3(), []);
  const ang = useMemo(() => new THREE.Vector3(), []);
  const rot = useMemo(() => new THREE.Vector3(), []);
  const dir = useMemo(() => new THREE.Vector3(), []);

  const segmentProps = {
    type: "dynamic" as const,
    canSleep: true,
    colliders: undefined,
    angularDamping: 4,
    linearDamping: 4,
  };

  const texture = useTexture(lanyardImage || DEFAULT_BAND_TEX);
  const frontTex = useTexture(frontImage || BLANK_PIXEL);
  const backTex = useTexture(backImage || BLANK_PIXEL);

  // Procedural canvas-composited texture atlas for front and back card faces
  const cardMap = useMemo(() => {
    const W = 512;
    const H = 512;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return new THREE.CanvasTexture(canvas);

    // Draw background texture mesh/gradient
    const gradient = ctx.createLinearGradient(0, 0, W, H);
    gradient.addColorStop(0, "#1e1b4b");
    gradient.addColorStop(0.5, "#4c1d95");
    gradient.addColorStop(1, "#311042");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);

    // Frame borders
    ctx.strokeStyle = "#5b21b6";
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, W - 10, H - 10);
    ctx.strokeRect(W / 2 + 5, 5, W / 2 - 10, H - 10);

    const drawFitted = (img: HTMLImageElement, isBack: boolean) => {
      const rx = isBack ? W / 2 : 0;
      const ry = 0;
      const rw = W / 2;
      const rh = H;

      const pick = imageFit === "contain" ? Math.min : Math.max;
      const scale = pick(rw / img.width, rh / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      const dx = rx + (rw - dw) / 2;
      const dy = ry + (rh - dh) / 2;

      ctx.save();
      ctx.beginPath();
      ctx.rect(rx, ry, rw, rh);
      ctx.clip();
      ctx.drawImage(img, dx, dy, dw, dh);
      ctx.restore();
    };

    if (frontImage && frontTex && (frontTex as any).image) {
      drawFitted((frontTex as any).image, false);
    }
    if (backImage && backTex && (backTex as any).image) {
      drawFitted((backTex as any).image, true);
    }

    const composite = new THREE.CanvasTexture(canvas);
    composite.colorSpace = THREE.SRGBColorSpace;
    composite.anisotropy = 16;
    composite.needsUpdate = true;
    return composite;
  }, [frontImage, backImage, imageFit, frontTex, backTex]);

  const [curve] = useState(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
      ])
  );

  const [dragged, drag] = useState<THREE.Vector3 | false>(false);
  const [hovered, hover] = useState(false);

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1.2]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1.2]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1.2]);
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, 1.4, 0],
  ]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? "grabbing" : "grab";
      return () => void (document.body.style.cursor = "auto");
    }
  }, [hovered, dragged]);

  useFrame((state, delta) => {
    if (dragged && card.current) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp());
      card.current.setNextKinematicTranslation({
        x: vec.x - dragged.x,
        y: vec.y - dragged.y,
        z: vec.z - dragged.z,
      });
    }
    if (fixed.current && card.current && j1.current && j2.current && j3.current) {
      [j1, j2].forEach((ref) => {
        const tr = ref.current.translation();
        if (!ref.current.lerped) {
          ref.current.lerped = new THREE.Vector3().copy(tr);
        }
        const clampedDistance = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(tr)));
        ref.current.lerped.lerp(tr, delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed)));
      });
      curve.points[0].copy(j3.current.translation());
      curve.points[1].copy(j2.current.lerped);
      curve.points[2].copy(j1.current.lerped);
      curve.points[3].copy(fixed.current.translation());
      band.current.geometry.setPoints(curve.getPoints(isMobile ? 16 : 32));
      ang.copy(card.current.angvel());
      rot.copy(card.current.rotation());
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });
    }
  });

  curve.curveType = "chordal";
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

  return (
    <>
      <group position={[0, 4, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.15]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.15]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.15]} />
        </RigidBody>
        <RigidBody position={[2, 0, 0]} ref={card} {...segmentProps} type={dragged ? "kinematicPosition" : "dynamic"}>
          {(() => {
            const isPolo = sizeFormat.toUpperCase().includes("POLAROID") || sizeFormat.toUpperCase().includes("A5");
            const isSq = sizeFormat.toUpperCase().includes("SQUARE") || sizeFormat.toUpperCase().includes("12X12") || sizeFormat.toUpperCase().includes("OTHER");
            const cardW = isPolo ? 1.8 : isSq ? 2.0 : 1.6;
            const cardH = isPolo ? 1.8 : isSq ? 2.0 : 2.25;

            return (
              <>
                <CuboidCollider args={[cardW / 2, cardH / 2, 0.05]} />
                <group
                  scale={1.0}
                  position={[0, -cardH / 2, 0]}
                  onPointerOver={() => hover(true)}
                  onPointerOut={() => hover(false)}
                  onPointerUp={(e: any) => {
                    e.target.releasePointerCapture(e.pointerId);
                    drag(false);
                  }}
                  onPointerDown={(e: any) => {
                    e.target.setPointerCapture(e.pointerId);
                    if (card.current) {
                      const translation = card.current.translation();
                      drag(new THREE.Vector3().copy(e.point).sub(vec.copy(translation)));
                    }
                  }}
                >
                  {/* Procedural Card Mesh Box */}
                  <mesh castShadow receiveShadow>
                    <boxGeometry args={[cardW, cardH, 0.08]} />
                    <meshPhysicalMaterial
                      map={cardMap}
                      clearcoat={isMobile ? 0 : 1}
                      clearcoatRoughness={0.15}
                      roughness={0.9}
                      metalness={0.8}
                    />
                  </mesh>

                  {/* Procedural clamp clip details */}
                  <mesh position={[0, cardH / 2 + 0.125, 0]}>
                    <cylinderGeometry args={[0.08, 0.08, 0.25, 16]} />
                    <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.2} />
                  </mesh>
                  <mesh position={[0, cardH / 2 + 0.325, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[0.12, 0.04, 8, 24]} />
                    <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
                  </mesh>
                </group>
              </>
            );
          })()}
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color="white"
          depthTest={false}
          resolution={isMobile ? [1000, 2000] : [1000, 1000]}
          useMap
          map={texture}
          repeat={[-4, 1]}
          lineWidth={lanyardWidth}
        />
      </mesh>
    </>
  );
}
