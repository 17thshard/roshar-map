# Timeline and Events

The timeline for this project is based on Jofwu's [Stormlight Archive Timeline](https://docs.google.com/spreadsheets/d/1zq5bJoKE83ggDCjH43i1hZi0CIpB2iAx7v37zQPVFK0/edit#gid=856252766). Every event is based on book references and assumptions that are laid out in that spreadsheet. If you feel that you have found an error on the timeline, or if you would like to assist in future development of that project, please contat Jofwu on [17th Shard](https://www.17thshard.com/forum/profile/18320-jofwu/) or [Reddit](https://www.reddit.com/user/jofwu).

Before adding new events to the timeline please get persmission from our team. We may have reasons for not including the event, and if we *do* want to proceed we will need to coordinate the update with other translations.

You can help us out by (1) noting a name for the event, (2) confirming the date of the event on Jofwu's timeline, (3) writing a small blurb for what the event is, (4) writing a larger description about the event, (5) noting any relate characters, events, or locations, and (6) recording any chapters in the books where the event occurs.
 
# Artwork

We would love to attach artwork to every event, location, and character! 

## To Artists

If you are an artist and you want to contribute to this project, we are **VERY** honored and grateful! We have a spreadsheet to keep track events and locations which currently have no artwork, [located here](https://docs.google.com/spreadsheets/d/1TkHtndfXs5-E8UL8Bf4pjuHM0PnxSvmV25u8L5veUM0/edit#gid=0). We have tried to identify which items are of particularly high (or low) importance, in our opinions. We have also made some notes on ideas of what we might see in a piece of artwork for each item. That said, we are grateful for ANY artwork you can provice, and the notes column is only there as a helpful prompt. You are more than welcome to present us with an alternate concept. We can't promise that everyone who sends us artwork will see their piece used on the map, but we will certainly take all recommendations under consideration!

## Recommendations

If you are aware of a piece of artwork that would fill in where we currently have no art, please let us know! Note that we will be looking for a good source for the artwork, and we require permission from the artist before making use of their work. We would prefer *not* to be notified of recommendations to *replace* one piece of existing artwork with another, unless you feel the quality of the current piece is significantly lacking. We are much more interested in adding artwork where none currently exists than we are in making changes to things that already have artwork. 

## Adding Artwork

Before adding artwork, please provide our team with proof that the artist gives their explicit permission to use the artwork on this site. Also make sure that you have a link to the artist's website of their choosing for crediting them.

After the artist's permission has been shared and the requisite information gathered, you can add the image file under the appropriate folder under [public/img](https://github.com/Palanaeum/roshar-map/tree/master/public/img). Next navigate to [src/store](https://github.com/Palanaeum/roshar-map/tree/master/src/store) and open the appropriate .json file for the item you wish to add artwork for. For example, to add artwork for an event, open `events.json`. Find the exact item you are adding artwork to and create a new `"image"` key. It will require both a `"file"` (the location ane name of the file in the img directory) and a `"credits"` (providing the name of the artist and a link to their website). See other uses of artwork in the .json file for examples.

# Translation

This is guide will walk through the process of preparing the files necessary for a new translation of the Interactive Map of Roshar.

## Setup

In order to work on a language, you need a copy of this project's code on your local machine. In order to contribute your changes back after you're done, fork the repository to your own account. Check out [GitHub's guide](https://docs.github.com/en/free-pro-team@latest/github/getting-started-with-github/fork-a-repo) on how to work with forks in general.

Once you've forked the repository and got a local copy (either through a Git clone or the Code -> Download ZIP option in GitHub), it's best to download the [latest version](https://github.com/Palanaeum/roshar-map-translation-editor/releases) of our specialized translation editor.

Upon first launch of the application, your operation system might say that it is unsafe. Note that this is due to the executables being unsigned and that the files are safe as long as you only download them from the above GitHub Releases page!

The editor will ask you about a "working directory" when you first start it. Point it at your local copy of the repository at this point. You're all set for translation work now!

## Creating a new language

This step is only required in case you're working on an entirely new language. While on the editor home screen, click "Create new language" and enter the locale code your language will be referred to as internally later on. You can also enter some additional metadata for the editor at this point.

## Translating text

Select the language you'd like to edit on the editor home screen. You'll see a sidebar with five categories: Messages, events, locations, characters, and miscellaneous.

The last four categories concern the various items you can actually look at on the map/timeline. They come with a rich Markdown-based text editor that helps you write nicely formatted descriptions and preview them. Each of these items also has a "Chapter" metadata field where you can add a reference to the book and chapter that serves as source for an event, for example.

Events additionally have a "Blurb" field. This is the little preview text displayed for an event in the timeline with the "More..." link attached. Put a shorter summary here!

Finally, you may edit "messages". These are the labels and texts for various UI elements in the app. You can switch between a "flat" and "hierarchical" view in the sidebar here, which allows you to either drill down into individual categories of messages or display them all at once. Most messages are plain text, so they may not contain any special formatting using Markdown. Messages that *can* contain formatting will have the Markdown editor instead.

Some messages come with additional context that explains where they appear. Others can contain special variables written like `{variable}` that will get replaced with an appropriate value by the application.

Once you're done working on any entry or the messages, you have to save your work using the button at the bottom of each page. You can edit several messages before saving *all* of them! You'll also be prompted to save your progress if you leave a page with unsaved changes.

## Translating textures

Textures are the images that make up the actual map. There are several textures that can be localized to your language. Since the process is a little more involved and requires handling large files, please contact [Paleo](https://github.com/PaleoCrafter) about it. See the last section for Discord details. Please have the translations for the following things handy to streamline the process:

 * Roshar (Physical Realm) locations
 * Shadesmar locations
 * Silver Kingdoms
 * Oathgate locations

## Adding a language to the menu and testing your work

Simply translating the application is not quite enough for your work to also show up in the app. You'll have to edit the [`menu.json`](src/lang/menu.json) file in order for your translation to show up in the menu. Simply copy an existing entry here and adjust it for your language. Make sure that individual entries are separated by a comma!

Once you have translated some things and actually want to view them in your browser, you can run the map locally on your machine. For this, you need to have the [Yarn package manager](https://classic.yarnpkg.com/en/docs/install/) installed on your machine. Once you have done so, follow these steps to test your work:

 1. Go to the map directory in your file manager and open it in your command line
    * On Windows, hold down <kbd>Shift</kbd>, right click in the directory and click the "Open PowerShell window here"
    * On MacOS, launch the Terminal application and `cd` to the directory
    * On Linux, you should be familiar with doing this :)
 2. Run the `yarn install` command. This will install all necessary dependencies for running the map
 3. Run `yarn serve`. This will continuously look for changes you make to the app and reload them in your browser
 4. Visit http://localhost:10010 in your browser. You should see the app here just like the release version

## Contributing back your changes

When you're (mostly) done with a translation, you can contribute it back to the main repository. On Windows and MacOS, if you're not familiar with Git, we recommend using the official [GitHub Desktop client](https://desktop.github.com/). You can find a guide for making changes and pushing them to your fork in [their guide](https://docs.github.com/en/free-pro-team@latest/desktop/contributing-and-collaborating-using-github-desktop/making-changes-in-a-branch).

As soon as your changes are pushed to your GitHub repository, you may recreate a [pull request](https://github.com/Palanaeum/roshar-map/compare). We'll review your changes from here and hopefully will have your translation merged very soon!

## Questions? Suggestions?

If you have any questions, just ask! We hope this guide will help, but we expect that you will have questions along the way. We have created a [dedicated Discord server](https://discord.gg/x9hjkKXBew) for coordinating translation efforts. Feel free to come just with us there and if you have any suggestions on how to improve the process, you can also let us know about them there!
