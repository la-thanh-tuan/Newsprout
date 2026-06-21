type AnalysisLayerId = 1 | 2 | 3 | 4;

type CoreClauseType =
  | "active-svo"
  | "passive-voice"
  | "copular-complement"
  | "existential-there"
  | "imperative"
  | "question"
  | "modal-predicate"
  | "content-clause-complement";

type ModifierPatternType =
  | "prepositional-modifier"
  | "adverbial-modifier"
  | "time-place-modifier"
  | "source-modifier"
  | "manner-modifier"
  | "purpose-modifier"
  | "condition-modifier";

type PhrasePatternType =
  | "noun-phrase"
  | "verb-phrase"
  | "prepositional-phrase"
  | "adjective-phrase"
  | "adverbial-phrase"
  | "coordinated-list";

type StructuralRelationType =
  | "prepositional-range"
  | "relative-clause"
  | "subordinate-clause"
  | "coordinate-clause"
  | "participial-phrase"
  | "infinitive-phrase"
  | "conditional-clause"
  | "comparison"
  | "cause-effect"
  | "contrast"
  | "purpose"
  | "result"
  | "parallel-structure"
  | "coordinate-phrase"
  | "correlative-conjunction"
  | "content-clause"
  | "appositive"
  | "colon-list"
  | "semicolon-link"
  | "gerund-subject"
  | "noun-complement"
  | "between-balance";

type LayerPattern<T extends string> = {
  layer: AnalysisLayerId;
  type: T;
  grammarName: string;
  vietnameseName: string;
  pattern: string;
  functionLabel: string;
  signals: string[];
  example: string;
};

type GrammarPattern = LayerPattern<StructuralRelationType>;

type DetectedLayerSet = {
  layer1: CoreClauseType[];
  layer2: ModifierPatternType[];
  layer3: PhrasePatternType[];
  layer4: StructuralRelationType[];
};

const coreClausePatterns: Record<CoreClauseType, LayerPattern<CoreClauseType>> = {
  "active-svo": {
    layer: 1,
    type: "active-svo",
    grammarName: "Active clause core",
    vietnameseName: "Câu chủ động có lõi S-V-O/S-V-C",
    pattern: "Subject + Main Verb + Object/Complement",
    functionLabel: "Xác định xương sống nghĩa của câu",
    signals: ["noun/pronoun subject", "main verb", "object/complement"],
    example: "The documents define the core components."
  },
  "passive-voice": {
    layer: 1,
    type: "passive-voice",
    grammarName: "Passive voice",
    vietnameseName: "Câu bị động",
    pattern: "Subject + be/get + V-ed/V3",
    functionLabel: "Đưa đối tượng chịu tác động lên vị trí chủ ngữ",
    signals: ["is/are/was/were + V-ed", "be + V3", "by + agent"],
    example: "The policy was introduced last year."
  },
  "copular-complement": {
    layer: 1,
    type: "copular-complement",
    grammarName: "Copular clause",
    vietnameseName: "Câu nối chủ ngữ với bổ ngữ",
    pattern: "Subject + be/become/remain/seem + Complement",
    functionLabel: "Định danh, mô tả trạng thái hoặc tính chất của chủ ngữ",
    signals: ["is", "are", "was", "were", "become", "remain", "seem"],
    example: "The press is a trusted source."
  },
  "existential-there": {
    layer: 1,
    type: "existential-there",
    grammarName: "Existential there clause",
    vietnameseName: "Câu tồn tại với there",
    pattern: "There + be + noun phrase",
    functionLabel: "Giới thiệu sự tồn tại hoặc xuất hiện của một sự vật/hiện tượng",
    signals: ["there is", "there are", "there was", "there were"],
    example: "There are new challenges in the digital age."
  },
  imperative: {
    layer: 1,
    type: "imperative",
    grammarName: "Imperative clause",
    vietnameseName: "Câu mệnh lệnh / yêu cầu",
    pattern: "Verb + Object/Complement",
    functionLabel: "Đưa ra yêu cầu, chỉ dẫn hoặc lời kêu gọi",
    signals: ["start with base verb", "no explicit subject"],
    example: "Strengthen digital journalism."
  },
  question: {
    layer: 1,
    type: "question",
    grammarName: "Interrogative clause",
    vietnameseName: "Câu hỏi",
    pattern: "Auxiliary/Wh-word + Subject + Verb",
    functionLabel: "Đặt vấn đề hoặc yêu cầu thông tin",
    signals: ["?", "what", "why", "how", "do/does/did", "is/are/can"],
    example: "How can journalism adapt?"
  },
  "modal-predicate": {
    layer: 1,
    type: "modal-predicate",
    grammarName: "Modal predicate",
    vietnameseName: "Vị ngữ có động từ khuyết thiếu",
    pattern: "Subject + must/should/can/may + Verb",
    functionLabel: "Thể hiện khả năng, nghĩa vụ, khuyến nghị hoặc định hướng hành động",
    signals: ["must", "should", "can", "may", "need to", "have to"],
    example: "Newsrooms must invest in technology."
  },
  "content-clause-complement": {
    layer: 1,
    type: "content-clause-complement",
    grammarName: "Verb + content clause",
    vietnameseName: "Động từ dẫn + mệnh đề nội dung",
    pattern: "say/argue/emphasize/highlight + that + clause",
    functionLabel: "Đưa thông tin được nói, tin, nhấn mạnh hoặc khẳng định làm nội dung chính",
    signals: ["said that", "argued that", "emphasized that", "highlighted that"],
    example: "The leader emphasized that journalism must innovate."
  }
};

