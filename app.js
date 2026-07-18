// ====== Global State Management ======
const state = {
    hn: "",
    devicesConnected: false,
    currentHeartRate: 75,
    currentGlucose: 110,
    distanceTraveled: 0,
    tokenOfDiscipline: 0,
    currentStage: 1
};

// ====== Navigation Logic ======
function navigateToStage(stageNum) {
    // ซ่อนสเตจทั้งหมด
    document.querySelectorAll('.app-stage').forEach(stage => {
        stage.classList.add('hidden');
    });
    // แสดงสเตจปัจจุบันที่เลือก
    document.getElementById(`stage-${stageNum}`).classList.remove('hidden');
    state.currentStage = stageNum;
}

// อัปเดตข้อมูลบนแถบมอนิเตอร์ด้านบน
function updateGlobalVitalBar() {
    const bar = document.getElementById('global-vital-bar');
    if (state.hn && state.devicesConnected) {
        bar.classList.remove('hidden');
        document.getElementById('display-hn').innerText = state.hn;
        document.getElementById('display-hr').innerText = state.currentHeartRate;
        document.getElementById('display-glucose').innerText = state.currentGlucose;
        document.getElementById('display-distance').innerText = state.distanceTraveled;
    } else {
        bar.classList.add('hidden');
    }
}

// ====== Stage 1: Authentication & PDPA ======
document.getElementById('btn-stage-1').addEventListener('click', () => {
    const inputHn = document.getElementById('input-hn').value;
    if (!inputHn) return alert("กรุณาระบุรหัสผู้ป่วย (HN)");
    state.hn = inputHn;
    navigateToStage(2);
});

// ====== Stage 2: Device Configuration ======
document.getElementById('btn-stage-2').addEventListener('click', () => {
    navigateToStage(3);
});

// ====== Stage 3: Bluetooth Emulation ======
document.getElementById('btn-stage-3').addEventListener('click', () => {
    navigateToStage(4);
});

document.getElementById('btn-connect-bluetooth').addEventListener('click', () => {
    const statusBox = document.getElementById('bluetooth-status');
    statusBox.innerText = "กำลังค้นหาสัญญาณอุปกรณ์ทางการแพทย์ผ่านบลูทูธ...";
    
    // จำลองการเชื่อมต่อ Web Bluetooth API (Delay 1.5 วินาที)
    setTimeout(() => {
        state.devicesConnected = true;
        state.currentHeartRate = 98; // ค่าเริ่มต้นหลังเชื่อมต่อสำเร็จ
        state.currentGlucose = 135; 
        statusBox.innerHTML = "✅ <b>เชื่อมต่อสำเร็จ:</b> ตรวจพบนาฬิกา Garmin และเครื่องตรวจวัดน้ำตาล CGM";
        statusBox.style.borderLeftColor = "var(--accent-color)";
        document.getElementById('btn-stage-3').classList.remove('hidden');
        updateGlobalVitalBar();
    }, 1500);
});

// ====== Stage 4: Pre-Run Setting ======
document.getElementById('btn-stage-4').addEventListener('click', () => {
    navigateToStage(5);
});

// ====== Stage 5: Active Run & Simulator ======
document.getElementById('btn-start-run').addEventListener('click', function() {
    this.classList.add('hidden');
    document.getElementById('run-dashboard').classList.remove('hidden');
    
    // จำลองลูปเพิ่มระยะทาง (เดินเรื่อยๆ เพิ่มทีละ 5 เมตร)
    state.runInterval = setInterval(() => {
        state.distanceTraveled += 5;
        updateGlobalVitalBar();
    }, 1000);
});

// -- Developer Simulation Actions --
document.getElementById('sim-trigger-gacha').addEventListener('click', () => {
    clearInterval(state.runInterval);
    navigateToStage(7); // ไปหน้ากาชา
});

document.getElementById('sim-trigger-boss').addEventListener('click', () => {
    clearInterval(state.runInterval);
    state.distanceTraveled = 2000; // บรรลุเป้าหมาย 2 กม.
    updateGlobalVitalBar();
    navigateToStage(8); // ไปหน้าล็อบบี้บอส
});

document.getElementById('sim-trigger-danger').addEventListener('click', () => {
    clearInterval(state.runInterval);
    // เปลี่ยนสเตทเป็นค่าผิดปกติอันตรายตามขอบเขต Edge Case
    state.currentHeartRate = 145; 
    state.currentGlucose = 65; 
    updateGlobalVitalBar();
    
    document.getElementById('danger-reason').innerHTML = `
        • อัตราการเต้นของหัวใจสูงเกินเกณฑ์ความปลอดภัย: <b>${state.currentHeartRate} BPM</b><br>
        • ระดับน้ำตาลในเลือดต่ำเกินเกณฑ์: <b>${state.currentGlucose} mg/dL</b>
    `;
    navigateToStage(6); // เข้าหน้าจอตัดระบบฉุกเฉินทันที
});

