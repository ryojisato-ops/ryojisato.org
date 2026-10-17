// Render 1200x630 HTML cards to PNG with WebKit.
// usage: render <in.html> <out.png> [<in.html> <out.png> ...]
import AppKit
import WebKit

var pairs: [(URL, URL)] = []
let args = Array(CommandLine.arguments.dropFirst())
for i in stride(from: 0, to: args.count - 1, by: 2) {
    pairs.append((URL(fileURLWithPath: args[i]), URL(fileURLWithPath: args[i + 1])))
}
let W = 1200, H = 630

final class Renderer: NSObject, WKNavigationDelegate {
    var index = 0
    var web: WKWebView!
    func next() {
        guard index < pairs.count else { exit(0) }
        web = WKWebView(frame: NSRect(x: 0, y: 0, width: W, height: H))
        web.navigationDelegate = self
        web.loadFileURL(pairs[index].0, allowingReadAccessTo: pairs[index].0.deletingLastPathComponent())
    }
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.8) {
            let config = WKSnapshotConfiguration()
            config.rect = NSRect(x: 0, y: 0, width: W, height: H)
            config.snapshotWidth = NSNumber(value: W)
            webView.takeSnapshot(with: config) { image, error in
                guard let image else { print("snapshot failed: \(String(describing: error))"); exit(1) }
                let rep = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: W, pixelsHigh: H, bitsPerSample: 8,
                                           samplesPerPixel: 4, hasAlpha: true, isPlanar: false,
                                           colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
                rep.size = NSSize(width: W, height: H)
                NSGraphicsContext.saveGraphicsState()
                NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: rep)
                image.draw(in: NSRect(x: 0, y: 0, width: W, height: H))
                NSGraphicsContext.restoreGraphicsState()
                let data = rep.representation(using: .png, properties: [:])!
                try! data.write(to: pairs[self.index].1)
                print("wrote \(pairs[self.index].1.path) (\(data.count) bytes)")
                self.index += 1
                self.next()
            }
        }
    }
}

let app = NSApplication.shared
app.setActivationPolicy(.prohibited)
let renderer = Renderer()
DispatchQueue.main.async { renderer.next() }
DispatchQueue.main.asyncAfter(deadline: .now() + 60) { print("timeout"); exit(1) }
app.run()
