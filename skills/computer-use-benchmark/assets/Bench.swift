// Harbor Desk: the sample app computer-use tools are compared on. Each launch shows one task,
// its targets chosen by a seed, and logs what the app itself saw to a JSONL file, so a run is
// graded by the app's own events, never by what the agent says it did. No real content, and
// nothing here reaches outside this process.
//
//   Bench --describe <task> --seed <n>             the task's prompt, as JSON
//   Bench --task <task> --seed <n> --log <file>    show it
//   Bench --selftest <task> --seed <n> --log <file>   press wrongly, then rightly, off screen
import AppKit
import WebKit

let tasks = ["form", "menu", "list", "drag", "canvas", "slider", "web", "code"]

struct Seeded {
    var state: UInt64
    init(_ seed: Int, _ salt: String) {
        state = 0xcbf29ce484222325 ^ UInt64(seed &+ 1) &* 0x100000001b3
        for byte in salt.utf8 { state = (state ^ UInt64(byte)) &* 0x100000001b3 }
    }
    mutating func next(_ n: Int) -> Int {
        state = state &* 6364136223846793005 &+ 1442695040888963407
        return Int((state >> 33) % UInt64(n))
    }
    mutating func pick<T>(_ items: [T]) -> T { items[next(items.count)] }
}

/// What a seed asks for, the same for the prompt and for the grading.
struct Plan {
    var names = ["Dana Reyes", "Mika Laine", "Noor Haddad", "Ilse Berg"]
    var rooms = ["Garden Suite", "Harbor View", "Loft", "Attic", "Courtyard"]
    var extras = ["Airport pickup", "Late checkout", "Breakfast"]
    var styles = ["Bold", "Italic", "Underline", "Strikethrough"]
    var cards = ["Ferry", "Lantern", "Compass", "Anchor", "Rudder"]
    var columns = ["To do", "Doing", "Done"]

    let name: String, room: String, nights: Int, bed: String, extra: String
    let style: String, stop: Int, card: String, column: String, sliderValue: Int, code: String
    let dots: [NSPoint], decoys: [NSPoint]

    init(seed: Int) {
        var r = Seeded(seed, "plan")
        name = r.pick(names); room = r.pick(rooms); nights = 2 + r.next(6)
        bed = r.pick(["King", "Twin"]); extra = r.pick(extras)
        style = r.pick(styles); stop = 1500 + r.next(3400)
        let cardName = r.pick(cards)
        card = cardName
        column = r.pick(["Doing", "Done"])
        sliderValue = 11 + r.next(78)
        let letters = Array("ACDEFHJKMNPRTUVWXY34679")
        code = String((0..<6).map { _ in r.pick(letters) })
        var placed: [NSPoint] = []
        while placed.count < 9 {
            let p = NSPoint(x: 50 + r.next(620), y: 50 + r.next(340))
            if placed.allSatisfy({ hypot($0.x - p.x, $0.y - p.y) > 80 }) { placed.append(p) }
        }
        dots = Array(placed[0..<3]); decoys = Array(placed[3...])
    }

    func prompt(_ task: String) -> String {
        switch task {
        case "form":
            return "Book a room: guest name \"\(name)\", room \"\(room)\", \(nights) nights, a \(bed) bed, with \(extra) as the only extra. Then press Book."
        case "menu":
            return "Apply the style \(style) from the menu bar: Format > Emphasis > \(style)."
        case "list":
            return "In the list, select the row \"Stop \(String(format: "%04d", stop))\", then press Open."
        case "drag":
            return "On the board, drag the card \"\(card)\" into the column \"\(column)\"."
        case "canvas":
            return "On the chart, click the blue numbered dots in order: 1, then 2, then 3. Don't click the grey dots."
        case "slider":
            return "Set the Level slider to exactly \(sliderValue), then press Apply."
        case "web":
            return "On the page, choose the plan \"Team\", the region \"\(room)\", the billing \"Yearly\", tick \"Send receipts\", enter the name \"\(name)\", and press Confirm."
        case "code":
            return "Read the code shown in the panel, type it in the Code field, press Verify, then press Send in the dialog that opens."
        default: return ""
        }
    }
}

