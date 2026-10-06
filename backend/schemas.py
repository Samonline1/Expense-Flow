from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

# --- USER SCHEMAS ---
class UserBase(BaseModel):
    name: str
    role: str # 'employee' or 'manager'

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    id: int
    class Config:
        from_attributes = True

# --- EXPENSE SCHEMAS ---
class ExpenseCreate(BaseModel):
    employee_id: int
    amount: float = Field(..., gt=0)
    description: str = Field(..., min_length=1)

class ExpenseResponse(BaseModel):
    id: int
    employee_id: int
    amount: float
    description: str
    expense_date: datetime
    status: str
    
    # We can include the employee's name for the frontend table
    employee: Optional[UserResponse] = None

    class Config:
        from_attributes = True

class ExpenseStatusUpdate(BaseModel):
    status: str
    manager_id: int # To validate the person approving is actually a manager
