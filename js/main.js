import { initGoogleMap, updateGoogleMap } from './apps/maps.js';
import { initGrab, updateGrab } from './apps/grab.js';
import { initMoovit, updateMoovit } from './apps/moovit.js';
import { initViaBus, updateViaBus } from './apps/viabus.js';
import { initBolt, updateBolt } from './apps/bolt.js';
import { sendLog } from './logger.js';

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 初期化処理 ---
    // ※MapのDOM要素生成前に実行されないよう、init系はここにあるのが正しいです
    initGoogleMap();
    initGrab();
    initMoovit();
    initViaBus();
    initBolt();
    
    // --- 共通関数: 現在のタスクを取得して更新 ---
    function getTaskData() {
        // ★修正点1: tasks配列を直接見ず、Flowから「今のタスク」をもらう
        if (window.Flow && window.Flow.getCurrentTask) {
            return window.Flow.getCurrentTask();
        }
        return null; // まだFlowが準備できていない場合など
    }

    function updateAllApps() {
        const currentTask = getTaskData();
        if (!currentTask) return; // タスクがなければ何もしない
        
        // 各アプリの更新関数を呼ぶ
        updateGoogleMap(currentTask);
        updateGrab(currentTask);
        updateMoovit(currentTask);
        updateViaBus(currentTask);
        updateBolt(currentTask);
        
        console.log(`All apps updated to Task ID: ${currentTask.id}`);
    }

    // --- 画面遷移ロジック ---
    const views = document.querySelectorAll('.view');
    
    // グローバルスコープから呼べるようにwindowに紐付け（念のため）
    window.showView = function(viewId) {
        views.forEach(view => view.classList.remove('active'));
        const targetView = document.getElementById(viewId);
        
        if (targetView) {
            targetView.classList.add('active');
            
            // ★修正点2: ここも Flow からタスクを取得
            const currentTask = getTaskData();
            
            if (currentTask) {
                // アプリが開かれたタイミングで、各アプリの update 関数を呼ぶ
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
    };

    // --- アプリのアイコンクリックイベント (App Open Count連携) ---
    document.querySelectorAll('.app-icon').forEach(icon => {
        icon.addEventListener('click', () => {
            const appId = icon.dataset.appId;
            if (appId) {
                // 1. ログ送信
                sendLog('app_open', {appId: appId});
                
                // 2. Flow側のカウンターを増やす (ブロック機能用)
                if (window.Flow && window.Flow.notifyAppOpened) {
                    window.Flow.notifyAppOpened();
                }

                // 3. アプリ画面へ
                updateAllApps(); // 念のため全更新
                window.showView(appId);
            }
        });
    });

    // --- イベントリスナー ---

    // タスク変更イベント
    document.addEventListener('taskChanged', (e) => {
        // e.detail.index はあくまで「何問目か」の数字なので、
        // 実際のタスクデータは Flow.getCurrentTask() で取ります。
        console.log(`Main.js: Task Phase Changed. Index: ${e.detail.index}`);
        updateAllApps();
    });

    // ホームボタン
    document.getElementById('home-btn').addEventListener('click', () => {
        showView('home-screen');
        sendLog('home');
    });


    // ★重要: □ボタンで回答画面へ
    document.getElementById('task-btn').addEventListener('click', () => {
        showView('task-answer-screen');
        sendLog('task_open');
    });


    // 初回実行
    updateAllApps();

});