const modifierPatterns: Record<ModifierPatternType, LayerPattern<ModifierPatternType>> = {
  "prepositional-modifier": {
    layer: 2,
    type: "prepositional-modifier",
    grammarName: "Prepositional modifier",
    vietnameseName: "Cụm giới từ bổ nghĩa",
    pattern: "in/on/at/from/with/by/of/for + noun phrase",
    functionLabel: "Bổ sung nguồn gốc, phạm vi, thời gian, địa điểm, phương tiện hoặc quan hệ sở thuộc",
    signals: ["in", "on", "at", "from", "with", "by", "of", "for"],
    example: "in the digital age"
  },
  "adverbial-modifier": {
    layer: 2,
    type: "adverbial-modifier",
    grammarName: "Adverbial modifier",
    vietnameseName: "Trạng ngữ bổ nghĩa",
    pattern: "adverb/adverbial phrase + clause/verb",
    functionLabel: "Bổ nghĩa cách thức, mức độ, thời điểm hoặc quan điểm cho hành động/mệnh đề",
    signals: ["-ly adverbs", "however", "therefore", "meanwhile"],
    example: "rapidly transform"
  },
  "time-place-modifier": {
    layer: 2,
    type: "time-place-modifier",
    grammarName: "Time/place modifier",
    vietnameseName: "Bổ nghĩa thời gian / địa điểm",
    pattern: "in/at/on/during/after/before + time/place noun",
    functionLabel: "Đặt sự việc vào bối cảnh thời gian hoặc không gian",
    signals: ["in", "during", "after", "before", "at", "on"],
    example: "in the digital age"
  },
  "source-modifier": {
    layer: 2,
    type: "source-modifier",
    grammarName: "Source/origin modifier",
    vietnameseName: "Bổ nghĩa nguồn gốc",
    pattern: "from/by/according to + source",
    functionLabel: "Cho biết nguồn phát sinh, cơ quan ban hành hoặc căn cứ thông tin",
    signals: ["from", "by", "according to", "issued by"],
    example: "from the 14th National Party Congress"
  },
  "manner-modifier": {
    layer: 2,
    type: "manner-modifier",
    grammarName: "Manner modifier",
    vietnameseName: "Bổ nghĩa cách thức",
    pattern: "in a/an ... manner / in ... terms / adverb",
    functionLabel: "Cho biết hành động được thực hiện theo cách nào hoặc mức độ nào",
    signals: ["in ... terms", "in a ... manner", "-ly"],
    example: "in relatively comprehensive terms"
  },
  "purpose-modifier": {
    layer: 2,
    type: "purpose-modifier",
    grammarName: "Purpose modifier",
    vietnameseName: "Bổ nghĩa mục đích",
    pattern: "to/in order to/so as to + verb",
    functionLabel: "Nêu mục đích của hành động chính",
    signals: ["to", "in order to", "so as to"],
    example: "to improve productivity"
  },
  "condition-modifier": {
    layer: 2,
    type: "condition-modifier",
    grammarName: "Condition modifier",
    vietnameseName: "Bổ nghĩa điều kiện",
    pattern: "if/unless/provided that + clause",
    functionLabel: "Nêu điều kiện để hành động hoặc kết luận có hiệu lực",
    signals: ["if", "unless", "provided that", "as long as"],
    example: "if they operate in priority sectors"
  }
};

