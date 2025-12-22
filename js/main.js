import { tasks } from './data/tasks.js';
import { initGoogleMap, updateGoogleMap } from './apps/maps.js';
import { initMoovit, updateMoovit } from './apps/moovit.js';
import { initViaBus, updateViaBus } from './apps/viabus.js';
import { initGrab, updateGrab } from './apps/grab.js';
import { initBolt, updateBolt } from './apps/bolt.js';
import { sendLog } from './logger.js'; 


document.addEventListener('DOMContentLoaded', () => {
    
    // --- 状態管理 ---
    let currentTaskIndex = 0;
    let currentAppId = 'home-screen';

    // --- 初期化処理 ---
    initGoogleMap();
    initGrab();
    initMoovit();
    initViaBus();
    initBolt();
    
    // --- 共通関数: 全アプリの情報を現在のタスクで更新 ---
    function updateAllApps() {
        const currentTask = tasks[currentTaskIndex];
        
        // 各アプリの更新関数を呼ぶ
        updateGoogleMap(currentTask);
        updateGrab(currentTask);
        updateMoovit(currentTask);
        updateViaBus(currentTask);
        updateBolt(currentTask);
        
        console.log(`All apps updated to Task ${currentTask.id}`);
    }

    // --- 画面遷移ロジック ---
    const views = document.querySelectorAll('.view');
    
    function showView(viewId) {
        views.forEach(view => view.classList.remove('active'));
        const targetView = document.getElementById(viewId);
        
        if (targetView) {
            targetView.classList.add('active');
            
            const currentTask = tasks[currentTaskIndex];

            // アプリが開かれたタイミングで、各アプリの update 関数を呼ぶ
            // これにより、地図のサイズ再計算 (invalidateSize) が走り、地図が表示されます
            if (viewId === 'google-map') {
                updateGoogleMap(currentTask);
            } else if (viewId === 'viabus') {
                updateViaBus(currentTask);
            } else if (viewId === 'grab') {
                updateGrab(currentTask);
            } else if (viewId === 'bolt') {
                updateBolt(currentTask);
            } else if (viewId === 'moovit') {
                updateMoovit(currentTask);
            }
        }
    }
    // タスク変更イベント
    document.addEventListener('taskChanged', (e) => {
        currentTaskIndex = e.detail.index;
        updateAllApps();
        console.log(`Main.js: Switched to Task ${currentTaskIndex}`);
    });

    // タスク/回答画面を開くイベント
    document.addEventListener('openTaskScreen', () => {
        showView('task-answer-screen');
    });

    // ホームに戻るイベント
    document.addEventListener('goHome', () => {
        showView('home-screen');
    });

    // --- イベントリスナー ---
    
    // アプリアイコンクリック
    document.querySelectorAll('.app-icon').forEach(icon => {
        icon.addEventListener('click', () => {
            const appId = icon.dataset.appId; // "google-map" とか
            if (appId) {
                // ★アプリ起動ログ
                sendLog('app_open', {appId: appId});
                
                if (window.Flow && window.Flow.notifyAppOpened) {
                    window.Flow.notifyAppOpened();
                }
                updateAllApps();
                showView(appId);
            };
        });
    });

    // ホームボタン
    document.getElementById('home-btn').addEventListener('click', () => {
        showView('home-screen');
        sendLog('home');
    });


    // ★重要: □ボタンで回答画面へ
    document.getElementById('task-btn').addEventListener('click', () => {
        showView('task-answer-screen');
        sendLog('task_open', {taskId: currentTaskIndex});
    });


    // 初回実行
    updateAllApps();

});

