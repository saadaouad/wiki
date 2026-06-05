type keyError = { code?: string; constraint?: string; cause?: keyError };

const keyError = (error: unknown): keyError | undefined => {
  if (!error || typeof error !== 'object') {
    return undefined;
  }
  const e = error as keyError;
  if (e.code) {
    return e;
  }
  return e.cause?.code ? e.cause : undefined;
};

export const isDuplicateKeyError = (
  error: unknown,
  constraint?: string
): boolean => {
  const pg = keyError(error);
  if (pg?.code !== '23505') {
    return false;
  }
  return !constraint || pg.constraint === constraint;
};