const phrasePatterns: Record<PhrasePatternType, LayerPattern<PhrasePatternType>> = {
  "noun-phrase": {
    layer: 3,
    type: "noun-phrase",
    grammarName: "Noun phrase",
    vietnameseName: "Cụm danh từ",
    pattern: "determiner/adjective + head noun + post-modifier",
    functionLabel: "Đóng vai trò chủ ngữ, tân ngữ hoặc bổ ngữ trong câu",
    signals: ["the/a/an + noun", "of + noun", "noun + prepositional phrase"],
    example: "the core components of Vietnam’s development model"
  },
  "verb-phrase": {
    layer: 3,
    type: "verb-phrase",
    grammarName: "Verb phrase",
    vietnameseName: "Cụm động từ",
    pattern: "auxiliary/modal + main verb + complements",
    functionLabel: "Biểu thị hành động, trạng thái, khả năng hoặc nghĩa vụ",
    signals: ["began to", "must", "should", "can", "has been"],
    example: "began to define"
  },
  "prepositional-phrase": {
    layer: 3,
    type: "prepositional-phrase",
    grammarName: "Prepositional phrase",
    vietnameseName: "Cụm giới từ",
    pattern: "preposition + noun phrase",
    functionLabel: "Bổ nghĩa cho danh từ, động từ, tính từ hoặc toàn mệnh đề",
    signals: ["in", "on", "from", "to", "with", "by", "of"],
    example: "in the new era"
  },
  "adjective-phrase": {
    layer: 3,
    type: "adjective-phrase",
    grammarName: "Adjective phrase",
    vietnameseName: "Cụm tính từ",
    pattern: "degree adverb + adjective + complement",
    functionLabel: "Mô tả tính chất hoặc trạng thái của danh từ/chủ ngữ",
    signals: ["relatively", "highly", "more", "less", "very"],
    example: "relatively comprehensive"
  },
  "adverbial-phrase": {
    layer: 3,
    type: "adverbial-phrase",
    grammarName: "Adverbial phrase",
    vietnameseName: "Cụm trạng từ",
    pattern: "adverb / adverb group",
    functionLabel: "Bổ nghĩa cho động từ, tính từ hoặc toàn câu",
    signals: ["rapidly", "relatively", "effectively", "however"],
    example: "relatively comprehensively"
  },
  "coordinated-list": {
    layer: 3,
    type: "coordinated-list",
    grammarName: "Coordinated list",
    vietnameseName: "Chuỗi liệt kê song song",
    pattern: "A, B, C, and D",
    functionLabel: "Gom các thành phần cùng vai trò ngữ pháp thành một chuỗi song song",
    signals: [",", "and", "or"],
    example: "context, objectives, perspectives, and mechanisms"
  }
};

