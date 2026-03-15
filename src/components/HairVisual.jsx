import React from 'react';
import { HAIR_GRADIENTS } from '../data.js';

const SHAPES = {
  bob1: (id) => (
    <>
      <ellipse cx="100" cy="110" rx="72" ry="90" fill={`url(#${id})`} />
      <ellipse cx="100" cy="85" rx="55" ry="60" fill={`url(#${id}2)`} />
      <rect x="28" y="110" width="20" height="60" rx="10" fill={`url(#${id})`} />
      <rect x="152" y="110" width="20" height="60" rx="10" fill={`url(#${id})`} />
      <ellipse cx="100" cy="80" rx="40" ry="45" fill="#f5d5b0" opacity="0.15" />
    </>
  ),
  bob2: (id) => (
    <>
      <ellipse cx="100" cy="115" rx="70" ry="85" fill={`url(#${id})`} />
      <ellipse cx="100" cy="88" rx="52" ry="58" fill={`url(#${id}2)`} />
      <rect x="30" y="115" width="18" height="55" rx="9" fill={`url(#${id})`} />
      <rect x="152" y="115" width="18" height="55" rx="9" fill={`url(#${id})`} />
    </>
  ),
  curly1: (id) => (
    <>
      <ellipse cx="100" cy="100" rx="78" ry="95" fill={`url(#${id})`} />
      {[...Array(12)].map((_, i) => (
        <ellipse key={i} cx={40 + i * 12} cy={80 + Math.sin(i) * 30} rx="14" ry="20" fill={`url(#${id}2)`} opacity="0.8" />
      ))}
      <ellipse cx="100" cy="75" rx="45" ry="50" fill="#f5d5b0" opacity="0.12" />
    </>
  ),
  curly2: (id) => (
    <>
      <ellipse cx="100" cy="105" rx="76" ry="92" fill={`url(#${id})`} />
      {[...Array(10)].map((_, i) => (
        <ellipse key={i} cx={45 + i * 12} cy={75 + Math.cos(i * 0.8) * 25} rx="16" ry="22" fill={`url(#${id}2)`} opacity="0.75" />
      ))}
    </>
  ),
  wavy1: (id) => (
    <>
      <ellipse cx="100" cy="110" rx="70" ry="100" fill={`url(#${id})`} />
      {[...Array(5)].map((_, i) => (
        <path key={i} d={`M ${30 + i * 5} ${60 + i * 12} Q 100 ${50 + i * 8} ${170 - i * 5} ${60 + i * 12}`} fill="none" stroke={`url(#${id}2)`} strokeWidth="8" strokeLinecap="round" opacity="0.6" />
      ))}
    </>
  ),
  wavy2: (id) => (
    <>
      <ellipse cx="100" cy="115" rx="72" ry="105" fill={`url(#${id})`} />
      {[...Array(6)].map((_, i) => (
        <path key={i} d={`M 25 ${55 + i * 15} Q 100 ${40 + i * 10} 175 ${55 + i * 15}`} fill="none" stroke={`url(#${id}2)`} strokeWidth="9" strokeLinecap="round" opacity="0.55" />
      ))}
    </>
  ),
  bouncy1: (id) => (
    <>
      <ellipse cx="100" cy="105" rx="74" ry="98" fill={`url(#${id})`} />
      {[...Array(8)].map((_, i) => (
        <circle key={i} cx={40 + i * 18} cy={85 + Math.sin(i * 1.2) * 20} r="18" fill={`url(#${id}2)`} opacity="0.7" />
      ))}
      <ellipse cx="100" cy="75" rx="42" ry="48" fill="#f5d5b0" opacity="0.1" />
    </>
  ),
  bouncy2: (id) => (
    <>
      <ellipse cx="100" cy="108" rx="75" ry="100" fill={`url(#${id})`} />
      {[...Array(7)].map((_, i) => (
        <circle key={i} cx={42 + i * 19} cy={82 + Math.cos(i) * 22} r="20" fill={`url(#${id}2)`} opacity="0.65" />
      ))}
    </>
  ),
  straight1: (id) => (
    <>
      <rect x="32" y="30" width="136" height="175" rx="68" fill={`url(#${id})`} />
      {[...Array(8)].map((_, i) => (
        <line key={i} x1={50 + i * 16} y1="30" x2={52 + i * 16} y2="205" stroke={`url(#${id}2)`} strokeWidth="5" opacity="0.4" />
      ))}
    </>
  ),
  straight2: (id) => (
    <>
      <rect x="28" y="28" width="144" height="180" rx="72" fill={`url(#${id})`} />
      {[...Array(10)].map((_, i) => (
        <line key={i} x1={45 + i * 14} y1="28" x2={46 + i * 14} y2="208" stroke={`url(#${id}2)`} strokeWidth="4" opacity="0.35" />
      ))}
    </>
  ),
};

export default function HairVisual({ image, style = {}, size = 200 }) {
  // If image is a real URL, render a photo instead of SVG
  if (image && (image.startsWith('http') || image.startsWith('blob:'))) {
    return (
      <img
        src={image}
        alt="product"
        width={size}
        height={size}
        style={{ objectFit: 'cover', borderRadius: 8, display: 'block', ...style }}
      />
    );
  }

  const gradient = HAIR_GRADIENTS[image] || HAIR_GRADIENTS.straight1;
  const colors = gradient.match(/#[a-f0-9]+/gi) || ['#1a1008', '#080808'];
  const id = `hg-${image}-${size}`;
  const ShapeComponent = SHAPES[image] || SHAPES.straight1;

  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={style}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          {colors.map((c, i, a) => (
            <stop key={i} offset={`${(i / (a.length - 1)) * 100}%`} stopColor={c} />
          ))}
        </linearGradient>
        <linearGradient id={`${id}2`} x1="0" y1="0" x2="0" y2="1">
          {colors.slice(0, 2).map((c, i) => (
            <stop key={i} offset={`${i * 100}%`} stopColor={c} stopOpacity={0.7} />
          ))}
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="98" fill={`url(#${id})`} opacity="0.08" />
      {ShapeComponent(id)}
    </svg>
  );
}
