#!/usr/bin/env node
// Generate INDEX.toon file for a folder
// Usage: node scripts/generate-index-json.mjs [folder_path]

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const folderPath = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();

// Directories to ignore
const IGNORE_DIRS = new Set([
  "node_modules",
  ".git",
  ".expo",
  ".metro-cache",
  "__pycache__",
  ".next",
  "dist",
  "build",
  ".cache",
  ".turbo",
  "coverage",
  ".nyc_output",
]);

// Files to ignore
const IGNORE_FILES = new Set([
  "INDEX.json",
  "INDEX.toon",
  "INDEX.md",
  ".DS_Store",
  "Thumbs.db",
  ".gitkeep",
]);

// File extensions to include
const INCLUDE_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".py",
  ".md",
  ".json",
  ".yaml",
  ".yml",
  ".sh",
  ".mjs",
  ".css",
  ".html",
  ".sql",
]);

function shouldIncludeFile(fileName) {
  if (IGNORE_FILES.has(fileName)) return false;
  const ext = path.extname(fileName);
  return ext === "" || INCLUDE_EXTENSIONS.has(ext);
}

// Important dot-directories that should be included in indexes
const ALLOWED_DOT_DIRS = new Set([".repo", ".github", ".husky", ".vscode"]);

function shouldIncludeDir(dirName) {
  // Allow specific important dot-directories
  if (dirName.startsWith(".")) {
    return ALLOWED_DOT_DIRS.has(dirName);
  }
  // Exclude ignored directories
  return !IGNORE_DIRS.has(dirName);
}

function extractFunctions(content, filePath) {
  const functions = [];
  const lines = content.split("\n");
  
  if (filePath.endsWith(".ts") || filePath.endsWith(".tsx") || filePath.endsWith(".js") || filePath.endsWith(".jsx")) {
    // Match exported functions and classes
    const patterns = [
      /^export\s+(?:async\s+)?function\s+(\w+)\s*\(/gm,
      /^export\s+class\s+(\w+)/gm,
      /^export\s+const\s+(\w+)\s*=\s*(?:async\s+)?\(/gm,
      /^export\s+const\s+(\w+)\s*=\s*(?:async\s+)?function/gm,
    ];
    
    patterns.forEach((pattern) => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const name = match[1];
        const lineNum = content.substring(0, match.index).split("\n").length;
        const line = lines[lineNum - 1] || "";
        
        // Extract JSDoc comment if present
        let description = "";
        let snippet = "";
        if (lineNum > 1) {
          const beforeLine = lines.slice(Math.max(0, lineNum - 5), lineNum - 1).join("\n");
          const jsdocMatch = beforeLine.match(/(\/\*\*[\s\S]*?\*\/)\s*$/);
          if (jsdocMatch) {
            description = jsdocMatch[1]
              .replace(/\/\*\*|\*\//g, "")
              .replace(/\*\s*/g, "")
              .trim()
              .slice(0, 200);
          }
        }
        
        // Extract function snippet (next 5-10 lines)
        const startIdx = match.index;
        const endIdx = Math.min(content.length, startIdx + 500);
        snippet = content.substring(startIdx, endIdx).split("\n").slice(0, 8).join("\n").trim();
        
        functions.push({
          name,
          line: lineNum,
          description: description || undefined,
          snippet: snippet.length > 0 ? snippet : undefined,
        });
      }
    });
  } else if (filePath.endsWith(".py")) {
    // Python classes and functions
    const classPattern = /^class\s+(\w+)/gm;
    const funcPattern = /^def\s+(\w+)\s*\(/gm;
    
    [classPattern, funcPattern].forEach((pattern) => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const name = match[1];
        const lineNum = content.substring(0, match.index).split("\n").length;
        const startIdx = match.index;
        const endIdx = Math.min(content.length, startIdx + 300);
        const snippet = content.substring(startIdx, endIdx).split("\n").slice(0, 6).join("\n").trim();
        
        functions.push({
          name,
          line: lineNum,
          snippet: snippet.length > 0 ? snippet : undefined,
        });
      }
    });
  }
  
  return functions.slice(0, 15); // Limit to 15 most important functions
}

