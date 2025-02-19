import * as Sentry from '@sentry/node';

import { logger } from './logger';

export const debugError = (err: Error, toSentry = true): null => {
  logger.error(err.message);
  if (toSentry) Sentry.captureException(err);
  return null;
};
