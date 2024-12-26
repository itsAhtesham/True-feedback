import {z} from 'zod';

export const messagesSchema = z.object({
    content: z
        .string()
        .min(10, {message: "Content must be atleast of 10 characters"})
        .max(300, {message: "Content must not be more than 300 characters"})
})