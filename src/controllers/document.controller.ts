import type { Request, Response } from 'express';

export const getDocuments = (_req: Request, res: Response): void => {
  res.status(200).json({
    message: 'Document retrieved successfully',
    data: 'This is a sample document',
  });
};
