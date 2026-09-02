import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    originalFilename: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    storageKey: {
      type: String,
      required: true
    },
    rawText: {
      type: String,
      default: ''
    },
    parsedData: {
      skills: {
        type: [String],
        default: []
      },
      experienceYears: {
        type: Number,
        default: 0
      },
      education: [
        {
          degree: { type: String, default: '' },
          institution: { type: String, default: '' },
          graduationYear: { type: Number }
        }
      ],
      workHistory: [
        {
          company: { type: String, default: '' },
          role: { type: String, default: '' },
          duration: { type: String, default: '' },
          highlights: { type: [String], default: [] }
        }
      ],
      projects: [
        {
          title: { type: String, default: '' },
          technologies: { type: [String], default: [] },
          description: { type: String, default: '' }
        }
      ]
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// When a resume is marked as default, unset previous default for this user
resumeSchema.pre('save', async function () {
  if (this.isModified('isDefault') && this.isDefault) {
    await this.constructor.updateMany(
      { userId: this.userId, _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    );
  }
});

export const Resume = mongoose.model('Resume', resumeSchema);
export default Resume;
