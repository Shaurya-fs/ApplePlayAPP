package com.shaurya.appleplay.receiver

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import io.github.jqssun.airplay.service.AirPlayService
import io.github.jqssun.airplay.service.AirPlayService.ServerState

/** Turns the service's live state into the object JavaScript receives (see NativeAirPlayReceiver.ts). */
object ReceiverSnapshot {
    fun from(
        service: AirPlayService?,
        deviceName: String,
        pin: String?,
        hasLocalNetwork: Boolean,
    ): WritableMap = Arguments.createMap().apply {
        putString("power", power(service?.serverState?.value))
        putDouble("connections", (service?.connectionCount?.value ?: 0).toDouble())
        putBoolean("mirroring", service?.mirroringActive?.value ?: false)
        putBoolean("videoPlayback", service?.videoPlaybackActive?.value ?: false)
        putBoolean("audioOnly", service?.audioOnly?.value ?: false)
        putString("trackTitle", service?.trackInfo?.value?.title.orEmpty())
        putString("trackArtist", service?.trackInfo?.value?.artist.orEmpty())
        putDouble("videoAspect", (service?.videoAspect?.value ?: DEFAULT_ASPECT).toDouble())
        putDouble("playbackAspect", (service?.videoPlaybackAspect?.value ?: DEFAULT_ASPECT).toDouble())
        putString("deviceName", deviceName)
        putString("pin", pin.orEmpty())
        putBoolean("hasLocalNetworkAccess", hasLocalNetwork)
    }

    private fun power(state: ServerState?) = when (state) {
        ServerState.RUNNING -> "on"
        ServerState.ERROR -> "error"
        else -> "off"
    }

    private const val DEFAULT_ASPECT = 16f / 9f
}
