import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Decal } from '@react-three/drei';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { useEditorStore } from '../../store/editorStore';
import { useSceneStore } from '../../store/sceneStore';
import { renderLayersToCanvas } from '../../utils/canvasRenderer';
import { useShopStore } from '../../store/shopStore';

/**
 * Umumiy kiyim modeli: har qanday GLB (futbolka, polo, xudi, shim...).
 *  - Model bbox bo'yicha normallashtiriladi (balandlik TARGET_HEIGHT, markazda) — Sketchfab modellari
 *    turli birlik/orientatsiyada keladi.
 *  - Eng katta mesh = "tana": rang shu yerga, decal (bosma) shu meshga yopishadi.
 *  - Zonalar (decal joyi) admin → 3D modellar → zones dan; bo'lmasa bbox'dan avtomatik.
 */
type Vec3 = [number, number, number];
type ZoneCfg = { position: Vec3; rotation: Vec3; scale: number | Vec3 };
/** Admin zones: `rel` — markazdan bbox o'lchamiga nisbatan siljish [dx, dy] (masalan shim: chap son [-0.22, 0.25]), `scale` — bbox'ga nisbatan */
/** rel: markazdan [dx, dy] yoki [dx, dy, dz] (bbox ulushida). scale: bitta son yoki [eni, bo'yi, chuqurlik] — chuqurlik decal qaysi yuzaga tushishini belgilaydi. */
type RelZone = { rel: [number, number] | Vec3; scale?: number | Vec3; side?: 'front' | 'back' | 'left' | 'right' };
type Zones = Record<'front' | 'back' | 'sleeve_left' | 'sleeve_right', ZoneCfg>;

const TARGET_HEIGHT = 1.85; // standart futbolka (scale 2.8 × model) bilan bir xil ko'rinish
const DEFAULT_MODEL = '/models/shirt_model.glb';