final class Log {
    let handle: FileHandle
    let start = Date()
    init(_ path: String) {
        guard FileManager.default.createFile(atPath: path, contents: nil),
              let h = FileHandle(forWritingAtPath: path) else {
            fputs("Harbor Desk: cannot open log file \(path)\n", stderr)
            exit(2)
        }
        handle = h
    }
    func event(_ name: String, _ fields: [String: Any] = [:]) {
        var line = fields
        line["event"] = name
        line["t"] = (Date().timeIntervalSince(start) * 1000).rounded() / 1000
        let data = try! JSONSerialization.data(withJSONObject: line, options: [.sortedKeys])
        handle.write(data + Data([10]))
        try? handle.synchronize()
    }
    func graded(_ ok: Bool, _ fields: [String: Any] = [:]) { event(ok ? "success" : "wrong", fields) }
}

func label(_ text: String, _ font: NSFont = .systemFont(ofSize: 13)) -> NSTextField {
    let field = NSTextField(labelWithString: text)
    field.font = font
    return field
}

func row(_ title: String, _ control: NSView) -> NSStackView {
    let name = label(title)
    name.alignment = .right
    name.widthAnchor.constraint(equalToConstant: 90).isActive = true
    let stack = NSStackView(views: [name, control])
    stack.spacing = 10
    return stack
}

final class Target: NSObject {
    let action: () -> Void
    init(_ action: @escaping () -> Void) { self.action = action }
    @objc func fire() { action() }
}

