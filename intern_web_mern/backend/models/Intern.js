import mongoose from 'mongoose';

const internSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
  },
  role: {
    type: String,
    required: true,
    enum: ['Frontend', 'Backend', 'Fullstack']
  },
  status: {
    type: String,
    required: true,
    enum: ['Applied', 'Interviewing', 'Hired', 'Rejected']
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  }
}, { timestamps: true });

const Intern = mongoose.model('Intern', internSchema);
export default Intern;
