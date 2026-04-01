---
Date Created: 2026-03-11 00:15
Last Updated: 2026-03-11 00:15
tags:
  - Resource
Index:
  - "[[The Operator]]"
Topic:
  - "[[Linux]]"
Status: Unweathered
Published: false
---
---
```bash
#!/bin/bash

# Prompt for the application name
echo "Enter application name (e.g., Krita):"
read APP_NAME

# Define directories
APP_DIR="$HOME/Apps/$APP_NAME"
APP_IMAGE=$(find "$APP_DIR" -maxdepth 1 -type f -name "*.AppImage" | head -n 1)
ICON=$(find "$APP_DIR" -maxdepth 1 -type f -iname "*.png" | head -n 1)
DESKTOP_FILE="$HOME/.local/share/applications/$APP_NAME.desktop"
ICON_DEST="$HOME/.local/share/icons/$APP_NAME.png"

# Ensure the AppImage exists
if [ ! -f "$APP_IMAGE" ]; then
    echo "No AppImage found in $APP_DIR. Exiting."
    exit 1
fi

# Ensure the AppImage is executable
chmod +x "$APP_IMAGE"

# Copy the icon if available
if [ -f "$ICON" ]; then
    cp "$ICON" "$ICON_DEST"
    ICON_PATH="$ICON_DEST"
else
    ICON_PATH="$APP_IMAGE"  # Fallback: use AppImage itself as an icon
fi

# Create the .desktop file
cat <<EOF > "$DESKTOP_FILE"
[Desktop Entry]
Name=$APP_NAME
Exec=$APP_IMAGE
Icon=$ICON_PATH
Type=Application
Categories=Utility;Graphics;Development;
Terminal=false
EOF

# Ensure proper permissions
chmod +x "$DESKTOP_FILE"

# Refresh the desktop environment
update-desktop-database ~/.local/share/applications

echo "$APP_NAME has been added to the start menu!"
```