var keep: [AnyObject] = []
func button(_ title: String, _ action: @escaping () -> Void) -> NSButton {
    let target = Target(action)
    keep.append(target)
    return NSButton(title: title, target: target, action: #selector(Target.fire))
}

/// Everything a task's view offers the self-test.
protocol TaskView: NSView {
    func wrong()
    func right()
    func runSelftest(completion: @escaping () -> Void)
}

extension TaskView {
    func runSelftest(completion: @escaping () -> Void) {
        wrong()
        right()
        completion()
    }
}

final class FormView: NSStackView, TaskView {
    let plan: Plan, log: Log
    let nameField = NSTextField(string: "")
    let room = NSPopUpButton()
    let nights = NSTextField(string: "1")
    let stepper = NSStepper()
    let king = NSButton(radioButtonWithTitle: "King", target: nil, action: nil)
    let twin = NSButton(radioButtonWithTitle: "Twin", target: nil, action: nil)
    var boxes: [NSButton] = []
    var book: NSButton!
    let status = label("")

    init(plan: Plan, log: Log) {
        self.plan = plan; self.log = log
        super.init(frame: .zero)
        orientation = .vertical; alignment = .leading; spacing = 14
        nameField.setAccessibilityLabel("Guest name")
        nameField.widthAnchor.constraint(equalToConstant: 300).isActive = true
        room.addItems(withTitles: ["Choose a room"] + plan.rooms)
        room.setAccessibilityLabel("Room")
        nights.setAccessibilityLabel("Nights")
        nights.widthAnchor.constraint(equalToConstant: 60).isActive = true
        stepper.minValue = 1; stepper.maxValue = 14; stepper.integerValue = 1
        stepper.setAccessibilityLabel("Nights stepper")
        let step = Target { [unowned self] in self.nights.integerValue = self.stepper.integerValue }
        keep.append(step)
        stepper.target = step; stepper.action = #selector(Target.fire)
        let radio = Target {}
        keep.append(radio)
        for b in [king, twin] { b.target = radio; b.action = #selector(Target.fire) }
        boxes = plan.extras.map { NSButton(checkboxWithTitle: $0, target: nil, action: nil) }
        boxes[0].state = .on
        book = button("Book") { [unowned self] in self.submit() }
        book.keyEquivalent = "\r"
        [row("Guest name", nameField), row("Room", room),
         row("Nights", NSStackView(views: [nights, stepper])),
         row("Bed", NSStackView(views: [king, twin])),
         row("Extras", NSStackView(views: boxes)), book, status].forEach(addArrangedSubview)
    }
    required init?(coder: NSCoder) { fatalError() }

    func submit() {
        let values: [String: Any] = [
            "name": nameField.stringValue, "room": room.titleOfSelectedItem ?? "",
            "nights": nights.integerValue, "bed": king.state == .on ? "King" : twin.state == .on ? "Twin" : "",
            "extras": boxes.filter { $0.state == .on }.map(\.title),
        ]
        let ok = values["name"] as? String == plan.name && values["room"] as? String == plan.room
            && values["nights"] as? Int == plan.nights && values["bed"] as? String == plan.bed
            && values["extras"] as? [String] == [plan.extra]
        log.graded(ok, values)
        status.stringValue = "Submitted."
    }
    func wrong() { book.performClick(nil) }
    func right() {
        nameField.stringValue = plan.name
        room.selectItem(withTitle: plan.room)
        nights.integerValue = plan.nights
        (plan.bed == "King" ? king : twin).state = .on
        boxes.forEach { $0.state = $0.title == plan.extra ? .on : .off }
        book.performClick(nil)
    }
}

final class MenuView: NSStackView, TaskView {
    let plan: Plan, log: Log
    let shown = label("Ferry timetable, winter edition.", .systemFont(ofSize: 18))
    var items: [NSMenuItem] = []

    init(plan: Plan, log: Log) {
        self.plan = plan; self.log = log
        super.init(frame: .zero)
        orientation = .vertical; alignment = .leading
        addArrangedSubview(shown)
        let format = NSMenu(title: "Format")
        let emphasis = NSMenu(title: "Emphasis")
        let parent = NSMenuItem(title: "Emphasis", action: nil, keyEquivalent: "")
        parent.submenu = emphasis
        format.addItem(withTitle: "Clear Formatting", action: nil, keyEquivalent: "")
        format.addItem(parent)
        for style in plan.styles {
            let target = Target { [unowned self] in self.chose(style) }
            keep.append(target)
            let item = NSMenuItem(title: style, action: #selector(Target.fire), keyEquivalent: "")
            item.target = target
            emphasis.addItem(item)
            items.append(item)
        }
        let bar = NSMenuItem(title: "Format", action: nil, keyEquivalent: "")
        bar.submenu = format
        NSApp.mainMenu?.addItem(bar)
    }
    required init?(coder: NSCoder) { fatalError() }

    func chose(_ style: String) {
        log.graded(style == plan.style, ["style": style])
        shown.stringValue = "Ferry timetable, winter edition. (\(style))"
    }
    func wrong() { chose(plan.styles.first { $0 != plan.style }!) }
    func right() { chose(plan.style) }
}

final class ListView: NSStackView, TaskView, NSTableViewDataSource, NSTableViewDelegate {
    let plan: Plan, log: Log
    let table = NSTableView()
    var open: NSButton!
    let status = label("")

    init(plan: Plan, log: Log) {
        self.plan = plan; self.log = log
        super.init(frame: .zero)
        orientation = .vertical; alignment = .leading
        let column = NSTableColumn(identifier: .init("stop"))
        column.title = "Stops"; column.width = 360
        table.addTableColumn(column)
        table.dataSource = self; table.delegate = self
        table.setAccessibilityLabel("Stops")
        let scroll = NSScrollView()
        scroll.documentView = table
        scroll.hasVerticalScroller = true
        scroll.heightAnchor.constraint(equalToConstant: 340).isActive = true
        scroll.widthAnchor.constraint(equalToConstant: 400).isActive = true
        open = button("Open") { [unowned self] in self.press() }
        [scroll, open, status].forEach(addArrangedSubview)
    }
    required init?(coder: NSCoder) { fatalError() }

    func numberOfRows(in tableView: NSTableView) -> Int { 5000 }
    func tableView(_ tableView: NSTableView, viewFor column: NSTableColumn?, row: Int) -> NSView? {
        let cell = NSTableCellView()
        let text = label(String(format: "Stop %04d", row + 1))
        text.translatesAutoresizingMaskIntoConstraints = false
        cell.addSubview(text)
        cell.textField = text
        text.leadingAnchor.constraint(equalTo: cell.leadingAnchor, constant: 4).isActive = true
        text.centerYAnchor.constraint(equalTo: cell.centerYAnchor).isActive = true
        return cell
    }
    func press() {
        let selected = table.selectedRow + 1
        log.graded(selected == plan.stop, ["row": selected])
        status.stringValue = "Opened."
    }
    func wrong() { table.selectRowIndexes([0], byExtendingSelection: false); open.performClick(nil) }
    func right() { table.selectRowIndexes([plan.stop - 1], byExtendingSelection: false); open.performClick(nil) }
}

/// Drawn, with no accessibility elements in it: only a real press, drag and release can do this.
final class BoardView: NSView, TaskView {
    let plan: Plan, log: Log
    var placed: [String: Int] = [:]
    var held: String?
    var heldAt = NSPoint.zero
    override var isFlipped: Bool { true }
    override var intrinsicContentSize: NSSize { NSSize(width: 720, height: 400) }

    init(plan: Plan, log: Log) {
        self.plan = plan; self.log = log
        super.init(frame: .zero)
        for card in plan.cards { placed[card] = 0 }
    }
    required init?(coder: NSCoder) { fatalError() }

    func columnRect(_ i: Int) -> NSRect { NSRect(x: 10 + CGFloat(i) * 236, y: 10, width: 224, height: 380) }
    func cardRect(_ card: String) -> NSRect {
        let column = placed[card] ?? 0
        let index = plan.cards.filter { placed[$0] == column }.firstIndex(of: card) ?? 0
        return NSRect(x: columnRect(column).minX + 12, y: 50 + CGFloat(index) * 60, width: 200, height: 50)
    }
    override func draw(_ dirtyRect: NSRect) {
        for (i, title) in plan.columns.enumerated() {
            NSColor.quaternaryLabelColor.setFill()
            NSBezierPath(roundedRect: columnRect(i), xRadius: 8, yRadius: 8).fill()
            (title as NSString).draw(at: NSPoint(x: columnRect(i).minX + 12, y: 20), withAttributes: [.font: NSFont.boldSystemFont(ofSize: 14), .foregroundColor: NSColor.labelColor])
        }
        for card in plan.cards {
            var rect = cardRect(card)
            if card == held { rect.origin = NSPoint(x: heldAt.x - 100, y: heldAt.y - 25) }
            NSColor.controlBackgroundColor.setFill()
            NSBezierPath(roundedRect: rect, xRadius: 6, yRadius: 6).fill()
            (card as NSString).draw(at: NSPoint(x: rect.minX + 12, y: rect.minY + 15), withAttributes: [.font: NSFont.systemFont(ofSize: 14), .foregroundColor: NSColor.labelColor])
        }
    }
    override func mouseDown(with event: NSEvent) {
        let p = convert(event.locationInWindow, from: nil)
        held = plan.cards.first { cardRect($0).contains(p) }
        heldAt = p
        log.event("press", ["card": held ?? ""])
    }
    override func mouseDragged(with event: NSEvent) {
        heldAt = convert(event.locationInWindow, from: nil)
        needsDisplay = true
    }
    override func mouseUp(with event: NSEvent) {
        guard let card = held else { return }
        let p = convert(event.locationInWindow, from: nil)
        if let column = (0..<3).first(where: { columnRect($0).contains(p) }) { drop(card, column) }
        held = nil
        needsDisplay = true
    }
    func drop(_ card: String, _ column: Int) {
        placed[card] = column
        let others = plan.cards.filter { $0 != plan.card }.allSatisfy { placed[$0] == 0 }
        log.graded(placed[plan.card] == plan.columns.firstIndex(of: plan.column) && others,
                   ["card": card, "column": plan.columns[column]])
    }
    func wrong() { drop(plan.cards.first { $0 != plan.card }!, 1); drop(plan.cards.first { $0 != plan.card }!, 0) }
    func right() { drop(plan.card, plan.columns.firstIndex(of: plan.column)!) }
}

/// Drawn, with no accessibility elements in it: the dots can only be found by looking.
final class ChartView: NSView, TaskView {
    let plan: Plan, log: Log
    var reached = 0
    override var isFlipped: Bool { true }
    override var intrinsicContentSize: NSSize { NSSize(width: 720, height: 420) }

    init(plan: Plan, log: Log) {
        self.plan = plan; self.log = log
        super.init(frame: .zero)
    }
    required init?(coder: NSCoder) { fatalError() }

    override func draw(_ dirtyRect: NSRect) {
        NSColor.textBackgroundColor.setFill()
        bounds.fill()
        func dot(_ p: NSPoint, _ color: NSColor, _ text: String) {
            color.setFill()
            NSBezierPath(ovalIn: NSRect(x: p.x - 18, y: p.y - 18, width: 36, height: 36)).fill()
            (text as NSString).draw(at: NSPoint(x: p.x - 5, y: p.y - 9), withAttributes: [.font: NSFont.boldSystemFont(ofSize: 15), .foregroundColor: NSColor.white])
        }
        for (i, p) in plan.decoys.enumerated() { dot(p, .systemGray, String(i + 4)) }
        for (i, p) in plan.dots.enumerated() { dot(p, i < reached ? .systemGreen : .systemBlue, String(i + 1)) }
    }
    override func mouseDown(with event: NSEvent) { click(convert(event.locationInWindow, from: nil)) }
    func click(_ p: NSPoint) {
        let hit = (plan.dots + plan.decoys).firstIndex { hypot($0.x - p.x, $0.y - p.y) <= 20 }
        if reached < plan.dots.count && hit == reached {
            reached += 1
            log.event("dot", ["reached": reached])
            if reached == plan.dots.count { log.graded(true) }
        } else {
            log.graded(false, ["hit": hit ?? -1])
        }
        needsDisplay = true
    }
    func wrong() { click(plan.decoys[0]) }
    func right() { plan.dots.forEach(click) }
    func runSelftest(completion: @escaping () -> Void) {
        wrong()
        right()
        click(plan.decoys[0])
        let clean = ChartView(plan: plan, log: log)
        clean.right()
        completion()
    }
}

final class SliderView: NSStackView, TaskView {
    let plan: Plan, log: Log
    let slider = NSSlider(value: 50, minValue: 0, maxValue: 100, target: nil, action: nil)
    let value = label("50")
    var apply: NSButton!

    init(plan: Plan, log: Log) {
        self.plan = plan; self.log = log
        super.init(frame: .zero)
        orientation = .vertical; alignment = .leading; spacing = 14
        slider.setAccessibilityLabel("Level")
        slider.widthAnchor.constraint(equalToConstant: 420).isActive = true
        let changed = Target { [unowned self] in self.value.integerValue = Int(self.slider.doubleValue.rounded()) }
        keep.append(changed)
        slider.target = changed; slider.action = #selector(Target.fire)
        apply = button("Apply") { [unowned self] in self.press() }
        [row("Level", NSStackView(views: [slider, value])), apply].forEach(addArrangedSubview)
    }
    required init?(coder: NSCoder) { fatalError() }

    func press() {
        let level = Int(slider.doubleValue.rounded())
        log.graded(level == plan.sliderValue, ["level": level])
    }
    func wrong() {
        slider.doubleValue = Double(plan.sliderValue == 50 ? 49 : 50)
        apply.performClick(nil)
    }
    func right() { slider.doubleValue = Double(plan.sliderValue); apply.performClick(nil) }
}

final class WebView: NSView, TaskView, WKScriptMessageHandler, WKNavigationDelegate {
    let plan: Plan, log: Log
    var page: WKWebView!
    private var loaded = false
    private var onLoad: (() -> Void)?
    private var onGraded: (() -> Void)?
    override var intrinsicContentSize: NSSize { NSSize(width: 720, height: 420) }

    init(plan: Plan, log: Log) {
        self.plan = plan; self.log = log
        super.init(frame: NSRect(x: 0, y: 0, width: 720, height: 420))
        let setup = WKWebViewConfiguration()
        setup.userContentController.add(self, name: "bench")
        page = WKWebView(frame: bounds, configuration: setup)
        page.navigationDelegate = self
        page.autoresizingMask = [.width, .height]
        addSubview(page)
        let regions = plan.rooms.map { "<option>\($0)</option>" }.joined()
        page.loadHTMLString("""
        <html><body style="font:15px -apple-system;margin:24px;color-scheme:light dark">
        <h2>Your plan</h2>
        <p><label><input type=radio name=plan value=Solo checked> Solo</label>
           <label><input type=radio name=plan value=Team> Team</label></p>
        <p><label>Region <select id=region><option></option>\(regions)</select></label></p>
        <p><label><input type=radio name=billing value=Monthly checked> Monthly</label>
           <label><input type=radio name=billing value=Yearly> Yearly</label></p>
        <p><label><input type=checkbox id=receipts> Send receipts</label></p>
        <p><label>Name <input id=name></label></p>
        <p><button onclick="send()">Confirm</button> <span id=status></span></p>
        <script>function send(){webkit.messageHandlers.bench.postMessage(JSON.stringify({
          plan:document.querySelector('[name=plan]:checked').value,
          region:document.getElementById('region').value,
          billing:document.querySelector('[name=billing]:checked').value,
          receipts:document.getElementById('receipts').checked,
          name:document.getElementById('name').value}));
          document.getElementById('status').textContent='Confirmed.'}</script>
        </body></html>
        """, baseURL: nil)
    }
    required init?(coder: NSCoder) { fatalError() }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        loaded = true
        let cb = onLoad
        onLoad = nil
        cb?()
    }
    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        fputs("Harbor Desk: WebView failed: \(error)\n", stderr)
    }
    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        fputs("Harbor Desk: WebView provisional failure: \(error)\n", stderr)
    }
    func userContentController(_ controller: WKUserContentController, didReceive message: WKScriptMessage) {
        guard let body = message.body as? String,
              let v = try? JSONSerialization.jsonObject(with: Data(body.utf8)) as? [String: Any] else { return }
        let ok = v["plan"] as? String == "Team" && v["region"] as? String == plan.room
            && v["billing"] as? String == "Yearly" && v["receipts"] as? Bool == true
            && v["name"] as? String == plan.name
        log.graded(ok, v)
        let cb = onGraded
        onGraded = nil
        cb?()
    }
    func wrong() { page.evaluateJavaScript("send()") }
    func right() {
        page.evaluateJavaScript("""
        document.querySelector('[value=Team]').checked=true;
        document.getElementById('region').value=\(json(plan.room));
        document.querySelector('[value=Yearly]').checked=true;
        document.getElementById('receipts').checked=true;
        document.getElementById('name').value=\(json(plan.name));send()
        """)
    }
    func runSelftest(completion: @escaping () -> Void) {
        let start = { [weak self] in
            guard let self else { return }
            self.onGraded = { [weak self] in
                guard let self else { return }
                self.onGraded = completion
                self.right()
            }
            self.wrong()
        }
        if loaded {
            start()
        } else {
            onLoad = start
        }
    }
    func json(_ s: String) -> String { "\"\(s)\"" }
}

