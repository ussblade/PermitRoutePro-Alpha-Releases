# Permit Route Pro website concepts

These are five standalone homepage directions. They leave the current production
page untouched and use the existing app screenshots, QR code, release manifest,
and public APK repository.

## 1. Night Dispatch

- Color: Asphalt `#07131C`, Cab glass `#102838`, Lane amber `#FFB000`,
  Signal cyan `#56D6E9`, Chalk `#F4F7F8`, Radio gray `#9FB0BA`.
- Type: Bahnschrift/Arial Narrow for compressed dispatch headings; Segoe UI for
  operational copy.
- Layout: left-aligned dispatch board with a narrow live-status rail and a tall
  phone/map window.

  ```text
  [brand / links / version]
  [status] [large promise                 ] [phone]
           [actions + release strip       ] [     ]
  [ordered route-control sequence                  ]
  ```

- Principle: the website should feel like the calm, legible console in a truck
  cab at 2 a.m. Amber is reserved for decisions and the route itself.

## 2. Permit Ledger

- Color: Bond paper `#F5F3EC`, Carbon `#17263B`, DOT blue `#174EA6`,
  Stamp red `#B3261E`, Rule `#C8CDD2`, Verified green `#287D52`.
- Type: Georgia for authoritative headings; Arial for document fields and body.
- Layout: a permit-document hero overlaps a plain-language proof chain; content
  follows the reading order of a reviewed permit.

  ```text
  [wordmark                 download]
  [headline          ] [permit sheet]
  [why it matters    ] [verified stamp]
  [capture]---[review]---[accept]---[navigate]
  ```

- Principle: foreground traceability, not technology. Rules and stamps carry
  meaning because this concept is about defensible records.

## 3. High-Visibility Cab

- Color: Safety yellow `#FFD400`, Highway cobalt `#123CC7`, Black `#101010`,
  White `#FFFFFF`, Warning orange `#FF6B00`, Concrete `#E8E8E3`.
- Type: Impact/Arial Black for road-scale display type; Trebuchet MS for copy.
- Layout: an oversized sign-like headline, diagonal hazard edge, and a sequence
  of big roadside instruction panels.

  ```text
  [PRP]       [get the alpha]
  [HUGE ROAD-SIGN MESSAGE      | phone]
  [route rule spanning full width     ]
  [five large sequential instruction signs]
  ```

- Principle: instant comprehension from a distance. Yellow marks caution;
  cobalt marks the approved action.

## 4. Route Atlas

- Color: Survey paper `#F7F0DE`, Pine `#1B4332`, Rust `#B5482D`,
  Reservoir `#2A6F97`, Dune `#D8C39B`, Topographic ink `#28352F`.
- Type: Palatino for the map-book voice; Verdana for labels and instructions.
- Layout: a winding route is the page spine, with content placed like stops on
  a field map and screenshots used as map insets.

  ```text
  [brand                           field menu]
  [headline crossing an illustrated route]
       (permit) o----o (verify)
                    | [map inset]
       (record) o---o (navigate)
  ```

- Principle: the route is the product. Texture comes from contour lines and
  survey marks, not decorative cards.

## 5. Clear Passage

- Color: Air `#F3F8FC`, Deep ink `#14213D`, Clear blue `#1677FF`,
  Coral signal `#F2554A`, White `#FFFFFF`, Slate `#66758A`.
- Type: Avenir Next/Segoe UI for both display and body, with weight and spacing
  creating the hierarchy.
- Layout: a calm centered promise opens into a full-width, left-to-right trip
  timeline; onboarding and installation stay in a single reading path.

  ```text
  [brand     how it works / install     download]
  [         calm centered promise               ]
  [permit]----[review]----[record]----[drive]
  [phone pair]                 [simple guidance]
  ```

- Principle: make a complicated compliance workflow feel understandable without
  understating its seriousness.

## Self-critique and revision

The first pass risked becoming five familiar software landing-page themes. The
revision removes repeated feature-card grids, decorative eyebrow labels, generic
gradient washes, and meaningless numbered ornaments. Numbering appears only in
real workflows. Each direction spends its visual boldness once: dispatch rail,
permit sheet, road sign, route spine, or trip timeline. All concepts keep visible
focus, mobile layouts, useful fallback links, and reduced-motion support.
