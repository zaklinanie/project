let chart = null;

const nodePositions = [
    { x: 450, y: 50 },
    { x: 200, y: 200 },
    { x: 450, y: 200 },
    { x: 700, y: 200 },
    { x: 100, y: 380 },
    { x: 450, y: 380 },
    { x: 800, y: 380 },
    { x: 450, y: 550 },
];

const stateLabels = ['S₀', 'S₁', 'S₂', 'S₃', 'S₄', 'S₅', 'S₆', 'S₇'];
const stateDescriptions = [
    'Все работают',
    'Отказ 1',
    'Отказ 2',
    'Отказ 3',
    'Отказ 1,2',
    'Отказ 1,3',
    'Отказ 2,3',
    'Все отказали'
];

function drawGraph() {
    const canvas = document.getElementById('graphCanvas');
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = 950 * dpr;
    canvas.height = 650 * dpr;
    canvas.style.width = '950px';
    canvas.style.height = '650px';
    ctx.scale(dpr, dpr);

    ctx.fillStyle = '#1a1a24';
    ctx.fillRect(0, 0, 950, 650);

    // Определяем все стрелки ЯВНО для каждого направления и типа
    const arrows = [
        // S0 -> S1, S2, S3 (отказы λ)
        { from: 0, to: 1, label: 'λ₁', color: '#ef4444', offset: 0 },
        { from: 0, to: 2, label: 'λ₂', color: '#ef4444', offset: 0 },
        { from: 0, to: 3, label: 'λ₃', color: '#ef4444', offset: 0 },
        
        // S1 -> S0 (восстановление μ) - ОТДЕЛЬНАЯ СТРЕЛКА
        { from: 1, to: 0, label: 'μ₁', color: '#22c55e', offset: 1 },
        // S1 -> S4, S5 (отказы λ)
        { from: 1, to: 4, label: 'λ₂', color: '#ef4444', offset: 0 },
        { from: 1, to: 5, label: 'λ₃', color: '#ef4444', offset: 0 },
        
        // S2 -> S0 (восстановление μ) - ОТДЕЛЬНАЯ СТРЕЛКА
        { from: 2, to: 0, label: 'μ₂', color: '#22c55e', offset: 0 },
        // S2 -> S4, S6 (отказы λ)
        { from: 2, to: 4, label: 'λ₁', color: '#ef4444', offset: 0 },
        { from: 2, to: 6, label: 'λ₃', color: '#ef4444', offset: 0 },
        
        // S3 -> S0 (восстановление μ) - ОТДЕЛЬНАЯ СТРЕЛКА
        { from: 3, to: 0, label: 'μ₃', color: '#22c55e', offset: -1 },
        // S3 -> S5, S6 (отказы λ)
        { from: 3, to: 5, label: 'λ₁', color: '#ef4444', offset: 0 },
        { from: 3, to: 6, label: 'λ₂', color: '#ef4444', offset: 0 },
        
        // S4 -> S1, S2 (восстановления μ)
        { from: 4, to: 1, label: 'μ₂', color: '#22c55e', offset: -0.8 },
        { from: 4, to: 2, label: 'μ₁', color: '#22c55e', offset: 0.8 },
        // S4 -> S7 (отказ λ)
        { from: 4, to: 7, label: 'λ₃', color: '#ef4444', offset: 0 },
        
        // S5 -> S1, S3 (восстановления μ)
        { from: 5, to: 1, label: 'μ₃', color: '#22c55e', offset: 1.2 },
        { from: 5, to: 3, label: 'μ₁', color: '#22c55e', offset: 1.2 },
        // S5 -> S7 (отказ λ)
        { from: 5, to: 7, label: 'λ₂', color: '#ef4444', offset: 0 },
        
        // S6 -> S2, S3 (восстановления μ)
        { from: 6, to: 2, label: 'μ₃', color: '#22c55e', offset: -0.8 },
        { from: 6, to: 3, label: 'μ₂', color: '#22c55e', offset: 0.8 },
        // S6 -> S7 (отказ λ)
        { from: 6, to: 7, label: 'λ₁', color: '#ef4444', offset: 0 },
        
        // S7 -> S4, S5, S6 (восстановления μ)
        { from: 7, to: 4, label: 'μ₃', color: '#22c55e', offset: -1.2 },
        { from: 7, to: 5, label: 'μ₂', color: '#22c55e', offset: 0 },
        { from: 7, to: 6, label: 'μ₁', color: '#22c55e', offset: 1.2 }
    ];

    // Рисуем все стрелки
    arrows.forEach((arrow) => {
        drawArrow(ctx, arrow);
    });

    // Рисуем узлы поверх стрелок
    nodePositions.forEach((pos, i) => {
        const isWorking = i === 0;
        const isFailed = i === 7;
        
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 20, 0, Math.PI * 2);
        ctx.fillStyle = isFailed ? '#7f1d1d' : (isWorking ? '#14532d' : '#1e3a5f');
        ctx.fill();
        ctx.strokeStyle = isFailed ? '#ef4444' : (isWorking ? '#22c55e' : '#3b82f6');
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#e8e8ed';
        ctx.font = 'bold 14px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(stateLabels[i], pos.x, pos.y - 5);

        ctx.font = '9px Source Sans 3';
        ctx.fillStyle = '#8888a0';
        ctx.fillText(stateDescriptions[i], pos.x, pos.y + 10);
    });

    // Легенда
    ctx.font = '11px JetBrains Mono';
    ctx.fillStyle = '#ef4444';
    ctx.fillText('λ — интенсивность отказа', 120, 630);
    ctx.fillStyle = '#22c55e';
    ctx.fillText('μ — интенсивность восстановления', 500, 630);
}

