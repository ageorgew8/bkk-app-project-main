// js/apps/moovit.js

import { dummyLocations } from '../data/locations.js';
import { sendLog } from '../logger.js';
let mapInstance = null;
let currentTask = null;
let routeLayers = [];

export function initMoovit() {
    console.log('Moovit Initialized');

    const input = document.getElementById('moovit-input');
    const suggestions = document.getElementById('moovit-suggestions');
    const searchState = document.getElementById('moovit-search-state');
    const resultState = document.getElementById('moovit-result-state');
    const backBtn = document.getElementById('moovit-back-btn');

    // --- 1. 検索入力と候補表示 ---
    if (input) {
        sendLog('input_start');
        input.addEventListener('input', (e) => {
            const val = e.target.value.toLowerCase();
            suggestions.innerHTML = ''; // クリア

            if (val.length === 0) return;

            // 正解(タスクの目的地) + ダミーデータ
            let candidates = [...dummyLocations];
            if (currentTask) candidates.unshift(currentTask.dest.name);

            // 絞り込み
            const filtered = candidates.filter(loc => loc.toLowerCase().includes(val));

            // リスト表示
            filtered.forEach(name => {
                const div = document.createElement('div');
                div.className = 'suggestion-item';
                div.innerHTML = `<span class="icon" style="margin-right:10px">📍</span> <span>${name}</span>`;
                
                div.addEventListener('click', () => {
                    // 正解判定
                    if (currentTask && name === currentTask.dest.name) {
                        sendLog('input_finish',{input: name});
                        // 画面切り替え
                        searchState.style.display = 'none';
                        resultState.style.display = 'block';
                        renderMoovitResults(currentTask);
                    } else {
                        alert("That is not the correct destination for this task.");
                    }
                });
                suggestions.appendChild(div);
            });
        });
    }

    // --- 2. 戻るボタン ---
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            resultState.style.display = 'none';
            searchState.style.display = 'block';
            input.value = "";
            suggestions.innerHTML = "";
        });
    }
}

export function updateMoovit(task) {
    currentTask = task;
    
    // 状態リセット
    const searchState = document.getElementById('moovit-search-state');
    const resultState = document.getElementById('moovit-result-state');
    const input = document.getElementById('moovit-input');
    const suggestions = document.getElementById('moovit-suggestions');

    if(searchState) searchState.style.display = 'block';
    if(resultState) resultState.style.display = 'none';
    if(input) input.value = "";
    if(suggestions) suggestions.innerHTML = "";

    // 目的地名の更新
    document.querySelectorAll('#moovit .task-destination').forEach(el => el.innerText = task.dest.name);
}

// 結果リスト生成
function renderMoovitResults(task) {
    const listContainer = document.getElementById('moovit-results');
    if (!listContainer || !task.moovit || !task.moovit.routes) return;

    listContainer.innerHTML = '';

    task.moovit.routes.forEach(route => {
        const card = document.createElement('div');
        card.className = 'route-card';
        // スタイル (CSSファイルにあれば不要ですが念のため)
        card.style.cssText = "background:white; border-radius:8px; padding:15px; margin-bottom:10px; border-left:5px solid #F04E23; box-shadow:0 1px 3px rgba(0,0,0,0.1);";

        const tagHtml = route.tag ? `<span style="font-size:10px; background:#eee; padding:2px 5px; border-radius:3px; margin-left:5px;">${route.tag}</span>` : '';
        
        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; font-weight:bold; margin-bottom:5px;">
                <span>Suggested ${tagHtml}</span>
                <span style="font-size:18px; color:#F04E23;">${route.time}</span>
            </div>
            <div style="font-size:14px; margin-bottom:5px;">
                ${route.summary}
            </div>
            <div style="font-size:12px; color:#777;">
                ${route.details}
            </div>
        `;
        listContainer.appendChild(card);
    });
}

function drawRoute(task) {
    // Moovit内に地図コンテナがあれば描画
    // なければ何もしない
}

