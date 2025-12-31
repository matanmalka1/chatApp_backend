import bcrypt from "bcrypt";
import db from "../models/index.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwtUtils.js";
import {
  validateEmail,
  validatePassword,
  validateUsername,
} from "../utils/validators.js";

const { User, RefreshToken } = db;

export const register = async (req, res, next) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    // Validation
    if (!validateUsername(username)) {
      return res
        .status(400)
        .json({ error: "Username must be 3-50 characters" });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    if (!validatePassword(password)) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName,
    });

    // Generate tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = await generateRefreshToken(user.id);

    // Remove password from response
    const userResponse = user.toJSON(); // ✅ FIXED: הוספתי את השורה הזו
    delete userResponse.password;

    res.status(201).json({
      message: "User registered successfully",
      user: userResponse,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Update online status
    await user.update({ isOnline: true, lastSeen: new Date() });

    // Generate tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = await generateRefreshToken(user.id);

    // Remove password from response
    const userResponse = user.toJSON();
    delete userResponse.password;

    res.json({
      message: "Login successful",
      user: userResponse,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token required" });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Check if token exists and is not revoked
    const tokenRecord = await RefreshToken.findOne({
      where: { token: refreshToken, isRevoked: false },
    });

    if (!tokenRecord) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    // Check if token is expired
    if (new Date() > tokenRecord.expiresAt) {
      await tokenRecord.update({ isRevoked: true });
      return res.status(401).json({ error: "Refresh token expired" });
    }

    // Generate new access token
    const accessToken = generateAccessToken(decoded.userId);

    res.json({ accessToken });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    // Update user online status
    await User.update(
      { isOnline: false, lastSeen: new Date() },
      { where: { id: req.user.id } }
    );

    // Revoke refresh token if provided
    if (refreshToken) {
      await RefreshToken.update(
        { isRevoked: true },
        { where: { token: refreshToken } }
      );
    }

    res.json({ message: "Logout successful" });
  } catch (error) {
    next(error);
  }
};
