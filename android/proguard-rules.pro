-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-keepattributes *Annotation*
-keep class * extends androidx.room.RoomDatabase
-keep class androidx.work.impl.WorkDatabase_Impl { *; }
-dontwarn androidx.room.paging.**
