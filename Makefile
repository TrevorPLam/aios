# filepath: Makefile
# purpose: Single entry point for setup and verify commands.
# last updated: 2026-01-30
# related tasks: FIRST.md Phase 1 (repo contract)

.PHONY: setup verify help

help: ## Show this help message
	@echo "Available commands:"
	@echo "  setup   - Install dependencies"
	@echo "  verify  - Run all quality checks (lint, test, build, security)"

setup: ## Install dependencies
	./scripts/setup.sh

verify: ## Run all quality checks
	./scripts/verify.sh