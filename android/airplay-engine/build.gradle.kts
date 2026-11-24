import org.jetbrains.kotlin.gradle.dsl.JvmTarget

// AirPlay receiver engine.
//
// The engine is jqssun/android-airplay-server (GPLv3, built on UxPlay), pinned as a git
// submodule in android/vendor. This module compiles its native core (UxPlay, OpenSSL,
// FFmpeg) and its Android service, and leaves out its Compose UI, which the React app
// replaces.

plugins {
    id("com.android.library")
    id("org.jetbrains.kotlin.android")
}

val upstreamApp: File = rootProject.file("vendor/android-airplay-server/app")
val upstreamMain: File = upstreamApp.resolve("src/main")
val generatedKotlin: File = layout.buildDirectory.dir("generated/engine/kotlin").get().asFile
val generatedRes: File = layout.buildDirectory.dir("generated/engine/res").get().asFile

check(upstreamMain.isDirectory) {
    "Receiver engine sources are missing. Run: git submodule update --init --recursive"
}

// Copies the engine's Kotlin sources without its UI. The service opens the old UI's
// activity in two places; those now open whatever activity launches this app.
val syncEngineKotlin by tasks.registering(Sync::class) {
    from(upstreamMain.resolve("kotlin")) {
        exclude("io/github/jqssun/airplay/ui/**")
        exclude("io/github/jqssun/airplay/viewmodel/**")
        exclude("io/github/jqssun/airplay/MainActivity.kt")
        exclude("io/github/jqssun/airplay/AirPlayApp.kt")
    }
    filesMatching("**/service/AirPlayService.kt") {
        filter { line ->
            line.replace(
                "import io.github.jqssun.airplay.MainActivity",
                "import io.github.jqssun.airplay.host.HostActivity",
            ).replace(
                "Intent(this, MainActivity::class.java)",
                "HostActivity.launchIntent(this)",
            )
        }
    }
    into(generatedKotlin)
    doLast {
        val service = generatedKotlin.resolve("io/github/jqssun/airplay/service/AirPlayService.kt")
        val leftover = Regex("""import io\.github\.jqssun\.airplay\.MainActivity|MainActivity::class""")
        check(!leftover.containsMatchIn(service.readText())) {
            "AirPlayService still references MainActivity. The pinned engine version changed; update syncEngineKotlin."
        }
    }
}

// The service only needs the engine's strings.
val syncEngineRes by tasks.registering(Sync::class) {
    from(upstreamMain.resolve("res")) { include("values/strings.xml") }
    into(generatedRes)
}

// Same step the engine's own build runs: apply its fixes to UxPlay before CMake.
val applyUxplayPatches by tasks.registering {
    val uxplay = upstreamMain.resolve("cpp/third_party/UxPlay")
    val patches = upstreamMain.resolve("cpp/patches/UxPlay")
    doLast {
        fun git(vararg args: String): String {
            val proc = ProcessBuilder("git", "-C", uxplay.path, *args).redirectErrorStream(true).start()
            val out = proc.inputStream.bufferedReader().readText()
            check(proc.waitFor() == 0) { "git ${args.joinToString(" ")} failed:\n$out" }
            return out
        }
        val files = patches.listFiles { f -> f.extension == "patch" }!!.sorted()
        val touched = files.flatMap { git("apply", "--numstat", it.path).trim().lines() }
            .map { it.substringAfterLast("\t") }.distinct()
        git("checkout", "--", *touched.toTypedArray())
        files.forEach { git("apply", "--unidiff-zero", it.path) }
    }
}

tasks.named("preBuild") { dependsOn(syncEngineKotlin, syncEngineRes) }
tasks.configureEach {
    if (name.startsWith("configureCMake")) dependsOn(applyUxplayPatches)
}

android {
    namespace = "io.github.jqssun.airplay"
    compileSdk = rootProject.extra["compileSdkVersion"] as Int
    ndkVersion = rootProject.extra["ndkVersion"] as String

    defaultConfig {
        minSdk = rootProject.extra["minSdkVersion"] as Int
        consumerProguardFiles(upstreamApp.resolve("proguard-rules.pro"))
        externalNativeBuild {
            cmake {
                arguments += "-DANDROID_STL=c++_shared"
                arguments += "-DANDROID_SUPPORT_FLEXIBLE_PAGE_SIZES=ON"
            }
        }
        ndk { abiFilters += listOf("arm64-v8a", "armeabi-v7a", "x86_64") }
    }

    externalNativeBuild {
        cmake { path = upstreamMain.resolve("cpp/CMakeLists.txt") }
    }

    sourceSets {
        getByName("main") {
            java.srcDir(generatedKotlin)
            res.srcDir(generatedRes)
        }
    }

    buildFeatures { prefab = true }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

kotlin {
    compilerOptions { jvmTarget.set(JvmTarget.JVM_17) }
}

dependencies {
    api("androidx.core:core-ktx:1.16.0")
    api("androidx.lifecycle:lifecycle-service:2.9.4")
    api("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.9.0")
    implementation("androidx.media:media:1.7.0")
    implementation("androidx.media3:media3-exoplayer:1.11.1")
    implementation("androidx.media3:media3-exoplayer-hls:1.11.1")
    implementation("androidx.media3:media3-transformer:1.11.1")
    implementation("com.google.oboe:oboe:1.9.3")
}
