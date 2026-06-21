type LayerNumber = 1 | 2 | 3 | 4 | 5 | 6;
type HighlightRole = "subject" | "verb" | "object" | "modifier" | "range";
type LayerContent = string | (() => string);
type LayerContentMap = Record<LayerNumber, LayerContent>;

type HighlightSpan = {
  start: number;
  end: number;
  layer: LayerNumber;
  role: HighlightRole;
  subtype: string;
  tooltip: string;
};

type SentenceSegment = {
  text: string;
  start: number;
  end: number;
};

type SemanticTermEntry = {
  term: string;
  label: string;
  note: string;
  synonyms: string;
};

type CssHighlightRegistry = {
  set(name: string, highlight: unknown): void;
  delete(name: string): boolean;
};

type HighlightConstructor = new (...ranges: Range[]) => unknown;

const defaultSentence = "The documents from the 14th National Party Congress began to define, in relatively comprehensive terms, the core components of Vietnam’s development model in the new era, from the development context, objectives, perspectives, and operational mechanisms to key tasks and strategic breakthroughs.";
const customInputStorageKey = "semanticLayer.customInput";
const semanticTermVisibilityStorageKey = "semanticLayer.showSemanticTerms";
const semanticTermHighlightName = "semantic-terms";

const semanticTermCatalog: SemanticTermEntry[] = [
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

let currentLayer: LayerNumber = 1;
let currentText = defaultSentence;
let currentSpans: HighlightSpan[] = [];

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function clampText(value: string, maxLength = 180): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized.length > maxLength ? `${normalized.slice(0, maxLength)}…` : normalized;
}

function getRoleLabel(role: HighlightRole): string {
  const labels: Record<HighlightRole, string> = {
    subject: "Subject / Chủ ngữ",
    verb: "Main verb / Động từ chính",
    object: "Object / Tân ngữ",
    modifier: "Modifier / Bổ nghĩa",
    range: "Structural relation / Quan hệ cấu trúc"
  };
  return labels[role];
}

function getRoleClass(role: HighlightRole): string {
  return role;
}

function getSentenceSegments(text: string): SentenceSegment[] {
  const segments: SentenceSegment[] = [];
  const regex = /[^.!?]+[.!?]?/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const raw = match[0];
    const localStart = raw.search(/\S/);
    if (localStart === -1) continue;

    const trimmed = raw.trim();
    segments.push({
      text: trimmed,
      start: match.index + localStart,
      end: match.index + localStart + trimmed.length
    });
  }

  return segments.length > 0 ? segments : [{ text, start: 0, end: text.length }];
}

function addSpan(spans: HighlightSpan[], candidate: HighlightSpan): void {
  if (candidate.end <= candidate.start) return;
  if (!currentText.slice(candidate.start, candidate.end).trim()) return;

  const overlaps = spans.some((span) => candidate.start < span.end && candidate.end > span.start);
  if (!overlaps) spans.push(candidate);
}

function findMainVerb(segment: string): { index: number; text: string } | null {
  const verbPatterns = [
    /\bbegan\s+to\s+define\b/i,
    /\bstarted\s+to\s+(?:define|outline|build|shape)\b/i,
    /\bshould\s+not\s+only\s+reflect\b/i,
    /\bshould\s+work\s+together\s+to\s+build\b/i,
    /\bmay\s+qualify\b/i,
    /\bcan\s+qualify\b/i,
    /\bwill\s+(?:define|include|support|build|guide|reflect)\b/i,
    /\bshould\s+(?:define|include|support|build|guide|reflect|operate)\b/i,
    /\bsuggested\b/i,
    /\b(?:began|started|defined|defines|define|includes|include|operate|operates|build|builds|reflect|reflects|guide|guides|is|are|was|were|has|have|had)\b/i
  ];

  let best: { index: number; text: string } | null = null;
  verbPatterns.forEach((pattern) => {
    const match = pattern.exec(segment);
    if (!match) return;
    if (!best || match.index < best.index) best = { index: match.index, text: match[0] };
  });

  return best;
}

function trimRange(text: string, absoluteStart: number, absoluteEnd: number): { start: number; end: number } {
  let start = absoluteStart;
  let end = absoluteEnd;
  while (start < end && /\s/.test(text[start] ?? "")) start += 1;
  while (end > start && /\s/.test(text[end - 1] ?? "")) end -= 1;
  return { start, end };
}

