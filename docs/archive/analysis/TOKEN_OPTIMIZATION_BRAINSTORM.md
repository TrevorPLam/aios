# Token Optimization & Waste Reduction Brainstorm

**Date:** 2026-01-24
**Context:** Analysis of token usage during task execution revealed opportunities for optimization

---

## Current Issues Identified

### Token Waste
1. **Reading entire large files** when only small sections needed
   - Example: PHASE_0_HANDOFF.md (816 lines) when only testing section needed
   - Example: schema.ts, routes.ts read in full when only specific functions needed
   - **Solution**: Use `read_file` with `offset` and `limit` parameters for large files

2. **Multiple file reads** of the same files
   - Example: storage.ts, routes.ts read multiple times
   - Example: Same files read in different contexts without caching

3. **Overly broad searches** returning too many results
   - Example: Searching entire codebase when directory-specific would suffice
   - Example: Not using specific enough search queries

4. **Redundant context gathering**
   - Reading files that were already read in previous steps
   - Not reusing information already in context

---

## Optimization Strategies

### 1. File Reading Optimization

#### Strategy: Chunked Reading
- **Problem**: Reading 800+ line files when only 50 lines needed
- **Solution**: Use `read_file` with `offset` and `limit` parameters
- **Implementation**:
  - First read: Get file size and structure (first 50 lines)
  - Targeted read: Read only needed sections
  - Example: `read_file(file, offset=400, limit=50)` instead of full read

#### Strategy: File Caching
- **Problem**: Re-reading same files multiple times
- **Solution**: Track recently read files in conversation context
- **Implementation**:
  - Before reading: Check if file was read recently
  - Cache key: File path + modification time
  - Cache duration: Current conversation session

#### Strategy: Index Files
- **Problem**: Need to understand file structure before reading
- **Solution**: Create index files that map functions/classes to line numbers
- **Implementation**:
  - `INDEX.json` files already exist - enhance them
  - Add line number ranges for major functions/classes
  - Use index to jump directly to relevant sections

### 2. Search Optimization

#### Strategy: Targeted Directory Searches
- **Problem**: Searching entire codebase when directory-specific would work
- **Solution**: Always specify `target_directories` parameter
- **Implementation**:
  - Start with most specific directory
  - Expand search only if needed
  - Example: Search `apps/api/__tests__/` before searching entire codebase

#### Strategy: Specific Query Patterns
- **Problem**: Broad queries return too many results
- **Solution**: Use specific, focused queries
- **Implementation**:
  - Ask complete questions: "How does X work?" not "X"
  - Include context: "Where is analytics queue implemented?"
  - Use file type filters when appropriate

#### Strategy: Combine Related Searches
- **Problem**: Multiple separate searches for related topics
- **Solution**: Batch related searches together
- **Implementation**:
  - Group searches by topic
  - Use parallel tool calls for independent searches
  - Example: Search for "queue" and "retry" together if both needed

### 3. Context Management

#### Strategy: Progressive Context Building
- **Problem**: Gathering all context upfront, much unused
- **Solution**: Build context incrementally as needed
- **Implementation**:
  - Start with minimal context (task description)
  - Read additional files only when needed
  - Don't read "just in case" files

#### Strategy: Context Reuse
- **Problem**: Not reusing information already gathered
- **Solution**: Reference previous findings instead of re-reading
- **Implementation**:
  - Document findings in conversation
  - Reference previous tool call results
  - Only re-read if information might have changed

#### Strategy: Selective Documentation Reading
- **Problem**: Reading entire documentation files
- **Solution**: Read documentation sections, not entire files
- **Implementation**:
  - Use grep to find relevant sections first
  - Read only needed sections
  - Example: Read "Testing" section of handoff doc, not entire doc

### 4. Tool Call Optimization

#### Strategy: Parallel Tool Calls
- **Problem**: Sequential tool calls when parallel possible
- **Solution**: Batch independent operations
- **Implementation**:
  - Read multiple files in parallel
  - Run multiple searches in parallel
  - Only wait for dependencies

#### Strategy: Tool Selection
- **Problem**: Using wrong tool for the job
- **Solution**: Choose most efficient tool
- **Implementation**:
  - Use `grep` for exact string matches (faster than search)
  - Use `glob_file_search` for file finding (faster than search)
  - Use `codebase_search` only for semantic queries

#### Strategy: Result Filtering
- **Problem**: Getting too many results, processing all
- **Solution**: Filter results early
- **Implementation**:
  - Use `head_limit` parameter to limit results
  - Use `output_mode: "files_with_matches"` when only paths needed
  - Filter results before reading files

