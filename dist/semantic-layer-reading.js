"use strict";
const layerContent = {
    1: `<h2>Layer 1: Detect câu lõi</h2><div class="box"><h3>Câu lõi</h3><p><strong>The documents / began to define / the core components.</strong></p><p>Nghĩa nhanh: <strong>Các văn kiện bắt đầu xác định các thành tố cốt lõi.</strong></p></div><p>Ở tầng này, mục tiêu là bỏ qua toàn bộ phần phụ để thấy “xương sống” của câu.</p>`,
    2: `<h2>Layer 2: Gắn cụm bổ nghĩa</h2><div class="explanation-grid"><div class="box"><h3>Cụm bổ nghĩa</h3><ul><li><strong>from the 14th National Party Congress</strong>: bổ nghĩa cho “documents”.</li><li><strong>in relatively comprehensive terms</strong>: bổ nghĩa cho cách “define”.</li><li><strong>of Vietnam’s development model</strong>: bổ nghĩa cho “core components”.</li><li><strong>in the new era</strong>: bổ nghĩa bối cảnh.</li></ul></div><div class="box"><h3>Ý nghĩa</h3><p>Câu không chỉ nói “văn kiện xác định thành tố”, mà nói rõ văn kiện nào, xác định theo mức độ nào, thành tố thuộc mô hình nào, và trong giai đoạn nào.</p></div></div>`,
    3: `<h2>Layer 3: Phân rã cụm danh từ dài</h2><div class="box"><h3>Cụm cần phân tích</h3><p><strong>the core components of Vietnam’s development model in the new era</strong></p></div><div class="logic-flow"><span class="node">components</span><span class="arrow">→</span><span class="node">core components</span><span class="arrow">→</span><span class="node">of Vietnam’s development model</span><span class="arrow">→</span><span class="node">in the new era</span></div><p>Nghĩa tăng dần: thành tố → thành tố cốt lõi → thành tố cốt lõi của mô hình phát triển Việt Nam → trong kỷ nguyên mới.</p>`,
    4: `<h2>Layer 4: Xây quan hệ logic</h2><div class="logic-flow"><span class="node">Documents</span><span class="arrow">→</span><span class="node">Define</span><span class="arrow">→</span><span class="node">Core components</span><span class="arrow">→</span><span class="node">Development model</span><span class="arrow">→</span><span class="node">From context to breakthroughs</span></div><p>Logic của câu là: <strong>nguồn định hướng → hành động khái niệm hóa → đối tượng được định hình → phạm vi bao quát.</strong></p>`,
    5: `<h2>Layer 5: Đi sâu nội hàm thuật ngữ</h2><table><thead><tr><th>Thuật ngữ</th><th>Nội hàm</th></tr></thead><tbody><tr><td><strong>documents</strong></td><td>Trong ngữ cảnh chính trị, nên hiểu là “văn kiện”, tức tài liệu định hướng chính thức.</td></tr><tr><td><strong>development model</strong></td><td>Mô hình phát triển: khung tổng thể về mục tiêu, phương thức, cơ chế, nguồn lực và chiến lược phát triển.</td></tr><tr><td><strong>perspectives</strong></td><td>Quan điểm chỉ đạo, cách nhìn, nguyên tắc tư duy phát triển.</td></tr><tr><td><strong>operational mechanisms</strong></td><td>Cơ chế vận hành: cách mô hình được triển khai thông qua thể chế, chính sách và tổ chức thực thi.</td></tr><tr><td><strong>strategic breakthroughs</strong></td><td>Đột phá chiến lược: các điểm then chốt có khả năng tạo chuyển biến lớn.</td></tr></tbody></table>`,
    6: `<h2>Layer 6: Tái tạo nghĩa hoàn chỉnh</h2><div class="final-meaning">Các văn kiện Đại hội Đảng toàn quốc lần thứ 14 đã bước đầu định hình tương đối toàn diện các thành tố cốt lõi của mô hình phát triển Việt Nam trong kỷ nguyên mới, bao gồm từ bối cảnh phát triển, mục tiêu, quan điểm và cơ chế vận hành đến các nhiệm vụ trọng tâm và đột phá chiến lược.</div><p>Nói ngắn gọn:</p><div class="box"><strong>Văn kiện Đại hội XIV đặt nền móng cho việc định hình mô hình phát triển mới của Việt Nam, từ tầng tư duy định hướng đến tầng hành động chiến lược.</strong></div>`
};
const synonymReference = {
    1: [
        { source: "documents", alternatives: ["texts", "papers", "official documents", "policy documents"], note: "Văn cảnh chính trị nên ưu tiên “documents / policy documents”, không dùng “papers” nếu cần trang trọng." },
        { source: "began to define", alternatives: ["started to define", "began to outline", "started shaping", "began to clarify"], note: "“outline” nhẹ hơn “define”; “shape” thiên về định hình quá trình." },
        { source: "core components", alternatives: ["key components", "essential elements", "fundamental parts", "central elements"], note: "“core” nhấn mạnh tính cốt lõi; “key” rộng và phổ biến hơn." }
    ],
    2: [
        { source: "from the 14th National Party Congress", alternatives: ["issued at the 14th National Party Congress", "adopted by the 14th National Party Congress", "associated with the 14th National Party Congress"], note: "“issued/adopted” cụ thể hơn nếu văn kiện được ban hành/thông qua tại sự kiện." },
        { source: "in relatively comprehensive terms", alternatives: ["in a fairly comprehensive way", "with a relatively broad scope", "in a rather comprehensive manner"], note: "“relatively” làm sắc thái thận trọng; không tương đương hoàn toàn với “fully”." },
        { source: "in the new era", alternatives: ["in a new era", "in the new development period", "in the new phase of development"], note: "“the new era” trang trọng và có sắc thái chính trị hơn “a new era”." }
    ],
    3: [
        { source: "Vietnam’s development model", alternatives: ["Vietnamese development model", "Vietnam’s model of development", "Vietnam’s development framework"], note: "“model” thiên về mô hình; “framework” thiên về khung cấu trúc/định hướng." },
        { source: "development model", alternatives: ["model of development", "development framework", "growth model"], note: "“growth model” hẹp hơn vì nghiêng về tăng trưởng kinh tế." },
        { source: "components", alternatives: ["elements", "parts", "building blocks", "constituents"], note: "“building blocks” dễ hiểu hơn; “constituents” học thuật hơn." }
    ],
    4: [
        { source: "from... to...", alternatives: ["ranging from... to...", "covering... as well as...", "spanning... through..."], note: "Dùng để biểu thị phạm vi bao quát từ điểm đầu đến điểm cuối." },
        { source: "define", alternatives: ["outline", "identify", "clarify", "formulate"], note: "“formulate” trang trọng hơn và hàm ý xây dựng thành hệ thống." },
        { source: "breakthroughs", alternatives: ["major breakthroughs", "strategic advances", "turning points", "transformative priorities"], note: "Trong văn bản chính sách, “strategic breakthroughs” là cụm ổn định hơn." }
    ],
    5: [
        { source: "development context", alternatives: ["development setting", "development landscape", "socio-economic context"], note: "“context” trung tính; “landscape” hiện đại hơn nhưng ít chính thống hơn." },
        { source: "objectives", alternatives: ["goals", "targets", "aims"], note: "“objectives” trang trọng; “targets” thường cụ thể và đo lường được hơn." },
        { source: "perspectives", alternatives: ["viewpoints", "standpoints", "guiding views", "policy perspectives"], note: "Trong văn kiện, “guiding views” thường gần nghĩa “quan điểm chỉ đạo”." },
        { source: "operational mechanisms", alternatives: ["operating mechanisms", "implementation mechanisms", "institutional mechanisms"], note: "“implementation mechanisms” nhấn mạnh triển khai; “institutional mechanisms” nhấn mạnh thể chế." },
        { source: "key tasks", alternatives: ["major tasks", "priority tasks", "central tasks"], note: "“priority tasks” nhấn mạnh thứ tự ưu tiên." }
    ],
    6: [
        { source: "began to define", alternatives: ["began to shape", "laid the groundwork for", "took initial steps to clarify"], note: "Bản dịch mượt có thể dùng “bước đầu định hình” hoặc “đặt nền móng cho”." },
        { source: "relatively comprehensive", alternatives: ["fairly comprehensive", "rather comprehensive", "broadly comprehensive"], note: "Giữ sắc thái vừa phải, tránh dịch thành “hoàn toàn toàn diện”." },
        { source: "strategic breakthroughs", alternatives: ["đột phá chiến lược", "khâu đột phá chiến lược", "ưu tiên đột phá"], note: "Tiếng Việt chính sách thường dùng “đột phá chiến lược”." }
    ]
};
function toLayerNumber(value) {
    const parsed = Number(value);
    return parsed >= 1 && parsed <= 6 ? parsed : 1;
}
function renderSynonymReference(layer) {
    const rows = synonymReference[layer]
        .map((item) => `
      <tr>
        <td><strong>${item.source}</strong></td>
        <td>${item.alternatives.join(" / ")}</td>
        <td>${item.note}</td>
      </tr>
    `)
        .join("");
    return `
    <h3>Cách dùng tương đương</h3>
    <table>
      <thead><tr><th>Cụm gốc</th><th>Cách dùng gần nghĩa</th><th>Ghi chú sắc thái</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
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
function renderLayerExplanation(layer) {
    const target = document.getElementById("layerExplanation");
    if (!target)
        return;
    target.innerHTML = `${layerContent[layer]}${renderSynonymReference(layer)}`;
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
window.addEventListener("DOMContentLoaded", () => {
    bindLayerButtons();
    setLayer(1);
});
