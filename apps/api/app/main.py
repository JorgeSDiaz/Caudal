from fastapi import FastAPI

app = FastAPI(title="Caudal API")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
