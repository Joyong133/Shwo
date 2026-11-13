// 지하철·버스 탑승 장면 공용 도구
//  - Scroller  : 차량은 고정, 바깥 풍경 모듈을 뒤로 흘려보내 주행감을 만든다 (멀미 방지: 리그는 움직이지 않음)
//  - LedDisplay: 노선 LED 전광판 (CanvasTexture)
import * as THREE from 'three';
import { FONT } from './kit3d.js';

export class Scroller {
  /**
   * @param {{length:number, count:number, behind?:number, make:(i:number)=>THREE.Object3D, onWrap?:(m:{obj:THREE.Object3D,index:number,z:number,serial:number})=>void}} o
   * 모듈은 로컬 z ∈ [-length/2, +length/2] 범위로 만들어야 한다. 진행 방향은 -z.
   */
  constructor(o) {
    this.length = o.length;
    this.count = o.count;
    this.behind = o.behind ?? o.length * 1.5;
    this.total = o.length * o.count;
    this.onWrap = o.onWrap || null;
    this.group = new THREE.Group();
    this.modules = [];
    this.serial = 0;
    for (let i = 0; i < o.count; i++) {
      const obj = o.make(i);
      const m = { obj, index: i, z: 0, serial: 0 };
      this.modules.push(m);
      this.group.add(obj);
    }
    this.reset();
  }

  /** 초기 배치 (가까운 모듈부터 serial 부여) */
  reset() {
    this.serial = 0;
    this.modules.forEach((m, i) => {
      m.z = this.behind - (i + 0.5) * this.length;
      m.serial = this.serial++;
      m.obj.position.z = m.z;
    });
  }

  /** d(m)만큼 전진 → 모듈은 +z로 이동, 뒤로 벗어나면 맨 앞으로 재배치 */
  advance(d) {
    for (const m of this.modules) {
      m.z += d;
      if (m.z > this.behind + this.length / 2) {
        m.z -= this.total;
        m.serial = this.serial++;
        if (this.onWrap) this.onWrap(m);
      }
      m.obj.position.z = m.z;
    }
  }

  /** 가장 먼(진행 방향 앞쪽) 모듈의 앞쪽 끝 z */
  get farEdge() {
    let min = Infinity;
    for (const m of this.modules) min = Math.min(min, m.z);
    return min - this.length / 2;
  }
}

export class LedDisplay {
  constructor(w = 1024, h = 192) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = w;
    this.canvas.height = h;
    this.ctx = this.canvas.getContext('2d');
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.anisotropy = 8;
    this.material = new THREE.MeshBasicMaterial({ map: this.texture, toneMapped: false, fog: false });
    this.state = {};
    this.draw({ line1: '', line2: '' });
  }

  /**
   * @param {{badge?:string, badgeColor?:string, line1:string, line2?:string, color?:string, color2?:string, alert?:boolean}} s
   */
  draw(s) {
    this.state = s;
    const { ctx, canvas } = this;
    const W = canvas.width;
    const H = canvas.height;
    ctx.fillStyle = '#05070a';
    ctx.fillRect(0, 0, W, H);
    let x = 28;
    if (s.badge) {
      ctx.font = `800 ${Math.round(H * 0.3)}px ${FONT}`;
      const bw = ctx.measureText(s.badge).width + 44;
      ctx.fillStyle = s.badgeColor || '#f06a00';
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(x, H * 0.2, bw, H * 0.6, H * 0.3) : ctx.rect(x, H * 0.2, bw, H * 0.6);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(s.badge, x + bw / 2, H * 0.52);
      x += bw + 26;
    }
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const fit = (text, size, weight) => {
      let fs = size;
      ctx.font = `${weight} ${fs}px ${FONT}`;
      while (ctx.measureText(text).width > W - x - 24 && fs > 16) {
        fs -= 2;
        ctx.font = `${weight} ${fs}px ${FONT}`;
      }
    };
    ctx.shadowColor = s.color || '#ffb020';
    ctx.shadowBlur = 12;
    ctx.fillStyle = s.alert ? '#ff5548' : s.color || '#ffb020';
    if (s.line2) {
      fit(s.line1, H * 0.4, 800);
      ctx.fillText(s.line1, x, H * 0.31);
      ctx.fillStyle = s.color2 || '#7dff9a';
      ctx.shadowColor = s.color2 || '#7dff9a';
      fit(s.line2, H * 0.3, 700);
      ctx.fillText(s.line2, x, H * 0.74);
    } else {
      fit(s.line1, H * 0.5, 800);
      ctx.fillText(s.line1, x, H * 0.52);
    }
    ctx.shadowBlur = 0;
    // LED 도트 격자
    ctx.fillStyle = 'rgba(0,0,0,0.33)';
    for (let gx = 0; gx < W; gx += 5) ctx.fillRect(gx, 0, 1.5, H);
    for (let gy = 0; gy < H; gy += 5) ctx.fillRect(0, gy, W, 1.5);
    this.texture.needsUpdate = true;
  }
}

/** 부드러운 0→1 보간 */
export const ease = (t) => {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
};
