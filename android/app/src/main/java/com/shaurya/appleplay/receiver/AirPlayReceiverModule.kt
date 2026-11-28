package com.shaurya.appleplay.receiver

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.module.annotations.ReactModule
import com.shaurya.appleplay.specs.NativeAirPlayReceiverSpec
import io.github.jqssun.airplay.appSettingsIntent
import io.github.jqssun.airplay.hasLocalNetwork
import io.github.jqssun.airplay.service.AirPlayService
import io.github.jqssun.airplay.service.AirPlayService.ServerState
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.flow.conflate
import kotlinx.coroutines.flow.merge
import kotlinx.coroutines.launch

/**
 * The receiver as JavaScript sees it: switch it on or off, rename it, and get a
 * snapshot event every time anything about it changes.
 */
@ReactModule(name = AirPlayReceiverModule.NAME)
class AirPlayReceiverModule(private val context: ReactApplicationContext) :
    NativeAirPlayReceiverSpec(context) {

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)
    private val settings = DeviceSettings(context)
    private val window = WindowController { context.currentActivity }
    private var observing: Job? = null
    @Volatile private var pin: String? = null

    private val onService: (AirPlayService?) -> Unit = ::observe

    override fun getName() = NAME

    override fun initialize() {
        super.initialize()
        settings.applyDefaults()
        UiThreadUtil.runOnUiThread {
            ReceiverConnection.addListener(onService)
            ReceiverConnection.bind(context)
        }
    }

    override fun invalidate() {
        UiThreadUtil.runOnUiThread {
            ReceiverConnection.removeListener(onService)
            ReceiverConnection.current?.pinCallback = null
        }
        scope.cancel()
        super.invalidate()
    }

    override fun getSnapshot(promise: Promise) {
        UiThreadUtil.runOnUiThread { promise.resolve(snapshot(ReceiverConnection.current)) }
    }

    override fun start(promise: Promise) {
        if (!context.hasLocalNetwork()) {
            promise.reject(ERR_LOCAL_NETWORK, "Local network access is turned off for this app.")
            return
        }
        UiThreadUtil.runOnUiThread {
            ReceiverConnection.withService(context) { svc ->
                svc.startServer()
                if (svc.serverState.value == ServerState.RUNNING) {
                    promise.resolve(null)
                } else {
                    promise.reject(ERR_START_FAILED, "The receiver could not start. Check that Wi-Fi is on.")
                }
            }
        }
    }

    override fun stop() {
        UiThreadUtil.runOnUiThread { ReceiverConnection.current?.stopServer() }
    }

    override fun setDeviceName(name: String) {
        settings.deviceName = name
        UiThreadUtil.runOnUiThread { publish(ReceiverConnection.current) }
    }

    override fun setStreamQuality(quality: Double) {
        settings.streamQuality = quality.toInt()
        UiThreadUtil.runOnUiThread {
            val svc = ReceiverConnection.current
            // The engine reads the resolution when it starts, so restart a running receiver.
            if (svc != null && svc.serverState.value == ServerState.RUNNING) {
                svc.stopServer()
                svc.startServer()
            }
            publish(svc)
        }
    }

    override fun setKeepAwake(enabled: Boolean) = window.setKeepAwake(enabled)

    override fun setImmersive(enabled: Boolean) = window.setImmersive(enabled)

    override fun openAppSettings() {
        context.startActivity(context.appSettingsIntent().addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK))
    }

    private fun observe(service: AirPlayService?) {
        observing?.cancel()
        publish(service)
        if (service == null) return
        service.pinCallback = { newPin ->
            pin = newPin
            scope.launch { publish(service) }
        }
        observing = scope.launch {
            merge(
                service.serverState,
                service.connectionCount,
                service.mirroringActive,
                service.videoPlaybackActive,
                service.audioOnly,
                service.trackInfo,
                service.videoAspect,
                service.videoPlaybackAspect,
            ).conflate().collect { publish(service) }
        }
    }

    private fun publish(service: AirPlayService?) = emitOnSnapshot(snapshot(service))

    private fun snapshot(service: AirPlayService?) =
        ReceiverSnapshot.from(service, settings.deviceName, settings.streamQuality, pin, context.hasLocalNetwork())

    companion object {
        const val NAME = "AirPlayReceiver"
        private const val ERR_LOCAL_NETWORK = "E_LOCAL_NETWORK"
        private const val ERR_START_FAILED = "E_START_FAILED"
    }
}
