import { z } from 'zod'

export const taxiRequestSchema = z.object({
  pickupAddress: z.string().trim().min(3, 'taxi.validation.address').max(500, 'taxi.validation.addressLength'),
  destinationAddress: z.string().trim().min(3, 'taxi.validation.address').max(500, 'taxi.validation.addressLength'),
  taxiType: z.enum(['standard', 'vip']),
  proposedFare: z.preprocess(
    (value) => value === '' || Number.isNaN(value) ? undefined : value,
    z.number().positive('taxi.validation.fare').max(1000000, 'taxi.validation.fare').optional(),
  ),
  note: z.string().trim().max(1000, 'taxi.validation.note').optional().default(''),
}).superRefine((value, context) => {
  if (value.taxiType === 'standard' && !Number.isFinite(value.proposedFare)) {
    context.addIssue({ code: 'custom', path: ['proposedFare'], message: 'taxi.validation.standardFare' })
  }
})

export const taxiRatingSchema = z.object({
  score: z.coerce.number().int().min(1, 'taxi.validation.rating').max(5, 'taxi.validation.rating'),
  comment: z.string().trim().max(500, 'taxi.validation.comment').optional().default(''),
})

export const vipFareSchema = z.object({
  fare: z.coerce.number().positive('taxi.validation.fare').max(1000000, 'taxi.validation.fare'),
})