import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { ValidationError, ZodValidationPipe } from './zod-validation.pipe.js';

const pipe = new ZodValidationPipe(z.object({ name: z.string().trim().min(1), age: z.number().int() }));

describe('ZodValidationPipe', () => {
  it('returns the parsed value, transformed and without unknown keys', () => {
    expect(pipe.transform({ name: '  Dana ', age: 30, admin: true })).toEqual({ name: 'Dana', age: 30 });
  });

  it('throws a 400 ValidationError that names every invalid field', () => {
    let error: unknown;
    try {
      pipe.transform({ name: '', age: 'thirty' });
    } catch (e) {
      error = e;
    }

    expect(error).toBeInstanceOf(ValidationError);
    expect((error as ValidationError).httpStatus).toBe(400);
    expect((error as ValidationError).message).toMatch(/name/);
    expect((error as ValidationError).message).toMatch(/age/);
  });

  it('rejects a missing body', () => {
    expect(() => pipe.transform(undefined)).toThrow(ValidationError);
  });
});
