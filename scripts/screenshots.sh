#!/bin/zsh
# Takes the README screenshots of all four themes from a clean VS Code window.
# macOS only. The app that runs this needs the Screen Recording permission.
#
# usage: zsh scripts/screenshots.sh [project folder] [file inside it]
# default: ../../playground/alo-site components/LikeButton.alo

set -e
REPO=${0:A:h:h}
PROJECT=${1:-${REPO:h:h}/playground/alo-site}
FILE=${2:-components/LikeButton.alo}
VSCODE="/Applications/Visual Studio Code.app"
CODE_CLI="$VSCODE/Contents/Resources/app/bin/code"
# kept short on purpose: VS Code's socket path must stay under 103 characters
WORK=${TMPDIR}msilabs-theme-shots
PROFILE=$WORK/profile
EXT=$WORK/ext
mkdir -p $PROFILE/User/globalStorage $EXT $REPO/images

[ -d "$PROJECT" ] || { echo "Project not found: $PROJECT"; exit 1; }

# Clear the variables VS Code sets for its own terminal, or a second instance will not start
clean_env=(env -u ELECTRON_RUN_AS_NODE -u VSCODE_IPC_HOOK -u VSCODE_IPC_HOOK_CLI -u VSCODE_PID -u VSCODE_CWD
    -u VSCODE_ESM_ENTRYPOINT -u VSCODE_HANDLES_UNCAUGHT_ERRORS -u VSCODE_NLS_CONFIG -u VSCODE_CODE_CACHE_PATH
    -u VSCODE_CRASH_REPORTER_PROCESS_TYPE)

echo "Packaging the current theme"
(cd $REPO && npx --yes @vscode/vsce@4.1.1 package --out $WORK/theme.vsix >/dev/null)
$clean_env "$CODE_CLI" --extensions-dir $EXT --user-data-dir $WORK/cli --install-extension $WORK/theme.vsix --force >/dev/null
$clean_env "$CODE_CLI" --extensions-dir $EXT --user-data-dir $WORK/cli --install-extension msilabs.alo-vscode >/dev/null

cat > $WORK/winid.swift <<'SWIFT'
import CoreGraphics
let list = CGWindowListCopyWindowInfo([.optionAll], kCGNullWindowID) as! [[String: Any]]
for w in list {
    let owner = w[kCGWindowOwnerName as String] as? String ?? ""
    let name = w[kCGWindowName as String] as? String ?? ""
    if owner == "Code" && name.hasPrefix(CommandLine.arguments[1]) { print(w[kCGWindowNumber as String] as! Int); break }
}
SWIFT
swiftc -O $WORK/winid.swift -o $WORK/winid

# Same sidebar width as your own VS Code
SIDEBAR=$(sqlite3 "$HOME/Library/Application Support/Code/User/globalStorage/state.vscdb" \
    "select value from ItemTable where key='workbench.sideBar.size'" 2>/dev/null || true)

shoot() {
    local label=$1 out=$2
    cat > $PROFILE/User/settings.json <<JSON
{
    "workbench.colorTheme": "$label",
    "workbench.startupEditor": "none",
    "window.restoreWindows": "none",
    "window.commandCenter": false,
    "workbench.layoutControl.enabled": false,
    "workbench.tips.enabled": false,
    "workbench.secondarySideBar.defaultVisibility": "hidden",
    "workbench.editor.decorations.colors": false,
    "workbench.editor.decorations.badges": false,
    "update.mode": "none",
    "telemetry.telemetryLevel": "off",
    "extensions.ignoreRecommendations": true,
    "security.workspace.trust.enabled": false,
    "chat.disableAIFeatures": true,
    "git.enabled": false,
    "git.openRepositoryInParentFolders": "never",
    "typescript.validate.enable": false,
    "javascript.validate.enable": false,
    "problems.decorations.enabled": false,
    "editor.lightbulb.enabled": "off",
    "editor.fontSize": 14,
    "editor.lineHeight": 22,
    "editor.minimap.enabled": false,
    "files.exclude": { "**/dist": true, "**/.alo": true }
}
JSON
    # VS Code resets the sidebar for a new workspace on screens up to 1440px wide.
    # The profile is reused, so from the second window on this stored width is kept.
    if [ -n "$SIDEBAR" ]; then
        sqlite3 $PROFILE/User/globalStorage/state.vscdb "create table if not exists ItemTable (key text unique on conflict replace, value blob);
            insert into ItemTable values ('workbench.sideBar.size', '$SIDEBAR');"
    fi
    # VS Code remembers the last window size; reset it so every image has the same size
    local state=$PROFILE/User/globalStorage/storage.json
    [ -f $state ] && python3 -I -c "
import json, sys
d = json.load(open(sys.argv[1]))
w = d.get('windowsState', {}).get('lastActiveWindow')
if w: w['uiState'] = {'mode': 1, 'x': 0, 'y': 33, 'width': 1440, 'height': 851}
json.dump(d, open(sys.argv[1], 'w'))
" $state

    ($clean_env "$VSCODE/Contents/MacOS/Code" --user-data-dir $PROFILE --extensions-dir $EXT \
        --new-window "$PROJECT" "$PROJECT/$FILE" >/dev/null 2>&1 &)
    sleep 14
    local id=$($WORK/winid "${FILE:t}")
    if [ -n "$id" ]; then screencapture -o -x -l $id $out; fi
    pkill -f "user-data-dir $PROFILE" || true
    sleep 3
    [ -n "$id" ]
}

# The first window only creates the workspace state, so the sidebar width applies from the second one
shoot "msilabs Dark" $WORK/warmup.png || true

for entry in "Dark:dark" "Light:light" "Notebook:notebook" "Warm Night:warm-night"; do
    label="msilabs ${entry%%:*}"
    name=${entry##*:}
    for try in 1 2 3; do
        if shoot "$label" $WORK/$name.png; then
            width=$(sips -g pixelWidth $WORK/$name.png | awk '/pixelWidth/ {print $2}')
            [ -z "$expected" ] && expected=$width
            [ "$width" = "$expected" ] && break
        fi
        echo "Retrying $label"
    done
    sips -Z 1600 $WORK/$name.png --out $REPO/images/$name.png >/dev/null
    echo "Saved images/$name.png"
done
