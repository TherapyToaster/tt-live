// TOAST TRUCK: an original angular stainless-steel electric pickup with a bed-mounted minigun.
// The current bro rides in the bed as gunner; a co-driver bro steers from the cab.
// Reusable: placeToastTruck(tx, ty) — hook this up for World 10's moon stretch later.
// Unbranded parody only. No real auto marks or logos anywhere.
'use strict';
const TT_STEEL = { H: '#eef2f8', M: '#c8d0dc', D: '#8b909c', K: '#5a6274', I: '#1a1c22', Y: '#FFD400', C: '#00e5ff', R: '#ff3050', W: '#ffffff' };
const TRUCK_HP = 6, TRUCK_W = 54, TRUCK_H = 22, TRUCK_AIM = Math.PI / 6;
function tCv(w, h, fn){ const c = mkCanvas(w, h), x = c.getContext('2d'); fn(x); return c; }
function tR(x, c, a, b, w, h){ x.fillStyle = c; x.fillRect(a, b, w, h); }
function buildToastTruckSprites(){
  const body = (flip) => tCv(TRUCK_W, TRUCK_H, x => {
    // low, faceted electric pickup: stainless planes, toast-gold trim, no badges
    tR(x, TT_STEEL.I, 2, 12, 50, 8);
    tR(x, TT_STEEL.D, 3, 8, 28, 8); // bed
    tR(x, TT_STEEL.M, 4, 9, 26, 6);
    tR(x, TT_STEEL.K, 5, 10, 24, 1); // crease
    tR(x, TT_STEEL.H, 30, 4, 20, 12); // cab
    tR(x, TT_STEEL.M, 31, 5, 18, 10);
    tR(x, TT_STEEL.Y, 30, 4, 20, 1); // gold roofline
    tR(x, TT_STEEL.I, 33, 6, 13, 6); // window
    tR(x, TT_STEEL.C, 34, 7, 5, 4);
    tR(x, TT_STEEL.H, 46, 10, 7, 6); // wedge nose
    tR(x, TT_STEEL.Y, 51, 11, 2, 3); // headlamp
    tR(x, TT_STEEL.W, 52, 11, 1, 1);
    tR(x, TT_STEEL.Y, 3, 12, 2, 3); // tail lamp
    tR(x, TT_STEEL.I, 6, 16, 8, 6); tR(x, TT_STEEL.K, 7, 17, 6, 4); tR(x, TT_STEEL.W, 8, 18, 2, 2); // rear wheel
    tR(x, TT_STEEL.I, 40, 16, 8, 6); tR(x, TT_STEEL.K, 41, 17, 6, 4); tR(x, TT_STEEL.W, 42, 18, 2, 2);
    tR(x, TT_STEEL.Y, 14, 14, 12, 2); // rocker trim
    // bed rails + gun mount
    tR(x, TT_STEEL.H, 4, 7, 26, 1); tR(x, TT_STEEL.K, 16, 5, 3, 4);
  });
  const wreck = tCv(TRUCK_W, TRUCK_H, x => {
    tR(x, TT_STEEL.K, 4, 14, 46, 6); tR(x, TT_STEEL.D, 8, 10, 20, 6); tR(x, TT_STEEL.I, 30, 11, 16, 8);
    tR(x, TT_STEEL.I, 6, 16, 8, 6); tR(x, TT_STEEL.I, 40, 16, 8, 6);
    tR(x, TT_STEEL.R, 18, 8, 3, 6); tR(x, TT_STEEL.Y, 22, 6, 2, 4);
  });
  const gun = (ang) => tCv(22, 14, x => {
    tR(x, TT_STEEL.I, 2, 5, 6, 6); tR(x, TT_STEEL.D, 3, 6, 4, 4);
    tR(x, TT_STEEL.K, 8, 6, 12, 3); tR(x, TT_STEEL.M, 8, 5, 12, 1); tR(x, TT_STEEL.Y, 19, 6, 2, 3);
  });
  return { bodyR: body(false), bodyL: body(true), wreck, gun, plate: 'TOASTY' };
}

