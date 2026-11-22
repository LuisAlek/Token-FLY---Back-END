import { z } from 'zod';
import { OPTION_KEYS } from '../domain/quiz.entity';

const objectIdSchema = z
  .string()
  .regex(/^[a-f0-9]{24}$/i, 'El identificador no es válido.');

const questionText = (label: string) =>
  z
    .string({ error: `${label} es obligatorio.` })
    .trim()
    .min(2, `${label} debe tener al menos 2 caracteres.`)
    .max(400, `${label} no puede superar los 400 caracteres.`);

export const optionKeySchema = z.enum(OPTION_KEYS, {
  error: 'La opción debe ser A, B, C o D.',
});

const questionSchema = z.object({
  statement: questionText('El enunciado'),
  incorrectOptions: z
    .array(questionText('Cada opción incorrecta'))
    .length(3, 'Debes registrar exactamente 3 opciones incorrectas.')
    .default([]),
  correctOption: questionText('La opción correcta'),
  explanation: z
    .string()
    .trim()
    .max(400, 'La explicación no puede superar los 400 caracteres.')
    .optional()
    .default(''),
});

export const quizWriteSchema = z.object({
  title: z
    .string({ error: 'El título es obligatorio.' })
    .trim()
    .min(2, 'El título debe tener entre 2 y 70 caracteres.')
    .max(70, 'El título debe tener entre 2 y 70 caracteres.'),
  description: z
    .string({ error: 'La descripción es obligatoria.' })
    .trim()
    .min(10, 'La descripción debe tener entre 10 y 400 caracteres.')
    .max(400, 'La descripción debe tener entre 10 y 400 caracteres.'),
  status: z.enum(['draft', 'published']).default('draft'),
  questions: z
    .array(questionSchema)
    .min(1, 'Agrega al menos una pregunta antes de guardar.')
    .max(50, 'Un cuestionario no puede superar las 50 preguntas.'),
});

export const checkAnswerSchema = z.object({
  questionId: objectIdSchema,
  optionKey: optionKeySchema,
});

export const submitQuizSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: objectIdSchema,
        selectedKeys: z
          .array(optionKeySchema)
          .min(1, 'Cada respuesta debe incluir al menos una opción.')
          .max(OPTION_KEYS.length),
      }),
    )
    .min(1, 'Debes enviar al menos una respuesta.'),
});

export const saveQuizProgressSchema = z.object({
  currentIndex: z.number().int().min(0).max(49).default(0),
  answers: z
    .array(
      z.object({
        questionId: objectIdSchema,
        selectedKeys: z.array(optionKeySchema).min(1).max(OPTION_KEYS.length),
      }),
    )
    .max(50)
    .default([]),
  correctByQuestion: z.record(z.string(), optionKeySchema).default({}),
});