function cutSubjectBeforeModifier(subjectText: string): number {
  const modifierMatch = /\s(?:from|under|within|during|after|before|with|without|according\s+to|in|of|for|by)\s/i.exec(subjectText);
  return modifierMatch ? modifierMatch.index : subjectText.length;
}

function skipLeadingDelimitedModifiers(segment: string, start: number): number {
  let cursor = start;
  while (/^[\s,]+/.test(segment.slice(cursor))) {
    cursor += (segment.slice(cursor).match(/^[\s,]+/)?.[0].length ?? 0);
    const possibleModifier = /^(in\s+[^,]+?terms|with\s+[^,]+|under\s+[^,]+)/i.exec(segment.slice(cursor));
    if (!possibleModifier) break;
    cursor += possibleModifier[0].length;
    if (segment[cursor] === ",") cursor += 1;
  }
  while (/\s/.test(segment[cursor] ?? "")) cursor += 1;
  return cursor;
}

function detectCoreSpans(segment: SentenceSegment, spans: HighlightSpan[]): void {
  const verb = findMainVerb(segment.text);
  if (!verb) return;

  const verbStart = segment.start + verb.index;
  const verbEnd = verbStart + verb.text.length;
  const rawSubject = segment.text.slice(0, verb.index);
  const subjectCut = cutSubjectBeforeModifier(rawSubject);
  const subjectRange = trimRange(currentText, segment.start, segment.start + subjectCut);

  addSpan(spans, {
    start: subjectRange.start,
    end: subjectRange.end,
    layer: 1,
    role: "subject",
    subtype: "main-subject",
    tooltip: "Chủ ngữ chính được rule-based detector xác định gần đúng."
  });

  addSpan(spans, {
    start: verbStart,
    end: verbEnd,
    layer: 1,
    role: "verb",
    subtype: "main-verb",
    tooltip: "Động từ/cụm động từ chính được rule-based detector xác định gần đúng."
  });

  const objectLocalStart = skipLeadingDelimitedModifiers(segment.text, verb.index + verb.text.length);
  if (objectLocalStart >= segment.text.length) return;

  const objectTail = segment.text.slice(objectLocalStart);
  const boundary = /\s(?:of|in|from|under|within|during|after|before|with|without|according\s+to|for|by)\s|[.;!?]/i.exec(objectTail);
  const objectLocalEnd = objectLocalStart + (boundary ? boundary.index : objectTail.length);
  const objectRange = trimRange(currentText, segment.start + objectLocalStart, segment.start + objectLocalEnd);

  addSpan(spans, {
    start: objectRange.start,
    end: objectRange.end,
    layer: 1,
    role: "object",
    subtype: "main-object-or-complement",
    tooltip: "Tân ngữ hoặc bổ ngữ chính sau động từ, xác định bằng rule gần đúng."
  });
}

function addRegexSpan(spans: HighlightSpan[], segment: SentenceSegment, regex: RegExp, role: HighlightRole, layer: LayerNumber, subtype: string, tooltip: string, groupIndex = 0): void {
  let match: RegExpExecArray | null;
  const localRegex = new RegExp(regex.source, regex.flags.includes("g") ? regex.flags : `${regex.flags}g`);

  while ((match = localRegex.exec(segment.text)) !== null) {
    const matchedText = match[groupIndex] ?? match[0];
    const localOffset = match[0].indexOf(matchedText);
    const start = segment.start + match.index + Math.max(localOffset, 0);
    const end = start + matchedText.length;
    const range = trimRange(currentText, start, end);

    addSpan(spans, { start: range.start, end: range.end, layer, role, subtype, tooltip });
  }
}

