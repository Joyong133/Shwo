import org.jetbrains.kotlin.gradle.dsl.JvmTarget

plugins {
    id("org.jetbrains.kotlin.jvm")
}

java {
    sourceCompatibility = JavaVersion.VERSION_17
    targetCompatibility = JavaVersion.VERSION_17
}

kotlin {
    compilerOptions {
        jvmTarget.set(JvmTarget.JVM_17)
    }
}

dependencies {
    testImplementation("junit:junit:4.13.2")
}

// Renders every sound to a WAV file so it can be listened to and inspected without a phone:
//   ./gradlew :engine:renderSamples -Pout=/some/dir -Pseconds=20
tasks.register<JavaExec>("renderSamples") {
    group = "verification"
    description = "Renders each sound of the catalog to a WAV file."
    classpath = sourceSets["test"].runtimeClasspath
    mainClass.set("app.bimeong.engine.RenderToolKt")
    args(
        (project.findProperty("out") as String?) ?: layout.buildDirectory.dir("samples").get().asFile.path,
        (project.findProperty("seconds") as String?) ?: "20",
        (project.findProperty("only") as String?) ?: "",
        (project.findProperty("mode") as String?) ?: "",
    )
}
