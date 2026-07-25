import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_change_me_in_prod';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'super_refresh_secret_key_change_me_in_prod';

export const generateTokens = (userId: string, role: string) => {
  const accessToken = jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId, role }, REFRESH_SECRET, { expiresIn: '7d' });
  
  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, REFRESH_SECRET) as { userId: string; role: string };
};