const grammarPatterns: Record<StructuralRelationType, GrammarPattern> = {
  "prepositional-range": {
    layer: 4,
    type: "prepositional-range",
    grammarName: "Prepositional phrase of range/scope",
    vietnameseName: "Cụm giới từ chỉ phạm vi",
    pattern: "from A to B / between A and B / across A",
    functionLabel: "Chỉ phạm vi bao quát, biên độ hoặc miền nghĩa",
    signals: ["from...to...", "between...and...", "across", "throughout"],
    example: "from the development context to strategic breakthroughs"
  },
  "relative-clause": {
    layer: 4,
    type: "relative-clause",
    grammarName: "Relative clause",
    vietnameseName: "Mệnh đề quan hệ",
    pattern: "who / which / that / whose + clause",
    functionLabel: "Bổ sung hoặc xác định thông tin cho danh từ đứng trước",
    signals: ["who", "which", "that", "whose", "where", "when"],
    example: "the policy that was introduced last year"
  },
  "subordinate-clause": {
    layer: 4,
    type: "subordinate-clause",
    grammarName: "Subordinate clause",
    vietnameseName: "Mệnh đề phụ",
    pattern: "although / because / when / while / if + S + V",
    functionLabel: "Tạo quan hệ phụ thuộc: thời gian, nguyên nhân, nhượng bộ, điều kiện",
    signals: ["although", "because", "when", "while", "if", "since"],
    example: "although the policy was introduced early"
  },
  "coordinate-clause": {
    layer: 4,
    type: "coordinate-clause",
    grammarName: "Coordinate clause",
    vietnameseName: "Mệnh đề đẳng lập",
    pattern: "S + V, and / but / or / yet + S + V",
    functionLabel: "Nối hai ý ngang hàng về mặt ngữ pháp",
    signals: ["and", "but", "or", "yet", "so"],
    example: "the policy was adopted, and businesses began to adapt"
  },
  "participial-phrase": {
    layer: 4,
    type: "participial-phrase",
    grammarName: "Participial phrase",
    vietnameseName: "Cụm phân từ",
    pattern: "V-ing / V-ed phrase",
    functionLabel: "Rút gọn mệnh đề để nêu bối cảnh, nguyên nhân, trạng thái hoặc kết quả phụ",
    signals: ["V-ing", "V-ed", "driven by", "based on", "aimed at", "marked by"],
    example: "driven by technological change"
  },
  "infinitive-phrase": {
    layer: 4,
    type: "infinitive-phrase",
    grammarName: "Infinitive phrase",
    vietnameseName: "Cụm to-V",
    pattern: "to + verb",
    functionLabel: "Thường chỉ mục đích, ý định hoặc hành động dự kiến",
    signals: ["to improve", "to ensure", "to promote", "in order to"],
    example: "to improve productivity"
  },
  "conditional-clause": {
    layer: 4,
    type: "conditional-clause",
    grammarName: "Conditional clause",
    vietnameseName: "Mệnh đề điều kiện",
    pattern: "if / unless / provided that + S + V",
    functionLabel: "Nêu điều kiện để ý chính xảy ra hoặc có hiệu lực",
    signals: ["if", "unless", "provided that", "as long as"],
    example: "if businesses operate in priority sectors"
  },
  comparison: {
    layer: 4,
    type: "comparison",
    grammarName: "Comparison structure",
    vietnameseName: "Cấu trúc so sánh",
    pattern: "as...as / more...than / the more..., the more...",
    functionLabel: "So sánh mức độ, tính chất hoặc quan hệ tăng giảm",
    signals: ["as...as", "more...than", "less...than", "the more...the more"],
    example: "the more investment increases, the more competitive the economy becomes"
  },
  "cause-effect": {
    layer: 4,
    type: "cause-effect",
    grammarName: "Cause-effect relation",
    vietnameseName: "Quan hệ nguyên nhân - kết quả",
    pattern: "because / therefore / as a result / lead to",
    functionLabel: "Liên kết nguyên nhân với hệ quả",
    signals: ["because", "therefore", "as a result", "lead to", "result in"],
    example: "higher demand led to stronger growth"
  },
  contrast: {
    layer: 4,
    type: "contrast",
    grammarName: "Contrast relation",
    vietnameseName: "Quan hệ tương phản / nhượng bộ",
    pattern: "but / however / although / whereas / while",
    functionLabel: "Đặt hai ý ở thế đối lập hoặc nhượng bộ",
    signals: ["but", "however", "although", "whereas", "while"],
    example: "although costs increased, demand remained strong"
  },
  purpose: {
    layer: 4,
    type: "purpose",
    grammarName: "Purpose relation",
    vietnameseName: "Quan hệ mục đích",
    pattern: "to / in order to / so as to / so that",
    functionLabel: "Nêu mục tiêu hoặc dụng ý của hành động",
    signals: ["to", "in order to", "so as to", "so that"],
    example: "to strengthen supply chains"
  },
  result: {
    layer: 4,
    type: "result",
    grammarName: "Result relation",
    vietnameseName: "Quan hệ kết quả",
    pattern: "so / therefore / thereby / resulting in",
    functionLabel: "Nêu kết quả hoặc hệ quả sau một hành động/trạng thái",
    signals: ["so", "therefore", "thereby", "resulting in"],
    example: "thereby improving resilience"
  },
  "parallel-structure": {
    layer: 4,
    type: "parallel-structure",
    grammarName: "Parallel structure",
    vietnameseName: "Cấu trúc song song",
    pattern: "A, B, and C / A and B with same grammatical role",
    functionLabel: "Tạo nhịp liệt kê hoặc đối xứng giữa các thành phần cùng vai trò",
    signals: [", and", "both...and", "not only...but also"],
    example: "created, distributed, received, and verified"
  },
  "coordinate-phrase": {
    layer: 4,
    type: "coordinate-phrase",
    grammarName: "Coordinate phrase",
    vietnameseName: "Cụm đẳng lập",
    pattern: "phrase + and/or + phrase",
    functionLabel: "Nối các cụm cùng cấp trong cùng một vị trí ngữ pháp",
    signals: ["and", "or", "as well as"],
    example: "political mettle and technological capability"
  },
  "correlative-conjunction": {
    layer: 4,
    type: "correlative-conjunction",
    grammarName: "Correlative conjunction",
    vietnameseName: "Liên từ tương liên",
    pattern: "not merely A but B / not only A but also B / either A or B",
    functionLabel: "Tạo quan hệ cặp đôi giữa hai vế song song hoặc tương phản",
    signals: ["not merely...but", "not only...but also", "either...or", "neither...nor"],
    example: "not merely a technical upgrade but a comprehensive overhaul"
  },
  "content-clause": {
    layer: 4,
    type: "content-clause",
    grammarName: "Content clause",
    vietnameseName: "Mệnh đề nội dung",
    pattern: "that/whether/if + clause",
    functionLabel: "Làm nội dung cho động từ, danh từ hoặc tính từ phía trước",
    signals: ["that + clause", "whether + clause", "if + clause"],
    example: "that journalism must innovate"
  },
  appositive: {
    layer: 4,
    type: "appositive",
    grammarName: "Appositive phrase",
    vietnameseName: "Cụm đồng vị",
    pattern: "noun, appositive phrase, ...",
    functionLabel: "Giải thích hoặc định danh lại một danh từ đứng trước",
    signals: [", a", ", an", ", the"],
    example: "data journalism, a new reporting method, ..."
  },
  "colon-list": {
    layer: 4,
    type: "colon-list",
    grammarName: "Colon-led list",
    vietnameseName: "Danh sách sau dấu hai chấm",
    pattern: "main idea: item 1, item 2, item 3",
    functionLabel: "Mở rộng hoặc liệt kê chi tiết cho ý đứng trước dấu hai chấm",
    signals: [":"],
    example: "three priorities: technology, ethics, and talent"
  },
  "semicolon-link": {
    layer: 4,
    type: "semicolon-link",
    grammarName: "Semicolon link",
    vietnameseName: "Liên kết bằng dấu chấm phẩy",
    pattern: "clause ; related clause",
    functionLabel: "Nối hai vế độc lập có quan hệ gần về nghĩa",
    signals: [";"],
    example: "Technology changes rapidly; journalism must adapt."
  },
  "gerund-subject": {
    layer: 4,
    type: "gerund-subject",
    grammarName: "Gerund subject",
    vietnameseName: "Cụm V-ing làm chủ ngữ",
    pattern: "V-ing phrase + verb",
    functionLabel: "Biến hành động thành danh hóa để làm chủ ngữ của câu",
    signals: ["V-ing at sentence start"],
    example: "Building trust requires transparency."
  },
  "noun-complement": {
    layer: 4,
    type: "noun-complement",
    grammarName: "Noun complement clause",
    vietnameseName: "Mệnh đề bổ nghĩa cho danh từ",
    pattern: "abstract noun + that + clause",
    functionLabel: "Làm rõ nội dung của một danh từ trừu tượng",
    signals: ["fact that", "idea that", "belief that", "claim that", "hope that"],
    example: "the belief that journalism must serve the public"
  },
  "between-balance": {
    layer: 4,
    type: "between-balance",
    grammarName: "Between A and B balance",
    vietnameseName: "Cấu trúc cân bằng between A and B",
    pattern: "between A and B",
    functionLabel: "Đặt hai yếu tố vào quan hệ cân bằng, đối chiếu hoặc kết hợp",
    signals: ["between...and..."],
    example: "between political mettle and technological capability"
  }
};

