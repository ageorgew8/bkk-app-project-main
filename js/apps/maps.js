// js/apps/maps.js

import { dummyLocations } from '../data/locations.js'; // パスは環境に合わせて調整
import { sendLog } from '../logger.js';

// --- 1. 変数定義 ---
let mapInstance = null;
let routeLayers = [];
let currentTask = null;
let currentMode = 'transit'; // デフォルトは公共交通

// --- 2. 初期化関数 ---
export function initGoogleMap() {
    console.log('Google Map Initialized');

    const input = document.getElementById('gmap-input');
    const suggestions = document.getElementById('gmap-suggestions');
    const bottomSheet = document.getElementById('gmap-bottom-sheet');
    const tabBtns = document.querySelectorAll('.gmap-tabs .tab-btn');

    // --- 1. 文字入力と候補表示 ---
    if (input) {
        sendLog('input_start');
        input.addEventListener('input', (e) => {
            const val = e.target.value.toLowerCase();
            suggestions.style.display = 'block';
            bottomSheet.classList.remove('show'); // 検索中は結果を隠す
            
            // 候補リスト生成 (正解 + ダミー)
            let candidates = [...dummyLocations];
            if (currentTask) candidates.unshift(currentTask.dest.name); // 正解を先頭に混ぜるか、リストに含める

            // フィルタリング
            const filtered = candidates.filter(loc => loc.toLowerCase().includes(val));
            
            // HTML生成
            suggestions.innerHTML = '';
            filtered.forEach(name => {
                const div = document.createElement('div');
                div.className = 'suggestion-item';
                div.innerHTML = `<span class="icon">📍</span> <span>${name}</span>`;
                
                // クリック時の処理
                div.addEventListener('click', () => {
                    input.value = name;
                    suggestions.style.display = 'none';
                    
                    // 正解を選んだ場合のみルート表示 (実験なので簡易判定)
                    if (currentTask && name === currentTask.dest.name) {
                        sendLog('input_finish',{input: name});
                        drawRoute(currentTask);
                        bottomSheet.classList.add('show');
                        renderRouteList(); // リスト更新
                    } else {
                        alert("Not the task destination!"); // 簡易エラー
                    }
                });
                suggestions.appendChild(div);
            });
        });

        // フォーカスしただけでも候補を出す
        input.addEventListener('focus', () => {
             if(input.value === "") input.dispatchEvent(new Event('input'));
        });
    }

    // --- 2. タブ切り替え ---
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // 見た目の更新
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // モード更新
            currentMode = btn.dataset.mode;
            renderRouteList();
        });
    });
}


// --- 3. 更新関数 ---
export function updateGoogleMap(task) {
    currentTask = task;
    // リセット処理
    document.getElementById('gmap-input').value = "";
    document.getElementById('gmap-suggestions').style.display = 'none';
    document.getElementById('gmap-bottom-sheet').classList.remove('show');
    document.querySelectorAll('#google-map .task-destination').forEach(el => el.innerText = task.dest.name);

    if (!mapInstance) {
        mapInstance = L.map('map-google', { zoomControl: false }).setView([task.origin.lat, task.origin.lng], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapInstance);
    } else {
        clearRoute();
        mapInstance.setView([task.origin.lat, task.origin.lng], 13);
    }
}

// 内部関数: ルートリストの描画
function renderRouteList() {
    const listContainer = document.getElementById('gmap-route-list');
    listContainer.innerHTML = '';
    
    // 1. データ参照先を修正: currentTask.google.routes を参照
    const routesData = (currentTask && currentTask.google) ? currentTask.google.routes : null;

    if (!routesData) {
        console.error("Route data not found in currentTask.google.routes");
        return;
    }

    // 2. フィルタリング条件を修正: r.mode ではなく r.type を使用
    // currentMode はタブの data-mode ("transit", "car", "walk") と一致する必要があります
    const filteredRoutes = routesData.filter(r => r.type === currentMode);

    if (filteredRoutes.length === 0) {
        listContainer.innerHTML = '<div class="no-routes-msg">No routes found for this mode.</div>';
        return;
    }

    filteredRoutes.forEach(route => {
        const row = document.createElement('div');
        row.className = 'route-row';

        // 3. HTML生成: プロパティ名を修正 (route.time, route.type)
        // 右側に time, cost を配置するレイアウトは維持
        row.innerHTML = `
            <div class="route-left">
                <div class="route-summary">${route.summary}</div>
                <div class="route-details">${route.details}</div>
            </div>
            <div class="route-right">
                <div class="route-time">${route.time}</div>
                <div class="route-cost">${route.cost}</div>
            </div>
        `;

        listContainer.appendChild(row);
    });
}

// --- ヘルパー関数 ---
function drawRoute(task) {
    if (!mapInstance) return;
    clearRoute();

    const originMarker = L.marker([task.origin.lat, task.origin.lng]).addTo(mapInstance);
    const destMarker = L.marker([task.dest.lat, task.dest.lng]).addTo(mapInstance);

    const routeLine = L.polyline([
        [task.origin.lat, task.origin.lng],
        [task.dest.lat, task.dest.lng]
    ], { color: '#4285F4', weight: 5, opacity: 0.8 }).addTo(mapInstance);

    routeLayers.push(originMarker, destMarker, routeLine);
    mapInstance.fitBounds(routeLine.getBounds(), { padding: [50, 50] });
}

function clearRoute() {
    if (mapInstance && routeLayers.length > 0) {
        routeLayers.forEach(l => mapInstance.removeLayer(l));
        routeLayers = [];
    }
}