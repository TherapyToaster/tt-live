// Original 5x7 pixel font for Mr. Toasty: Toasty Bros (drawn by code, no external fonts)
'use strict';
const FONT = {
  'A':[14,17,17,31,17,17,17],'B':[30,17,17,30,17,17,30],'C':[14,17,16,16,16,17,14],'D':[30,17,17,17,17,17,30],
  'E':[31,16,16,30,16,16,31],'F':[31,16,16,30,16,16,16],'G':[14,17,16,23,17,17,15],'H':[17,17,17,31,17,17,17],
  'I':[14,4,4,4,4,4,14],'J':[7,2,2,2,2,18,12],'K':[17,18,20,24,20,18,17],'L':[16,16,16,16,16,16,31],
  'M':[17,27,21,21,17,17,17],'N':[17,17,25,21,19,17,17],'O':[14,17,17,17,17,17,14],'P':[30,17,17,30,16,16,16],
  'Q':[14,17,17,17,21,18,13],'R':[30,17,17,30,20,18,17],'S':[15,16,16,14,1,1,30],'T':[31,4,4,4,4,4,4],
  'U':[17,17,17,17,17,17,14],'V':[17,17,17,17,17,10,4],'W':[17,17,17,21,21,21,10],'X':[17,17,10,4,10,17,17],
  'Y':[17,17,17,10,4,4,4],'Z':[31,1,2,4,8,16,31],
  '0':[14,17,19,21,25,17,14],'1':[4,12,4,4,4,4,14],'2':[14,17,1,2,4,8,31],'3':[31,2,4,2,1,17,14],
  '4':[2,6,10,18,31,2,2],'5':[31,16,30,1,1,17,14],'6':[6,8,16,30,17,17,14],'7':[31,1,2,4,8,8,8],
  '8':[14,17,17,14,17,17,14],'9':[14,17,17,15,1,2,12],
  '.':[0,0,0,0,0,12,12],':':[0,12,12,0,12,12,0],'-':[0,0,0,31,0,0,0],'!':[4,4,4,4,4,0,4],
  '?':[14,17,1,2,4,0,4],'/':[1,1,2,4,8,16,16],"'":[4,4,8,0,0,0,0],',':[0,0,0,0,12,4,8],
  '*':[0,4,21,14,21,4,0],'+':[0,4,4,31,4,4,0],'=':[0,0,31,0,31,0,0],'(':[2,4,8,8,8,4,2],')':[8,4,2,2,2,4,8],
  '"':[10,10,0,0,0,0,0],'&':[12,18,20,8,21,18,13],'_':[0,0,0,0,0,0,31]
};
function textWidth(str, s){ s = s || 1; return Math.max(0, String(str).length * 6 * s - s); }
function drawText(g, str, x, y, col, s, shadow){
  s = s || 1; str = String(str).toUpperCase();
  if (shadow) drawText(g, str, x + s, y + s, shadow, s, null);
  g.fillStyle = col;
  let cx = Math.round(x); y = Math.round(y);
  for (const ch of str){
    const gl = FONT[ch];
    if (gl){
      for (let r = 0; r < 7; r++){
        const bits = gl[r];
        if (!bits) continue;
        for (let c = 0; c < 5; c++) if (bits & (16 >> c)) g.fillRect(cx + c * s, y + r * s, s, s);
      }
    }
    cx += 6 * s;
  }
}
function drawTextC(g, str, cx, y, col, s, shadow){ drawText(g, str, Math.round(cx - textWidth(str, s) / 2), y, col, s, shadow); }

// v0.6: compact 3x5 font for tight HUD slots (each row = 3 bits, MSB = left column)
const TINY = {
  'A':[2,5,7,5,5],'B':[6,5,6,5,6],'C':[3,4,4,4,3],'D':[6,5,5,5,6],'E':[7,4,6,4,7],'F':[7,4,6,4,4],'G':[3,4,5,5,3],'H':[5,5,7,5,5],
  'I':[7,2,2,2,7],'J':[1,1,1,5,2],'K':[5,5,6,5,5],'L':[4,4,4,4,7],'M':[5,7,7,5,5],'N':[6,5,5,5,5],'O':[2,5,5,5,2],'P':[6,5,6,4,4],
  'Q':[2,5,5,6,3],'R':[6,5,6,5,5],'S':[3,4,2,1,6],'T':[7,2,2,2,2],'U':[5,5,5,5,7],'V':[5,5,5,5,2],'W':[5,5,7,7,5],'X':[5,5,2,5,5],
  'Y':[5,5,2,2,2],'Z':[7,1,2,4,7],'0':[7,5,5,5,7],'1':[2,6,2,2,7],'2':[6,1,2,4,7],'3':[6,1,2,1,6],'4':[5,5,7,1,1],'5':[7,4,6,1,6],
  '6':[3,4,7,5,7],'7':[7,1,2,2,2],'8':[7,5,7,5,7],'9':[7,5,7,1,6],'.':[0,0,0,0,2],'-':[0,0,7,0,0],"'":[2,2,0,0,0],'!':[2,2,2,0,2]
,'_':[0,0,0,0,7]
};
function tinyWidth(str){ return Math.max(0, String(str).length * 4 - 1); }
function drawTiny(g, str, x, y, col, shadow){
  str = String(str).toUpperCase();
  if (shadow) drawTiny(g, str, x + 1, y + 1, shadow, null);
  g.fillStyle = col; let cx = Math.round(x); y = Math.round(y);
  for (const ch of str){ const gl = TINY[ch]; if (gl) for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) if (gl[r] & (4 >> c)) g.fillRect(cx + c, y + r, 1, 1); cx += 4; }
}
// draw text inside a fixed-width slot: the normal 5x7 font if it fits, else the 3x5 font (vertically centred on the 7px line),
// else the 3x5 font truncated with a trailing '.'; never draws wider than maxW. Returns the mode used (for tests).
function drawFit(g, str, x, y, maxW, col, shadow){
  str = String(str).toUpperCase();
  if (textWidth(str) <= maxW){ drawText(g, str, x, y, col, 1, shadow); return 'full'; }
  let s = str;
  if (tinyWidth(s) <= maxW){ drawTiny(g, s, x, y + 1, col, shadow); return 'tiny'; }
  while (s.length > 1 && tinyWidth(s + '.') > maxW) s = s.slice(0, -1);
  drawTiny(g, s.trimEnd() + '.', x, y + 1, col, shadow); return 'trunc';
}
