import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/users";

const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_NAME = "medflow_token";

// register (patient)
export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;
    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(400).json({ message: "Email already used" });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash, phone, role: "patient" });
    res.status(201).json({ id: user.id, email: user.email, name: user.name });
  } catch (err) { next(err); }
};

// login (patient or doctor)
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email }});
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    // set httpOnly cookie
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({ id: user.id, name: user.name, role: user.role });
  } catch (err) { next(err); }
};

export const logout = (req, res) => {
  res.clearCookie(COOKIE_NAME);
  res.json({ ok: true });
};
