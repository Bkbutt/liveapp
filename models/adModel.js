const mongoose = require('mongoose');

const adSchema = new mongoose.Schema({
  adTitle: { type: String, required: true },
  city: { type: String, required: true },
  adFile: { type: String, required: true }, // Assuming the file path is stored as a string
  ageGroup: { type: String, required: true },
  adType: { type: String, required: true },
  content: { type: String, required: true },
  likes: { type: Number, default: 0 },
  comments: [{ type: String }],
  interestedAgeGroups: [{ type: String }], // Interested age groups for this ad
  interestedCities: [{ type: String }], // Interested cities for this ad
});

const Ad = mongoose.model('Ad', adSchema);
module.exports = Ad;