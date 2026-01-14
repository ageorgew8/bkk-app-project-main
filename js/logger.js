// js/logger.js

const GAS_URL = 'https://script.google.com/macros/s/AKfycbxshRmrAMhCdLmyOteRvnV2oll9PrlH6KzEoMBFlIzu_9cNtHgT53296ZawHOLMf6jj/exec'; 

// --- バッファリング設定 (アグレッシブ設定) ---
const BUFFER_THRESHOLD = 50;   // 50件溜まるまで送らない
const FLUSH_INTERVAL = 30000;  // または20秒経過するまで送らない
let logBuffer = [];          
let flushTimer = null;       

// 参加者IDの生成 (UUID v4)
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// ページを開いたときにIDを確認・生成
let participantId = localStorage.getItem('participant_id');
if (!participantId) {
    participantId = generateUUID();
    localStorage.setItem('participant_id', participantId);
}
console.log("Current Participant ID:", participantId);

// ログ送信関数
export function sendLog(type, details = {}) {
    const enrichedDetails = {
        ...details,
        client_timestamp: new Date().toISOString()
    };

    const logEntry = {
        participantId: participantId,
        eventType: type,
        details: enrichedDetails
    };

    logBuffer.push(logEntry);
    // console.log(`[LOG BUFFERED] ${type} (Buffer: ${logBuffer.length})`); // ログがうるさければコメントアウト

    // 閾値を超えたら即送信、そうでなければタイマーセット
    if (logBuffer.length >= BUFFER_THRESHOLD) {
        flushLogs();
    } else if (!flushTimer) {
        flushTimer = setTimeout(flushLogs, FLUSH_INTERVAL);
    }
}

// GASへ送信
function flushLogs() {
    if (flushTimer) {
        clearTimeout(flushTimer);
        flushTimer = null;
    }

    if (logBuffer.length === 0) return;

    const dataToSend = [...logBuffer];
    logBuffer = [];

    console.log(`[LOG FLUSHING] Sending batch of ${dataToSend.length} logs...`);

    fetch(GAS_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain' 
        },
        body: JSON.stringify(dataToSend), 
        keepalive: true // ★これが超重要（画面遷移しても送信しきる）
    })
    .then(response => console.log(`[LOG SENT] Batch success (${dataToSend.length})`))
    .catch(error => {
        console.error("[LOG ERROR]", error);
        // エラー時はバッファに戻すことでデータロストを極力防ぐ（オプション）
        // logBuffer = [...dataToSend, ...logBuffer]; 
    });
}

// ★最重要: 画面を閉じる/隠すタイミングで強制送信
// 実験が終わってタブを閉じた瞬間に、残りのログを一気に送ります
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
        flushLogs();
    }
});
// モバイルSafari対策
window.addEventListener('pagehide', () => {
    flushLogs();
});

export function getParticipantId() {
    return participantId;
}