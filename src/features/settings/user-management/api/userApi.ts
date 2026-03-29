/**
 * @deprecated
 * API logic đã được di chuyển vào `src/services/api/settings.ts`.
 * File này chỉ re-export để duy trì backward-compatibility với các hook và view hiện tại.
 *
 * Khi import mới, hãy dùng:
 *   import { settingsApi } from '@/services/api';
 */

export { settingsApi as userApi } from '@/services/api/settings';
export type { GetUsersParams } from '@/services/api/settings';