export const TShirtModel: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);

  const product = useShopStore((s) => s.product);
  const modelUrl = product?.garment_model?.url || DEFAULT_MODEL;
  const gltf = useGLTF(modelUrl) as any;

  const colors = useEditorStore((s) => s.colors);
  const fabric = useEditorStore((s) => s.fabric);
  const layers = useEditorStore((s) => s.layers);
  const isTurntableActive = useSceneStore((s) => s.isTurntableActive);
  const turntableSpeed = useSceneStore((s) => s.turntableSpeed);
  const wireframe = useSceneStore((s) => s.wireframe);

  // Sahnani klon qilamiz (useGLTF kesh — asl obyektga tegmaymiz), tana meshini ajratamiz, bbox hisoblaymiz
  // Barcha meshlarni BITTA geometriyaga birlashtiramiz (CLO3D modellari old/orqa/yeng bo'laklardan iborat,
  // decal faqat bitta meshga yopishadi). Keyin bbox bo'yicha normallashtiramiz.
  const { body, material, normalize, autoZones, bbox } = useMemo(() => {
    const src: THREE.Group = gltf.scene;
    src.updateMatrixWorld(true);
    const parts: THREE.BufferGeometry[] = [];
    let material: THREE.Material | null = null;
    src.traverse((o: any) => {
      if (!o.isMesh) return;
      let g: THREE.BufferGeometry = o.geometry.clone();
      g.applyMatrix4(o.matrixWorld);
      // Attributlar bir xil bo'lishi kerak: faqat position/normal/uv
      const keep = ['position', 'normal', 'uv'];
      Object.keys(g.attributes).forEach((a) => !keep.includes(a) && g.deleteAttribute(a));
      if (!g.attributes.normal) g.computeVertexNormals();
      if (!g.attributes.uv) g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
      g = g.toNonIndexed();
      g.morphAttributes = {};
      parts.push(g);
      if (!material) material = (Array.isArray(o.material) ? o.material[0] : o.material).clone();
    });
    const body = parts.length ? mergeGeometries(parts, false)! : new THREE.BufferGeometry();
    body.computeBoundingBox();
    const box = body.boundingBox!;
    const size = new THREE.Vector3(); const center = new THREE.Vector3();
    box.getSize(size); box.getCenter(center);
    // Eng katta o'lcham bo'yicha normallashtiramiz (kepka keng va past, futbolka baland) — kamera bir xil masofada qoladi
    const k = TARGET_HEIGHT / (Math.max(size.x, size.y, size.z) || 1);
    const normalize = { scale: k, offset: center.clone().multiplyScalar(-1) };
    const d = Math.max(size.x, size.y) * 0.32;
    const autoZones: Zones = {
      front: { position: [center.x, center.y + size.y * 0.12, box.max.z], rotation: [0, 0, 0], scale: d },
      back: { position: [center.x, center.y + size.y * 0.12, box.min.z], rotation: [0, Math.PI, 0], scale: d },
      sleeve_left: { position: [box.min.x, center.y + size.y * 0.22, center.z], rotation: [0, -Math.PI / 2, 0], scale: d * 0.5 },
      sleeve_right: { position: [box.max.x, center.y + size.y * 0.22, center.z], rotation: [0, Math.PI / 2, 0], scale: d * 0.5 },
    };
    return { body, material: (material || new THREE.MeshStandardMaterial()) as THREE.Material, normalize, autoZones, bbox: { box, size, center } };
  }, [gltf]);

  const Z: Zones = { ...autoZones };
  const custom = (product?.garment_model?.zones || {}) as Record<string, Partial<ZoneCfg> & Partial<RelZone>>;
  for (const key of Object.keys(custom) as (keyof Zones)[]) {
    const c = custom[key];
    if (!c) continue;
    if (c.rel) {
      // nisbiy: model o'lchamidan mustaqil (bbox asosida)
      const side = c.side || (key === 'back' ? 'back' : key === 'sleeve_left' ? 'left' : key === 'sleeve_right' ? 'right' : 'front');
      const base = autoZones[key];
      const x = bbox.center.x + c.rel[0] * bbox.size.x;
      const y = bbox.center.y + c.rel[1] * bbox.size.y;
      // uchinchi qiymat: z (chuqurlik) siljishi — kepkada bosma kozirokda emas, gumbaz oldida bo'lishi uchun
      const z = c.rel.length === 3 ? bbox.center.z + c.rel[2] * bbox.size.z : undefined;
      const pos: [number, number, number] = side === 'front' ? [x, y, z ?? bbox.box.max.z] : side === 'back' ? [x, y, z ?? bbox.box.min.z] : side === 'left' ? [bbox.box.min.x, y, z ?? bbox.center.z] : [bbox.box.max.x, y, z ?? bbox.center.z];
      const m = Math.max(bbox.size.x, bbox.size.y);
      const sc = c.scale ?? 0.32;
      Z[key] = { position: pos, rotation: base.rotation, scale: Array.isArray(sc) ? (sc.map((v) => v * m) as Vec3) : sc * m };
    } else if (c.position) {
      Z[key] = { position: c.position, rotation: c.rotation || autoZones[key].rotation, scale: c.scale || autoZones[key].scale };
    }
  }

  // Rang, mato, wireframe
  useEffect(() => {
    const m: any = material;
    m.color = new THREE.Color(colors.body);
    // Modelning o'z rang teksturasi (naqsh, bosilgan yozuv) olib tashlanadi — mato rangi bizniki
    m.map = null; m.emissiveMap = null; m.alphaMap = null;
    if ('emissive' in m) m.emissive = new THREE.Color(0x000000);
    m.transparent = false; m.opacity = 1;
    if ('roughness' in m) m.roughness = fabric.roughness;
    if ('metalness' in m) m.metalness = fabric.metalness;
    m.wireframe = wireframe;
    m.side = THREE.DoubleSide;
    m.needsUpdate = true;
  }, [colors.body, fabric, wireframe, material]);

  // Zona teksturalari
  const canvases = useMemo(() => {
    const create = () => Object.assign(document.createElement('canvas'), { width: 1024, height: 1024 });
    return { front: create(), back: create(), sleeve_left: create(), sleeve_right: create() };
  }, []);
  const textures = useMemo(() => ({
    front: new THREE.CanvasTexture(canvases.front),
    back: new THREE.CanvasTexture(canvases.back),
    sleeve_left: new THREE.CanvasTexture(canvases.sleeve_left),
    sleeve_right: new THREE.CanvasTexture(canvases.sleeve_right),
  }), [canvases]);
  useEffect(() => {
    Object.values(textures).forEach((tex) => {
      tex.anisotropy = 16; tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter; tex.magFilter = THREE.LinearFilter;
    });
  }, [textures]);

  const prevZoneLayersRef = useRef<Record<string, string>>({});
  useEffect(() => {
    (['front', 'back', 'sleeve_left', 'sleeve_right'] as const).forEach(async (zone) => {
      const zoneLayers = layers.filter((l) => l.zone === zone && l.visible);
      const key = JSON.stringify(zoneLayers.map((l) => `${l.id}-${l.x}-${l.y}-${l.scale}-${l.rotation}-${l.opacity}`));
      if (prevZoneLayersRef.current[zone] === key) return;
      prevZoneLayersRef.current[zone] = key;
      const ctx = canvases[zone].getContext('2d');
      if (!ctx) return;
      await renderLayersToCanvas(ctx, zoneLayers, canvases[zone].width, canvases[zone].height);
      textures[zone].needsUpdate = true;
    });
  }, [layers, canvases, textures]);

  useFrame((_, delta) => {
    if (isTurntableActive && groupRef.current) groupRef.current.rotation.y += delta * turntableSpeed * 0.8;
  });

  // dev: zona sozlash uchun (admin → 3D modellar → zones JSON)
  if (typeof window !== 'undefined') (window as any).__tx_debug = { bbox, Z, model: modelUrl };

  const has = (zone: string) => layers.some((l) => l.zone === zone && l.visible);

  return (
    <group ref={groupRef} scale={normalize.scale} position={normalize.offset.clone().multiplyScalar(normalize.scale).toArray()}>
      <mesh castShadow receiveShadow geometry={body} material={material}>
        {has('front') && <Decal position={Z.front.position} rotation={Z.front.rotation} scale={Z.front.scale} map={textures.front} />}
        {has('back') && <Decal position={Z.back.position} rotation={Z.back.rotation} scale={Z.back.scale} map={textures.back} />}
        {has('sleeve_left') && <Decal position={Z.sleeve_left.position} rotation={Z.sleeve_left.rotation} scale={Z.sleeve_left.scale} map={textures.sleeve_left} />}
        {has('sleeve_right') && <Decal position={Z.sleeve_right.position} rotation={Z.sleeve_right.rotation} scale={Z.sleeve_right.scale} map={textures.sleeve_right} />}
      </mesh>
    </group>
  );
};

useGLTF.preload(DEFAULT_MODEL);