function uniqueValues<T extends string>(values: T[]): T[] {
  return Array.from(new Set(values));
}

function hasPattern(text: string, pattern: RegExp): boolean {
  return pattern.test(text);
}

function getGrammarPattern(type: StructuralRelationType): GrammarPattern {
  return grammarPatterns[type];
}

function getAllGrammarPatterns(): GrammarPattern[] {
  return Object.values(grammarPatterns);
}

function getCoreClausePattern(type: CoreClauseType): LayerPattern<CoreClauseType> {
  return coreClausePatterns[type];
}

function getModifierPattern(type: ModifierPatternType): LayerPattern<ModifierPatternType> {
  return modifierPatterns[type];
}

function getPhrasePattern(type: PhrasePatternType): LayerPattern<PhrasePatternType> {
  return phrasePatterns[type];
}

function getAllCoreClausePatterns(): LayerPattern<CoreClauseType>[] {
  return Object.values(coreClausePatterns);
}

function getAllModifierPatterns(): LayerPattern<ModifierPatternType>[] {
  return Object.values(modifierPatterns);
}

function getAllPhrasePatterns(): LayerPattern<PhrasePatternType>[] {
  return Object.values(phrasePatterns);
}

function detectCoreClauseTypes(sentence: string): CoreClauseType[] {
  const text = sentence.trim();
  const lower = text.toLowerCase();
  const detected: CoreClauseType[] = [];

  if (hasPattern(lower, /^there\s+(is|are|was|were|has|have)\b/)) detected.push("existential-there");
  if (hasPattern(text, /\?\s*$/) || hasPattern(lower, /^(what|why|how|when|where|who|do|does|did|is|are|was|were|can|could|should|would|will|may|might|must)\b/)) detected.push("question");
  if (hasPattern(lower, /\b(am|is|are|was|were|be|been|being|get|got)\s+\w+(ed|en)\b|\bwas\s+(made|known|seen|given|taken|built|introduced|created|distributed|received|verified)\b/)) detected.push("passive-voice");
  if (hasPattern(lower, /\b(must|should|can|could|may|might|will|would|need to|needs to|have to|has to)\s+\w+/)) detected.push("modal-predicate");
  if (hasPattern(lower, /\b(is|are|was|were|be|been|being|becomes|became|remain|remains|seem|seems|appear|appears)\b/)) detected.push("copular-complement");
  if (hasPattern(lower, /\b(said|stated|noted|argued|emphasized|highlighted|believed|showed|suggested)\s+that\b/)) detected.push("content-clause-complement");
  if (hasPattern(text, /^[A-Z]?[a-z]+\s+(the|a|an|this|that|these|those)\b/) && !hasPattern(lower, /^(the|a|an|this|that|these|those|there)\b/)) detected.push("imperative");

  if (detected.length === 0) detected.push("active-svo");
  return uniqueValues(detected);
}