function getFileInfo(filePath, basePath) {
  const stats = fs.statSync(filePath);
  const relativePath = path.relative(basePath, filePath).replace(/\\/g, "/");
  const ext = path.extname(filePath);
  const name = path.basename(filePath);

  let type = "file";
  if (ext) {
    type = ext.slice(1);
  }

  let keyClasses = [];
  let lineCount = 0;
  let description = "";
  let functions = [];
  let isCritical = false;

  try {
    const content = fs.readFileSync(filePath, "utf8");
    lineCount = content.split("\n").length;

    // Extract key classes/functions based on file type
    if (filePath.endsWith(".py")) {
      const classMatches = content.match(/^class\s+(\w+)/gm);
      if (classMatches) {
        keyClasses = classMatches.map((m) => m.replace(/^class\s+/, "")).slice(0, 10);
      }
    } else if (filePath.endsWith(".ts") || filePath.endsWith(".tsx")) {
      const exportMatches = content.match(/^export\s+(?:const|function|class|interface|type)\s+(\w+)/gm);
      if (exportMatches) {
        keyClasses = exportMatches
          .map((m) => m.replace(/^export\s+(?:const|function|class|interface|type)\s+/, ""))
          .slice(0, 10);
      }
    } else if (filePath.endsWith(".js") || filePath.endsWith(".jsx")) {
      const exportMatches = content.match(/^export\s+(?:const|function|class)\s+(\w+)/gm);
      if (exportMatches) {
        keyClasses = exportMatches
          .map((m) => m.replace(/^export\s+(?:const|function|class)\s+/, ""))
          .slice(0, 10);
      }
    }

    // Extract functions with details
    functions = extractFunctions(content, filePath);
    
    // Determine if file is critical (entry points, main files, configs)
    const criticalPatterns = [
      /^index\.(ts|tsx|js|jsx)$/i,
      /^main\.(ts|tsx|js|jsx)$/i,
      /^app\.(ts|tsx|js|jsx)$/i,
      /^server\.(ts|tsx|js|jsx)$/i,
      /^routes?\.(ts|tsx|js|jsx)$/i,
      /^config\.(ts|tsx|js|jsx|json)$/i,
      /^package\.json$/i,
      /^tsconfig\.json$/i,
      /AGENTS\.(toon|json|md)$/i,
      /README\.md$/i,
    ];
    isCritical = criticalPatterns.some((pattern) => pattern.test(name));

    // Try to extract description from comments or first line
    if (content.length > 0) {
      const firstLine = content.split("\n")[0];
      if (firstLine.includes("//") || firstLine.includes("#")) {
        description = firstLine
          .replace(/^[#/]*\s*/, "")
          .replace(/^\*\s*/, "")
          .trim()
          .slice(0, 100);
      }
      // Also try JSDoc at top of file
      const topJsdoc = content.match(/^\/\*\*[\s\S]*?\*\/\s*/);
      if (topJsdoc && !description) {
        description = topJsdoc[0]
          .replace(/\/\*\*|\*\//g, "")
          .replace(/\*\s*/g, "")
          .trim()
          .slice(0, 150);
      }
    }
  } catch (e) {
    // Ignore read errors
  }

  const fileInfo = {
    path: relativePath,
    type,
    key_classes: keyClasses.length > 0 ? keyClasses : undefined,
    line_count: lineCount,
    size_bytes: stats.size,
    description: description || undefined,
    critical: isCritical || undefined,
  };
  
  // Don't include functions in file info - they'll be in important_functions section
  return fileInfo;
}

function getSubfolders(dirPath) {
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isDirectory())
      .filter((entry) => shouldIncludeDir(entry.name))
      .map((entry) => {
        const indexPath = path.join(dirPath, entry.name, "INDEX.toon");
        const hasIndex = fs.existsSync(indexPath);
        return {
          path: entry.name,
          purpose: hasIndex ? "See INDEX.toon for details" : "Directory",
          indexFile: hasIndex ? `${entry.name}/INDEX.toon` : undefined,
        };
      });
  } catch (e) {
    return [];
  }
}

function getFiles(dirPath) {
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile())
      .filter((entry) => shouldIncludeFile(entry.name))
      .map((entry) => getFileInfo(path.join(dirPath, entry.name), dirPath));
  } catch (e) {
    return [];
  }
}

