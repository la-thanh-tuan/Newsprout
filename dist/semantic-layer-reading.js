"use strict";
const semanticTermVisibilityStorageKey = "semanticLayer.showSemanticTerms";
const currentStructuralRelation = {
    type: "prepositional-range",
    sourceText: "from the development context, objectives, perspectives, and operational mechanisms to key tasks and strategic breakthroughs",
    parts: ["from A", "development context / objectives / perspectives / operational mechanisms", "to B", "key tasks / strategic breakthroughs"],
    readingNote: "Cụm này chỉ phạm vi bao quát, đi từ tầng nền tảng định hướng đến tầng nhiệm vụ và đột phá chiến lược."
};
function renderFlowNodes(parts) {
    return parts.map((part, index) => {
        const node = `<span class="node">${part}</span>`;
        return index === 0 ? node : `<span class="arrow">→</span>${node}`;
    }).join("");
}
function renderPatternRows(items) {
    return items.map((item) => `
      <tr>
        <td><strong>${item.vietnameseName}</strong><br><small>${item.grammarName}</small></td>
        <td>${item.pattern}</td>
        <td>${item.functionLabel}</td>
        <td>${item.signals.join("; ")}</td>
      </tr>
    `).join("");
}
function renderCatalogTable(title, description, items) {
    return `
    <div class="box">
      <h3>${title}</h3>
      <p>${description}</p>
      <table>
        <thead>
          <tr>
            <th>Subtype</th>
            <th>Pattern</th>
            <th>Chức năng</th>
            <th>Dấu hiệu nhận diện</th>
          </tr>
        </thead>
        <tbody>${renderPatternRows(items)}</tbody>
      </table>
    </div>
  `;
}
function renderLayer1Core() {
    return `
    <h2>Layer 1: Câu lõi</h2>
    <div class="box">
      <h3>Câu lõi trong ví dụ hiện tại</h3>
      <p><strong>The documents / began to define / the core components.</strong></p>
      <p>Nghĩa nhanh: <strong>Các văn kiện bắt đầu xác định các thành tố cốt lõi.</strong></p>
      <p><strong>Subtype:</strong> Active clause core / Câu chủ động có lõi S-V-O.</p>
    </div>
    <p>Ở tầng này, mục tiêu là bỏ qua toàn bộ phần phụ để thấy “xương sống” của câu.</p>
    ${renderCatalogTable("Catalog subtype cho Layer 1", "Layer 1 là tầng nền để nhận diện lõi mệnh đề/câu.", getAllCoreClausePatterns())}
  `;
}
function renderLayer2Modifiers() {
    return `
    <h2>Layer 2: Thành phần bổ nghĩa</h2>
    <div class="explanation-grid">
      <div class="box">
        <h3>Cụm bổ nghĩa trong ví dụ hiện tại</h3>
        <ul>
          <li><strong>from the 14th National Party Congress</strong>: bổ nghĩa nguồn gốc cho “documents”.</li>
          <li><strong>in relatively comprehensive terms</strong>: bổ nghĩa cách thức/mức độ cho “define”.</li>
          <li><strong>of Vietnam’s development model</strong>: bổ nghĩa sở thuộc cho “core components”.</li>
          <li><strong>in the new era</strong>: bổ nghĩa bối cảnh thời đại.</li>
        </ul>
      </div>
      <div class="box">
        <h3>Ý nghĩa</h3>
        <p>Câu không chỉ nói “văn kiện xác định thành tố”, mà nói rõ văn kiện nào, xác định theo mức độ nào, thành tố thuộc mô hình nào, và trong giai đoạn nào.</p>
      </div>
    </div>
    ${renderCatalogTable("Catalog subtype cho Layer 2", "Layer 2 gom các thành phần bổ nghĩa quanh câu lõi.", getAllModifierPatterns())}
  `;
}
function renderLayer3PhraseDecomposition() {
    return `
    <h2>Layer 3: Phân rã cụm</h2>
    <div class="box">
      <h3>Cụm cần phân tích trong ví dụ hiện tại</h3>
      <p><strong>the core components of Vietnam’s development model in the new era</strong></p>
      <p><strong>Subtype:</strong> Noun phrase / Cụm danh từ.</p>
    </div>
    <div class="logic-flow">
      <span class="node">components</span><span class="arrow">→</span><span class="node">core components</span><span class="arrow">→</span><span class="node">of Vietnam’s development model</span><span class="arrow">→</span><span class="node">in the new era</span>
    </div>
    <p>Nghĩa tăng dần: thành tố → thành tố cốt lõi → thành tố cốt lõi của mô hình phát triển Việt Nam → trong kỷ nguyên mới.</p>
    ${renderCatalogTable("Catalog subtype cho Layer 3", "Layer 3 không chỉ dành cho cụm danh từ, mà có thể phân rã nhiều loại cụm khác nhau.", getAllPhrasePatterns())}
  `;
}
function renderStructuralRelationLayer() {
    const pattern = getGrammarPattern(currentStructuralRelation.type);
    return `
    <h2>Layer 4: Quan hệ cấu trúc</h2>
    <div class="box">
      <h3>Subtype phát hiện trong câu này</h3>
      <p><strong>${pattern.grammarName}</strong> / ${pattern.vietnameseName}</p>
      <p><strong>Pattern:</strong> ${pattern.pattern}</p>
      <p><strong>Cụm trong câu:</strong> ${currentStructuralRelation.sourceText}</p>
    </div>
    <div class="logic-flow">${renderFlowNodes(currentStructuralRelation.parts)}</div>
    <p><strong>Chức năng đọc hiểu:</strong> ${currentStructuralRelation.readingNote}</p>
    ${renderCatalogTable("Catalog subtype cho Layer 4", "Layer 4 là tầng tổng quát. Mỗi câu có thể kích hoạt một hoặc nhiều subtype khác nhau.", getAllGrammarPatterns())}
  `;
}
const layerContent = {
    1: renderLayer1Core,
    2: renderLayer2Modifiers,
    3: renderLayer3PhraseDecomposition,
    4: renderStructuralRelationLayer,
    5: `<h2>Layer 5: Đi sâu nội hàm thuật ngữ</h2><table><thead><tr><th>Thuật ngữ</th><th>Nội hàm</th><th>Cách dùng gần nghĩa</th></tr></thead><tbody><tr><td><strong>documents</strong></td><td>Trong ngữ cảnh chính trị, nên hiểu là “văn kiện”, tức tài liệu định hướng chính thức.</td><td>official papers; congress documents; policy documents</td></tr><tr><td><strong>began to define</strong></td><td>Bước đầu xác định/định hình một khái niệm, khung hoặc mô hình.</td><td>started to outline; began to shape; set out to identify</td></tr><tr><td><strong>development model</strong></td><td>Mô hình phát triển: khung tổng thể về mục tiêu, phương thức, cơ chế, nguồn lực và chiến lược phát triển.</td><td>growth model; development framework; model for development</td></tr><tr><td><strong>perspectives</strong></td><td>Quan điểm chỉ đạo, cách nhìn, nguyên tắc tư duy phát triển.</td><td>viewpoints; guiding views; policy perspectives</td></tr><tr><td><strong>operational mechanisms</strong></td><td>Cơ chế vận hành: cách mô hình được triển khai thông qua thể chế, chính sách và tổ chức thực thi.</td><td>operating mechanisms; implementation mechanisms; working mechanisms</td></tr><tr><td><strong>strategic breakthroughs</strong></td><td>Đột phá chiến lược: các điểm then chốt có khả năng tạo chuyển biến lớn.</td><td>strategic advances; strategic levers; breakthrough priorities</td></tr></tbody></table>`,
    6: `<h2>Layer 6: Tái tạo nghĩa hoàn chỉnh</h2><div class="final-meaning">Các văn kiện Đại hội Đảng toàn quốc lần thứ 14 đã bước đầu định hình tương đối toàn diện các thành tố cốt lõi của mô hình phát triển Việt Nam trong kỷ nguyên mới, bao gồm từ bối cảnh phát triển, mục tiêu, quan điểm và cơ chế vận hành đến các nhiệm vụ trọng tâm và đột phá chiến lược.</div><p>Nói ngắn gọn:</p><div class="box"><strong>Văn kiện Đại hội XIV đặt nền móng cho việc định hình mô hình phát triển mới của Việt Nam, từ tầng tư duy định hướng đến tầng hành động chiến lược.</strong></div>`
};
function toLayerNumber(value) {
    const parsed = Number(value);
    return parsed >= 1 && parsed <= 6 ? parsed : 1;
}
function setActiveButton(layer) {
    document.querySelectorAll("[data-layer]").forEach((button) => {
        const buttonLayer = toLayerNumber(button.dataset.layer ?? null);
        button.classList.toggle("active", buttonLayer === layer);
    });
}
function updateHighlightVisibility(layer) {
    document.querySelectorAll(".hl").forEach((item) => {
        const minLayer = Number(item.dataset.minLayer ?? "1");
        item.classList.toggle("hidden-layer", minLayer > layer);
    });
}
function resolveLayerContent(layer) {
    const content = layerContent[layer];
    return typeof content === "function" ? content() : content;
}
function renderLayerExplanation(layer) {
    const target = document.getElementById("layerExplanation");
    if (!target)
        return;
    target.innerHTML = resolveLayerContent(layer);
}
function setLayer(layer) {
    setActiveButton(layer);
    updateHighlightVisibility(layer);
    renderLayerExplanation(layer);
}
function bindLayerButtons() {
    document.querySelectorAll("[data-layer]").forEach((button) => {
        button.addEventListener("click", () => {
            setLayer(toLayerNumber(button.dataset.layer ?? null));
        });
    });
}
function injectSemanticTermStyles() {
    if (document.getElementById("semanticTermStyles"))
        return;
    const style = document.createElement("style");
    style.id = "semanticTermStyles";
    style.textContent = `
    .semantic-term { background: #ecfeff; border-bottom: 3px dotted #0891b2; border-radius: 4px; padding: 0 2px; }
    body:not(.semantic-terms-visible) .semantic-term { background: transparent !important; border-bottom: none !important; padding: 0 !important; }
    .hidden-layer .semantic-term { background: transparent !important; border-bottom: none !important; }
    .legend-semantic-term { background: #ecfeff; border-bottom: 3px dotted #0891b2; }
    body:not(.semantic-terms-visible) .legend-semantic-term-chip { display: none; }
    .semantic-term-toggle { display: inline-flex; align-items: center; gap: 6px; padding: 9px 12px; border: 1px solid #d1d5db; border-radius: 999px; background: #fff; font-size: 14px; cursor: pointer; }
    .semantic-term-toggle input { margin: 0; }
  `;
    document.head.appendChild(style);
}
function getSavedSemanticTermVisibility() {
    return localStorage.getItem(semanticTermVisibilityStorageKey) === "true";
}
function setSemanticTermVisibility(isVisible) {
    document.body.classList.toggle("semantic-terms-visible", isVisible);
    localStorage.setItem(semanticTermVisibilityStorageKey, String(isVisible));
}
function addSemanticTermToggle() {
    const controls = document.querySelector(".controls");
    if (!controls || document.getElementById("semanticTermToggle"))
        return;
    const label = document.createElement("label");
    label.className = "semantic-term-toggle";
    label.innerHTML = `<input id="semanticTermToggle" type="checkbox" /> Hiện thuật ngữ / khái niệm`;
    const input = label.querySelector("input");
    if (!input)
        return;
    input.checked = getSavedSemanticTermVisibility();
    setSemanticTermVisibility(input.checked);
    input.addEventListener("change", () => setSemanticTermVisibility(input.checked));
    controls.appendChild(label);
}
function wrapDirectTextTerm(container, term) {
    const textNode = Array.from(container.childNodes).find((node) => node.nodeType === Node.TEXT_NODE && node.textContent?.includes(term));
    if (!textNode?.textContent || !textNode.parentNode)
        return;
    const parts = textNode.textContent.split(term);
    if (parts.length < 2)
        return;
    const fragment = document.createDocumentFragment();
    parts.forEach((part, index) => {
        if (part)
            fragment.appendChild(document.createTextNode(part));
        if (index < parts.length - 1) {
            const marker = document.createElement("span");
            marker.className = "semantic-term";
            marker.textContent = term;
            fragment.appendChild(marker);
        }
    });
    textNode.parentNode.replaceChild(fragment, textNode);
}
function markSemanticTerms() {
    document.querySelectorAll(".hl.modifier").forEach((item) => {
        wrapDirectTextTerm(item, "development model");
        wrapDirectTextTerm(item, "new era");
    });
}
function addSemanticTermLegend() {
    const legend = document.querySelector(".legend");
    if (!legend || legend.querySelector(".legend-semantic-term"))
        return;
    const chip = document.createElement("span");
    chip.className = "legend-chip legend-semantic-term-chip";
    chip.innerHTML = `<span class="legend-swatch legend-semantic-term"></span>Thuật ngữ / khái niệm`;
    legend.appendChild(chip);
}
function applySemanticTermMarkers() {
    injectSemanticTermStyles();
    markSemanticTerms();
    addSemanticTermLegend();
    addSemanticTermToggle();
}
function renderPatternTags(types, getPattern) {
    if (types.length === 0)
        return `<span class="muted">Chưa phát hiện</span>`;
    return types.map((type) => {
        const pattern = getPattern(type);
        return `<span class="tag" title="${pattern.grammarName}: ${pattern.pattern}">${pattern.vietnameseName}</span>`;
    }).join("");
}
function renderSentenceAnalysis(sentence, result, index) {
    return `
    <div class="analysis-card">
      <h3>Câu ${index + 1}</h3>
      <p class="analysis-sentence">${sentence}</p>
      <div class="analysis-grid">
        <div><strong>Layer 1 · Câu lõi</strong><br>${renderPatternTags(result.layer1, getCoreClausePattern)}</div>
        <div><strong>Layer 2 · Bổ nghĩa</strong><br>${renderPatternTags(result.layer2, getModifierPattern)}</div>
        <div><strong>Layer 3 · Phân rã cụm</strong><br>${renderPatternTags(result.layer3, getPhrasePattern)}</div>
        <div><strong>Layer 4 · Quan hệ cấu trúc</strong><br>${renderPatternTags(result.layer4, getGrammarPattern)}</div>
      </div>
    </div>
  `;
}
function analyzeInputText() {
    const input = document.getElementById("analysisInput");
    const output = document.getElementById("analysisOutput");
    if (!input || !output)
        return;
    const sentences = splitIntoSentences(input.value).slice(0, 12);
    if (sentences.length === 0) {
        output.innerHTML = `<p class="muted">Hãy nhập ít nhất một câu tiếng Anh.</p>`;
        return;
    }
    output.innerHTML = sentences.map((sentence, index) => renderSentenceAnalysis(sentence, detectSentenceLayers(sentence), index)).join("");
}
function bindAnalysisControls() {
    const button = document.getElementById("analyzeButton");
    button?.addEventListener("click", analyzeInputText);
}
window.addEventListener("DOMContentLoaded", () => {
    bindLayerButtons();
    bindAnalysisControls();
    applySemanticTermMarkers();
    setLayer(1);
});
