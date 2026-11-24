package com.shaurya.appleplay.video

import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.AirPlayVideoViewManagerDelegate
import com.facebook.react.viewmanagers.AirPlayVideoViewManagerInterface

@ReactModule(name = AirPlayVideoViewManager.NAME)
class AirPlayVideoViewManager :
    SimpleViewManager<AirPlayVideoView>(),
    AirPlayVideoViewManagerInterface<AirPlayVideoView> {

    private val delegate = AirPlayVideoViewManagerDelegate(this)

    override fun getDelegate(): ViewManagerDelegate<AirPlayVideoView> = delegate

    override fun getName() = NAME

    override fun createViewInstance(context: ThemedReactContext) = AirPlayVideoView(context)

    @ReactProp(name = "mode")
    override fun setMode(view: AirPlayVideoView, value: String?) {
        view.mode = if (value == "video") AirPlayVideoView.Mode.VIDEO else AirPlayVideoView.Mode.MIRROR
    }

    companion object {
        const val NAME = "AirPlayVideoView"
    }
}
