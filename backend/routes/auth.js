import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = Router();

const ACCESS_TTL = '15m';
const REFRESH_TTL = '7d';
// Secure только если запрос реально по HTTPS (req.secure) или за прокси с X-Forwarded-Proto: https
const isHttps = (req) => req.secure || req.headers['x-forwarded-proto'] === 'https';

function signAccess(user) {
    return jwt.sign({ sub: user._id.toString(), role: user.role }, process.env.JWT_ACCESS_SECRET, {
        expiresIn: ACCESS_TTL
    });
}
function signRefresh(user) {
    return jwt.sign({ sub: user._id.toString() }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: REFRESH_TTL
    });
}

function setAuthCookies(req, res, access, refresh) {
    const secure = isHttps(req);
    const base = { httpOnly: true, secure, sameSite: secure ? 'none' : 'lax', path: '/' };
    res.cookie('accessToken', access, { ...base, maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', refresh, { ...base, maxAge: 7 * 24 * 60 * 60 * 1000 });
}

function validateCreds(body) {
    const username = typeof body?.username === 'string' ? body.username.trim() : '';
    const password = typeof body?.password === 'string' ? body.password : '';
    if (username.length < 3 || username.length > 32) return { error: 'Логин от 3 до 32 символов' };
    if (password.length < 6 || password.length > 128) return { error: 'Пароль от 6 до 128 символов' };
    return { username, password };
}

router.post('/register', async (req, res, next) => {
    try {
        const v = validateCreds(req.body);
        if (v.error) return res.status(400).json({ message: v.error });

        const exists = await User.findOne({ username: v.username });
        if (exists) return res.status(409).json({ message: 'Пользователь уже существует' });

        // Первый зарегистрированный может стать админом вручную в БД.
        const user = await User.create({ username: v.username, passwordHash: v.password });
        const access = signAccess(user);
        const refresh = signRefresh(user);
        setAuthCookies(req, res, access, refresh);
        res.status(201).json({ user: user.toSafeJSON() });
    } catch (e) { next(e); }
});

router.post('/login', async (req, res, next) => {
    try {
        const v = validateCreds(req.body);
        if (v.error) return res.status(400).json({ message: v.error });

        const user = await User.findOne({ username: v.username });
        if (!user) return res.status(401).json({ message: 'Неверный логин или пароль' });

        const ok = await user.comparePassword(v.password);
        if (!ok) return res.status(401).json({ message: 'Неверный логин или пароль' });

        const access = signAccess(user);
        const refresh = signRefresh(user);
        setAuthCookies(req, res, access, refresh);
        res.json({ user: user.toSafeJSON() });
    } catch (e) { next(e); }
});

router.post('/refresh', async (req, res) => {
    try {
        const token = req.cookies?.refreshToken;
        if (!token) return res.status(401).json({ message: 'Нет refresh-токена' });
        const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(payload.sub);
        if (!user) return res.status(401).json({ message: 'Пользователь не найден' });

        const access = signAccess(user);
        const refresh = signRefresh(user);
        setAuthCookies(req, res, access, refresh);
        res.json({ user: user.toSafeJSON() });
    } catch {
        return res.status(401).json({ message: 'Недействительный refresh-токен' });
    }
});

router.post('/logout', (req, res) => {
    res.clearCookie('accessToken', { path: '/' });
    res.clearCookie('refreshToken', { path: '/' });
    res.json({ message: 'Вы вышли' });
});

router.get('/me', protect, (req, res) => {
    res.json({ user: req.user.toSafeJSON() });
});

export default router;