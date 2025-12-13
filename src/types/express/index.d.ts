declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        location?: {
          latitude: number;
          longitude: number;
        };
      };
    }
  }
}

export {};
