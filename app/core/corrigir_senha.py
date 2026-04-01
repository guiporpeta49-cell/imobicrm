from app.database import SessionLocal
from app.models.corretor import Corretor
from app.core.security import hash_password

db = SessionLocal()

user = db.query(Corretor).filter(Corretor.email == "admin@empresa.com").first()

if user:
    user.senha = hash_password("123456")
    db.commit()
    print("Senha atualizada!")

db.close()