// ====== Stage 6: Emergency Return ======
document.getElementById('btn-resume-safety').addEventListener('click', () => {
    // รีเซ็ตค่าให้กลับมาปกติ
    state.currentHeartRate = 100;
    state.currentGlucose = 110;
    updateGlobalVitalBar();
    navigateToStage(5); // ส่งกลับหน้าเดิมเพื่อฟื้นฟูการบำบัด
});

// ====== Stage 7: Gacha Handling ======
document.getElementById('btn-open-gacha').addEventListener('click', () => {
    const rewards = ['การ์ดโล่ป้องกัน', 'น้ำยาสมุนไพรฟื้นฟูพลังชีวิต', 'รองเท้าผ้าใบระดับแรร์ (+5% Speed)', 'ดาบผู้พิทักษ์หัวใจ'];
    const randomReward = rewards[Math.floor(Math.random() * rewards.length)];
    
    const resultBox = document.getElementById('gacha-result');
    resultBox.innerHTML = `🎉 ยินดีด้วยคุณได้รับไอเทม RPG: <b>${randomReward}</b> เข้าคลังแล้ว!`;
    resultBox.classList.remove('hidden');
    document.getElementById('btn-stage-7').classList.remove('hidden');
});

document.getElementById('btn-stage-7').addEventListener('click', () => {
    // เคลียร์และกลับไปเดินต่อ
    document.getElementById('gacha-result').classList.add('hidden');
    document.getElementById('btn-stage-7').classList.add('hidden');
    navigateToStage(5);
});

// ====== Stage 8: Battle Lobby Setup ======
document.getElementById('btn-stage-8').addEventListener('click', () => {
    navigateToStage(9);
    runBattleSimulation();
});

// ====== Stage 9: RPG Game Combat Simulation ======
function runBattleSimulation() {
    let bossHp = 100;
    let playerHp = 100;
    const logBox = document.getElementById('battle-log');
    logBox.innerHTML = "";
    
    const battleInterval = setInterval(() => {
        // อิงตามลอจิก: ชีพจรคนไข้อยู่ในระดับเสถียร (98BPM) ทำให้พลังโจมตีรุนแรง
        bossHp -= 25; 
        playerHp -= 10; // บอสโจมตีสวนกลับตามสเต็ป
        
        document.getElementById('boss-hp').innerText = bossHp;
        document.getElementById('battle-player-hp').innerText = playerHp;
        logBox.innerHTML += `• ลุงสมศักดิ์รักษาระดับชีพจรคงที่ สร้างคอมโบฟาดฟัน บอสเบาหวานลดลงเหลือ HP: ${bossHp}<br>`;
        
        if (bossHp <= 0) {
            clearInterval(battleInterval);
            document.getElementById('battle-outcome').innerText = "🏆 ชัยชนะ! (Victory)";
            state.tokenOfDiscipline += 1; // เพิ่มเหรียญตราแห่งวินัยเข้าสเตท
            document.getElementById('btn-stage-9').classList.remove('hidden');
        }
    }, 1000);
}

document.getElementById('btn-stage-9').addEventListener('click', () => {
    navigateToStage(10);
});

// ====== Stage 10: Battle Outcome Transition ======
document.getElementById('btn-stage-10').addEventListener('click', () => {
    navigateToStage(11);
});

// ====== Stage 11: Clinical Telemetry Data Transfer ======
document.getElementById('btn-upload-clinic').addEventListener('click', () => {
    const status = document.getElementById('upload-status');
    status.innerText = "กำลังทำการเข้ารหัสข้อมูลไบโอเมตริกส์ระดับสูง (AES-256)...";
    
    setTimeout(() => {
        status.innerHTML = "✅ <b>ส่งข้อมูลสำเร็จ!</b> รายงานชีพจรและน้ำตาลคงที่ตลอด 2 กม. ถูกบันทึกเข้าประวัติของแพทย์เรียบร้อยแล้ว";
        document.getElementById('btn-stage-11').classList.remove('hidden');
    }, 1500);
});

document.getElementById('btn-stage-11').addEventListener('click', () => {
    navigateToStage(12);
});

// ====== Stage 12: Realworld Marketplace Benefits ======
document.getElementById('btn-redeem').addEventListener('click', () => {
    if(state.tokenOfDiscipline > 0 || true) { // บังคับ true เพื่อให้ทดสอบระบบได้ตลอด
        document.getElementById('qr-container').classList.remove('hidden');
    }
});