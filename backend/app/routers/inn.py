"""Mock ИНН-lookup. Кэшируется в таблице inn_cache — один ИНН отдаёт одни
и те же данные между перезапусками.
"""
from __future__ import annotations

import json
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import InnCacheRow
from ..schemas import InnLookupResponse

router = APIRouter(tags=["inn"])


_NAMES = [
    "ООО «Стройинвест»",
    "ООО «Технологии комфорта»",
    "ООО «АльфаСервис»",
    "ООО «Прогресс-М»",
    "ООО «Городские решения»",
    "ООО «МосСтройГрупп»",
    "ООО «Невастрой»",
    "ООО «Климат-Сервис»",
]
_STREETS = ["Ленинский", "Кутузовский", "Мира", "Большая Якиманка", "Профсоюзная", "Тверской"]
_DIRECTORS = ["Иванов И.И.", "Петров П.С.", "Сидоров А.В.", "Кузнецова Е.М.", "Соколов Д.Р."]


@router.get("/inn/{inn}", response_model=InnLookupResponse)
def lookup_inn(inn: str, db: Session = Depends(get_db)) -> InnLookupResponse:
    cleaned = "".join(ch for ch in inn if ch.isdigit())
    if len(cleaned) not in (10, 12):
        raise HTTPException(status_code=400, detail="ИНН должен содержать 10 или 12 цифр")

    # Берём из кэша если уже есть.
    cached = db.get(InnCacheRow, cleaned)
    if cached:
        try:
            return InnLookupResponse(**json.loads(cached.payload_json))
        except (ValueError, TypeError):
            pass  # битый кэш — пересоздадим ниже

    # Иначе — генерируем детерминированно по последним 4 цифрам.
    seed = int(cleaned[-4:]) or 1
    payload = InnLookupResponse(
        name=_NAMES[seed % len(_NAMES)],
        inn=cleaned,
        address=f"Москва, пр-т {_STREETS[seed % len(_STREETS)]}, д. {(seed % 200) + 1}",
        ogrn=f"1{cleaned}{(seed % 1000):03d}",
        director=_DIRECTORS[seed % len(_DIRECTORS)],
        registeredAt=datetime.now(timezone.utc).replace(microsecond=0).isoformat(),
    )

    # Сохраняем в кэш.
    if cached:
        cached.payload_json = json.dumps(payload.model_dump())
    else:
        db.add(InnCacheRow(inn=cleaned, payload_json=json.dumps(payload.model_dump())))
    db.commit()
    return payload
