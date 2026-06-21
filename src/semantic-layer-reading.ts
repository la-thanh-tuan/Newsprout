type LayerNumber = 1 | 2 | 3 | 4 | 5 | 6;

type LayerContentMap = Record<LayerNumber, string>;

const layerContent: LayerContentMap = {
  1: `<h2>Layer 1: Detect câu lõi</h2><div class="box"><h3>Câu lõi</h3><p><strong>The documents / began to define / the core components.</strong></p><p>Nghĩa nhanh: <strong>Các văn kiện bắt đầu xác định các thành tố cốt lõi.</strong></p></div><p>Ở tầng này, mục tiêu là bỏ qua toàn bộ phần phụ để thấy “xương sống” của câu.</p>`,
  2: `<h2>Layer 2: Gắn cụm bổ nghĩa</h2><div class="explanation-grid"><div class="box"><h3>Cụm bổ nghĩa</h3><ul><li><strong>from the 14th National Party Congress</strong>: bổ nghĩa cho “documents”.</li><li><strong>in relatively comprehensive terms</strong>: bổ nghĩa cho cách “define”.</li><li><strong>of Vietnam’s development model</strong>: bổ nghĩa cho “core components”.</li><li><strong>in the new era</strong>: bổ nghĩa bối cảnh.</li></ul></div><div class="box"><h3>Ý nghĩa</h3><p>Câu không chỉ nói “văn kiện xác định thành tố”, mà nói rõ văn kiện nào, xác định theo mức độ nào, thành tố thuộc mô hình nào, và trong giai đoạn nào.</p></div></div>`,
  3: `<h2>Layer 3: Phân rã cụm danh từ dài</h2><div class="box"><h3>Cụm cần phân tích</h3><p><strong>the core components of Vietnam’s development model in the new era</strong></p></div><div class="logic-flow"><span class="node">components</span><span class="arrow">→</span><span class="node">core components</span><span class="arrow">→</span><span class="node">of Vietnam’s development model</span><span class="arrow">→</span><span class="node">in the new era</span></div><p>Nghĩa tăng dần: thành tố → thành tố cốt lõi → thành tố cốt lõi của mô hình phát triển Việt Nam → trong kỷ nguyên mới.</p>`,
  4: `<h2>Layer 4: Xây quan hệ logic</h2><div class="logic-flow"><span class="node">Documents</span><span class="arrow">→</span><span class="node">Define</span><span class="arrow">→</span><span class="node">Core components</span><span class="arrow">→</span><span class="node">Development model</span><span class="arrow">→</span><span class="node">From context to breakthroughs</span></div><p>Logic của câu là: <strong>nguồn định hướng → hành động khái niệm hóa → đối tượng được định hình → phạm vi bao quát.</strong></p>`,
  5: `<h2>Layer 5: Đi sâu nội hàm thuật ngữ</h2><table><thead><tr><th>Thuật ngữ</th><th>Nội hàm</th><th>Cách dùng gần nghĩa</th></tr></thead><tbody><tr><td><strong>documents</strong></td><td>Trong ngữ cảnh chính trị, nên hiểu là “văn kiện”, tức tài liệu định hướng chính thức.</td><td>official papers; congress documents; policy documents</td></tr><tr><td><strong>began to define</strong></td><td>Bước đầu xác định/định hình một khái niệm, khung hoặc mô hình.</td><td>started to outline; began to shape; set out to identify</td></tr><tr><td><strong>development model</strong></td><td>Mô hình phát triển: khung tổng thể về mục tiêu, phương thức, cơ chế, nguồn lực và chiến lược phát triển.</td><td>growth model; development framework; model for development</td></tr><tr><td><strong>perspectives</strong></td><td>Quan điểm chỉ đạo, cách nhìn, nguyên tắc tư duy phát triển.</td><td>viewpoints; guiding views; policy perspectives</td></tr><tr><td><strong>operational mechanisms</strong></td><td>Cơ chế vận hành: cách mô hình được triển khai thông qua thể chế, chính sách và tổ chức thực thi.</td><td>operating mechanisms; implementation mechanisms; working mechanisms</td></tr><tr><td><strong>strategic breakthroughs</strong></td><td>Đột phá chiến lược: các điểm then chốt có khả năng tạo chuyển biến lớn.</td><td>strategic advances; strategic levers; breakthrough priorities</td></tr></tbody></table>`,
  6: `<h2>Layer 6: Tái tạo nghĩa hoàn chỉnh</h2><div class="final-meaning">Các văn kiện Đại hội Đảng toàn quốc lần thứ 14 đã bước đầu định hình tương đối toàn diện các thành tố cốt lõi của mô hình phát triển Việt Nam trong kỷ nguyên mới, bao gồm từ bối cảnh phát triển, mục tiêu, quan điểm và cơ chế vận hành đến các nhiệm vụ trọng tâm và đột phá chiến lược.</div><p>Nói ngắn gọn:</p><div class="box"><strong>Văn kiện Đại hội XIV đặt nền móng cho việc định hình mô hình phát triển mới của Việt Nam, từ tầng tư duy định hướng đến tầng hành động chiến lược.</strong></div>`
};

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
}

function renderLayerExplanation(layer: LayerNumber): void {
  const target = document.getElementById("layerExplanation");
  if (!target) return;

  target.innerHTML = layerContent[layer];
}

function setLayer(layer: LayerNumber): void {
  setActiveButton(layer);
  updateHighlightVisibility(layer);
  renderLayerExplanation(layer);
}

function bindLayerButtons(): void {
  document.querySelectorAll<HTMLButtonElement>("[data-layer]").forEach((button) => {
    button.addEventListener("click", () => {
      setLayer(toLayerNumber(button.dataset.layer ?? null));
    });
  });
}

window.addEventListener("DOMContentLoaded", () => {
  bindLayerButtons();
  setLayer(1);
});