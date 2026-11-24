package com.shaurya.appleplay.receiver

import android.content.Context
import android.content.SharedPreferences
import android.os.Build
import io.github.jqssun.airplay.Prefs
import io.github.jqssun.airplay.get

/** The few receiver settings this app exposes, stored in the engine's own preferences. */
class DeviceSettings(context: Context) {
    private val prefs: SharedPreferences =
        context.applicationContext.getSharedPreferences(Prefs.NAME, Context.MODE_PRIVATE)

    /** First launch: name the device after its model and favour low lag. */
    fun applyDefaults() {
        if (!prefs.contains(Prefs.SERVER_NAME.key)) Prefs.SERVER_NAME.write(prefs, defaultName())
        if (!prefs.contains(Prefs.LOW_LATENCY.key)) Prefs.LOW_LATENCY.write(prefs, true)
    }

    var deviceName: String
        get() = prefs[Prefs.SERVER_NAME].ifBlank { defaultName() }
        set(value) {
            Prefs.SERVER_NAME.write(prefs, value.trim().ifBlank { defaultName() }.take(MAX_NAME_LENGTH))
        }

    private fun defaultName() = "ApplePlay ${Build.MODEL}".take(MAX_NAME_LENGTH)

    companion object {
        const val MAX_NAME_LENGTH = 40
    }
}
