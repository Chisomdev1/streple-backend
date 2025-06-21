import { Request } from 'express';
import { User } from '../../users/user.entity'; // Adjust path as needed

export interface AuthenticatedRequest extends Request {
  user: User;
}
