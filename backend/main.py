from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models, schemas
from database import engine, get_db

# --- DATABASE INIT ---
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Expense Flow API")

# --- MIDDLEWARE ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- USER ENDPOINTS ---

@app.post("/api/users", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = models.User(**user.model_dump())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.get("/api/users", response_model=list[schemas.UserResponse])
def get_users(db: Session = Depends(get_db)):
    return db.query(models.User).all()

# --- EXPENSE ENDPOINTS ---

@app.post("/api/expenses", response_model=schemas.ExpenseResponse)
def submit_expense(expense: schemas.ExpenseCreate, db: Session = Depends(get_db)):
    # Verify employee role
    user = db.query(models.User).filter(models.User.id == expense.employee_id).first()
    if not user or user.role != 'employee':
        raise HTTPException(status_code=403, detail="Only employees can submit expenses")

    db_expense = models.Expense(**expense.model_dump())
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense

@app.get("/api/expenses", response_model=list[schemas.ExpenseResponse])
def get_all_expenses(db: Session = Depends(get_db)):
    return db.query(models.Expense).order_by(models.Expense.expense_date.desc()).all()

@app.patch("/api/expenses/{expense_id}/status", response_model=schemas.ExpenseResponse)
def update_expense_status(expense_id: int, status_update: schemas.ExpenseStatusUpdate, db: Session = Depends(get_db)):
    # Verify manager role
    manager = db.query(models.User).filter(models.User.id == status_update.manager_id).first()
    if not manager or manager.role != 'manager':
        raise HTTPException(status_code=403, detail="Only managers can approve or reject expenses")

    db_expense = db.query(models.Expense).filter(models.Expense.id == expense_id).first()
    if not db_expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    if status_update.status not in ["approved", "rejected"]:
        raise HTTPException(status_code=400, detail="Status must be 'approved' or 'rejected'")
        
    db_expense.status = status_update.status
    db.commit()
    db.refresh(db_expense)
    return db_expense

@app.get("/api/expenses/total-approved", response_model=float)
def get_total_approved_amount(db: Session = Depends(get_db)):
    approved_expenses = db.query(models.Expense).filter(models.Expense.status == "approved").all()
    return sum(expense.amount for expense in approved_expenses)
