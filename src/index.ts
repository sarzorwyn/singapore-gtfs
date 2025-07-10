import { generateGtfsStopTimes } from './bus/parseBusRouteApi';
import { fetchGtfsStops } from './bus/parseBusStopApi';
import { transformBusSvcApiDataToGtfs } from './bus/parseBusSvcApi';
import { writeGtfsFiles } from './writeGtfs';

const main = (async () => {
	const { routes, trips } = await transformBusSvcApiDataToGtfs();
	const stops = await fetchGtfsStops();
	const stopTimes = await generateGtfsStopTimes();
	await writeGtfsFiles({ routes, trips, stops, stopTimes });
	console.log('GTFS routes written.');
});

main().catch(console.error);
