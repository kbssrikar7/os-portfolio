# Portfolio design lock (Ubuntu 24.04)

This records the decisions asked for by the build contract from the research phase (an analysis of the reference portfolio mitchivin.com, kept outside this repository). The values below are what the code renders. Where a value was **chosen** rather than observed in the reference, it says so. XP measurements from the reference were used for composition and behavior, never copied as Ubuntu pixel values.

## 1. OS family and era

**Ubuntu 24.04 LTS (Noble), GNOME 46 with the Yaru theme.** Single era throughout. The interface takes no elements from other GNOME/Ubuntu generations: no Unity launcher, no GNOME 3.x app menu, no GNOME 47 accent rules.

The desktop presents as Ubuntu itself (no invented OS name), as the reference presents as Windows XP. Boot follows a real Ubuntu machine: GRUB 2.12 menu with Ubuntu's colours, Plymouth "bgrt" splash (fallback Circle of Friends logo at 38.2% height, the real throbber frames at 70%, the Ubuntu wordmark at 96%), then GDM 46 (#222 background, 25em user list, #3b3b3b row, #ef8661 focus ring, values from the installed Yaru gnome-shell.css). The terminal host is `kbs@ubuntu`. Real Ubuntu assets live in `public/ubuntu/` with `ATTRIBUTION.md`.

## 2. Shell chrome

| Element | Value | Source |
| --- | --- | --- |
| Top bar | 32 px, black in both themes, 14 px semibold. Activities pill left, date+time centre, status pill right | GNOME 46 |
| Dock | Left, full height below the top bar, 68 px wide, `rgba(22,22,22,.86)` with blur. 58 px tiles with 44 px icons. Running dots on the left edge in the accent. Show Apps at the bottom | Ubuntu Dock (panel mode) |
| Window frame | Radius 12 px (0 when maximized or snapped) | libadwaita |
| Header bar | 46 px (50 px on phones). Light `#ebebeb` focused, `#f6f6f6` unfocused. Dark `#303030` / `#262626`. Unfocused header content at 60% opacity | libadwaita / Yaru |
| Window controls | Right side: minimize, maximize/restore, close. 24 px circles with 14 px glyphs; close turns accent on hover. Phones show close only | Yaru |
| Shadows | Focused: 1 px outline plus a 14/36 px blur. Unfocused: lighter 4/14 px. See `--shadow-win*` in `src/styles/base.css` | libadwaita |
| Maximize | Fills the work area below the top bar and right of the dock; shell stays visible | Contract §B06/B07 |

## 3. Type roles

Ubuntu Sans (variable), with Ubuntu Sans Mono for code, terminal and typing. Both are self-hosted via Fontsource.

| Role | Size / weight / line-height |
| --- | --- |
| Top bar | 14 / 600 |
| Window title | 14.5 / 700 |
| Header-bar buttons | 13.5 / 600 |
| Sidebar items | 14 / 400 (selected 600) |
| Body (reading) | 15 / 400 / 1.62, measure capped at 64ch |
| Section labels (About) | 12.5 / 700, uppercase, +0.06em |
| Page heading (About name) | 26 / 700 |
| Project title (detail) | 24 / 700 |
| Card title / metadata | 15.5 / 700 / 1.3; 13 / 400 dim |
| Captions, status bar | 12-13 / 400 |

## 4. Icons

Official Yaru icons copied from the installed theme (CC BY-SA 4.0). Each portfolio app uses the icon of the Ubuntu app it stands in for:

| App | Yaru icon |
| --- | --- |
| About Me | `avatar-default` |
| Projects | Files (`filemanager-app`); the desktop shortcut is a folder |
| Resume | Document Viewer (`evince`); the desktop shortcut is `application-pdf` |
| Contact | `mail-app` |
| Terminal | `terminal-app` |
| Open Source | `org.gnome.Software.Develop` |
| Typing Test | `input-keyboard` |
| Settings | `system-settings` |

Show Apps uses Ubuntu's `view-app-grid-ubuntu-symbolic`. UI glyphs (`Sym.tsx`) are 16px symbolic line icons.

## 5. Materials (each has one job)