function detectModifierSpans(segment: SentenceSegment, spans: HighlightSpan[]): void {
  addRegexSpan(spans, segment, /(?:^|[,;])\s*(from\b[\s\S]+?\bto\b[^,.!?;]*)/gi, "range", 4, "from-a-to-b-range", "Quan hệ phạm vi: cấu trúc from A to B, thường hiểu là trải từ nhóm ý A đến nhóm ý B.", 1);
  addRegexSpan(spans, segment, /\bfrom\b[\s\S]+?(?=\s+\b(?:began|begin|begins|started|starts|may|can|could|should|must|will|would|is|are|was|were|has|have|had|suggested|said|announced|reported)\b)/gi, "modifier", 2, "source-modifier", "Cụm bổ nghĩa nguồn gốc/xuất xứ cho thành phần đứng trước.");
  addRegexSpan(spans, segment, /,\s*(in\s+[^,]+?terms)\s*,/gi, "modifier", 2, "manner-modifier", "Cụm bổ nghĩa cách thức hoặc mức độ cho hành động chính.", 1);
  addRegexSpan(spans, segment, /\bof\s+[^,.!?;]+?(?=\s+\bin\b|[,.;!?]|$)/gi, "modifier", 3, "of-phrase-modifier", "Cụm of-phrase bổ nghĩa sở thuộc/phạm vi cho danh từ đứng trước.");
  addRegexSpan(spans, segment, /\bin\s+the\s+new\s+era\b/gi, "modifier", 3, "context-modifier", "Cụm bổ nghĩa bối cảnh thời đại.");
  addRegexSpan(spans, segment, /\b(?:under|within|during|after|before|with|without|according\s+to|for|by)\b[^,.!?;]*/gi, "modifier", 2, "prepositional-modifier", "Cụm giới từ bổ nghĩa cho câu hoặc thành phần đứng trước.");
}

function detectHighlightSpans(text: string): HighlightSpan[] {
  currentText = text;
  const spans: HighlightSpan[] = [];
  getSentenceSegments(text).forEach((segment) => {
    detectCoreSpans(segment, spans);
    detectModifierSpans(segment, spans);
  });

  return spans.sort((a, b) => a.start - b.start || a.end - b.end);
}

function renderTooltip(span: HighlightSpan): string {
  return `<span class="tooltip"><strong>${escapeHtml(getRoleLabel(span.role))}</strong><br>${escapeHtml(span.tooltip)}<span class="synonyms"><strong>Subtype:</strong> ${escapeHtml(span.subtype)} · Layer ${span.layer}</span></span>`;
}

function renderHighlightedSentence(text: string, spans: HighlightSpan[]): string {
  const sorted = spans.slice().sort((a, b) => a.start - b.start || b.end - a.end);
  let cursor = 0;
  let html = "";

  sorted.forEach((span) => {
    if (span.start < cursor || span.end > text.length) return;

    html += escapeHtml(text.slice(cursor, span.start));
    html += `<span class="hl ${getRoleClass(span.role)}" data-min-layer="${span.layer}" data-subtype="${escapeHtml(span.subtype)}">${escapeHtml(text.slice(span.start, span.end))}${renderTooltip(span)}</span>`;
    cursor = span.end;
  });

  html += escapeHtml(text.slice(cursor));
  return html || `<span class="muted">Chưa có nội dung.</span>`;
}

function getActiveSemanticTermEntries(text: string): SemanticTermEntry[] {
  const lowerText = text.toLowerCase();
  return semanticTermCatalog.filter((item) => lowerText.includes(item.term.toLowerCase()));
}

function renderFlowNodes(parts: string[]): string {
  return parts.map((part, index) => {
    const node = `<span class="node">${escapeHtml(part)}</span>`;
    return index === 0 ? node : `<span class="arrow">→</span>${node}`;
  }).join("");
}

function renderSpanList(spans: HighlightSpan[], emptyText: string): string {
  if (spans.length === 0) return `<p class="muted">${emptyText}</p>`;

  return `<ul>${spans.map((span) => `<li><strong>${escapeHtml(currentText.slice(span.start, span.end))}</strong>: ${escapeHtml(getRoleLabel(span.role))} · <small>${escapeHtml(span.subtype)}</small></li>`).join("")}</ul>`;
}

function renderDetectedPatternTags(): string {
  const firstSentence = getSentenceSegments(currentText)[0]?.text ?? currentText;
  if (!firstSentence.trim()) return `<span class="muted">Chưa có dữ liệu.</span>`;

  const detected = detectSentenceLayers(firstSentence);
  const allTags = [
    ...renderPatternTags(detected.layer1, getCoreClausePattern),
    ...renderPatternTags(detected.layer2, getModifierPattern),
    ...renderPatternTags(detected.layer3, getPhrasePattern),
    ...renderPatternTags(detected.layer4, getGrammarPattern)
  ];

  return allTags.join("") || `<span class="muted">Chưa phát hiện pattern rõ.</span>`;
}

