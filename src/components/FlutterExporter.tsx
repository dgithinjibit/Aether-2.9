import React, { useState } from 'react';
import { Copy, Check, Github, Smartphone, Terminal, HelpCircle, FileText } from 'lucide-react';

export const FlutterExporter: React.FC = () => {
    const [copiedSec, setCopiedSec] = useState<string | null>(null);

    const handleCopy = (text: string, section: string) => {
        navigator.clipboard.writeText(text);
        setCopiedSec(section);
        setTimeout(() => setCopiedSec(null), 3000);
    };

    const PUBSPEC = `name: aether_app
description: Flutter Android Native Wrapper for Aether Mobile IDE.
version: 1.0.0+1

environment:
  sdk: ">=3.0.0 <4.0.0"

dependencies:
  flutter:
    sdk: flutter
  # High performance webview client supporting hardware media flow
  webview_flutter: ^4.4.2
  permission_handler: ^11.0.1`;

    const EXPORT_DART = `import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:permission_handler/permission_handler.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const AetherNativeApp());
}

class AetherNativeApp extends StatelessWidget {
  const AetherNativeApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Aether Mobile IDE',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: const Color(0xFF111111),
      ),
      home: const AetherWebViewScreen(),
    );
  }
}

class AetherWebViewScreen extends StatefulWidget {
  const AetherWebViewScreen({super.key});

  @override
  State<AetherWebViewScreen> createState() => _AetherWebViewScreenState();
}

class _AetherWebViewScreenState extends State<AetherWebViewScreen> {
  late final WebViewController _controller;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _requestPermissionsAndInit();
  }

  Future<void> _requestPermissionsAndInit() async {
    // Prompt Native Android popups immediately on startup
    Map<Permission, PermissionStatus> statuses = await [
      Permission.microphone,
      Permission.camera,
      Permission.storage,
    ].request();

    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xFF111111))
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (String url) {
            setState(() => _isLoading = true);
          },
          onPageFinished: (String url) {
            setState(() => _isLoading = false);
          },
        ),
      )
      ..loadRequest(Uri.parse('https://aether-app.live/project-xyz-123'));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Stack(
          children: [
            WebViewWidget(controller: _controller),
            if (_isLoading)
              const Center(
                child: CircularProgressIndicator(
                  color: Color(0xFF6366F1),
                ),
              ),
          ],
        ),
      ),
    );
  }
}`;

    const MANIFEST = `<!-- android/app/src/main/AndroidManifest.xml -->
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    
    <!-- Hardware Permission Declarations -->
    <uses-permission android:name="android.permission.INTERNET"/>
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />

    <application
        android:label="Aether Mobile"
        android:icon="@mipmap/ic_launcher"
        android:hardwareAccelerated="true">
        <activity
            android:name=".MainActivity"
            android:launchMode="singleTop"
            android:theme="@style/LaunchTheme"
            android:configChanges="orientation|keyboardHidden|screenSize|smallestScreenSize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN"/>
                <category android:name="android.intent.category.LAUNCHER"/>
            </intent-filter>
        </activity>
    </application>
</manifest>`;

    return (
        <div className="flex flex-col gap-6 h-full overflow-y-auto pb-8 custom-scrollbar">
            {/* Header banner */}
            <div className="bg-gradient-to-r from-blue-950/40 to-black/30 border border-blue-500/10 p-5 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-xl pointer-events-none rounded-full" />
                <div className="z-10 relative">
                    <h3 className="text-sm font-bold text-gray-200 mb-1 flex items-center gap-1.5 font-sans">
                        <Smartphone size={16} className="text-blue-400" />
                        Android APK Compilation Guide
                    </h3>
                    <p className="text-[11px] text-gray-400 leading-relaxed font-sans">
                        This cloud platform compiles production web bundles. To distribute Aether on Google Play, use the Flutter Dart blueprint below to assemble a native Webview application in minutes.
                    </p>
                </div>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="flex flex-col gap-4">
                {[
                    {
                        title: '1. Initialize Flutter codebase',
                        desc: 'Generate a new Flutter skeleton on your desk using: `flutter create aether_app` Command. Open the directory, replace the files, and publish.',
                        code: PUBSPEC,
                        filename: 'pubspec.yaml',
                        lang: 'yaml'
                    },
                    {
                        title: '2. Enable Android Hardware Policies',
                        desc: 'Copy these permission declarations inside your AndroidManifest configurations to guarantee raw camera and microphone device authorization on runtime.',
                        code: MANIFEST,
                        filename: 'AndroidManifest.xml',
                        lang: 'xml'
                    },
                    {
                        title: '3. Copy high-performance WebView container',
                        desc: 'This Dart layout triggers device permissions immediately on application setup and handles secure cookie sandbox streams natively.',
                        code: EXPORT_DART,
                        filename: 'lib/main.dart',
                        lang: 'dart'
                    }
                ].map((item, index) => (
                    <div key={index} className="bg-[#141419] border border-white/5 rounded-3xl p-5 flex flex-col gap-3">
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-gray-200 font-sans">{item.title}</span>
                                <span className="text-[10px] text-gray-500 font-sans mt-1 leading-normal">{item.desc}</span>
                            </div>
                            <button
                                onClick={() => handleCopy(item.code, item.filename)}
                                className={`shrink-0 p-2 rounded-xl transition-all ${copiedSec === item.filename ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-[#222] hover:bg-[#333] border border-white/5 text-gray-400 hover:text-white'}`}
                                title="Copy Blueprint File"
                            >
                                {copiedSec === item.filename ? <Check size={14} /> : <Copy size={14} />}
                            </button>
                        </div>

                        {/* Code box */}
                        <div className="bg-[#09090c] rounded-2xl border border-white/5 overflow-hidden">
                            <div className="px-4 py-2 bg-black/60 border-b border-white/5 flex justify-between items-center text-[10px]">
                                <span className="font-mono text-gray-400">{item.filename}</span>
                                <span className="font-sans text-[8px] uppercase tracking-wider font-bold text-indigo-400">{item.lang}</span>
                            </div>
                            <pre className="p-4 overflow-x-auto text-[10px] font-mono leading-relaxed text-gray-300 whitespace-pre scrollbar-none max-h-[160px]">
                                {item.code}
                            </pre>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
