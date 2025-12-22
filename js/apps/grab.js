// js/apps/grab.js

import { dummyLocations } from '../data/locations.js';
import { sendLog } from '../logger.js';

let mapInstance = null;
let currentTask = null;
let routeLayers = [];
let selectedService = null;

export function initGrab() {
    console.log('Grab Initialized');

    // 画面要素
    const superHome = document.getElementById('grab-super-home');
    const inputScreen = document.getElementById('grab-input-screen');
    const bookingScreen = document.getElementById('grab-booking');
    
    // ボタン・入力要素
    const transportBtn = document.getElementById('grab-transport-btn');
    const input = document.getElementById('grab-input');
    const suggestions = document.getElementById('grab-suggestions');
    const inputBackBtn = document.getElementById('grab-home-back');
    const bookingBackBtn = document.getElementById('grab-back-arrow');

    // 1. スーパーアプリ画面 -> Transport画面
    if (transportBtn) {
        transportBtn.addEventListener('click', () => {
            superHome.style.display = 'none';
            inputScreen.style.display = 'block';
            if(input) input.focus();
        });
    }

    // 2. 検索入力ロジック
    if (input) {
        sendLog('input_start', { app: 'grab' });
        input.addEventListener('input', (e) => {
            const val = e.target.value.toLowerCase();
            suggestions.innerHTML = '';

            if (val.length === 0) return;

            let candidates = [...dummyLocations];
            
            // ★修正: apps階層なし、destを使用
            if (currentTask && currentTask.dest) candidates.unshift(currentTask.dest.name);

            const filtered = candidates.filter(loc => loc.toLowerCase().includes(val));

            filtered.forEach(name => {
                const div = document.createElement('div');
                div.className = 'suggestion-item';
                div.innerHTML = `<span class="icon" style="margin-right:10px">📍</span> <span>${name}</span>`;
                
                div.addEventListener('click', () => {
                    // ★修正: destを使用
                    if (currentTask && currentTask.dest && name === currentTask.dest.name) {
                        sendLog('input_finish', { app: 'grab', input: name });
                        
                        inputScreen.style.display = 'none';
                        bookingScreen.style.display = 'flex';
                        
                        // 動的リスト生成と地図描画
                        renderGrabServices();
                        drawGrabRoute(currentTask);

                    } else {
                        alert("Wrong destination.");
                    }
                });
                suggestions.appendChild(div);
            });
        });
    }

    // 3. 戻るボタン (Booking -> Input)
    if (bookingBackBtn) {
        bookingBackBtn.addEventListener('click', () => {
            bookingScreen.style.display = 'none';
            inputScreen.style.display = 'block';
        });
    }

    // 4. 戻るボタン (Input -> Super Home)
    if (inputBackBtn) {
        inputBackBtn.addEventListener('click', () => {
            inputScreen.style.display = 'none';
            superHome.style.display = 'block';
            input.value = "";
            suggestions.innerHTML = "";
        });
    }
}

export function updateGrab(task) {
    currentTask = task;
    
    const superHome = document.getElementById('grab-super-home');
    const inputScreen = document.getElementById('grab-input-screen');
    const bookingScreen = document.getElementById('grab-booking');
    const input = document.getElementById('grab-input');
    const suggestions = document.getElementById('grab-suggestions');

    if(superHome) superHome.style.display = 'block';
    if(inputScreen) inputScreen.style.display = 'none';
    if(bookingScreen) bookingScreen.style.display = 'none';
    if(input) input.value = "";
    if(suggestions) suggestions.innerHTML = "";

    if (!mapInstance) {
        mapInstance = L.map('map-grab', { zoomControl: false }).setView([13.736717, 100.523186], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapInstance);
    } else {
        if(task && task.origin) mapInstance.setView([task.origin.lat, task.origin.lng], 13);
    }
}

// ★ 配車リスト動的生成
function renderGrabServices() {
    const listContainer = document.querySelector('.service-list');
    const bookBtn = document.querySelector('.grab-btn');
    
    listContainer.innerHTML = '';
    selectedService = null;

    // ★修正: currentTask.grab を直接参照
    const services = (currentTask && currentTask.grab) ? currentTask.grab : [];

    services.forEach((service, index) => {
        const item = document.createElement('div');
        item.className = 'service-item';
        
        if (index === 0) {
            item.classList.add('selected');
            selectedService = service;
            if(bookBtn) bookBtn.innerText = `Book ${service.type}`;
        }

        item.innerHTML = `
            <span class="service-name">${service.type}</span>
            <div style="text-align:right">
                <div class="service-price">${service.cost}</div>
                <div style="font-size:10px; color:#888;">${service.wait || ''}</div>
            </div>
        `;

        item.addEventListener('click', () => {
            document.querySelectorAll('.grab-booking .service-item').forEach(el => el.classList.remove('selected'));
            item.classList.add('selected');
            selectedService = service;
            if(bookBtn) bookBtn.innerText = `Book ${service.type}`;
        });

        listContainer.appendChild(item);
    });
}

function drawGrabRoute(task) {
    if (!mapInstance || !task || !task.dest) return;
    
    setTimeout(() => mapInstance.invalidateSize(), 100);

    if (routeLayers.length > 0) {
        routeLayers.forEach(l => mapInstance.removeLayer(l));
        routeLayers = [];
    }

    const originMarker = L.marker([task.origin.lat, task.origin.lng]).addTo(mapInstance);
    // ★修正: destを使用
    const destMarker = L.marker([task.dest.lat, task.dest.lng]).addTo(mapInstance);

    const routeLine = L.polyline([
        [task.origin.lat, task.origin.lng],
        [task.dest.lat, task.dest.lng]
    ], { color: '#00B14F', weight: 6 }).addTo(mapInstance);

    routeLayers.push(originMarker, destMarker, routeLine);
    mapInstance.fitBounds(routeLine.getBounds(), { padding: [50, 80] });
}