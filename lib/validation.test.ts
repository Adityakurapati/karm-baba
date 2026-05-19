import { test, describe } from 'node:test';
import * as assert from 'node:assert';
import { isValidEmail, validatePassword, sanitizeInput } from './validation';

describe('Validation Utilities', () => {
  describe('isValidEmail', () => {
    test('should return true for valid emails', () => {
      assert.strictEqual(isValidEmail('test@example.com'), true);
      assert.strictEqual(isValidEmail('user.name+tag@domain.co.uk'), true);
    });

    test('should return false for invalid emails', () => {
      assert.strictEqual(isValidEmail('invalid-email'), false);
      assert.strictEqual(isValidEmail('test@.com'), false);
      assert.strictEqual(isValidEmail('@example.com'), false);
      assert.strictEqual(isValidEmail('test@example.'), false);
    });
  });

  describe('validatePassword', () => {
    test('should reject passwords shorter than 8 chars', () => {
      const result = validatePassword('Aa1!bcd');
      assert.strictEqual(result.isValid, false);
      assert.strictEqual(result.requirements.length, false);
    });

    test('should reject passwords without uppercase', () => {
      const result = validatePassword('password123!');
      assert.strictEqual(result.isValid, false);
      assert.strictEqual(result.requirements.uppercase, false);
    });

    test('should reject passwords without lowercase', () => {
      const result = validatePassword('PASSWORD123!');
      assert.strictEqual(result.isValid, false);
      assert.strictEqual(result.requirements.lowercase, false);
    });

    test('should reject passwords without numbers', () => {
      const result = validatePassword('Password!');
      assert.strictEqual(result.isValid, false);
      assert.strictEqual(result.requirements.number, false);
    });

    test('should reject passwords without special characters', () => {
      const result = validatePassword('Password123');
      assert.strictEqual(result.isValid, false);
      assert.strictEqual(result.requirements.special, false);
    });

    test('should accept valid strong passwords', () => {
      const result = validatePassword('StrongP@ssw0rd');
      assert.strictEqual(result.isValid, true);
      assert.strictEqual(result.strength, 5);
      assert.strictEqual(result.requirements.length, true);
      assert.strictEqual(result.requirements.uppercase, true);
      assert.strictEqual(result.requirements.lowercase, true);
      assert.strictEqual(result.requirements.number, true);
      assert.strictEqual(result.requirements.special, true);
    });
  });

  describe('sanitizeInput', () => {
    test('should trim whitespace', () => {
      assert.strictEqual(sanitizeInput('  hello  '), 'hello');
    });

    test('should remove basic html tags characters', () => {
      assert.strictEqual(sanitizeInput('<script>alert("xss")</script>'), 'scriptalert("xss")/script');
    });

    test('should return empty string for null/undefined-like input', () => {
      assert.strictEqual(sanitizeInput(''), '');
    });
  });
});
