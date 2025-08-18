---
title: "Edge Cases Test"
---

# Edge Cases and Conflicts

## Existing Links (Should NOT be modified)

I already [get rid of](/manual/link/) things regularly.
Here's another [choice](/existing/choice/) that was manually linked.
This <a href="/html/link/">get rid of</a> is also manually linked.

## Code Blocks (Should NOT be linked)

```python
def get_rid_of_items(choice_list):
    """Function to get rid of items based on choice"""
    for choice in choice_list:
        if choice == "discard":
            get_rid_of(item)
    return choice
```

```bash
# Shell command with get rid of
rm -rf get_rid_of_folder
choice="yes"
```

## Inline Code (Should NOT be linked)

Use the `get_rid_of()` function with a `choice` parameter. The `honestly` flag enables verbose mode.

## Headers (Should NOT be linked)

# How to get rid of things and make better choices

## Making the right choice when you get rid of items

### Honestly speaking about choices

## YAML Front Matter (Should NOT be linked)

The front matter above contains choice, get rid of, and [honestly](/blog/in-english/honestly/) but should not be linked.

## Word Boundaries

- getridof (no spaces - should NOT match "get rid of")
- choicemaking (compound - should NOT match "choice")
- honestly-speaking (hyphenated - should NOT match "honestly")
- "get rid of" (quoted - SHOULD match)
- (choice) (parentheses - SHOULD match)

## Case Variations (SHOULD be linked)

- Get Rid Of items properly
- CHOICE is important
- Honestly speaking
- [SOMETIMES](/blog/in-english/sometimes/) we need to decide
- TRY TO be consistent

## Multiple Occurrences (Only FIRST should be linked)

First: I need to get rid of old books.
Second: [Getting rid of](/blog/vocab-1/get-rid-of/) clutter is important.
Third: She got rid of unnecessary items.

First: Making a choice is hard.
Second: Your choice matters.
Third: Multiple [choices](/blog/in-english/choice/) [available](/blog/in-english/available/).

## Punctuation Context (SHOULD be linked)

- "get rid of" (quoted)
- get rid of! (exclamation)
- get rid of? (question)
- get rid of, (comma)
- get rid of. (period)
- (get rid of) (parentheses)

## Mixed Scenarios

Sometimes I honestly try to get rid of things, but making the right choice is difficult.

<div>
  <p>In HTML: honestly, the choice to get rid of items is personal.</p>
  <span data-answer>HTML answer: I <a href="/blog/in-english/used-to/">used to</a> <a href="/blog/in-english/collect/">collect</a> everything but <a href="/blog/in-english/decide-to/">decided to</a> get rid of excess. Sometimes tough choices are necessary.</span>
</div>

Regular markdown continues: [trying to](/blog/in-english/try-to/) [hold on to](/blog/vocab-1/hold-on-to/) everything isn't practical. [Going with](/blog/vocab-1/go-with/) minimalism was a good choice.
