Drawception ANBT
================

A userscript to make Drawception.com better: more drawing tools, tablet pressure support, sandbox with palettes and uploading to imgur, like all, quick menu buttons with old browser support, and other enhancements.

[![Public domain](http://i.creativecommons.org/p/zero/1.0/88x31.png)](http://creativecommons.org/publicdomain/zero/1.0/)

[Discussion at Drawception.com forum](http://drawception.com/forums/general/11830/anbt-script/)
[Chat about the script and the site](http://chat.grompe.org.ru/#drawception)

[What new canvas will be like](https://raw.github.com/grompe/Drawception-ANBT/master/play2.html")

## HOW TO USE

- Chrome/Iron: (Recommended: all features, best performance)
  - add the script in Tampermonkey addon 
  - or open URL: chrome://extensions then drag and drop the .user.js file on it
- Firefox: add the script in Greasemonkey addon
- Opera 12.x: add the script in "site properties"
- Other browsers/Single use:
  - create a bookmark with the following URL:
    `javascript:void($.ajax({dataType:"script",cache:!0,url:"//raw.github.com/grompe/Drawception-ANBT/master/drawception-anbt.user.js"}))`
    and follow it while being on drawception.com site; you can also use the shortened URL:
    `javascript:void($.ajax({dataType:"script",cache:!0,url:"//goo.gl/a6rzzP"}))`


## FEATURES

General:

- Menu buttons in the header for easier access
- Fix keyboard scrolling after pages load
- Fix notifications showing in Opera and Firefox < 5
- No temptation to judge
- An embedded chat (http://chat.grompe.org.ru/#drawception)

Canvas:

- Wacom tablet eraser and smooth pressure support; doesn't conflict with mouse
- Secondary color, used with right mouse button; palette right-clicking
- Alt+click picks a color from the canvas
- Brush cursor
- Current colors indicator
- X swaps primary and secondary colors
- E selects eraser
- [ ] and - = changes brush sizes
- Shift+F fills with the current color
- Confirm closing a page if it has a canvas and is painted on
- Don't confirm clearing, but allow to undo it

Sandbox:

- Re-add background button
- Add drawing time indicator
- Add palettes
- Upload directly to imgur

View game:

- Add reverse panels button
- Add "like all" button
- Track new comments
- Show when the game was started
- Ability to favorite panels

Play:

- Play modes for those who only caption or only draw
- Enter pressed in caption mode submits the caption
- Ability to bookmark games without participating

Forum:

- Better-looking timestamps with correct timezone
- Clickable drawing panels
- Clickable links

## TODO

- fix scrollbar appearing when brush crosses lower page boundary (rare)
- save last snapshot in case of browser crash / accidental refresh
- fix friend games timer (and show likes)
- smoother tablet pressure change; react to pressure change even on same position
- optimize performance
- add stroke smoothening
- add simple layers(?)

## CHANGELOG

0.31.2014.2
- Stop confirming leaving the page if submitted a contest drawing

0.30.2014.2
- Small fixes

0.29.2014.01
- Corrected colors of 7 sandbox palettes to be exact
- Added direct links for installing Wacom plugin in settings page
- Fixed minor sandbox undo bug that covered background color

0.28.2014.01
- Re-added like all button that was gone because of style change

0.27.2014.01
- Removed undo/redo improvements (implemented on site)

0.26.2014.01
- Added "the blues" palette to sandbox

0.25.2014.01
- Prevented some usernames from breaking panel layout in contest results
- Style change fixes

0.24.2014.01
- Fixed incorrect year display on the forum mainpage

0.23.2013.12
- Added a random daily greeting on your userpage
- Added ability to bookmark games from play without participating
- Added ability to favorite panels from panel and game pages
- Small fix for "Upload to imgur" button icon

0.22.2013.12
- Small correction of game start date displayed (month with leading zero)
- An option to make likes for your own panels secret ingame
- Show forum times according to user timezone
- Make text links in the forum clickable
- Make drawing panels in the forum clickable

0.21.2013.12
- In a finished game, show when it was started
- Show an error if notifications cannot be loaded
- Show script and site versions in the top right corner
- Made script settings configurable on the settings page

0.20.2013.12
- Easy configuration to switch off tablet support

0.19.2013.12
- Don't hide the cross cursor by default
- Clearing the canvas is now instant but undoable, also resets the timer in sandbox
- Small chat fixes

0.18.2013.12
- Cache the chat script for faster loading

0.17.2013.12
- Experimental: added an embedded chat
- Stop confirming leaving the page if submitted a drawing

0.16.2013.12
- Inlined dark style as userstyles.org is unreliable and removed a feature
- Fixed comment tracking

0.15.2013.12
- Prevent loading multiple times

0.14.2013.12
- Minor fixes
- Added dark style
- Script now loads at the beginning (Opera 12 users should edit ".user." part out of the script file name!)
- Added tracking new comments in games

0.13.2013.11
- Fixed broken link to Leaderboards in quick menu
- More colorful quick menu
- Fixed canvas broken with the site script change 

0.12.2013.11
- Minor fixes
- Can now be installed in Chrome Extensions without Tampermonkey
- Faster undo function
- Redo function (Ctrl+Y)

0.11.2013.11.08
- Removed the temptation to judge

0.10.2013.11.05
- Added ability to upload directly to imgur from sandbox
- Fixed background sometimes appearing as foreground in sandbox
- Verified code in JSHint
- Added reverse panels in viewgame
- Fixed some events broken in previous script version for Chrome/Firefox

0.9.2013.11.03
- Fixed options button not working after hiding the popover and displaying again
- Enter pressed in caption mode submits the caption
- Added palettes in sandbox
- Changed eraser display in color indicator

0.8.2013.11.02
- Fixed brush size changing in the middle of a stroke with eraser
- Inconspicuous like all panels function
- Adjusted the color indicators size to keep with the style change
- Added drawing time indicator in sandbox
- Added background button in sandbox

0.7.2013.10.28
- Restored notifications functionality and keyboard scrolling for Firefox 4 and older

0.7.2013.10.26
- Adjusted the header to keep with the style change
- Added keyboard shortcuts: - = and [ ] for changing brush sizes, E for eraser, 0..9 and Shift+0..Shift+9 for colors, Shift+F to fill with current color

0.6.2013.10.23
- New notifications are now discernable from the old ones
- Restored notifications functionality and keyboard scrolling for Opera browser

0.5.2013.10.21
- Added menu buttons to the header for easier access for higher resolutions

0.4.2013.10.16
- Added caption-only and drawing-only play modes

0.3.2013.10.11
- Removed zoom because the new style is zoomed enough
- Adjusted colors indicator to keep with the style change
- Fixed color picking and eraser broken with the style change

0.2.2013.10.09
- First public version
