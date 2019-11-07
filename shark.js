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
camera.position.set(0, 20, 100);
controls.update();

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}, false);


let shark;
function dumpObject(obj, lines = [], isLast = true, prefix = '') {
    const localPrefix = isLast ? '└─' : '├─';
    lines.push(`${prefix}${prefix ? localPrefix : ''}${obj.name || '*no-name*'} [${obj.type}]`);
    const newPrefix = prefix + (isLast ? '  ' : '│ ');
    const lastNdx = obj.children.length - 1;
    obj.children.forEach((child, ndx) => {
        const isLast = ndx === lastNdx;
        dumpObject(child, lines, isLast, newPrefix);
    });
    return lines;
}

const loader = new GLTFLoader();
loader.load('./models/scene.gltf', function (gltf) {
    scene.add(gltf.scene);
    console.log(dumpObject(gltf.scene).join('\n'));
}, undefined, function (error) {
    console.error(error);
});


const animate = function(dt) {
    requestAnimationFrame(animate);
    controls.update();
    if(!pause) {}
    renderer.render(scene, camera);
    stats.update();
};

animate();
