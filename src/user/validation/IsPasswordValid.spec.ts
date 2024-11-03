import { ValidationArguments } from 'class-validator';
import { IsPasswordValidConstraint } from './IsPasswordValid';

// npm run test IsPasswordValid --coverage
describe('IsPasswordValid', () => {
  const validationArguments = {
    value: '',
    object: {},
    targetName: '',
    property: '',
    constraints: [],
  } as ValidationArguments;

  it('should be defined', () => {
    expect(new IsPasswordValidConstraint()).toBeDefined();
  });

  it('should return true when password is valid', () => {
    const password = '01234aA!'; // 11111111aA!
    const constraint = new IsPasswordValidConstraint();
    const isValid = constraint.validate(password, validationArguments);
    expect(isValid).toBe(true);
  });

  it('should return true when password is valid', () => {
    const password = '01234567890123456789012345678901234567890123456789012345678901234567aA!';
    const constraint = new IsPasswordValidConstraint();
    const isValid = constraint.validate(password, validationArguments);
    expect(isValid).toBe(true);
  });

  it('should return false when password is less than 8 characters', () => {
    const password = '0123aA!';
    const constraint = new IsPasswordValidConstraint();
    const isValid = constraint.validate(password, validationArguments);
    expect(isValid).toBe(false);
  });

  it('should return false when password is more than 71 characters', () => {
    const password = '01234567890123456789012345678901234567890123456789012345678901234567aA!0';
    const constraint = new IsPasswordValidConstraint();
    const isValid = constraint.validate(password, validationArguments);
    expect(isValid).toBe(false);
  });

  it('should return false when password does not contain at least 1 number', () => {
    const password = 'aaaaaaA!';
    const constraint = new IsPasswordValidConstraint();
    const isValid = constraint.validate(password, validationArguments);
    expect(isValid).toBe(false);
  });

  it('should return false when password does not contain at least 1 lowecase letter', () => {
    const password = '012345A!';
    const constraint = new IsPasswordValidConstraint();
    const isValid = constraint.validate(password, validationArguments);
    expect(isValid).toBe(false);
  });

  it('should return false when password does not contain at least 1 uppercase letter', () => {
    const password = '012345a!';
    const constraint = new IsPasswordValidConstraint();
    const isValid = constraint.validate(password, validationArguments);
    expect(isValid).toBe(false);
  });

  it('should return false when password does not contain at least 1 special character', () => {
    const password = '012345aA';
    const constraint = new IsPasswordValidConstraint();
    const isValid = constraint.validate(password, validationArguments);
    expect(isValid).toBe(false);
  });
});