function drawArrow(ctx, arrow) {
    const p1 = nodePositions[arrow.from];
    const p2 = nodePositions[arrow.to];
    
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    const nx = dx / dist;
    const ny = dy / dist;
    
    const radius = 20;
    const x1 = p1.x + nx * radius;
    const y1 = p1.y + ny * radius;
    const x2 = p2.x - nx * radius;
    const y2 = p2.y - ny * radius;
    
    // Кривизна зависит от offset
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    
    const offsetX = -ny * arrow.offset * 30;
    const offsetY = nx * arrow.offset * 30;
    
    const cpX = midX + offsetX;
    const cpY = midY + offsetY;
    
    // Рисуем изогнутую линию
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo(cpX, cpY, x2, y2);
    ctx.strokeStyle = arrow.color;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Стрелка в конце
    const angle = Math.atan2(y2 - cpY, x2 - cpX);
    const arrowLen = 10;
    const arrowX = x2 - Math.cos(angle) * 22;
    const arrowY = y2 - Math.sin(angle) * 22;
    
    ctx.beginPath();
    ctx.moveTo(arrowX, arrowY);
    ctx.lineTo(arrowX - arrowLen * Math.cos(angle - Math.PI / 6), arrowY - arrowLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(arrowX - arrowLen * Math.cos(angle + Math.PI / 6), arrowY - arrowLen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fillStyle = arrow.color;
    ctx.fill();
    
    // Подпись на стрелке
    ctx.fillStyle = '#e8e8ed';
    ctx.font = 'bold 11px JetBrains Mono';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const textOffsetX = offsetX * 0.4;
    const textOffsetY = offsetY * 0.4;
    ctx.fillText(arrow.label, cpX + textOffsetX, cpY + textOffsetY);
}

function showEquations() {
    const eq = [
        "dP₀/dt = -(λ₁+λ₂+λ₃)P₀ + μ₁P₁ + μ₂P₂ + μ₃P₃",
        "dP₁/dt = λ₁P₀ - (μ₁+λ₂+λ₃)P₁ + μ₂P₄ + μ₃P₅",
        "dP₂/dt = λ₂P₀ - (μ₂+λ₁+λ₃)P₂ + μ₁P₄ + μ₃P₆",
        "dP₃/dt = λ₃P₀ - (μ₃+λ₁+λ₂)P₃ + μ₁P₅ + μ₂P₆",
        "dP₄/dt = λ₂P₁ + λ₁P₂ - (μ₁+μ₂+λ₃)P₄ + μ₃P₇",
        "dP₅/dt = λ₃P₁ + λ₁P₃ - (μ₁+μ₃+λ₂)P₅ + μ₂P₇",
        "dP₆/dt = λ₃P₂ + λ₂P₃ - (μ₂+μ₃+λ₁)P₆ + μ₁P₇",
        "dP₇/dt = λ₃P₄ + λ₂P₅ + λ₁P₆ - (μ₁+μ₂+μ₃)P₇"
    ];
    document.getElementById('equations').innerHTML = eq.map(e => `<div class="equation">${e}</div>`).join('');
}

function showMatrix() {
    const Q = [
        [`-(λ₁+λ₂+λ₃)`, `μ₁`, `μ₂`, `μ₃`, `0`, `0`, `0`, `0`],
        [`λ₁`, `-(μ₁+λ₂+λ₃)`, `0`, `0`, `μ₂`, `μ₃`, `0`, `0`],
        [`λ₂`, `0`, `-(μ₂+λ₁+λ₃)`, `0`, `μ₁`, `0`, `μ₃`, `0`],
        [`λ₃`, `0`, `0`, `-(μ₃+λ₁+λ₂)`, `0`, `μ₁`, `μ₂`, `0`],
        [`0`, `λ₂`, `λ₁`, `0`, `-(μ₁+μ₂+λ₃)`, `0`, `0`, `μ₃`],
        [`0`, `λ₃`, `0`, `λ₁`, `0`, `-(μ₁+μ₃+λ₂)`, `0`, `μ₂`],
        [`0`, `0`, `λ₃`, `λ₂`, `0`, `0`, `-(μ₂+μ₃+λ₁)`, `μ₁`],
        [`0`, `0`, `0`, `0`, `λ₃`, `λ₂`, `λ₁`, `-(μ₁+μ₂+μ₃)`]
    ];

    let html = '<table><tr><th>Q</th>';
    for (let j = 0; j < 8; j++) html += `<th>S${j}</th>`;
    html += '</tr>';
    for (let i = 0; i < 8; i++) {
        html += `<tr><th>S${i}</th>`;
        for (let j = 0; j < 8; j++) html += `<td>${Q[i][j]}</td>`;
        html += '</tr>';
    }
    html += '</table>';
    document.getElementById('matrix').innerHTML = html;
}

function buildQ(l1, l2, l3, m1, m2, m3) {
    const Q = Array(8).fill(0).map(() => Array(8).fill(0));
    
    Q[1][0] = l1; Q[2][0] = l2; Q[3][0] = l3;
    Q[4][1] = l2; Q[5][1] = l3;
    Q[4][2] = l1; Q[6][2] = l3;
    Q[5][3] = l1; Q[6][3] = l2;
    Q[7][4] = l3; Q[7][5] = l2; Q[7][6] = l1;

    Q[0][1] = m1; Q[0][2] = m2; Q[0][3] = m3;
    Q[1][4] = m2; Q[2][4] = m1;
    Q[1][5] = m3; Q[3][5] = m1;
    Q[2][6] = m3; Q[3][6] = m2;
    Q[4][7] = m3; Q[5][7] = m2; Q[6][7] = m1;

    for (let i = 0; i < 8; i++) {
        let sum = 0;
        for (let j = 0; j < 8; j++) if (j !== i) sum += Q[j][i];
        Q[i][i] = -sum;
    }
    return Q;
}

function solveODE(Q, T) {
    const dt = T / 1000;
    let P = [1, 0, 0, 0, 0, 0, 0, 0];
    const result = { t: [0], P: [P.slice()] };

    for (let i = 0; i < 1000; i++) {
        const k1 = Q.map(row => row.reduce((s, v, j) => s + v * P[j], 0));
        const P1 = P.map((v, j) => v + k1[j] * dt / 2);
        const k2 = Q.map(row => row.reduce((s, v, j) => s + v * P1[j], 0));
        const P2 = P.map((v, j) => v + k2[j] * dt / 2);
        const k3 = Q.map(row => row.reduce((s, v, j) => s + v * P2[j], 0));
        const P3 = P.map((v, j) => v + k3[j] * dt);
        const k4 = Q.map(row => row.reduce((s, v, j) => s + v * P3[j], 0));

        P = P.map((v, j) => v + (k1[j] + 2*k2[j] + 2*k3[j] + k4[j]) * dt / 6);
        const sum = P.reduce((a, b) => a + b, 0);
        P = P.map(x => x / sum);

        result.t.push((i + 1) * dt);
        result.P.push(P.slice());
    }
    return result;
}

function showResults(res) {
    const final = res.P[res.P.length - 1];
    document.getElementById('probList').innerHTML = final.map((p, i) =>
        `<div class="result-item"><span class="label">P${i}(S${i})</span><span class="value">${(p * 100).toFixed(2)}%</span></div>`
    ).join('');

    document.getElementById('results').classList.add('show');
}

function drawChart(res) {
    const ctx = document.getElementById('chart').getContext('2d');
    const colors = ['#22c55e', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: res.t.filter((_, i) => i % 20 === 0).map(t => t.toFixed(2)),
            datasets: res.P[0].map((_, i) => ({
                label: `P${i}`,
                data: res.P.filter((_, j) => j % 20 === 0).map(p => p[i] * 100),
                borderColor: colors[i],
                backgroundColor: colors[i] + '20',
                borderWidth: 2,
                fill: false,
                tension: 0.3,
                pointRadius: 0
            }))
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#8888a0', font: { family: 'JetBrains Mono', size: 10 } }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: { color: '#2a2a3a' },
                    ticks: { color: '#8888a0', font: { size: 10 }, callback: function(value) { return value + '%'; } }
                },
                x: {
                    grid: { color: '#2a2a3a' },
                    ticks: { color: '#8888a0', font: { size: 10 } }
                }
            }
        }
    });
}