function detectModifierTypes(sentence: string): ModifierPatternType[] {
  const lower = sentence.toLowerCase();
  const detected: ModifierPatternType[] = [];

  if (hasPattern(lower, /\b(in|on|at|from|with|by|of|for|under|between|across|throughout)\s+\w+/)) detected.push("prepositional-modifier");
  if (hasPattern(lower, /\b\w+ly\b|\b(however|therefore|meanwhile|moreover)\b/)) detected.push("adverbial-modifier");
  if (hasPattern(lower, /\b(in|during|after|before|at|on)\s+(the\s+)?(digital age|new era|year|period|stage|time|country|world|region|market)\b/)) detected.push("time-place-modifier");
  if (hasPattern(lower, /\b(from|by|according to|issued by|adopted at)\b/)) detected.push("source-modifier");
  if (hasPattern(lower, /\bin\s+(a\s+)?\w+\s+(manner|terms|way)\b|\b\w+ly\b/)) detected.push("manner-modifier");
  if (hasPattern(lower, /\b(to|in order to|so as to)\s+\w+/)) detected.push("purpose-modifier");
  if (hasPattern(lower, /\b(if|unless|provided that|as long as)\b/)) detected.push("condition-modifier");

  return uniqueValues(detected);
}

function detectPhraseTypes(sentence: string): PhrasePatternType[] {
  const lower = sentence.toLowerCase();
  const detected: PhrasePatternType[] = [];

  if (hasPattern(lower, /\b(the|a|an|this|that|these|those)\s+\w+(\s+\w+){0,5}\s+of\b/)) detected.push("noun-phrase");
  if (hasPattern(lower, /\b(began to|started to|set out to|must|should|can|could|may|might|has been|have been|is being|are being)\b/)) detected.push("verb-phrase");
  if (hasPattern(lower, /\b(in|on|at|from|to|with|by|of|for|under|between|across|throughout)\s+\w+/)) detected.push("prepositional-phrase");
  if (hasPattern(lower, /\b(relatively|highly|very|more|less|quite|fairly)\s+\w+/)) detected.push("adjective-phrase");
  if (hasPattern(lower, /\b\w+ly\b|\b(however|therefore|meanwhile|moreover)\b/)) detected.push("adverbial-phrase");
  if (hasPattern(sentence, /\w+,\s+\w+(?:,\s+\w+)*,?\s+(and|or)\s+\w+/)) detected.push("coordinated-list");

  return uniqueValues(detected);
}

