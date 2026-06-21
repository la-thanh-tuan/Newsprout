"use strict";
const grammarPatterns = {
    "prepositional-range": {
        type: "prepositional-range",
        grammarName: "Prepositional phrase of range/scope",
        vietnameseName: "Cụm giới từ chỉ phạm vi",
        pattern: "from A to B / between A and B / across A",
        functionLabel: "Chỉ phạm vi bao quát, biên độ hoặc miền nghĩa",
        signals: ["from...to...", "between...and...", "across", "throughout"],
        example: "from the development context to strategic breakthroughs"
    },
    "relative-clause": {
        type: "relative-clause",
        grammarName: "Relative clause",
        vietnameseName: "Mệnh đề quan hệ",
        pattern: "who / which / that / whose + clause",
        functionLabel: "Bổ sung hoặc xác định thông tin cho danh từ đứng trước",
        signals: ["who", "which", "that", "whose", "where", "when"],
        example: "the policy that was introduced last year"
    },
    "subordinate-clause": {
        type: "subordinate-clause",
        grammarName: "Subordinate clause",
        vietnameseName: "Mệnh đề phụ",
        pattern: "although / because / when / while / if + S + V",
        functionLabel: "Tạo quan hệ phụ thuộc: thời gian, nguyên nhân, nhượng bộ, điều kiện",
        signals: ["although", "because", "when", "while", "if", "since"],
        example: "although the policy was introduced early"
    },
    "coordinate-clause": {
        type: "coordinate-clause",
        grammarName: "Coordinate clause",
        vietnameseName: "Mệnh đề đẳng lập",
        pattern: "S + V, and / but / or / yet + S + V",
        functionLabel: "Nối hai ý ngang hàng về mặt ngữ pháp",
        signals: ["and", "but", "or", "yet", "so"],
        example: "the policy was adopted, and businesses began to adapt"
    },
    "participial-phrase": {
        type: "participial-phrase",
        grammarName: "Participial phrase",
        vietnameseName: "Cụm phân từ",
        pattern: "V-ing / V-ed phrase",
        functionLabel: "Rút gọn mệnh đề để nêu bối cảnh, nguyên nhân, trạng thái hoặc kết quả phụ",
        signals: ["V-ing", "V-ed", "driven by", "based on", "aimed at"],
        example: "driven by technological change"
    },
    "infinitive-phrase": {
        type: "infinitive-phrase",
        grammarName: "Infinitive phrase",
        vietnameseName: "Cụm to-V",
        pattern: "to + verb",
        functionLabel: "Thường chỉ mục đích, ý định hoặc hành động dự kiến",
        signals: ["to improve", "to ensure", "to promote", "in order to"],
        example: "to improve productivity"
    },
    "conditional-clause": {
        type: "conditional-clause",
        grammarName: "Conditional clause",
        vietnameseName: "Mệnh đề điều kiện",
        pattern: "if / unless / provided that + S + V",
        functionLabel: "Nêu điều kiện để ý chính xảy ra hoặc có hiệu lực",
        signals: ["if", "unless", "provided that", "as long as"],
        example: "if businesses operate in priority sectors"
    },
    comparison: {
        type: "comparison",
        grammarName: "Comparison structure",
        vietnameseName: "Cấu trúc so sánh",
        pattern: "as...as / more...than / the more..., the more...",
        functionLabel: "So sánh mức độ, tính chất hoặc quan hệ tăng giảm",
        signals: ["as...as", "more...than", "less...than", "the more...the more"],
        example: "the more investment increases, the more competitive the economy becomes"
    },
    "cause-effect": {
        type: "cause-effect",
        grammarName: "Cause-effect relation",
        vietnameseName: "Quan hệ nguyên nhân - kết quả",
        pattern: "because / therefore / as a result / lead to",
        functionLabel: "Liên kết nguyên nhân với hệ quả",
        signals: ["because", "therefore", "as a result", "lead to", "result in"],
        example: "higher demand led to stronger growth"
    },
    contrast: {
        type: "contrast",
        grammarName: "Contrast relation",
        vietnameseName: "Quan hệ tương phản / nhượng bộ",
        pattern: "but / however / although / whereas / while",
        functionLabel: "Đặt hai ý ở thế đối lập hoặc nhượng bộ",
        signals: ["but", "however", "although", "whereas", "while"],
        example: "although costs increased, demand remained strong"
    },
    purpose: {
        type: "purpose",
        grammarName: "Purpose relation",
        vietnameseName: "Quan hệ mục đích",
        pattern: "to / in order to / so as to / so that",
        functionLabel: "Nêu mục tiêu hoặc dụng ý của hành động",
        signals: ["to", "in order to", "so as to", "so that"],
        example: "to strengthen supply chains"
    },
    result: {
        type: "result",
        grammarName: "Result relation",
        vietnameseName: "Quan hệ kết quả",
        pattern: "so / therefore / thereby / resulting in",
        functionLabel: "Nêu kết quả hoặc hệ quả sau một hành động/trạng thái",
        signals: ["so", "therefore", "thereby", "resulting in"],
        example: "thereby improving resilience"
    }
};
function getGrammarPattern(type) {
    return grammarPatterns[type];
}
function getAllGrammarPatterns() {
    return Object.values(grammarPatterns);
}