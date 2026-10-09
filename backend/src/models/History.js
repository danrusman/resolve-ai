import mongoose from 'mongoose';

const historySchema = new mongoose.Schema(
  {
    occurrenceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Occurrence',
      required: true,
    },
    previousStatus: {
      type: String,
      required: true,
    },
    newStatus: {
      type: String,
      required: true,
      enum: ['ABERTA', 'EM_ANALISE', 'EM_ATENDIMENTO', 'RESOLVIDA', 'CANCELADA'],
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    observation: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('History', historySchema);