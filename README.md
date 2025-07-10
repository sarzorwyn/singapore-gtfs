# Singapore GTFS 

This is a fork of yinshangyang's Singapore GTFS feed, with the goal of using LTA bus data feeds together with manual train data input.
The script will call the latest LTA bus route data and process it automatically.
Pre-generated GTFS feeds located at:
```/data/output-gtfs/```

## Notes

An [[LTA DataMall](https://datamall.lta.gov.sg/content/datamall/en.html)] api key is required to update bus data. Create an .env folder at root with the following content:
```LTA_ACCOUNT_KEY=<YOUR DATA MALL API KEY>```

The standard way to run this software:
```npx ts-node src/index.ts```

### Weekdays only

At the moment, only weekday schedules are covered.

So much as possible, the peak and off-peak hours and frequencies are represented.

### Frequencies are Averages

Frequencies are taken as the average of the range provided from information online.

### Bus Schedules

`stop_times` are generated through looking at the delta between first arrival timings.

### Train Schedules

The Train schedules are copied from /original-gtfs as LTA DataMall lacks train information other than crowd levels. Bus information in original-gtfs is ignored and will be removed in a future version.

### LRT Schedules

The LRT schedules are manually put together, and due to the lack of updated information, some assumptions were made to simplify the data entry without causing too much impact on the resulting schedule.

### Thomson-East Coast MRT Line

Timings for the Thomson-East Coast Line is estimated with Downtown Line as the base.
