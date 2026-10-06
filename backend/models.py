from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    role = Column(String) # 'employee' or 'manager'

    # Relationship to expenses
    expenses = relationship("Expense", back_populates="employee")


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(Float)
    description = Column(String)
    expense_date = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String, default="pending") # pending, approved, rejected

    # Relationship back to user
    employee = relationship("User", back_populates="expenses")
