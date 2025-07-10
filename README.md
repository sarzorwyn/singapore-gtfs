# Singapore GTFS 

This is a fork of yinshangyang's Singapore GTFS feed, with the goal of using LTA bus data feeds together with manual train data input.

## Notes

### Weekdays only

At the moment, only weekday schedules are covered.

So much as possible, the peak and off-peak hours and frequencies are represented.

### Frequencies are Averages

Frequencies are taken as the average of the range provided from information online.

### Bus Schedules

`stop_times` are generated through looking at the delta between first/last bus arrival timings. There are some instances where the deltas are still negative and an educated guess based on distance travelled is used to calculate the delta.

### LRT Schedules

The LRT schedules are manually put together, and due to the lack of updated information, or simply the complexity of the lines (looking at you Bukit Panjang LRT), some assumptions were made to simplify the data entry without causing too much impact on the resulting schedule.

### Thomson-East Coast MRT Line

Timings for the Thomson-East Coast Line is estimated with Downtown Line as the base.