function renderLayer1Core(): string {
  const coreSpans = currentSpans.filter((span) => span.role === "subject" || span.role === "verb" || span.role === "object");
  return `
    <h2>Layer 1: Câu lõi</h2>
    <div class="explanation-grid">
      <div class="box"><h3>Thành phần lõi phát hiện</h3>${renderSpanList(coreSpans, "Chưa phát hiện đủ chủ ngữ/động từ/tân ngữ bằng rule hiện tại.")}</div>
      <div class="box"><h3>Pattern tổng quan</h3>${renderDetectedPatternTags()}</div>
    </div>
  `;
}

function renderLayer2Modifiers(): string {
  const modifierSpans = currentSpans.filter((span) => span.role === "modifier" && span.layer <= 2);
  return `
    <h2>Layer 2: Thành phần bổ nghĩa</h2>
    <div class="box">
      <p>Layer này gom các cụm bổ nghĩa quanh câu lõi: nguồn gốc, cách thức, điều kiện, bối cảnh, phương tiện...</p>
      ${renderSpanList(modifierSpans, "Chưa phát hiện cụm bổ nghĩa Layer 2 rõ ràng.")}
    </div>
  `;
}

function renderLayer3PhraseDecomposition(): string {
  const phraseSpans = currentSpans.filter((span) => span.layer === 3);
  return `
    <h2>Layer 3: Phân rã cụm</h2>
    <div class="box">
      <p>Layer này đi sâu vào cụm danh từ/cụm giới từ bên trong tân ngữ hoặc cụm lớn.</p>
      ${renderSpanList(phraseSpans, "Chưa phát hiện cụm phân rã Layer 3 bằng rule hiện tại.")}
    </div>
  `;
}

function renderStructuralRelationLayer(): string {
  const relationSpans = currentSpans.filter((span) => span.role === "range" || span.layer === 4);
  return `
    <h2>Layer 4: Quan hệ cấu trúc</h2>
    <div class="box">
      <p>Layer này tìm các quan hệ như <strong>from A to B</strong>, tương phản, nguyên nhân-kết quả, mục đích hoặc điều kiện.</p>
      ${renderSpanList(relationSpans, "Chưa phát hiện quan hệ cấu trúc rõ bằng rule hiện tại.")}
    </div>
  `;
}

function renderSemanticLayer(): string {
  const terms = getActiveSemanticTermEntries(currentText);
  if (terms.length === 0) {
    return `<h2>Layer 5: Thuật ngữ / khái niệm</h2><p class="muted">Chưa phát hiện thuật ngữ trong dictionary hiện tại. Có thể mở rộng catalog trong <code>semanticTermCatalog</code>.</p>`;
  }

  return `<h2>Layer 5: Thuật ngữ / khái niệm</h2><table><thead><tr><th>Term</th><th>Loại</th><th>Nội hàm</th><th>Gần nghĩa</th></tr></thead><tbody>${terms.map((term) => `<tr><td><strong>${escapeHtml(term.term)}</strong></td><td>${escapeHtml(term.label)}</td><td>${escapeHtml(term.note)}</td><td>${escapeHtml(term.synonyms)}</td></tr>`).join("")}</tbody></table>`;
}

function renderReconstructionLayer(): string {
  const coreSpans = currentSpans.filter((span) => span.role === "subject" || span.role === "verb" || span.role === "object");
  const coreText = coreSpans.map((span) => currentText.slice(span.start, span.end)).join(" / ");
  return `
    <h2>Layer 6: Hoàn chỉnh</h2>
    <div class="final-meaning">${escapeHtml(clampText(currentText, 360))}</div>
    <p>Nói theo pipeline đọc:</p>
    <div class="box"><strong>Câu lõi:</strong> ${coreText ? escapeHtml(coreText) : "Chưa đủ dữ liệu để rút câu lõi."}</div>
  `;
}

const layerContent: LayerContentMap = {
  1: renderLayer1Core,
  2: renderLayer2Modifiers,
  3: renderLayer3PhraseDecomposition,
  4: renderStructuralRelationLayer,
  5: renderSemanticLayer,
  6: renderReconstructionLayer
};

