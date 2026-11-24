import type { CodegenTypes, HostComponent, ViewProps } from 'react-native';
import { codegenNativeComponent } from 'react-native';

export interface NativeProps extends ViewProps {
  /** 'mirror' shows the Mac's screen, 'video' shows a video sent with AirPlay. */
  mode?: CodegenTypes.WithDefault<'mirror' | 'video', 'mirror'>;
}

export default codegenNativeComponent<NativeProps>(
  'AirPlayVideoView',
) as HostComponent<NativeProps>;
