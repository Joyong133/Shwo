pluginManagement {
    repositories {
        google()
        // Maven Central 미러 (repo.maven.apache.org 속도 제한 대비)
        maven("https://maven-central.storage-download.googleapis.com/maven2/")
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        // Maven Central 미러 (repo.maven.apache.org 속도 제한 대비)
        maven("https://maven-central.storage-download.googleapis.com/maven2/")
        mavenCentral()
    }
}
rootProject.name = "AnimeShadowing"
include(":app")