### 5. Workflow Optimization

#### Strategy: Task-Specific Context Files
- **Problem**: Reading many files to understand task context
- **Solution**: Create task-specific context files
- **Implementation**:
  - `.agent-context.json` files (already mentioned in AGENTS.json)
  - Task handoff documents (like PHASE_0_HANDOFF.md)
  - Quick reference guides for common tasks

#### Strategy: Pre-computed Indexes
- **Problem**: Searching for file locations repeatedly
- **Solution**: Maintain file location indexes
- **Implementation**:
  - `INDEX.json` files (already exist)
  - Test index (TASK-087 will create)
  - Function/class location maps

#### Strategy: Documentation Summaries
- **Problem**: Long documentation files take many tokens
- **Solution**: Create summary versions
- **Implementation**:
  - Executive summaries at top of long docs
  - Quick reference sections
  - "TL;DR" sections for common questions

---

## Specific Recommendations

### Immediate Actions (Low Effort, High Impact)

1. **Always use offset/limit for large files**
   - Check file size first if possible
   - Read in 100-200 line chunks
   - Only read full file if necessary

2. **Specify target directories in searches**
   - Start with most specific directory
   - Expand only if needed

3. **Use grep for exact matches**
   - Faster than semantic search
   - More precise results

4. **Batch parallel tool calls**
   - Read multiple files together
   - Search multiple topics together

### Medium-Term Improvements

1. **Enhance INDEX.json files**
   - Add line number ranges for functions
   - Add quick reference sections
   - Link to related files

2. **Create test index** (TASK-087)
   - Map tests to source files
   - Document test coverage
   - Quick lookup for test locations

3. **Improve task handoff docs**
   - Add "Quick Start" sections
   - Add "Key Files" sections
   - Add "Common Questions" FAQ

### Long-Term Infrastructure

1. **File reading cache**
   - Track recently read files
   - Cache file contents per session
   - Invalidate on file changes

2. **Smart context loading**
   - Load context incrementally
   - Track what's already loaded
   - Avoid redundant reads

3. **Documentation summaries**
   - Auto-generate summaries
   - Extract key sections
   - Create quick reference guides

---

## Token Usage Targets

### Current Usage (Estimated)
- TASK-085: ~15K tokens
- TASK-058: ~8K tokens  
- TASK-016: ~5K tokens
- **Total: ~28K tokens**

### Optimization Goals
- **Reduce by 30-40%**: Target ~18-20K tokens for similar tasks
- **Faster execution**: Fewer tool calls = faster responses
- **Better focus**: Less noise, more relevant information

### Measurement
- Track token usage per task
- Compare before/after optimization
- Identify highest-impact optimizations

---

## Implementation Priority

### High Priority (Do First)
1. ✅ Use offset/limit for large files
2. ✅ Specify target directories in searches
3. ✅ Batch parallel tool calls
4. ✅ Use grep for exact matches

### Medium Priority (Next Sprint)
1. Enhance INDEX.json files with line numbers
2. Create test index (TASK-087)
3. Improve task handoff documentation structure
4. Create quick reference guides

### Low Priority (Future)
1. File reading cache system
2. Smart context loading
3. Auto-generated documentation summaries
4. Token usage analytics

---

## Examples of Optimized Workflow

### Before (Current)
```
1. Read entire PHASE_0_HANDOFF.md (816 lines) - ~8K tokens
2. Read entire schema.ts (429 lines) - ~4K tokens
3. Read entire routes.ts (785 lines) - ~7K tokens
4. Search entire codebase for "analytics test" - ~2K tokens
Total: ~21K tokens
```

### After (Optimized)
```
1. Read PHASE_0_HANDOFF.md lines 240-300 (testing section) - ~1K tokens
2. Read schema.ts lines 400-430 (analytics schemas) - ~0.5K tokens
3. Read routes.ts lines 750-780 (analytics endpoint) - ~0.5K tokens
4. Search apps/api/__tests__/ for "analytics" - ~0.5K tokens
Total: ~2.5K tokens (88% reduction!)
```

---

## Success Metrics

- **Token reduction**: 30-40% reduction in token usage
- **Speed improvement**: 20-30% faster task execution
- **Quality maintenance**: No reduction in code quality or test coverage
- **Developer experience**: Easier to find information, clearer documentation

---

## Notes

- These optimizations should not compromise code quality
- Some optimizations require infrastructure changes (caching, indexes)
- Start with low-effort, high-impact changes
- Measure impact and iterate