function getDependencies(folderPath) {
  // Placeholder for dependency analysis
  return {
    imports: [],
    imported_by: [],
  };
}

function jsonToToon(obj, indent = 0) {
  const indentStr = "  ".repeat(indent);
  let result = "";

  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) continue;

    if (Array.isArray(value)) {
      if (value.length === 0) {
        result += `${indentStr}${key}: []\n`;
      } else if (typeof value[0] === "object" && value[0] !== null) {
        // Array of objects - check if any have multiline snippets
        const hasMultilineSnippets = value.some((item) => {
          return item.snippet && typeof item.snippet === "string" && item.snippet.includes("\n");
        });
        
        if (hasMultilineSnippets && key === "important_functions") {
          // Format functions with multiline snippets for readability
          result += `${indentStr}${key}[${value.length}]:\n`;
          value.forEach((item) => {
            result += `${indentStr}  - name: ${item.name || ""}\n`;
            if (item.file) result += `${indentStr}    file: ${item.file}\n`;
            if (item.line) result += `${indentStr}    line: ${item.line}\n`;
            if (item.description) {
              const desc = item.description.replace(/\n/g, " ").slice(0, 200);
              result += `${indentStr}    description: "${desc.replace(/"/g, '\\"')}"\n`;
            }
            if (item.snippet) {
              const snippetLines = item.snippet.split("\n").slice(0, 10);
              result += `${indentStr}    snippet: |\n`;
              snippetLines.forEach((line) => {
                result += `${indentStr}      ${line}\n`;
              });
              if (item.snippet.split("\n").length > 10) {
                result += `${indentStr}      ...\n`;
              }
            }
          });
        } else {
          // Standard format for arrays without multiline content
          const fields = Object.keys(value[0]);
          result += `${indentStr}${key}[${value.length}]{${fields.join(",")}}:\n`;
          value.forEach((item) => {
            const values = fields.map((f) => {
              const v = item[f];
              if (v === undefined || v === null) return "";
              if (typeof v === "string") {
                if (v.includes("\n")) {
                  // Multiline string - use block scalar notation
                  const lines = v.split("\n").slice(0, 5);
                  return `"${lines.join("\\n")}${v.split("\n").length > 5 ? "\\n..." : ""}"`;
                }
                if (v.includes(",") || v.includes(":") || v.length > 80) {
                  return `"${v.replace(/"/g, '\\"')}"`;
                }
                return v;
              }
              if (Array.isArray(v)) {
                if (v.length === 0) return "[]";
                return `[${v.join(",")}]`;
              }
              if (typeof v === "object") {
                const entries = Object.entries(v).filter(([_, val]) => val !== undefined && val !== null);
                if (entries.length === 0) return "{}";
                const objStr = entries
                  .map(([k, val]) => {
                    const valStr = typeof val === "string" ? `"${val.replace(/"/g, '\\"')}"` : String(val);
                    return `${k}:${valStr}`;
                  })
                  .join(",");
                return `{${objStr}}`;
              }
              return String(v);
            });
            result += `${indentStr}  ${values.join(",")}\n`;
          });
        }
      } else {
        // Array of primitives
        result += `${indentStr}${key}[${value.length}]: ${value.map((v) => {
          if (typeof v === "string" && (v.includes(",") || v.includes(":") || v.includes("\n"))) {
            return `"${v.replace(/"/g, '\\"')}"`;
          }
          return String(v);
        }).join(", ")}\n`;
      }
    } else if (typeof value === "object") {
      // Nested object
      result += `${indentStr}${key}:\n`;
      result += jsonToToon(value, indent + 1);
    } else {
      // Primitive value
      if (typeof value === "string" && (value.includes(",") || value.includes(":") || value.includes("\n"))) {
        result += `${indentStr}${key}: "${value.replace(/"/g, '\\"')}"\n`;
      } else {
        result += `${indentStr}${key}: ${String(value)}\n`;
      }
    }
  }

  return result;
}

