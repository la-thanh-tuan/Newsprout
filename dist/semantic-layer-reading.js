"use strict";
const STORAGE_KEY = "semantic-layer-reading-progress";
let currentLayer = 1;
let currentMode = "learn";
let progressState = loadProgress();
const layerContent = {
    1: `<h2>Layer 1: Detect câu lõi</h2><div class="box"><h3>Câu lõi</h3><p><strong>The documents / began to define / the core components.</strong></p><p>Nghĩa nhanh: <strong>Các văn kiện bắt đầu xác định các thành tố cốt lõi.</strong></p></div><p>Ở tầng này, mục tiêu là bỏ qua toàn bộ phần phụ để thấy “xương sống” của câu.</p>`,
    2: `<h2>Layer 2: Gắn cụm bổ nghĩa</h2><div class="explanation-grid"><div class="box"><h3>Cụm bổ nghĩa</h3><ul><li><strong>from the 14th National Party Congress</strong>: bổ nghĩa cho “documents”.</li><li><strong>in relatively comprehensive terms</strong>: bổ nghĩa cho cách “define”.</li><li><strong>of Vietnam’s development model</strong>: bổ nghĩa cho “core components”.</li><li><strong>in the new era</strong>: bổ nghĩa bối cảnh.</li></ul></div><div class="box"><h3>Ý nghĩa</h3><p>Câu không chỉ nói “văn kiện xác định thành tố”, mà nói rõ văn kiện nào, xác định theo mức độ nào, thành tố thuộc mô hình nào, và trong giai đoạn nào.</p></div></div>`,
    3: `<h2>Layer 3: Phân rã cụm danh từ dài</h2><div class="box"><h3>Cụm cần phân tích</h3><p><strong>the core components of Vietnam’s development model in the new era</strong></p></div><div class="logic-flow"><span class="node">components</span><span class="arrow">→</span><span class="node">core components</span><span class="arrow">→</span><span class="node">of Vietnam’s development model</span><span class="arrow">→</span><span class="node">in the new era</span></div><p>Nghĩa tăng dần: thành tố → thành tố cốt lõi → thành tố cốt lõi của mô hình phát triển Việt Nam → trong kỷ nguyên mới.</p>`,
    4: `<h2>Layer 4: Xây quan hệ logic</h2><div class="logic-flow"><span class="node">Documents</span><span class="arrow">→</span><span class="node">Define</span><span class="arrow">→</span><span class="node">Core components</span><span class="arrow">→</span><span class="node">Development model</span><span class="arrow">→</span><span class="node">From context to breakthroughs</span></div><p>Logic của câu là: <strong>nguồn định hướng → hành động khái niệm hóa → đối tượng được định hình → phạm vi bao quát.</strong></p>`,
    5: `<h2>Layer 5: Đi sâu nội hàm thuật ngữ</h2><table><thead><tr><th>Thuật ngữ</th><th>Nội hàm</th></tr></thead><tbody><tr><td><strong>documents</strong></td><td>Trong ngữ cảnh chính trị, nên hiểu là “văn kiện”, tức tài liệu định hướng chính thức.</td></tr><tr><td><strong>development model</strong></td><td>Mô hình phát triển: khung tổng thể về mục tiêu, phương thức, cơ chế, nguồn lực và chiến lược phát triển.</td></tr><tr><td><strong>perspectives</strong></td><td>Quan điểm chỉ đạo, cách nhìn, nguyên tắc tư duy phát triển.</td></tr><tr><td><strong>operational mechanisms</strong></td><td>Cơ chế vận hành: cách mô hình được triển khai thông qua thể chế, chính sách và tổ chức thực thi.</td></tr><tr><td><strong>strategic breakthroughs</strong></td><td>Đột phá chiến lược: các điểm then chốt có khả năng tạo chuyển biến lớn.</td></tr></tbody></table>`,
    6: `<h2>Layer 6: Tái tạo nghĩa hoàn chỉnh</h2><div class="final-meaning">Các văn kiện Đại hội Đảng toàn quốc lần thứ 14 đã bước đầu định hình tương đối toàn diện các thành tố cốt lõi của mô hình phát triển Việt Nam trong kỷ nguyên mới, bao gồm từ bối cảnh phát triển, mục tiêu, quan điểm và cơ chế vận hành đến các nhiệm vụ trọng tâm và đột phá chiến lược.</div><p>Nói ngắn gọn:</p><div class="box"><strong>Văn kiện Đại hội XIV đặt nền móng cho việc định hình mô hình phát triển mới của Việt Nam, từ tầng tư duy định hướng đến tầng hành động chiến lược.</strong></div>`
};
const semanticRoles = {
    1: [
        { label: "Nguồn thông tin", value: "The documents" },
        { label: "Hành động trung tâm", value: "began to define" },
        { label: "Đối tượng được định hình", value: "the core components" }
    ],
    2: [
        { label: "Nguồn chính trị", value: "from the 14th National Party Congress" },
        { label: "Sắc thái mức độ", value: "relatively comprehensive" },
        { label: "Bối cảnh thời đại", value: "in the new era" }
    ],
    3: [
        { label: "Hạt nhân danh từ", value: "components" },
        { label: "Phạm vi sở thuộc", value: "of Vietnam’s development model" },
        { label: "Khung thời đại", value: "in the new era" }
    ],
    4: [
        { label: "Luồng ý", value: "Documents → Define → Components" },
        { label: "Phạm vi", value: "from context to breakthroughs" },
        { label: "Tầng nghĩa", value: "từ định hướng đến hành động" }
    ],
    5: [
        { label: "Thuật ngữ chính sách", value: "development model" },
        { label: "Nguyên tắc chỉ đạo", value: "perspectives" },
        { label: "Cơ chế thực thi", value: "operational mechanisms" }
    ],
    6: [
        { label: "Ý chính", value: "Định hình mô hình phát triển mới" },
        { label: "Bản dịch", value: "ưu tiên chính xác + tự nhiên" },
        { label: "Chuyển kỹ năng", value: "đọc → dịch / nói / viết / tóm tắt" }
    ]
};
const paraphraseReference = {
    1: [
        { source: "documents", alternatives: ["official documents", "policy documents", "texts"], note: "Văn cảnh chính trị nên ưu tiên “official/policy documents”." },
        { source: "began to define", alternatives: ["started to define", "began to outline", "started shaping", "began to clarify"], note: "“outline” nhẹ hơn “define”; “shape” thiên về định hình quá trình." },
        { source: "core components", alternatives: ["key components", "essential elements", "central elements"], note: "“core” nhấn mạnh tính cốt lõi; “key” phổ biến hơn." }
    ],
    2: [
        { source: "from the 14th National Party Congress", alternatives: ["issued at...", "adopted by...", "associated with..."], note: "“issued/adopted” cụ thể hơn nếu văn kiện được ban hành/thông qua." },
        { source: "in relatively comprehensive terms", alternatives: ["in a fairly comprehensive way", "with a broad scope", "in a rather comprehensive manner"], note: "Giữ sắc thái thận trọng của “relatively”." },
        { source: "in the new era", alternatives: ["in a new era", "in the new development period", "in the new phase"], note: "“the new era” trang trọng và có sắc thái chính trị hơn." }
    ],
    3: [
        { source: "Vietnam’s development model", alternatives: ["Vietnamese development model", "Vietnam’s model of development", "Vietnam’s development framework"], note: "“framework” thiên về khung định hướng hơn là mô hình." },
        { source: "development model", alternatives: ["model of development", "development framework", "growth model"], note: "“growth model” hẹp hơn vì nghiêng về kinh tế." },
        { source: "components", alternatives: ["elements", "building blocks", "constituents"], note: "“building blocks” dễ hiểu; “constituents” học thuật." }
    ],
    4: [
        { source: "from... to...", alternatives: ["ranging from... to...", "covering... as well as...", "spanning... through..."], note: "Dùng để biểu thị phạm vi bao quát." },
        { source: "define", alternatives: ["outline", "identify", "clarify", "formulate"], note: "“formulate” hàm ý xây dựng thành hệ thống." },
        { source: "breakthroughs", alternatives: ["major breakthroughs", "strategic advances", "transformative priorities"], note: "“strategic breakthroughs” hợp văn bản chính sách hơn." }
    ],
    5: [
        { source: "development context", alternatives: ["development setting", "development landscape", "socio-economic context"], note: "“context” trung tính; “landscape” hiện đại hơn." },
        { source: "objectives", alternatives: ["goals", "targets", "aims"], note: "“targets” thường cụ thể và đo lường được hơn." },
        { source: "perspectives", alternatives: ["viewpoints", "guiding views", "policy perspectives"], note: "“guiding views” gần nghĩa “quan điểm chỉ đạo”." },
        { source: "operational mechanisms", alternatives: ["operating mechanisms", "implementation mechanisms", "institutional mechanisms"], note: "“implementation” nhấn mạnh triển khai; “institutional” nhấn mạnh thể chế." },
        { source: "key tasks", alternatives: ["major tasks", "priority tasks", "central tasks"], note: "“priority tasks” nhấn mạnh thứ tự ưu tiên." }
    ],
    6: [
        { source: "began to define", alternatives: ["began to shape", "laid the groundwork for", "took initial steps to clarify"], note: "Bản dịch mượt: “bước đầu định hình” hoặc “đặt nền móng cho”." },
        { source: "relatively comprehensive", alternatives: ["fairly comprehensive", "rather comprehensive", "broadly comprehensive"], note: "Tránh hiểu thành “hoàn toàn toàn diện”." },
        { source: "strategic breakthroughs", alternatives: ["đột phá chiến lược", "khâu đột phá chiến lược", "ưu tiên đột phá"], note: "Tiếng Việt chính sách thường dùng “đột phá chiến lược”." }
    ]
};
const practiceQuestions = {
    1: { id: "core-svo", prompt: "Câu lõi đúng nhất là gì?", options: ["The documents began to define the core components.", "The 14th Congress was relatively comprehensive.", "Vietnam developed strategic breakthroughs."], correctIndex: 0, success: "Đúng. Bạn đã bắt được Subject + Verb + Object.", error: "Chưa đúng. Hãy bỏ tạm các cụm from/in/of/to để tìm xương sống." },
    2: { id: "modifier-manner", prompt: "Cụm “in relatively comprehensive terms” bổ nghĩa cho phần nào?", options: ["The documents", "began to define", "the 14th National Party Congress"], correctIndex: 1, success: "Đúng. Cụm này nói cách/mức độ của hành động “define”.", error: "Chưa đúng. Cụm này nằm chen giữa động từ và tân ngữ để bổ nghĩa cho hành động." },
    3: { id: "head-noun", prompt: "Trong cụm “the core components of Vietnam’s development model”, danh từ trung tâm là gì?", options: ["Vietnam", "development model", "components"], correctIndex: 2, success: "Đúng. “components” là hạt nhân, các phần sau chỉ bổ nghĩa.", error: "Chưa đúng. Hãy tìm danh từ chính trước rồi đọc các cụm of/in đi sau." },
    4: { id: "range-logic", prompt: "Cấu trúc “from... to...” trong câu này chủ yếu biểu thị điều gì?", options: ["Nguyên nhân", "Phạm vi bao quát", "Sự đối lập"], correctIndex: 1, success: "Đúng. Nó cho thấy phạm vi từ nền tảng đến hành động chiến lược.", error: "Chưa đúng. “from... to...” ở đây không phải nguyên nhân hay đối lập." },
    5: { id: "policy-term", prompt: "Trong văn cảnh này, “documents” nên hiểu tự nhiên nhất là gì?", options: ["giấy tờ", "văn kiện", "bài tập"], correctIndex: 1, success: "Đúng. Ngữ cảnh chính trị nên dịch là “văn kiện”.", error: "Chưa đúng. Trong văn bản chính trị, “documents” thường là “văn kiện”." },
    6: { id: "summary-transfer", prompt: "Bản tóm tắt đúng nhất của cả câu là gì?", options: ["Văn kiện Đại hội XIV bước đầu định hình mô hình phát triển mới của Việt Nam.", "Đại hội XIV chỉ nói về nhiệm vụ trọng tâm.", "Việt Nam đã hoàn thành toàn bộ mô hình phát triển."], correctIndex: 0, success: "Đúng. Bạn đã chuyển được câu dài thành ý chính ngắn.", error: "Chưa đúng. Câu gốc nói “bước đầu định hình”, không nói đã hoàn thành." }
};
const transferTasks = {
    1: [{ label: "Đọc → Tóm tắt", value: "The documents began to define the core components." }, { label: "Đọc → Nói", value: "Câu này nói về việc các văn kiện bắt đầu định hình các thành tố chính." }],
    2: [{ label: "Đọc → Dịch", value: "in relatively comprehensive terms → một cách tương đối toàn diện" }, { label: "Đọc → Viết", value: "The documents define the model in a fairly comprehensive way." }],
    3: [{ label: "Đọc → Tách cụm", value: "components → core components → of Vietnam’s development model" }, { label: "Đọc → Viết lại", value: "the main elements of Vietnam’s model of development" }],
    4: [{ label: "Đọc → Logic", value: "Nguồn định hướng → định hình → phạm vi nội dung" }, { label: "Đọc → Nói", value: "Nó bao quát từ bối cảnh, mục tiêu đến nhiệm vụ và đột phá." }],
    5: [{ label: "Đọc → Từ vựng ngành", value: "perspectives = quan điểm chỉ đạo; mechanisms = cơ chế vận hành" }, { label: "Đọc → Dịch chính sách", value: "strategic breakthroughs → đột phá chiến lược" }],
    6: [{ label: "Đọc → Dịch", value: "Tạo bản dịch chính xác, trang trọng." }, { label: "Đọc → Tóm tắt", value: "Rút câu dài thành 1 ý chính." }, { label: "Đọc → Nói", value: "Diễn giải lại bằng tiếng Việt tự nhiên." }, { label: "Đọc → Viết", value: "Paraphrase lại bằng tiếng Anh đơn giản hơn." }]
};
function loadProgress() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw)
            return { xp: 0, solved: 0, streak: 0, answered: {} };
        return JSON.parse(raw);
    }
    catch {
        return { xp: 0, solved: 0, streak: 0, answered: {} };
    }
}
function saveProgress() { localStorage.setItem(STORAGE_KEY, JSON.stringify(progressState)); }
function toLayerNumber(value) {
    const parsed = Number(value);
    return parsed >= 1 && parsed <= 6 ? parsed : 1;
}
function toAppMode(value) { return value === "practice" ? "practice" : "learn"; }
function renderSemanticRoles(layer) {
    const items = semanticRoles[layer].map((item) => `<span class="pill"><strong>${item.label}:</strong>&nbsp;${item.value}</span>`).join("");
    return `<h3>Vai trò ý nghĩa</h3><div class="pill-row">${items}</div>`;
}
function renderParaphraseLadder(layer) {
    const rows = paraphraseReference[layer].map((item) => `
    <tr><td><strong>${item.source}</strong></td><td>${item.alternatives.join(" / ")}</td><td>${item.note}</td></tr>
  `).join("");
    return `<h3>Paraphrase ladder</h3><table><thead><tr><th>Cụm gốc</th><th>Cách dùng gần nghĩa</th><th>Sắc thái</th></tr></thead><tbody>${rows}</tbody></table>`;
}
function renderTransferTasks(layer) {
    const cards = transferTasks[layer].map((item) => `<div class="skill-card"><h3>${item.label}</h3><p>${item.value}</p></div>`).join("");
    return `<h3>Chuyển kỹ năng</h3><div class="skill-grid">${cards}</div>`;
}
function renderLearnPanel(layer) {
    return `${layerContent[layer]}<div class="interest-note">Gợi ý học tự nguyện: chỉ cần hoàn thành layer bạn thấy hứng thú trước, không bắt buộc đi tuyến tính.</div>${renderSemanticRoles(layer)}${renderParaphraseLadder(layer)}${renderTransferTasks(layer)}`;
}
function renderPracticePanel(layer) {
    const question = practiceQuestions[layer];
    const options = question.options.map((option, index) => `<button class="option-button" type="button" data-answer="${index}">${option}</button>`).join("");
    const solvedBadge = progressState.answered[question.id] ? `<div class="feedback success">Bạn đã hoàn thành câu hỏi này. Có thể luyện lại để củng cố.</div>` : "";
    return `
    <h2>Tự luyện layer ${layer}</h2>
    <div class="challenge" data-question-id="${question.id}">
      <h3>${question.prompt}</h3>
      <div class="practice-options">${options}</div>
      <div id="practiceFeedback">${solvedBadge}</div>
    </div>
    ${renderSemanticRoles(layer)}
  `;
}
function renderLayerExplanation(layer) {
    const target = document.getElementById("layerExplanation");
    if (!target)
        return;
    target.innerHTML = currentMode === "learn" ? renderLearnPanel(layer) : renderPracticePanel(layer);
}
function setActiveLayerButton(layer) {
    document.querySelectorAll("[data-layer]").forEach((button) => {
        const buttonLayer = toLayerNumber(button.dataset.layer ?? null);
        button.classList.toggle("active", buttonLayer === layer);
    });
}
function setActiveModeButton(mode) {
    document.querySelectorAll("[data-mode]").forEach((button) => {
        const buttonMode = toAppMode(button.dataset.mode ?? null);
        button.classList.toggle("active", buttonMode === mode);
    });
}
function updateHighlightVisibility(layer) {
    document.querySelectorAll(".hl").forEach((item) => {
        const minLayer = Number(item.dataset.minLayer ?? "1");
        item.classList.toggle("hidden-layer", minLayer > layer);
    });
}
function updateProgressUi() {
    const xpValue = document.getElementById("xpValue");
    const solvedValue = document.getElementById("solvedValue");
    const streakValue = document.getElementById("streakValue");
    const progressFill = document.getElementById("progressFill");
    const microGoal = document.getElementById("microGoal");
    if (xpValue)
        xpValue.textContent = String(progressState.xp);
    if (solvedValue)
        solvedValue.textContent = String(progressState.solved);
    if (streakValue)
        streakValue.textContent = String(progressState.streak);
    if (progressFill)
        progressFill.style.width = `${Math.min(100, progressState.solved / 6 * 100)}%`;
    if (microGoal)
        microGoal.textContent = progressState.solved >= 6 ? "Hoàn thành vòng luyện đầu tiên. Có thể luyện lại để tăng tốc đọc." : "Mục tiêu nhỏ: trả lời đúng 1 câu ở layer hiện tại.";
}
function setLayer(layer) {
    currentLayer = layer;
    setActiveLayerButton(layer);
    updateHighlightVisibility(layer);
    renderLayerExplanation(layer);
}
function setMode(mode) {
    currentMode = mode;
    setActiveModeButton(mode);
    renderLayerExplanation(currentLayer);
}
function handlePracticeAnswer(button) {
    const question = practiceQuestions[currentLayer];
    const selectedIndex = Number(button.dataset.answer);
    const isCorrect = selectedIndex === question.correctIndex;
    const feedback = document.getElementById("practiceFeedback");
    document.querySelectorAll("[data-answer]").forEach((optionButton) => {
        const optionIndex = Number(optionButton.dataset.answer);
        optionButton.classList.toggle("correct", optionIndex === question.correctIndex);
        optionButton.classList.toggle("wrong", optionButton === button && !isCorrect);
    });
    if (isCorrect && !progressState.answered[question.id]) {
        progressState.answered[question.id] = true;
        progressState.xp += 15;
        progressState.solved += 1;
        progressState.streak += 1;
        saveProgress();
        updateProgressUi();
    }
    if (!isCorrect) {
        progressState.streak = 0;
        saveProgress();
        updateProgressUi();
    }
    if (feedback) {
        feedback.innerHTML = `<div class="feedback ${isCorrect ? "success" : "error"}">${isCorrect ? question.success : question.error}</div>`;
    }
}
function bindLayerButtons() { document.querySelectorAll("[data-layer]").forEach((button) => button.addEventListener("click", () => setLayer(toLayerNumber(button.dataset.layer ?? null)))); }
function bindModeButtons() { document.querySelectorAll("[data-mode]").forEach((button) => button.addEventListener("click", () => setMode(toAppMode(button.dataset.mode ?? null)))); }
function bindPracticeDelegation() {
    document.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof HTMLButtonElement))
            return;
        if (!target.matches("[data-answer]"))
            return;
        handlePracticeAnswer(target);
    });
}
window.addEventListener("DOMContentLoaded", () => {
    bindLayerButtons();
    bindModeButtons();
    bindPracticeDelegation();
    updateProgressUi();
    setLayer(1);
});
