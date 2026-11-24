# ApplePlay

Turn any Android phone, tablet or TV into a screen for your Mac, iPhone or iPad.
Open the app, press the button, and your device shows up in **Screen Mirroring**,
just like an Apple TV would. No account, no ads, no extra steps.

## Using it

1. Install the APK (see below) and open **ApplePlay**.
2. Press the big button. It turns teal and says **Ready**.
3. On your Mac: **Control Center → Screen Mirroring → ApplePlay (your device)**.
   On an iPhone or iPad: **Control Centre → Screen Mirroring**.
4. The picture fills the Android screen. Tap it to show **Turn off**.

To use the Android screen as extra space instead of a copy, choose
**Use As Separate Display** in Screen Mirroring on the Mac.

**Tips**

- Keep both devices on the same Wi-Fi (5 GHz works best).
- Tap the name under the button to rename the device. The new name shows up the
  next time you turn it on.
- Android 17 asks for **local network** access the first time. Allow it, or the
  Mac can't find the device.
- AirPlay sends picture and sound only, so touching the Android screen doesn't
  control the Mac.

## Getting the APK

Every push to `main` builds the app on GitHub Actions.

1. Open the **Actions** tab, then the latest green **Build ApplePlay** run.
2. Download **ApplePlay-apk** under **Artifacts** and unzip it.
3. Copy the `.apk` to your Android device and open it. Allow "Install unknown apps"
   when Android asks.

Builds are signed with the key in the `KEYSTORE_BASE64` and `KEYSTORE_PASSWORD`
repository secrets, so a new version installs over the old one. Without those
secrets the build still works, but it's signed with a throwaway key.

## How it's built

The app is **React Native** (TypeScript) on top of an AirPlay receiver engine
written in C and Kotlin.

```
src/
  App.tsx                    Root: picks the home screen or the casting screen
  native/specs/              Typed contracts with Android (codegen)
    NativeAirPlayReceiver.ts   start, stop, rename, live state events
    AirPlayVideoViewNativeComponent.ts   the surface the picture draws into
  receiver/                  App logic, no UI
    ReceiverProvider.tsx       One shared receiver state for the whole app
    receiverClient.ts          The only code that calls the native module
    castPhase.ts               Off / Ready / Connected / Casting … and its wording
    permissions.ts             Android permission requests
    useCastWindow.ts           Full screen and keep-awake while casting
  screens/                   HomeScreen (the button), CastScreen (over the picture)
  components/                PowerButton, StatusMessage, DeviceNameField, Notice, VideoStage
  theme/                     Colours, spacing, type

android/
  app/.../receiver/          The React Native module and the service connection
  app/.../video/             The native video view
  airplay-engine/            Builds the receiver engine as an Android library
  vendor/android-airplay-server/   The engine itself (git submodule, pinned)
```

State flows one way: the Android service emits a snapshot whenever anything
changes, `ReceiverProvider` stores it, and every screen reads from there. The
React side never guesses what the receiver is doing.

### Working on it

You need Node 22, JDK 21 and the Android SDK with NDK.

```bash
git clone --recurse-submodules https://github.com/Shaurya-fs/ApplePlayAPP.git
cd ApplePlayAPP
npm install
npm run check      # type check, lint, tests
npm run android    # build and run on a connected device
```

The first Android build compiles OpenSSL, FFmpeg and UxPlay and takes a while.

## Credits and licence

The receiver engine is
[android-airplay-server](https://github.com/jqssun/android-airplay-server) by
jqssun, built on [UxPlay](https://github.com/FDH2/UxPlay). Both are GPLv3, so
ApplePlay is GPLv3 too: see [LICENSE](LICENSE). If you share the app, share its
source with it.

ApplePlay is a personal project. It isn't made, endorsed or approved by Apple.
AirPlay, Mac, iPhone and iPad are trademarks of Apple Inc.