function generateIndexJson(folderPath) {
  const folderName = path.basename(folderPath);
  const relativePath = path.relative(process.cwd(), folderPath).replace(/\\/g, "/") || ".";

  const subfolders = getSubfolders(folderPath);
  const files = getFiles(folderPath);

  // Determine purpose based on folder
  let purpose = "Directory contents";
  if (folderName === "api") {
    purpose = "API server files and directories";
  } else if (folderName === "mobile") {
    purpose = "Mobile application files and directories";
  } else if (folderName === "web") {
    purpose = "Web application files and directories";
  } else if (folderName === "apps") {
    purpose = "Application shells (mobile, API, web)";
  } else if (folderName === "assets") {
    purpose = "Asset files (images, icons, etc.)";
  } else if (folderName === "attached_assets") {
    purpose = "Attached assets and generated content";
  } else if (folderName === "docs") {
    purpose = "Documentation files and directories";
  } else if (folderName === "frontend") {
    purpose = "Frontend code and components";
  } else if (folderName === "packages") {
    purpose = "Shared packages (features, platform, design-system, contracts)";
  } else if (folderName === "scripts") {
    purpose = "Automation and utility scripts";
  } else if (relativePath === ".") {
    purpose = "Master index of all directories in the repository";
  } else if (folderName === ".repo" || relativePath === ".repo") {
    purpose = "Governance framework directory (policies, tasks, templates, logs, traces)";
  }

  const index = {
    file: "INDEX.toon",
    folder: relativePath,
    purpose,
    generated_at: new Date().toISOString(),
    files: files,
    subfolders: subfolders,
    dependencies: getDependencies(folderPath),
  };

  // Add critical files section
  const criticalFiles = files.filter((f) => f.critical).map((f) => ({
    path: f.path,
    type: f.type,
    description: f.description,
    key_classes: f.key_classes,
  }));
  if (criticalFiles.length > 0) {
    index.critical_files = criticalFiles;
  }

  // Add important functions section (from all files)
  const importantFunctions = [];
  files.forEach((file) => {
    try {
      const filePath = path.join(folderPath, file.path);
      if (fs.existsSync(filePath) && (filePath.endsWith(".ts") || filePath.endsWith(".tsx") || filePath.endsWith(".js") || filePath.endsWith(".jsx") || filePath.endsWith(".py"))) {
        const content = fs.readFileSync(filePath, "utf8");
        const funcs = extractFunctions(content, filePath);
        funcs.forEach((func) => {
          importantFunctions.push({
            name: func.name,
            file: file.path,
            line: func.line,
            description: func.description || undefined,
            snippet: func.snippet || undefined,
          });
        });
      }
    } catch (e) {
      // Ignore errors
    }
  });
  if (importantFunctions.length > 0) {
    // Sort by file path, then by line number
    importantFunctions.sort((a, b) => {
      if (a.file !== b.file) return a.file.localeCompare(b.file);
      return a.line - b.line;
    });
    index.important_functions = importantFunctions.slice(0, 30); // Limit to 30 most important
  }

  // Add quick navigation for root
  if (relativePath === ".") {
    index.quickNavigation = {
      applications: [
        {
          name: "Mobile App",
          path: "apps/mobile/",
          description: "React Native/Expo mobile application",
          indexFile: "apps/mobile/INDEX.toon",
        },
        {
          name: "API Server",
          path: "apps/api/",
          description: "Node.js/Express backend API",
          indexFile: "apps/api/INDEX.toon",
        },
        {
          name: "Web App",
          path: "apps/web/",
          description: "Web application",
          indexFile: "apps/web/INDEX.toon",
        },
      ],
      packages: [
        {
          name: "Features",
          path: "packages/features/",
          description: "Feature modules (vertical slices)",
        },
        {
          name: "Platform",
          path: "packages/platform/",
          description: "Platform adapters and primitives",
        },
        {
          name: "Design System",
          path: "packages/design-system/",
          description: "Shared UI components",
        },
        {
          name: "Contracts",
          path: "packages/contracts/",
          description: "Shared types and schemas",
        },
      ],
      supportingDirectories: [
        {
          name: "Documentation",
          path: "docs/",
          description: "Comprehensive documentation",
          indexFile: "docs/INDEX.toon",
        },
        {
          name: "Scripts",
          path: "scripts/",
          description: "Automation scripts",
          indexFile: "scripts/INDEX.toon",
        },
        {
          name: "Assets",
          path: "assets/",
          description: "Asset files",
          indexFile: "assets/INDEX.toon",
        },
      ],
    };
  }

  return index;
}

