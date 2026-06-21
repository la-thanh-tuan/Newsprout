"use strict";
const layerPriority = {
    1: 10,
    4: 20,
    2: 30,
    3: 40
};
const subtypePriority = {
    "active-svo": 1,
    "modal-predicate": 1,
    "passive-voice": 1,
    "content-clause-complement": 2,
    "correlative-conjunction": 1,
    "contrast": 2,
    "cause-effect": 2,
    "purpose": 2,
    "result": 2,
    "conditional-clause": 2,
    "relative-clause": 3,
    "subordinate-clause": 3,
    "prepositional-range": 4,
    "between-balance": 4,
    "purpose-modifier": 5,
    "manner-modifier": 6,
    "prepositional-modifier": 7,
    "coordinated-list": 5,
    "verb-phrase": 6,
    "noun-phrase": 7
};
function normalizeForMatch(value) {
    return value.toLowerCase().replace(/[“”"']/g, "").trim();
}
function signalToRegex(signal) {
    const normalized = normalizeForMatch(signal);
    if (!normalized || normalized.includes("+") || normalized.includes("/") || normalized.includes("...") || normalized.includes("v-ing") || normalized.includes("v-ed")) {
        return null;
    }
    const escaped = normalized.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`\\b${escaped}\\b`, "i");
}
function getMatchedSignals(sentence, signals) {
    return signals.filter((signal) => {
        const regex = signalToRegex(signal);
        return regex ? regex.test(sentence) : false;
    });
}
function inferConfidence(subtype, matchedSignals) {
    if (subtype === "active-svo" && matchedSignals.length === 0)
        return "low";
    if (matchedSignals.length >= 2)
        return "high";
    if (matchedSignals.length === 1)
        return "medium";
    return "low";
}
function getPatternPriority(pattern) {
    return layerPriority[pattern.layer] + (subtypePriority[pattern.type] ?? 9);
}
function toDetectedPattern(pattern, sentence) {
    const matchedSignals = getMatchedSignals(sentence, pattern.signals);
    return {
        layer: pattern.layer,
        subtype: pattern.type,
        grammarName: pattern.grammarName,
        vietnameseName: pattern.vietnameseName,
        pattern: pattern.pattern,
        sourceText: sentence,
        functionLabel: pattern.functionLabel,
        signals: pattern.signals,
        matchedSignals,
        confidence: inferConfidence(pattern.type, matchedSignals),
        priority: getPatternPriority(pattern)
    };
}
function sortDetectedPatterns(patterns) {
    return [...patterns].sort((a, b) => {
        if (a.priority !== b.priority)
            return a.priority - b.priority;
        if (a.layer !== b.layer)
            return a.layer - b.layer;
        return a.vietnameseName.localeCompare(b.vietnameseName, "vi");
    });
}
function createEmptyPatternsByLayer() {
    return {
        1: [],
        2: [],
        3: [],
        4: []
    };
}
function groupPatternsByLayer(patterns) {
    const grouped = createEmptyPatternsByLayer();
    patterns.forEach((pattern) => {
        grouped[pattern.layer].push(pattern);
    });
    return grouped;
}
function detectSentencePatterns(sentence) {
    const detected = detectSentenceLayers(sentence);
    const patterns = [
        ...detected.layer1.map((type) => toDetectedPattern(getCoreClausePattern(type), sentence)),
        ...detected.layer2.map((type) => toDetectedPattern(getModifierPattern(type), sentence)),
        ...detected.layer3.map((type) => toDetectedPattern(getPhrasePattern(type), sentence)),
        ...detected.layer4.map((type) => toDetectedPattern(getGrammarPattern(type), sentence))
    ];
    return sortDetectedPatterns(patterns);
}
function analyzeSentence(sentence, sentenceIndex = 0) {
    const patterns = detectSentencePatterns(sentence);
    return {
        sentenceIndex,
        sentence,
        patterns,
        patternsByLayer: groupPatternsByLayer(patterns)
    };
}
function analyzeText(text) {
    const sentenceResults = splitIntoSentences(text).map((sentence, index) => analyzeSentence(sentence, index));
    const allPatterns = sortDetectedPatterns(sentenceResults.flatMap((result) => result.patterns));
    const coveredLayers = Array.from(new Set(allPatterns.map((pattern) => pattern.layer))).sort();
    return {
        sentences: sentenceResults,
        allPatterns,
        coverage: {
            sentenceCount: sentenceResults.length,
            detectedPatternCount: allPatterns.length,
            coveredLayers,
            coverageRatio: coveredLayers.length / 4
        }
    };
}
