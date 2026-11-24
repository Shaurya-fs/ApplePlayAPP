package io.github.jqssun.airplay.host

import android.content.Context
import android.content.Intent

/** Opens the app that embeds the engine, whatever its launcher activity is called. */
object HostActivity {
    fun launchIntent(context: Context): Intent =
        context.packageManager.getLaunchIntentForPackage(context.packageName)
            ?: Intent(Intent.ACTION_MAIN).setPackage(context.packageName)
}
