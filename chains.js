// SPDX-License-Identifier: MIT
// Copyright © 2019 Antonin Décimo <antonin.decimo@gmail.com>

import * as THREE from './three.js/build/three.module.js';
import { OrbitControls } from './three.js/examples/jsm/controls/OrbitControls.js';
import Stats from './three.js/examples/jsm/libs/stats.module.js';
import { GLTFLoader } from './three.js/examples/jsm/loaders/GLTFLoader.js';

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
camera.position.set(5, 5, 5);
controls.update();

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}, false);




// Create the target
const target = new THREE.Mesh(
    new THREE.SphereGeometry(0.1),
    new THREE.MeshBasicMaterial({color: 0xff0000}));
target.position.z = 2;
const pivot = new THREE.Object3D();
pivot.add(target);
scene.add(pivot);


class Chain {
    constructor(length) {
        this.joints = new Array(length);
    }
}

class Joint {
    constructor(bone, constraint, target) {
        this.bone = bone;
        this.constraint = constraint;
        this.target = target;
    }
}


// Create the arm
const bones = new Array(10);

const rootBone = new Three.Bone();
rootBone.position.y = 0;
bones.push(rootBone);

for(let i = 1; i < bones.length; ++i) {
    const bone = new THREE.Bone();
    bone.position.y = 0.5;
    bones[i-1].add(bone);
}





const animate = function(dt) {
    requestAnimationFrame(animate);
    controls.update();
    stats.update();
    if(pause) {}
    renderer.render(scene, camera);
};

animate();
