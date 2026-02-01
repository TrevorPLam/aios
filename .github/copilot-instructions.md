# AGENTS.md

## Required Agent Path
1. AGENTS.md (or CLAUDE.md or copilot-instructions.md or cursorrules.md)
2. AGENTS.toon
3. TODO.toon 

## REPO NAVIGATION/ARCHITECTURE
1. INDEX.toon

## TOON Format
This repository uses **TOON** (Token‑Oriented Object Notation), see below:

purpose{statement}:
Define `.toon` as the agent-native structured format for this repo: compact, deterministic, and losslessly convertible to JSON.

core_idea{summary}:
Declare schema once for uniform arrays (tables). Use indentation for nesting. Scalars are typed by simple lexical rules.

primitives[3]{name, syntax, meaning}:
object, key: value | key:\n <block>, JSON object
table, name[N]{col1,col2,...}:\n v1,v2,..., JSON array of objects
scalar, number|true|false|null|string, JSON primitive

parsing_rules[7]{rule}:
Ignore blank lines and `#` comments.
Indentation defines scope; tabs invalid; use consistent spaces.
An object entry is `key: value` or `key:` followed by an indented block.
A table header is `name[N]{cols}:` where N is expected row count; use `[*]` if unknown.
Table rows are comma-separated values; position maps to header columns 1:1.
If a row value contains a comma or leading/trailing spaces or is empty, it MUST be double-quoted.
Quoted strings allow escapes: \" \\ \n \t. Numbers/bools/null parse by exact tokens; everything else is string.

example[1]{format, content}:
TOON,
users[2]{id,name,role}:
1,Alice,admin
2,Bob,user

**Canonical agent instructions are in `agents/AGENTS.toon`.**

Now go read AGENTS.toon.
