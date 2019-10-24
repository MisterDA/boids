// SPDX-License-Identifier: MIT
// Copyright © 2019 Antonin Décimo <antonin.decimo@gmail.com>

import * as THREE from './three.js-r109/build/three.module.js';
import { OrbitControls } from './three.js-r109/examples/jsm/controls/OrbitControls.js';
"use strict";

const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
scene.add( light );

const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
const controls = new OrbitControls( camera, renderer.domElement );
camera.position.set( 0, 20, 100 );
controls.update();

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}, false);

const world_geometry = new THREE.BoxBufferGeometry(100, 100, 100);
const world_edges = new THREE.EdgesGeometry(world_geometry);
const world_lines = new THREE.LineSegments(world_edges, new THREE.LineBasicMaterial({color: 0xffffff}));
scene.add(world_lines);

const cone_geometry = new THREE.ConeBufferGeometry(.5, 1, 8);
const cone_material = new THREE.MeshPhongMaterial({color: 0xffff00});

const boids = new Array(1000);

let x = -50, y = -50, z = -50;
const init_boid = function(i) {
    const mesh = new THREE.Mesh(cone_geometry, cone_material);
    mesh.position.x = x;
    mesh.position.y = y;
    mesh.position.z = z;
    x += 10;
    if(x >= 50) {
        x = -50;
        y += 10;
        if(y >= 50) {
            y = -50;
            z += 10;
            if(z >= 50) {
                z = -50;
            }
        }
    }
    const velocity = new THREE.Vector3(5, 5, 5);
    return {mesh, velocity};
}

for(let i = 0; i < boids.length; ++i) {
    const boid = init_boid(i);
    scene.add(boid.mesh);
    boids[i] = boid;
}

const update_boids = function() {
    for (const boid of boids) {
        boid.velocity.addVectors(collision_avoidance(boid),
                                 velocity_matching(boid));
        boid.velocity.add(flock_centering(boid));
    }
}

const animate = function(dt) {
    requestAnimationFrame(animate);
    controls.update();
    update_boids();
    renderer.render(scene, camera);
};

animate();
