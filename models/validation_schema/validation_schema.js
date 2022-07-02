const Joi = require("joi");
const sanitizeHtml = require("sanitize-html");

const extension = (joi) => ({
  type: "string",
  base: joi.string(),
  messages: { "string.escapeHTML": "{{#label}} must not include HTML" },
  rules: {
    escapeHTML: {
      validate(value, helpers) {
        const clean = sanitizeHtml(value, {
          allowedTags: [],
          allowedAttributes: {},
        });
        if (clean !== value)
          return helpers.error("string.escapeHTML", { value });
        return clean;
      },
    },
  },
});

const joi = Joi.extend(extension);

const Image = joi.object().keys({
  url: joi.string().escapeHTML().required(),
  filename: joi.string().escapeHTML().required(),
});

const geometry = joi.object().keys({
  type: joi.string().escapeHTML().valid("Point"),
  coordinates: joi
    .array()
    .length(2)
    .items(
      joi.number().required().min(-180).max(180), //lon
      joi.number().required().min(-90).max(90) //lat
    )
    .required(),
});

const campGroundSchema = joi.object({
  campground: joi
    .object({
      title: joi.string().escapeHTML().required(),
      images: joi.array().items(Image).required(),
      price: joi.number().required().min(0),
      description: joi.string().escapeHTML().required(),
      location: joi.string().escapeHTML().required(),
      geometry: geometry,
      review: joi.array().items(joi.string().escapeHTML()),
    })
    .required(),
});

const reviewSchema = joi.object({
  review: joi
    .object({
      body: joi.string().escapeHTML().required(),
      rating: joi.number().required().min(1).max(5),
    })
    .required(),
});

module.exports = { campGroundSchema, reviewSchema };
