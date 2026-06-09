const mongoose = require('mongoose');

const episodeSchema = new mongoose.Schema({
  episodeNumber: { type: Number, required: true },
  title: { type: String, required: true },
  videoUrl: { type: String, required: true },
  duration: { type: String, default: '24:00' },
  uploadedAt: { type: Date, default: Date.now }
});

const seasonSchema = new mongoose.Schema({
  seasonNumber: { type: Number, required: true },
  episodes: [episodeSchema]
});

const animeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  alternativeNames: [String],
  description: { type: String, required: true },
  poster: { type: String, required: true },
  banner: { type: String, required: true },
  genres: [String],
  status: { type: String, enum: ['Ongoing', 'Completed', 'Upcoming'], default: 'Ongoing' },
  studio: { type: String },
  rating: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  seasons: [seasonSchema]
}, { timestamps: true });

module.exports = mongoose.model('Anime', animeSchema);
