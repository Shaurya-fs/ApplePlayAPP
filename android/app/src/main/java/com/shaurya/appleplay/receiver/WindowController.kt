package com.shaurya.appleplay.receiver

import android.app.Activity
import android.view.WindowManager
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat

/** Window tweaks for casting: keep the screen awake and hide the system bars. */
class WindowController(private val activity: () -> Activity?) {

    fun setKeepAwake(enabled: Boolean) = onWindow { window ->
        if (enabled) window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        else window.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
    }

    fun setImmersive(enabled: Boolean) = onWindow { window ->
        val controller = WindowCompat.getInsetsController(window, window.decorView)
        if (enabled) {
            controller.systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
            controller.hide(WindowInsetsCompat.Type.systemBars())
        } else {
            controller.show(WindowInsetsCompat.Type.systemBars())
        }
    }

    private fun onWindow(block: (android.view.Window) -> Unit) {
        val act = activity() ?: return
        act.runOnUiThread { block(act.window) }
    }
}
