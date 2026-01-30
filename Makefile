.PHONY: setup verify help

help: ## Show this help message
	@echo "Available commands:"
	@echo "  setup   - Install dependencies"
	@echo "  verify  - Run all quality checks (lint, test, build, security)"

setup: ## Install dependencies
	@echo "Running setup..."
	@./scripts/setup.sh

verify: ## Run all quality checks
	@echo "Running verify..."
	@./scripts/verify.sh