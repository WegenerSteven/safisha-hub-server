import { SetMetadata } from '@nestjs/common';

//mark endpoints that do not require authentication
export const Public = () => SetMetadata('isPublic', true);
