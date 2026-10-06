import { useState, useEffect } from 'react';

// --- MOCK DATA ---
const USERS = [
  { id: 1, name: 'Rahul', role: 'employee' },
  { id: 2, name: 'Priya', role: 'manager' },
];

// --- CONFIG ---
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

function App() {
  // --- STATE ---
  const [currentUser, setCurrentUser] = useState(USERS[0]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [totalApproved, setTotalApproved] = useState(0);

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  // --- API METHODS ---
  const fetchExpenses = async () => {
    try {
      const res = await fetch(`${API_BASE}/expenses`);
      if (res.ok) setExpenses(await res.json());
      
      const totalRes = await fetch(`${API_BASE}/expenses/total-approved`);
      if (totalRes.ok) setTotalApproved(await totalRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleSubmitExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;

    await fetch(`${API_BASE}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employee_id: currentUser.id,
        amount: parseFloat(amount),
        description
      })
    });
    
    setAmount('');
    setDescription('');
    fetchExpenses();
  };

  const handleStatusUpdate = async (expenseId: number, status: string) => {
    await fetch(`${API_BASE}/expenses/${expenseId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status,
        manager_id: currentUser.id
      })
    });
    fetchExpenses();
  };

  // --- COMPUTED ---
  const myExpenses = expenses.filter(exp => exp.employee_id === currentUser.id);

  // --- UI RENDER ---
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* --- NAVBAR --- */}
        <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <h1 className="text-xl font-semibold text-gray-800">Expense Portal</h1>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500">Act As:</span>
            <select 
              className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-md p-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              value={currentUser.id}
              onChange={(e) => setCurrentUser(USERS.find(u => u.id === parseInt(e.target.value))!)}
            >
              {USERS.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
              ))}
            </select>
          </div>
        </div>

        {/* --- EMPLOYEE VIEW --- */}
        {currentUser.role === 'employee' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-lg font-medium text-gray-800 mb-4">Submit New Expense</h2>
              <form onSubmit={handleSubmitExpense} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                  <input 
                    type="number" step="0.01" min="0" required
                    className="w-full max-w-xs border border-gray-200 rounded-md p-2 focus:ring-brand-500 outline-none"
                    value={amount} onChange={e => setAmount(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input 
                    type="text" required
                    className="w-full border border-gray-200 rounded-md p-2 focus:ring-brand-500 outline-none"
                    value={description} onChange={e => setDescription(e.target.value)}
                  />
                </div>
                <button type="submit" className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-md font-medium transition-colors">
                  Submit Expense
                </button>
              </form>
            </div>

            {/* --- EMPLOYEE HISTORY --- */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-lg font-medium text-gray-800">My Submitted Expenses</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 font-medium">Date</th>
                      <th className="px-6 py-3 font-medium">Amount</th>
                      <th className="px-6 py-3 font-medium">Description</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {myExpenses.length === 0 ? (
                      <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">No expenses found.</td></tr>
                    ) : myExpenses.map(exp => (
                      <tr key={exp.id} className="hover:bg-gray-50/50">
                        <td className="px-6 py-4 text-gray-500">
                          {new Date(exp.expense_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">₹{exp.amount.toFixed(2)}</td>
                        <td className="px-6 py-4 text-gray-600">{exp.description}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium 
                            ${exp.status === 'approved' ? 'bg-green-100 text-green-700' : 
                              exp.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                              'bg-yellow-100 text-yellow-700'}`}>
                            {exp.status.charAt(0).toUpperCase() + exp.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- MANAGER VIEW --- */}
        {currentUser.role === 'manager' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-medium text-gray-800">Manager Dashboard</h2>
              <div className="bg-white px-4 py-2 rounded-md shadow-sm border border-gray-100 text-sm font-medium text-gray-600">
                Total Approved: <span className="text-brand-600">₹{totalApproved.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 font-medium">Employee</th>
                    <th className="px-6 py-3 font-medium">Date</th>
                    <th className="px-6 py-3 font-medium">Amount</th>
                    <th className="px-6 py-3 font-medium">Description</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {expenses.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">No expenses found.</td></tr>
                  ) : expenses.map(exp => (
                    <tr key={exp.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 font-medium text-gray-900">{exp.employee?.name || 'Unknown'}</td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(exp.expense_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">₹{exp.amount.toFixed(2)}</td>
                      <td className="px-6 py-4 text-gray-600">{exp.description}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium 
                          ${exp.status === 'approved' ? 'bg-green-100 text-green-700' : 
                            exp.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                            'bg-yellow-100 text-yellow-700'}`}>
                          {exp.status.charAt(0).toUpperCase() + exp.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 space-x-2">
                        {exp.status === 'pending' && (
                          <>
                            <button onClick={() => handleStatusUpdate(exp.id, 'approved')} className="text-green-600 hover:text-green-800 font-medium">Approve</button>
                            <button onClick={() => handleStatusUpdate(exp.id, 'rejected')} className="text-red-600 hover:text-red-800 font-medium">Reject</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default App;
