FPP WLED Effects
===============

Plugin that adds a simple gui for controlling FPP's overlay model wled effects.


![wledeffects](https://user-images.githubusercontent.com/469038/146204686-99bdddca-91e8-4508-a8c8-b29c4ef07830.png)

Some additional details are noted in the help modal (F1) on the plugin page.

## Run Command

The plugin also registers an FPP command named **WLED Effect Start**. Open the
global *Run Command* dialog, pick the command, then choose the target models,
the enable mode and any WLED effect — the effect's own parameters appear
dynamically in the dialog. The same command can be used from presets,
schedules, MQTT or `POST /api/command`. It applies the Multisync hosts saved
in this plugin's Settings tab, so effects can be started on other FPP players
as well.