function generateIndex(folderPath) {
  try {
    if (!fs.existsSync(folderPath)) {
      console.warn(`⚠️  Directory not found: ${folderPath}`);
      return false;
    }

    const indexPath = path.join(folderPath, "INDEX.toon");
    const index = generateIndexJson(folderPath);
    
    // Convert to .toon format
    const toonContent = `type: directory_index
file: INDEX.toon
filepath: ${index.folder === "." ? "INDEX.toon" : path.join(index.folder, "INDEX.toon").replace(/\\/g, "/")}
$schema: http://json-schema.org/draft-07/schema#
version: 1.0.0
purpose: ${index.purpose}
generated_at: ${index.generated_at}

${jsonToToon({
  folder: index.folder,
  files: index.files,
  subfolders: index.subfolders,
  dependencies: index.dependencies,
  ...(index.critical_files ? { critical_files: index.critical_files } : {}),
  ...(index.important_functions ? { important_functions: index.important_functions } : {}),
  ...(index.quickNavigation ? { quickNavigation: index.quickNavigation } : {}),
})}`;

    fs.writeFileSync(indexPath, toonContent, "utf8");
    console.log(`✅ Generated INDEX.toon for ${folderPath}`);
    return true;
  } catch (error) {
    console.error(`❌ Error generating INDEX.toon for ${folderPath}:`, error.message);
    return false;
  }
}

// List of directories that should have INDEX.toon files
const INDEX_DIRECTORIES = [
  ".",
  "apps",
  "apps/api",
  "apps/mobile",
  "apps/web",
  "assets",
  "attached_assets",
  "docs",
  "frontend",
  "packages",
  "scripts",
  ".repo", // Governance directory - important for agent navigation
];

function generateAllIndexes() {
  const repoRoot = process.cwd();
  let successCount = 0;
  let failCount = 0;

  INDEX_DIRECTORIES.forEach((dir) => {
    const fullPath = path.join(repoRoot, dir);
    if (generateIndex(fullPath)) {
      successCount++;
    } else {
      failCount++;
    }
  });

  console.log(`\n📊 Summary: ${successCount} generated, ${failCount} failed`);
  return failCount === 0;
}

// Main execution
const resolvedPath = path.resolve(folderPath);
const repoRoot = process.cwd();
const relativePath = path.relative(repoRoot, resolvedPath).replace(/\\/g, "/");

// If it's a specific directory that's not in our list, generate just that one
if (folderPath && folderPath !== "." && folderPath !== process.cwd() && !INDEX_DIRECTORIES.includes(relativePath)) {
  generateIndex(resolvedPath);
} else {
  // Generate all indexes
  generateAllIndexes();
}
