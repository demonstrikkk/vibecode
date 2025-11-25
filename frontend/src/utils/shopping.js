// Shopping utility functions

export function addIngredients(ingredients) {
  try {
    const raw = localStorage.getItem('shoppingList');
    const list = raw ? JSON.parse(raw) : [];
    
    ingredients.forEach(ing => {
      const name = typeof ing === 'string' ? ing : ing.name;
      const qty = typeof ing === 'string' ? 1 : (ing.qty || 1);
      const unit = typeof ing === 'string' ? '' : (ing.unit || '');
      
      const existing = list.find(item => 
        item.name.toLowerCase() === name.toLowerCase() && 
        item.unit.toLowerCase() === unit.toLowerCase()
      );
      
      if (existing) {
        existing.qty = (Number(existing.qty) || 0) + (Number(qty) || 1);
      } else {
        list.push({
          id: Date.now() + Math.random(),
          name,
          qty,
          unit,
          checked: false
        });
      }
    });
    
    localStorage.setItem('shoppingList', JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('toast', { 
      detail: { message: `${ingredients.length} ingredient(s) added to shopping list` } 
    }));
    
    return list;
  } catch (e) {
    console.error('Failed to add ingredients:', e);
    return [];
  }
}

export function removeIngredient(id) {
  try {
    const raw = localStorage.getItem('shoppingList');
    const list = raw ? JSON.parse(raw) : [];
    const updated = list.filter(item => item.id !== id);
    localStorage.setItem('shoppingList', JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to remove ingredient:', e);
    return [];
  }
}

export function toggleIngredient(id) {
  try {
    const raw = localStorage.getItem('shoppingList');
    const list = raw ? JSON.parse(raw) : [];
    const updated = list.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    localStorage.setItem('shoppingList', JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to toggle ingredient:', e);
    return [];
  }
}

export function getShoppingList() {
  try {
    const raw = localStorage.getItem('shoppingList');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function clearShoppingList() {
  localStorage.setItem('shoppingList', JSON.stringify([]));
  return [];
}
