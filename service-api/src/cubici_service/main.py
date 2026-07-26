"""Local development server entrypoint."""

import uvicorn


def main() -> None:
    uvicorn.run(
        "cubici_service.app:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
    )
