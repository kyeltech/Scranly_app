# Scranly brand files

## Logo

- `scranly-logo.svg` / `.png` — lime scheme: icon tile, wordmark, small sizes, dark variant
- `scranly-logo-mono.svg` / `.png` — one-colour options: black, white, grey and ink tiles
- `scranly-mark-options.png` — the four mark concepts, for reference

The mark is a fork whose three tines are a bar chart: food on one reading,
measurement on the other. It stays legible down to 32px, which is the size that
matters on a home screen. `scranly-mark-options.png` keeps the four directions
this was chosen from.

## Launch schemes

Three schemes ship in `src/theme.ts`. Switch with one line:

```ts
export const ACTIVE_SCHEME: SchemeName = 'lime'; // 'lime' | 'ink' | 'black'
```

| Scheme | Splash | Loading | Mark |
| --- | --- | --- | --- |
| `lime` | `#C2F24D` | `#16281F` | ink on lime, lime on ink |
| `ink` | `#16281F` | `#16281F` | white |
| `black` | `#0C0C0C` | `#0C0C0C` | white |

A component can also be previewed in any scheme without changing the app:

```tsx
<AnimatedSplash schemeName="black" onFinish={next} />
<LoadingScreen schemeName="ink" message="Saving" />
```

## After changing the scheme

The static boot splash is native, so it needs regenerating to match — otherwise
the screen flashes at handover:

```sh
# lime
npx react-native-bootsplash generate src/assets/bootsplash-logo.png \
  --background=C2F24D --logo-width=120

# black (use the white mark)
npx react-native-bootsplash generate src/assets/mark-white.png \
  --background=0C0C0C --logo-width=120
```

App icons live in `android/app/src/main/res/mipmap-*` and
`ios/Scranly/Images.xcassets/AppIcon.appiconset`. They currently use the lime
tile; regenerate them from `design/` if the scheme changes.
