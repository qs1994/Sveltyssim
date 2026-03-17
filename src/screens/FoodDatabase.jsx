import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function FoodDatabase({ onSelectFood, onClose, showSelectMode = false }) {
  const [tab, setTab] = useState('all') // all | favorites | recipes
  const [search, setSearch] = useState('')
  const [foods, setFoods] = useState([])
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(false)
  const [showAddFood, setShowAddFood] = useState(false)
  const [showAddRecipe, setShowAddRecipe] = useState(false)

  useEffect(() => { fetchFoods(); fetchRecipes() }, [])

  const fetchFoods = async () => {
    const { data } = await supabase.from('foods').select('*').order('name')
    if (data) setFoods(data)
  }

  const fetchRecipes = async () => {
    const { data } = await supabase.from('recipes').select('*, recipe_ingredients(*, food:foods(*))').order('name')
    if (data) setRecipes(data)
  }

  const toggleFavorite = async (food) => {
    await supabase.from('foods').update({ is_favorite: !food.is_favorite }).eq('id', food.id)
    fetchFoods()
  }

  const deleteFood = async (id) => {
    await supabase.from('foods').delete().eq('id', id)
    fetchFoods()
  }

  const deleteRecipe = async (id) => {
    await supabase.from('recipes').delete().eq('id', id)
    fetchRecipes()
  }

  const filtered = foods.filter(f => {
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase())
    if (tab === 'favorites') return matchSearch && f.is_favorite
    return matchSearch
  })

  const filteredRecipes = recipes.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.back} onClick={onClose}>←</button>
        <h2 style={styles.title}>{showSelectMode ? 'Choisir un aliment' : 'Ma base alimentaire'}</h2>
        <div style={{ width: 36 }} />
      </div>

      <div style={styles.scroll}>
        {/* Search */}
        <div style={styles.searchRow}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            style={styles.searchInput}
            placeholder="Rechercher un aliment..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button style={styles.clearBtn} onClick={() => setSearch('')}>✕</button>}
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          {[
            { id: 'all', label: '🥗 Aliments' },
            { id: 'favorites', label: '⭐ Favoris' },
            { id: 'recipes', label: '🍱 Plats' },
          ].map(t => (
            <button
              key={t.id}
              style={{ ...styles.tab, ...(tab === t.id ? styles.tabActive : {}) }}
              onClick={() => setTab(t.id)}
            >{t.label}</button>
          ))}
        </div>

        {/* Add buttons */}
        {!showSelectMode && (
          <div style={styles.addRow}>
            {tab !== 'recipes' ? (
              <button style={styles.addBtn} onClick={() => setShowAddFood(true)}>
                + Ajouter un aliment
              </button>
            ) : (
              <button style={styles.addBtn} onClick={() => setShowAddRecipe(true)}>
                + Créer un plat
              </button>
            )}
          </div>
        )}

        {/* Food list */}
        {tab !== 'recipes' && (
          <div style={styles.list}>
            {filtered.length === 0 ? (
              <div style={styles.empty}>
                <p style={styles.emptyIcon}>🥗</p>
                <p style={styles.emptyText}>
                  {tab === 'favorites' ? 'Aucun favori encore' : 'Aucun aliment trouvé'}
                </p>
                {!showSelectMode && <p style={styles.emptyHint}>Appuie sur "+ Ajouter" pour commencer !</p>}
              </div>
            ) : filtered.map(food => (
              <div key={food.id} style={styles.foodItem}>
                <div style={styles.foodInfo} onClick={() => showSelectMode && onSelectFood(food)}>
                  <p style={styles.foodName}>{food.name}</p>
                  <p style={styles.foodMacros}>
                    🔥 {food.calories} kcal · 🌾 {food.carbs}g · 💪 {food.proteins}g
                    <span style={styles.per100}> /100g</span>
                  </p>
                </div>
                <div style={styles.foodActions}>
                  <button style={styles.favBtn} onClick={() => toggleFavorite(food)}>
                    {food.is_favorite ? '⭐' : '☆'}
                  </button>
                  {!showSelectMode && (
                    <button style={styles.delBtn} onClick={() => deleteFood(food.id)}>🗑️</button>
                  )}
                  {showSelectMode && (
                    <button style={styles.selectBtn} onClick={() => onSelectFood(food)}>
                      Choisir
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recipes list */}
        {tab === 'recipes' && (
          <div style={styles.list}>
            {filteredRecipes.length === 0 ? (
              <div style={styles.empty}>
                <p style={styles.emptyIcon}>🍱</p>
                <p style={styles.emptyText}>Aucun plat créé</p>
                {!showSelectMode && <p style={styles.emptyHint}>Crée ton premier plat composé !</p>}
              </div>
            ) : filteredRecipes.map(recipe => (
              <div key={recipe.id} style={styles.foodItem}>
                <div style={styles.foodInfo} onClick={() => showSelectMode && onSelectFood({ ...recipe, fromRecipe: true })}>
                  <p style={styles.foodName}>{recipe.name}</p>
                  <p style={styles.foodMacros}>
                    🔥 {recipe.total_calories} kcal · 🌾 {recipe.total_carbs}g · 💪 {recipe.total_proteins}g
                    <span style={styles.per100}> /portion</span>
                  </p>
                  <p style={styles.recipeIngredients}>
                    {recipe.recipe_ingredients?.map(ri => ri.food?.name).filter(Boolean).join(', ')}
                  </p>
                </div>
                <div style={styles.foodActions}>
                  {!showSelectMode && (
                    <button style={styles.delBtn} onClick={() => deleteRecipe(recipe.id)}>🗑️</button>
                  )}
                  {showSelectMode && (
                    <button style={styles.selectBtn} onClick={() => onSelectFood({ ...recipe, fromRecipe: true })}>
                      Choisir
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddFood && <AddFoodModal onClose={() => setShowAddFood(false)} onSaved={() => { fetchFoods(); setShowAddFood(false) }} />}
      {showAddRecipe && <AddRecipeModal foods={foods} onClose={() => setShowAddRecipe(false)} onSaved={() => { fetchRecipes(); setShowAddRecipe(false) }} />}
    </div>
  )
}

function AddFoodModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ name: '', calories: '', carbs: '', proteins: '' })
  const [loading, setLoading] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.name || !form.calories) return
    setLoading(true)
    await supabase.from('foods').insert({
      name: form.name,
      calories: Number(form.calories),
      carbs: Number(form.carbs) || 0,
      proteins: Number(form.proteins) || 0,
    })
    setLoading(false)
    onSaved()
  }

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <p style={styles.modalTitle}>🥗 Nouvel aliment</p>
          <button style={styles.modalClose} onClick={onClose}>✕</button>
        </div>
        <p style={styles.modalHint}>Valeurs pour 100g</p>
        {[
          { key: 'name', label: 'Nom', placeholder: 'Ex: Poulet grillé', type: 'text' },
          { key: 'calories', label: '🔥 Calories (kcal)', placeholder: '165', type: 'number' },
          { key: 'carbs', label: '🌾 Glucides (g)', placeholder: '0', type: 'number' },
          { key: 'proteins', label: '💪 Protéines (g)', placeholder: '31', type: 'number' },
        ].map(f => (
          <div key={f.key} style={styles.modalField}>
            <label style={styles.modalLabel}>{f.label}</label>
            <input
              style={styles.modalInput}
              type={f.type}
              inputMode={f.type === 'number' ? 'decimal' : 'text'}
              placeholder={f.placeholder}
              value={form[f.key]}
              onChange={e => set(f.key, e.target.value)}
            />
          </div>
        ))}
        <button style={styles.modalSaveBtn} onClick={handleSave} disabled={loading}>
          {loading ? '⏳' : '✅ Enregistrer'}
        </button>
      </div>
    </div>
  )
}

function AddRecipeModal({ foods, onClose, onSaved }) {
  const [name, setName] = useState('')
  const [ingredients, setIngredients] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  const filtered = foods.filter(f => f.name.toLowerCase().includes(search.toLowerCase())).slice(0, 5)

  const addIngredient = (food) => {
    if (ingredients.find(i => i.food_id === food.id)) return
    setIngredients(prev => [...prev, { food_id: food.id, food_name: food.name, quantity: '100', calories_per_100: food.calories, carbs_per_100: food.carbs, proteins_per_100: food.proteins }])
    setSearch('')
  }

  const removeIngredient = (food_id) => setIngredients(prev => prev.filter(i => i.food_id !== food_id))
  const updateQty = (food_id, qty) => setIngredients(prev => prev.map(i => i.food_id === food_id ? { ...i, quantity: qty } : i))

  const totals = ingredients.reduce((acc, i) => {
    const factor = (Number(i.quantity) || 0) / 100
    return {
      cal: acc.cal + (i.calories_per_100 * factor),
      carbs: acc.carbs + (i.carbs_per_100 * factor),
      prot: acc.prot + (i.proteins_per_100 * factor),
    }
  }, { cal: 0, carbs: 0, prot: 0 })

  const handleSave = async () => {
    if (!name || ingredients.length === 0) return
    setLoading(true)
    const { data: recipe } = await supabase.from('recipes').insert({
      name,
      total_calories: Math.round(totals.cal),
      total_carbs: Math.round(totals.carbs * 10) / 10,
      total_proteins: Math.round(totals.prot * 10) / 10,
    }).select().single()

    if (recipe) {
      await supabase.from('recipe_ingredients').insert(
        ingredients.map(i => ({ recipe_id: recipe.id, food_id: i.food_id, quantity: Number(i.quantity) }))
      )
    }
    setLoading(false)
    onSaved()
  }

  return (
    <div style={styles.modalOverlay}>
      <div style={{ ...styles.modal, maxHeight: '85vh', overflowY: 'auto' }}>
        <div style={styles.modalHeader}>
          <p style={styles.modalTitle}>🍱 Nouveau plat</p>
          <button style={styles.modalClose} onClick={onClose}>✕</button>
        </div>

        <div style={styles.modalField}>
          <label style={styles.modalLabel}>Nom du plat</label>
          <input style={styles.modalInput} placeholder="Ex: Ma salade César" value={name} onChange={e => setName(e.target.value)} />
        </div>

        <label style={styles.modalLabel}>Ajouter des ingrédients</label>
        <input
          style={{ ...styles.modalInput, marginBottom: '8px' }}
          placeholder="🔍 Rechercher..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && filtered.map(f => (
          <button key={f.id} style={styles.suggestionBtn} onClick={() => addIngredient(f)}>
            + {f.name} <span style={styles.suggestionMacros}>{f.calories} kcal/100g</span>
          </button>
        ))}
        {search && filtered.length === 0 && <p style={styles.noResult}>Aucun aliment trouvé dans ta base</p>}

        {ingredients.length > 0 && (
          <div style={styles.ingredientList}>
            {ingredients.map(i => (
              <div key={i.food_id} style={styles.ingredientRow}>
                <p style={styles.ingredientName}>{i.food_name}</p>
                <div style={styles.ingredientRight}>
                  <input
                    style={styles.qtyInput}
                    type="number"
                    inputMode="numeric"
                    value={i.quantity}
                    onChange={e => updateQty(i.food_id, e.target.value)}
                  />
                  <span style={styles.qtyUnit}>g</span>
                  <button style={styles.removeBtn} onClick={() => removeIngredient(i.food_id)}>✕</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {ingredients.length > 0 && (
          <div style={styles.totalCard}>
            <p style={styles.totalTitle}>Total du plat</p>
            <p style={styles.totalMacros}>🔥 {Math.round(totals.cal)} kcal · 🌾 {Math.round(totals.carbs)}g · 💪 {Math.round(totals.prot)}g</p>
          </div>
        )}

        <button style={styles.modalSaveBtn} onClick={handleSave} disabled={loading || !name || ingredients.length === 0}>
          {loading ? '⏳' : '✅ Créer le plat'}
        </button>
      </div>
    </div>
  )
}

const styles = {
  container: { height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--cream)' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '52px 20px 16px', borderBottom: '1px solid var(--border)', background: 'var(--white)' },
  back: { background: 'none', fontSize: '22px', color: 'var(--green)', width: 36 },
  title: { fontSize: '17px', fontWeight: '700' },
  scroll: { flex: 1, overflowY: 'auto', padding: '16px 20px 100px' },
  searchRow: { display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--white)', borderRadius: '14px', padding: '12px 16px', marginBottom: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  searchIcon: { fontSize: '16px' },
  searchInput: { flex: 1, border: 'none', background: 'transparent', fontSize: '15px', color: 'var(--text)' },
  clearBtn: { background: 'none', color: 'var(--text-muted)', fontSize: '14px' },
  tabs: { display: 'flex', gap: '6px', marginBottom: '14px' },
  tab: { flex: 1, padding: '10px 6px', borderRadius: '12px', background: 'var(--cream-dark)', color: 'var(--text-muted)', fontSize: '13px', fontWeight: '500' },
  tabActive: { background: 'var(--green)', color: 'white', fontWeight: '700' },
  addRow: { marginBottom: '14px' },
  addBtn: { width: '100%', padding: '14px', borderRadius: '14px', background: 'var(--green-pale)', color: 'var(--green)', fontSize: '15px', fontWeight: '700' },
  list: { display: 'flex', flexDirection: 'column', gap: '8px' },
  empty: { textAlign: 'center', padding: '40px 20px' },
  emptyIcon: { fontSize: '40px', marginBottom: '10px' },
  emptyText: { fontSize: '16px', fontWeight: '600', color: 'var(--text)' },
  emptyHint: { fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' },
  foodItem: { background: 'var(--white)', borderRadius: '16px', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  foodInfo: { flex: 1 },
  foodName: { fontSize: '15px', fontWeight: '600', color: 'var(--text)' },
  foodMacros: { fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' },
  per100: { fontSize: '11px', color: 'var(--border)' },
  recipeIngredients: { fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px', fontStyle: 'italic' },
  foodActions: { display: 'flex', gap: '6px', alignItems: 'center' },
  favBtn: { background: 'none', fontSize: '20px', padding: '4px' },
  delBtn: { background: '#FFF0EE', borderRadius: '8px', padding: '6px 8px', fontSize: '14px' },
  selectBtn: { background: 'var(--green)', color: 'white', borderRadius: '10px', padding: '8px 14px', fontSize: '13px', fontWeight: '700' },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', zIndex: 100 },
  modal: { background: 'var(--white)', borderRadius: '24px 24px 0 0', padding: '24px 20px 40px', width: '100%' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' },
  modalTitle: { fontSize: '18px', fontWeight: '700' },
  modalClose: { background: 'var(--cream-dark)', borderRadius: '50%', width: '32px', height: '32px', fontSize: '14px', color: 'var(--text-muted)', fontWeight: '700' },
  modalHint: { fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' },
  modalField: { marginBottom: '12px' },
  modalLabel: { fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', display: 'block' },
  modalInput: { width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid var(--border)', fontSize: '15px', background: 'var(--cream)', color: 'var(--text)' },
  modalSaveBtn: { width: '100%', padding: '16px', borderRadius: '14px', background: 'var(--green)', color: 'white', fontSize: '16px', fontWeight: '700', marginTop: '16px', boxShadow: '0 4px 16px rgba(74,124,89,0.35)' },
  suggestionBtn: { width: '100%', textAlign: 'left', padding: '10px 14px', background: 'var(--green-pale)', borderRadius: '10px', fontSize: '14px', fontWeight: '500', color: 'var(--green)', marginBottom: '6px' },
  suggestionMacros: { color: 'var(--text-muted)', fontWeight: '400', fontSize: '12px' },
  noResult: { fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '8px' },
  ingredientList: { background: 'var(--cream)', borderRadius: '14px', padding: '12px', marginTop: '10px', marginBottom: '10px' },
  ingredientRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', marginBottom: '8px', borderBottom: '1px solid var(--border)' },
  ingredientName: { fontSize: '14px', fontWeight: '500', flex: 1 },
  ingredientRight: { display: 'flex', alignItems: 'center', gap: '6px' },
  qtyInput: { width: '60px', padding: '6px', borderRadius: '8px', border: '1.5px solid var(--border)', fontSize: '15px', fontWeight: '700', textAlign: 'center', background: 'var(--white)' },
  qtyUnit: { fontSize: '13px', color: 'var(--text-muted)' },
  removeBtn: { background: 'none', color: 'var(--text-muted)', fontSize: '14px', fontWeight: '700' },
  totalCard: { background: 'var(--green-pale)', borderRadius: '14px', padding: '14px', marginBottom: '4px' },
  totalTitle: { fontSize: '13px', fontWeight: '700', color: 'var(--green)', marginBottom: '4px' },
  totalMacros: { fontSize: '15px', fontWeight: '700', color: 'var(--text)' },
}