/// The code is drawn, not reported: reading it takes a picture of the window.
final class CodePanel: NSView {
    let code: String
    override var intrinsicContentSize: NSSize { NSSize(width: 300, height: 90) }
    init(_ code: String) { self.code = code; super.init(frame: .zero) }
    required init?(coder: NSCoder) { fatalError() }
    override func draw(_ dirtyRect: NSRect) {
        NSColor.quaternaryLabelColor.setFill()
        NSBezierPath(roundedRect: bounds, xRadius: 8, yRadius: 8).fill()
        (code as NSString).draw(at: NSPoint(x: 40, y: 26), withAttributes: [.font: NSFont.monospacedSystemFont(ofSize: 30, weight: .bold), .foregroundColor: NSColor.labelColor])
    }
}

final class CodeView: NSStackView, TaskView {
    let plan: Plan, log: Log
    let field = NSTextField(string: "")
    var verify: NSButton!

    init(plan: Plan, log: Log) {
        self.plan = plan; self.log = log
        super.init(frame: .zero)
        orientation = .vertical; alignment = .leading; spacing = 14
        field.setAccessibilityLabel("Code")
        field.widthAnchor.constraint(equalToConstant: 220).isActive = true
        verify = button("Verify") { [unowned self] in self.ask() }
        [CodePanel(plan.code), row("Code", field), verify].forEach(addArrangedSubview)
    }
    required init?(coder: NSCoder) { fatalError() }

