from functools import cache
import lemminflect  # type:ignore[import-untyped]
from engple.utils.spacy import load_spacy_model


@cache
def _get_spacy_nlp():
    return load_spacy_model()


def generate_variations(expression: str) -> list[str]:
    """Generate variations of a given expression by inflecting its words.

    Args:
        expression: The input expression for which to generate variations.

    Returns:
        A list of generated variations.
    """
    if not expression or not expression.strip():
        return []

    expression = expression.strip()
    if " " in expression:
        return _handle_multiple_words(expression)
    else:
        return _handle_single_word(expression)


def _is_reasonable_word(inflection: str, original: str) -> bool:
    """Basic validation to filter out obvious nonsense inflections."""
    if not inflection:
        return False

    inf = inflection.strip()
    orig = original.strip()

    # Too long is suspicious
    if len(inf) > 30:
        return False

    lower_inf = inf.lower()
    lower_orig = orig.lower()

    # Don't add the exact same word
    if lower_inf == lower_orig:
        return True

    # Avoid repeated suffix patterns like 'runninged'
    if lower_inf.endswith("ed") and lower_inf[:-2].endswith("ed"):
        return False

    # Filter out very short non-words
    if len(lower_inf) <= 1:
        return False

    # Allow reasonable verb inflections and plurals
    return True


def _handle_single_word(word: str) -> list[str]:
    """Generate reasonable variations for a single word."""
    variations = {word}

    if not word or not word.strip():
        return []

    word = word.strip()

    # For adverbs ending with -ly, don't inflect
    if word.lower().endswith("ly"):
        return [word]

    pos = None
    spacy_nlp = _get_spacy_nlp()
    doc = spacy_nlp(word)
    if len(doc) > 0:
        pos = doc[0].pos_

    # If spaCy clearly identifies it as a noun, only generate noun forms
    if pos == "NOUN":
        inflections = lemminflect.getInflection(word, tag="NNS")
        if inflections:
            for inf in inflections:
                if _is_reasonable_word(inf, word):
                    variations.add(inf)
        return list(variations)

    # If spaCy clearly identifies it as a verb, only generate verb forms
    if pos == "VERB":
        verb_tags = ["VBD", "VBG", "VBN", "VBZ"]
        for tag in verb_tags:
            inflections = lemminflect.getInflection(word, tag=tag)
            if inflections:
                for inf in inflections:
                    if _is_reasonable_word(inf, word):
                        variations.add(inf)
        return list(variations)

    # For unknown or ambiguous POS, try both verb and noun forms
    # but be more conservative about what we include
    if pos is None or pos in ["PRON", "DET", "ADP", "CONJ", "PART", "INTJ", "X"]:
        # Try verb forms
        verb_tags = ["VBD", "VBG", "VBN", "VBZ"]
        for tag in verb_tags:
            inflections = lemminflect.getInflection(word, tag=tag)
            if inflections:
                for inf in inflections:
                    if _is_reasonable_word(inf, word):
                        variations.add(inf)

        # Try noun forms
        inflections = lemminflect.getInflection(word, tag="NNS")
        if inflections:
            for inf in inflections:
                if _is_reasonable_word(inf, word):
                    variations.add(inf)

    return list(variations)


def _handle_multiple_words(phrase: str) -> list[str]:
    """Handle multi-word expressions (phrasal verbs) by inflecting the main verb only."""
    words = phrase.split()
    if not words:
        return []

    verb_token = None
    verb_index = None

    spacy_nlp = _get_spacy_nlp()
    doc = spacy_nlp(phrase)
    # Find the leftmost AUX/VERB token and map it to the original word index
    candidates: list[tuple[int, str]] = []
    for token in doc:
        if token.pos_ in ("AUX", "VERB"):
            tok_lower = token.text.lower()
            for i, word in enumerate(words):
                if word.lower() == tok_lower:
                    candidates.append((i, words[i]))
                    break
    if candidates:
        candidates.sort(key=lambda x: x[0])
        verb_index, verb_token = candidates[0]

    # If no verb found, default to first word
    if verb_index is None:
        verb_index = 0
        verb_token = words[0]

    before = words[:verb_index]
    after = words[verb_index + 1 :]

    variations = {phrase}
    verb_str = verb_token if verb_token is not None else words[0]
    verb_forms = _handle_single_word(verb_str)
    for vf in verb_forms:
        # Only add if the inflected verb is different from the original verb
        if vf != verb_str:
            new_words = before + [vf] + after
            phrase_variant = " ".join(new_words)
            variations.add(phrase_variant)
    # Always include the original phrase
    variations.add(phrase)

    return list(variations)
