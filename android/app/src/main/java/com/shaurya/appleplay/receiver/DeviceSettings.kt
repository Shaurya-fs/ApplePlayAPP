package com.shaurya.appleplay.receiver

import android.content.Context
import android.content.SharedPreferences
import android.os.Build
import androidx.core.content.edit
import io.github.jqssun.airplay.Prefs
import io.github.jqssun.airplay.get
import io.github.jqssun.airplay.realDisplaySize
import kotlin.math.roundToInt

/** The few receiver settings this app exposes, stored in the engine's own preferences. */
class DeviceSettings(context: Context) {
    private val appContext = context.applicationContext
    private val prefs: SharedPreferences =
        appContext.getSharedPreferences(Prefs.NAME, Context.MODE_PRIVATE)

    /** Names the device after its model, and applies the low-lag tuning once per tuning version. */
    fun applyDefaults() {
        if (!prefs.contains(Prefs.SERVER_NAME.key)) Prefs.SERVER_NAME.write(prefs, defaultName())
        if (prefs.getInt(TUNING_KEY, 0) < TUNING_VERSION) {
            applyLowLagTuning()
            prefs.edit { putInt(TUNING_KEY, TUNING_VERSION) }
        }
    }

    var deviceName: String
        get() = prefs[Prefs.SERVER_NAME].ifBlank { defaultName() }
        set(value) {
            Prefs.SERVER_NAME.write(prefs, value.trim().ifBlank { defaultName() }.take(MAX_NAME_LENGTH))
        }

    /**
     * Left alone, the engine asks the Mac for the panel's full resolution, which on most tablets
     * is well above 720p. Encoding, sending and decoding that much video over Wi-Fi is what makes
     * the picture trail behind the cursor, so ask for a 720p-class stream in the panel's shape.
     */
    private fun applyLowLagTuning() {
        Prefs.LOW_LATENCY.write(prefs, true)
        Prefs.MAX_FPS.write(prefs, 60)
        Prefs.KEY_ALLOW_FRAME_DROP.write(prefs, true)
        Prefs.KEY_PRIORITY.write(prefs, true)
        Prefs.SCHEDULED_OUTPUT_BUFFER_RELEASE.write(prefs, false)
        val (w, h) = appContext.realDisplaySize()
        Prefs.RESOLUTION.write(prefs, streamSize(w, h))
    }

    private fun defaultName() = "ApplePlay ${Build.MODEL}".take(MAX_NAME_LENGTH)

    companion object {
        const val MAX_NAME_LENGTH = 40
        private const val TUNING_KEY = "appleplay_tuning_version"
        private const val TUNING_VERSION = 2
        private const val MAX_LONG_SIDE = 1280

        /** Landscape size with the long side capped at 1280, keeping the panel's aspect ratio. */
        fun streamSize(panelW: Int, panelH: Int): String {
            val long = maxOf(panelW, panelH)
            val short = minOf(panelW, panelH)
            if (long <= MAX_LONG_SIDE) return "${long}x$short"
            val scaled = (short * MAX_LONG_SIDE.toDouble() / long).roundToInt()
            return "${MAX_LONG_SIDE}x${scaled - scaled % 2}"
        }
    }
}