function renderPatternTags<T extends string>(types: T[], getPattern: (type: T) => LayerPattern<T>): string[] {
  return types.map((type) => {
    const pattern = getPattern(type);
    return `<span class="tag" title="${escapeHtml(pattern.grammarName)}: ${escapeHtml(pattern.pattern)}">${escapeHtml(pattern.vietnameseName)}</span>`;
  });
}

function toLayerNumber(value: string | null): LayerNumber {
  const parsed = Number(value);
  return parsed >= 1 && parsed <= 6 ? (parsed as LayerNumber) : 1;
}

function setActiveButton(layer: LayerNumber): void {
  document.querySelectorAll<HTMLButtonElement>("[data-layer]").forEach((button) => {
    const buttonLayer = toLayerNumber(button.dataset.layer ?? null);
    button.classList.toggle("active", buttonLayer === layer);
  });
}

function updateHighlightVisibility(layer: LayerNumber): void {
  document.querySelectorAll<HTMLElement>(".hl").forEach((item) => {
    const minLayer = Number(item.dataset.minLayer ?? "1");
    item.classList.toggle("hidden-layer", minLayer > layer);
  });

  applySemanticTermHighlight(getSavedSemanticTermVisibility());
}

function resolveLayerContent(layer: LayerNumber): string {
  const content = layerContent[layer];
  return typeof content === "function" ? content() : content;
}

function renderLayerExplanation(layer: LayerNumber): void {
  const target = document.getElementById("layerExplanation");
  if (!target) return;
  target.innerHTML = resolveLayerContent(layer);
}

function setLayer(layer: LayerNumber): void {
  currentLayer = layer;
  setActiveButton(layer);
  updateHighlightVisibility(layer);
  renderLayerExplanation(layer);
}

function bindLayerButtons(): void {
  document.querySelectorAll<HTMLButtonElement>("[data-layer]").forEach((button) => {
    button.addEventListener("click", () => setLayer(toLayerNumber(button.dataset.layer ?? null)));
  });
}

function injectSemanticTermStyles(): void {
  if (document.getElementById("semanticTermStyles")) return;

  const style = document.createElement("style");
  style.id = "semanticTermStyles";
  style.textContent = `
    ::highlight(semantic-terms) {
      background-color: #ecfeff;
      text-decoration-line: underline;
      text-decoration-style: dotted;
      text-decoration-thickness: 3px;
      text-decoration-color: #0891b2;
      text-underline-offset: 3px;
    }
    .legend-semantic-term { background: #ecfeff; border-bottom: 3px dotted #0891b2; }
    body:not(.semantic-terms-visible) .legend-semantic-term-chip { display: none; }
    .semantic-term-toggle { display: inline-flex; align-items: center; gap: 6px; padding: 9px 12px; border: 1px solid #d1d5db; border-radius: 999px; background: #fff; font-size: 14px; cursor: pointer; }
    .semantic-term-toggle input { margin: 0; }
  `;
  document.head.appendChild(style);
}

function getCssHighlightRegistry(): CssHighlightRegistry | null {
  const cssWithHighlights = CSS as typeof CSS & { highlights?: CssHighlightRegistry };
  return cssWithHighlights.highlights ?? null;
}

function createCssHighlight(ranges: Range[]): unknown | null {
  const windowWithHighlight = window as typeof window & { Highlight?: HighlightConstructor };
  return windowWithHighlight.Highlight ? new windowWithHighlight.Highlight(...ranges) : null;
}

function getSavedSemanticTermVisibility(): boolean {
  return localStorage.getItem(semanticTermVisibilityStorageKey) === "true";
}

function collectTermRanges(root: HTMLElement, terms: string[]): Range[] {
  const ranges: Range[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!node.textContent?.trim()) return NodeFilter.FILTER_REJECT;
      if (parent?.closest(".tooltip")) return NodeFilter.FILTER_REJECT;
      if (parent?.closest(".hidden-layer")) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });

  let currentNode = walker.nextNode();
  while (currentNode) {
    const textNode = currentNode as Text;
    const text = textNode.textContent ?? "";
    const lowerText = text.toLowerCase();

    terms.forEach((term) => {
      const lowerTerm = term.toLowerCase();
      let startIndex = 0;
      let matchIndex = lowerText.indexOf(lowerTerm, startIndex);

      while (matchIndex !== -1) {
        const range = document.createRange();
        range.setStart(textNode, matchIndex);
        range.setEnd(textNode, matchIndex + term.length);
        ranges.push(range);
        startIndex = matchIndex + term.length;
        matchIndex = lowerText.indexOf(lowerTerm, startIndex);
      }
    });

    currentNode = walker.nextNode();
  }

  return ranges;
}

