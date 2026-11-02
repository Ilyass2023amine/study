import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const OUT_DIR = join(process.cwd(), 'public', 'brand');
const SS = 3;

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuffer, data]);
  const out = Buffer.alloc(body.length + 8);
  out.writeUInt32BE(data.length, 0);
  body.copy(out, 4);
  out.writeUInt32BE(crc32(body), body.length + 4);
  return out;
}

function encodePng(width, height, rgba) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y += 1) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function mix(a, b, t) {
  return a + (b - a) * t;
}

function over(base, color, alpha) {
  const outAlpha = alpha + base[3] * (1 - alpha);
  if (outAlpha === 0) return [0, 0, 0, 0];
  return [
    (color[0] * alpha + base[0] * base[3] * (1 - alpha)) / outAlpha,
    (color[1] * alpha + base[1] * base[3] * (1 - alpha)) / outAlpha,
    (color[2] * alpha + base[2] * base[3] * (1 - alpha)) / outAlpha,
    outAlpha,
  ];
}

function roundedRectAlpha(x, y, inset, radius) {
  const min = inset;
  const max = 1 - inset;
  if (x < min || x > max || y < min || y > max) return 0;
  const cx = Math.min(Math.max(x, min + radius), max - radius);
  const cy = Math.min(Math.max(y, min + radius), max - radius);
  const dx = x - cx;
  const dy = y - cy;
  const distance = Math.hypot(dx, dy);
  if (distance > radius) return 0;
  return Math.min(1, (radius - distance) / 0.006);
}

function sparkle(x, y, radius, power) {
  const dx = Math.abs(x) / radius;
  const dy = Math.abs(y) / radius;
  if (dx > 1 || dy > 1) return 0;
  return dx ** power + dy ** power <= 1 ? 1 : 0;
}

function sample(x, y, maskable) {
  let color = [0, 0, 0, 0];
  const corner = maskable ? 0 : 0.22;
  const rectAlpha = maskable ? 1 : roundedRectAlpha(x, y, 0, corner);
  if (rectAlpha <= 0) return color;

  const base = [mix(10, 5, y), mix(18, 9, y), mix(38, 20, y), 1];
  color = over(color, base, rectAlpha);

  const purpleGlow = Math.max(0, 1 - Math.hypot(x - 0.26, y - 0.18) / 0.62) ** 2;
  const cyanGlow = Math.max(0, 1 - Math.hypot(x - 0.82, y - 0.86) / 0.55) ** 2;
  color = over(color, [124, 92, 255], purpleGlow * 0.5 * rectAlpha);
  color = over(color, [34, 211, 238], cyanGlow * 0.26 * rectAlpha);

  const scale = maskable ? 0.82 : 1;
  const ox = x - 0.5;
  const oy = y - 0.5;
  const angle = (-24 * Math.PI) / 180;
  const rx = ox * Math.cos(angle) - oy * Math.sin(angle);
  const ry = ox * Math.sin(angle) + oy * Math.cos(angle);
  const ellipse = Math.hypot(rx / (0.34 * scale), ry / (0.185 * scale));

  if (Math.abs(ellipse - 1) < 0.022) {
    const ringStrength = 1 - Math.abs(ellipse - 1) / 0.022;
    const tint = Math.min(1, Math.max(0, (rx / 0.34 + 1) / 2));
    color = over(
      color,
      [mix(185, 110, tint), mix(160, 240, tint), mix(255, 255, tint)],
      ringStrength * 0.75 * rectAlpha,
    );
  }

  const starRadius = (maskable ? 0.155 : 0.2) * 1;
  const glow = Math.max(0, 1 - Math.hypot(ox, oy) / (starRadius * 2.6)) ** 2;
  color = over(color, [124, 92, 255], glow * 0.32 * rectAlpha);

  if (sparkle(ox, oy, starRadius, 0.58) > 0) {
    const inner = Math.max(0, 1 - Math.hypot(ox, oy) / starRadius);
    color = over(color, [252, 253, 255], (0.9 + inner * 0.1) * rectAlpha);
  }

  const dotAngle = [(-72 * Math.PI) / 180, (110 * Math.PI) / 180];
  for (let index = 0; index < dotAngle.length; index += 1) {
    const theta = dotAngle[index];
    const ex = Math.cos(theta) * 0.34 * scale;
    const ey = Math.sin(theta) * 0.185 * scale;
    const dotX = ex * Math.cos(angle) - ey * Math.sin(angle);
    const dotY = ex * Math.sin(angle) + ey * Math.cos(angle);
    const distance = Math.hypot(ox - dotX, oy - dotY);
    if (distance < 0.035) {
      const dotAlpha = Math.min(1, (0.035 - distance) / 0.006);
      const dotColor = index === 0 ? [34, 211, 238] : [196, 181, 253];
      color = over(color, dotColor, dotAlpha * rectAlpha);
    }
  }

  return color;
}

function render(size, maskable) {
  const rgba = Buffer.alloc(size * size * 4);
  for (let py = 0; py < size; py += 1) {
    for (let px = 0; px < size; px += 1) {
      let sum = [0, 0, 0, 0];
      for (let sy = 0; sy < SS; sy += 1) {
        for (let sx = 0; sx < SS; sx += 1) {
          const x = (px + (sx + 0.5) / SS) / size;
          const y = (py + (sy + 0.5) / SS) / size;
          const pixel = sample(x, y, maskable);
          sum[0] += pixel[0] * pixel[3];
          sum[1] += pixel[1] * pixel[3];
          sum[2] += pixel[2] * pixel[3];
          sum[3] += pixel[3];
        }
      }
      const total = SS * SS;
      const alpha = sum[3] / total;
      const offset = (py * size + px) * 4;
      if (alpha > 0) {
        rgba[offset] = Math.round(sum[0] / sum[3]);
        rgba[offset + 1] = Math.round(sum[1] / sum[3]);
        rgba[offset + 2] = Math.round(sum[2] / sum[3]);
      }
      rgba[offset + 3] = Math.round(alpha * 255);
    }
  }
  return encodePng(size, size, rgba);
}

mkdirSync(OUT_DIR, { recursive: true });
const icons = [
  ['icon-192.png', 192, false],
  ['icon-512.png', 512, false],
  ['icon-maskable-512.png', 512, true],
  ['apple-touch-icon.png', 180, true],
  ['favicon-32.png', 32, false],
];

for (const [name, size, maskable] of icons) {
  writeFileSync(join(OUT_DIR, name), render(size, maskable));
  console.log(`generated ${name}`);
}