function detectStructuralRelationTypes(sentence: string): StructuralRelationType[] {
  const lower = sentence.toLowerCase();
  const detected: StructuralRelationType[] = [];

  if (hasPattern(lower, /\bfrom\b[\s\S]+?\bto\b|\bacross\b|\bthroughout\b/)) detected.push("prepositional-range");
  if (hasPattern(lower, /\bbetween\b[\s\S]+?\band\b/)) detected.push("between-balance", "prepositional-range");
  if (hasPattern(lower, /\b(who|which|that|whose|where|when)\b[\s\S]+?\b(is|are|was|were|has|have|had|will|can|could|should|would|may|might|must|focus|focuses|serve|serves|change|changes)\b/)) detected.push("relative-clause");
  if (hasPattern(lower, /\b(although|because|when|while|since|after|before|as)\b/)) detected.push("subordinate-clause");
  if (hasPattern(lower, /,\s*(and|but|or|yet|so)\s+\w+/)) detected.push("coordinate-clause");
  if (hasPattern(sentence, /\w+,\s+\w+(?:,\s+\w+)*,?\s+(and|or)\s+\w+/)) detected.push("parallel-structure", "coordinate-phrase");
  if (hasPattern(lower, /\b(driven by|based on|aimed at|marked by|resulting in|including)\b|^\s*\w+(ed|ing)\b/)) detected.push("participial-phrase");
  if (hasPattern(lower, /\bto\s+[a-z]+\b|\bin order to\b|\bso as to\b/)) detected.push("infinitive-phrase");
  if (hasPattern(lower, /\b(if|unless|provided that|as long as)\b/)) detected.push("conditional-clause");
  if (hasPattern(lower, /\bthe more\b[\s\S]+?\bthe more\b|\bmore\b[\s\S]+?\bthan\b|\bas\b[\s\S]+?\bas\b/)) detected.push("comparison");
  if (hasPattern(lower, /\b(because|therefore|as a result|lead to|leads to|led to|result in|results in|resulted in)\b/)) detected.push("cause-effect");
  if (hasPattern(lower, /\b(however|but|although|whereas|while|nevertheless|yet)\b/)) detected.push("contrast");
  if (hasPattern(lower, /\b(to|in order to|so as to|so that)\s+[a-z]+/)) detected.push("purpose");
  if (hasPattern(lower, /\b(so|therefore|thereby|resulting in|thus)\b/)) detected.push("result");
  if (hasPattern(lower, /\bnot\s+(merely|only|just)\b[\s\S]+?\bbut\b|\bnot only\b[\s\S]+?\bbut also\b|\beither\b[\s\S]+?\bor\b|\bneither\b[\s\S]+?\bnor\b/)) detected.push("correlative-conjunction");
  if (hasPattern(lower, /\b(that|whether|if)\s+(the|a|an|they|it|he|she|we|you|[a-z]+)\s+\w+/)) detected.push("content-clause");
  if (hasPattern(sentence, /,\s+(a|an|the)\s+[^,]+,\s+/)) detected.push("appositive");
  if (sentence.includes(":")) detected.push("colon-list");
  if (sentence.includes(";")) detected.push("semicolon-link");
  if (hasPattern(sentence, /^\s*[A-Za-z]+ing\b/)) detected.push("gerund-subject");
  if (hasPattern(lower, /\b(fact|idea|belief|claim|hope|view|evidence|possibility)\s+that\b/)) detected.push("noun-complement");

  return uniqueValues(detected);
}

function detectSentenceLayers(sentence: string): DetectedLayerSet {
  return {
    layer1: detectCoreClauseTypes(sentence),
    layer2: detectModifierTypes(sentence),
    layer3: detectPhraseTypes(sentence),
    layer4: detectStructuralRelationTypes(sentence)
  };
}

function splitIntoSentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+(?=[A-Z\"“])/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}