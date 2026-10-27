import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const ACCESS_SECRET = () => {
    const s = process.env.JWT_ACCESS_SECRET;
    if (!s) throw new Error('JWT_ACCESS_SECRET не задан');
    return s;
};

// Проверяет access-токен из httpOnly cookie (или Authorization: Bearer — для curl).
export async function protect(req, res, next) {
    try {
        let token = req.cookies?.accessToken;
        const header = req.headers.authorization;
        if (!token && header?.startsWith('Bearer ')) token = header.slice(7);
        if (!token) return res.status(401).json({ message: 'Требуется авторизация' });

        const payload = jwt.verify(token, ACCESS_SECRET());
        const user = await User.findById(payload.sub);
        if (!user) return res.status(401).json({ message: 'Пользователь не найден' });

        req.user = user;
        next();
    } catch {
        return res.status(401).json({ message: 'Недействительный или истёкший токен' });
    }
}

export function authorize(...roles) {
    return (req, res, next) => {
        if (!req.user) return res.status(401).json({ message: 'Требуется авторизация' });
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Недостаточно прав' });
        }
        next();
    };
}