| Surface | Treatment | Role |
| --- | --- | --- |
| Shell (top bar, dock) | Near-black, dock translucent with blur | Structural, always present |
| Window chrome | Opaque header bar, 1 px separator | Structure and focus |
| App content | Opaque `--view`/`--bg`, no blur | Readable surface |
| Popovers | Opaque `--popover`, 14-22 px radius, shadow | Transient |
| Typing Test | Its own dark palette (after monkeytype's default) | Personality app, contrasts with chrome as the reference's dark Projects app does |
| Wallpaper | Ubuntu 24.04 defaults: `warty-final-ubuntu` (light) and `ubuntu-wallpaper-d` (dark), switching with Dark Style as GNOME does; Fuwafuwa nanbatto san as an alternative | Real system background; no panel covers it on the desktop |

Blur is used only on the dock, the overview backdrop and on-media chips.

## 6. Accent use

Ubuntu's light ("Default") style and orange `#E95420` by default, as on a fresh install, or one of the ten Yaru accents in Settings. The accent is reserved for:
- the focused text field and focus rings
- the selected category chip
- the one suggested action per header bar (e.g. Send)
- dock running dots
- the Today marker in the calendar
- toggles that are on

Every other button uses neutral `--btn` fills. Links use an accent-tinted text colour.

## 7. Desktop composition (B02/B03)

- **Left zone:** the dock, plus a reserved 120 px desktop-icon column holding the four primary routes (About Me, Projects, Resume.pdf, Contact).
- **First window:** opens right of that column, near the top (`ICON_COLUMN` in `src/os/wm.ts`).
- **Each later window:** cascades 28 px right and down from the window in front and shrinks to fit, so the window behind stays identifiable by its title bar. The reference offsets by about 26/30 px.
- **Right and lower:** wallpaper stays open.
- **Fit:** new windows always open fully inside the work area.
- **Personality:** no widgets are added to fill space. The Typing Test is the one personality app and lives in Show Apps, not on the desktop.

## 8. Window states and transitions (chosen values)

| Transition | Properties | Duration / easing | Interruption policy |
| --- | --- | --- | --- |
| Open | scale .94→1, opacity 0→1 | 280 ms, cubic-bezier(.22,1,.36,1) | n/a |
| Close | scale 1→.94, opacity →0 | 160 ms | Removed from state immediately; animation is cosmetic |
| Minimize | translate toward the dock icon, scale →.06, opacity →0; window becomes inert | 280 ms | **Latest intent wins**: a restore during the animation reverses it from the current frame (verified: restored rect identical, focused, dock active) |
| Restore | Reverse of minimize | 280 ms | Same |
| Maximize / snap / restore | left/top/width/height | 240 ms, same easing | Each change targets the new rect |
| Overview | Each window transforms into a grid slot | 280 ms | Escape or click restores |

Reduce Motion (Settings or the OS preference) makes all of these instant.

State lives in a pure model (`src/os/wm.ts`, 14 unit tests): one focused window, a z-order array, a singleton policy for every app except Terminal, the restore rect kept through maximize/snap, and clamping that keeps a title bar reachable.

## 9. Content imagery and project presentation

- **Card:** 16:10 thumbnail (screenshot crop anchored top), then title, then one metadata line (category · first three technologies). A status badge sits inside the thumbnail's lower right: Live, Client or Archived.
- **Thumbnails:** real captures from `portfolio-src` at 640/800/1200/2400 widths via `srcset`. Projects without a capture get a generated typographic cover using a per-project hue.
- **Detail, first viewport:** media (16:9, title overlaid top-left, actions bottom-right), title row with category chips, then a Brief/Status/Numbers/Stack/Detail panel. Write-up sections follow.
- **Narrow detail:** actions move below the media and the overlaid title is dropped.
- **Return to grid:** keeps the selected category and resets scroll to top.
- **Media:** each project has exactly one capture, so there is no carousel. The reference's B10 video→image scene has no counterpart yet.

## 10. Responsive modes

| Container | Rule |
| --- | --- |
| Viewport < 768 px | Ubuntu Touch (Lomiri) shell, see section 14 |
| Projects window > 900 px | Labelled sidebar |
| Projects window 601-900 px | 60 px icon rail with tooltips |
| Projects window ≤ 600 px | No sidebar; category chips row |
| About window ≤ 700 px | Sidebar removed; label column stacks above text (phone reading layout, B11) |
| Header bar ≤ 520 px | Title yields to actions |

These are app-container queries, so they also apply when a window is resized on a wide desktop.

## 11. Notification policy

On desktop, banners appear under the system tray at the top right, away from where windows open, so they never cover a window header. They auto-dismiss after 5.5 s and are kept in the calendar menu.

On phones, banners are never shown over content; notifications only collect in the list. Do Not Disturb silences banners everywhere. The only notification sent is the welcome on first login.

## 12. Verified scenes

| Scene | How verified |
| --- | --- |
| B01 select vs open | Single click selects (highlight); double click or Enter opens |
| B02/B03 | Screenshot at 1440×1000 (half scale) via `review/laptop.html` |
| B04 singleton | Reopen focuses the same window; dock shows one dot |
| B05 minimize/restore | Exact rect restored |
| B06 maximize/restore | Exact rect restored; shell visible |
| B07 1366×768 | `review/laptop.html` |
| B08 interrupted | Minimize then restore after 60 ms: same rect, focused, dock active |
| B09 keyboard | Show Apps: arrows move a visible focus ring; Esc returns focus to the dock button |
| B11 phone | `review/phone.html` (Chromium at 390 px, not a real device) |
| B12 boundaries | Container modes above, exercised by resizing the Projects window |

The `review/` pages are dev-only harnesses and are not part of the build.

## 13. Open questions for the owner

- **Portrait:** About, the login screen and the mail composer use the owner's GitHub avatar (`public/avatar.jpg`, a film still) by the owner's choice, as a placeholder until a real portrait is chosen. Initials show if it fails to load.
- **Biography:** About uses only facts from `src/data`. A longer first-person biography, if wanted, has to come from the owner.
- **Real-device testing:** touch, Safari, on-screen keyboard and safe areas have not been tested.
- **Project media:** more than one capture per project would enable a media carousel (contract §4).

## 14. Top bar, quick settings and date menu (GNOME 46, measured)

These values come from the installed `/usr/share/gnome-shell/theme/Yaru{,-dark}/gnome-shell.css`. The icons are the real symbolic icons from Yaru, Adwaita and GNOME Shell's own icon resource (`public/ubuntu/symbolic`), recoloured with CSS masks as the shell does.

- **Panel:** `#131313`, 2.2em at an 11pt base (32px), bold.
- **Panel buttons:** pill-shaped with a 3px transparent border. Hover adds `rgba(242,242,242,.17)` and pressed `.28`.
- **Clock:** GNOME's default format, "Nov 2  17:42".
- **Status icons, left to right:** network, Bluetooth (when on), volume (level-dependent), and battery `battery-level-100-charged`.

**Quick settings** (Ubuntu's light style uses light shell popovers; dark values in brackets):
- **Surface:** popover `#fafafa` (`#1d1d1d`), radius 13.5px, padding 18px.
- **Top row:** a battery "100 %" pill, then Screenshot, Settings, Lock and Power as 37px round buttons. Buttons are `#e3e3e3` (`#313131`), hover `#d9d9d9` (`#3b3b3b`).
- **Sliders:** volume and brightness, 4px track with `#E95420` fill and an 18px `#fcfcfc` handle.
- **Toggles:** 176×48px pills in a 2-column grid with 12px gaps, `#d34615` when on. Wi-Fi, Bluetooth and Power Mode are split menu toggles whose arrow opens an inline submenu.
- **What's real:** Dark Style and Night Light (a warm overlay) change the page. Wi-Fi, Bluetooth, Airplane Mode and Power Mode change only the icons and state shown.

The date menu has the notification list or the "No Notifications" placeholder, the Do Not Disturb switch and Clear, the weekday and date header, a Sunday-first month grid with today in the accent, and a "Today / No Events" card.

## 15. Phone: Ubuntu Touch (Lomiri)

Below 768px the shell is Ubuntu Touch, not a scaled-down GNOME:

- **Boot:** none. Phones have no GRUB or Plymouth to show, so they open on the **greeter**: wallpaper, 76px light clock, date, the user's avatar and name, and "Swipe up to unlock". A tap also unlocks.
- **Indicator panel:** 30px `#111`, showing the focused app's name on the left and indicators plus the time on the right. Tapping it or pulling down opens the dark indicator sheet: date, battery, switches for Flight Mode, Wi-Fi, Bluetooth and Dark theme (`#3eb34f` when on), volume and brightness sliders, Lock phone, and Power off.
- **Launcher:** 64px on the left edge, translucent `#111` with blur. The orange `#e95420` button with the white Circle of Friends opens the drawer. Pinned apps sit below it, with a white pip on running apps. A short swipe from the left edge opens it; a long swipe also opens the drawer.
- **App drawer:** blurred, with a "Search…" field and an alphabetical 3-column grid of labelled apps.
- **Home:** with no app in front, the launcher and drawer are the home screen.
- **Apps:** full screen under the panel, with headers in the Suru style (left-aligned title, one close action).
- **First run:** a hint, in the style of Lomiri's own edge tutorial, says "Short swipe from the left edge to open the launcher".

Ubuntu Touch's Suru icons are not installed on the build machine, so the phone uses the same Yaru icons as the desktop.
