import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import Product from './models/Product.js';
import Order from './models/Order.js';

import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRouter from './routes/auth.js';
import { protect, authorize } from './middleware/auth.js';


dotenv.config({ path: process.env.ENV_FILE || './backend/.env' });

const app = express();
if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1);
app.use(helmet());
app.use(cookieParser());

const PORT = Number(process.env.PORT) || 3000;
const MONGODB_URI = process.env.MONGODB_URI;
const allowedOrigins = (
    process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:4173'
)
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

// Middleware: CORS. Requests without Origin (health checks, curl) are allowed.
app.use(
    cors({
        origin(origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            return callback(
                new Error('Источник запроса не разрешён политикой CORS')
            );
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    })
);

// Middleware: basic security headers.
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    next();
});

// Middleware: request logging (without logging request bodies or passwords).
app.use((req, res, next) => {
    const startedAt = Date.now();
    res.on('finish', () => {
        console.log(
            `${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - startedAt}ms`
        );
    });
    next();
});

// Middleware: parse JSON with a request-size limit.
app.use(express.json({ limit: '1mb' }));
app.use('/api/auth', authRouter);

const allowedProductTypes = ['vegetables', 'drinks'];

function validateProductBody(req, res, next) {
    const { id, title, type, price, poster, rating } = req.body ?? {};
    const numericId = Number(id);
    const numericPrice = Number(price);
    const numericRating =
        rating === undefined || rating === null || rating === ''
            ? undefined
            : Number(rating);

    if (!Number.isInteger(numericId) || numericId < 1) {
        return res.status(400).json({
            message: 'ID товара должен быть положительным целым числом'
        });
    }
    if (typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({ message: 'Укажите наименование товара' });
    }
    if (!allowedProductTypes.includes(type)) {
        return res
            .status(400)
            .json({ message: 'Тип товара должен быть vegetables или drinks' });
    }
    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
        return res
            .status(400)
            .json({ message: 'Стоимость должна быть числом не меньше 0' });
    }
    if (typeof poster !== 'string' || !poster.trim()) {
        return res
            .status(400)
            .json({ message: 'Укажите путь к изображению товара' });
    }
    if (
        numericRating !== undefined &&
        (!Number.isFinite(numericRating) ||
            numericRating < 0 ||
            numericRating > 10)
    ) {
        return res
            .status(400)
            .json({ message: 'Рейтинг должен быть числом от 0 до 10' });
    }

    req.validatedProduct = {
        id: numericId,
        title: title.trim(),
        type,
        price: numericPrice,
        poster: poster.trim(),
        ...(numericRating === undefined ? {} : { rating: numericRating })
    };
    next();
}

function validateProductParams(req, res, next) {
    const id = Number(req.params.id);
    if (
        !Number.isInteger(id) ||
        id < 1 ||
        !allowedProductTypes.includes(req.params.type)
    ) {
        return res
            .status(400)
            .json({ message: 'Некорректный тип или ID товара' });
    }
    req.productId = id;
    next();
}

function validateOrderItems(items) {
    if (!Array.isArray(items) || items.length === 0) {
        return { error: 'Заказ должен содержать хотя бы один товар' };
    }
    if (items.length > 100) {
        return { error: 'В одном заказе не может быть больше 100 позиций' };
    }

    const normalized = [];
    for (const item of items) {
        const productId = Number(item?.productId);
        const price = Number(item?.price);
        const quantity = Number(item?.quantity);
        const productType = item?.productType;
        const title = typeof item?.title === 'string' ? item.title.trim() : '';
        const poster =
            typeof item?.poster === 'string' ? item.poster.trim() : '';

        if (
            !Number.isInteger(productId) ||
            productId < 1 ||
            !allowedProductTypes.includes(productType) ||
            !title ||
            !Number.isFinite(price) ||
            price < 0 ||
            !Number.isInteger(quantity) ||
            quantity < 1 ||
            quantity > 10000 ||
            !poster
        ) {
            return {
                error: 'Проверьте ID, тип, наименование, цену, количество и изображение товаров'
            };
        }

        normalized.push({
            productId,
            productType,
            title,
            price,
            quantity,
            poster
        });
    }
    return { items: normalized };
}

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false
});
const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false
});
app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);

