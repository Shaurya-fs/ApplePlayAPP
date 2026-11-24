import { PermissionsAndroid, Platform } from 'react-native';
import type { Permission } from 'react-native';

// Android 17 asks before an app can see other devices on your Wi-Fi.
const LOCAL_NETWORK = 'android.permission.ACCESS_LOCAL_NETWORK' as Permission;
const LOCAL_NETWORK_SINCE_API = 37;
const NOTIFICATIONS_SINCE_API = 33;

export type PermissionResult = 'granted' | 'blocked';

/**
 * Asks for what casting needs. Only local-network access is required; the
 * notification just shows that the receiver is on.
 */
export async function ensureCastPermissions(): Promise<PermissionResult> {
  if (Platform.OS !== 'android') return 'granted';

  const api = Number(Platform.Version);
  const wanted: Permission[] = [];
  if (api >= NOTIFICATIONS_SINCE_API) {
    wanted.push(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
  }
  if (api >= LOCAL_NETWORK_SINCE_API) wanted.push(LOCAL_NETWORK);
  if (wanted.length === 0) return 'granted';

  const results = await PermissionsAndroid.requestMultiple(wanted);
  const needsLocalNetwork = api >= LOCAL_NETWORK_SINCE_API;
  if (
    needsLocalNetwork &&
    results[LOCAL_NETWORK] !== PermissionsAndroid.RESULTS.GRANTED
  ) {
    return 'blocked';
  }
  return 'granted';
}
