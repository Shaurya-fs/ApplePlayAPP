package com.shaurya.appleplay.video

import android.content.Context
import android.view.Surface
import android.view.SurfaceHolder
import android.view.SurfaceView
import com.shaurya.appleplay.receiver.ReceiverConnection
import io.github.jqssun.airplay.service.AirPlayService

/**
 * A surface the receiver draws into. "mirror" shows the Mac's screen; "video" shows a
 * video sent with AirPlay (for example from an iPhone app).
 */
class AirPlayVideoView(context: Context) : SurfaceView(context), SurfaceHolder.Callback {

    enum class Mode { MIRROR, VIDEO }

    private var surface: Surface? = null

    var mode: Mode = Mode.MIRROR
        set(value) {
            if (field == value) return
            detach()
            field = value
            attach()
        }

    init {
        holder.addCallback(this)
    }

    override fun surfaceCreated(holder: SurfaceHolder) {
        surface = holder.surface
        attach()
    }

    override fun surfaceChanged(holder: SurfaceHolder, format: Int, width: Int, height: Int) {
        surface = holder.surface
        attach()
    }

    override fun surfaceDestroyed(holder: SurfaceHolder) {
        detach()
        surface = null
    }

    private fun attach() {
        val target = surface ?: return
        ReceiverConnection.withService(context) { service ->
            if (surface === target) service.show(target, mode)
        }
    }

    private fun detach() {
        val target = surface ?: return
        ReceiverConnection.current?.hide(target, mode)
    }

    private fun AirPlayService.show(target: Surface, mode: Mode) = when (mode) {
        Mode.MIRROR -> setVideoSurface(target)
        Mode.VIDEO -> setVideoPlaybackSurface(target)
    }

    private fun AirPlayService.hide(target: Surface, mode: Mode) = when (mode) {
        Mode.MIRROR -> clearVideoSurface(target)
        Mode.VIDEO -> clearVideoPlaybackSurface(target)
    }
}