    func ask() {
        guard let window else { return }
        let alert = NSAlert()
        alert.messageText = "Send this code to the desk?"
        alert.addButton(withTitle: "Send")
        alert.addButton(withTitle: "Cancel")
        alert.beginSheetModal(for: window) { [unowned self] answer in
            if answer == .alertFirstButtonReturn { self.send() } else { self.log.event("cancelled") }
        }
    }
    func send() {
        let typed = field.stringValue.trimmingCharacters(in: .whitespaces)
        log.graded(typed == plan.code, ["code": typed])
    }
    func wrong() { send() }
    func right() { field.stringValue = plan.code; send() }
}

final class Delegate: NSObject, NSApplicationDelegate {
    let task: String, plan: Plan, log: Log, selftest: Bool
    var window: NSWindow!
    var view: TaskView!

    init(task: String, plan: Plan, log: Log, selftest: Bool) {
        self.task = task; self.plan = plan; self.log = log; self.selftest = selftest
    }
    func applicationDidFinishLaunching(_ note: Notification) {
        switch task {
        case "form": view = FormView(plan: plan, log: log)
        case "menu": view = MenuView(plan: plan, log: log)
        case "list": view = ListView(plan: plan, log: log)
        case "drag": view = BoardView(plan: plan, log: log)
        case "canvas": view = ChartView(plan: plan, log: log)
        case "slider": view = SliderView(plan: plan, log: log)
        case "web": view = WebView(plan: plan, log: log)
        case "code": view = CodeView(plan: plan, log: log)
        default: exit(2)
        }
        window = NSWindow(contentRect: NSRect(x: 0, y: 0, width: 760, height: 460),
                          styleMask: [.titled, .closable, .miniaturizable, .resizable], backing: .buffered, defer: false)
        window.title = "Harbor Desk"
        window.isReleasedWhenClosed = false
        let content = NSView()
        view.translatesAutoresizingMaskIntoConstraints = false
        content.addSubview(view)
        NSLayoutConstraint.activate([
            view.topAnchor.constraint(equalTo: content.topAnchor, constant: 20),
            view.leadingAnchor.constraint(equalTo: content.leadingAnchor, constant: 20),
        ])
        window.contentView = content
        log.event("shown", ["task": task])
        if !selftest { watchDesktop() }
        if selftest {
            // Off screen: no window is ordered in, and every step is the view's own action.
            DispatchQueue.main.asyncAfter(deadline: .now() + 20.0) {
                fputs("Harbor Desk selftest timed out for task \(self.task)\n", stderr)
                exit(3)
            }
            self.view.runSelftest {
                DispatchQueue.main.async { NSApp.terminate(nil) }
            }
        } else {
            window.setFrameTopLeftPoint(NSPoint(x: 240, y: (NSScreen.main?.visibleFrame.maxY ?? 900) - 60))
            window.makeKeyAndOrderFront(nil)
            if !CommandLine.arguments.contains("--quiet") { NSApp.activate(ignoringOtherApps: true) }
        }
    }
    /// Whether the real pointer moves or another app comes forward while the agent works, sampled
    /// five times a second. Only that something changed is logged, never what is on screen.
    func watchDesktop() {
        var pointer = NSEvent.mouseLocation
        var front = NSWorkspace.shared.frontmostApplication?.processIdentifier
        Timer.scheduledTimer(withTimeInterval: 0.2, repeats: true) { [log] _ in
            let now = NSEvent.mouseLocation
            if hypot(now.x - pointer.x, now.y - pointer.y) > 1 { log.event("pointer-moved"); pointer = now }
            let app = NSWorkspace.shared.frontmostApplication?.processIdentifier
            if app != front { log.event("front-changed", ["ownApp": app == getpid()]); front = app }
        }
    }
    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool { !selftest }
}

