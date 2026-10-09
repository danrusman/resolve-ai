import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const occurrenceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Iluminação',
        'Equipamentos',
        'Acessibilidade',
        'Limpeza',
        'Vazamento',
        'Segurança',
        'Manutenção',
        'Outros',
      ],
    },
    location: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['ABERTA', 'EM_ANALISE', 'EM_ATENDIMENTO', 'RESOLVIDA', 'CANCELADA'],
      default: 'ABERTA',
    },
    priority: {
      type: String,
      enum: ['BAIXA', 'MEDIA', 'ALTA', 'CRITICA'],
      default: 'MEDIA',
    },
    assignedTo: {
      type: String,
      default: 'Não atribuído',
    },
    solutionDescription: {
      type: String,
      default: '',
    },
    evaluation: {
      rating: { type: Number, min: 1, max: 5 },
      feedback: { type: String, default: '' },
      evaluatedAt: { type: Date },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    comments: [commentSchema],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Occurrence', occurrenceSchema);