function validate() {
    const vals = ['l1','l2','l3','m1','m2','m3','T'].map(id => +document.getElementById(id).value);
    if (vals.slice(0, 6).some(v => v < 0)) {
        showError('Интенсивности должны быть ≥ 0');
        return false;
    }
    if (vals[6] <= 0) {
        showError('Время T должно быть > 0');
        return false;
    }
    if (vals.slice(0, 3).every(v => v === 0)) {
        showError('Хотя бы одна λ должна быть > 0');
        return false;
    }
    hideError();
    return true;
}

function showError(msg) {
    const el = document.getElementById('errorMsg');
    el.textContent = msg;
    el.classList.add('show');
}

function hideError() {
    document.getElementById('errorMsg').classList.remove('show');
}

function calculate() {
    if (!validate()) return;

    document.getElementById('loading').classList.add('show');

    setTimeout(() => {
        const l1 = +document.getElementById('l1').value;
        const l2 = +document.getElementById('l2').value;
        const l3 = +document.getElementById('l3').value;
        const m1 = +document.getElementById('m1').value;
        const m2 = +document.getElementById('m2').value;
        const m3 = +document.getElementById('m3').value;
        const T = +document.getElementById('T').value;

        showEquations();
        showMatrix();

        const Q = buildQ(l1, l2, l3, m1, m2, m3);
        const res = solveODE(Q, T);

        showResults(res);
        drawChart(res);

        document.getElementById('loading').classList.remove('show');
    }, 100);
}

function reset() {
    ['l1','l2','l3'].forEach(id => document.getElementById(id).value = '1');
    ['m1','m2','m3'].forEach(id => document.getElementById(id).value = '10');
    document.getElementById('T').value = '1';
    document.getElementById('results').classList.remove('show');
    hideError();
    if (chart) { chart.destroy(); chart = null; }
}

window.addEventListener('load', () => {
    drawGraph();
    calculate();
});

window.addEventListener('resize', drawGraph);