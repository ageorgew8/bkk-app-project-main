// js/apps/viabus.js

import { sendLog } from '../logger.js';
let mapInstance = null;
let currentTask = null;
let stopMarkers = []; // バス停マーカー管理用
let busMarkers = [];  // バス現在地マーカー管理用

export function initViaBus() {
    console.log('ViaBus Initialized');
    // 特になし（マップクリックで選択解除などを入れても良い）
}

export function updateViaBus(task) {
    currentTask = task;
    
    // 1. UIリセット
    document.getElementById('viabus-hint').style.display = 'block';
    document.getElementById('viabus-list-container').style.display = 'none';
    const linesContainer = document.getElementById('viabus-lines');
    if (linesContainer) linesContainer.innerHTML = '';

    // 2. 地図初期化
    const mapContainer = document.getElementById('map-viabus');
    if (mapContainer) {
        if (!mapInstance) {
            // 暗めの地図スタイルを使うとViaBusっぽくなりますが、今回は標準OSMでいきます
            mapInstance = L.map('map-viabus', { zoomControl: false }).setView([task.origin.lat, task.origin.lng], 15);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapInstance);
        } else {
            mapInstance.setView([task.origin.lat, task.origin.lng], 15);
            // 地図の表示崩れを防ぐため、再描画をトリガー
            setTimeout(() => mapInstance.invalidateSize(), 100);
        }

        // マーカー全消去
        clearAllMarkers();

        // 3. バス停マーカーを配置
        if (task.viabus && task.viabus.stops) {
            task.viabus.stops.forEach(stop => {
                // カスタムアイコン (黄色い丸)
                const stopIcon = L.divIcon({
                    className: 'custom-div-icon',
                    html: `<div class="viabus-stop-marker">🚏</div>`,
                    iconSize: [30, 30],
                    iconAnchor: [15, 15]
                });

                const marker = L.marker([stop.lat, stop.lng], { icon: stopIcon }).addTo(mapInstance);
                
                // クリックイベント
                marker.on('click', () => {
                    selectStop(stop);
                });

                stopMarkers.push(marker);
            });
        }
    }
}

// バス停選択時の処理
function selectStop(stop) {
    sendLog('stop_select',{stop:stop});
    // 1. パネル切り替え
    document.getElementById('viabus-hint').style.display = 'none';
    const listContainer = document.getElementById('viabus-list-container');
    listContainer.style.display = 'block';
    
    document.getElementById('viabus-stop-name').innerText = stop.name;
    const linesContainer = document.getElementById('viabus-lines');
    linesContainer.innerHTML = '';

    // 2. 古いバスマーカーを消す
    clearBusMarkers();

    // 3. バス一覧生成 & 地図上にバス配置
    stop.lines.forEach(line => {
        // (A) リストに追加
        const row = document.createElement('div');
        row.className = 'viabus-line-row';
        row.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px;">
                <span style="background:${line.color || '#333'}; padding:5px 10px; border-radius:5px; font-weight:bold; color:white;">${line.number}</span>
                <span style="font-size:14px; color:#ccc;">To: ${line.dest}</span>
            </div>
            <div style="text-align:right;">
                <div style="font-size:18px; color:#F8E71C; font-weight:bold;">${line.wait}</div>
            </div>
        `;
        linesContainer.appendChild(row);

        // (B) 地図にバス現在地マーカーを追加
        if (line.busLat && line.busLng) {
            const heading = line.heading || 0;
            const busColor = line.color || '#F8E71C';

            // 1. 枠（アイコン全体）の回転: 進行方向へ
            const containerStyle = `transform: rotate(${heading}deg);`;
            
            // 2. 文字の逆回転: 進行方向と逆へ回して、常に水平を保つ
            // ※ translate(-50%, -50%) は中心に配置するために必須
            const textStyle = `transform: translate(-50%, -50%) rotate(${-heading}deg);`;

            const busIcon = L.divIcon({
                className: 'bus-marker-container',
                html: `
                    <div class="bus-marker-body" style="${containerStyle}">
                        <div class="bus-shape" style="background: ${busColor};"></div>
                        <span class="bus-text" style="${textStyle}">${line.number}</span>
                    </div>
                `,
                iconSize: [32, 32], 
                iconAnchor: [16, 16]
            });

            const bMarker = L.marker([line.busLat, line.busLng], { icon: busIcon }).addTo(mapInstance);
            busMarkers.push(bMarker);
        }
    // 地図の視点をバス停中心に少し調整
    mapInstance.setView([stop.lat, stop.lng], 15);
    });
}

function clearAllMarkers() {
    clearBusMarkers();
    stopMarkers.forEach(m => mapInstance.removeLayer(m));
    stopMarkers = [];
}

function clearBusMarkers() {
    busMarkers.forEach(m => mapInstance.removeLayer(m));
    busMarkers = [];
}