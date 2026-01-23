# Makefile for AIOS project

.PHONY: help install setup test lint check-governance check-all

help: ## Show this help message
	@echo "Available targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-20s %s\n", $$1, $$2}'

install: ## Install all dependencies
	npm install
	pip install -r .repo/automation/scripts/requirements.txt

setup: install ## Bootstrap: Install all dependencies and check environment requirements
	@echo "✅ Checking Node.js version..."
	@node --version || (echo "❌ Node.js not found. Please install Node.js 18+." && exit 1)
	@echo "✅ Checking npm version..."
	@npm --version || (echo "❌ npm not found. Please install npm." && exit 1)
	@echo "✅ Bootstrap complete!"

test: ## Run tests
	npm test

lint: ## Run linter
	npm run lint

check-governance: ## Run governance verification locally
	@echo "🔍 Running governance verification..."
	@TRACE_LOG=$$(find . -name "*trace*.json" -type f | head -1 || echo ""); \
	if [ -n "$$TRACE_LOG" ]; then \
		node .repo/automation/scripts/governance-verify.js \
			--trace-log "$$TRACE_LOG" \
			--hitl-file .repo/policy/HITL.md; \
	else \
		node .repo/automation/scripts/governance-verify.js \
			--hitl-file .repo/policy/HITL.md; \
	fi

check-all: lint test check-governance ## Run all checks (lint, test, governance)
