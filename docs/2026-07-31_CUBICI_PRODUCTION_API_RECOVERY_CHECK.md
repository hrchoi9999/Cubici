# Cubici Production API Recovery Check

## Check Time

- 2026-07-31

## Result

- `api.cubici.co.kr` Cloudflare 530 condition is recovered.

## Verified URLs

- `https://api.cubici.co.kr/health`: 200
  - `{"status":"ok","service":"cubici-service-api","environment":"production-local","api_version":"0.1.0"}`
- `https://api.cubici.co.kr/v1/health`: 200
- `https://api.cubici.co.kr/v1/api/health`: 200
- `https://api.cubici.co.kr/docs`: 200
- `https://api.cubici.co.kr/v1/api/support/boards/notice?limit=5&offset=0`: 200
- `https://api.cubici.co.kr/v1/api/support/boards/faq?limit=5&offset=0`: 200
- `https://api.cubici.co.kr/v1/api/preferences/charges?limit=5&offset=0`: 200

## Remaining Note

- Public API-backed screens should now load their unauthenticated data.
- Authenticated flows still need separate login/session smoke if required.