app.get('/', (req, res) => {
    res.json({ message: 'Сервер работает', status: 'ok' });
});

app.get('/health', (req, res) => {
    const connected = mongoose.connection.readyState === 1;
    res.status(connected ? 200 : 503).json({
        status: connected ? 'ok' : 'database_unavailable',
        database: connected ? 'connected' : 'disconnected'
    });
});

// Products
app.post(
    '/api/products',
    protect,
    authorize('admin'),
    validateProductBody,
    async (req, res, next) => {
        try {
            const product = await Product.create(req.validatedProduct);
            res.status(201).json(product);
        } catch (error) {
            next(error);
        }
    }
);

app.get('/api/products', async (req, res, next) => {
    try {
        res.json(await Product.find({}).sort({ type: 1, id: 1 }).lean());
    } catch (error) {
        next(error);
    }
});

app.get(
    '/api/products/:type/:id',
    validateProductParams,
    async (req, res, next) => {
        try {
            const product = await Product.findOne({
                type: req.params.type,
                id: req.productId
            }).lean();
            if (!product)
                return res.status(404).json({ message: 'Товар не найден' });
            res.json(product);
        } catch (error) {
            next(error);
        }
    }
);

app.put(
    '/api/products/:type/:id',
    protect,
    authorize('admin'),
    validateProductParams,
    validateProductBody,
    async (req, res, next) => {
        try {
            if (
                req.validatedProduct.id !== req.productId ||
                req.validatedProduct.type !== req.params.type
            ) {
                return res.status(400).json({
                    message:
                        'ID и тип товара в адресе должны совпадать с данными товара'
                });
            }
            const product = await Product.findOneAndUpdate(
                { type: req.params.type, id: req.productId },
                req.validatedProduct,
                { new: true, runValidators: true }
            );
            if (!product)
                return res.status(404).json({ message: 'Товар не найден' });
            res.json(product);
        } catch (error) {
            next(error);
        }
    }
);

app.delete(
    '/api/products/:type/:id',
    protect,
    authorize('admin'),
    validateProductParams,
    async (req, res, next) => {
        try {
            const product = await Product.findOneAndDelete({
                type: req.params.type,
                id: req.productId
            });
            if (!product)
                return res.status(404).json({ message: 'Товар не найден' });
            res.json({ message: 'Товар успешно удалён', product });
        } catch (error) {
            next(error);
        }
    }
);

// Orders
app.post('/api/orders', protect, async (req, res, next) => {
    try {
        const validation = validateOrderItems(req.body?.items);

        if (validation.error)
            return res.status(400).json({ message: validation.error });
        // Calculate total on the server; don't trust a total sent by the browser.
        const items = validation.items;
        const total = items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );
        const order = await Order.create({ items, total, user: req.user._id });
        res.status(201).json(order);
    } catch (error) {
        next(error);
    }
});

app.get('/api/orders', protect, authorize('admin'), async (req, res, next) => {
    try {
        res.json(await Order.find({}).sort({ createdAt: -1 }).lean());
    } catch (error) {
        next(error);
    }
});

app.get('/api/orders/:id', protect, async (req, res, next) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'Некорректный ID заказа' });
        }
        const order = await Order.findById(req.params.id).lean();
        if (!order) return res.status(404).json({ message: 'Заказ не найден' });
        const isOwner = order.user?.toString() === req.user._id.toString();
        if (req.user.role !== 'admin' && !isOwner)
            return res.status(403).json({ message: 'Нет доступа' });
        res.json(order);
    } catch (error) {
        next(error);
    }
});

