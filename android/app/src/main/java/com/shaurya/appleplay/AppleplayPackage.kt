package com.shaurya.appleplay

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider
import com.facebook.react.uimanager.ViewManager
import com.shaurya.appleplay.receiver.AirPlayReceiverModule
import com.shaurya.appleplay.video.AirPlayVideoViewManager

/** Registers the receiver module and the video view with React Native. */
class AppleplayPackage : BaseReactPackage() {

    override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? =
        if (name == AirPlayReceiverModule.NAME) AirPlayReceiverModule(reactContext) else null

    override fun getReactModuleInfoProvider() = ReactModuleInfoProvider {
        mapOf(
            AirPlayReceiverModule.NAME to ReactModuleInfo(
                name = AirPlayReceiverModule.NAME,
                className = AirPlayReceiverModule.NAME,
                canOverrideExistingModule = false,
                needsEagerInit = false,
                isCxxModule = false,
                isTurboModule = true,
            ),
        )
    }

    override fun createViewManagers(
        reactContext: ReactApplicationContext,
    ): List<ViewManager<in Nothing, in Nothing>> =
        listOf(AirPlayVideoViewManager())
}
