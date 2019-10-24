// SPDX-License-Identifier: MIT
// Copyright © 2019 Antonin Décimo <antonin.decimo@gmail.com>

import * as THREE from './three.js-r109/build/three.module.js';
import { OrbitControls } from './three.js-r109/examples/jsm/controls/OrbitControls.js';
import Stats from './three.js-r109/examples/jsm/libs/stats.module.js';
"use strict";

let pause = false;
document.body.onkeyup = function(e) {
    if(e.keyCode == 32) {
        pause = !pause;
    }
}

const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const stats = new Stats();
document.body.appendChild(stats.dom);

const light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
scene.add(light);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
const controls = new OrbitControls(camera, renderer.domElement);
camera.position.set(0, 20, 100);
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

world_lines.geometry.computeBoundingBox();
const world_box = world_lines.geometry.boundingBox.clone();

const cone_geometry = new THREE.ConeBufferGeometry(2.5, 5, 16);
const cone_material = new THREE.MeshPhongMaterial({color: 0xffff00});

const boids = new Array(500);

const init_boid = function(i) {
    const mesh = new THREE.Mesh(cone_geometry, cone_material);

    // https://karthikkaranth.me/blog/generating-random-points-in-a-sphere/
    const sphere = function(radius) {
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        const r = Math.cbrt(Math.random());
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);
        return (new THREE.Vector3(sinPhi * cosTheta, sinPhi * sinTheta, cosPhi))
            .multiplyScalar(r * radius);
    }

    mesh.position.copy(sphere(50));

    const velocity = new THREE.Vector3(Math.random(), Math.random(), Math.random());
    return {mesh, velocity};
}

for(let i = 0; i < boids.length; ++i) {
    const boid = init_boid(i);
    scene.add(boid.mesh);
    boids[i] = boid;
}


const accel_towards_center = 100;
const neighbourhood_radius = 10;
const world_box_repulse_speed = 1;

const yaxis = new THREE.Vector3(0, 1, 0);
const update_boids = function() {
    const cm = new THREE.Vector3();
    for(const boid of boids)
        cm.add(boid.mesh.position);

    const v2 = new THREE.Vector3();
    const v3 = new THREE.Vector3();

    for(const boid of boids) {
        const position = boid.mesh.position;

        const v1 = cm.clone()
              .sub(position)
              .divideScalar(boids.length - 1)
              .sub(position)
              .divideScalar(accel_towards_center);

        for(const neigh of boids) {
            if(boid !== neigh) {
                if(position.distanceTo(neigh.mesh.position)
                   < neighbourhood_radius)
                    v2.sub(neigh.mesh.position).add(position);
                v3.add(neigh.velocity);
            }
        }

        v3.divideScalar(boids.length - 1).sub(boid.velocity).divideScalar(8);

        boid.velocity.add(v1).add(v2).add(v3);
        position.add(boid.velocity);
        boid.mesh.quaternion.setFromUnitVectors(yaxis, boid.velocity.clone().normalize());
        v2.set(0, 0, 0);
        v3.set(0, 0, 0);

        if(position.x < world_box.min.x)
            boid.velocity.x += world_box_repulse_speed;
        else if(position.x > world_box.max.x)
            boid.velocity.x -= world_box_repulse_speed;
        if(position.y < world_box.min.y)
            boid.velocity.y += world_box_repulse_speed;
        else if(position.y > world_box.max.y)
            boid.velocity.y -= world_box_repulse_speed;
        if(position.z < world_box.min.z)
            boid.velocity.z += world_box_repulse_speed;
        else if(position.z > world_box.max.z)
            boid.velocity.z -= world_box_repulse_speed;
    }
}

const animate = function(dt) {
    requestAnimationFrame(animate);
    controls.update();
    //if(!pause)
    update_boids();
    renderer.render(scene, camera);
    stats.update();
    pause = true;
};

animate();
