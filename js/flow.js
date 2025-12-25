// js/flow.js
import { tasks } from './data/tasks.js';
import { sendLog, getParticipantId } from './logger.js'; // ★インポート追加


// 状態管理
let currentStageIndex = 0; // 0:Landing, 1:Consent, 2:Briefing, 3:Tutorial
const overlayIds = ['page-landing', 'page-consent', 'page-briefing', 'page-tutorial1', 'page-tutorial2', 'page-tutorial3'];
let appOpenCount = 0;

let currentTaskIndex = 0;
const totalTasks = tasks.length;

let taskQueue = []; 

function shuffleArray(array) {
    const newArray = [...array]; // 元の配列を破壊しないようにコピー
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// 例: .../viewform?entry.123456=
const googleFormBaseUrl = "https://docs.google.com/forms/d/e/1FAIpQLSc4eUF1meTszcW2Tw-1255r8H97NHXdW5hcAZRN7VWk2VpUzg/viewform?usp=pp_url&entry.1025575642=idhere";

window.Flow = {
    getCurrentTask: () => {
        return taskQueue[currentTaskIndex];
    },

    nextStep: () => {
        // 現在のページを隠す
        document.getElementById(overlayIds[currentStageIndex]).classList.remove('active');
        currentStageIndex++;
        
        // 次のページがあれば表示
        if (currentStageIndex < overlayIds.length) {
            document.getElementById(overlayIds[currentStageIndex]).classList.add('active');
        }
    },

    // 同意チェック
    checkConsent: () => {
        const checkbox = document.getElementById('consent-check');
        if (checkbox.checked) {
            window.Flow.nextStep();
        } else {
            alert("You must agree to participate.");
        }
    },

    // 2. カウントアップする関数を追加（main.jsから呼び出せるように）
    notifyAppOpened: () => {
        appOpenCount++;
        console.log("App opened count:", appOpenCount);
    },

    startTaskPhase: () => {
        const overlays = document.getElementById('experiment-overlays');
        if (overlays) overlays.style.display = 'none';

        taskQueue = shuffleArray(tasks);
        
        const taskOrderLog = taskQueue.map(t => t.id);

        sendLog('experiment_start', { 
            group_id: 'default',
            task_order: taskOrderLog // ★順序を記録
        });
        
        currentTaskIndex = 0;
        appOpenCount = 0;
        updateTaskDisplay();
        dispatchTaskChangeEvent(0);
        dispatchOpenTaskScreenEvent();
    },

    submitAnswer: () => {
        if (appOpenCount === 0) {
            alert("⚠️ Please use the apps (Maps, Grab, Bolt) to find the route before answering.");
            return; // ここで強制終了
        }

        const select = document.getElementById('answer-selection');
        const selection = select ? select.value : null;

        if (!selection) {
            alert("Please select a route.");
            return;
        }

        // 現在のタスクID取得
        const currentTaskData = taskQueue[currentTaskIndex];

        sendLog('task_answer', {
            task_order_index: currentTaskIndex + 1,
            task_id: currentTaskData.id,
            choice: selection
        });

        currentTaskIndex++;
        appOpenCount = 0; // カウンターリセット

        if (currentTaskIndex < totalTasks) {
            alert("Answer saved. Proceeding to next task.");
            
            updateTaskDisplay();
            
            // ★修正: エラー回避のため、変数を経由せず直接参照する形に変更
            const nextTask = taskQueue[currentTaskIndex];
            
            sendLog('Task_updated', { 
                next_task_order: currentTaskIndex + 1,
                next_task_id: nextTask ? nextTask.id : 'unknown'
            });
            
            dispatchTaskChangeEvent(currentTaskIndex);
            dispatchGoHomeEvent();
            setTimeout(() => { dispatchOpenTaskScreenEvent(); }, 500);
        } else {
            sendLog('experiment_finish');

            if(confirm("All tasks completed. Proceed to questionnaire?")) {
                // ... (フォーム遷移処理) ...
                const finalUrl = `${googleFormBaseUrl}${getParticipantId()}`;
                window.location.href = finalUrl;
            }
        }
    }
};

// --- Helper: Update Task UI & Generate Options ---
function updateTaskDisplay() {
    if (!taskQueue[currentTaskIndex]) return;
    const task = taskQueue[currentTaskIndex];
    document.getElementById('task-title-display').innerText = task.title;
    document.getElementById('task-desc-display').innerText = task.description;

    // ★ 1. 時計の更新 (HTMLに <span id="status-clock"> がある前提)
    const clockEl = document.getElementById('status-clock');
    if (clockEl && task.startTime) {
        clockEl.innerText = task.startTime;
    }

    // Generate Dropdown Options
    const select = document.getElementById('answer-selection');
    select.innerHTML = '<option value="" disabled selected>Select an option...</option>'; // Reset

    // ★ 2. Add Ride Hailing Options (Fixed List)
    // tasks.js の type と文字列を合わせておくとログ分析が楽です
    addOption(select, "Grab");
    addOption(select, "GrabBike");
    addOption(select, "Bolt");
    addOption(select, "BoltBike");

    // ★ 3. Add Public Transport & Walk (from Google Routes)
    if (task.google && task.google.routes) {
        task.google.routes.forEach(route => {
            // "car" は除外 (ユーザー指示: carとダブりを除く)
            if (route.type === 'car') return;

            // summaryを表示 (例: "🚍Bus 529/4-28 → ⛴️Blue flag")
            // addOption側で重複チェックしているので、そのまま投げてOK
            addOption(select, route.summary);
        });
    }
    if (task.moovit.routes) {
        task.moovit.routes.forEach(route => {
            // Moovitにcarが含まれている場合の保険 (通常はtransitのみですが念のため)
            if (route.mode === 'car' || route.type === 'car') return;
            
            addOption(select, route.summary);
        });
    }
}

function addOption(selectElement, text) {
    // Prevent duplicates (Simple check)
    for (let i = 0; i < selectElement.options.length; i++) {
        if (selectElement.options[i].text === text) return;
    }
    
    const option = document.createElement('option');
    option.value = text;
    option.innerText = text;
    selectElement.appendChild(option);
}

// --- Event Dispatchers ---
function dispatchTaskChangeEvent(index) {
    const event = new CustomEvent('taskChanged', { detail: { index: index } });
    document.dispatchEvent(event);
}

function dispatchOpenTaskScreenEvent() {
    document.dispatchEvent(new Event('openTaskScreen'));
}

function dispatchGoHomeEvent() {
    document.dispatchEvent(new Event('goHome'));
}