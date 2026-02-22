
import Intern from '../models/Intern.js';
import mongoose from 'mongoose';

function errorResponse(res, message, code, status = 400) {
  return res.status(status).json({ error: { message, code } });
}

export const createIntern = async (req, res, next) => {
  try {
    const { name, email, role, status, score } = req.body;
    const intern = await Intern.create({ name, email, role, status, score });
    res.status(201).json(intern);
  } catch (err) {
    if (err.code === 11000) {
      return errorResponse(res, 'Email already exists', 'DUPLICATE_EMAIL', 409);
    }
    if (err.name === 'ValidationError') {
      return errorResponse(res, err.message, 'VALIDATION_ERROR', 400);
    }
    next(err);
  }
};

export const listInterns = async (req, res, next) => {
  try {
    let { q = '', status, role, page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const filter = {};
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ];
    }
    if (status) filter.status = status;
    if (role) filter.role = role;
    const total = await Intern.countDocuments(filter);
    const interns = await Intern.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    res.json({
      data: interns,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getIntern = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return errorResponse(res, 'Invalid ID', 'INVALID_ID', 400);
    }
    const intern = await Intern.findById(req.params.id);
    if (!intern) {
      return errorResponse(res, 'Intern not found', 'NOT_FOUND', 404);
    }
    res.json(intern);
  } catch (err) {
    next(err);
  }
};

export const updateIntern = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return errorResponse(res, 'Invalid ID', 'INVALID_ID', 400);
    }
    const intern = await Intern.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!intern) {
      return errorResponse(res, 'Intern not found', 'NOT_FOUND', 404);
    }
    res.json(intern);
  } catch (err) {
    if (err.code === 11000) {
      return errorResponse(res, 'Email already exists', 'DUPLICATE_EMAIL', 409);
    }
    if (err.name === 'ValidationError') {
      return errorResponse(res, err.message, 'VALIDATION_ERROR', 400);
    }
    next(err);
  }
};

export const deleteIntern = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return errorResponse(res, 'Invalid ID', 'INVALID_ID', 400);
    }
    const intern = await Intern.findByIdAndDelete(req.params.id);
    if (!intern) {
      return errorResponse(res, 'Intern not found', 'NOT_FOUND', 404);
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
