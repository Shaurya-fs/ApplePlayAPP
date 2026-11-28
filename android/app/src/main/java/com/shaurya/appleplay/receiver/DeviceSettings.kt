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

    /** Stream height the Mac is asked for: 720, 1080, 1440 or 2160. Takes effect on the next start. */
    var streamQuality: Int
        get() = prefs.getInt(QUALITY_KEY, DEFAULT_QUALITY).takeIf { it in QUALITIES } ?: DEFAULT_QUALITY
        set(value) {
            val quality = value.takeIf { it in QUALITIES } ?: DEFAULT_QUALITY
            prefs.edit { putInt(QUALITY_KEY, quality) }
            applyResolution(quality)
        }

    /**
     * Left alone, the engine asks the Mac for the panel's full resolution, which on most tablets
     * is well above 1080p. Encoding, sending and decoding that much video over Wi-Fi is what makes
     * the picture trail behind the cursor, so the stream size follows the chosen quality instead.
     */
    private fun applyLowLagTuning() {
        Prefs.LOW_LATENCY.write(prefs, true)
        Prefs.MAX_FPS.write(prefs, 60)
        Prefs.KEY_ALLOW_FRAME_DROP.write(prefs, true)
        Prefs.KEY_PRIORITY.write(prefs, true)
        Prefs.SCHEDULED_OUTPUT_BUFFER_RELEASE.write(prefs, false)
        applyResolution(streamQuality)
    }

    private fun applyResolution(quality: Int) {
        val (w, h) = appContext.realDisplaySize()
        Prefs.RESOLUTION.write(prefs, streamSize(w, h, quality))
    }

    private fun defaultName() = "ApplePlay ${Build.MODEL}".take(MAX_NAME_LENGTH)

    companion object {
        const val MAX_NAME_LENGTH = 40
        val QUALITIES = setOf(720, 1080, 1440, 2160)
        const val DEFAULT_QUALITY = 720
        private const val QUALITY_KEY = "appleplay_stream_quality"
        private const val TUNING_KEY = "appleplay_tuning_version"
        private const val TUNING_VERSION = 3

        /**
         * Landscape stream size for a quality, in the panel's own aspect ratio. The long side is
         * the 16:9 width of that quality (720p → 1280), so a 16:10 tablet at 720p gets 1280x800.
         */
        fun streamSize(panelW: Int, panelH: Int, quality: Int): String {
            val panelLong = maxOf(panelW, panelH)
            val panelShort = minOf(panelW, panelH)
            val long = quality * 16 / 9
            val short = (panelShort * long.toDouble() / panelLong).roundToInt()
            return "${long}x${short - short % 2}"
        }
    }
}
