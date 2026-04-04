---
name: narrative-macro-architecture
description: Use when editing any macro-driven codebase that should keep dirty imperative work inside macros and preserve the authored source as a linear, semantic, narrative construction of artifacts, structures, and system concerns.
---

# Narrative Macro Architecture

Use this skill when the code should read like a language for building a system, not like a log of plumbing decisions.

## Core Rule

Dirty imperative work belongs inside macro bodies.

The authored source should stay focused on:
- artifact declaration
- narrative construction order
- semantic composition
- structural intent
- creative system shaping

Do not leave mechanical acquisition, selector wiring, repetitive creation, or glue logic exposed in the authored source when a macro can absorb it.

## Source Shape

The authored source should read as a linear construction narrative.

Preferred reading order:
1. declare grammar at the top of the file
2. declare elemental artifacts
3. declare larger structural artifacts from those elements
4. instantiate the system in direct narrative order

Bootstrap belongs to the source narrative when the beginning of the system should be read directly.

## Macro Duties

Macros are responsible for:
- constructing application elements directly when the source is really trying to declare application items, not programming categories
- turning concrete things like topics, replies, previews, clauses, cards, prompts, stages, and panels into authored language
- generating entire code blocks, not merely labeling raw bodies
- hiding hardcoded engineering details of acquisition and wiring
- constructing complete system concerns, not only convenience snippets
- composing lower abstractions into higher abstractions
- exposing semantic entrypoints whose call sites mostly parameterize intent

If a repeated or mechanical process is still visible in the authored source, the macro layer is not high enough yet.

## Abstraction Ladder

Build abstractions from top down by semantic conjecture, and from bottom up by elemental composition.

That means:
- identify the highest meaningful system concern first
- define that concern as a macro
- let that macro internally use lower macros
- let lower macros internally perform the dirty work

Do not stop at ad hoc mid-level wrappers.

Correct direction:
- not "select nodes, prepare a section, attach snap"
- instead "create the whole section concern", with structure, state, and wiring inside the macro

- not "make helper, helper for helper, then orchestrate manually"
- instead "declare the system artifact", with the mechanics buried in macro internals

## Naming

Names must be semantic, local, and structurally meaningful.

Avoid:
- defensive namespace prefixes as a substitute for meaning
- suffix clutter like `*Artifact`, `*Utility`, `*Helper` when the semantic role can be named directly
- names that expose acquisition mechanics instead of system meaning

Prefer:
- local macro names that make sense within the file
- names that describe what the thing is in the system
- names that let the source read like a language

Locality by file is preferred over broad defensive namespacing.

## Helpers

Helpers are not protagonists.

Rules:
- do not introduce helpers when a macro should own the process
- do not leave work split into helper call stacks if the macro can express the concern whole
- extinguish helpers that only exist to carry repetitive imperative glue

If a helper exists, it should be under pressure to disappear into a more semantic macro.

## Runtime Philosophy

Runtime code follows the same rule.

Do not expose raw engineering steps such as:
- selector gathering
- element creation
- listener wiring
- state bootstrapping
- snap preparation
- acquisition choreography

These belong inside macros that construct whole runtime concerns.

The source should instantiate complete artifacts and system concerns, not narrate the plumbing used to obtain them.

## Element and Tree Construction

Elemental creation should also rise into semantic grammar.

This includes:
- HTML element creation
- DOM selection and writing
- tree construction
- component assembly
- scene structures
- layout structures
- conversation surfaces
- landing structures

Construction should move from elemental macros toward larger structural macros until the authored source becomes mainly arrangement and intent.

## Testing Implication

This philosophy improves testability.

Prefer testing:
- artifact contracts
- structural composition
- observable system behavior

Over testing:
- helper call order
- incidental call stacks
- mechanical intermediate glue

When the engineering floor is buried inside macros, artifacts become stronger test units.

## Tooling Principle

Generated and shadow outputs exist to support the authored source, not to redefine it.

Rules:
- generated files should preserve authored declarations and structure for tooling
- lint on macro bodies should see the expanded file context from the same source being linted
- tooling should avoid synthetic declaration hacks when the actual expanded source can provide the context
- typed generation should be preferred when the toolchain allows it

## Anti-Patterns

Do not:
- use cosmetic function-kind macros like `Read`, `Act`, `Flow`, or similar when they only rename raw bodies instead of owning real construction work
- keep grammar macros at the level of programming categories like `Facts`, `States`, `Values`, `Queries`, or `Writes` when they do not describe a real concern of the application or system
- make the source describe programming mechanics when it should be declaring application items and design intent
- merely wrap large raw bodies in a macro name and call that abstraction
- leave repeated imperative construction visible in the authored source
- expose acquisition details as if they were authored concepts
- create partial architecture in source and ask macros to fill only tiny holes
- use broad namespacing as a substitute for semantic naming
- keep the source centered on plumbing instead of system construction

## Success Condition

The code is in the right shape when:
- application content reads like authored domain language, not wrapped procedural categories
- the top of the file reads like grammar
- the body reads like narrative construction
- artifacts are declared before they are used
- initialization reads linearly
- macros do the heavy labor
- the source mostly parameterizes and arranges meaning
