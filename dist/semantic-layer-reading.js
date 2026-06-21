"use strict";
const defaultSentence = "The documents from the 14th National Party Congress began to define, in relatively comprehensive terms, the core components of Vietnam’s development model in the new era, from the development context, objectives, perspectives, and operational mechanisms to key tasks and strategic breakthroughs.";
const customInputStorageKey = "semanticLayer.customInput";
const semanticTermVisibilityStorageKey = "semanticLayer.showSemanticTerms";
const semanticTermHighlightName = "semantic-terms";
const semanticTermCatalog = [
  { term: "development model", label: "Thuật ngữ chính sách", note: "Khung tổng thể về mục tiêu, phương thức, cơ chế, nguồn lực và chiến lược phát triển.", synonyms: "growth model; development framework; model for development" },
  { term: "new era", label: "Khái niệm chính luận", note: "Bối cảnh/giai đoạn phát triển mới, thường mang sắc thái diễn ngôn chính trị hoặc chiến lược.", synonyms: "new period; new phase; new stage" },
  { term: "National Party Congress", label: "Thuật ngữ chính trị", note: "Đại hội Đảng toàn quốc, một sự kiện chính trị định hướng văn kiện và chiến lược phát triển.", synonyms: "party congress; national congress" },
  { term: "policy framework", label: "Thuật ngữ chính sách", note: "Khung chính sách quy định nguyên tắc, phạm vi và cơ chế triển khai.", synonyms: "policy structure; regulatory framework" },
  { term: "state ownership", label: "Thuật ngữ kinh tế/chính sách", note: "Phần sở hữu hoặc vốn thuộc Nhà nước trong doanh nghiệp/tổ chức.", synonyms: "state capital; public ownership" },
  { term: "charter capital", label: "Thuật ngữ pháp lý/doanh nghiệp", note: "Vốn điều lệ được đăng ký trong hồ sơ pháp lý của doanh nghiệp.", synonyms: "registered capital; legal capital" },
  { term: "priority sectors", label: "Thuật ngữ chính sách", note: "Các lĩnh vực được ưu tiên hỗ trợ hoặc phát triển trong một khung chính sách.", synonyms: "target sectors; strategic sectors" },
  { term: "operational mechanisms", label: "Thuật ngữ quản trị/chính sách", note: "Cơ chế vận hành giúp chính sách hoặc mô hình được triển khai trong thực tế.", synonyms: "operating mechanisms; implementation mechanisms" },
  { term: "strategic breakthroughs", label: "Thuật ngữ chiến lược", note: "Các điểm then chốt có khả năng tạo chuyển biến lớn trong phát triển.", synonyms: "breakthrough priorities; strategic levers" },
  { term: "supply chains", label: "Thuật ngữ kinh tế", note: "Chuỗi cung ứng gồm các khâu cung cấp, sản xuất, vận chuyển và phân phối.", synonyms: "value chains; logistics chains" },
  { term: "external disruptions", label: "Khái niệm rủi ro", note: "Các cú sốc hoặc gián đoạn đến từ môi trường bên ngoài hệ thống.", synonyms: "external shocks; outside disruptions" }
];
let currentLayer = 1;
let currentText = defaultSentence;
let currentSpans = [];
const roleLabels = {
  subject: "Subject / Chủ ngữ",
  verb: "Main verb / Động từ chính",
  object: "Object / Tân ngữ",
  modifier: "Modifier / Bổ nghĩa",
  range: "Structural relation / Quan hệ cấu trúc"
};
function escapeHtml(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function clampText(value, maxLength = 360) {
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized.length > maxLength ? `${normalized.slice(0, maxLength)}…` : normalized;
}
function getSentenceSegments(text) {
  const segments = [];
  const regex = /[^.!?]+[.!?]?/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const raw = match[0];
    const localStart = raw.search(/\S/);
    if (localStart === -1) continue;
    const trimmed = raw.trim();
    segments.push({ text: trimmed, start: match.index + localStart, end: match.index + localStart + trimmed.length });
  }
  return segments.length ? segments : [{ text, start: 0, end: text.length }];
}
function trimRange(text, start, end) {
  while (start < end && /\s/.test(text[start] || "")) start += 1;
  while (end > start && /\s/.test(text[end - 1] || "")) end -= 1;
  return { start, end };
}
function findMainVerb(segment) {
  const patterns = [
    /\bbegan\s+to\s+define\b/i,
    /\bstarted\s+to\s+(?:define|outline|build|shape)\b/i,
    /\bshould\s+work\s+together\s+to\s+build\b/i,
    /\bmay\s+qualify\b/i,
    /\bcan\s+qualify\b/i,
    /\bwill\s+(?:define|include|support|build|guide|reflect)\b/i,
    /\bshould\s+(?:define|include|support|build|guide|reflect|operate)\b/i,
    /\bsuggested\b/i,
    /\b(?:began|started|defined|defines|define|includes|include|operate|operates|build|builds|reflect|reflects|guide|guides|is|are|was|were|has|have|had)\b/i
  ];
  let best = null;
  patterns.forEach((pattern) => {
    const match = pattern.exec(segment);
    if (match && (!best || match.index < best.index)) best = { index: match.index, text: match[0] };
  });
  return best;
}
function overlapsBlocked(spans, candidate) {
  return spans.some((span) => {
    const overlaps = candidate.start < span.end && candidate.end > span.start;
    if (!overlaps) return false;
    if (candidate.role === "range" || span.role === "range") return true;
    if (candidate.role === "modifier" && span.role === "modifier") return true;
    if (["subject", "verb", "object"].includes(candidate.role)) return false;
    return ["subject", "verb", "object"].includes(span.role);
  });
}
function addSpan(spans, candidate) {
  if (candidate.end <= candidate.start) return;
  if (!currentText.slice(candidate.start, candidate.end).trim()) return;
  if (spans.some((span) => span.start === candidate.start && span.end === candidate.end && span.role === candidate.role)) return;
  if (overlapsBlocked(spans, candidate)) return;
  spans.push(candidate);
}
function cutSubjectBeforePostModifier(subjectText) {
  const match = /\s(?:from|under|within|during|after|before|with|without|according\s+to|in|of|for|by)\s/i.exec(subjectText);
  return match ? match.index : subjectText.length;
}
function skipLeadingDelimitedModifiers(segment, start) {
  let cursor = start;
  while (/^[\s,]+/.test(segment.slice(cursor))) {
    cursor += (segment.slice(cursor).match(/^[\s,]+/) || [""])[0].length;
    const modifier = /^(in\s+[^,]+?terms|with\s+[^,]+|under\s+[^,]+)/i.exec(segment.slice(cursor));
    if (!modifier) break;
    cursor += modifier[0].length;
    if (segment[cursor] === ",") cursor += 1;
  }
  while (/\s/.test(segment[cursor] || "")) cursor += 1;
  return cursor;
}
function detectCoreSpans(segment, spans) {
  const verb = findMainVerb(segment.text);
  if (!verb) return;
  const verbStart = segment.start + verb.index;
  const verbEnd = verbStart + verb.text.length;
  const subjectCut = cutSubjectBeforePostModifier(segment.text.slice(0, verb.index));
  const subjectRange = trimRange(currentText, segment.start, segment.start + subjectCut);
  addSpan(spans, { start: subjectRange.start, end: subjectRange.end, revealLayer: 1, role: "subject", subtype: "main-subject", tooltip: "Chủ ngữ chính. Đây là thành phần lõi của câu." });
  addSpan(spans, { start: verbStart, end: verbEnd, revealLayer: 1, role: "verb", subtype: "main-verb", tooltip: "Động từ/cụm động từ chính. Đây là trục hành động của câu." });
  const objectLocalStart = skipLeadingDelimitedModifiers(segment.text, verb.index + verb.text.length);
  const objectTail = segment.text.slice(objectLocalStart);
  const boundary = /\s(?:of|in|from|under|within|during|after|before|with|without|according\s+to|for|by)\s|[.;!?]/i.exec(objectTail);
  const objectLocalEnd = objectLocalStart + (boundary ? boundary.index : objectTail.length);
  const objectRange = trimRange(currentText, segment.start + objectLocalStart, segment.start + objectLocalEnd);
  addSpan(spans, { start: objectRange.start, end: objectRange.end, revealLayer: 1, role: "object", subtype: "main-object-or-complement", tooltip: "Tân ngữ hoặc bổ ngữ chính sau động từ. Đây vẫn thuộc câu lõi." });
}
function addRegexSpan(spans, segment, regex, role, revealLayer, subtype, tooltip, groupIndex = 0) {
  const localRegex = new RegExp(regex.source, regex.flags.includes("g") ? regex.flags : `${regex.flags}g`);
  let match;
  while ((match = localRegex.exec(segment.text)) !== null) {
    const matchedText = match[groupIndex] || match[0];
    const localOffset = match[0].indexOf(matchedText);
    const start = segment.start + match.index + Math.max(localOffset, 0);
    const end = start + matchedText.length;
    const range = trimRange(currentText, start, end);
    addSpan(spans, { start: range.start, end: range.end, revealLayer, role, subtype, tooltip });
  }
}
function detectModifierSpans(segment, spans) {
  addRegexSpan(spans, segment, /(?:^|[,;])\s*(from\b[\s\S]+?\bto\b[^,.!?;]*)/gi, "range", 4, "from-a-to-b-range", "Quan hệ phạm vi: cấu trúc from A to B. Đây là quan hệ cấu trúc lớn, không phải bổ nghĩa thông thường.", 1);
  addRegexSpan(spans, segment, /\bfrom\b[\s\S]+?(?=\s+\b(?:began|begin|begins|started|starts|may|can|could|should|must|will|would|is|are|was|were|has|have|had|suggested|said|announced|reported)\b)/gi, "modifier", 2, "source-modifier", "Cụm bổ nghĩa nguồn gốc/xuất xứ cho thành phần đứng trước.");
  addRegexSpan(spans, segment, /,\s*(in\s+[^,]+?terms)\s*,/gi, "modifier", 2, "manner-modifier", "Cụm bổ nghĩa cách thức hoặc mức độ cho hành động chính.", 1);
  addRegexSpan(spans, segment, /\bof\s+[^,.!?;]+?(?=,|;|\.|\?|!|$)/gi, "modifier", 2, "post-nominal-modifier", "Cụm bổ nghĩa hậu vị cho danh từ đứng trước. Nếu bên trong có cụm khác như in the new era, phần đó được giải thích ở Layer 3 như thao tác zoom.");
  addRegexSpan(spans, segment, /\b(?:under|within|during|after|before|with|without|according\s+to|for|by)\b[^,.!?;]*/gi, "modifier", 2, "prepositional-modifier", "Cụm giới từ bổ nghĩa cho câu hoặc thành phần đứng trước.");
}
function detectHighlightSpans(text) {
  currentText = text;
  const spans = [];
  getSentenceSegments(text).forEach((segment) => {
    detectCoreSpans(segment, spans);
    detectModifierSpans(segment, spans);
  });
  return spans.sort((a, b) => a.start - b.start || a.end - b.end);
}
function renderTooltip(span) {
  return `<span class="tooltip"><strong>${escapeHtml(roleLabels[span.role])}</strong><br>${escapeHtml(span.tooltip)}<span class="synonyms"><strong>Subtype:</strong> ${escapeHtml(span.subtype)} · Hiện từ Layer ${span.revealLayer}</span></span>`;
}
function renderHighlightedSentence(text, spans) {
  let cursor = 0;
  let html = "";
  spans.slice().sort((a, b) => a.start - b.start || b.end - a.end).forEach((span) => {
    if (span.start < cursor || span.end > text.length) return;
    html += escapeHtml(text.slice(cursor, span.start));
    html += `<span class="hl ${span.role}" data-min-layer="${span.revealLayer}" data-subtype="${escapeHtml(span.subtype)}">${escapeHtml(text.slice(span.start, span.end))}${renderTooltip(span)}</span>`;
    cursor = span.end;
  });
  html += escapeHtml(text.slice(cursor));
  return html || `<span class="muted">Chưa có nội dung.</span>`;
}
function getActiveSemanticTermEntries(text) {
  const lowerText = text.toLowerCase();
  return semanticTermCatalog.filter((item) => lowerText.includes(item.term.toLowerCase()));
}
function renderSpanList(spans, emptyText) {
  if (!spans.length) return `<p class="muted">${emptyText}</p>`;
  return `<ul>${spans.map((span) => `<li><strong>${escapeHtml(currentText.slice(span.start, span.end))}</strong>: ${escapeHtml(roleLabels[span.role])} · <small>${escapeHtml(span.subtype)}</small></li>`).join("")}</ul>`;
}
function splitModifierForZoom(modifier) {
  const trimmed = modifier.trim();
  const lower = trimmed.toLowerCase();
  if (lower.startsWith("of ") && /\bin\s+the\s+new\s+era\b/i.test(trimmed)) {
    const match = /^(of\s+)([\s\S]+?)(\s+in\s+the\s+new\s+era)$/i.exec(trimmed);
    if (match) return [match[1].trim(), match[2].trim(), match[3].trim()];
  }
  if (lower.startsWith("of ")) return ["of", trimmed.slice(3).trim()];
  if (lower.startsWith("in ")) return ["in", trimmed.slice(3).trim()];
  if (lower.startsWith("from ")) return ["from", trimmed.slice(5).trim()];
  const prep = /^(under|within|during|after|before|with|without|according\s+to|for|by)\s+([\s\S]+)$/i.exec(trimmed);
  return prep ? [prep[1], prep[2]] : [trimmed];
}
function renderZoomRows() {
  const zoomTargets = currentSpans.filter((span) => span.role === "modifier");
  if (!zoomTargets.length) return `<p class="muted">Chưa có cụm bổ nghĩa/cụm lớn để zoom bằng rule hiện tại.</p>`;
  return `<table><thead><tr><th>Cụm gốc</th><th>Vai trò giữ nguyên</th><th>Zoom cấu trúc bên trong</th></tr></thead><tbody>${zoomTargets.map((span) => {
    const text = currentText.slice(span.start, span.end);
    const parts = splitModifierForZoom(text);
    return `<tr><td><strong>${escapeHtml(text)}</strong></td><td>Modifier / Bổ nghĩa</td><td>${parts.map((part) => `<span class="node">${escapeHtml(part)}</span>`).join('<span class="arrow">→</span>')}</td></tr>`;
  }).join("")}</tbody></table>`;
}
function renderLayer1Core() {
  const coreSpans = currentSpans.filter((span) => ["subject", "verb", "object"].includes(span.role));
  return `<h2>Layer 1: Câu lõi</h2><div class="box">${renderSpanList(coreSpans, "Chưa phát hiện đủ chủ ngữ/động từ/tân ngữ bằng rule hiện tại.")}</div>`;
}
function renderLayer2Modifiers() {
  const modifierSpans = currentSpans.filter((span) => span.role === "modifier");
  return `<h2>Layer 2: Nhận diện cụm bổ nghĩa</h2><div class="box"><p>Layer này tìm các cụm bổ nghĩa quanh câu lõi. Những cụm này vẫn giữ vai trò <strong>Modifier / Bổ nghĩa</strong>, kể cả khi sang Layer 3 để zoom.</p>${renderSpanList(modifierSpans, "Chưa phát hiện cụm bổ nghĩa rõ ràng.")}</div>`;
}
function renderLayer3PhraseDecomposition() {
  return `<h2>Layer 3: Zoom cấu trúc bên trong cụm</h2><div class="box"><p>Layer 3 không phải một loại highlight ngữ pháp mới. Nó chỉ zoom vào bên trong các cụm đã nhận diện, đặc biệt là cụm bổ nghĩa hậu vị như <strong>of ... in ...</strong>.</p>${renderZoomRows()}</div>`;
}
function renderStructuralRelationLayer() {
  const relationSpans = currentSpans.filter((span) => span.role === "range" || span.revealLayer === 4);
  return `<h2>Layer 4: Quan hệ cấu trúc</h2><div class="box"><p>Layer này tìm các quan hệ như <strong>from A to B</strong>, tương phản, nguyên nhân-kết quả, mục đích hoặc điều kiện.</p>${renderSpanList(relationSpans, "Chưa phát hiện quan hệ cấu trúc rõ bằng rule hiện tại.")}</div>`;
}
function renderSemanticLayer() {
  const terms = getActiveSemanticTermEntries(currentText);
  if (!terms.length) return `<h2>Layer 5: Thuật ngữ / khái niệm</h2><p class="muted">Chưa phát hiện thuật ngữ trong dictionary hiện tại. Có thể mở rộng catalog trong <code>semanticTermCatalog</code>.</p>`;
  return `<h2>Layer 5: Thuật ngữ / khái niệm</h2><table><thead><tr><th>Term</th><th>Loại</th><th>Nội hàm</th><th>Gần nghĩa</th></tr></thead><tbody>${terms.map((term) => `<tr><td><strong>${escapeHtml(term.term)}</strong></td><td>${escapeHtml(term.label)}</td><td>${escapeHtml(term.note)}</td><td>${escapeHtml(term.synonyms)}</td></tr>`).join("")}</tbody></table>`;
}
function renderReconstructionLayer() {
  const coreSpans = currentSpans.filter((span) => ["subject", "verb", "object"].includes(span.role));
  const coreText = coreSpans.map((span) => currentText.slice(span.start, span.end)).join(" / ");
  return `<h2>Layer 6: Hoàn chỉnh</h2><div class="final-meaning">${escapeHtml(clampText(currentText))}</div><p>Nói theo pipeline đọc:</p><div class="box"><strong>Câu lõi:</strong> ${coreText ? escapeHtml(coreText) : "Chưa đủ dữ liệu để rút câu lõi."}</div>`;
}
const layerContent = {
  1: renderLayer1Core,
  2: renderLayer2Modifiers,
  3: renderLayer3PhraseDecomposition,
  4: renderStructuralRelationLayer,
  5: renderSemanticLayer,
  6: renderReconstructionLayer
};
function toLayerNumber(value) {
  const parsed = Number(value);
  return parsed >= 1 && parsed <= 6 ? parsed : 1;
}
function setActiveButton(layer) {
  document.querySelectorAll("[data-layer]").forEach((button) => {
    button.classList.toggle("active", toLayerNumber(button.dataset.layer || null) === layer);
  });
}
function updateHighlightVisibility(layer) {
  document.querySelectorAll(".hl").forEach((item) => {
    const minLayer = Number(item.dataset.minLayer || "1");
    item.classList.toggle("hidden-layer", minLayer > layer);
  });
  applySemanticTermHighlight(getSavedSemanticTermVisibility());
}
function renderLayerExplanation(layer) {
  const target = document.getElementById("layerExplanation");
  if (!target) return;
  const content = layerContent[layer];
  target.innerHTML = typeof content === "function" ? content() : content;
}
function setLayer(layer) {
  currentLayer = layer;
  setActiveButton(layer);
  updateHighlightVisibility(layer);
  renderLayerExplanation(layer);
}
function injectSemanticTermStyles() {
  if (document.getElementById("semanticTermStyles")) return;
  const style = document.createElement("style");
  style.id = "semanticTermStyles";
  style.textContent = `
    ::highlight(semantic-terms) { background-color: #ecfeff; text-decoration-line: underline; text-decoration-style: dotted; text-decoration-thickness: 3px; text-decoration-color: #0891b2; text-underline-offset: 3px; }
    .legend-semantic-term { background: #ecfeff; border-bottom: 3px dotted #0891b2; }
    body:not(.semantic-terms-visible) .legend-semantic-term-chip { display: none; }
    .semantic-term-toggle { display: inline-flex; align-items: center; gap: 6px; padding: 9px 12px; border: 1px solid #d1d5db; border-radius: 999px; background: #fff; font-size: 14px; cursor: pointer; }
    .semantic-term-toggle input { margin: 0; }
  `;
  document.head.appendChild(style);
}
function getCssHighlightRegistry() {
  return CSS.highlights || null;
}
function getSavedSemanticTermVisibility() {
  return localStorage.getItem(semanticTermVisibilityStorageKey) === "true";
}
function collectTermRanges(root, terms) {
  const ranges = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!node.textContent || !node.textContent.trim()) return NodeFilter.FILTER_REJECT;
      if (parent && parent.closest(".tooltip")) return NodeFilter.FILTER_REJECT;
      if (parent && parent.closest(".hidden-layer")) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  let currentNode = walker.nextNode();
  while (currentNode) {
    const textNode = currentNode;
    const lowerText = (textNode.textContent || "").toLowerCase();
    terms.forEach((term) => {
      const lowerTerm = term.toLowerCase();
      let index = lowerText.indexOf(lowerTerm);
      while (index !== -1) {
        const range = document.createRange();
        range.setStart(textNode, index);
        range.setEnd(textNode, index + term.length);
        ranges.push(range);
        index = lowerText.indexOf(lowerTerm, index + term.length);
      }
    });
    currentNode = walker.nextNode();
  }
  return ranges;
}
function applySemanticTermHighlight(isVisible) {
  document.body.classList.toggle("semantic-terms-visible", isVisible);
  const registry = getCssHighlightRegistry();
  if (!registry) return;
  registry.delete(semanticTermHighlightName);
  if (!isVisible) return;
  const sentence = document.getElementById("sentence");
  if (!sentence || !window.Highlight) return;
  const terms = getActiveSemanticTermEntries(currentText).map((item) => item.term);
  const ranges = collectTermRanges(sentence, terms);
  registry.set(semanticTermHighlightName, new Highlight(...ranges));
}
function setSemanticTermVisibility(isVisible) {
  localStorage.setItem(semanticTermVisibilityStorageKey, String(isVisible));
  applySemanticTermHighlight(isVisible);
}
function addSemanticTermControls() {
  injectSemanticTermStyles();
  const controls = document.querySelector(".controls");
  if (controls && !document.getElementById("semanticTermToggle")) {
    const label = document.createElement("label");
    label.className = "semantic-term-toggle";
    label.innerHTML = `<input id="semanticTermToggle" type="checkbox" /> Hiện thuật ngữ / khái niệm`;
    const input = label.querySelector("input");
    input.checked = getSavedSemanticTermVisibility();
    input.addEventListener("change", () => setSemanticTermVisibility(input.checked));
    controls.appendChild(label);
  }
  const legend = document.querySelector(".legend");
  if (legend && !legend.querySelector(".legend-semantic-term")) {
    const chip = document.createElement("span");
    chip.className = "legend-chip legend-semantic-term-chip";
    chip.innerHTML = `<span class="legend-swatch legend-semantic-term"></span>Thuật ngữ / khái niệm`;
    legend.appendChild(chip);
  }
}
function renderRoleTable() {
  const target = document.getElementById("roleTableBody");
  if (!target) return;
  if (!currentSpans.length) {
    target.innerHTML = `<tr><td colspan="4" class="muted">Chưa phát hiện thành phần nào bằng rule hiện tại.</td></tr>`;
    return;
  }
  target.innerHTML = currentSpans.map((span) => `<tr><td>${escapeHtml(currentText.slice(span.start, span.end))}</td><td>${escapeHtml(roleLabels[span.role])}</td><td>${escapeHtml(span.subtype)} · hiện từ Layer ${span.revealLayer}</td><td>${escapeHtml(span.tooltip)}</td></tr>`).join("");
}
function renderCurrentText(text) {
  currentText = text.trim() || defaultSentence;
  currentSpans = detectHighlightSpans(currentText);
  const sentence = document.getElementById("sentence");
  if (sentence) sentence.innerHTML = renderHighlightedSentence(currentText, currentSpans);
  renderRoleTable();
  setLayer(currentLayer);
  applySemanticTermHighlight(getSavedSemanticTermVisibility());
}
function bindCustomInput() {
  const input = document.getElementById("customSentenceInput");
  const analyzeButton = document.getElementById("analyzeCustomSentenceButton");
  const resetButton = document.getElementById("resetExampleButton");
  if (!input) return;
  input.value = localStorage.getItem(customInputStorageKey) || defaultSentence;
  analyzeButton && analyzeButton.addEventListener("click", () => {
    localStorage.setItem(customInputStorageKey, input.value);
    renderCurrentText(input.value);
  });
  resetButton && resetButton.addEventListener("click", () => {
    input.value = defaultSentence;
    localStorage.setItem(customInputStorageKey, defaultSentence);
    renderCurrentText(defaultSentence);
  });
  input.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      localStorage.setItem(customInputStorageKey, input.value);
      renderCurrentText(input.value);
    }
  });
  renderCurrentText(input.value);
}
window.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-layer]").forEach((button) => {
    button.addEventListener("click", () => setLayer(toLayerNumber(button.dataset.layer || null)));
  });
  addSemanticTermControls();
  bindCustomInput();
});
