const fs = require('fs');

const path = 'components/admin/product-form.tsx';
let content = fs.readFileSync(path, 'utf8');

// Chunk 1: State
content = content.replace(
  /availableSizes: product\?\.availableSizes \|\| \[\]\s*\}\)\s*const \[sizeInput, setSizeInput\] = useState\(''\)\s*const handleAddSizes = \(\) => \{[\s\S]*?removeSize = \(sizeToRemove: string\) => \{[\s\S]*?\}\)/,
  `variants: product?.variants || [] as any[]
  })
  
  const [variantInput, setVariantInput] = useState({ size: '', color: '', quantity: '' })

  const handleAddVariant = () => {
    const s = variantInput.size.trim() || null
    const c = variantInput.color.trim() || null
    const q = parseInt(variantInput.quantity)
    if (isNaN(q) || q < 0) {
      alert('Valid quantity is required')
      return
    }
    setFormData(prev => {
      // Prevent exact duplicates
      const exists = prev.variants.find((v: any) => v.size === s && v.color === c)
      if (exists) {
        alert('Variant already exists. Remove it first to update quantity.')
        return prev
      }
      return { ...prev, variants: [...prev.variants, { size: s, color: c, quantity: q }] }
    })
    setVariantInput({ size: '', color: '', quantity: '' })
  }
  
  const removeVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_: any, i: number) => i !== index)
    }))
  }`
);

// Chunk 2: Payload
content = content.replace(
  /availableSizes: formData\.availableSizes,/,
  `variants: formData.variants,`
);

// Chunk 3: UI
const uiStart = content.indexOf('{/* Available Sizes */}');
const uiEnd = content.indexOf('{/* Main Image Upload */}');
if (uiStart > -1 && uiEnd > -1) {
  content = content.substring(0, uiStart) + 
  `{/* Product Variants */}
      <div className="space-y-6 rounded-2xl border border-slate-850 bg-slate-900/10 p-6 shadow-xl">
        <h2 className="text-base font-bold uppercase tracking-wider text-white flex items-center gap-2">
          📦 Product Variants / Inventory
        </h2>
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-2">Variants</label>
          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden mb-4">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/50 border-b border-slate-800 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-semibold">Size</th>
                  <th className="px-4 py-3 font-semibold">Color</th>
                  <th className="px-4 py-3 font-semibold">Quantity</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {formData.variants.map((variant: any, index: number) => (
                  <tr key={index} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-200">{variant.size || '-'}</td>
                    <td className="px-4 py-3 font-medium text-slate-200">{variant.color || '-'}</td>
                    <td className="px-4 py-3 font-mono text-orange-400">{variant.quantity}</td>
                    <td className="px-4 py-3 text-right">
                      <button type="button" onClick={() => removeVariant(index)} className="text-rose-400 hover:text-rose-300 transition-colors p-1 rounded-md hover:bg-rose-500/10 inline-flex items-center">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {formData.variants.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500 text-sm">
                      No variants defined. Product will use the global stock count above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="flex gap-3 items-end bg-slate-800/30 p-4 rounded-xl border border-slate-800/50">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-400 mb-1">Size <span className="font-normal text-slate-500">(e.g. S, 40)</span></label>
              <Input
                type="text"
                value={variantInput.size}
                onChange={(e) => setVariantInput(prev => ({...prev, size: e.target.value}))}
                placeholder="Leave blank for none"
                className="bg-slate-950 border-slate-800 text-slate-200 focus:border-orange-500 focus:ring-0"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-400 mb-1">Color <span className="font-normal text-slate-500">(e.g. Black, أسود)</span></label>
              <Input
                type="text"
                value={variantInput.color}
                onChange={(e) => setVariantInput(prev => ({...prev, color: e.target.value}))}
                placeholder="Leave blank for none"
                className="bg-slate-950 border-slate-800 text-slate-200 focus:border-orange-500 focus:ring-0"
              />
            </div>
            <div className="flex-[0.5]">
              <label className="block text-xs font-semibold text-slate-400 mb-1">Qty *</label>
              <Input
                type="number"
                value={variantInput.quantity}
                onChange={(e) => setVariantInput(prev => ({...prev, quantity: e.target.value}))}
                placeholder="0"
                className="bg-slate-950 border-slate-800 text-slate-200 focus:border-orange-500 focus:ring-0 font-mono"
              />
            </div>
            <Button type="button" onClick={handleAddVariant} variant="secondary" className="bg-orange-500 hover:bg-orange-600 text-white border-0 font-bold px-6 h-10">
              Add Variant
            </Button>
          </div>
        </div>
      </div>

      ` + content.substring(uiEnd);
}

fs.writeFileSync(path, content);
console.log('Done replacing product-form.tsx');