func argument(_ name: String) -> String? {
    guard let i = CommandLine.arguments.firstIndex(of: name), i + 1 < CommandLine.arguments.count else { return nil }
    return CommandLine.arguments[i + 1]
}

let seed = Int(argument("--seed") ?? "0") ?? 0
if let task = argument("--describe") {
    let text = Plan(seed: seed).prompt(task)
    print(String(data: try! JSONSerialization.data(withJSONObject: ["prompt": text]), encoding: .utf8)!)
    exit(text.isEmpty ? 2 : 0)
}
let selftestTask = argument("--selftest")
guard let task = selftestTask ?? argument("--task"), tasks.contains(task), let path = argument("--log") else {
    print("usage: Bench --task <\(tasks.joined(separator: "|"))> --seed <n> --log <file>")
    exit(2)
}
let app = NSApplication.shared
app.setActivationPolicy(selftestTask == nil ? .regular : .accessory)
let main = NSMenu()
let appItem = NSMenuItem(title: "Harbor Desk", action: nil, keyEquivalent: "")
appItem.submenu = NSMenu(title: "Harbor Desk")
appItem.submenu?.addItem(withTitle: "Quit Harbor Desk", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")
main.addItem(appItem)
app.mainMenu = main
let delegate = Delegate(task: task, plan: Plan(seed: seed), log: Log(path), selftest: selftestTask != nil)
app.delegate = delegate
app.run()
