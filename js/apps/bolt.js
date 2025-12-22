// js/apps/bolt.js

import { dummyLocations } from '../data/locations.js';
import { sendLog } from '../logger.js';

let mapInstance = null;
let routeLayers = [];
let currentTask = null;

export function initBolt() {
    console.log('Bolt Initialized');

    const homeLayer = document.getElementById('bolt-home');
    const searchLayer = document.getElementById('bolt-search');
    const bookingLayer = document.getElementById('bolt-booking');
    const searchTrigger = document.getElementById('bolt-search-trigger');
    const searchBack = document.getElementById('bolt-search-back');
    const bookingBack = document.getElementById('bolt-booking-back');
    const realInput = document.getElementById('bolt-real-input');
    const suggestions = document.getElementById('bolt-suggestions');

    // 1. ホーム -> 検索
    if (searchTrigger) {
        searchTrigger.addEventListener('click', () => {
            homeLayer.style.display = 'none';
            searchLayer.style.display = 'flex';
            if(realInput) realInput.focus();
        });
    }

    // 2. 検索画面 -> ホームに戻る
    if (searchBack) {
        searchBack.addEventListener('click', () => {
            searchLayer.style.display = 'none';
            homeLayer.style.display = 'block'; // ホームを表示
        });
    }

    // 3. 配車画面 -> ホームに戻る
    if (bookingBack) {
        bookingBack.addEventListener('click', () => {
            bookingLayer.style.display = 'none';
            homeLayer.style.display = 'block';
        });
    }

    // 4. インクリメンタルサーチ
    if (realInput) {
        sendLog('input_start', { app: 'bolt' });
        realInput.addEventListener('input', (e) => {
            const val = e.target.value.toLowerCase();
            suggestions.innerHTML = '';
            if (val.length === 0) return;

            let candidates = [...dummyLocations];
            
            if (currentTask && currentTask.dest) candidates.unshift(currentTask.dest.name);

            const filtered = candidates.filter(loc => loc.toLowerCase().includes(val));

            filtered.forEach(name => {
                const div = document.createElement('div');
                div.className = 'suggestion-item';
                div.style.padding = '15px';
                div.style.borderBottom = '1px solid #eee';
                div.innerHTML = `<span class="icon">📍</span> ${name}`;
                
                div.addEventListener('click', () => {
                    if (currentTask && currentTask.dest && name === currentTask.dest.name) {
                        sendLog('input_finish', { app: 'bolt', input: name });
                        
                        searchLayer.style.display = 'none';
                        bookingLayer.style.display = 'flex';
                        
                        renderBoltServices();
                        setTimeout(() => drawBoltRoute(currentTask), 100);
                    } else {
                        alert("Wrong destination.");
                    }
                });
                suggestions.appendChild(div);
            });
        });
    }
}

export function updateBolt(task) {
    currentTask = task;
    
    const homeLayer = document.getElementById('bolt-home');
    const searchLayer = document.getElementById('bolt-search');
    const bookingLayer = document.getElementById('bolt-booking');
    
    if(homeLayer) homeLayer.style.display = 'block';
    if(searchLayer) searchLayer.style.display = 'none';
    if(bookingLayer) bookingLayer.style.display = 'none';

    if(document.getElementById('bolt-real-input')) {
        document.getElementById('bolt-real-input').value = '';
    }
}

// ★ Boltリスト動的生成
function renderBoltServices() {
    const panel = document.querySelector('.bolt-vehicle-panel');
    if (!panel) return;

    // ★修正: currentTask.bolt を直接参照
    const services = (currentTask && currentTask.bolt) ? currentTask.bolt : [];
    
    let htmlContent = `<h3>Choose a trip</h3>`;
    
    services.forEach((service, index) => {
        // 1番目を選択状態っぽくする(CSS次第)
        const isSelected = index === 0 ? 'selected-bolt' : ''; 
        
        htmlContent += `
            <div class="vehicle-option ${isSelected}" data-index="${index}">
                <div style="flex:1;">
                    <span class="v-name">${service.type}</span>
                    <span class="v-time" style="font-size:12px; color:#888; margin-left:5px;">${service.wait}</span>
                </div>
                <span class="v-price">${service.cost}</span>
            </div>
        `;
    });

    // 最初のサービスのボタンを表示
    const firstType = services.length > 0 ? services[0].type : 'Bolt';
    htmlContent += `<button class="bolt-confirm-btn">Select ${firstType}</button>`;
    
    panel.innerHTML = htmlContent;

    // イベント再登録
    const options = panel.querySelectorAll('.vehicle-option');
    const btn = panel.querySelector('.bolt-confirm-btn');
    let selectedIdx = 0;

    options.forEach((opt, idx) => {
        opt.addEventListener('click', () => {
            options.forEach(o => o.style.backgroundColor = 'transparent');
            opt.style.backgroundColor = '#f0f9f4'; // 選択時の色
            
            selectedIdx = idx;
            if(btn) btn.innerText = `Select ${services[idx].type}`;
        });
    });
}

function drawBoltRoute(task) {
    if(!task || !task.origin || !task.dest) return;
    
    const mapContainer = document.getElementById('map-bolt');
    if(!mapContainer) return;

    if (!mapInstance) {
        mapInstance = L.map('map-bolt', { zoomControl: false });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapInstance);
    }
    
    mapInstance.invalidateSize();

    if(routeLayers.length > 0) {
        routeLayers.forEach(l => mapInstance.removeLayer(l));
        routeLayers = [];
    }

    const p1 = L.marker([task.origin.lat, task.origin.lng]).addTo(mapInstance);
    // ★修正: destを使用
    const p2 = L.marker([task.dest.lat, task.dest.lng]).addTo(mapInstance);
    
    const line = L.polyline([
        [task.origin.lat, task.origin.lng],
        [task.dest.lat, task.dest.lng]
    ], { color: '#34D186', weight: 6 }).addTo(mapInstance);

    routeLayers.push(p1, p2, line);
    mapInstance.fitBounds(line.getBounds(), { padding: [30, 30] });
}