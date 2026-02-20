import UIKit
import Capacitor
import WebKit

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Override point for customization after application launch.
        
        // Injecteer CSS voor layout fixes
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
            self.injectLayoutFixes()
        }
        
        return true
    }
    
    func injectLayoutFixes() {
        guard let window = self.window,
              let rootVC = window.rootViewController as? CAPBridgeViewController,
              let webView = rootVC.bridge?.webView else {
            return
        }
        
        let cssInjection = """
        (function() {
            var style = document.createElement('style');
            style.id = 'ios-layout-fixes';
            style.textContent = `
                /* Fix voor dag-selector en tijd afkorting */
                .day-selector,
                .date-picker,
                .date-selector,
                [class*="day-button"],
                [class*="date-button"] {
                    min-width: 220px !important;
                    max-width: none !important;
                    flex: 1 1 auto !important;
                    white-space: nowrap !important;
                    overflow: visible !important;
                    text-overflow: clip !important;
                }
                
                .header-time,
                .time-display,
                .shift-time,
                [class*="header"] [class*="time"] {
                    min-width: 80px !important;
                    white-space: nowrap !important;
                    overflow: visible !important;
                    text-overflow: clip !important;
                }
                
                .calendar-header,
                .shift-header,
                .header-container,
                [class*="calendar-header"],
                [class*="shift-header"] {
                    display: flex !important;
                    gap: 6px !important;
                    padding: 8px 10px !important;
                    align-items: center !important;
                }
                
                .nav-button,
                .navigation-button,
                button[class*="nav"],
                button[class*="navigation"],
                .back-button,
                .forward-button,
                button[class*="back"],
                button[class*="forward"] {
                    min-width: 44px !important;
                    padding: 8px 10px !important;
                    flex-shrink: 0 !important;
                }
            `;
            if (!document.getElementById('ios-layout-fixes')) {
                document.head.appendChild(style);
            }
        })();
        """
        
        webView.evaluateJavaScript(cssInjection) { result, error in
            if let error = error {
                print("CSS injection error: \\(error)")
            } else {
                print("✅ Layout fixes injected successfully")
            }
        }
    }

    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
        
        // Injecteer CSS fixes wanneer app actief wordt
        injectLayoutFixes()
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        // Called when the app was launched with a url. Feel free to add additional processing here,
        // but if you want the App API to support tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        // Called when the app was launched with an activity, including Universal Links.
        // Feel free to add additional processing here, but if you want the App API to support
        // tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

}
