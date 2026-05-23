#!/usr/bin/env node
// Run this with: node generate-icons.js
// It creates placeholder PNG icons — replace with your real artwork before App Store submission

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const sizes = [32, 120, 152, 180, 192, 512];
const dir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

sizes.forEach(size => {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#080e0a';
  ctx.fillRect(0, 0, size, size);

  // Mountain shape
  ctx.fillStyle = '#4ec87e';
  ctx.beginPath();
  ctx.moveTo(size * 0.5, size * 0.15);
  ctx.lineTo(size * 0.85, size * 0.75);
  ctx.lineTo(size * 0.15, size * 0.75);
  ctx.closePath();
  ctx.fill();

  // Snow cap
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(size * 0.5, size * 0.15);
  ctx.lineTo(size * 0.62, size * 0.38);
  ctx.lineTo(size * 0.38, size * 0.38);
  ctx.closePath();
  ctx.fill();

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(dir, `icon-${size}.png`), buffer);
  console.log(`Created icon-${size}.png`);
});

console.log('Icons generated. Replace with professional artwork before App Store submission.');
