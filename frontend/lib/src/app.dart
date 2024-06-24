import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

import 'sample_feature/sample_item_details_view.dart';
import 'sample_feature/sample_item_list_view.dart';
import 'settings/settings_controller.dart';
import 'settings/settings_view.dart';

/// The Widget that configures your application.
class MyApp extends StatelessWidget {
  const MyApp({
    super.key,
    required this.settingsController,
  });

  final SettingsController settingsController;

  @override
  Widget build(BuildContext context) {
    // Glue the SettingsController to the MaterialApp.
    //
    // The ListenableBuilder Widget listens to the SettingsController for changes.
    // Whenever the user updates their settings, the MaterialApp is rebuilt.
    return ListenableBuilder(
      listenable: settingsController,
      builder: (BuildContext context, Widget? child) {
        return MaterialApp(
          // Providing a restorationScopeId allows the Navigator built by the
          // MaterialApp to restore the navigation stack when a user leaves and
          // returns to the app after it has been killed while running in the
          // background.
          restorationScopeId: 'app',

          // Provide the generated AppLocalizations to the MaterialApp. This
          // allows descendant Widgets to display the correct translations
          // depending on the user's locale.
          localizationsDelegates: const [
            AppLocalizations.delegate,
            GlobalMaterialLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
          ],
          supportedLocales: const [
            Locale('en', ''), // English, no country code
          ],

          // Use AppLocalizations to configure the correct application title
          // depending on the user's locale.
          //
          // The appTitle is defined in .arb files found in the localization
          // directory.
          onGenerateTitle: (BuildContext context) =>
              AppLocalizations.of(context)!.appTitle,

          // Define a light and dark color theme. Then, read the user's
          // preferred ThemeMode (light, dark, or system default) from the
          // SettingsController to display the correct theme.
          theme: ThemeData(),
          darkTheme: ThemeData.dark(),
          themeMode: settingsController.themeMode,

          // Define a function to handle named routes in order to support
          // Flutter web url navigation and deep linking.
          onGenerateRoute: (RouteSettings routeSettings) {
            return MaterialPageRoute<void>(
              settings: routeSettings,
              builder: (BuildContext context) {
                switch (routeSettings.name) {
                  default:
                    return Scaffold(
                      appBar: AppBar(
                        title: const PopupIntegrationMenu(),
                        actions: [
                          // ignore: avoid_print
                          IconButton(
                              onPressed: () => print("fds"),
                              icon: Icon(Icons.more_horiz))
                        ],
                      ),
                      body: Container(
                        padding: EdgeInsets.all(15.0),
                        child: Stack(
                          children: [
                            Text("How to use",
                                style:
                                    Theme.of(context).textTheme.headlineSmall),
                            ListView.separated(
                              itemBuilder: (context, index) {
                                return Container(
                                  width: 50,
                                  height: 50,
                                  color: Colors.blue,
                                  // child: Center(
                                  //     child: Image.asset(
                                  //       height: 500,
                                  //       width: 500,
                                  //         'assets/images/flutter_logo.png')),
                                );
                              },
                              separatorBuilder: (context, index) {
                                return SizedBox(width: 25,);
                              },
                              scrollDirection: Axis.horizontal,
                              itemCount: 30,
                            )
                          ],
                        ),
                      ),
                      bottomNavigationBar: WhatsAppNavigationBar(),
                    );
                }
                // switch (routeSettings.name) {
                //   case SettingsView.routeName:
                //     return SettingsView(controller: settingsController);
                //   case SampleItemDetailsView.routeName:
                //     return const SampleItemDetailsView();
                //   case SampleItemListView.routeName:
                //   default:
                //     return const SampleItemListView();
                // }
              },
            );
          },
        );
      },
    );
  }
}

class WhatsAppNavigationBar extends StatefulWidget {
  const WhatsAppNavigationBar({
    super.key,
  });

  @override
  State<WhatsAppNavigationBar> createState() => _WhatsAppNavigationBarState();
}

class _WhatsAppNavigationBarState extends State<WhatsAppNavigationBar> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    return BottomNavigationBar(
      onTap: (i) => setState(() {
        _currentIndex = i;
      }),
      currentIndex: _currentIndex,
      items: [
        BottomNavigationBarItem(
            label: "How to",
            icon: Icon(Icons.help_center_outlined),
            activeIcon: Icon(Icons.help_center_rounded)),
        BottomNavigationBarItem(
            label: "Chats",
            icon: Icon(Icons.chat_bubble_outline),
            activeIcon: Icon(Icons.chat_bubble)),
        BottomNavigationBarItem(
            label: "Widgets",
            icon: Icon(Icons.widgets_outlined),
            activeIcon: Icon(Icons.widgets_rounded))
      ],
    );
  }
}

enum Integration { WhatsApp }

class PopupIntegrationMenu extends StatefulWidget {
  const PopupIntegrationMenu({
    super.key,
  });

  @override
  State<PopupIntegrationMenu> createState() => _PopupIntegrationMenuState();
}

class _PopupIntegrationMenuState extends State<PopupIntegrationMenu> {
  static const _initialValue = Integration.WhatsApp;
  String _selectedValue = _initialValue.name;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        PopupMenuButton(
          position: PopupMenuPosition.under,
          icon: Icon(Icons.arrow_drop_down),
          itemBuilder: (BuildContext context) => [
            ...Integration.values.map((i) => PopupMenuItem(
                  value: i,
                  child: ListTile(title: Text(i.name)),
                )),
            PopupMenuItem(
              value: null,
              enabled: false,
              child: GestureDetector(
                onTap: () => ScaffoldMessenger.of(context)
                    .showSnackBar(SnackBar(content: Text("Coming soon..."))),
                child: ListTile(title: Text("YouTube")),
              ),
            )
          ],
          onSelected: (value) {
            setState(() {
              _selectedValue = value!.name;
            });
          },
        ),
        Text(_selectedValue)
      ],
    );
  }
}