app.put(
    '/api/orders/:id',
    protect,
    authorize('admin'),
    async (req, res, next) => {
        try {
            if (!mongoose.isValidObjectId(req.params.id)) {
                return res
                    .status(400)
                    .json({ message: 'Некорректный ID заказа' });
            }
            const validation = validateOrderItems(req.body?.items);
            if (validation.error)
                return res.status(400).json({ message: validation.error });
            const items = validation.items;
            const total = items.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
            );
            const order = await Order.findByIdAndUpdate(
                req.params.id,
                { items, total },
                { new: true, runValidators: true }
            );
            if (!order)
                return res.status(404).json({ message: 'Заказ не найден' });
            res.json(order);
        } catch (error) {
            next(error);
        }
    }
);

app.delete(
    '/api/orders/:orderId/items/:itemIndex',
    protect,
    authorize('admin'),
    async (req, res, next) => {
        try {
            const { orderId } = req.params;
            const index = Number(req.params.itemIndex);
            if (!mongoose.isValidObjectId(orderId)) {
                return res
                    .status(400)
                    .json({ message: 'Некорректный ID заказа' });
            }
            if (!Number.isInteger(index) || index < 0) {
                return res
                    .status(400)
                    .json({ message: 'Некорректный индекс товара' });
            }
            const order = await Order.findById(orderId);
            if (!order)
                return res.status(404).json({ message: 'Заказ не найден' });
            if (index >= order.items.length)
                return res
                    .status(404)
                    .json({ message: 'Товар в заказе не найден' });

            order.items.splice(index, 1);
            if (order.items.length === 0) {
                await Order.findByIdAndDelete(orderId);
                return res.json({
                    message: 'Пустой заказ удалён',
                    deletedOrder: true,
                    orderId
                });
            }
            order.total = order.items.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
            );
            await order.save();
            res.json({
                message: 'Товар удалён из заказа',
                deletedOrder: false,
                order
            });
        } catch (error) {
            next(error);
        }
    }
);

app.delete(
    '/api/orders/:id',
    protect,
    authorize('admin'),
    async (req, res, next) => {
        try {
            if (!mongoose.isValidObjectId(req.params.id)) {
                return res
                    .status(400)
                    .json({ message: 'Некорректный ID заказа' });
            }
            const order = await Order.findByIdAndDelete(req.params.id);
            if (!order)
                return res.status(404).json({ message: 'Заказ не найден' });
            res.json({ message: 'Заказ успешно удалён', order });
        } catch (error) {
            next(error);
        }
    }
);

// Middleware: JSON 404 for unknown API paths.
app.use((req, res) => {
    res.status(404).json({ message: 'Маршрут не найден' });
});

// Middleware: centralized error handler.
app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    console.error('Ошибка API:', error.message);

    if (error.type === 'entity.too.large') {
        return res
            .status(413)
            .json({ message: 'Размер запроса превышает 1 МБ' });
    }
    if (error.message === 'Источник запроса не разрешён политикой CORS') {
        return res.status(403).json({ message: error.message });
    }
    if (error.name === 'ValidationError' || error.name === 'CastError') {
        return res.status(400).json({ message: 'Проверьте переданные данные' });
    }
    if (error.code === 11000) {
        return res
            .status(409)
            .json({ message: 'Товар с таким ID и типом уже существует' });
    }
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
});

async function startServer() {
    if (!MONGODB_URI) {
        console.error(
            'Не задана переменная окружения MONGODB_URI. Проверьте .env или настройки Docker.'
        );
        process.exitCode = 1;
        return;
    }

    try {
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 10000
        });
        console.log('Успешно подключено к MongoDB.');
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Сервер API запущен на порту ${PORT}`);
        });
    } catch (error) {
        console.error('Не удалось подключиться к MongoDB:', error.message);
        process.exitCode = 1;
    }
}

startServer();
