# Translation

This is guide will walk through the process of preparing the files necessary for a new translation of the Interactive Roshar Map.

### Translating Markdown Files

Most of the site's text is found in the markdown files located under [https://github.com/Palanaeum/roshar-map/tree/master/translations](roshar-map/tree/master/translations). You will want to download the English files in the `en` folder, rename the `en` folder to the appropriate language code, and then translate the contents of the files as described below. You **should not** translate the names of the files themselves. The files are organized into four subfolders: Characters, Events, Locations, and Misc.

Here's an example of a markdown file from the Events folder, both a preview of the file and inside the file editor:

![markdown_file_example](docs/markdown_file_example.png)

![markdown_editor_example](docs/markdown_editor_example.png)

Event files have a Name, Blurb, Description, and sometimes a Chapter Reference. Each of these will need to be translated. The Name should be a level one header (preceded by a `# `). The Blurb is the text that immediate follows the Name, and is a *brief* description of the event. The Name and Blurb appear when you select an event on the timeline on the Interactive Roshar Map:

![blurb_example](docs/blurb_example.png)

The Description is a longer description of the event, which appears in the left panel when users click for more information. The Chapter Reference will appear at the top of this panel, if the event refers to an event which happens in the books:

![description_example](docs/description_example.png)

The Character, Location, and Misc markdown files are a simpler case of the same thing. They simply have a Name (as a level one header) and a Description (text following the Name).

Here is a brief guide on using the markdown for different formatting: https://guides.github.com/features/mastering-markdown/. Also note that you can create links to other items on the site (other Events, Characters, Locations, Misc items) in the text using `#[TEXT](folder/filename)` where `TEXT` is the text that will appear on the site, `folder` is the folder that the item can be found in (Locations, Events, etc.) and `filename` is the name of the item's file (excluding the .md file extension).

You can edit these markdown files directly in GitHub OR you can download the files to your computer, edit them in a text editing program like Notepad++, and upload them all at once.

### Translating UI Elements

Most of the site's user interface elements can be translated in the appropriate .json file under [roshar-map/tree/master/src/lang](https://github.com/Palanaeum/roshar-map/tree/master/src/lang). You can copy `en.json` as a reference and translate the terms that appear on the *right* side of the colons, inside parenthesis. Or if you're uncomfortable editing the .json file directly, try using https://comigo.itch.io/jsonbabel.

For example, all of the blue-highlighted text here will need to be translated:

![json_file](docs/json_file.png)

The next step is to deal with the translation of the map itself. This will require editing several image files. Take special note of the very first item in the .json file: `"textureLocale": "en",`. This line tells the site which language's image files to use. In this case, the "en" tells the site to use the English files located in the "/en" subdirectory here: [roshar-map/src/assets/textures/localized](https://github.com/Palanaeum/roshar-map/tree/master/src/assets/textures/localized) We will need to create a new directory for the correct language code here, and put all of the new image files there.

**NEED TO ADD INFORMATION ABOUT SETTING UP IMAGE FILES THAT NEED TO BE CREATED MANUALLY**

**THIS PARAGRAPH WILL NEED TO BE UPDATED--I'M JUST GUESSING THIS IS HOW IT WILL WORK.** The final step is to update the selection boundaries for the text on the map. Go to https://roshar-map.paleo.dev/#/editor/ to view the map in editor mode. (This is a graphical interface for creating the files that the site uses. Don't worry, you can't break anything.) Choose "Locations" mode at the top of the page and change "Edited Language" to the language you are working with. The map should update with the appropriate text. You should see blue polygons with white circles at their vertices. These represent the area of the screen where the mouse can be pointed to select the location. Click a polygon to edit it. The vertices can be dragged around. Hold "Shift" and left-click to create a new vertex. Hold "Ctrl" and right-click on a vertex to delete it. You should also notice a large red dot. This is the point on the screen that will be centered when somebody selects the location. You can move the red dot if needed by holding "Ctrl" and left-clicking. Make sure you click on one of the Shadesmar locations in the list so that you can see the Shadesmar polygons as well. When you have finished editing the polygons, select the "Save HQ" and "Save Shadesmar HQ" buttons to save your changes into a file on your computer. You are not making any changes to the site by doing this. You need to upload these downloaded files to GitHub into the correct language folder at [roshar-map/src/assets/textures/localized](https://github.com/Palanaeum/roshar-map/tree/master/src/assets/textures/localized).

### Questions?

If you have any questions, just ask! We hope this guide will help, but we expect that you will have questions along the way.
