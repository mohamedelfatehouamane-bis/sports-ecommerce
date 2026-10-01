import { products, categories, orders, settings } from '../mock';
import { v4 as uuidv4 } from 'uuid';

export const getCategoriesWithSubcategories = async () => {
  return categories.map(c => ({
    ...c,
    products: products.filter(p => p.categoryId === c.id)
  }));
};

export const getCategoryBySlug = async (slug: string) => {
  return categories.find(c => c.slug === slug) || null;
};

export const createCategory = async (data: any) => {
  const cat = { id: uuidv4(), ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  categories.push(cat);
  return cat;
};

export const updateCategory = async (id: string, data: any) => {
  const idx = categories.findIndex(c => c.id === id);
  if (idx > -1) {
    categories[idx] = { ...categories[idx], ...data, updatedAt: new Date().toISOString() };
    return categories[idx];
  }
  return null;
};

export const deleteCategory = async (id: string) => {
  const idx = categories.findIndex(c => c.id === id);
  if (idx > -1) categories.splice(idx, 1);
};

export const deleteManyCategories = async (ids: string[]) => {
  for (let i = categories.length - 1; i >= 0; i--) {
    if (ids.includes(categories[i].id)) categories.splice(i, 1);
  }
};

export const updateManyCategories = async (ids: string[], data: any) => {
  categories.forEach(c => {
    if (ids.includes(c.id)) Object.assign(c, data, { updatedAt: new Date().toISOString() });
  });
};

export const getCategories = async (params: any = {}) => {
  let result = [...categories];
  if (params.orderBy?.name) {
    result.sort((a, b) => a.name.localeCompare(b.name));
  }
  return result;
};

// Products
export const getProducts = async (params: any = {}) => {
  let result = [...products];
  if (params.where?.isActive !== undefined) {
    result = result.filter(p => p.isActive === params.where.isActive);
  }
  if (params.where?.category?.slug) {
    result = result.filter(p => {
      const cat = categories.find(c => c.id === p.categoryId);
      return cat?.slug === params.where.category.slug;
    });
  }
  if (params.where?.id?.in) {
    result = result.filter(p => params.where.id.in.includes(p.id));
  }
  if (params.where?.OR) {
    const search = params.where.OR[0].name.contains.toLowerCase();
    result = result.filter(p => p.name.toLowerCase().includes(search) || (p.description && p.description.toLowerCase().includes(search)));
  }
  if (params.where?.originalPrice?.not === null) {
    result = result.filter(p => p.originalPrice !== null && p.originalPrice > p.price);
  }
  
  if (params.orderBy?.price) {
    result.sort((a, b) => params.orderBy.price === 'asc' ? a.price - b.price : b.price - a.price);
  } else if (params.orderBy?.createdAt) {
    result.sort((a, b) => params.orderBy.createdAt === 'desc' ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  const count = result.length;

  if (params.skip !== undefined && params.take !== undefined) {
    result = result.slice(params.skip, params.skip + params.take);
  }

  const finalResult = result.map(p => {
    const res = { ...p } as any;
    if (params.include?.category) {
      res.category = categories.find(c => c.id === p.categoryId);
    }
    if (params.include?.variants) {
      res.variants = p.variants || [];
    }
    return res;
  });

  return { products: finalResult, count };
};

export const getProduct = async (id: string, include?: any) => {
  const p = products.find(p => p.id === id);
  if (!p) return null;
  const res = { ...p } as any;
  if (include?.variants) res.variants = p.variants || [];
  if (include?.category) res.category = categories.find(c => c.id === p.categoryId);
  return res;
};

export const upsertProduct = async (input: any) => {
  const slug = input.name
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/-+$/g, '')
    .replace(/^-+/g, '');

  const existing = products.find(p => p.slug === slug);
  if (existing && existing.id !== input.id) {
    throw new Error(`Product with slug "${slug}" already exists`);
  }

  let finalCategoryId = input.categoryId;
  if (finalCategoryId === 'NEW' && input.newCategoryName) {
    const catSlug = input.newCategoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    let existingCat = categories.find(c => c.slug === catSlug || c.name === input.newCategoryName);
    if (!existingCat) {
      existingCat = await createCategory({ name: input.newCategoryName, slug: catSlug, isActive: true });
    }
    finalCategoryId = existingCat!.id;
  }

  const productData = {
    name: input.name,
    slug,
    description: input.description,
    price: Number(input.price),
    originalPrice: input.originalPrice && input.originalPrice > input.price ? Number(input.originalPrice) : null,
    stock: input.stock,
    lowStockThreshold: input.lowStockThreshold ?? 5,
    categoryId: finalCategoryId && finalCategoryId !== 'NEW' ? finalCategoryId : undefined,
    isActive: input.isActive,
    imageUrl: input.imageUrl,
    availableSizes: input.availableSizes || [],
  };

  let product;
  if (input.id) {
    const idx = products.findIndex(p => p.id === input.id);
    if (idx > -1) {
      products[idx] = { ...products[idx], ...productData, updatedAt: new Date().toISOString() } as any;
      product = { ...products[idx] } as any;
      product.variants = input.variants || [];
    }
  } else {
    product = {
      id: uuidv4(),
      ...productData,
      variants: input.variants || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    products.push(product);
  }

  return product;
};

export const deleteProduct = async (id: string) => {
  const idx = products.findIndex(p => p.id === id);
  if (idx > -1) {
    const p = products[idx];
    products.splice(idx, 1);
    return p;
  }
  return null;
};

export const deleteManyProducts = async (ids: string[]) => {
  const deleted = [];
  for (let i = products.length - 1; i >= 0; i--) {
    if (ids.includes(products[i].id)) {
      deleted.push(products[i]);
      products.splice(i, 1);
    }
  }
  return deleted;
};

export const updateManyProducts = async (ids: string[], data: any) => {
  products.forEach(p => {
    if (ids.includes(p.id)) Object.assign(p, data, { updatedAt: new Date().toISOString() });
  });
};

export const updateProduct = async (id: string, data: any) => {
  const idx = products.findIndex(p => p.id === id);
  if (idx > -1) {
    products[idx] = { ...products[idx], ...data, updatedAt: new Date().toISOString() };
    return products[idx];
  }
  return null;
};

export const getProductBySlug = async (slug: string, include?: any) => {
  const p = products.find(p => p.slug === slug);
  if (!p) return null;
  const res = { ...p } as any;
  if (include?.variants) res.variants = p.variants || [];
  if (include?.category) res.category = categories.find(c => c.id === p.categoryId);
  return res;
};

// Orders
export const getOrders = async (params: any = {}) => {
  let result = [...orders];
  if (params.where?.status) {
    result = result.filter(o => o.status === params.where.status);
  }
  if (params.where?.id) {
    result = result.filter(o => o.id === params.where.id);
  }
  if (params.where?.orderCode) {
    result = result.filter(o => o.orderCode === params.where.orderCode);
  }
  if (params.orderBy?.createdAt) {
    result.sort((a, b) => params.orderBy.createdAt === 'desc' ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }
  const count = result.length;
  if (params.skip !== undefined && params.take !== undefined) {
    result = result.slice(params.skip, params.skip + params.take);
  }
  return { orders: result, count };
};

export const getOrder = async (id: string) => {
  const o = orders.find(o => o.id === id);
  if (!o) return null;
  return { ...o };
};

export const getOrderByCode = async (code: string) => {
  const o = orders.find(o => o.orderCode === code);
  return o ? { ...o } : null;
};

export const createOrder = async (data: any, items?: any[]) => {
  const order = { id: uuidv4(), ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), items: [] };
  if (items) {
    order.items = items.map((i: any) => ({ ...i, id: uuidv4(), orderId: order.id, createdAt: new Date().toISOString() }));
  } else if (order.items) {
    order.items = order.items.map((i: any) => ({ ...i, id: uuidv4(), orderId: order.id, createdAt: new Date().toISOString() }));
  }
  orders.push(order);
  return order;
};

export const updateOrder = async (id: string, data: any) => {
  const idx = orders.findIndex(o => o.id === id);
  if (idx > -1) {
    orders[idx] = { ...orders[idx], ...data, updatedAt: new Date().toISOString() };
    return orders[idx];
  }
  return null;
};

// Settings
export const getStoreSettings = async () => {
  return settings;
};

export const getStoreSetting = async (key: string) => {
  return settings.find(s => s.settingKey === key) || null;
};

export const updateStoreSetting = async (key: string, value: string) => {
  const idx = settings.findIndex(s => s.settingKey === key);
  if (idx > -1) {
    settings[idx].settingValue = value;
    settings[idx].updatedAt = new Date().toISOString();
  } else {
    settings.push({ id: uuidv4(), settingKey: key, settingValue: value, description: '', updatedAt: new Date().toISOString() });
  }
};
