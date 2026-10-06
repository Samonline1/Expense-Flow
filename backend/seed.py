from database import engine, SessionLocal
import models

def seed():
    print("Creating database schema...")
    models.Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    if db.query(models.User).count() == 0:
        print("Seeding initial users...")
        db.add(models.User(id=1, name="Rahul", role="employee"))
        db.add(models.User(id=2, name="Priya", role="manager"))
        db.commit()
        print("Seeding complete.")
    else:
        print("Database is already seeded.")
    db.close()

if __name__ == "__main__":
    seed()
