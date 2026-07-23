import User from "../models/User.js";
import { generateToken } from "../middleware/authMiddleware.js";

const setTokenCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

// ==================== REGISTER ====================
export const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      college,
      department,
      semester,
    } = req.body;

    const existing = await User.findOne({ email });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      college: college || "",
      department: department || "",
      semester: Number(semester) || 1,
    });

    const token = generateToken(user._id);

    setTokenCookie(res, token);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        college: user.college,
        department: user.department,
        semester: user.semester,
        avatar: user.avatar,
        streak: user.streak,
        studyHours: user.studyHours,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==================== LOGIN ====================
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Update streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (user.lastActiveDate) {
      const last = new Date(user.lastActiveDate);
      last.setHours(0, 0, 0, 0);

      const diffDays = Math.floor(
        (today - last) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 1) {
        user.streak = (user.streak || 0) + 1;
      } else if (diffDays > 1) {
        user.streak = 1;
      }
    } else {
      user.streak = 1;
    }

    user.lastActiveDate = today;

    await user.save();

    const token = generateToken(user._id);

    setTokenCookie(res, token);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        college: user.college,
        department: user.department,
        semester: user.semester,
        avatar: user.avatar,
        streak: user.streak,
        studyHours: user.studyHours,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==================== GET PROFILE ====================
export const getProfile = async (req, res) => {
  const user = req.user;

  res.json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      college: user.college,
      department: user.department,
      semester: user.semester,
      avatar: user.avatar,
      streak: user.streak,
      studyHours: user.studyHours,
      achievements: user.achievements || [],
      createdAt: user.createdAt,
    },
  });
};

// ==================== UPDATE PROFILE ====================
export const updateProfile = async (req, res, next) => {
  try {
    const user = req.user;

    const {
      name,
      college,
      department,
      semester,
      avatar,
    } = req.body;

    if (name !== undefined) user.name = name;
    if (college !== undefined) user.college = college;
    if (department !== undefined) user.department = department;
    if (semester !== undefined) user.semester = semester;
    if (avatar !== undefined) user.avatar = avatar;

    const updated = await user.save();

    res.json({
      success: true,
      user: {
        _id: updated._id,
        name: updated.name,
        email: updated.email,
        college: updated.college,
        department: updated.department,
        semester: updated.semester,
        avatar: updated.avatar,
        streak: updated.streak,
        studyHours: updated.studyHours,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==================== CHANGE PASSWORD ====================
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select("+password");

    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.password = newPassword;

    await user.save();

    res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ==================== LOGOUT ====================
export const logout = async (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.json({
    success: true,
    message: "Logged out successfully",
  });
};