"use strict";
const makePattern = (layer, type, grammarName, vietnameseName, pattern, functionLabel, signals, example) => ({ layer, type, grammarName, vietnameseName, pattern, functionLabel, signals, example });
const coreClausePatterns = {
    "active-svo": makePattern(1, "active-svo", "Active clause core", "Câu chủ động có lõi S-V-O/S-V-C", "Subject + Main Verb + Object/Complement", "Xác định xương sống nghĩa của câu", ["noun/pronoun subject", "main verb", "object/complement"], "The documents define the core components."),
    "passive-voice": makePattern(1, "passive-voice", "Passive voice", "Câu bị động", "Subject + be/get + V-ed/V3", "Đưa đối tượng chịu tác động lên vị trí chủ ngữ", ["is/are/was/were + V-ed", "be + V3", "by + agent"], "The policy was introduced last year."),
    "copular-complement": makePattern(1, "copular-complement", "Copular clause", "Câu nối chủ ngữ với bổ ngữ", "Subject + be/become/remain/seem + Complement", "Định danh, mô tả trạng thái hoặc tính chất của chủ ngữ", ["is", "are", "was", "were", "become", "remain", "seem"], "The press is a trusted source."),
    "existential-there": makePattern(1, "existential-there", "Existential there clause", "Câu tồn tại với there", "There + be + noun phrase", "Giới thiệu sự tồn tại hoặc xuất hiện của một sự vật/hiện tượng", ["there is", "there are", "there was", "there were"], "There are new challenges in the digital age."),
    imperative: makePattern(1, "imperative", "Imperative clause", "Câu mệnh lệnh / yêu cầu", "Verb + Object/Complement", "Đưa ra yêu cầu, chỉ dẫn hoặc lời kêu gọi", ["start with base verb", "no explicit subject"], "Strengthen digital journalism."),
    question: makePattern(1, "question", "Interrogative clause", "Câu hỏi", "Auxiliary/Wh-word + Subject + Verb", "Đặt vấn đề hoặc yêu cầu thông tin", ["?", "what", "why", "how", "do/does/did", "is/are/can"], "How can journalism adapt?"),
    "modal-predicate": makePattern(1, "modal-predicate", "Modal predicate", "Vị ngữ có động từ khuyết thiếu", "Subject + must/should/can/may + Verb", "Thể hiện khả năng, nghĩa vụ, khuyến nghị hoặc định hướng hành động", ["must", "should", "can", "may", "need to", "have to"], "Newsrooms must invest in technology."),
    "content-clause-complement": makePattern(1, "content-clause-complement", "Verb + content clause", "Động từ dẫn + mệnh đề nội dung", "say/argue/emphasize/highlight + that + clause", "Đưa thông tin được nói, tin, nhấn mạnh hoặc khẳng định làm nội dung chính", ["said that", "argued that", "emphasized that", "highlighted that"], "The leader emphasized that journalism must innovate.")
};
const modifierPatterns = {
    "prepositional-modifier": makePattern(2, "prepositional-modifier", "Prepositional modifier", "Cụm giới từ bổ nghĩa", "in/on/at/from/with/by/of/for + noun phrase", "Bổ sung nguồn gốc, phạm vi, thời gian, địa điểm, phương tiện hoặc quan hệ sở thuộc", ["in", "on", "at", "from", "with", "by", "of", "for"], "in the digital age"),
    "adverbial-modifier": makePattern(2, "adverbial-modifier", "Adverbial modifier", "Trạng ngữ bổ nghĩa", "adverb/adverbial phrase + clause/verb", "Bổ nghĩa cách thức, mức độ, thời điểm hoặc quan điểm cho hành động/mệnh đề", ["-ly adverbs", "however", "therefore", "meanwhile"], "rapidly transform"),
    "time-place-modifier": makePattern(2, "time-place-modifier", "Time/place modifier", "Bổ nghĩa thời gian / địa điểm", "in/at/on/during/after/before + time/place noun", "Đặt sự việc vào bối cảnh thời gian hoặc không gian", ["in", "during", "after", "before", "at", "on"], "in the digital age"),
    "source-modifier": makePattern(2, "source-modifier", "Source/origin modifier", "Bổ nghĩa nguồn gốc", "from/by/according to + source", "Cho biết nguồn phát sinh, cơ quan ban hành hoặc căn cứ thông tin", ["from", "by", "according to", "issued by"], "from the 14th National Party Congress"),
    "manner-modifier": makePattern(2, "manner-modifier", "Manner modifier", "Bổ nghĩa cách thức", "in a/an ... manner / in ... terms / adverb", "Cho biết hành động được thực hiện theo cách nào hoặc mức độ nào", ["in ... terms", "in a ... manner", "-ly"], "in relatively comprehensive terms"),
    "purpose-modifier": makePattern(2, "purpose-modifier", "Purpose modifier", "Bổ nghĩa mục đích", "to/in order to/so as to + verb", "Nêu mục đích của hành động chính", ["to", "in order to", "so as to"], "to improve productivity"),
    "condition-modifier": makePattern(2, "condition-modifier", "Condition modifier", "Bổ nghĩa điều kiện", "if/unless/provided that + clause", "Nêu điều kiện để hành động hoặc kết luận có hiệu lực", ["if", "unless", "provided that", "as long as"], "if they operate in priority sectors")
};
const phrasePatterns = {
    "noun-phrase": makePattern(3, "noun-phrase", "Noun phrase", "Cụm danh từ", "determiner/adjective + head noun + post-modifier", "Đóng vai trò chủ ngữ, tân ngữ hoặc bổ ngữ trong câu", ["the/a/an + noun", "of + noun", "noun + prepositional phrase"], "the core components of Vietnam’s development model"),
    "verb-phrase": makePattern(3, "verb-phrase", "Verb phrase", "Cụm động từ", "auxiliary/modal + main verb + complements", "Biểu thị hành động, trạng thái, khả năng hoặc nghĩa vụ", ["began to", "must", "should", "can", "has been"], "began to define"),
    "prepositional-phrase": makePattern(3, "prepositional-phrase", "Prepositional phrase", "Cụm giới từ", "preposition + noun phrase", "Bổ nghĩa cho danh từ, động từ, tính từ hoặc toàn mệnh đề", ["in", "on", "from", "to", "with", "by", "of"], "in the new era"),
    "adjective-phrase": makePattern(3, "adjective-phrase", "Adjective phrase", "Cụm tính từ", "degree adverb + adjective + complement", "Mô tả tính chất hoặc trạng thái của danh từ/chủ ngữ", ["relatively", "highly", "more", "less", "very"], "relatively comprehensive"),
    "adverbial-phrase": makePattern(3, "adverbial-phrase", "Adverbial phrase", "Cụm trạng từ", "adverb / adverb group", "Bổ nghĩa cho động từ, tính từ hoặc toàn câu", ["rapidly", "relatively", "effectively", "however"], "relatively comprehensively"),
    "coordinated-list": makePattern(3, "coordinated-list", "Coordinated list", "Chuỗi liệt kê song song", "A, B, C, and D", "Gom các thành phần cùng vai trò ngữ pháp thành một chuỗi song song", [",", "and", "or"], "context, objectives, perspectives, and mechanisms")
};
const grammarPatterns = {
    "prepositional-range": makePattern(4, "prepositional-range", "Prepositional phrase of range/scope", "Cụm giới từ chỉ phạm vi", "from A to B / between A and B / across A", "Chỉ phạm vi bao quát, biên độ hoặc miền nghĩa", ["from...to...", "between...and...", "across", "throughout"], "from the development context to strategic breakthroughs"),
    "relative-clause": makePattern(4, "relative-clause", "Relative clause", "Mệnh đề quan hệ", "who / which / that / whose + clause", "Bổ sung hoặc xác định thông tin cho danh từ đứng trước", ["who", "which", "that", "whose", "where", "when"], "the policy that was introduced last year"),
    "subordinate-clause": makePattern(4, "subordinate-clause", "Subordinate clause", "Mệnh đề phụ", "although / because / when / while / if + S + V", "Tạo quan hệ phụ thuộc: thời gian, nguyên nhân, nhượng bộ, điều kiện", ["although", "because", "when", "while", "if", "since"], "although the policy was introduced early"),
    "coordinate-clause": makePattern(4, "coordinate-clause", "Coordinate clause", "Mệnh đề đẳng lập", "S + V, and / but / or / yet + S + V", "Nối hai ý ngang hàng về mặt ngữ pháp", ["and", "but", "or", "yet", "so"], "the policy was adopted, and businesses began to adapt"),
    "participial-phrase": makePattern(4, "participial-phrase", "Participial phrase", "Cụm phân từ", "V-ing / V-ed phrase", "Rút gọn mệnh đề để nêu bối cảnh, nguyên nhân, trạng thái hoặc kết quả phụ", ["V-ing", "V-ed", "driven by", "based on", "aimed at", "marked by"], "driven by technological change"),
    "infinitive-phrase": makePattern(4, "infinitive-phrase", "Infinitive phrase", "Cụm to-V", "to + verb", "Thường chỉ mục đích, ý định hoặc hành động dự kiến", ["to improve", "to ensure", "to promote", "in order to"], "to improve productivity"),
    "conditional-clause": makePattern(4, "conditional-clause", "Conditional clause", "Mệnh đề điều kiện", "if / unless / provided that + S + V", "Nêu điều kiện để ý chính xảy ra hoặc có hiệu lực", ["if", "unless", "provided that", "as long as"], "if businesses operate in priority sectors"),
    comparison: makePattern(4, "comparison", "Comparison structure", "Cấu trúc so sánh", "as...as / more...than / the more..., the more...", "So sánh mức độ, tính chất hoặc quan hệ tăng giảm", ["as...as", "more...than", "less...than", "the more...the more"], "the more investment increases, the more competitive the economy becomes"),
    "cause-effect": makePattern(4, "cause-effect", "Cause-effect relation", "Quan hệ nguyên nhân - kết quả", "because / therefore / as a result / lead to", "Liên kết nguyên nhân với hệ quả", ["because", "therefore", "as a result", "lead to", "result in"], "higher demand led to stronger growth"),
    contrast: makePattern(4, "contrast", "Contrast relation", "Quan hệ tương phản / nhượng bộ", "but / however / although / whereas / while", "Đặt hai ý ở thế đối lập hoặc nhượng bộ", ["but", "however", "although", "whereas", "while"], "although costs increased, demand remained strong"),
    purpose: makePattern(4, "purpose", "Purpose relation", "Quan hệ mục đích", "to / in order to / so as to / so that", "Nêu mục tiêu hoặc dụng ý của hành động", ["to", "in order to", "so as to", "so that"], "to strengthen supply chains"),
    result: makePattern(4, "result", "Result relation", "Quan hệ kết quả", "so / therefore / thereby / resulting in", "Nêu kết quả hoặc hệ quả sau một hành động/trạng thái", ["so", "therefore", "thereby", "resulting in"], "thereby improving resilience"),
    "parallel-structure": makePattern(4, "parallel-structure", "Parallel structure", "Cấu trúc song song", "A, B, and C / A and B with same grammatical role", "Tạo nhịp liệt kê hoặc đối xứng giữa các thành phần cùng vai trò", [", and", "both...and", "not only...but also"], "created, distributed, received, and verified"),
    "coordinate-phrase": makePattern(4, "coordinate-phrase", "Coordinate phrase", "Cụm đẳng lập", "phrase + and/or + phrase", "Nối các cụm cùng cấp trong cùng một vị trí ngữ pháp", ["and", "or", "as well as"], "political mettle and technological capability"),
    "correlative-conjunction": makePattern(4, "correlative-conjunction", "Correlative conjunction", "Liên từ tương liên", "not merely A but B / not only A but also B / either A or B", "Tạo quan hệ cặp đôi giữa hai vế song song hoặc tương phản", ["not merely...but", "not only...but also", "either...or", "neither...nor"], "not merely a technical upgrade but a comprehensive overhaul"),
    "content-clause": makePattern(4, "content-clause", "Content clause", "Mệnh đề nội dung", "that/whether/if + clause", "Làm nội dung cho động từ, danh từ hoặc tính từ phía trước", ["that + clause", "whether + clause", "if + clause"], "that journalism must innovate"),
    appositive: makePattern(4, "appositive", "Appositive phrase", "Cụm đồng vị", "noun, appositive phrase, ...", "Giải thích hoặc định danh lại một danh từ đứng trước", [", a", ", an", ", the"], "data journalism, a new reporting method, ..."),
    "colon-list": makePattern(4, "colon-list", "Colon-led list", "Danh sách sau dấu hai chấm", "main idea: item 1, item 2, item 3", "Mở rộng hoặc liệt kê chi tiết cho ý đứng trước dấu hai chấm", [":"], "three priorities: technology, ethics, and talent"),
    "semicolon-link": makePattern(4, "semicolon-link", "Semicolon link", "Liên kết bằng dấu chấm phẩy", "clause ; related clause", "Nối hai vế độc lập có quan hệ gần về nghĩa", [";"], "Technology changes rapidly; journalism must adapt."),
    "gerund-subject": makePattern(4, "gerund-subject", "Gerund subject", "Cụm V-ing làm chủ ngữ", "V-ing phrase + verb", "Biến hành động thành danh hóa để làm chủ ngữ của câu", ["V-ing at sentence start"], "Building trust requires transparency."),
    "noun-complement": makePattern(4, "noun-complement", "Noun complement clause", "Mệnh đề bổ nghĩa cho danh từ", "abstract noun + that + clause", "Làm rõ nội dung của một danh từ trừu tượng", ["fact that", "idea that", "belief that", "claim that", "hope that"], "the belief that journalism must serve the public"),
    "between-balance": makePattern(4, "between-balance", "Between A and B balance", "Cấu trúc cân bằng between A and B", "between A and B", "Đặt hai yếu tố vào quan hệ cân bằng, đối chiếu hoặc kết hợp", ["between...and..."], "between political mettle and technological capability")
};
function uniqueValues(values) { return Array.from(new Set(values)); }
function hasPattern(text, pattern) { return pattern.test(text); }
function getGrammarPattern(type) { return grammarPatterns[type]; }
function getAllGrammarPatterns() { return Object.values(grammarPatterns); }
function getCoreClausePattern(type) { return coreClausePatterns[type]; }
function getModifierPattern(type) { return modifierPatterns[type]; }
function getPhrasePattern(type) { return phrasePatterns[type]; }
function getAllCoreClausePatterns() { return Object.values(coreClausePatterns); }
function getAllModifierPatterns() { return Object.values(modifierPatterns); }
function getAllPhrasePatterns() { return Object.values(phrasePatterns); }
function detectCoreClauseTypes(sentence) {
    const text = sentence.trim();
    const lower = text.toLowerCase();
    const detected = [];
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
function detectModifierTypes(sentence) {
    const lower = sentence.toLowerCase();
    const detected = [];
    if (hasPattern(lower, /\b(in|on|at|from|with|by|of|for|under|between|across|throughout)\s+\w+/)) detected.push("prepositional-modifier");
    if (hasPattern(lower, /\b\w+ly\b|\b(however|therefore|meanwhile|moreover)\b/)) detected.push("adverbial-modifier");
    if (hasPattern(lower, /\b(in|during|after|before|at|on)\s+(the\s+)?(digital age|new era|year|period|stage|time|country|world|region|market)\b/)) detected.push("time-place-modifier");
    if (hasPattern(lower, /\b(from|by|according to|issued by|adopted at)\b/)) detected.push("source-modifier");
    if (hasPattern(lower, /\bin\s+(a\s+)?\w+\s+(manner|terms|way)\b|\b\w+ly\b/)) detected.push("manner-modifier");
    if (hasPattern(lower, /\b(to|in order to|so as to)\s+\w+/)) detected.push("purpose-modifier");
    if (hasPattern(lower, /\b(if|unless|provided that|as long as)\b/)) detected.push("condition-modifier");
    return uniqueValues(detected);
}
function detectPhraseTypes(sentence) {
    const lower = sentence.toLowerCase();
    const detected = [];
    if (hasPattern(lower, /\b(the|a|an|this|that|these|those)\s+\w+(\s+\w+){0,5}\s+of\b/)) detected.push("noun-phrase");
    if (hasPattern(lower, /\b(began to|started to|set out to|must|should|can|could|may|might|has been|have been|is being|are being)\b/)) detected.push("verb-phrase");
    if (hasPattern(lower, /\b(in|on|at|from|to|with|by|of|for|under|between|across|throughout)\s+\w+/)) detected.push("prepositional-phrase");
    if (hasPattern(lower, /\b(relatively|highly|very|more|less|quite|fairly)\s+\w+/)) detected.push("adjective-phrase");
    if (hasPattern(lower, /\b\w+ly\b|\b(however|therefore|meanwhile|moreover)\b/)) detected.push("adverbial-phrase");
    if (hasPattern(sentence, /\w+,\s+\w+(?:,\s+\w+)*,?\s+(and|or)\s+\w+/)) detected.push("coordinated-list");
    return uniqueValues(detected);
}
function detectStructuralRelationTypes(sentence) {
    const lower = sentence.toLowerCase();
    const detected = [];
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
function detectSentenceLayers(sentence) {
    return {
        layer1: detectCoreClauseTypes(sentence),
        layer2: detectModifierTypes(sentence),
        layer3: detectPhraseTypes(sentence),
        layer4: detectStructuralRelationTypes(sentence)
    };
}
function splitIntoSentences(text) {
    return text.replace(/\s+/g, " ").split(/(?<=[.!?])\s+(?=[A-Z\"“])/).map((sentence) => sentence.trim()).filter(Boolean);
}