function applySemanticTermHighlight(isVisible: boolean): void {
  document.body.classList.toggle("semantic-terms-visible", isVisible);
  const registry = getCssHighlightRegistry();
  if (!registry) return;

  registry.delete(semanticTermHighlightName);
  if (!isVisible) return;

  const sentence = document.getElementById("sentence");
  if (!sentence) return;

  const terms = getActiveSemanticTermEntries(currentText).map((item) => item.term);
  const ranges = collectTermRanges(sentence, terms);
  const highlight = createCssHighlight(ranges);
  if (highlight) registry.set(semanticTermHighlightName, highlight);
}

function setSemanticTermVisibility(isVisible: boolean): void {
  localStorage.setItem(semanticTermVisibilityStorageKey, String(isVisible));
  applySemanticTermHighlight(isVisible);
}

function addSemanticTermToggle(): void {
  const controls = document.querySelector<HTMLElement>(".controls");
  if (!controls || document.getElementById("semanticTermToggle")) return;

  const label = document.createElement("label");
  label.className = "semantic-term-toggle";
  label.innerHTML = `<input id="semanticTermToggle" type="checkbox" /> Hiện thuật ngữ / khái niệm`;

  const input = label.querySelector<HTMLInputElement>("input");
  if (!input) return;

  input.checked = getSavedSemanticTermVisibility();
  input.addEventListener("change", () => setSemanticTermVisibility(input.checked));
  controls.appendChild(label);
}

function addSemanticTermLegend(): void {
  const legend = document.querySelector<HTMLElement>(".legend");
  if (!legend || legend.querySelector(".legend-semantic-term")) return;

  const chip = document.createElement("span");
  chip.className = "legend-chip legend-semantic-term-chip";
  chip.innerHTML = `<span class="legend-swatch legend-semantic-term"></span>Thuật ngữ / khái niệm`;
  legend.appendChild(chip);
}

function applySemanticTermControls(): void {
  injectSemanticTermStyles();
  addSemanticTermLegend();
  addSemanticTermToggle();
  applySemanticTermHighlight(getSavedSemanticTermVisibility());
}

function renderRoleTable(): void {
  const target = document.getElementById("roleTableBody");
  if (!target) return;

  if (currentSpans.length === 0) {
    target.innerHTML = `<tr><td colspan="4" class="muted">Chưa phát hiện thành phần nào bằng rule hiện tại.</td></tr>`;
    return;
  }

  target.innerHTML = currentSpans.map((span) => `<tr><td>${escapeHtml(currentText.slice(span.start, span.end))}</td><td>${escapeHtml(getRoleLabel(span.role))}</td><td>${escapeHtml(span.subtype)} · Layer ${span.layer}</td><td>${escapeHtml(span.tooltip)}</td></tr>`).join("");
}

function renderCurrentText(text: string): void {
  currentText = text.trim() || defaultSentence;
  currentSpans = detectHighlightSpans(currentText);

  const sentence = document.getElementById("sentence");
  if (sentence) sentence.innerHTML = renderHighlightedSentence(currentText, currentSpans);

  renderRoleTable();
  setLayer(currentLayer);
  applySemanticTermHighlight(getSavedSemanticTermVisibility());
}

function bindCustomInput(): void {
  const input = document.getElementById("customSentenceInput") as HTMLTextAreaElement | null;
  const analyzeButton = document.getElementById("analyzeCustomSentenceButton");
  const resetButton = document.getElementById("resetExampleButton");

  if (!input) return;

  input.value = localStorage.getItem(customInputStorageKey) || defaultSentence;

  analyzeButton?.addEventListener("click", () => {
    localStorage.setItem(customInputStorageKey, input.value);
    renderCurrentText(input.value);
  });

  resetButton?.addEventListener("click", () => {
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
  bindLayerButtons();
  applySemanticTermControls();
  bindCustomInput();
});
