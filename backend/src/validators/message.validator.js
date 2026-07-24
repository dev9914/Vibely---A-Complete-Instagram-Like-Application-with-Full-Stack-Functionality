import Joi from "joi";

export const sendMessageSchema = Joi.object({
  message: Joi.string().trim().max(5000).allow("").default(""),
  type: Joi.string().valid("text", "image", "video", "file", "voice").default("text"),
  replyTo: Joi.string().hex().length(24).optional().allow(null),
  clientId: Joi.string().max(100).optional().allow(null),
  attachments: Joi.array()
    .items(
      Joi.object({
        url: Joi.string().uri().required(),
        type: Joi.string()
          .valid("image", "video", "pdf", "zip", "document", "voice", "file")
          .required(),
        name: Joi.string().allow("").default(""),
        size: Joi.number().min(0).default(0),
        duration: Joi.number().optional(),
        mimeType: Joi.string().allow("").default(""),
      }),
    )
    .max(10)
    .default([]),
});

export const conversationSettingsSchema = Joi.object({
  muted: Joi.boolean().optional(),
  archived: Joi.boolean().optional(),
}).or("muted", "archived");
