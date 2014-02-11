a3-kohlmann
===============

## Team Members

1. Joe Kohlmann kohlmann@uw.edu

## TimeLoaf

![](https://files.app.net/cn7fVS2n)

TimeLoaf is a web-based interactive visualization tool built with D3 that visualizes data from the [American Time Use Survey](http://bls.gov/tus/#tables) conducted by the Bureau of Labor Statistics. It displays the average number of hours spent (in a 24-hour day) performing one of twelve high-level primary activities for men, women, and both genders, according to either weekdays or weekends and holidays, from 2003 to 2012, as one or more donut charts.

TimeLoaf supports several different filters for the underlying data set. One or more donut charts can be browsed sequentially displayed simultaneously by adjusting the Year range slider. Activities may be filtered by clicking on an activity title in the left sidebar, thereby removing (or re-adding) the activity to the current set of donut charts. Finally, two filter controls are available to change the population gender and the activity time according to the time of week (weekdays or weekends/holidays). Additionally, TimeLoaf supports synchronized brushing between corresponding regions of the donut charts and their corresponding activity titles.

## Running Instructions

TimeLoaf is available online: http://cse512-14w.github.io/a3-kohlmann/

You can also download this repository and run `python -m SimpleHTTPServer 9000` to access TimeLoaf from http://localhost:9000/ on your local machine.

(If you put your work online, please also write [one-line description and put a link to your final work](http://note.io/1n3u46s) so people can access it directly from CSE512-14W page.)

## [Storyboard (PDF)](http://cse512-14w.github.io/a3-kohlmann/storyboard.pdf)


### Changes between Storyboard and the Final Implementation

The storyboards depicted the use of sophisticated 3-D animated transitions to reinforce the mental model of each donut chart being a chronological "slice" into a cylindrical solid. The early concept was to support transitioning between these views of the data, thereby supporting a single year view (one slice) and multiple years as both small multiples and a stacked area chart. Unfortunately the mental model of how D3 manages data joins, transitions, and exits proved to be a technical barrier that could not be overcome for this assignment.

## Development Process

To begin, I browsed around data.gov looking for data sets that could offer interesting comparisons and opportunities for interactive filtering. I'll freely admit that I avoided data sets with obvious geographical position mappings, though I am interested in trying such a visualization for the class's final project. I settled on the data from the Bureau of Labor Statistics' American Time Use Survey because it offered multifaceted, yet reasonably-sized set with moderately compelling potentials for cross-year and cross-activity comparisons.

I spent approximately 10-12 hours developing TimeLoaf. Regrettably, far too much time was spent reorganizing the data, which came in the form of an Excel spreadsheet which, while nicely-formatted (for humans), required significant structural transformations to organize into a format palatable to D3. The balance between writing a transformation script and manually transforming the data was too close, given the relatively small set size, so I ended up doing it manually—at great cost to morale. The size of this data set made the process reasonable, at least, but I would prefer to work with data that are already nicely machine-formatted in the future.

I also spent an obnoxious amount of time connecting the user interface controls with the underlying state information necessary to modify the visualization display. This experience has unequivocally compelled me to utilize a JavaScript MVC frameworks such as Backbone.js for my next project, having experimented with them in the past.

Finally, I obviously was unable to implement the more sophisticated transformations described above and in my storyboard sketches. I still believe that a system supporting multiple visualizations of time-delimited data (other than video, given my inspiration from Final Cut Pro X) has potential. I was unable to implement those ideas here. However, the small multiples visualization implemented affords, at least, functional cross-year comparisons, with synchronized brushing further aiding that goal.