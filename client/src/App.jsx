import { useCallback, useEffect, useState } from 'react';
import './App.css';
import Auth from './components/Auth';

function App(){
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [activePressing, setActivePressing] = useState("income");
  const [categories, setCategories] = useState([]);
  const [Balance,setBalance] = useState(0)
  const [amount, setAmount] = useState("");
  const [currentCategory, setCurrentCategory] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");

const handleLogout = useCallback(() => {
  localStorage.removeItem('token');
  setToken(null);
}, []);

const fetchWithAuth = useCallback(async (url, options = {}) => {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401) {
    handleLogout();
  }

  return res;
}, [handleLogout, token]);

const GetBalance = useCallback(async () => {
  if (!token) return;

  try{
    const res = await fetchWithAuth("http://localhost:3100/getBalance")
    if (!res.ok) throw new Error(`Не удалось загрузить баланс: ${res.status}`);
    const data = await res.json()
    setBalance(data.balance);
  } catch(error){
    console.log("баланс показал:" , error);
  }
}, [fetchWithAuth, token]);

const GetTransactions = useCallback(async () => {
  if (!token) return;

  try{
    const res = await fetchWithAuth("http://localhost:3100/getTransactions");
    if (!res.ok) throw new Error(`Не удалось загрузить транзакции: ${res.status}`);
    const data = await res.json()
    setTransactions(data);
  } catch(error){
    console.log("траз:" , error);
  }
}, [fetchWithAuth, token]);

useEffect(() => {
  if (!token) return;

  const fetchData = async () => {
    try {
      const res = await fetchWithAuth("http://localhost:3100/Getcategory");
      if (!res.ok) throw new Error(`Не удалось загрузить категории: ${res.status}`);
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.log("ошибка:", error);
    }
  };

  fetchData();
  const loadAccountData = async () => {
    await Promise.all([GetBalance(), GetTransactions()]);
  };
  loadAccountData();
}, [GetBalance, GetTransactions, fetchWithAuth, token]);

const filteredCategories = categories.filter((item) => item.type === activePressing);
const selectedCategory = filteredCategories.some((item) => item.category === currentCategory)
  ? currentCategory
  : filteredCategories[0]?.category || "";

const ButtonCompleted = async () => {
  if (amount >= 1 && activePressing && categories.length > 0) {
    const res = await fetchWithAuth("http://localhost:3100/Addtransaction", {
      method: "POST",
      body: JSON.stringify({ 
      sum: Number(amount),      
      type: activePressing,     
      category: selectedCategory 
      })
    });
    if (!res.ok) {
      console.log("Ошибка добавления транзакции:", res.status);
      return;
    }
    GetBalance();
    setAmount("");
     GetTransactions()
    }
  };

  const Addcategory = async () => {
  if (!newCategory.trim()) return;

  try {
    const res = await fetchWithAuth("http://localhost:3100/Addcategory", {
      method: "POST",
      body: JSON.stringify({ category: newCategory.trim(), type: activePressing })
    });

    if (res.ok) {
      const catRes = await fetchWithAuth("http://localhost:3100/Getcategory");
      if (!catRes.ok) throw new Error(`Не удалось обновить категории: ${catRes.status}`);
      const catData = await catRes.json();
      setCategories(catData);
      setNewCategory("");
      ModalClose();
    }
  } catch (e) {
    console.log("Помилка додавання категорії:", e);
  }
};

    const ModalOpen = () => {
     setIsModalOpen(true);
  };
  const ModalClose = () => {
     setIsModalOpen(false);
  };

  const DeleteButtonCategory = async (id) => {
    try{
    const res = await fetchWithAuth("http://localhost:3100/Deltransaction" , {
      method: "DELETE" ,
      body: JSON.stringify({id: id})
    })
    if (res.ok) {
    setTransactions(oldlist => oldlist.filter(item => item._id !== id));
    GetBalance();
  } 
  }catch(e){
    console.log("Ошибка запроса:", e);
  }
}

  if (!token) {
    return <Auth onAuthSuccess={() => setToken(localStorage.getItem('token'))} />;
  }

  return(
  <div className="app-container">
    <header className="app-header">
      <button className="logout-button" type="button" onClick={handleLogout}>Вийти</button>
    </header>
    <aside className="Panel">
      <h2>GildApp</h2>
      <h3>Ваш баланс: {Balance} грн</h3>

      <div className="type-buttons">
        <button onClick={() => setActivePressing("income")}>Дохід</button>
        <button onClick={() => setActivePressing("expense")}>Росхід</button>
      </div>

      <input
        type="number"
        placeholder="Сума"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <div className="category-row">
        <select
          value={selectedCategory}
          onChange={(e) => setCurrentCategory(e.target.value)}
        >
          {filteredCategories
            .map((item) => (
              <option key={item._id} value={item.category}>
                {item.category}
              </option>
            ))}
        </select>
        <button className="add-category-button" type="button" onClick={ModalOpen} aria-label="Додати категорію">+</button>
      </div>

        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Нова категорія ({activePressing === "income" ? "Дохід" : "Витрата"})</h3>

              <input
                type="text"
                placeholder="Назва категорії..."
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />

              <div className="modal-actions">
                <button onClick={Addcategory}>Зберегти</button>
                <button onClick={ModalClose}>Скасувати</button>
              </div>
            </div>
          </div>
        )}

      <button onClick={() => ButtonCompleted()}>Додати</button>
    </aside>

    <main className="Center">
  <div className="IncomeColumn">
    <h2>Доходи</h2>
    {transactions
      .filter((item) => item.type === "income")
      .map((item) => (
        <div key={item._id} className="TransactionItem">
          <span>{item.category}: </span>
          <span>+{item.sum} грн</span>
        <button onClick={() => DeleteButtonCategory(item._id)}> Удалить </button>
        </div>
      ))}
  </div>
  <div className="ExpenseColumn">
    <h2>Витрати</h2>
    {transactions
      .filter((item) => item.type === "expense")
      .map((item) => (
        <div key={item._id} className="TransactionItem">
        <span>{item.category}: </span>
        <span>-{item.sum} грн</span>
        <button onClick={() => DeleteButtonCategory(item._id)}> Удалить </button>
        </div>
      ))}
  </div>
    </main>
  </div>
  );
}


export default App;