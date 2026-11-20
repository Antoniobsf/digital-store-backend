const { Op } = require('sequelize');
const { Product, Category, ProductImage, ProductOption } = require('../models');

function formatProduct(product, fields) {
  const full = {
    id: product.id,
    enabled: product.enabled,
    name: product.name,
    slug: product.slug,
    use_in_menu: product.use_in_menu,
    stock: product.stock,
    description: product.description,
    price: product.price,
    price_with_discount: product.price_with_discount,
    category_ids: (product.categories || []).map((c) => c.id),
    images: (product.images || []).map((img) => ({ id: img.id, content: img.path })),
    options: (product.options || []).map((opt) => ({
      id: opt.id,
      title: opt.title,
      shape: opt.shape,
      radius: opt.radius,
      type: opt.type,
      values: opt.values,
    })),
  };

  if (!fields) return full;

  const requested = fields.split(',').map((f) => f.trim());
  const filtered = {};
  for (const key of requested) {
    if (key in full) filtered[key] = full[key];
  }
  return filtered;
}

function normalizeValues(opt) {
  const raw = opt.values ?? opt.value;
  if (Array.isArray(raw)) return raw.join(',');
  return raw !== undefined ? String(raw) : '';
}

module.exports = {
  // GET /v1/product/search
  async search(req, res, next) {
    try {
      const { limit = 12, page = 1, fields, match, category_ids, option } = req.query;
      const priceRange = req.query['price-range'];

      const parsedLimit = Number(limit);
      const parsedPage = Number(page);
      if (Number.isNaN(parsedLimit) || Number.isNaN(parsedPage)) {
        return res.status(400).json({ error: 'Parâmetros limit e page devem ser numéricos.' });
      }

      const where = {};

      if (match) {
        where[Op.or] = [
          { name: { [Op.like]: `%${match}%` } },
          { description: { [Op.like]: `%${match}%` } },
        ];
      }

      if (priceRange) {
        const [min, max] = priceRange.split('-').map(Number);
        if (Number.isNaN(min) || Number.isNaN(max)) {
          return res.status(400).json({ error: 'Formato de price-range inválido. Use min-max (ex: 100-200).' });
        }
        where.price = { [Op.between]: [min, max] };
      }

      const include = [
        { model: Category, as: 'categories', attributes: ['id'], through: { attributes: [] } },
        { model: ProductImage, as: 'images' },
        { model: ProductOption, as: 'options' },
      ];

      if (category_ids) {
        const ids = category_ids.split(',').map(Number).filter((n) => !Number.isNaN(n));
        include[0].where = { id: { [Op.in]: ids } };
        include[0].required = true;
      }

      const allRows = await Product.findAll({ where, include });

      // Filtro opcional por option[id]=val1,val2
      let filteredRows = allRows;
      if (option && typeof option === 'object') {
        filteredRows = allRows.filter((prod) =>
          Object.entries(option).every(([optId, valStr]) => {
            const wanted = String(valStr).split(',').map((v) => v.trim());
            const prodOpt = (prod.options || []).find((o) => String(o.id) === String(optId));
            if (!prodOpt) return false;
            const prodVals = prodOpt.values.split(',').map((v) => v.trim());
            return wanted.some((w) => prodVals.includes(w));
          })
        );
      }

      const total = filteredRows.length;
      const paginated =
        parsedLimit === -1
          ? filteredRows
          : filteredRows.slice((parsedPage - 1) * parsedLimit, parsedPage * parsedLimit);

      return res.status(200).json({
        data: paginated.map((p) => formatProduct(p, fields)),
        total,
        limit: parsedLimit,
        page: parsedPage,
      });
    } catch (error) {
      return next(error);
    }
  },

  // GET /v1/product/:id
  async getById(req, res, next) {
    try {
      const product = await Product.findByPk(req.params.id, {
        include: [
          { model: Category, as: 'categories', attributes: ['id'], through: { attributes: [] } },
          { model: ProductImage, as: 'images' },
          { model: ProductOption, as: 'options' },
        ],
      });

      if (!product) return res.status(404).json({ error: 'Produto não encontrado.' });
      return res.status(200).json(formatProduct(product));
    } catch (error) {
      return next(error);
    }
  },

  // POST /v1/product
  async create(req, res, next) {
    try {
      const {
        enabled,
        name,
        slug,
        use_in_menu,
        stock,
        description,
        price,
        price_with_discount,
        category_ids,
        images,
        options,
      } = req.body;

      if (!name || !slug || price === undefined || price_with_discount === undefined) {
        return res.status(400).json({ error: 'Campos name, slug, price e price_with_discount são obrigatórios.' });
      }

      const product = await Product.create({
        enabled,
        name,
        slug,
        use_in_menu,
        stock,
        description,
        price,
        price_with_discount,
      });

      if (Array.isArray(category_ids) && category_ids.length > 0) {
        await product.setCategories(category_ids);
      }

      if (Array.isArray(images) && images.length > 0) {
        await ProductImage.bulkCreate(
          images.map((img) => ({
            product_id: product.id,
            enabled: true,
            path: img.content || img.path || '',
          }))
        );
      }

      if (Array.isArray(options) && options.length > 0) {
        await ProductOption.bulkCreate(
          options.map((opt) => ({
            product_id: product.id,
            title: opt.title,
            shape: opt.shape || 'square',
            radius: parseInt(opt.radius, 10) || 0,
            type: opt.type || 'text',
            values: normalizeValues(opt),
          }))
        );
      }

      const created = await Product.findByPk(product.id, {
        include: [
          { model: Category, as: 'categories', attributes: ['id'], through: { attributes: [] } },
          { model: ProductImage, as: 'images' },
          { model: ProductOption, as: 'options' },
        ],
      });

      return res.status(201).json(formatProduct(created));
    } catch (error) {
      return next(error);
    }
  },

  // PUT /v1/product/:id
  async update(req, res, next) {
    try {
      const product = await Product.findByPk(req.params.id);
      if (!product) return res.status(404).json({ error: 'Produto não encontrado.' });

      const {
        enabled,
        name,
        slug,
        use_in_menu,
        stock,
        description,
        price,
        price_with_discount,
        category_ids,
        images,
        options,
      } = req.body;

      await product.update({
        enabled: enabled ?? product.enabled,
        name: name ?? product.name,
        slug: slug ?? product.slug,
        use_in_menu: use_in_menu ?? product.use_in_menu,
        stock: stock ?? product.stock,
        description: description ?? product.description,
        price: price ?? product.price,
        price_with_discount: price_with_discount ?? product.price_with_discount,
      });

      if (Array.isArray(category_ids)) {
        await product.setCategories(category_ids);
      }

      if (Array.isArray(images)) {
        for (const img of images) {
          if (img.id && img.deleted) {
            await ProductImage.destroy({ where: { id: img.id, product_id: product.id } });
          } else if (img.id) {
            await ProductImage.update(
              { path: img.content || img.path },
              { where: { id: img.id, product_id: product.id } }
            );
          } else {
            await ProductImage.create({
              product_id: product.id,
              enabled: true,
              path: img.content || img.path || '',
            });
          }
        }
      }

      if (Array.isArray(options)) {
        for (const opt of options) {
          if (opt.id && opt.deleted) {
            await ProductOption.destroy({ where: { id: opt.id, product_id: product.id } });
          } else if (opt.id) {
            const updateData = {};
            if (opt.title !== undefined) updateData.title = opt.title;
            if (opt.shape !== undefined) updateData.shape = opt.shape;
            if (opt.radius !== undefined) updateData.radius = parseInt(opt.radius, 10) || 0;
            if (opt.type !== undefined) updateData.type = opt.type;
            if (opt.values !== undefined || opt.value !== undefined) updateData.values = normalizeValues(opt);
            await ProductOption.update(updateData, { where: { id: opt.id, product_id: product.id } });
          } else {
            await ProductOption.create({
              product_id: product.id,
              title: opt.title,
              shape: opt.shape || 'square',
              radius: parseInt(opt.radius, 10) || 0,
              type: opt.type || 'text',
              values: normalizeValues(opt),
            });
          }
        }
      }

      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  },

  // DELETE /v1/product/:id
  async remove(req, res, next) {
    try {
      const product = await Product.findByPk(req.params.id);
      if (!product) return res.status(404).json({ error: 'Produto não encontrado.' });

      await product.destroy();
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  },
};
