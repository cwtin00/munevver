window.sureyyaFixMenuImages = function(menu) {
  const defaults = window.DEFAULT_MENU_DATA || [];
  const normalize = s => String(s || '').trim().toLocaleLowerCase('tr-TR');
  const legacy = path => !path || /(?:yemeklerkategori|icecekkategori|tatlilarkategori|corbalarkategori|kurabiyelervetatlilarkategori)\.webp$/i.test(path);
  return (Array.isArray(menu) ? menu : []).map(category => {
    const local = defaults.find(c => normalize(c.name) === normalize(category.name));
    if (!local) return category;
    const copy = {...category};
    if (legacy(copy.image)) copy.image = local.image;
    if (Array.isArray(copy.products)) copy.products = copy.products.map(product => {
      const matching = (local.products || []).find(p => normalize(p.name) === normalize(product.name));
      return matching && legacy(product.image) ? {...product, image:matching.image} : product;
    });
    return copy;
  });
};
