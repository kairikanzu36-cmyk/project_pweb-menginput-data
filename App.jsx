import React, { useState, useEffect } from 'react';
import './App.css'; 

// Fungsi Pembantu: Mengambil data awal dari Local Storage (Sekarang untuk Stok)
const getInitialItems = () => 
  JSON.parse(localStorage.getItem('inventory')) || [];

function App() {
  // --- STATE MANAGEMENT ---
  // Items (Stok) akan memiliki struktur: { id, name, stockQuantity, price }
  const [items, setItems] = useState(getInitialItems);
  const [itemName, setItemName] = useState(''); // Untuk input Nama Barang
  const [itemQuantity, setItemQuantity] = useState(''); // Untuk input Jumlah
  const [filter, setFilter] = useState('all'); // Filter: all, low_stock (Stok Rendah), in_stock (Ada Stok)
  const [sortOrder, setSortOrder] = useState('default'); // Sortir: default, name_asc, quantity_desc

  // Effect: Persistensi Data (Simpan di 'inventory')
  useEffect(() => {
    localStorage.setItem('inventory', JSON.stringify(items));
  }, [items]);

  // --- FUNGSI CRUD & FITUR TAMBAHAN (Manajemen Stok) ---

  // CREATE (C): Menambahkan Item Baru
  const addItem = (e) => {
    e.preventDefault();
    // Validasi input
    if (!itemName.trim() || itemQuantity === '' || isNaN(itemQuantity) || parseInt(itemQuantity) < 0) return;

    const newItem = {
      id: Date.now(),
      name: itemName.trim(),
      stockQuantity: parseInt(itemQuantity),
      price: 0, // Anda bisa menambahkan input untuk harga nanti
    };

    setItems(prev => [...prev, newItem]);
    setItemName('');
    setItemQuantity('');
  };

  // DELETE (D): Menghapus Item
  const deleteItem = (id) => 
    setItems(prev => prev.filter(item => item.id !== id));

  // UPDATE (U - Perbarui Stok)
  const updateStock = (id, changeType) => {
      setItems(prev => prev.map(item => {
          if (item.id === id) {
              let newQuantity = item.stockQuantity;
              if (changeType === 'increase') {
                  newQuantity += 1;
              } else if (changeType === 'decrease' && item.stockQuantity > 0) {
                  newQuantity -= 1;
              }
              return { ...item, stockQuantity: newQuantity };
          }
          return item;
      }));
  };
  
  // UPDATE (U - Edit Nama/Detail Item)
  const editItemDetails = (id) => {
    const itemToEdit = items.find(item => item.id === id);
    if (!itemToEdit) return;

    const newName = prompt(`Edit Nama (${itemToEdit.name}):`, itemToEdit.name);
    
    if (newName?.trim()) {
        setItems(prev => prev.map(item => 
            item.id === id ? { ...item, name: newName.trim() } : item
        ));
    }
  };

  // FITUR: Hapus Semua Item Stok 0
  const clearZeroStock = () => {
    setItems(prev => prev.filter(item => item.stockQuantity > 0));
  };
  
  // --- LOGIKA FILTER & SORTIR STOK ---

  // 1. Logika Filter
  const filteredItems = items.filter(item => {
    if (filter === 'low_stock') return item.stockQuantity < 5; // Stok rendah jika < 5
    if (filter === 'in_stock') return item.stockQuantity > 0;
    return true; // 'all'
  });

  // 2. Logika Sortir
  const sortedItems = filteredItems.sort((a, b) => {
    if (sortOrder === 'name_asc') {
        return a.name.localeCompare(b.name);
    }
    if (sortOrder === 'quantity_desc') {
        return b.stockQuantity - a.stockQuantity;
    }
    // Default: Sortir berdasarkan ID (waktu dibuat)
    return 0;
  });

  // --- RENDER (JSX) ---
  return (
    <div className="container">
      <h1>Manajemen Stok Barang</h1>
      
      {/* Form Input Item Baru */}
      <form onSubmit={addItem} className="item-form">
        <input
          type="text"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          placeholder="Nama Barang..."
        />
        <input
          type="number"
          value={itemQuantity}
          onChange={(e) => setItemQuantity(e.target.value)}
          placeholder="Jumlah Stok"
          min="0"
        />
        <button type="submit">Tambah Item</button>
      </form>

      {/* Kontrol Filter & Sortir */}
      <div className="controls">
          <div className="filter-controls">
              <button 
                  onClick={() => setFilter('all')} 
                  className={filter === 'all' ? 'active-filter' : ''}
              >
                  Semua Item
              </button>
              <button 
                  onClick={() => setFilter('in_stock')}
                  className={filter === 'in_stock' ? 'active-filter' : ''}
              >
                  Ada Stok ({items.filter(i => i.stockQuantity > 0).length})
              </button>
              <button 
                  onClick={() => setFilter('low_stock')}
                  className={filter === 'low_stock' ? 'active-filter warning' : 'warning'}
              >
                  Stok Rendah
              </button>
          </div>

          <div className="action-controls">
            <select 
                onChange={(e) => setSortOrder(e.target.value)}
                value={sortOrder}
                className="btn-sort"
            >
                <option value="default">Urutan Default</option>
                <option value="name_asc">Nama (A-Z)</option>
                <option value="quantity_desc">Stok Terbanyak</option>
            </select>
            <button 
                onClick={clearZeroStock}
                className="btn-clear"
                disabled={items.every(item => item.stockQuantity > 0)}
            >
                Hapus Item Stok Kosong
            </button>
          </div>
      </div>
      {/* End Kontrol */}

      {/* Daftar Item Stok */}
      <ul className="item-list">
        {sortedItems.map(item => (
          <li key={item.id} className={item.stockQuantity === 0 ? 'out-of-stock' : (item.stockQuantity < 5 ? 'low-stock-item' : '')}>
            
            <span className="item-details">
                <strong className="item-name">{item.name}</strong>
                <span className="item-quantity">
                    Stok: {item.stockQuantity}
                </span>
            </span>

            <div className="item-actions">
                <button onClick={() => updateStock(item.id, 'decrease')} className="btn-dec" disabled={item.stockQuantity === 0}>
                    -
                </button>
                <button onClick={() => updateStock(item.id, 'increase')} className="btn-inc">
                    +
                </button>
                <button onClick={() => editItemDetails(item.id)} className="btn-edit">
                    Edit
                </button>
                <button onClick={() => deleteItem(item.id)} className="btn-delete">
                    Hapus
                </button>
            </div>
          </li>
        ))}
        {sortedItems.length === 0 && <p className="no-items">Tidak ada item dalam daftar ini atau filter.</p>}
      </ul>
      <p className="summary">Total Item Unik: {items.length}</p>
    </div>
  );
}

export default App;
