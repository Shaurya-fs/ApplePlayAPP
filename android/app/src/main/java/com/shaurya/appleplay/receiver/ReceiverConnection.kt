package com.shaurya.appleplay.receiver

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.ServiceConnection
import android.os.IBinder
import androidx.annotation.MainThread
import io.github.jqssun.airplay.service.AirPlayService

/**
 * One app-wide binding to the receiver service. The React module and the video views
 * all talk to the same service instance through here. Main thread only.
 */
@MainThread
object ReceiverConnection {
    private var bound = false
    private var service: AirPlayService? = null
    private val pending = mutableListOf<(AirPlayService) -> Unit>()
    private val listeners = linkedSetOf<(AirPlayService?) -> Unit>()

    private val connection = object : ServiceConnection {
        override fun onServiceConnected(name: ComponentName?, binder: IBinder?) {
            val svc = (binder as? AirPlayService.LocalBinder)?.service ?: return
            service = svc
            pending.toList().also { pending.clear() }.forEach { it(svc) }
            listeners.toList().forEach { it(svc) }
        }

        override fun onServiceDisconnected(name: ComponentName?) {
            service = null
            bound = false
            listeners.toList().forEach { it(null) }
        }
    }

    val current: AirPlayService? get() = service

    fun bind(context: Context) {
        if (bound) return
        val app = context.applicationContext
        bound = app.bindService(Intent(app, AirPlayService::class.java), connection, Context.BIND_AUTO_CREATE)
    }

    /** Runs [block] now if the service is bound, otherwise as soon as it is. */
    fun withService(context: Context, block: (AirPlayService) -> Unit) {
        service?.let(block) ?: run {
            pending += block
            bind(context)
        }
    }

    fun addListener(listener: (AirPlayService?) -> Unit) {
        listeners += listener
        service?.let(listener)
    }

    fun removeListener(listener: (AirPlayService?) -> Unit) {
        listeners -= listener
    }
}
