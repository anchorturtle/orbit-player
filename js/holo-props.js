/* img2threejs-style, in-repo, no Python forge:
 * 1. Optional tiny refs in assets/holo-props/ (red / blue / black only).
 * 2. Factories return THREE.Group from primitives + lathe/extrude + edge lines.
 * 3. Spawn as fly-bys / projectiles (never planet orbits). Nose along -Z for lookAt.
 * 4. Materials depthTest against the globe (never show through the disc).
 * 5. Tick from space3d; live cosmic never loads this path.
 */
(function (root) {
  'use strict';

  var BLUE = 0x1A58E8;
  var BLUE_HOT = 0x2D6BFF;
  var RED = 0xC41422;
  var craft = [];
  var THREERef = null;
  var parentRef = null;
  var planetR = 2.15;
  var mats = null;
  var nextSpawn = 1.8;
  var maxLive = 7;
  var _look = null;
  var _fwd = null;

  function lineMat(THREE, color, opacity) {
    return new THREE.LineBasicMaterial({
      color: color,
      transparent: true,
      opacity: opacity == null ? 0.82 : opacity,
      depthWrite: false,
      depthTest: true
    });
  }

  function boxEdges(THREE, w, h, d, mat) {
    var hw = w * 0.5, hh = h * 0.5, hd = d * 0.5;
    var c = [
      [-hw, -hh, -hd], [hw, -hh, -hd], [hw, hh, -hd], [-hw, hh, -hd],
      [-hw, -hh, hd], [hw, -hh, hd], [hw, hh, hd], [-hw, hh, hd]
    ];
    var e = [0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7];
    var pos = [];
    var i;
    for (i = 0; i < e.length; i++) pos.push(c[e[i]][0], c[e[i]][1], c[e[i]][2]);
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    return new THREE.LineSegments(geo, mat);
  }

  function linePts(THREE, pts, mat) {
    return new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat);
  }

  function ring(THREE, r, segs, mat) {
    var pts = [];
    var i;
    for (i = 0; i <= segs; i++) {
      var a = (i / segs) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0));
    }
    return linePts(THREE, pts, mat);
  }

  function dishLathe(THREE, r, depth, segs, mat) {
    var pts = [];
    var i;
    for (i = 0; i <= 10; i++) {
      var t = i / 10;
      pts.push(new THREE.Vector2(r * t, depth * t * t));
    }
    return new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.LatheGeometry(pts, segs)), mat);
  }

  function hexRing(THREE, r, thick, mat) {
    var sh = new THREE.Shape();
    var i, a, x, y;
    for (i = 0; i < 6; i++) {
      a = (i / 6) * Math.PI * 2 - Math.PI / 6;
      x = Math.cos(a) * r;
      y = Math.sin(a) * r;
      if (i === 0) sh.moveTo(x, y);
      else sh.lineTo(x, y);
    }
    sh.closePath();
    var hole = new THREE.Path();
    for (i = 0; i < 6; i++) {
      a = (i / 6) * Math.PI * 2 - Math.PI / 6;
      x = Math.cos(a) * (r - thick);
      y = Math.sin(a) * (r - thick);
      if (i === 0) hole.moveTo(x, y);
      else hole.lineTo(x, y);
    }
    hole.closePath();
    sh.holes.push(hole);
    var geo = new THREE.ExtrudeGeometry(sh, { depth: 0.045, bevelEnabled: false });
    return new THREE.LineSegments(new THREE.EdgesGeometry(geo, 15), mat);
  }

  /* Nose = -Z so Object3D.lookAt aims the craft where it is going. */
  function makeSat(THREE, blue, red) {
    var g = new THREE.Group();
    var bus = boxEdges(THREE, 0.22, 0.16, 0.38, blue);
    g.add(bus);
    g.add(boxEdges(THREE, 0.12, 0.1, 0.16, blue));
    var i, pan, cell, strut;
    for (i = 0; i < 2; i++) {
      pan = new THREE.Group();
      pan.position.x = i ? 0.52 : -0.52;
      pan.add(boxEdges(THREE, 0.56, 0.01, 0.28, blue));
      cell = boxEdges(THREE, 0.16, 0.006, 0.1, blue);
      cell.position.set(-0.16, 0, -0.06);
      pan.add(cell);
      cell = boxEdges(THREE, 0.16, 0.006, 0.1, blue);
      cell.position.set(0.16, 0, 0.06);
      pan.add(cell);
      strut = boxEdges(THREE, 0.18, 0.012, 0.012, blue);
      strut.position.x = i ? -0.18 : 0.18;
      pan.add(strut);
      g.add(pan);
    }
    var dish = dishLathe(THREE, 0.1, 0.07, 12, red);
    dish.position.set(0, 0.14, -0.06);
    dish.rotation.x = Math.PI;
    g.add(dish);
    g.add(linePts(THREE, [
      new THREE.Vector3(0, 0.08, -0.04),
      new THREE.Vector3(0, 0.2, -0.12)
    ], red));
    var boom = boxEdges(THREE, 0.018, 0.018, 0.32, blue);
    boom.position.z = 0.28;
    g.add(boom);
    var thruster = boxEdges(THREE, 0.07, 0.07, 0.06, red);
    thruster.position.z = 0.22;
    g.add(thruster);
    var ant = ring(THREE, 0.08, 10, blue);
    ant.position.set(0.08, 0.12, -0.16);
    ant.rotation.y = 0.4;
    g.add(ant);
    return g;
  }

  function makeGate(THREE, blue, red) {
    var g = new THREE.Group();
    g.add(hexRing(THREE, 0.5, 0.07, blue));
    var inner = hexRing(THREE, 0.32, 0.04, red);
    inner.position.z = 0.03;
    g.add(inner);
    var rim = ring(THREE, 0.56, 20, blue);
    rim.position.z = -0.02;
    g.add(rim);
    var i, chev;
    for (i = 0; i < 6; i++) {
      chev = boxEdges(THREE, 0.07, 0.025, 0.025, blue);
      var a = (i / 6) * Math.PI * 2;
      chev.position.set(Math.cos(a) * 0.2, Math.sin(a) * 0.2, 0.05);
      chev.rotation.z = a;
      g.add(chev);
    }
    return g;
  }

  function makeProbe(THREE, blue, red) {
    var g = new THREE.Group();
    g.add(boxEdges(THREE, 0.1, 0.1, 0.46, blue));
    var mid = boxEdges(THREE, 0.14, 0.14, 0.12, blue);
    mid.position.z = 0.04;
    g.add(mid);
    var nose = dishLathe(THREE, 0.07, 0.16, 10, red);
    nose.position.z = -0.32;
    nose.rotation.x = Math.PI / 2;
    g.add(nose);
    var bell = boxEdges(THREE, 0.11, 0.11, 0.08, blue);
    bell.position.z = 0.3;
    g.add(bell);
    var i, vane, ant;
    for (i = 0; i < 4; i++) {
      var a = (i / 4) * Math.PI * 2;
      vane = boxEdges(THREE, 0.01, 0.18, 0.12, blue);
      vane.position.set(Math.cos(a) * 0.1, Math.sin(a) * 0.1, 0.02);
      vane.rotation.z = a;
      g.add(vane);
    }
    for (i = 0; i < 3; i++) {
      a = (i / 3) * Math.PI * 2;
      ant = linePts(THREE, [
        new THREE.Vector3(0, 0.04, -0.12),
        new THREE.Vector3(Math.cos(a) * 0.24, Math.sin(a) * 0.24, -0.34)
      ], blue);
      g.add(ant);
    }
    return g;
  }

  function makeRelay(THREE, blue, red) {
    var g = new THREE.Group();
    g.add(boxEdges(THREE, 0.14, 0.14, 0.18, blue));
    var d1 = dishLathe(THREE, 0.22, 0.1, 14, blue);
    d1.position.x = 0.12;
    d1.rotation.z = Math.PI / 2;
    g.add(d1);
    var d2 = dishLathe(THREE, 0.16, 0.08, 12, red);
    d2.position.y = 0.12;
    d2.rotation.x = Math.PI;
    g.add(d2);
    var boom = boxEdges(THREE, 0.02, 0.02, 0.4, blue);
    boom.position.z = 0.24;
    g.add(boom);
    var tip = boxEdges(THREE, 0.05, 0.05, 0.05, red);
    tip.position.z = 0.46;
    g.add(tip);
    var wing = boxEdges(THREE, 0.42, 0.008, 0.1, blue);
    wing.position.y = -0.08;
    g.add(wing);
    return g;
  }

  function makeTug(THREE, blue, red) {
    var g = new THREE.Group();
    g.add(boxEdges(THREE, 0.18, 0.12, 0.42, blue));
    var cab = boxEdges(THREE, 0.12, 0.1, 0.14, blue);
    cab.position.set(0, 0.1, -0.12);
    g.add(cab);
    var boom = boxEdges(THREE, 0.52, 0.028, 0.028, blue);
    boom.position.set(0.2, 0.12, -0.04);
    boom.rotation.z = -0.22;
    boom.rotation.y = 0.15;
    g.add(boom);
    g.add(linePts(THREE, [
      new THREE.Vector3(0.42, 0.06, -0.08),
      new THREE.Vector3(0.48, -0.14, -0.1)
    ], red));
    var claw = boxEdges(THREE, 0.09, 0.04, 0.07, red);
    claw.position.set(0.48, -0.16, -0.1);
    g.add(claw);
    var i, thr;
    for (i = -1; i <= 1; i += 2) {
      thr = boxEdges(THREE, 0.05, 0.05, 0.1, blue);
      thr.position.set(i * 0.08, -0.02, 0.26);
      g.add(thr);
    }
    return g;
  }

  function makeCruiser(THREE, blue, red) {
    var g = new THREE.Group();
    g.add(boxEdges(THREE, 0.16, 0.1, 0.72, blue));
    var a = boxEdges(THREE, 0.2, 0.12, 0.2, blue);
    a.position.z = -0.18;
    g.add(a);
    var b = boxEdges(THREE, 0.14, 0.08, 0.16, blue);
    b.position.z = 0.18;
    g.add(b);
    var nose = boxEdges(THREE, 0.08, 0.06, 0.14, red);
    nose.position.z = -0.44;
    g.add(nose);
    var i, fin, thr;
    for (i = -1; i <= 1; i += 2) {
      fin = boxEdges(THREE, 0.22, 0.01, 0.12, blue);
      fin.position.set(i * 0.18, 0, 0.08);
      fin.rotation.z = i * 0.18;
      g.add(fin);
      thr = boxEdges(THREE, 0.05, 0.05, 0.1, red);
      thr.position.set(i * 0.06, 0, 0.42);
      g.add(thr);
    }
    var mast = boxEdges(THREE, 0.016, 0.16, 0.016, blue);
    mast.position.set(0, 0.14, -0.1);
    g.add(mast);
    var hoop = ring(THREE, 0.07, 10, blue);
    hoop.position.set(0, 0.22, -0.1);
    hoop.rotation.x = Math.PI / 2;
    g.add(hoop);
    return g;
  }

  function makeDrone(THREE, blue, red) {
    var g = new THREE.Group();
    g.add(boxEdges(THREE, 0.1, 0.06, 0.14, blue));
    var i, arm, tip;
    for (i = 0; i < 4; i++) {
      var a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      arm = boxEdges(THREE, 0.22, 0.012, 0.012, blue);
      arm.position.set(Math.cos(a) * 0.12, Math.sin(a) * 0.08, 0);
      arm.rotation.z = a;
      g.add(arm);
      tip = boxEdges(THREE, 0.04, 0.04, 0.04, i < 2 ? red : blue);
      tip.position.set(Math.cos(a) * 0.24, Math.sin(a) * 0.14, 0);
      g.add(tip);
    }
    var eye = boxEdges(THREE, 0.04, 0.04, 0.04, red);
    eye.position.z = -0.1;
    g.add(eye);
    return g;
  }

  var FACTORIES = [makeSat, makeGate, makeProbe, makeRelay, makeTug, makeCruiser, makeDrone];

  function randDir(THREE) {
    var v = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
    if (v.lengthSq() < 0.0001) v.set(1, 0, 0);
    return v.normalize();
  }

  function makePath(THREE) {
    var kind = Math.random();
    var far = 16 + Math.random() * 14;
    var nearScale = 0.7 + Math.random() * 1.15;
    var miss = planetR * (1.35 + Math.random() * 4.2);
    var from, to, speed, coast0, coast1;
    var inbound = randDir(THREE);
    var perp = randDir(THREE).cross(inbound);
    if (perp.lengthSq() < 0.0001) perp.set(0, 1, 0);
    perp.normalize();
    var missPt = perp.multiplyScalar(miss * (Math.random() < 0.5 ? 1 : -1));
    missPt.y += (Math.random() - 0.4) * 2.4;

    if (kind < 0.4) {
      from = inbound.clone().multiplyScalar(far);
      from.y += (Math.random() - 0.35) * 3.2;
      to = inbound.clone().multiplyScalar(-far * 0.85).add(missPt);
      to.y += (Math.random() - 0.5) * 1.6;
    } else if (kind < 0.7) {
      from = new THREE.Vector3(
        (Math.random() < 0.5 ? -1 : 1) * far,
        (Math.random() - 0.35) * 3.4,
        (Math.random() - 0.2) * (planetR * 2.8 + 6)
      );
      to = from.clone();
      to.x *= -0.9;
      to.y += (Math.random() - 0.5) * 2.2;
      to.z += (Math.random() - 0.5) * 4;
    } else if (kind < 0.88) {
      from = new THREE.Vector3((Math.random() - 0.5) * 10, 6.2 + Math.random() * 2.4, 4 + Math.random() * 5);
      to = new THREE.Vector3((Math.random() - 0.5) * 8, -3.2 - Math.random(), -7 - Math.random() * 5);
    } else {
      from = new THREE.Vector3((Math.random() - 0.5) * 8, -2.8, 5 + Math.random() * 4);
      to = new THREE.Vector3((Math.random() - 0.5) * 10, 5.4 + Math.random(), -8 - Math.random() * 4);
    }

    speed = 0.22 + Math.random() * 0.4;
    if (Math.random() < 0.16) speed *= 2.4;
    coast0 = 0.72 + Math.random() * 0.5;
    coast1 = 0.55 + Math.random() * 0.7;
    return { from: from, to: to, speed: speed, coast0: coast0, coast1: coast1, scale: nearScale };
  }

  function spawnOne() {
    if (!THREERef || !parentRef || !mats) return;
    if (craft.length >= maxLive) return;
    var THREE = THREERef;
    var fn = FACTORIES[(Math.random() * FACTORIES.length) | 0];
    var obj = fn(THREE, mats.blue, Math.random() < 0.42 ? mats.red : mats.hot);
    var path = makePath(THREE);
    var dist = path.from.distanceTo(path.to);
    obj.name = 'holoFly' + Date.now().toString(36);
    obj.userData = {
      from: path.from,
      to: path.to,
      k: 0,
      dist: dist,
      speed: path.speed,
      coast0: path.coast0,
      coast1: path.coast1,
      bank: (Math.random() - 0.5) * 0.45
    };
    obj.position.copy(path.from);
    obj.scale.setScalar(path.scale);
    parentRef.add(obj);
    craft.push(obj);
  }

  function spawn(THREE, parent, opts) {
    if (!THREE || !parent) return [];
    opts = opts || {};
    THREERef = THREE;
    parentRef = parent;
    planetR = opts.planetR || 2.15;
    _look = new THREE.Vector3();
    _fwd = new THREE.Vector3();
    mats = {
      blue: lineMat(THREE, BLUE, 0.86),
      hot: lineMat(THREE, BLUE_HOT, 0.74),
      red: lineMat(THREE, RED, 0.7)
    };
    while (craft.length) {
      var dead = craft.pop();
      if (dead.parent) dead.parent.remove(dead);
    }
    maxLive = (typeof window !== 'undefined' && window.innerWidth < 768) ? 3 : 7;
    spawnOne();
    spawnOne();
    spawnOne();
    spawnOne();
    if (craft[0]) craft[0].userData.k = 0.22;
    if (craft[1]) craft[1].userData.k = 0.48;
    nextSpawn = 4 + Math.random() * 7;
    return craft;
  }

  function tick(t, dt) {
    nextSpawn -= dt;
    if (nextSpawn <= 0) {
      spawnOne();
      nextSpawn = 5 + Math.random() * 10;
    }
    var i, m, u, coast;
    for (i = craft.length - 1; i >= 0; i--) {
      m = craft[i];
      u = m.userData;
      coast = u.coast0 + (u.coast1 - u.coast0) * u.k;
      u.k += (dt * u.speed * coast) / Math.max(0.001, u.dist);
      if (u.k >= 1) {
        if (m.parent) m.parent.remove(m);
        craft.splice(i, 1);
        continue;
      }
      m.position.lerpVectors(u.from, u.to, u.k);
      if (m.position.y < -1.65) m.position.y = -1.65;
      _fwd.subVectors(u.to, u.from);
      if (_fwd.lengthSq() < 1e-8) continue;
      _fwd.normalize();
      _look.copy(m.position).add(_fwd);
      m.lookAt(_look);
      m.rotateZ(u.bank);
    }
  }

  root.HoloProps = {
    spawn: spawn,
    tick: tick,
    makeSat: makeSat,
    makeGate: makeGate,
    makeProbe: makeProbe,
    makeCruiser: makeCruiser,
    makeDrone: makeDrone
  };
})(window);
