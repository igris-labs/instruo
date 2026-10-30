import { defineAsyncComponent } from "vue";
export const featureViews = {
  "tool:api-request-builder": defineAsyncComponent(
    () => import("../tools/developer/api-request-builder/ApiRequestBuilder.vue"),
  ),
  "tool:color-converter": defineAsyncComponent(
    () => import("../tools/developer/color-converter/ColorConverter.vue"),
  ),
  "tool:cron-builder": defineAsyncComponent(
    () => import("../tools/developer/cron-builder/CronBuilder.vue"),
  ),
  "tool:css-minifier": defineAsyncComponent(
    () => import("../tools/developer/css-minifier/CssMinifier.vue"),
  ),
  "tool:csv-json": defineAsyncComponent(() => import("../tools/developer/csv-json/CsvJson.vue")),
  "tool:dockerfile-formatter": defineAsyncComponent(
    () => import("../tools/developer/dockerfile-formatter/DockerfileFormatter.vue"),
  ),
  "tool:env-formatter": defineAsyncComponent(
    () => import("../tools/developer/env-formatter/EnvFormatter.vue"),
  ),
  "tool:git-command": defineAsyncComponent(
    () => import("../tools/developer/git-command/GitCommand.vue"),
  ),
  "tool:gitignore-generator": defineAsyncComponent(
    () => import("../tools/developer/gitignore-generator/GitignoreGenerator.vue"),
  ),
  "tool:graphql-formatter": defineAsyncComponent(
    () => import("../tools/developer/graphql-formatter/GraphqlFormatter.vue"),
  ),
  "tool:hash-generator": defineAsyncComponent(
    () => import("../tools/developer/hash-generator/HashGenerator.vue"),
  ),
  "tool:html-a11y-checker": defineAsyncComponent(
    () => import("../tools/developer/html-a11y-checker/HtmlA11yChecker.vue"),
  ),
  "tool:html-formatter": defineAsyncComponent(
    () => import("../tools/developer/html-formatter/HtmlFormatter.vue"),
  ),
  "tool:http-status": defineAsyncComponent(
    () => import("../tools/developer/http-status/HttpStatus.vue"),
  ),
  "tool:javascript-formatter": defineAsyncComponent(
    () => import("../tools/developer/javascript-formatter/JavascriptFormatter.vue"),
  ),
  "tool:json-minifier": defineAsyncComponent(
    () => import("../tools/developer/json-minifier/JsonMinifier.vue"),
  ),
  "tool:json-schema-studio": defineAsyncComponent(
    () => import("../tools/developer/json-schema-studio/JsonSchemaStudio.vue"),
  ),
  "tool:json-yaml": defineAsyncComponent(
    () => import("../tools/developer/json-yaml-converter/JsonYamlConverter.vue"),
  ),
  "tool:jsonpath-tester": defineAsyncComponent(
    () => import("../tools/developer/jsonpath-tester/JsonPathTester.vue"),
  ),
  "tool:jwt-decoder": defineAsyncComponent(
    () => import("../tools/developer/jwt-decoder/JwtDecoder.vue"),
  ),
  "tool:jwt-lab": defineAsyncComponent(() => import("../tools/developer/jwt-lab/JwtLab.vue")),
  "tool:lorem-generator": defineAsyncComponent(
    () => import("../tools/developer/lorem-generator/LoremGenerator.vue"),
  ),
  "tool:markdown-preview": defineAsyncComponent(
    () => import("../tools/developer/markdown-preview/MarkdownPreview.vue"),
  ),
  "tool:markdown-table": defineAsyncComponent(
    () => import("../tools/developer/markdown-table/MarkdownTable.vue"),
  ),
  "tool:mermaid-editor": defineAsyncComponent(
    () => import("../tools/developer/mermaid-editor/MermaidEditor.vue"),
  ),
  "tool:nginx-formatter": defineAsyncComponent(
    () => import("../tools/developer/nginx-formatter/NginxFormatter.vue"),
  ),
  "tool:openapi-viewer": defineAsyncComponent(
    () => import("../tools/developer/openapi-viewer/OpenApiViewer.vue"),
  ),
  "tool:package-json-scripts": defineAsyncComponent(
    () => import("../tools/developer/package-json-scripts/PackageJsonScripts.vue"),
  ),
  "tool:query-builder": defineAsyncComponent(
    () => import("../tools/developer/query-builder/QueryBuilder.vue"),
  ),
  "tool:regex-lab": defineAsyncComponent(() => import("../tools/developer/regex-lab/RegexLab.vue")),
  "tool:regex-tester": defineAsyncComponent(
    () => import("../tools/developer/regex-tester/RegexTester.vue"),
  ),
  "tool:sql-builder": defineAsyncComponent(
    () => import("../tools/developer/sql-builder/SqlBuilder.vue"),
  ),
  "tool:sql-formatter": defineAsyncComponent(
    () => import("../tools/developer/sql-formatter/SqlFormatter.vue"),
  ),
  "tool:text-diff": defineAsyncComponent(() => import("../tools/developer/text-diff/TextDiff.vue")),
  "tool:timestamp-converter": defineAsyncComponent(
    () => import("../tools/developer/timestamp-converter/TimestampConverter.vue"),
  ),
  "tool:type-generator": defineAsyncComponent(
    () => import("../tools/developer/type-generator/TypeGenerator.vue"),
  ),
  "tool:unix-permissions": defineAsyncComponent(
    () => import("../tools/developer/unix-permissions/UnixPermissions.vue"),
  ),
  "tool:url-parser": defineAsyncComponent(
    () => import("../tools/developer/url-parser/UrlParser.vue"),
  ),
  "tool:uuid-generator": defineAsyncComponent(
    () => import("../tools/developer/uuid-generator/UuidGenerator.vue"),
  ),
  "tool:xml-formatter": defineAsyncComponent(
    () => import("../tools/developer/xml-formatter/XmlFormatter.vue"),
  ),
  "tool:base64": defineAsyncComponent(() => import("../tools/encoder-decoder/base64/Base64.vue")),
  "tool:binary-text": defineAsyncComponent(
    () => import("../tools/encoder-decoder/binary-text/BinaryText.vue"),
  ),
  "tool:morse-code": defineAsyncComponent(
    () => import("../tools/encoder-decoder/morse-code/MorseCode.vue"),
  ),
  "tool:url-encode-decode": defineAsyncComponent(
    () => import("../tools/encoder-decoder/url-encode-decode/UrlEncodeDecode.vue"),
  ),
  "tool:age-calculator": defineAsyncComponent(
    () => import("../tools/everyday/age-calculator/AgeCalculator.vue"),
  ),
  "tool:business-days": defineAsyncComponent(
    () => import("../tools/everyday/business-days/BusinessDays.vue"),
  ),
  "tool:calendar-duration": defineAsyncComponent(
    () => import("../tools/everyday/calendar-duration/CalendarDuration.vue"),
  ),
  "tool:compound-interest": defineAsyncComponent(
    () => import("../tools/everyday/compound-interest/CompoundInterest.vue"),
  ),
  "tool:date-timezone": defineAsyncComponent(
    () => import("../tools/everyday/date-timezone/DateTimezone.vue"),
  ),
  "tool:loan-calculator": defineAsyncComponent(
    () => import("../tools/everyday/loan-calculator/LoanCalculator.vue"),
  ),
  "tool:meeting-planner": defineAsyncComponent(
    () => import("../tools/everyday/meeting-planner/MeetingPlanner.vue"),
  ),
  "tool:percentage-calculator": defineAsyncComponent(
    () => import("../tools/everyday/percentage-calculator/PercentageCalculator.vue"),
  ),
  "tool:pomodoro": defineAsyncComponent(() => import("../tools/everyday/pomodoro/Pomodoro.vue")),
  "tool:qr-scanner": defineAsyncComponent(
    () => import("../tools/everyday/qr-scanner/QrScanner.vue"),
  ),
  "tool:slug-bulk": defineAsyncComponent(() => import("../tools/everyday/slug-bulk/SlugBulk.vue")),
  "tool:stopwatch": defineAsyncComponent(() => import("../tools/everyday/stopwatch/Stopwatch.vue")),
  "tool:tip-splitter": defineAsyncComponent(
    () => import("../tools/everyday/tip-splitter/TipSplitter.vue"),
  ),
  "tool:unit-converter": defineAsyncComponent(
    () => import("../tools/everyday/unit-converter/UnitConverter.vue"),
  ),
  "tool:world-clock": defineAsyncComponent(
    () => import("../tools/everyday/world-clock/WorldClock.vue"),
  ),
  "tool:color-contrast": defineAsyncComponent(
    () => import("../tools/image/color-contrast/ColorContrast.vue"),
  ),
  "tool:css-gradient": defineAsyncComponent(
    () => import("../tools/image/css-gradient/CssGradient.vue"),
  ),
  "tool:css-shadow": defineAsyncComponent(() => import("../tools/image/css-shadow/CssShadow.vue")),
  "tool:exif-viewer": defineAsyncComponent(
    () => import("../tools/image/exif-viewer/ExifViewer.vue"),
  ),
  "tool:favicon-generator": defineAsyncComponent(
    () => import("../tools/image/favicon-generator/FaviconGenerator.vue"),
  ),
  "tool:image-compressor": defineAsyncComponent(
    () => import("../tools/image/image-compressor/ImageCompressor.vue"),
  ),
  "tool:image-cropper": defineAsyncComponent(
    () => import("../tools/image/image-cropper/ImageCropper.vue"),
  ),
  "tool:image-resizer": defineAsyncComponent(
    () => import("../tools/image/image-resizer/ImageResizer.vue"),
  ),
  "tool:open-graph-preview": defineAsyncComponent(
    () => import("../tools/image/open-graph-preview/OpenGraphPreview.vue"),
  ),
  "tool:palette-generator": defineAsyncComponent(
    () => import("../tools/image/palette-generator/PaletteGenerator.vue"),
  ),
  "tool:pixel-art": defineAsyncComponent(() => import("../tools/image/pixel-art/PixelArt.vue")),
  "tool:screenshot-redactor": defineAsyncComponent(
    () => import("../tools/image/screenshot-redactor/ScreenshotRedactor.vue"),
  ),
  "tool:svg-optimizer": defineAsyncComponent(
    () => import("../tools/image/svg-optimizer/SvgOptimizer.vue"),
  ),
  "tool:svg-sprite": defineAsyncComponent(() => import("../tools/image/svg-sprite/SvgSprite.vue")),
  "tool:random-picker": defineAsyncComponent(
    () => import("../tools/productivity/random-picker/RandomPicker.vue"),
  ),
  "tool:aes-encryptor": defineAsyncComponent(
    () => import("../tools/security/aes-encryptor/AesEncryptor.vue"),
  ),
  "tool:cors-builder": defineAsyncComponent(
    () => import("../tools/security/cors-builder/CorsBuilder.vue"),
  ),
  "tool:csp-builder": defineAsyncComponent(
    () => import("../tools/security/csp-builder/CspBuilder.vue"),
  ),
  "tool:hash-compare": defineAsyncComponent(
    () => import("../tools/security/hash-compare/HashCompare.vue"),
  ),
  "tool:hmac-generator": defineAsyncComponent(
    () => import("../tools/security/hmac-generator/HmacGenerator.vue"),
  ),
  "tool:password-generator": defineAsyncComponent(
    () => import("../tools/security/password-generator/PasswordGenerator.vue"),
  ),
  "tool:password-strength": defineAsyncComponent(
    () => import("../tools/security/password-strength/PasswordStrength.vue"),
  ),
  "tool:pbkdf2-derivation": defineAsyncComponent(
    () => import("../tools/security/pbkdf2-derivation/Pbkdf2Derivation.vue"),
  ),
  "tool:pem-inspector": defineAsyncComponent(
    () => import("../tools/security/pem-inspector/PemInspector.vue"),
  ),
  "tool:pkce-generator": defineAsyncComponent(
    () => import("../tools/security/pkce-generator/PkceGenerator.vue"),
  ),
  "tool:qr-generator": defineAsyncComponent(
    () => import("../tools/security/qr-generator/QrGenerator.vue"),
  ),
  "tool:rsa-key-generator": defineAsyncComponent(
    () => import("../tools/security/rsa-key-generator/RsaKeyGenerator.vue"),
  ),
  "tool:secret-scanner": defineAsyncComponent(
    () => import("../tools/security/secret-scanner/SecretScanner.vue"),
  ),
  "tool:secure-random": defineAsyncComponent(
    () => import("../tools/security/secure-random/SecureRandom.vue"),
  ),
  "tool:sri-generator": defineAsyncComponent(
    () => import("../tools/security/sri-generator/SriGenerator.vue"),
  ),
  "tool:ssh-fingerprint": defineAsyncComponent(
    () => import("../tools/security/ssh-fingerprint/SshFingerprint.vue"),
  ),
  "tool:totp-generator": defineAsyncComponent(
    () => import("../tools/security/totp-generator/TotpGenerator.vue"),
  ),
  "tool:case-changer": defineAsyncComponent(
    () => import("../tools/text/case-changer/CaseChanger.vue"),
  ),
  "tool:duplicate-line-remover": defineAsyncComponent(
    () => import("../tools/text/duplicate-line-remover/DuplicateLineRemover.vue"),
  ),
  "tool:slug-generator": defineAsyncComponent(
    () => import("../tools/text/slug-generator/SlugGenerator.vue"),
  ),
  "tool:text-reverser": defineAsyncComponent(
    () => import("../tools/text/text-reverser/TextReverser.vue"),
  ),
  "tool:text-sorter": defineAsyncComponent(
    () => import("../tools/text/text-sorter/TextSorter.vue"),
  ),
  "tool:whitespace-cleaner": defineAsyncComponent(
    () => import("../tools/text/whitespace-cleaner/WhitespaceCleaner.vue"),
  ),
  "tool:word-char-counter": defineAsyncComponent(
    () => import("../tools/text/word-char-counter/WordCharCounter.vue"),
  ),
  "tool:word-frequency-finder": defineAsyncComponent(
    () => import("../tools/text/word-frequency-finder/WordFrequencyFinder.vue"),
  ),
  "game:breakout": defineAsyncComponent(() => import("../games/arcade/breakout/Breakout.vue")),
  "game:coin-flip": defineAsyncComponent(() => import("../games/arcade/coin-flip/CoinFlip.vue")),
  "game:maze-chase": defineAsyncComponent(() => import("../games/arcade/maze-chase/MazeChase.vue")),
  "game:memory-match": defineAsyncComponent(
    () => import("../games/arcade/memory-match/MemoryMatch.vue"),
  ),
  "game:number-guess": defineAsyncComponent(
    () => import("../games/arcade/number-guess/NumberGuess.vue"),
  ),
  "game:reaction-timer": defineAsyncComponent(
    () => import("../games/arcade/reaction-timer/ReactionTimer.vue"),
  ),
  "game:rock-paper-scissors": defineAsyncComponent(
    () => import("../games/arcade/rock-paper-scissors/RockPaperScissors.vue"),
  ),
  "game:simon-says": defineAsyncComponent(() => import("../games/arcade/simon-says/SimonSays.vue")),
  "game:snake": defineAsyncComponent(() => import("../games/arcade/snake/Snake.vue")),
  "game:tetris": defineAsyncComponent(() => import("../games/arcade/tetris/Tetris.vue")),
  "game:mastermind": defineAsyncComponent(() => import("../games/logic/mastermind/Mastermind.vue")),
  "game:minesweeper": defineAsyncComponent(
    () => import("../games/logic/minesweeper/Minesweeper.vue"),
  ),
  "game:nim": defineAsyncComponent(() => import("../games/logic/nim/Nim.vue")),
  "game:sokoban": defineAsyncComponent(() => import("../games/logic/sokoban/Sokoban.vue")),
  "game:2048": defineAsyncComponent(() => import("../games/number/game-2048/Game2048.vue")),
  "game:fifteen-puzzle": defineAsyncComponent(
    () => import("../games/number/fifteen-puzzle/FifteenPuzzle.vue"),
  ),
  "game:higher-lower": defineAsyncComponent(
    () => import("../games/number/higher-lower/HigherLower.vue"),
  ),
  "game:sudoku": defineAsyncComponent(() => import("../games/number/sudoku/Sudoku.vue")),
  "game:target-sum": defineAsyncComponent(() => import("../games/number/target-sum/TargetSum.vue")),
  "game:capital-quiz": defineAsyncComponent(
    () => import("../games/quiz/capital-quiz/CapitalQuiz.vue"),
  ),
  "game:quick-trivia": defineAsyncComponent(
    () => import("../games/quiz/quick-trivia/QuickTrivia.vue"),
  ),
  "game:blackjack-lite": defineAsyncComponent(
    () => import("../games/strategy/blackjack-lite/BlackjackLite.vue"),
  ),
  "game:connect-four": defineAsyncComponent(
    () => import("../games/strategy/connect-four/ConnectFour.vue"),
  ),
  "game:solitaire": defineAsyncComponent(() => import("../games/strategy/solitaire/Solitaire.vue")),
  "game:tic-tac-toe": defineAsyncComponent(
    () => import("../games/strategy/tic-tac-toe/TicTacToe.vue"),
  ),
  "game:crossword": defineAsyncComponent(() => import("../games/word/crossword/Crossword.vue")),
  "game:hangman": defineAsyncComponent(() => import("../games/word/hangman/Hangman.vue")),
  "game:typing-test": defineAsyncComponent(
    () => import("../games/word/typing-test/TypingTest.vue"),
  ),
  "game:word-scramble": defineAsyncComponent(
    () => import("../games/word/word-scramble/WordScramble.vue"),
  ),
  "game:wordle": defineAsyncComponent(() => import("../games/word/wordle/Wordle.vue")),
  "tool:json-formatter": defineAsyncComponent(() => import("../tools/json/JsonWorkspace.vue")),
  "tool:image-format-converter": defineAsyncComponent(
    () => import("../tools/image-conversion/ImageWorkspace.vue"),
  ),
  "game:lights-out": defineAsyncComponent(
    () => import("../games/lights-out/LightsOutWorkspace.vue"),
  ),
  "game:flappy-bird": defineAsyncComponent(
    () => import("../games/flappy-bird/FlappyWorkspace.vue"),
  ),
};
