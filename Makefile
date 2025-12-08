# ===== Dev (existing docker-compose.yml) =====

dev-up:
	docker compose up --build

dev-down:
	docker compose down

dev-logs:
	docker compose logs -f api

# ===== Prod (docker-compose.prod.yml) =====

prod-build:
	docker compose -f docker-compose.prod.yml build

prod-up:
	docker compose -f docker-compose.prod.yml up -d

prod-down:
	docker compose -f docker-compose.prod.yml down

prod-logs:
	docker compose -f docker-compose.prod.yml logs -f api

prod-ps:
	docker compose -f docker-compose.prod.yml ps

prod-restart:
	docker compose -f docker-compose.prod.yml restart api
